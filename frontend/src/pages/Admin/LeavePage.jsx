// src/pages/admin/LeaveManagement.jsx
import React, { useState, useEffect } from "react";
// import axios from "axios";
import API from "../../utils/api"

import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  User, 
  MessageSquare,
  Filter,
  Eye
} from "lucide-react";

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminComments, setAdminComments] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = filter === "all" 
              ? "/leaves/all"
        : `/leaves/all?status=${filter}`;
        // ? "http://localhost:5000/api/leaves/all"
        // : `http://localhost:5000/api/leaves/all?status=${filter}`;
      
      const res = await API.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
            const res = await API.put(`/leaves/update/${leaveId}`,
              
      // const res = await axios.put(`http://localhost:5000/api/leaves/update/${leaveId}`,
        {
          status,
          adminComments: adminComments.trim() || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        // Update the leave in the list
        setLeaves(prevLeaves =>
          prevLeaves.map(leave =>
            leave._id === leaveId
              ? { ...leave, status, adminComments: adminComments.trim(), reviewedAt: new Date() }
              : leave
          )
        );
        setShowModal(false);
        setSelectedLeave(null);
        setAdminComments("");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update leave status");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (leave) => {
    setSelectedLeave(leave);
    setAdminComments("");
    setShowModal(true);
    setError(null);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
          <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
        {leaves.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leave applications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <div key={leave._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(leave.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatLeaveType(leave.leaveType)} Leave
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{leave.employee?.name}</span>
                        </span>
                        <span>ID: {leave.employee?.employeeId}</span>
                        <span>Applied: {formatDate(leave.appliedDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(leave.status)}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                    {leave.status === 'pending' && (
                      <button
                        onClick={() => openModal(leave)}
                        className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                    <p className="text-sm font-medium text-gray-700">Employee Email</p>
                    <p className="text-sm text-gray-600">{leave.employee?.email}</p>
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

      {/* Review Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Review Leave Application
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Employee Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedLeave.employee?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="ml-2 font-medium">{selectedLeave.employee?.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedLeave.employee?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2 font-medium">
                      {selectedLeave.user?.department?.id || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Leave Type:</span>
                  <span className="ml-2">{formatLeaveType(selectedLeave.leaveType)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <span className="ml-2">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                    ({selectedLeave.totalDays} day{selectedLeave.totalDays > 1 ? 's' : ''})
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Applied Date:</span>
                  <span className="ml-2">{formatDate(selectedLeave.appliedDate)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Reason:</span>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedLeave.reason}</p>
                </div>
              </div>

              {/* Admin Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Comments (Optional)
                </label>
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows={3}
                  placeholder="Add any comments for the employee..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLeaveAction(selectedLeave._id, 'rejected')}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>{actionLoading ? 'Processing...' : 'Reject'}</span>
              </button>
              <button
                onClick={() => handleLeaveAction(selectedLeave._id, 'approved')}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{actionLoading ? 'Processing...' : 'Approve'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePage;