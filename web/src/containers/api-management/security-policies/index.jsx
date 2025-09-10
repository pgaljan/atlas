import APIManagementLayout from "../../../components/api-management/APIManagementLayout";
import { policies } from "../../../constants";

const index = () => {
  return (
    <APIManagementLayout>
      <div className="px-6 py-6 space-y-10">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
            Security <span className="text-custom-main">Policies</span>
          </h1>
          <p className="text-sm text-gray-500">
            Review the security practices that protect your data and APIs in the
            ATLAS platform.
          </p>
        </div>

        {/* Policy List */}
        <section className="space-y-6">
          {policies.map((policy, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-custom-main transition-all duration-200"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {policy.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {policy.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </APIManagementLayout>
  );
};

export default index;
