import cogoToast from "@successtar/cogo-toast"
import { Navbar } from "flowbite-react"
import Cookies from "js-cookie"
import debounce from "lodash.debounce"
import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchAppSettings } from "../../redux/slices/app-settings"
import { logoutUser } from "../../redux/slices/auth"
import { getStructureSummariesByWorkspaceId } from "../../redux/slices/structures"
import InviteModal from "../modals/InviteModal"
import RendererModal from "../modals/RendererModal"
import CustomAtlasMenu from "../menu/CustomAtlasMenu"

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoUrl, setLogoUrl] = useState("/assets/atlas-logo.png")
  const [appName, setAppName] = useState("Atlas")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [structureSummaries, setStructureSummaries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSummaries, setFilteredSummaries] = useState([])
  const [rendererModalVisible, setRendererModalVisible] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState(null)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      Cookies.remove("atlas_access_token")
      Cookies.remove("atlas_userId")
      Cookies.remove("atlas_username")
      Cookies.remove("atlas_email")
      Cookies.remove("workspaceId")
      localStorage.clear()
      cogoToast.success("Logged out successfully!")
      navigate("/")
    } catch (error) {
      cogoToast.error(
        error?.message ||
          "An unexpected error occurred during logout. Please try again."
      )
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings())
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload
          setLogoUrl(settings.logoUrl || "/assets/atlas-logo.png")
          setAppName(settings.appName || "ATLAS")
        }
      } catch (error) {
        cogoToast.error(
          `Failed to load application settings: ${error?.message || error}`
        )
      }
    }

    loadSettings()
  }, [dispatch])

  useEffect(() => {
    const workspaceId = Cookies.get("workspaceId")
    if (!workspaceId) return

    const fetchSummaries = async () => {
      try {
        const resultAction = await dispatch(
          getStructureSummariesByWorkspaceId(workspaceId)
        )

        if (getStructureSummariesByWorkspaceId.fulfilled.match(resultAction)) {
          const summaries = resultAction.payload.summaries
          setStructureSummaries(summaries)
        }
      } catch (error) {
        cogoToast.error(
          `Error fetching structure summaries: ${
            error?.message || error || error?.data?.message
          }`
        )
      }
    }

    fetchSummaries()
  }, [dispatch])

  const handleSearchInput = e => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredSummaries([])
    } else {
      const matches = structureSummaries.filter(structure =>
        structure.name.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredSummaries(matches)
    }
  }

  const handleSearchKeyDown = e => {
    if (e.key === "Enter" && filteredSummaries.length > 0) {
      const selected = filteredSummaries[0]
      navigate(`/structures/${selected.id}`)
      setSearchTerm("")
      setFilteredSummaries([])
    }
  }

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      const term = searchTerm.trim().toLowerCase()

      if (term === "") {
        setFilteredSummaries([])
      } else {
        const matches = structureSummaries
          .map(structure => {
            const nameMatch = structure.name.toLowerCase().includes(term)
            const typeMatch = structure.type?.toLowerCase().includes(term)
            const startsWith = structure.name.toLowerCase().startsWith(term)

            return {
              ...structure,
              score: startsWith ? 2 : nameMatch || typeMatch ? 1 : 0,
            }
          })
          .filter(s => s.score > 0)
          .sort((a, b) => b.score - a.score)

        setFilteredSummaries(matches)
      }
    }, 200)

    debouncedSearch()
    return () => debouncedSearch.cancel()
  }, [searchTerm, structureSummaries])
  return (
    <header className="bg-gray-100 flex justify-between items-center">
      <Navbar fluid rounded className="w-full p-4">
        <Navbar.Brand href="#" className="flex items-center gap-2">
          <img src={logoUrl} className="h-8 w-8" alt={appName} />
          <span className="text-2xl font-bold text-custom-main uppercase">
            {appName}
          </span>
        </Navbar.Brand>

        <div className="relative w-full max-w-md mx-auto hidden md:block">
          <FiSearch className="absolute left-3 text-2xl top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for structure..."
            className="pl-10 pr-3 py-2 w-full min-w-[40vw] border border-gray-300 rounded-md focus:outline-none focus:border-custom-main"
            value={searchTerm}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
          />

          {searchTerm.trim() !== "" && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 min-w-[40vw] w-full overflow-auto">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedStructure(item)
                      setRendererModalVisible(true)
                    }}
                    className="px-4 py-2 text-sm capitalize text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    {item.name}
                    <span className="ml-1 text-gray-400 text-xs">
                      ({item.type})
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No matching structures found.
                </div>
              )}
            </div>
          )}
        </div>

        <CustomAtlasMenu handleLogout={handleLogout} />
      </Navbar>

      {isInviteModalOpen && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
      {rendererModalVisible && selectedStructure && (
        <RendererModal
          isOpen={rendererModalVisible}
          onClose={() => setRendererModalVisible(false)}
          onSelect={renderer => {
            setRendererModalVisible(false)
            setSearchTerm("")
            setFilteredSummaries([])
            window.location.href = `/app/s/${selectedStructure.username}/${selectedStructure.id}?renderer=${renderer}`
          }}
          structureType={selectedStructure.type || "default"}
        />
      )}
    </header>
  )
}

export default Header
