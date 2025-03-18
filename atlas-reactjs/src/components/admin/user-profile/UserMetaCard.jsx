import useModal from "../../../hooks/useModal";
import Modal from "../../modals/AdminModal";
import InputField from "../../input-field/InputField";
import { TbEditCircle } from "react-icons/tb";

const UserMetaCard = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };
  const users = [
    {
      id: 1,
      firstName: "ATLAS",
      lastName: "ADMIN",
      role: "Team Manager",
      location: "Arizona, United States",
      image: "/assets/userimg.jpeg",
    },
  ];
  return (
    <>
      <div className="p-5 border-2 border-gray-200 rounded-2xl ">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center w-full gap-6 xl:flex-row"
              >
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full">
                  <img src={user.image} alt="user" />
                </div>

                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 xl:text-left">
                    <span className="text-gray-600 mr-2">{user.lastName}</span>
                    {user.firstName}
                  </h4>
                  <div className="flex flex-col items-center gap-1  text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-base text-gray-500">{user.role}</p>
                    <div className="hidden h-3.5 w-px bg-gray-300 xl:block"></div>
                    <p className="text-base text-gray-500">{user.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={openModal}
            className="flex w-auto lg:w-auto items-center justify-center gap-1 rounded-lg  bg-custom-main px-3 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-red-800"
          >
            <TbEditCircle className="w-5 h-4" />
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] ">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-3xl font-bold text-gray-800 ">
              Edit Personal Information
            </h4>
            <p className="text-base text-gray-500  mb-2 ">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar overflow-y-auto px-2 ">
              <div className="mt-7">
                <h5 className="mb-5 text-2xl font-bold text-gray-800  ">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <InputField label="First Name" type="text" value="Atlas" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <InputField label="Last Name" type="text" value="Admin" />
                  </div>

                  <div className="col-span-2">
                    <InputField
                      label="Location"
                      type="text"
                      value="Arizona, United States"
                    />
                  </div>
                  <div className="col-span-2">
                    <InputField label="Bio" type="text" value="Team Manager" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 justify-end mt-8">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-base font-medium text-white rounded-md bg-gray-600 hover:bg-gray-500"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-base font-medium text-white  rounded-md bg-custom-main hover:bg-red-800"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
export default UserMetaCard;
