import React from "react";
import { plans } from "../../../constants/index";
import Layout from "../../../components/layout";
import Icons from "../../../constants/icons";

const UpgradePlans = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen scale-90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative w-[295px] min-h-[560px] h-auto p-6 bg-white border transition-all duration-300 flex flex-col justify-between ${
                index === 2
                  ? "border-[1px] rounded-2xl transform scale-y-110 shadow-md"
                  : index === 0
                  ? "rounded-tl-2xl rounded-bl-2xl border-custom-text-borderGrey shadow-md"
                  : index === 3
                  ? "rounded-tr-2xl rounded-br-2xl border-custom-text-borderGrey shadow-md"
                  : "border-custom-text-borderGrey shadow-md"
              }`}
            >
              {plan.icon && (
                <div className="absolute top-0 right-0 transform rotate-360 opacity-100">
                  <div className="w-full h-full">{plan.icon}</div>
                </div>
              )}

              <div className="flex flex-col mb-4">
                <h3
                  className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-[43.86px] ${
                    index === 2 ? "text-custom-main pt-8" : "text-custom-main"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm sm:text-base text-custom-main">
                  {plan.description}
                </p>
              </div>

              <div
                className={`mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-custom-main ${
                  index === 0
                    ? "pt-12 pb-10"
                    : index === 1
                    ? "pt-12 pb-2"
                    : index === 2
                    ? "pt-2"
                    : index === 3
                    ? "pt-6 pb-2"
                    : "p-6"
                }`}
              >
                {plan.price && (
                  <>
                    <span className="text-3xl font-bold">
                      {plan.price.split(".")[0]}
                    </span>
                    {plan.price.split(".")[1] && (
                      <sup className="text-xl font-bold">
                        {plan.price.split(".")[1]}
                      </sup>
                    )}
                  </>
                )}

                {plan.price !== "Free" && (
                  <div className="mt-2 text-base font-normal text-custom-main">
                    Per Month
                  </div>
                )}
              </div>

              <div className="mt-2 flex justify-center">
                <button
                  className={`h-[48px] w-[229px] rounded-lg text-sm font-semibold ${
                    plan.highlight
                      ? "bg-custom-main text-white hover:bg-custom-text-white hover:text-custom-main border-[2px] hover:border-custom-main   "
                      : "bg-white text-custom-main border-[2px] font-extrabold border-custom-main hover:bg-custom-main hover:text-white"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>

              {plan.link && (
                <div className="mt-2 text-center">
                  <a
                    href="#"
                    className="text-custom-main text-sm font-bold border-b-2 border-custom-main"
                  >
                    {plan.link}
                  </a>
                </div>
              )}

              <div className="mt-6 flex-grow">
                <h4 className="text-base font-semibold text-custom-main">
                  {plan.featureHeading}
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-custom-main">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Icons.PriceCardTickIcons className="h-4 w-4 font-extrabold  text-custom-main mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UpgradePlans;
