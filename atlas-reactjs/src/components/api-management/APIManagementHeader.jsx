import { Button, Dropdown, Navbar, Tooltip } from "flowbite-react"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import { FiHelpCircle, FiSearch } from "react-icons/fi"
import { MdKey } from "react-icons/md"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchAppSettings } from "../../redux/slices/app-settings"
import { logoutUser } from "../../redux/slices/auth"
import CustomAPIsMenu from "../menu/CustomAPIsMenu"
import cogoToast from "@successtar/cogo-toast"

const APIManagementHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoUrl, setLogoUrl] = useState("/assets/atlas-logo.png")
  const [appName, setAppName] = useState("Atlas API")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Static search data (mock)
  const staticData = [
    { name: "User API", path: "/api-management/apis/user" },
    { name: "Webhook Events", path: "/api-management/webhooks/events" },
    { name: "Security Policies", path: "/api-management/security/policies" },
    { name: "Favorites", path: "/api-management/favorites/apis" },
    { name: "API Keys", path: "/api-management/security/keys" },
  ]

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      Cookies.remove("atlas_access_token")
      Cookies.remove("atlas_userId")
      Cookies.remove("atlas_username")
      Cookies.remove("atlas_email")
      Cookies.remove("workspaceId")
      localStorage.clear()
      navigate("/")
    } catch (error) {
      cogoToast.error(
        `Logout error: ${error?.message || "Something went wrong!"}`
      )
    }
  }

  const handleSearch = e => {
    if (e.key === "Enter" && searchResults.length > 0) {
      navigate(searchResults[0].path)
      setSearchTerm("")
      setShowSearchResults(false)
    }
  }

  const handleSearchInput = e => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setSearchResults([])
      setShowSearchResults(false)
    } else {
      const matches = staticData.filter(item =>
        item.name.toLowerCase().includes(term.toLowerCase())
      )
      setSearchResults(matches)
      setShowSearchResults(true)
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings())
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload
          if (settings) {
            setLogoUrl(settings.logoUrl || "/assets/atlas-logo.png")
            setAppName(settings.appName || "ATLAS API")
          }
        }
      } catch (error) {
        cogoToast.error(
          `Failed to load app settings: ${
            error?.message || "Unknown error occurred"
          }`
        )
      }
    }

    loadSettings()
  }, [dispatch])

  return (
    <header className="bg-gray-100 border-b border-gray-200">
      <Navbar fluid rounded className="w-full p-3">
        {/* Logo */}
        <Navbar.Brand
          href="/api-management/overview"
          className="flex items-center gap-2"
        >
          <img src={logoUrl} className="h-8 w-8" alt={appName} />
          <span className="text-xl font-bold text-custom-main uppercase">
            {appName}
          </span>
        </Navbar.Brand>

        {/* Search */}
        <div className="relative w-full max-w-md mx-auto hidden md:block">
          <FiSearch className="absolute left-3 text-2xl top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search APIs, webhooks..."
            className="pl-10 pr-3 py-2 w-full min-w-[40vw] border border-gray-300 rounded-md focus:outline-none focus:border-custom-main"
            value={searchTerm}
            onChange={handleSearchInput}
            onKeyDown={handleSearch}
          />

          {showSearchResults && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 min-w-[40vw] w-full overflow-auto">
              {searchResults.length > 0 ? (
                searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      navigate("/api-managment/try-it")
                      setSearchTerm("")
                      setShowSearchResults(false)
                    }}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    {item.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No matching results found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Options */}
        <div className="flex items-center space-x-4">
          {/* Quick Nav Dropdown */}
          <Dropdown label="Quick Links" inline>
            <Dropdown.Item onClick={() => navigate("/api-management/apis")}>
              All APIs
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => navigate("/api-management/security/policies")}
            >
              Security Policies
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => navigate("/api-management/favorites/apis")}
            >
              Favorites
            </Dropdown.Item>
          </Dropdown>

          {/* Help Tooltip */}
          <Tooltip content="Need Help?">
            <button
              onClick={() => navigate("/api-management/support")}
              className="text-gray-600 hover:text-custom-main"
            >
              <FiHelpCircle size={20} />
            </button>
          </Tooltip>

          {/* Create API Key Button */}
          <Button
            color="gray"
            onClick={() => navigate("/api-management/security/keys")}
            className="bg-custom-main text-white flex items-center justify-center !gap-3 hover:bg-custom-main/90"
          >
            <MdKey className="text-lg mr-2" />
            <span> Create API Key</span>
          </Button>

          {/* User Dropdown */}
          <CustomAPIsMenu navigate={navigate} handleLogout={handleLogout} />
        </div>
      </Navbar>
    </header>
  )
}

export default APIManagementHeader
