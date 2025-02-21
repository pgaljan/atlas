import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import Cookies from "js-cookie"
import InputField from "../../../../components/input-field/InputField"
import { updateUser, fetchUser } from "../../../../redux/slices/users"
import cogoToast from "@successtar/cogo-toast"
import ImportModal from "../../../../components/modals/ImportModal"

const General = () => {
  const dispatch = useDispatch()
  const userId = Cookies.get("atlas_userId")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toggleImportModal = () => {
    setIsImportModalOpen(prev => !prev)
  }
  const handleFileSelection = file => {
    cogoToast.success("Avatar uploaded successfully!")
  }

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await dispatch(fetchUser(userId)).unwrap()
        setFormData({
          fullName: data.fullName || "",
          username: data.username || "",
        })
      } catch (err) {
        console.log(err)
      }
    }

    fetchUserData()
  }, [dispatch, userId])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      await dispatch(
        updateUser({
          userId,
          updateData: formData,
        })
      ).unwrap()
      cogoToast.success("Changes saved successfully!")
    } catch (err) {
      cogoToast.error("Failed to save changes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <h2 className="text-lg font-bold mb-4">Personal Details</h2>
          <InputField
            label="Name"
            name="fullName"
            placeholder="Enter your name"
            value={formData.fullName}
            onChange={handleInputChange}
          />
          <InputField
            label="Username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex flex-col items-center pl-20 pr-80">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              onClick={toggleImportModal}
              src="https://via.placeholder.com/40"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-4 text-center text-sm text-custom-text-grey">
            My Avatar
          </p>
          <p className="text-center text-xs text-custom-text-grey">
            Your photo should be cool and
            <br />
            may use transparency.
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 rounded-md bg-custom-main text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={toggleImportModal}
        title={"Import Avatar"}
        isLoading={isLoading}
        handleFileSelection={handleFileSelection}
        buttonText={"Upload"}
        format={".png, .jpeg, .jpg"}
      />
    </div>
  )
}

export default General
