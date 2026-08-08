'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Library,
  BrainCircuit,
  Share2,
  Calendar,
  LineChart as LineChartIcon,
  Sparkles,
  Megaphone,
  Bell,
  CreditCard,
  Settings,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';

interface PlatformBreakdown {
  platform: string;
  reach: number;
  impressions: number;
  engagement: number;
  posts: number;
}

interface TopPost {
  postId: string;
  platform: string;
  reach: number;
  impressions: number;
  engagement: number;
  caption: string | null;
}

interface DashboardData {
  warning: string | null;
  totals: { reach: number; impressions: number; engagement: number };
  platformBreakdown: PlatformBreakdown[];
  topPosts: TopPost[];
  note: string | null;
}

const PLATFORM_COLOR: Record<string, string> = {
  linkedin: 'bg-[#0077B5]',
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
};

export default function AnalyticsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const fetchDashboard = useCallback(async () => {
    if (!brandId || !accessToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics?brandId=${brandId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error?.message ?? 'Could not load analytics');
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }, [brandId, accessToken]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const platformChartData = (data?.platformBreakdown ?? []).map((p) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    Engagement: p.engagement,
    Reach: p.reach,
  }));

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 shrink-0">
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
          <SidebarLink icon={<LineChartIcon />} label="Analytics" href="/analytics" active />

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
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-extrabold text-[#075E54]">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your performance and measure your impact.</p>
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

          {data?.warning && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
              {data.warning}
            </div>
          )}

          {data?.note && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-sm font-medium">
              {data.note}
            </div>
          )}

          {loading && !data && (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </div>
          )}

          {data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <MetricCard label="Total Reach" value={data.totals.reach.toLocaleString()} />
                <MetricCard label="Impressions" value={data.totals.impressions.toLocaleString()} />
                <MetricCard label="Engagement" value={data.totals.engagement.toLocaleString()} />
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Platform Performance</h2>
                  <p className="text-sm text-gray-500">Compare metrics across channels</p>
                </div>
                {platformChartData.length === 0 ? (
                  <p className="text-sm text-gray-400 py-12 text-center">No published posts yet.</p>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformChartData} margin={{ top: 5, right: 0, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Engagement" fill="#128C7E" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Reach" fill="#25D366" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Top Performing Posts</h2>
                  <p className="text-sm text-gray-500">Based on overall engagement</p>
                </div>

                {data.topPosts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No published posts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {data.topPosts.map((post, i) => (
                      <TopPostItem
                        key={post.postId}
                        rank={i + 1}
                        platform={post.platform}
                        platformColor={PLATFORM_COLOR[post.platform] ?? 'bg-gray-400'}
                        caption={post.caption ?? '(content unavailable)'}
                        engagement={post.engagement.toLocaleString()}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
      <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
    </div>
  );
}

function TopPostItem({
  rank,
  platform,
  platformColor,
  caption,
  engagement,
}: {
  rank: number;
  platform: string;
  platformColor: string;
  caption: string;
  engagement: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
      <div className="w-6 text-center font-bold text-gray-400">#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold ${platformColor}`}>
            {platform.substring(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-gray-500 capitalize">{platform}</span>
        </div>
        <p className="text-sm text-gray-800 font-medium truncate">{caption}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#128C7E]">{engagement}</p>
        <p className="text-xs font-semibold text-gray-400">Engagements</p>
      </div>
    </div>
  );
}
