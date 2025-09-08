import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../../src/pages/Employee/EmployeeSidebar";
import EmployeeHeader from "../../src/pages/Employee/EmployeeHeader";

const EmployeeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <EmployeeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header (pass toggleSidebar so header button can also open/close sidebar) */}
        <EmployeeHeader toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
