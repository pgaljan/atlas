import { TbServer2 } from "react-icons/tb"

const UserInfoModal = ({ isOpen, onClose, user, fmt }) => {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-96 z-10 animate-fadeIn">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h3 className="font-semibold flex flex-col items-start">
            <span className="font-bold capitalize text-gray-800">
              {user?.displayName || user?.username}
            </span>
            <span className="text-sm text-gray-400">{user?.email}</span>
          </h3>
          {/* <span>
            <TbServer2
              size={24}
              title="Download Analytics"
              className="cursor-pointer"
            />
          </span> */}
        </div>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-bold">Last login:</span>{" "}
            {fmt(user?.lastLogin)}
          </p>
          <p>
            <span className="font-bold">Onboarded:</span>{" "}
            {fmt(user?.onboardTime)}
          </p>
          <p>
            <span className="font-bold">Total login(s):</span>{" "}
            {user?.totalLogins ?? 0}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-custom-main text-white py-2 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default UserInfoModal
