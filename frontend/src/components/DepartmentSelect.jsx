// components/DepartmentSelect.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const DepartmentSelect = ({ value, onChange, className = "", disabled = false }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      // ✅ FIXED: Use the correct endpoint for departments
      const response = await axios.get("http://localhost:5000/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // ✅ FIXED: Handle both possible response structures
        const departmentData = response.data.data || response.data.departments || [];
        setDepartments(departmentData);
        console.log("Departments loaded:", departmentData); // Debug log
      } else {
        setError("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select 
        disabled 
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 ${className}`}
      >
        <option>Loading departments...</option>
      </select>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <select 
          disabled 
          className={`w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 ${className}`}
        >
          <option>{error}</option>
        </select>
        <button
          type="button"
          onClick={fetchDepartments}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Retry loading departments
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${className}`}
    >
      <option value="">Select Department</option>
      {departments.map((dept) => (
        <option key={dept._id} value={dept._id}>
          {dept.name}
        </option>
      ))}
    </select>
  );
};

export default DepartmentSelect;