import React from "react";
import InputField from "../../../../components/input-field/InputField";

const Password = () => {
  return (
    <div>
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <h2 className="text-lg font-bold mb-4">Password</h2>
          <InputField
            name="oldPassword"
            placeholder="Old Password"
            className=" w-1/3"
          />
          <InputField
            name="newPassword"
            placeholder="New Password"
            className=" w-1/3"
          />
          <InputField
            name="confirmPassword"
            placeholder="Confirm New Password"
            className=" w-1/3"
          />
        </div>
      </div>

      <div className="  mt-8">
        <button className="px-6 py-2 rounded-md bg-custom-main text-white">
          Save changes
        </button>
      </div>

      <div className="w-2/4 border border-x-custom-text-grey mt-10"></div>

      <div className=" mt-10">
        <h2 className="text-lg font-bold">Two-Factor Verification</h2>
        <p className="text-gray-600 mt-4">
          Two-Factor Authentication adds an extra layer of
        </p>
        <p className="text-gray-600   ">
          protection to your account.Whenever you log in,
        </p>
        <p className="text-gray-600   ">
          you'll need to enter both your password and also a
        </p>
        <p className="text-gray-600   ">
          security code from an app on your mobile phone.
        </p>
      </div>

      <div>
        <button className="px-6 py-2  mt-10  text-custom-main rounded-md border-custom-main border-[2px] hover:text-custom-text-white  hover:bg-custom-main  mx-auto">
          Enable Two-Factor Authentication
        </button>
      </div>
    </div>
  );
};

export default Password;
