import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewDepartmentModal = ({ isOpen, onClose, departmentId }) => {
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && departmentId) {
      fetchDepartmentDetails();
    }
  }, [isOpen, departmentId]);

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/departments/${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // ✅ FIXED: Use correct response structure
        setDepartment(response.data.department);
        console.log("Department details loaded:", response.data.department);
      }
    } catch (error) {
      console.error("Error fetching department details:", error);
      setError("Failed to fetch department details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Department Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">Loading department details...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <button
                onClick={fetchDepartmentDetails}
                className="ml-4 text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : department ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Name</label>
                    <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border">
                      {department.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Head</label>
                    <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border">
                      {department.headOfDepartment?.name || "Not Assigned"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border min-h-[60px]">
                      {department.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      department.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {department.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Employees</label>
                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {department.employeeCount || 0} employees
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created On</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(department.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employee List */}
              {department.employees && department.employees.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Employees ({department.employees.length})
                  </h4>
                  <div className="bg-white rounded border">
                    <div className="max-h-60 overflow-y-auto">
                      {department.employees.map((employee, index) => (
                        <div key={employee._id} className={`p-3 ${index !== department.employees.length - 1 ? 'border-b' : ''}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{employee.name}</p>
                              <p className="text-sm text-gray-600">{employee.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">ID: {employee.employeeId || "Pending"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(!department.employees || department.employees.length === 0) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Employees</h4>
                  <p className="text-gray-600 text-center py-4">No employees assigned to this department</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No department data available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDepartmentModal;