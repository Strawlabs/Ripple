'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Library,
  BrainCircuit,
  Share2,
  Calendar,
  LineChart,
  Sparkles,
  Megaphone,
  Bell,
  CreditCard,
  Settings,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileBarChart,
  ShieldAlert,
  Check,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type NotifType = 'approval_required' | 'publish_success' | 'publish_failure' | 'schedule_reminder' | 'weekly_report';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TYPE_META: Record<NotifType, { icon: React.ReactNode; iconBg: string; label: string }> = {
  approval_required: { icon: <ShieldAlert className="w-5 h-5 text-orange-600" />, iconBg: 'bg-orange-100', label: 'Approval Required' },
  publish_success: { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, iconBg: 'bg-green-100', label: 'Publish Success' },
  publish_failure: { icon: <XCircle className="w-5 h-5 text-red-600" />, iconBg: 'bg-red-100', label: 'Publish Failure' },
  schedule_reminder: { icon: <Clock className="w-5 h-5 text-blue-600" />, iconBg: 'bg-blue-100', label: 'Schedule Reminder' },
  weekly_report: { icon: <FileBarChart className="w-5 h-5 text-purple-600" />, iconBg: 'bg-purple-100', label: 'Weekly Report' },
};

type Filter = 'all' | 'unread' | NotifType;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function NotificationsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (token: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setNotifications(json.data.items);
      else setError(json.error?.message ?? 'Could not load notifications');
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setLoading(false);
        return;
      }
      setAccessToken(session.access_token);
      fetchNotifications(session.access_token);
    }
    init();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    if (!accessToken) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  const markAllRead = async () => {
    if (!accessToken) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setMarkingAll(true);
    await Promise.all(
      unread.map((n) =>
        fetch(`/api/notifications/${n.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      )
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-10">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#075E54]">Ripple</span>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" href="/dashboard" />
          <SidebarLink icon={<MessageSquare />} label="Conversations" href="#" />
          <SidebarLink icon={<Library />} label="Content Library" href="/content-library" />
          <SidebarLink icon={<BrainCircuit />} label="Brand Memory" href="/brand-memory" />
          <SidebarLink icon={<Share2 />} label="Social Accounts" href="/social-accounts" />
          <SidebarLink icon={<Calendar />} label="Scheduling" href="/scheduling" />
          <SidebarLink icon={<LineChart />} label="Analytics" href="/analytics" />

          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Advanced</p>
          </div>
          <SidebarLink icon={<Sparkles />} label="AI Studio" href="/ai-studio" />
          <SidebarLink icon={<Megaphone />} label="Campaigns" href="#" />

          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Settings</p>
          </div>
          <SidebarLink icon={<Bell />} label="Notifications" href="/notifications" active />
          <SidebarLink icon={<CreditCard />} label="Billing" href="/billing" />
          <SidebarLink icon={<Settings />} label="Settings" href="#" />
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#075E54]">Notifications</h1>
              <p className="text-gray-600 mt-1">Stay updated on your approvals, publishing status, and alerts.</p>
            </div>

            <button
              onClick={markAllRead}
              disabled={markingAll || unreadCount === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm text-sm font-semibold transition-colors w-full md:w-auto disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Mark all as read
            </button>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
            <FilterTab label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterTab label="Unread" active={filter === 'unread'} onClick={() => setFilter('unread')} count={unreadCount} />
            <FilterTab label="Approval Required" active={filter === 'approval_required'} onClick={() => setFilter('approval_required')} />
            <FilterTab label="Weekly Report" active={filter === 'weekly_report'} onClick={() => setFilter('weekly_report')} />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
              No notifications here.
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col divide-y divide-gray-50">
              {filtered.map((notif) => {
                const meta = TYPE_META[notif.type];
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markRead(notif.id)}
                    className={`p-5 lg:p-6 transition-colors hover:bg-gray-50 flex flex-col sm:flex-row gap-4 sm:gap-6 cursor-pointer ${
                      !notif.read ? 'bg-green-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start shrink-0 relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white shadow-sm ${meta.iconBg}`}>
                        {meta.icon}
                      </div>
                      {!notif.read && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1.5">
                        <h3 className={`text-base text-gray-900 ${!notif.read ? 'font-bold' : 'font-semibold'}`}>{notif.title}</h3>
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap shrink-0">{timeAgo(notif.created_at)}</span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!notif.read ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{notif.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        active ? 'bg-[#25D366]/10 text-[#075E54] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
      }`}
    >
      <div className={`${active ? 'text-[#25D366]' : 'text-gray-400 group-hover:text-gray-600'} [&>svg]:w-5 [&>svg]:h-5`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}

function FilterTab({ label, active = false, count, onClick }: { label: string; active?: boolean; count?: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        active ? 'bg-[#075E54] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
