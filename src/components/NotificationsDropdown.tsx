import React, { useState } from 'react';
import { Bell, CheckCheck, ShieldAlert, Calendar, FileCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../types';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
    navigate(notif.targetUrl);
    onClose();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'risk':
        return <ShieldAlert className="w-4 h-4 text-[#9A4F45]" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-[#A4773C]" />;
      case 'compliance':
        return <FileCheck className="w-4 h-4 text-[#58745A]" />;
      default:
        return <Bell className="w-4 h-4 text-[#8B7355]" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg overflow-hidden text-[#242321] fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4DED4] bg-[#FAF8F5]">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm text-[#242321]">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold bg-[#8B7355] text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-medium text-[#8B7355] hover:text-[#5F4B35] flex items-center gap-1 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-[#9A948A] hover:text-[#242321]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#E4DED4]/60 p-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3 rounded-xl cursor-pointer hover:bg-[#F1EDE5] transition flex items-start gap-3 ${
                !notif.read ? 'bg-[#FAF8F5]' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-[#E8E0D2]/50 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-[#242321]' : 'text-[#6F6A62]'}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-[#9A948A] shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#6F6A62] line-clamp-2 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-[#9A948A]">No notifications available.</div>
        )}
      </div>
    </div>
  );
};
