import React, { useState, useEffect } from "react";
// import axios from "axios";
import API from "../../utils/api"
import { useAuth } from "../../context/authContext";
import ViewEmployeeModal from "../../components/ViewEmployeeModal";
import EditEmployeeModal from "../../components/EditEmployeeModal";
import AddEmployeeModal from "../../components/AddEmployeeModal";

const EmployeePage = () => {
  const [searchId, setSearchId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);


  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
            const response = await API.get("/employees", {

      // const response = await axios.get("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setEmployees(response.data.employees);
        console.log("Employees fetched:", response.data.employees); // Debug log
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // Handle view employee
  const handleView = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
            const response = await API.get(`/employees/${employeeId}`, {

      // const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSelectedEmployee(response.data.employee);
        setViewModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      alert("Failed to load employee details");
    }
  };

  // Handle edit employee
  const handleEdit = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
            const response = await API.get(`/employees/${employeeId}`, {

      // const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSelectedEmployee(response.data.employee);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      alert("Failed to load employee details");
    }
  };

 // ✅ IMPROVED: Better employee update handler
const handleEmployeeUpdated = (updatedEmployee) => {
  console.log("Received updated employee:", updatedEmployee);
  
  // Update the specific employee in the list
  setEmployees(prev => 
    prev.map(emp => {
      if (emp._id === updatedEmployee._id) {
        return {
          ...updatedEmployee,
          // Ensure department format consistency
          department: updatedEmployee.department
        };
      }
      return emp;
    })
  );
  
  // Also update selectedEmployee if it's the same one
  if (selectedEmployee && selectedEmployee._id === updatedEmployee._id) {
    setSelectedEmployee(updatedEmployee);
  }
};

  // Delete employee
  const handleDelete = async (id, employeeName = "this employee") => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
            const response = await API.delete(`/employees/${id}`, {

      // const response = await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove deleted employee from state
        setEmployees(employees.filter(emp => emp._id !== id));
        alert("Employee deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
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

// EmployeePage.js में यह function को update करें:
const getDepartmentName = (department) => {
  console.log("Getting department name for:", department);
  
  if (!department) return "Not Assigned";
  
  // If department is populated object
  if (typeof department === 'object' && department !== null) {
    return department.name || "Not Assigned";
  }
  
  // If department is string
  if (typeof department === 'string') {
    return department === 'Not Assigned' ? department : department;
  }
  
  return "Not Assigned";
};

  // Filter employees based on search
  const filteredEmployees = employees.filter((emp) =>
    emp.employeeId?.toLowerCase().includes(searchId.toLowerCase()) ||
    emp.name?.toLowerCase().includes(searchId.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchId.toLowerCase()) ||
    getDepartmentName(emp.department).toLowerCase().includes(searchId.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading employees...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={fetchEmployees}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">Employee Management</h2>

      {/* Search Bar */}
      <div className="flex mb-6 justify-between items-center">
        <div><button
  onClick={() => setAddModalOpen(true)}
  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 mb-4"
>
  + Add New Employee
</button>
</div> {/* Empty div for spacing */}
        
        <input
          type="text"
          placeholder="Search by ID, Name, Email, or Department"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none w-80"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Active Employees</h3>
          <p className="text-2xl font-bold text-green-900">
            {employees.filter(emp => emp.isActive !== false).length}
          </p>
        </div>
       
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">New This Month</h3>
          <p className="text-2xl font-bold text-purple-900">
            {employees.filter(emp => {
              const joinDate = new Date(emp.joinDate);
              const now = new Date();
              return joinDate.getMonth() === now.getMonth() && 
                     joinDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Departments</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {new Set(employees.map(emp => getDepartmentName(emp.department)).filter(dept => dept !== "Not Assigned")).size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Employee ID</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Department</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Phone</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Join Date</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Salary</th>
              <th className="border px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50 transition">
                <td className="border px-6 py-3 font-medium text-blue-600">
                  {emp.employeeId || "Pending"}
                </td>
                <td className="border px-6 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{emp.name || "N/A"}</p>
                    {emp.isActive === false && (
                      <span className="text-xs text-red-500">Inactive</span>
                    )}
                  </div>
                </td>
                <td className="border px-6 py-3 text-gray-700">
                  {emp.email || "N/A"}
                </td>
                <td className="border px-6 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getDepartmentName(emp.department) !== "Not Assigned"
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getDepartmentName(emp.department)}
                  </span>
                </td>
                <td className="border px-6 py-3 text-gray-600">
                  {emp.phone || "N/A"}
                </td>
                <td className="border px-6 py-3 text-gray-600">
                  {formatDate(emp.joinDate)}
                </td>
                <td className="border px-6 py-3 text-gray-700">
                  ₹{emp.salary?.toLocaleString() || "0"}
                </td>
                <td className="border px-6 py-3 space-x-2">
                  <button 
                    onClick={() => handleView(emp._id)} 
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-xs"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEdit(emp._id)} 
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition text-xs"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(emp._id, emp.name)} 
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  {searchId ? "No employees match your search" : "No employees found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Employee Modal */}
      <ViewEmployeeModal
        employee={selectedEmployee}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedEmployee(null);
        }}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        employee={selectedEmployee}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
      <AddEmployeeModal
  isOpen={addModalOpen}
  onClose={() => setAddModalOpen(false)}
  onEmployeeAdded={(employee) => setEmployees(prev => [employee, ...prev])}
/>

    </div>
  );
};

export default EmployeePage;