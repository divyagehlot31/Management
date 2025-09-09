// components/EditEmployeeModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api";


const EditEmployeeModal = ({ employee, isOpen, onClose, onEmployeeUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    salary: "",
    isActive: true
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Populate form when employee changes
// In useEffect where you populate form data:
useEffect(() => {
  if (employee) {
    console.log("Employee data received in edit modal:", employee);
    
    // ✅ BETTER: Handle department ObjectId properly
    let departmentId = "";
    if (employee.department) {
      if (typeof employee.department === 'object' && employee.department._id) {
        departmentId = employee.department._id;
      } else if (typeof employee.department === 'string' && employee.department !== 'Not Assigned') {
        // If it's an ObjectId string
        departmentId = employee.department;
      }
    }
    
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      department: departmentId,
      phone: employee.phone || "",
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : "",
      address: employee.address || "",
      salary: employee.salary || "",
      isActive: employee.isActive !== false
    });
  }
}, [employee]);

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const token = localStorage.getItem("token");
            const response = await API.get("/departments", {

      // const response = await axios.get("http://localhost:5000/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const departmentData = response.data.data || response.data.departments || [];
        setDepartments(departmentData);
        console.log("Departments loaded:", departmentData);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments. Please try again.");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      // ✅ FIXED: Send department as ObjectId, not name
      const updateData = {
        ...formData,
        department: formData.department || null,  // Send ObjectId or null
        salary: formData.salary ? Number(formData.salary) : undefined
      };

      console.log("Sending update data:", updateData);
            const response = await API.put(`/employees/${employee._id}`,


      // const response = await axios.put(`http://localhost:5000/api/employees/${employee._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log("Employee updated successfully:", response.data.employee);
        onEmployeeUpdated(response.data.employee);
        onClose();
        alert("Employee updated successfully!");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      console.error("Error response:", error.response?.data);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 403) {
        setError("You don't have permission to update this employee");
      } else if (error.response?.status === 404) {
        setError("Employee not found");
      } else {
        setError("Failed to update employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Work Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 mt-6">
                Work Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              {departmentsLoading ? (
                <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  <option>Loading departments...</option>
                </select>
              ) : (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
              {departments.length === 0 && !departmentsLoading && (
                <button
                  type="button"
                  onClick={fetchDepartments}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Retry loading departments
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary (₹)
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Enter full address"
              ></textarea>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active Employee</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || departmentsLoading}
              className={`px-6 py-2 rounded-lg transition ${
                loading || departmentsLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white`}
            >
              {loading ? "Updating..." : "Update Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;