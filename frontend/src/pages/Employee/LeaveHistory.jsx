// src/pages/employee/LeaveHistory.jsx
import React, { useState, useEffect } from "react";
// import axios from "axios";
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import API from "../../utils/api";

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/leaves/my-leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch leave history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLeaveType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1");
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === "all") return true;
    return leave.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Calendar className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Leave History</h2>
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Leaves</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Leaves</p>
              <p className="text-2xl font-bold text-gray-900">{leaves.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaves List */}
      <div className="bg-white rounded-lg shadow">
        {filteredLeaves.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leave applications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeaves.map((leave) => (
              <div key={leave._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(leave.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatLeaveType(leave.leaveType)} Leave
                      </h3>
                      <p className="text-sm text-gray-600">
                        Applied on {formatDate(leave.appliedDate)}
                      </p>
                    </div>
                  </div>
                  <span className={getStatusBadge(leave.status)}>
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Duration</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({leave.totalDays} day{leave.totalDays > 1 ? 's' : ''})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reason</p>
                    <p className="text-sm text-gray-600">{leave.reason}</p>
                  </div>
                  {leave.reviewedBy && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reviewed By</p>
                      <p className="text-sm text-gray-600">{leave.reviewedBy.name}</p>
                      <p className="text-sm text-gray-600">
                        on {formatDate(leave.reviewedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {leave.adminComments && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Admin Comments</p>
                        <p className="text-sm text-gray-600">{leave.adminComments}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveHistory;