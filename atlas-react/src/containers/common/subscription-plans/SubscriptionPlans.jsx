import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PricingCard from "../../../components/cards/PricingCard";
import { fetchPlans } from "../../../redux/slices/plans";

// Helper to render checkmark and cross
const renderCheckmark = (value) => {
  return value ? (
    <span className="text-green-500">&#10003;</span> 
  ) : (
    <span className="text-red-500">&#10005;</span> 
  );
};

const SubscriptionPlans = () => {
  const dispatch = useDispatch();

  // Get plans and status from Redux store
  const { plans, status, error } = useSelector((state) => state.plans);

  // Fetch plans on component mount
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-custom-background-white">
      <header className="p-4 bg-custom-navbar flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="#"
            className="flex items-center space-x-2 text-xl text-custom-text-white"
          >
            <span className="font-semibold">Atlas</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 overflow-hidden bg-custom-background-white pb-12 pt-20 lg:pb-[90px] lg:pt-[60px]">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[510px] text-center">
                <h2 className="mb-3 text-3xl font-bold leading-[1.208] text-custom-text-heading sm:text-4xl md:text-[40px]">
                  Our Pricing Plan
                </h2>
                <p className="text-base text-custom-text-grey">
                  There are many variations of passages of Lorem Ipsum available
                  but the majority have suffered alteration in some form.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                type={plan.name}
                price={`$0.0`}
                subscription="year"
                description={plan.description}
                buttonText={`Choose ${plan.name}`}
                className="h-full"
              >
                <FeatureList features={plan.features} />
              </PricingCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureList = ({ features }) => {
  const [showMore, setShowMore] = useState(false);

  // Get the first 5 features, rest will be hidden initially
  const featureKeys = Object.keys(features);
  const firstFiveFeatures = featureKeys.slice(0, 5);
  const remainingFeatures = featureKeys.slice(5);

  return (
    <div>
      <div className="space-y-2">
        {firstFiveFeatures.map((featureKey) => (
          <List key={featureKey}>
            <div className="flex items-center justify-between">
              <span>{featureKey}:</span>
              <span>{renderCheckmark(features[featureKey])}</span>
            </div>
          </List>
        ))}
      </div>

      {showMore && (
        <div className="space-y-2 mt-4">
          {remainingFeatures.map((featureKey) => (
            <List key={featureKey}>
              <div className="flex items-center justify-between">
                <span>{featureKey}:</span>
                <span>{renderCheckmark(features[featureKey])}</span>
              </div>
            </List>
          ))}
        </div>
      )}

      {/* Show more button */}
      {remainingFeatures.length > 0 && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-4 text-blue-500 hover:text-blue-700"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

const List = ({ children }) => {
  return <p className="text-base text-custom-text-grey">{children}</p>;
};

export default SubscriptionPlans;
