// src/pages/admin/DashboardHome.jsx
import React, { useEffect, useState } from "react"; 
// import axios from "axios";
import API from "../../utils/api";

const DashboardHome = () => {
  const [departments, setDepartments] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [leaveStats, setLeaveStats] = useState({
    applied: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const token = localStorage.getItem("token");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await API.get("/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch total employees
  const fetchTotalEmployees = async () => {
    try {
      const res = await API.get("/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTotalEmployees(res.data.employees.length);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch leave stats
  const fetchLeaveStats = async () => {
    try {
      const res = await API.get("/api/leaves/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const leaves = res.data.leaves;
        setLeaveStats({
          applied: leaves.length,
          approved: leaves.filter((l) => l.status === "approved").length,
          pending: leaves.filter((l) => l.status === "pending").length,
          rejected: leaves.filter((l) => l.status === "rejected").length,
        });
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchTotalEmployees();
    fetchLeaveStats();

    // Optional: auto refresh every 15s
    const interval = setInterval(fetchLeaveStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">Dashboard Overview</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h2 className="text-gray-500 text-sm">Total Employees</h2>
          <p className="text-3xl font-bold text-teal-600">{totalEmployees}</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h2 className="text-gray-500 text-sm">Total Departments</h2>
          <p className="text-3xl font-bold text-teal-600">{departments.length}</p>
        </div>
      </div>

      {/* List of Departments */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Departments</h2>
        <ul className="list-disc list-inside bg-white shadow-lg rounded-xl p-4">
          {departments.map((dept) => (
            <li key={dept._id} className="py-1">
              {dept.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Leave Details */}
      <h1 className="text-2xl font-bold mb-6 text-gray-700">Leave Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h2 className="text-gray-500 text-sm">Leave Applied</h2>
          <p className="text-2xl font-bold text-blue-600">{leaveStats.applied}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h2 className="text-gray-500 text-sm">Leave Approved</h2>
          <p className="text-2xl font-bold text-green-600">{leaveStats.approved}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h2 className="text-gray-500 text-sm">Leave Pending</h2>
          <p className="text-2xl font-bold text-yellow-500">{leaveStats.pending}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h2 className="text-gray-500 text-sm">Leave Rejected</h2>
          <p className="text-2xl font-bold text-red-600">{leaveStats.rejected}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
