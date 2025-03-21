import React, { useState } from "react";
import Layout from "../../../components/layout";
import HeaderTab from "../../../components/header-tab/HeaderTab";
import General from "./pages/General";
import Password from "./pages/Password";
import Services from "./pages/Services&Sessions";
import TermsAndPolicies from "./pages/Terms&Policy";

const Profile = () => {
  const tabs = [
    { label: "General" },
    { label: "Password" },
    { label: "Services & Sessions" },
    { label: "Terms & Policies" },
  ];

  const [activeTab, setActiveTab] = useState("General");

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return <General />;
      case "Password":
        return <Password />;
      case "Services & Sessions":
        return <Services />;
      case "Terms & Policies":
        return <TermsAndPolicies />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-2">
        <div className="p-14 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
          <h1 className="text-4xl font-bold mb-4">Me</h1>
          <HeaderTab
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={setActiveTab}
          />
          <div>{renderContent()}</div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
