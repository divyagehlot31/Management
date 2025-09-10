import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import { useAuth } from "../../context/authContext";
import { Calendar, Clock, AlertCircle, CheckCircle, MessageCircle, Send, X } from "lucide-react";

const EmployeeTask = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");

  // Task statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await API.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
        params: statusFilter ? { status: statusFilter } : {}
      });

      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/tasks/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching task stats:", error);
    }
  };

  const handleTaskClick = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedTask(response.data.task);
        setSubmissionNote(response.data.task.submissionNote || "");
        setShowTaskModal(true);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      setError("Failed to load task details");
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const updateData = { status: newStatus };
      
      if (newStatus === "completed" && submissionNote) {
        updateData.submissionNote = submissionNote;
      }

      const response = await API.put(`/tasks/${taskId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(`Task status updated to ${newStatus.replace('_', ' ')}`);
        fetchTasks();
        fetchTaskStats();
        setSelectedTask(response.data.task);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await API.post(`/tasks/${selectedTask._id}/comments`, {
        message: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess("Comment added successfully");
        setSelectedTask(response.data.task);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const isOverdue = (dueDate, status) => {
    return status !== "completed" && new Date(dueDate) < new Date();
  };

  const filteredTasks = statusFilter ? 
    tasks.filter(task => task.status === statusFilter) : 
    tasks;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")}><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess("")}><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Tasks</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">Pending</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">In Progress</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats.in_progress}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Completed</h3>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div 
            key={task._id} 
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
              isOverdue(task.dueDate, task.status) ? 'border-l-4 border-red-500' : ''
            }`}
            onClick={() => handleTaskClick(task._id)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
              </span>
              
              {task.category && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {task.category}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
              
              <div className="text-gray-400 text-xs">
                by {task.assignedBy.name}
              </div>
            </div>
            
            {isOverdue(task.dueDate, task.status) && (
              <div className="mt-2 text-red-600 text-xs font-medium">
                Overdue
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No tasks found</div>
          <div className="text-gray-400 text-sm mt-1">
            {statusFilter ? `No ${statusFilter.replace('_', ' ')} tasks` : "You don't have any tasks assigned yet"}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                <p className="text-gray-600 mt-1">Assigned by {selectedTask.assignedBy.name}</p>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Task Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Priority</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Due Date</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className={isOverdue(selectedTask.dueDate, selectedTask.status) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {formatDate(selectedTask.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedTask.category && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
                    <span className="text-gray-600">{selectedTask.category}</span>
                  </div>
                )}

                {/* Task Status Update */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Current Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)}
                    <span className="ml-1 capitalize">{selectedTask.status.replace('_', ' ')}</span>
                  </span>
                  
                  <div className="flex gap-2 flex-wrap">
                    {selectedTask.status === "pending" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedTask._id, "in_progress")}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Start Working
                      </button>
                    )}
                    {selectedTask.status === "in_progress" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedTask._id, "completed")}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Submission Note for Completed Tasks */}
                {(selectedTask.status === "in_progress" || selectedTask.status === "completed") && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Submission Note</h3>
                    <textarea
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      placeholder="Add a note about your work completion..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      rows="3"
                      disabled={selectedTask.status === "completed"}
                    />
                    {selectedTask.status === "in_progress" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedTask._id, selectedTask.status)}
                        className="mt-2 px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                      >
                        Update Note
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Comments */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comments ({selectedTask.comments?.length || 0})
                </h3>
                
                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map((comment, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-900">{comment.user.name}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                  )}
                </div>
                
                {/* Add Comment */}
                <div className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows="2"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 disabled:bg-gray-300"
                  >
                    <Send className="h-3 w-3" />
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTask;