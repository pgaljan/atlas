import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import {
  FiUsers,
  FiGlobe,
  FiActivity,
  FiDollarSign,
  FiAlertCircle,
  FiClock,
  FiRepeat,
  FiCreditCard,
  FiExternalLink,
} from "react-icons/fi";
import { api } from "../../../constants";

const StatCard = ({ label, value, Icon }) => (
  <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl p-5 min-w-[140px] text-center shadow-sm hover:shadow-md transition">
    <Icon className="text-xl text-custom-main mb-2" />
    <span className="text-xs text-gray-500 mb-1">{label}</span>
    <span className="text-xl font-bold text-gray-900">{value}</span>
  </div>
);

const SubscribedCard = ({ title, description, provider, updated }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
    <span className="text-xs text-custom-main bg-custom-main/10 py-0.5 rounded-full w-fit mb-2 font-medium">
      Subscribed API
    </span>
    <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
    <p className="text-sm text-gray-600 mt-1 flex-grow">{description}</p>
    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
      <div>
        By <span className="font-medium text-gray-700">{provider}</span> •
        Updated {updated}
      </div>
      <button className="text-custom-main hover:underline flex items-center gap-1">
        Explore <FiExternalLink size={12} />
      </button>
    </div>
  </div>
);

const index = () => {
  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-12">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Activity <span className="text-custom-main">Overview</span>
          </h1>
          <p className="text-sm text-gray-500">
            Track and analyze your API usage, subscriptions, and performance
            metrics.
          </p>
        </div>

        {/* My APIs Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">My APIs</h2>
          <p className="text-sm text-gray-500 mb-4">
            Review metrics from your published APIs.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total APIs" value="0" Icon={FiGlobe} />
            <StatCard label="Total Subscribers" value="0" Icon={FiUsers} />
            <StatCard label="API Calls (24h)" value="0" Icon={FiActivity} />
            <StatCard label="Sales (24h)" value="$0" Icon={FiDollarSign} />
            <StatCard label="Error Rate" value="0%" Icon={FiAlertCircle} />
            <StatCard label="Avg Latency" value="0ms" Icon={FiClock} />
          </div>
        </section>

        {/* My Subscriptions Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            My Subscriptions
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Keep track of the APIs you’ve subscribed to and how they're
            performing.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard label="Active Subscriptions" value="1" Icon={FiRepeat} />
            <StatCard label="API Calls (24h)" value="0" Icon={FiActivity} />
            <StatCard label="Last Payment" value="—" Icon={FiCreditCard} />
          </div>

          <div className="flex items-start flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Recently Subscribed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SubscribedCard
                title={api.name}
                description={api.description}
                provider={api.provider}
                updated={api.updated}
              />
            </div>
          </div>
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default index;
