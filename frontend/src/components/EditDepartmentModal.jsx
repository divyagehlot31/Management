// components/EditDepartmentModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditDepartmentModal = ({ department, isOpen, onClose, onDepartmentUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    status: 'active'
  });
  const [availableHeads, setAvailableHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        headOfDepartment: department.headOfDepartment?._id || '',
isActive: department.isActive !== false // default true
      });
      fetchAvailableHeads();
      setErrors({});
    }
  }, [isOpen, department]);

  const fetchAvailableHeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/departments/available-heads", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Include current head of department in the list
        let heads = response.data.employees;
        if (department?.headOfDepartment && !heads.find(h => h._id === department.headOfDepartment._id)) {
          heads = [department.headOfDepartment, ...heads];
        }
        setAvailableHeads(heads);
      }
    } catch (error) {
      console.error("Error fetching available heads:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
  const submitData = {
  name: formData.name,
  description: formData.description,
  headOfDepartment: formData.headOfDepartment || null,
  isActive: formData.isActive,  // ✅ सही field
};


      const response = await axios.put(
        `http://localhost:5000/api/departments/${department._id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onDepartmentUpdated(response.data.department);
        onClose();
        alert('Department updated successfully!');
      }
    } catch (error) {
      console.error("Error updating department:", error);
      const errorMessage = error.response?.data?.error || 'Failed to update department';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Edit Department</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Department Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter department name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter department description"
              />
            </div>

            {/* Head of Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head of Department
              </label>
              <select
                name="headOfDepartment"
                value={formData.headOfDepartment}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select head of department</option>
                {availableHeads.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.employeeId || employee.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
             <select
  name="isActive"
  value={formData.isActive ? "true" : "false"}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.value === "true",
    }))
  }
>
  <option value="true">Active</option>
  <option value="false">Inactive</option>
</select>

            </div>

            {/* Employee Count Info */}
            {department.employeeCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This department currently has {department.employeeCount} employee(s) assigned.
                  Changing the department name will update all employee records.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};

export default EditDepartmentModal;