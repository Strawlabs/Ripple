'use client';
import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Wand2,
  Check,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type BackendPlatform = 'linkedin' | 'facebook' | 'instagram';

const PLATFORM_OPTIONS: { label: string; value: BackendPlatform | null; color: string }[] = [
  { label: 'LinkedIn', value: 'linkedin', color: 'bg-[#0077B5]' },
  { label: 'Facebook', value: 'facebook', color: 'bg-[#1877F2]' },
  { label: 'Instagram', value: 'instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { label: 'X (Twitter)', value: null, color: 'bg-black' }, // Phase 2 -- no backend adapter yet
];

interface Draft {
  id: string;
  linkedin_content: string | null;
  facebook_content: string | null;
  instagram_content: string | null;
  status: string;
}

export default function AIStudioPage() {
  const [topic, setTopic] = useState('How AI is transforming B2B marketing');
  const [platforms, setPlatforms] = useState<BackendPlatform[]>(['linkedin']);

  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

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
        .select('id, company_name')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle();

      if (brand) {
        setBrandId(brand.id);
        setBrandName(brand.company_name);
      }
      setLoadingBrand(false);
    }
    loadSessionAndBrand();
  }, []);

  const togglePlatform = (value: BackendPlatform | null) => {
    if (value === null) return;
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleGenerate = async () => {
    if (!brandId || !accessToken) {
      setError('No brand found for your account. Complete onboarding first.');
      return;
    }
    if (platforms.length === 0) {
      setError('Select at least one platform.');
      return;
    }

    setError('');
    setGenerating(true);
    setDraft(null);

    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ brandId, topic, platforms }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? 'Generation failed');
      } else {
        setDraft(json.data);
      }
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!draft || !accessToken) return;
    setActionLoading('approve');
    try {
      const res = await fetch(`/api/content/drafts/${draft.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) setDraft(json.data);
      else setError(json.error?.message ?? 'Could not approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!draft || !accessToken) return;
    setActionLoading('reject');
    try {
      const res = await fetch(`/api/content/drafts/${draft.id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success) setDraft(json.data);
      else setError(json.error?.message ?? 'Could not reject');
    } finally {
      setActionLoading(null);
    }
  };

  const platformContent: { platform: string; color: string; content: string }[] = draft
    ? PLATFORM_OPTIONS.filter((p) => p.value).flatMap((p) => {
        const key = `${p.value}_content` as keyof Draft;
        const content = draft[key] as string | null;
        return content ? [{ platform: p.label, color: p.color, content }] : [];
      })
    : [];

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
          <SidebarLink icon={<LineChart />} label="Analytics" href="/analytics" />

          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Advanced</p>
          </div>
          <SidebarLink icon={<Sparkles />} label="AI Studio" href="/ai-studio" active />
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
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-[#075E54]">AI Content Studio</h1>
                {brandName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                    <Sparkles className="w-3 h-3" />
                    {brandName}
                  </span>
                )}
              </div>
              <p className="text-gray-600">Generate high-converting social posts tailored to your brand identity.</p>
            </div>
          </header>

          {!loadingBrand && !brandId && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
              No brand found for your account yet. Complete the onboarding wizard first to create one.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#25D366]" />
                  Content Brief
                </h2>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Topic or URL</label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      rows={3}
                      placeholder="What should this post be about?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 transition-shadow resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Target Audience</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 appearance-none bg-white cursor-pointer">
                        <option>Marketing Managers</option>
                        <option>Founders &amp; CEOs</option>
                        <option>Developers</option>
                        <option>Bank Executives</option>
                        <option>Students</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-400">Not yet wired to generation -- for future prompt targeting.</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-sm font-semibold text-gray-700">Platforms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORM_OPTIONS.map((p) => {
                        const active = p.value !== null && platforms.includes(p.value);
                        const disabled = p.value === null;
                        return (
                          <button
                            key={p.label}
                            onClick={() => togglePlatform(p.value)}
                            disabled={disabled}
                            title={disabled ? 'Coming in Phase 2' : undefined}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                              disabled
                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                : active
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                active ? 'bg-[#25D366] border-[#25D366]' : 'border-gray-300'
                              }`}
                            >
                              {active && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {p.label}
                            {disabled && <span className="text-[10px] ml-auto">Soon</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !brandId}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#075E54] hover:to-[#1DA851] text-white rounded-xl shadow-md font-bold text-base transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Content
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {!draft && !generating && (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
                  Generated posts will appear here.
                </div>
              )}

              {platformContent.map((p) => (
                <GeneratedPostCard key={p.platform} platform={p.platform} platformColor={p.color} caption={p.content} />
              ))}

              {draft && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">Status: </span>
                    <span
                      className={`font-bold ${
                        draft.status === 'approved'
                          ? 'text-green-600'
                          : draft.status === 'rejected'
                          ? 'text-red-500'
                          : 'text-amber-600'
                      }`}
                    >
                      {draft.status}
                    </span>
                  </div>
                  {draft.status === 'draft' && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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

function GeneratedPostCard({
  platform,
  platformColor,
  caption,
}: {
  platform: string;
  platformColor: string;
  caption: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ${platformColor}`}>
            {platform.substring(0, 1)}
          </div>
          <h3 className="font-bold text-gray-800">
            {platform} <span className="font-medium text-gray-500">Preview</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold transition-colors" title="Not wired yet">
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">{caption}</p>
      </div>
    </div>
  );
}
