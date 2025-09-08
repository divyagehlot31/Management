import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    phone: "",
    dateOfBirth: "",
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Fetch departments from public API (no auth required)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // ✅ FIXED: Use public departments endpoint
        const res = await axios.get("http://localhost:5000/api/departments/public/list");
        console.log("Departments response:", res.data); // Debug log
        
        // Handle both data and departments properties
        const departmentsList = res.data.data || res.data.departments || [];
        setDepartments(departmentsList);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError("Failed to load departments. Please try again.");
        // Set empty departments so form still works
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        ...formData,
        role: "employee",
      });

      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-b from-teal-600 to-gray-100 py-8">
      <h2 className="font-pacific text-3xl text-white mb-6">
        Employee Management System
      </h2>

      <div className="border shadow p-6 w-96 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Employee Registration</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            autoComplete="current-password"
            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
          />

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          
          {/* ✅ Show loading state for departments */}
          {departments.length === 0 && !error && (
            <small className="text-gray-500 mb-3 block">Loading departments...</small>
          )}

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
          />

          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <small className="text-gray-500 mb-3 block">Date of Birth</small>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {loading ? "Registering..." : "Register as Employee"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-teal-600 hover:underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;