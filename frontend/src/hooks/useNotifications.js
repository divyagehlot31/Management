// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from API (you can implement this endpoint later)
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // For now, using mock data. Replace with actual API call later
      const mockNotifications = [
        {
          id: 1,
          type: "leave",
          title: "Leave Application Update",
          message: "Your casual leave for Dec 15-16 has been approved",
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          priority: "high"
        },
        {
          id: 2,
          type: "system",
          title: "System Maintenance",
          message: "System will be under maintenance on Sunday 2-4 AM",
          time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: false,
          priority: "medium"
        },
        {
          id: 3,
          type: "reminder",
          title: "Profile Update Reminder",
          message: "Please update your emergency contact information",
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          read: true,
          priority: "low"
        },
        {
          id: 4,
          type: "leave",
          title: "Leave Balance Alert",
          message: "You have 5 casual leaves remaining for this year",
          time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          read: true,
          priority: "low"
        }
      ];

      setNotifications(mockNotifications);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // TODO: Call API to mark as read
    // markNotificationAsRead(id);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // TODO: Call API to mark all as read
    // markAllNotificationsAsRead();
  };

  // Clear/delete notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // TODO: Call API to delete notification
    // deleteNotification(id);
  };

  // Add new notification (for real-time updates)
  const addNotification = (newNotification) => {
    const notification = {
      ...newNotification,
      id: Date.now(), // Simple ID generation
      time: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  // Format time for display
  const formatTime = (timeString) => {
    const now = new Date();
    const notificationTime = new Date(timeString);
    const diffMs = now - notificationTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  // Initialize notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    addNotification,
    formatTime,
    getNotificationsByType,
    refetch: fetchNotifications
  };
};

// API functions (implement these when you create the notification endpoints)
const markNotificationAsRead = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`/api/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put('/api/notifications/mark-all-read', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

const deleteNotification = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};