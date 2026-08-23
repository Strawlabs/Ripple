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
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type StatusFilter = 'all' | 'draft' | 'approved' | 'rejected';

interface DraftRow {
  id: string;
  linkedin_content: string | null;
  facebook_content: string | null;
  instagram_content: string | null;
  status: string;
  created_at: string;
}

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  linkedin_content: { label: 'LinkedIn', color: 'bg-[#0077B5]' },
  facebook_content: { label: 'Facebook', color: 'bg-[#1877F2]' },
  instagram_content: { label: 'Instagram', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
};

export default function ContentLibraryPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

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

  const fetchLibrary = useCallback(async () => {
    if (!brandId || !accessToken) return;
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ brandId, limit: '30' });
    if (filter !== 'all') params.set('status', filter);
    if (search.trim()) params.set('search', search.trim());

    try {
      const res = await fetch(`/api/content/library?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setDrafts(json.data.items);
        setTotal(json.data.total);
      } else {
        setError(json.error?.message ?? 'Could not load content library');
      }
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }, [brandId, accessToken, filter, search]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleApprove = async (id: string) => {
    if (!accessToken) return;
    setActioningId(id);
    try {
      const res = await fetch(`/api/content/drafts/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) fetchLibrary();
      else setError(json.error?.message ?? 'Could not approve');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!accessToken) return;
    setActioningId(id);
    try {
      const res = await fetch(`/api/content/drafts/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) fetchLibrary();
      else setError(json.error?.message ?? 'Could not reject');
    } finally {
      setActioningId(null);
    }
  };

  const handleSchedule = async (id: string) => {
    if (!accessToken) return;
    const input = window.prompt('Schedule for (YYYY-MM-DD HH:MM, e.g. 2026-09-01 14:30):');
    if (!input) return;

    const parsed = new Date(input.replace(' ', 'T'));
    if (isNaN(parsed.getTime())) {
      setError('Could not understand that date/time. Use YYYY-MM-DD HH:MM.');
      return;
    }

    setActioningId(id);
    try {
      const res = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ draftId: id, scheduledAt: parsed.toISOString() }),
      });
      const json = await res.json();
      if (json.success) fetchLibrary();
      else setError(json.error?.message ?? 'Could not schedule');
    } finally {
      setActioningId(null);
    }
  };

  const handlePublish = async (id: string, platform: 'linkedin' | 'facebook') => {
    if (!accessToken) return;
    if (!window.confirm(`Publish this post to ${platform === 'linkedin' ? 'LinkedIn' : 'Facebook'} now? This cannot be undone.`)) return;

    setActioningId(id);
    try {
      const res = await fetch(`/api/content/drafts/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ platform }),
      });
      const json = await res.json();
      if (json.success) fetchLibrary();
      else setError(json.error?.message ?? 'Could not publish');
    } catch {
      setError('Could not publish');
    } finally {
      setActioningId(null);
    }
  };

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
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" href="/dashboard" />
          <SidebarLink icon={<MessageSquare />} label="Conversations" href="#" />
          <SidebarLink icon={<Library />} label="Content Library" href="/content-library" active />
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
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#075E54]">Content Library</h1>
            <p className="text-gray-600 mt-1">Manage and organize all your social media content.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm shadow-sm"
              />
            </div>
          </div>
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

        <div className="flex overflow-x-auto pb-2 mb-8 gap-2 no-scrollbar">
          <FilterTab label="All Content" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterTab label="Drafts" active={filter === 'draft'} onClick={() => setFilter('draft')} />
          <FilterTab label="Approved" active={filter === 'approved'} onClick={() => setFilter('approved')} />
          <FilterTab label="Rejected" active={filter === 'rejected'} onClick={() => setFilter('rejected')} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        )}

        {!loading && brandId && drafts.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            No content yet. Generate some in AI Studio.
          </div>
        )}

        {!loading && total > 0 && (
          <p className="text-sm text-gray-500 mb-4">{total} item{total === 1 ? '' : 's'}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.flatMap((draft) =>
            Object.entries(PLATFORM_META)
              .filter(([key]) => draft[key as keyof DraftRow])
              .map(([key, meta]) => {
                const platformSlug = key === 'linkedin_content' ? 'linkedin' : key === 'facebook_content' ? 'facebook' : null;
                return (
                  <ContentCard
                    key={`${draft.id}-${key}`}
                    status={draft.status}
                    platform={meta.label}
                    platformColor={meta.color}
                    caption={draft[key as keyof DraftRow] as string}
                    date={new Date(draft.created_at).toLocaleDateString()}
                    onApprove={() => handleApprove(draft.id)}
                    onReject={() => handleReject(draft.id)}
                    onSchedule={() => handleSchedule(draft.id)}
                    onPublish={() => platformSlug && handlePublish(draft.id, platformSlug)}
                    canPublish={platformSlug !== null}
                    actioning={actioningId === draft.id}
                  />
                );
              })
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? 'bg-[#25D366]/10 text-[#075E54] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
        }`}
    >
      <div className={`${active ? 'text-[#25D366]' : 'text-gray-400 group-hover:text-gray-600'} [&>svg]:w-5 [&>svg]:h-5`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}

function FilterTab({ label, active = false, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${active ? 'bg-[#075E54] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  );
}

function ContentCard({
  status,
  platform,
  platformColor,
  caption,
  date,
  onApprove,
  onReject,
  onSchedule,
  onPublish,
  canPublish,
  actioning,
}: {
  status: string;
  platform: string;
  platformColor: string;
  caption: string;
  date: string;
  onApprove: () => void;
  onReject: () => void;
  onSchedule: () => void;
  onPublish: () => void;
  canPublish: boolean;
  actioning: boolean;
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    published: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColors[status] ?? statusColors.draft}`}>
          {status}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${platformColor}`}>
          {platform.substring(0, 1)}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-gray-800 text-sm mb-4 line-clamp-4 flex-1">{caption}</p>
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">{date}</div>
      </div>

      {status === 'draft' && (
        <div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50 divide-x divide-gray-100">
          <button
            onClick={onReject}
            disabled={actioning}
            className="py-3 flex items-center justify-center gap-1.5 text-red-500 hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={actioning}
            className="py-3 flex items-center justify-center gap-1.5 text-green-600 hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Approve
          </button>
        </div>
      )}

      {status === 'approved' && canPublish && (
        <div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50 divide-x divide-gray-100">
          <button
            onClick={onSchedule}
            disabled={actioning}
            className="py-3 flex items-center justify-center gap-1.5 text-[#075E54] hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
            Schedule
          </button>
          <button
            onClick={onPublish}
            disabled={actioning}
            className="py-3 flex items-center justify-center gap-1.5 text-blue-600 hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish Now
          </button>
        </div>
      )}

      {status === 'approved' && !canPublish && (
        <div className="border-t border-gray-100 bg-gray-50">
          <button
            onClick={onSchedule}
            disabled={actioning}
            className="w-full py-3 flex items-center justify-center gap-1.5 text-[#075E54] hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
            Schedule
          </button>
          <p className="text-[10px] text-gray-400 text-center pb-2">Direct publishing not yet available for {platform}</p>
        </div>
      )}
    </div>
  );
}