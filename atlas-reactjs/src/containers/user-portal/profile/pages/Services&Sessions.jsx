import React from "react";
import { services } from "../../../../constants";

const Services = () => {
  return (
    <div className="bg-custom-background-white mx-auto">
      <h1 className="text-2xl font-bold text-custom-text-heading mb-6">
        Connected Services
      </h1>
      <p className="text-custom-text-grey ">
        You can connect your account with various services and benefit from a
        fully integrated experience with your
      </p>
      <p className="text-custom-text-grey mb-8">Facebook or Google account.</p>

      <div className="space-y-3">
        {services?.map((service, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border-b-2"
          >
            <div className="flex items-center">
              <div className="mr-3">{service?.icon}</div>
              <div>
                <h2 className="text-lg font-medium text-custom-text-heading pl-2">
                  {service?.name}
                </h2>
                <p className="text-sm text-custom-text-grey pl-2 max-w-lg">
                  {service?.description}
                </p>
              </div>
            </div>
            <div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-custom-main rounded-md">
                {service?.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
