import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import Select from "react-select"
import { fetchRoles } from "../../../redux/slices/roles"
import InputField from "../../input-field/InputField"

const GenericModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  title,
  initialData,
}) => {
  const defaultUserData = {
    displayName: "",
    username: "",
    email: "",
    role: "",
    password: "",
  }
  const defaultSettingData = {
    name: "",
    contact: "",
    social: "",
  }

  const [formData, setFormData] = useState(
    initialData ||
      (type === "user"
        ? defaultUserData
        : type === "setting"
        ? defaultSettingData
        : {})
  )

  const [roleOptions, setRoleOptions] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (type === "user") {
      setRolesLoading(true)
      dispatch(fetchRoles())
        .unwrap()
        .then(roles => {
          const options = roles.map(role => ({
            value: role.id,
            label: role.name,
          }))
          setRoleOptions(options)
          setRolesLoading(false)
        })
        .catch(error => {
          setRolesError(error)
          setRolesLoading(false)
        })
    }
  }, [dispatch, type])

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else if (type === "user") {
      setFormData(defaultUserData)
    }
  }, [initialData, type])

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = selectedOption => {
    setFormData({ ...formData, role: selectedOption.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white rounded-3xl shadow-lg p-6 text-start w-[400px] h-full overflow-auto relative">
        <h4 className="mb-2 text-3xl font-bold text-gray-800">{title}</h4>
        <p className="text-base text-gray-500 mb-3">
          Please provide the user details below:
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "user" ? (
            <>
              <InputField
                label="Display Name"
                name="displayName"
                placeholder="Enter Display Name"
                value={formData.displayName}
                onChange={handleChange}
              />
              <InputField
                label="Username"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Role
                </label>
                {rolesLoading ? (
                  <p className="text-red-500">Failed to load roles</p>
                ) : (
                  <Select
                    placeholder="Select Role"
                    options={roleOptions}
                    onChange={handleRoleChange}
                    value={
                      formData.role
                        ? roleOptions.find(option =>
                            typeof formData.role === "object"
                              ? option.value === formData.role.id
                              : option.value === formData.role ||
                                option.label === formData.role
                          )
                        : null
                    }
                  />
                )}
              </div>
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </>
          ) : type === "setting" ? (
            <>
              <InputField
                label="Name"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
              />
              <InputField
                label="Contact"
                name="contact"
                placeholder="Enter contact"
                value={formData.contact}
                onChange={handleChange}
              />
              <InputField
                label="Social"
                name="social"
                placeholder="Enter social media"
                value={formData.social}
                onChange={handleChange}
              />
            </>
          ) : null}
          <div className="flex justify-end gap-4 pt-12">
            <button
              type="button"
              className="py-2 px-4 rounded-md bg-gray-600 text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-md bg-custom-main text-white"
            >
              Save {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GenericModal
