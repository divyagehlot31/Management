import React, { useState } from "react";
import Sidebar from "../pages/Admin/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header (pass toggleSidebar so header button can also open/close sidebar) */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Nested pages will load here */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
