import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <AdminHeader />

      <div className="flex flex-grow overflow-hidden">
        <div className="w-64">
          <AdminSidebar />
        </div>

        <main className="flex-1 bg-gray-200 p-2 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
