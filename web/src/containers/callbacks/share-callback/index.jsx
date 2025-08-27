import cogoToast from "@successtar/cogo-toast"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import {
  acceptInvitation,
  clearSharesState,
} from "../../../redux/slices/structure-sharing"

const ShareCallback = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const { loading, error } = useSelector(state => state.structureShares || {})

  useEffect(() => {
    const processInvitation = async () => {
      const token = searchParams.get("token")
      const email = searchParams.get("email")

      // Validate required parameters
      if (!token) {
        setStatus("error")
        setErrorMessage("Missing invitation token in URL")
        return
      }

      if (!email) {
        setStatus("error")
        setErrorMessage("Missing email address in URL")
        return
      }

      try {
        setStatus("loading")
        const result = await dispatch(
          acceptInvitation({ token, email })
        ).unwrap()

        setStatus("success")
        cogoToast.success("Invitation accepted successfully!")

        setTimeout(() => {
          navigate("/app/dashboard")
        }, 2000)
      } catch (error) {
        setStatus("error")
        const errorMsg =
          error?.message || "Failed to accept invitation. Please try again."
        setErrorMessage(errorMsg)
        cogoToast.error(errorMsg)

        setTimeout(() => {
          navigate("/")
        }, 3000)
      }
    }

    processInvitation()

    return () => {
      dispatch(clearSharesState())
    }
  }, [dispatch, navigate, searchParams])

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <FiLoader className="animate-spin w-12 h-12 text-custom-main mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Invitation
            </h2>
            <p className="text-gray-600">
              Please wait while we accept your invitation...
            </p>
          </div>
        )

      case "success":
        return (
          <div className="text-center">
            <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Accepted!
            </h2>
            <p className="text-gray-600 mb-4">
              You have successfully joined the structure.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )

      case "error":
        return (
          <div className="text-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Failed
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {renderContent()}
      </div>
    </div>
  )
}

export default ShareCallback
