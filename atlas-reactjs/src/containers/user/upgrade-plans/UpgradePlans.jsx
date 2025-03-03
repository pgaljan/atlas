import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../../components/layout";
import Icons from "../../../constants/icons";
import { fetchPlans } from "../../../redux/slices/plans";
import Cookies from "js-cookie";
import {
  fetchSubscription,
  updateSubscriptionPlan,
} from "../../../redux/slices/subscriptions";
import cogoToast from "@successtar/cogo-toast";

const UpgradePlans = () => {
  const dispatch = useDispatch();
  const { plans } = useSelector((state) => state.plans);
  const [currentPlan, setCurrentPlan] = useState(null);

  console.log(plans);

  useEffect(() => {
    dispatch(fetchPlans());

    const userId = Cookies.get("atlas_userId");
    if (userId) {
      dispatch(fetchSubscription(userId)).then((res) => {
        setCurrentPlan(res?.payload);
      });
    }
  }, [dispatch]);

  const handlePlanSelection = (planId) => {
    const userId = Cookies.get("atlas_userId");
    if (!userId) {
      cogoToast.error("User ID is missing!");
      return;
    }

    dispatch(updateSubscriptionPlan({ userId, planId })).then(() => {
      cogoToast.success("Subscription updated successfully!");
      dispatch(fetchSubscription(userId)).then((res) => {
        setCurrentPlan(res?.payload);
      });
    });
  };

  const planOrder = ["Personal", "Educator", "Business", "Analyst"];

  const sortedPlans = [...plans].sort(
    (a, b) => planOrder?.indexOf(a?.name) - planOrder?.indexOf(b?.name)
  );

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen scale-90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedPlans.map((plan, index) => (
            <div
              key={plan.id}
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
              {plan?.name.toLowerCase() === "business" && (
                <div className="absolute top-0 right-0 transform rotate-360 opacity-100">
                  <div className="w-full h-full">
                    <Icons.ProCardIcon className="w-[128px] h-[128px]" />
                  </div>
                </div>
              )}

              <div className="flex flex-col mb-4">
                <h3
                  className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-[43.86px] ${
                    index === 2 ? "text-custom-main pt-8" : "text-custom-main"
                  }`}
                >
                  {plan?.name}
                </h3>
                <p className="mt-1 text-sm sm:text-base text-custom-main">
                  {plan?.description}
                </p>
              </div>

              <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-custom-main">
                {plan?.price && (
                  <>
                    <span className="text-3xl font-bold">
                      ${plan?.price?.split(".")[0]}.0
                    </span>
                    {plan?.price?.split(".")[1] && (
                      <sup className="text-xl font-bold">
                        {plan?.price?.split(".")[1]}
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
                  className={`h-[48px] w-[229px] rounded-lg text-[16px] font-bold ${
                    currentPlan && currentPlan?.plan?.name === plan?.name
                      ? "bg-custom-main cursor-not-allowed text-white"
                      : plan.highlight
                      ? "bg-custom-main text-white hover:bg-custom-text-white hover:text-custom-main border-[2px] hover:border-custom-main"
                      : "bg-white text-custom-main border-[2px] font-extrabold border-custom-main hover:bg-custom-main hover:text-white"
                  }`}
                  disabled={
                    currentPlan && currentPlan?.plan?.name === plan?.name
                  }
                  onClick={() => handlePlanSelection(plan?.id)}
                >
                  {currentPlan && currentPlan?.plan?.name === plan?.name
                    ? "Subscribed"
                    : `Choose ${plan?.name}`}
                </button>
              </div>

              {plan?.link && (
                <div className="mt-2 text-center">
                  <a
                    href="#"
                    className="text-custom-main text-sm font-bold border-b-2 border-custom-main"
                  >
                    {plan?.link}
                  </a>
                </div>
              )}

              <div className="mt-6 flex-grow">
                <h4 className="text-base font-semibold text-custom-main">
                  {plan?.featureHeading}
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-custom-main">
                  {Object.entries(plan?.features).map(([key, value], i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{key}</span>
                      {typeof value === "boolean" ? (
                        value ? (
                          <Icons.PriceCardTickIcons className="h-4 w-4 text-green-500" />
                        ) : (
                          <Icons.PriceCardCrossIcons className="h-4 w-4 text-red-500" />
                        )
                      ) : (
                        <span>{value}</span>
                      )}
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
