// src/components/notifications/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../../redux/slices/notificationSlice';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    const iconMap = {
      new_user: '👤',
      new_election: '🗳️',
      new_vote: '✓',
      new_subscription: '💳',
      vote_payment: '💰',
      election_status: '📊',
      wallet_transaction: '💵',
      system: '🔔',
    };
    return iconMap[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      new_user: 'bg-blue-50 border-blue-200',
      new_election: 'bg-purple-50 border-purple-200',
      new_vote: 'bg-green-50 border-green-200',
      new_subscription: 'bg-indigo-50 border-indigo-200',
      vote_payment: 'bg-yellow-50 border-yellow-200',
      election_status: 'bg-orange-50 border-orange-200',
      wallet_transaction: 'bg-emerald-50 border-emerald-200',
      system: 'bg-gray-50 border-gray-200',
    };
    return colorMap[type] || 'bg-gray-50 border-gray-200';
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    // Navigate to relevant page
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    dispatch(deleteNotification(notificationId));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell size={24} className={unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      px-4 py-3 cursor-pointer transition-all duration-200
                      ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}
                      ${notification.link ? 'cursor-pointer' : 'cursor-default'}
                      group
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl
                        ${getNotificationColor(notification.type)}
                        border
                      `}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`
                            text-sm font-medium leading-tight
                            ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}
                          `}>
                            {notification.title}
                          </p>
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {notification.message && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          
                          {!notification.read && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-center text-gray-500">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}