import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Sparkles, Check, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Notification } from '../../types';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, loginAsDemoCandidate, loginAsDemoAdmin, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (e) {
      // Not logged in or network error
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        setIsNotifOpen(false);
        navigate(link);
      }
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {user?.role === 'admin' ? 'Admin Mode' : 'Candidate Workspace'}
          </span>
          <span className="text-xs text-slate-400 hidden md:inline-block">•</span>
          <span className="text-xs text-slate-500 font-medium hidden md:inline-block">
            {user?.target_role || 'CareerMatch AI'}
          </span>
        </div>
      </div>

      {/* Right side: Demo switchers, notifications, profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
          <span className="text-slate-400 px-1 font-medium">Demo:</span>
          <button
            onClick={loginAsDemoCandidate}
            className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
              user?.email === 'alex@careermatch.ai'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Candidate (Alex)
          </button>
          <button
            onClick={loginAsDemoAdmin}
            className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
              user?.role === 'admin'
                ? 'bg-white text-violet-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin (Director)
          </button>
        </div>

        {/* Notifications dropdown button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Modal / Menu */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id, n.link)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.is_read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-medium ${!n.is_read ? 'text-indigo-950 font-semibold' : 'text-slate-800'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                <button
                  onClick={() => { setIsNotifOpen(false); navigate('/dashboard/notifications'); }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  View Notification Center <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center gap-2 pl-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-indigo-300 transition-all">
            {user?.full_name ? user.full_name.charAt(0) : 'A'}
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
            {user?.full_name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
