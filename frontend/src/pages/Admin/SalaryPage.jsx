import React, { useEffect, useState } from "react";
import axios from "axios";

const SalaryPage = () => {
  const [salaries, setSalaries] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filteredSalaries, setFilteredSalaries] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/salaries")
      .then((res) => {
        setSalaries(res.data);
        setFilteredSalaries(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = () => {
    if (!searchId.trim()) {
      setFilteredSalaries(salaries);
    } else {
      setFilteredSalaries(
        salaries.filter((s) =>
          s.employeeId.toLowerCase().includes(searchId.toLowerCase())
        )
      );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Salary History</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Employee ID"
          className="border p-2 rounded w-64"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">S.No</th>
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Salary</th>
            <th className="border p-2">Allowance</th>
            <th className="border p-2">Deduction</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Pay Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredSalaries.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{item.employeeId}</td>
              <td className="border p-2">₹{item.salary.toLocaleString()}</td>
              <td className="border p-2">₹{item.allowance.toLocaleString()}</td>
              <td className="border p-2">₹{item.deduction.toLocaleString()}</td>
              <td className="border p-2">₹{item.total.toLocaleString()}</td>
              <td className="border p-2">{item.payDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalaryPage;
