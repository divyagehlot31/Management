// components/ViewEmployeeModal.js
import React from "react";

const ViewEmployeeModal = ({ employee, isOpen, onClose }) => {
  if (!isOpen || !employee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // ✅ FIXED: Better department name handling
  const getDepartmentName = (department) => {
    if (!department) return "Not Assigned";
    if (typeof department === 'string') {
      return department === 'Not Assigned' ? department : department;
    }
    if (typeof department === 'object' && department.name) {
      return department.name;
    }
    return "Not Assigned";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Employee Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Employee ID</label>
              <p className="text-gray-800 font-semibold">{employee.employeeId || "Pending"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-800">{employee.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-800">{employee.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-800">{employee.phone || "N/A"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="text-gray-800">{formatDate(employee.dateOfBirth)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                employee.isActive !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Work Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-800">{getDepartmentName(employee.department)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-800 capitalize">{employee.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Join Date</label>
              <p className="text-gray-800">{formatDate(employee.joinDate)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Salary</label>
              <p className="text-gray-800 font-semibold">{formatCurrency(employee.salary)}</p>
            </div>
          </div>

          {/* Address */}
          {employee.address && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Address
              </h3>
              <p className="text-gray-800">{employee.address}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-800">{formatDate(employee.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-800">{formatDate(employee.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;