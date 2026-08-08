'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Library,
  BrainCircuit,
  Share2,
  Calendar as CalendarIcon,
  LineChart,
  Sparkles,
  Megaphone,
  Bell,
  CreditCard,
  Settings,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ScheduledPost {
  id: string;
  draft_id: string;
  scheduled_at: string;
  status: string;
  content_drafts: {
    linkedin_content: string | null;
    facebook_content: string | null;
    instagram_content: string | null;
  };
}

interface DisplayPost {
  id: string;
  date: Date;
  platform: string;
  platformLetter: string;
  platformColor: string;
  caption: string;
}

const PLATFORM_STYLE: Record<string, { label: string; color: string }> = {
  linkedin_content: { label: 'LinkedIn', color: 'bg-[#0077B5]' },
  facebook_content: { label: 'Facebook', color: 'bg-[#1877F2]' },
  instagram_content: { label: 'Instagram', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
};

export default function SchedulingPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);

  const [viewedMonth, setViewedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<DisplayPost | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadSessionAndBrand() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        setLoadingBrand(false);
        return;
      }
      setAccessToken(session.access_token);

      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle();

      if (brand) setBrandId(brand.id);
      setLoadingBrand(false);
    }
    loadSessionAndBrand();
  }, []);

  const fetchSchedule = useCallback(async () => {
    if (!brandId || !accessToken) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/posts/schedule?brandId=${brandId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? 'Could not load scheduled posts');
        setLoading(false);
        return;
      }

      const flattened: DisplayPost[] = (json.data.items as ScheduledPost[]).flatMap((item) =>
        Object.entries(PLATFORM_STYLE)
          .filter(([key]) => item.content_drafts?.[key as keyof ScheduledPost['content_drafts']])
          .map(([key, style]) => ({
            id: item.id,
            date: new Date(item.scheduled_at),
            platform: style.label,
            platformLetter: style.label[0],
            platformColor: style.color,
            caption: item.content_drafts[key as keyof ScheduledPost['content_drafts']] as string,
          }))
      );
      setPosts(flattened);
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }, [brandId, accessToken]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleCancel = async () => {
    if (!selectedPost || !accessToken) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/posts/schedule/${selectedPost.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setSelectedPost(null);
        fetchSchedule();
      } else {
        setError(json.error?.message ?? 'Could not cancel');
      }
    } finally {
      setCancelling(false);
    }
  };

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getPostsForDay = (day: number) =>
    posts.filter(
      (p) => p.date.getFullYear() === year && p.date.getMonth() === month && p.date.getDate() === day
    );

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen shrink-0 relative z-20">
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
          <SidebarLink icon={<CalendarIcon />} label="Scheduling" href="/scheduling" active />
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
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#075E54]">Scheduling Center</h1>
              <p className="text-gray-600 mt-1">Plan, schedule, and review your upcoming content.</p>
            </div>

            <Link
              href="/content-library"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl shadow-sm font-bold transition-colors"
            >
              Schedule from Library
            </Link>
          </header>

          {!loadingBrand && !brandId && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
              No brand found for your account yet. Complete the onboarding wizard first.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between bg-white p-4 rounded-t-3xl border-x border-t border-gray-200 shadow-sm mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewedMonth(new Date(year, month - 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 w-48 text-center">{monthLabel}</h2>
              <button
                onClick={() => setViewedMonth(new Date(year, month + 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setViewedMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              className="px-4 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="bg-white border-x border-b border-gray-200 rounded-b-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px">
                {Array.from({ length: 42 }).map((_, i) => {
                  const dayNum = i - firstDayOfMonth + 1;
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                  const dayPosts = isCurrentMonth ? getPostsForDay(dayNum) : [];

                  return (
                    <div key={i} className={`min-h-[120px] bg-white p-2 flex flex-col ${isCurrentMonth ? '' : 'bg-gray-50/50'}`}>
                      <span className={`text-sm font-semibold mb-2 ml-1 ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                        {isCurrentMonth ? dayNum : ''}
                      </span>

                      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">
                        {dayPosts.map((post) => (
                          <button
                            key={`${post.id}-${post.platform}`}
                            onClick={() => setSelectedPost(post)}
                            className={`text-left p-2 rounded-lg border border-gray-100 hover:shadow-md transition-all group ${
                              selectedPost?.id === post.id ? 'ring-2 ring-[#25D366] bg-green-50' : 'bg-white shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold ${post.platformColor}`}>
                                {post.platformLetter}
                              </div>
                              <span className="text-xs font-bold text-gray-500">
                                {post.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-800 line-clamp-2 font-medium leading-relaxed group-hover:text-[#075E54]">
                              {post.caption}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {selectedPost && (
          <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-gray-200 z-30 flex flex-col transform transition-transform duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#128C7E]" />
                Scheduled Post
              </h3>
              <button onClick={() => setSelectedPost(null)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${selectedPost.platformColor}`}>
                  {selectedPost.platformLetter}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{selectedPost.platform}</h4>
                  <p className="text-sm font-medium text-[#128C7E]">
                    {selectedPost.date.toLocaleDateString()} • {selectedPost.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content</h5>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-2">
              <Link
                href="/content-library"
                className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-gray-50 rounded-xl text-gray-600 hover:text-[#075E54] transition-colors border border-transparent hover:border-gray-200"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="text-xs font-semibold">View in Library</span>
              </Link>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="text-xs font-semibold">Cancel</span>
              </button>
            </div>
          </div>
        )}
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
