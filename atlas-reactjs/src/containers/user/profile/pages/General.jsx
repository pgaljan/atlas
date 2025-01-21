import React from "react";
import InputField from "../../../../components/input-field/InputField";

const General = () => {
  return (
    <div>
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <h2 className="text-lg font-bold mb-4">Personal Details</h2>
          <InputField
            label="Name"
            name="name"
            placeholder="Enter your name"
          />
          <InputField
            label="Username"
            name="username"
            placeholder="Enter your username"
          />
          <InputField
            label="Website"
            name="website"
            placeholder="Enter your website"
          />
          <InputField
            label="Description"
            name="description"
            placeholder="Enter a description"
          />
        </div>

        <div className="flex flex-col items-center pl-20  pr-80">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
            <img
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
        <button className="px-6 py-2 rounded-md bg-custom-main text-white">
          Save changes
        </button>
      </div>
    </div>
  );
};

export default General;
