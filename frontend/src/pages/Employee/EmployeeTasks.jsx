import React, { useState, useEffect } from "react";
// import axios from "axios";
import API from "../../utils/api";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [commentText, setCommentText] = useState({});
  const [submissionNote, setSubmissionNote] = useState({});
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // JWT token

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await API.get(`/api/tasks${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  // Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(task => task._id === taskId ? res.data.task : task));
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    }
  };

  // Add comment
  const handleAddComment = async (taskId) => {
    if (!commentText[taskId] || commentText[taskId].trim() === "") return;
    try {
      const res = await API.post(`/api/tasks/${taskId}/comments`, { message: commentText[taskId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(task => task._id === taskId ? res.data.task : task));
      setCommentText({ ...commentText, [taskId]: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to add comment");
    }
  };

  // Submit note
  const handleSubmissionNote = async (taskId) => {
    if (!submissionNote[taskId] || submissionNote[taskId].trim() === "") return;
    try {
      const res = await API.put(`/api/tasks/${taskId}`, { submissionNote: submissionNote[taskId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(task => task._id === taskId ? res.data.task : task));
      setSubmissionNote({ ...submissionNote, [taskId]: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to submit note");
    }
  };

  // Upload submission file
  const handleFileUpload = async (taskId) => {
    if (!submissionFiles[taskId] || submissionFiles[taskId].length === 0) return;
    try {
      const formData = new FormData();
      Array.from(submissionFiles[taskId]).forEach(file => {
        formData.append("files", file);
      });

      const res = await API.put(`/api/tasks/${taskId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setTasks(tasks.map(task => task._id === taskId ? res.data.task : task));
      setSubmissionFiles({ ...submissionFiles, [taskId]: null });
    } catch (err) {
      console.error(err);
      setError("Failed to upload file");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Status Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="space-y-4">
          {tasks.length === 0 && <p>No tasks assigned</p>}

          {tasks.map(task => (
            <div key={task._id} className="border p-4 rounded shadow-md bg-white">
              <h2 className="text-lg font-bold">{task.title}</h2>
              <p className="text-gray-600">{task.description}</p>
              <p className="mt-1"><strong>Priority:</strong> {task.priority}</p>
              <p>
                <strong>Status:</strong>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="ml-2 border p-1 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </p>
              <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>

              {/* Submission Note */}
              <div className="mt-2">
                <textarea
                  placeholder="Add submission note..."
                  value={submissionNote[task._id] || ""}
                  onChange={(e) => setSubmissionNote({ ...submissionNote, [task._id]: e.target.value })}
                  className="w-full border p-2 rounded"
                />
                <button
                  onClick={() => handleSubmissionNote(task._id)}
                  className="mt-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Submit Note
                </button>
              </div>

              {/* Submission Files */}
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSubmissionFiles({ ...submissionFiles, [task._id]: e.target.files })}
                  className="border p-1 rounded"
                />
                <button
                  onClick={() => handleFileUpload(task._id)}
                  className="ml-2 bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                >
                  Upload File
                </button>

                {/* Show uploaded files */}
                {task.submissionFiles?.length > 0 && (
                  <ul className="mt-1 list-disc list-inside">
                    {task.submissionFiles.map(f => (
                      <li key={f._id}>
                        <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {f.originalName}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Comments */}
              <div className="mt-2">
                <h3 className="font-semibold">Comments:</h3>
                <div className="space-y-1">
                  {task.comments.map(c => (
                    <p key={c._id}><strong>{c.user?.name}:</strong> {c.message}</p>
                  ))}
                </div>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={commentText[task._id] || ""}
                    onChange={(e) => setCommentText({ ...commentText, [task._id]: e.target.value })}
                    className="border p-1 rounded flex-1"
                  />
                  <button
                    onClick={() => handleAddComment(task._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
