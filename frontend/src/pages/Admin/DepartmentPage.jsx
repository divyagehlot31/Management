import React, { useState, useEffect } from "react";
// import axios from "axios";
import API from "../../utils/api"
import { useAuth } from "../../context/authContext";
import AddDepartmentModal from "../../components/AddDepartmentModal";
import ViewDepartmentModal from "../../components/ViewDepartmentModal";
import EditDepartmentModal from "../../components/EditDepartmentModal";

const DepartmentPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { user } = useAuth();

  // Fetch departments from API
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
            const response = await API.get("/departments", {

      // const response = await axios.get("http://localhost:5000/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        // ✅ FIXED: Handle both possible response structures
        const departmentData = response.data.data || response.data.departments || [];
        setDepartments(departmentData);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  // Handle department added
  const handleDepartmentAdded = (newDepartment) => {
    setDepartments(prev => [{ ...newDepartment, employeeCount: 0 }, ...prev]);
  };

  // Handle department updated
  const handleDepartmentUpdated = (updatedDepartment) => {
    setDepartments(prev => 
      prev.map(dept => 
        dept._id === updatedDepartment._id 
          ? { ...updatedDepartment, employeeCount: dept.employeeCount }
          : dept
      )
    );
  };

  // Handle view department
  const handleView = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    setViewModalOpen(true);
  };

  // Handle edit department
  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setEditModalOpen(true);
  };

  // Delete department
  const handleDelete = async (id, departmentName) => {
    const department = departments.find(d => d._id === id);
    
    if (department && department.employeeCount > 0) {
      alert(`Cannot delete ${departmentName}. ${department.employeeCount} employees are assigned to this department.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${departmentName}" department?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
            const response = await API.delete(`/departments/${id}`, {

      // const response = await axios.delete(`http://localhost:5000/api/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setDepartments(departments.filter(dept => dept._id !== id));
        alert("Department deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Failed to delete department");
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading departments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={fetchDepartments}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">Manage Departments</h2>

      {/* Search & Add Button */}
      <div className="flex mb-6 justify-between items-center">
        <button 
          onClick={() => setAddModalOpen(true)}
          className="bg-teal-600 text-white px-5 py-2 rounded-lg shadow hover:bg-teal-700 transition"
        >
          + Add New Department
        </button>

        <input
          type="text"
          placeholder="Search by Department, Head, or Description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none w-80"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Departments</h3>
          <p className="text-2xl font-bold text-blue-900">{departments.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Active Departments</h3>
          <p className="text-2xl font-bold text-green-900">
            {departments.filter(dept => dept.isActive !== false).length}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Total Employees</h3>
          <p className="text-2xl font-bold text-purple-900">
            {departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0)}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Largest Department</h3>
          <p className="text-lg font-bold text-yellow-900">
            {departments.length > 0 
              ? departments.reduce((max, dept) => 
                  (dept.employeeCount || 0) > (max.employeeCount || 0) ? dept : max
                ).name || "N/A"
              : "N/A"
            }
          </p>
        </div>
      </div>

      {/* Departments Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Sr No</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Department</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Department Head</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Employees</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Created</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept, index) => (
              <tr key={dept._id} className="hover:bg-gray-50 transition">
                <td className="border px-6 py-3 font-medium text-gray-600">
                  {index + 1}
                </td>
                <td className="border px-6 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{dept.name}</p>
                    {dept.description && (
                      <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                    )}
                  </div>
                </td>
                <td className="border px-6 py-3">
                  {/* ✅ FIXED: Handle both head string and headOfDepartment object */}
                  {dept.headOfDepartment?.name || dept.head || "Not Assigned"}
                </td>
                <td className="border px-6 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (dept.employeeCount || 0) > 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dept.employeeCount || 0} employees
                  </span>
                </td>
                <td className="border px-6 py-3 text-gray-600">
                  {formatDate(dept.createdAt)}
                </td>
                <td className="border px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dept.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dept.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="border px-6 py-3 space-x-2">
                  <button 
                    onClick={() => handleView(dept._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-xs"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEdit(dept)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition text-xs"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(dept._id, dept.name)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredDepartments.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  {searchTerm ? "No departments match your search" : "No departments found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onDepartmentAdded={handleDepartmentAdded}
      />

      <ViewDepartmentModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedDepartmentId(null);
        }}
        departmentId={selectedDepartmentId}
      />

      <EditDepartmentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedDepartment(null);
        }}
        department={selectedDepartment}
        onDepartmentUpdated={handleDepartmentUpdated}
      />
    </div>
  );
};

export default DepartmentPage;