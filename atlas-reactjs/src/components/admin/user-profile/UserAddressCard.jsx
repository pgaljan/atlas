import useModal from "../../../hooks/useModal";
import Modal from "../../modals/AdminModal";
import InputField from "../../input-field/InputField";
import { TbEditCircle } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
const UserAddressCard = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };
  const userData = {
    country: " United States.",
    City: "  Phoenix, Arizona, United States.",
    postalCode: "  ERT 2489",
    taxID: "AS4568384",
  };
  return (
    <>
      <div className="p-5 border-2 border-gray-200 rounded-2xl ">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-4  ">Address</h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-base  font-semibold leading-normal text-gray-600 ">
                  Country
                </p>
                <p className="text-sm font-medium text-gray-500 ">
                  {userData.country}
                </p>
              </div>

              <div>
                <p className="mb-2 text-base  font-semibold leading-normal text-gray-600 ">
                  City/State
                </p>
                <p className="text-sm font-medium text-gray-500 ">
                  {userData.City}
                </p>
              </div>
            </div>
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
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white  p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-3xl font-bold text-gray-800 ">
              Edit Address
            </h4>
            <p className="text-base text-gray-500  mb-2 ">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar overflow-y-auto px-2 ">
              <h5 className="mb-5 mt-2 text-2xl font-bold text-gray-800 ">
                Address
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <InputField
                    label="Country"
                    type="text"
                    value="United States"
                  />
                </div>

                <div>
                  <InputField
                    label="City/State"
                    type="text"
                    value="Arizona, United States."
                  />
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
export default UserAddressCard;
