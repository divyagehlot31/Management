// src/pages/PaySalaryPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const PaySalaryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    salary: 0,
    allowance: 0,
    deduction: 0,
    total: 0,
    payDate: new Date().toISOString().split("T")[0], 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch employees
useEffect(() => {
  const token = localStorage.getItem("token");
  axios
    .get("http://localhost:5000/api/employees", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setEmployees(res.data.employees))
    .catch((err) => console.error(err));
}, []);


  // Update salary automatically if employee changes
  useEffect(() => {
    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        salary: selectedEmployee.salary || 0,
        allowance: 0,
        deduction: 0,
        total: selectedEmployee.salary || 0,
      }));
    }
  }, [selectedEmployee]);

  // Update total when salary/allowance/deduction changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value) || 0;

    setFormData((prev) => {
      const newData = { ...prev, [name]: val };
      newData.total = newData.salary + newData.allowance - newData.deduction;
      return newData;
    });
  };

  const handleEmployeeSelect = (e) => {
    const emp = employees.find((emp) => emp._id === e.target.value);
    setSelectedEmployee(emp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      alert("Select an employee first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://localhost:5000/api/paysalary", {
        employeeId: selectedEmployee._id,
        salary: formData.salary,
        allowance: formData.allowance,
        deduction: formData.deduction,
        total: formData.total,
        payDate: formData.payDate,
      });

      setMessage("Salary sent successfully!");
      setFormData({
        salary: 0,
        allowance: 0,
        deduction: 0,
        total: 0,
        payDate: new Date().toISOString().split("T")[0],
      });
      setSelectedEmployee(null);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send salary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Pay Employee</h2>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Select Employee</label>
          <select value={selectedEmployee?._id || ""} onChange={handleEmployeeSelect}>
  <option value="">-- Select Employee --</option>
  {employees.map((emp) => (
    <option key={emp._id} value={emp._id}>
      {emp.name} ({emp.employeeId})
    </option>
  ))}
</select>

        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Salary (₹)</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Allowance (₹)</label>
          <input
            type="number"
            name="allowance"
            value={formData.allowance}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Deduction (₹)</label>
          <input
            type="number"
            name="deduction"
            value={formData.deduction}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Total (₹)</label>
          <input
            type="number"
            value={formData.total}
            readOnly
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Pay Date</label>
          <input
            type="date"
            name="payDate"
            value={formData.payDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, payDate: e.target.value }))
            }
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Salary"}
        </button>
      </form>
    </div>
  );
};

export default PaySalaryPage;
