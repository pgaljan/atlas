import React from "react";

const PricingCard = ({
  id,
  children,
  description,
  price,
  type,
  subscription,
  buttonText,
  active,
  onSelectPlan,
}) => {
  return (
    <>
      <div className="w-full">
        <div className="relative z-10 mb-10 overflow-hidden rounded-[10px] border-2 border-custom-main bg-custom-background-white px-8 py-10 shadow-pricing sm:p-12 lg:px-6 lg:py-10 xl:p-[30px]">
          <span className="mb-1 block text-lg font-semibold text-custom-main">
            {type}
          </span>
          <h2 className="mb-3 text-[42px] font-bold text-custom-text-heading">
            {price}.0
            <span className="text-base font-medium text-custom-text-grey">
              / {subscription}
            </span>
          </h2>
          <p className="mb-4 border-b border-custom-main pb-4 text-base text-custom-text-grey truncate overflow-hidden">
            {description}
          </p>
          <div className="mb-9 flex flex-col gap-[14px]">{children}</div>
          <a
            href="#"
            onClick={onSelectPlan}
            className={`${
              active
                ? "block w-full rounded-md border border-custom-main bg-custom-main p-3 text-center text-base font-medium text-custom-text-white transition hover:bg-opacity-90"
                : "block w-full rounded-md border border-custom-main bg-transparent p-3 text-center text-base font-medium text-custom-main transition hover:border-custom-main hover:bg-custom-main hover:text-custom-text-white"
            }`}
          >
            {buttonText}
          </a>
          <div>
            <span className="absolute right-0 top-7 z-[-1]">
              <svg
                width={77}
                height={172}
                viewBox="0 0 77 172"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx={86} cy={86} r={86} fill="url(#paint0_linear)" />
                <defs>
                  <linearGradient
                    id="paint0_linear"
                    x1={86}
                    y1={0}
                    x2={86}
                    y2={172}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#660000" stopOpacity="0.09" />
                    <stop offset={1} stopColor="#C4C4C4" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="absolute right-4 top-4 z-[-1]">
              <svg
                width={41}
                height={89}
                viewBox="0 0 41 89"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="38.9138"
                  cy="87.4849"
                  r="1.42021"
                  transform="rotate(180 38.9138 87.4849)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="74.9871"
                  r="1.42021"
                  transform="rotate(180 38.9138 74.9871)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="62.4892"
                  r="1.42021"
                  transform="rotate(180 38.9138 62.4892)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="38.3457"
                  r="1.42021"
                  transform="rotate(180 38.9138 38.3457)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="13.634"
                  r="1.42021"
                  transform="rotate(180 38.9138 13.634)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="50.2754"
                  r="1.42021"
                  transform="rotate(180 38.9138 50.2754)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="26.1319"
                  r="1.42021"
                  transform="rotate(180 38.9138 26.1319)"
                  fill="#660000"
                />
                <circle
                  cx="38.9138"
                  cy="1.42021"
                  r="1.42021"
                  transform="rotate(180 38.9138 1.42021)"
                  fill="#660000"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingCard;
