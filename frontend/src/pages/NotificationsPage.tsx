import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, ArrowRight, Clock, Trash2, Check } from 'lucide-react';
import { api } from '../api/client';
import { Notification } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      if (link) navigate(link);
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => !n.is_read);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated on application progress, interview schedules, and match alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'unread' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Unread ({notifications.filter((n) => !n.is_read).length})
            </button>
          </div>

          <Button onClick={handleMarkAllRead} variant="outline" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No notifications to display.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id, item.link)}
              className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                !item.is_read ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  !item.is_read ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-bold ${!item.is_read ? 'text-indigo-950 font-bold' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                    <Badge variant={item.type === 'interview' ? 'amber' : item.type === 'match' ? 'emerald' : 'indigo'} size="sm">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {item.link && (
                <div className="shrink-0 self-center">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
