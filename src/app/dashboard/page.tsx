'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
  Plus,
  Clock,
  Lightbulb,
  Target,
  MessageCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileBarChart,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  postsCreated: number;
  postsPublished: number;
  scheduledCount: number;
  reach: number;
  engagement: number;
}

interface UpcomingItem {
  id: string;
  platform: string;
  platformLetter: string;
  platformColor: string;
  title: string;
  date: Date;
}

interface ActivityItemData {
  id: string;
  type: string;
  text: string;
  time: string;
}

const ACTIVITY_META: Record<string, { icon: React.ReactNode; iconBg: string }> = {
  approval_required: { icon: <ShieldAlert className="w-4 h-4 text-white" />, iconBg: 'bg-orange-500' },
  publish_success: { icon: <CheckCircle2 className="w-4 h-4 text-white" />, iconBg: 'bg-green-500' },
  publish_failure: { icon: <XCircle className="w-4 h-4 text-white" />, iconBg: 'bg-red-500' },
  schedule_reminder: { icon: <Clock className="w-4 h-4 text-white" />, iconBg: 'bg-blue-500' },
  weekly_report: { icon: <FileBarChart className="w-4 h-4 text-white" />, iconBg: 'bg-purple-500' },
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('there');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [activity, setActivity] = useState<ActivityItemData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setAccessToken(session.access_token);

      const { data: brand } = await supabase
        .from('brands')
        .select('id, company_name')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle();

      if (brand) {
        setBrandId(brand.id);
        setBrandName(brand.company_name);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const loadDashboardData = useCallback(async () => {
    if (!brandId || !accessToken) return;
    setDataLoading(true);
    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      const [libraryRes, scheduleRes, analyticsRes, notifRes] = await Promise.all([
        fetch(`/api/content/library?brandId=${brandId}&limit=1`, { headers }),
        fetch(`/api/posts/schedule?brandId=${brandId}`, { headers }),
        fetch(`/api/analytics?brandId=${brandId}`, { headers }),
        fetch(`/api/notifications`, { headers }),
      ]);

      const [library, schedule, analytics, notifications] = await Promise.all([
        libraryRes.json(),
        scheduleRes.json(),
        analyticsRes.json(),
        notifRes.json(),
      ]);

      const pendingSchedule = schedule.success
        ? schedule.data.items.filter((i: { status: string }) => i.status === 'pending')
        : [];

      setStats({
        postsCreated: library.success ? library.data.total : 0,
        postsPublished: analytics.success ? analytics.data.postsPublished : 0,
        scheduledCount: pendingSchedule.length,
        reach: analytics.success ? analytics.data.totals.reach : 0,
        engagement: analytics.success ? analytics.data.totals.engagement : 0,
      });

      interface ScheduleItem {
        id: string;
        scheduled_at: string;
        content_drafts: { linkedin_content: string | null; facebook_content: string | null; instagram_content: string | null };
      }
      const platformMap: Record<string, { letter: string; color: string }> = {
        linkedin_content: { letter: 'in', color: 'bg-[#0077B5]' },
        facebook_content: { letter: 'f', color: 'bg-[#1877F2]' },
        instagram_content: { letter: 'ig', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
      };
      const upcomingFlat: UpcomingItem[] = (pendingSchedule as ScheduleItem[])
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 3)
        .flatMap((item) =>
          Object.entries(platformMap)
            .filter(([key]) => item.content_drafts?.[key as keyof ScheduleItem['content_drafts']])
            .map(([key, meta]) => ({
              id: item.id,
              platform: key,
              platformLetter: meta.letter,
              platformColor: meta.color,
              title: (item.content_drafts[key as keyof ScheduleItem['content_drafts']] as string).slice(0, 60) + '...',
              date: new Date(item.scheduled_at),
            }))
        );
      setUpcoming(upcomingFlat);

      if (notifications.success) {
        interface NotifItem { id: string; type: string; title: string; created_at: string }
        setActivity(
          (notifications.data.items as NotifItem[]).slice(0, 4).map((n) => ({
            id: n.id,
            type: n.type,
            text: n.title,
            time: timeAgo(n.created_at),
          }))
        );
      }
    } finally {
      setDataLoading(false);
    }
  }, [brandId, accessToken]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ece5dd] flex items-center justify-center">
        <div className="text-[#075E54] font-bold text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#075E54]">Ripple</span>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" href="/dashboard" active />
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
          <SidebarLink icon={<Bell />} label="Notifications" href="/notifications" />
          <SidebarLink icon={<CreditCard />} label="Billing" href="/billing" />
          <SidebarLink icon={<Settings />} label="Settings" href="#" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium group cursor-pointer border-0 text-left"
          >
            <div className="text-gray-400 group-hover:text-red-500 [&>svg]:w-5 [&>svg]:h-5 transition-colors">
              <LogOut />
            </div>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#075E54]">Good morning, {brandName}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your social channels today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="p-2 text-gray-500 hover:text-[#075E54] bg-white rounded-full shadow-sm hover:shadow transition-all">
              <Bell className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-[#25D366] to-[#075E54]"></div>
            </div>
          </div>
        </header>

        {!brandId && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
            No brand found for your account yet. Complete the onboarding wizard first.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard label="Posts Created" value={dataLoading ? '...' : String(stats?.postsCreated ?? 0)} />
          <StatCard label="Posts Published" value={dataLoading ? '...' : String(stats?.postsPublished ?? 0)} />
          <StatCard label="Scheduled Posts" value={dataLoading ? '...' : String(stats?.scheduledCount ?? 0)} />
          <StatCard label="Engagement" value={dataLoading ? '...' : (stats?.engagement ?? 0).toLocaleString()} />
          <StatCard label="Reach" value={dataLoading ? '...' : (stats?.reach ?? 0).toLocaleString()} />
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold text-[#075E54] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionLink icon={<Plus />} title="Create Post" desc="Draft a new social post" color="bg-[#25D366]" href="/ai-studio" />
            <ActionLink icon={<Clock />} title="Schedule Post" desc="Plan content for later" color="bg-[#128C7E]" href="/content-library" />
            <ActionLink icon={<Lightbulb />} title="Generate Ideas" desc="Brainstorm with AI" color="bg-blue-500" href="/ai-studio" />
            <ActionLink icon={<Target />} title="Generate Campaign" desc="Coming in Phase 2" color="bg-purple-300" href="#" disabled />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#075E54]">Upcoming Posts</h2>
              <Link href="/scheduling" className="text-sm font-semibold text-[#128C7E] hover:text-[#075E54]">View Calendar</Link>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No upcoming scheduled posts.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((item) => (
                  <UpcomingPostItem
                    key={`${item.id}-${item.platform}`}
                    platform={item.platformLetter}
                    platformColor={item.platformColor}
                    title={item.title}
                    time={item.date.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-[#075E54] mb-6">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent activity yet.</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {activity.map((a) => {
                  const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.approval_required;
                  return <ActivityItem key={a.id} icon={meta.icon} iconBg={meta.iconBg} text={a.text} time={a.time} />;
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        active ? 'bg-[#25D366]/10 text-[#075E54] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
      }`}
    >
      <div className={`${active ? 'text-[#25D366]' : 'text-gray-400 group-hover:text-gray-600'} [&>svg]:w-5 [&>svg]:h-5`}>{icon}</div>
      {label}
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
      <h3 className="text-2xl font-extrabold text-gray-800">{value}</h3>
    </div>
  );
}

function ActionLink({ icon, title, desc, color, href, disabled = false }: { icon: React.ReactNode; title: string; desc: string; color: string; href: string; disabled?: boolean }) {
  const content = (
    <div className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-1'} transition-all text-left flex items-start gap-4 group`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-sm ${!disabled && 'group-hover:scale-110'} transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 group-hover:text-[#075E54] transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
  if (disabled) return <div>{content}</div>;
  return <Link href={href}>{content}</Link>;
}

function UpcomingPostItem({ platform, platformColor, title, time }: { platform: string; platformColor: string; title: string; time: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${platformColor}`}>{platform}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">{title}</h4>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function ActivityItem({ icon, iconBg, text, time }: { icon: React.ReactNode; iconBg: string; text: string; time: string }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${iconBg}`}>
        {icon}
      </div>
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <time className="text-xs font-medium text-[#128C7E]">{time}</time>
        </div>
        <div className="text-sm font-medium text-gray-700">{text}</div>
      </div>
    </div>
  );
}
