'use client';

import React, { useEffect, useState } from 'react';
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
  MessageCircle,
  RefreshCw,
  LogOut,
  Link as LinkIcon
} from 'lucide-react';

const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
import Link from 'next/link';

export default function SocialAccountsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 1. Find user's brand
        let { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('id, company_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandError) throw brandError;

        if (!brandData) {
          // Auto-create a fallback brand row for the user so they can proceed
          const { data: newBrand, error: insertError } = await supabase
            .from('brands')
            .insert({
              user_id: user.id,
              company_name: 'My Brand',
              tone: 'Professional'
            })
            .select('id, company_name')
            .single();

          if (insertError) throw insertError;
          brandData = newBrand;
        }

        if (brandData) {
          setBrandId(brandData.id);
          setCompanyName(brandData.company_name || 'My Brand');

          // 2. Fetch social accounts
          const { data: socialsData, error: socialsError } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('brand_id', brandData.id);

          if (socialsError) throw socialsError;
          setSocialAccounts(socialsData || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch social accounts.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleConnect = async (platform: string) => {
    if (!brandId) return;
    setActionLoading(platform);
    setError('');

    try {
      const existing = socialAccounts.find(acc => acc.platform === platform);

      if (existing) {
        const { data, error: updateError } = await supabase
          .from('social_accounts')
          .update({ status: 'connected' })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setSocialAccounts(prev => prev.map(acc => acc.id === existing.id ? data : acc));
      } else {
        const { data, error: insertError } = await supabase
          .from('social_accounts')
          .insert({
            brand_id: brandId,
            platform,
            status: 'connected'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (data) {
          setSocialAccounts(prev => [...prev, data]);
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to connect ${platform}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!brandId) return;
    setActionLoading(platform);
    setError('');

    try {
      const existing = socialAccounts.find(acc => acc.platform === platform);
      if (existing) {
        const { data, error: updateError } = await supabase
          .from('social_accounts')
          .update({ status: 'disconnected' })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setSocialAccounts(prev => prev.map(acc => acc.id === existing.id ? data : acc));
      }
    } catch (err: any) {
      setError(err.message || `Failed to disconnect ${platform}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatus = (platformName: string): 'connected' | 'disconnected' => {
    const acc = socialAccounts.find(a => a.platform === platformName);
    return acc && acc.status === 'connected' ? 'connected' : 'disconnected';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ece5dd] flex items-center justify-center">
        <div className="text-[#075E54] font-bold text-xl animate-pulse">Loading social accounts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#075E54]">Ripple</span>
        </div>
        
        <nav className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" href="/dashboard" />
          <SidebarLink icon={<MessageSquare />} label="Conversations" href="/conversations" />
          <SidebarLink icon={<Library />} label="Content Library" href="/content-library" />
          <SidebarLink icon={<BrainCircuit />} label="Brand Memory" href="/brand-memory" />
          <SidebarLink icon={<Share2 />} label="Social Accounts" active />
          <SidebarLink icon={<Calendar />} label="Scheduling" href="/scheduling" />
          <SidebarLink icon={<LineChart />} label="Analytics" href="/analytics" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Advanced</p>
          </div>
          <SidebarLink icon={<Sparkles />} label="AI Studio" href="/ai-studio" />
          <SidebarLink icon={<Megaphone />} label="Campaigns" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Settings</p>
          </div>
          <SidebarLink icon={<Bell />} label="Notifications" href="/notifications" />
          <SidebarLink icon={<CreditCard />} label="Billing" href="/billing" />
          <SidebarLink icon={<Settings />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-extrabold text-[#075E54]">Connected Platforms</h1>
            <p className="text-gray-600 mt-1">Manage your social media account connections and permissions.</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <PlatformCard 
              name="LinkedIn"
              icon={<Linkedin className="w-8 h-8 text-white" />}
              color="bg-[#0077B5]"
              status={getStatus('LinkedIn')}
              accountName={`${companyName} (Company Page)`}
              onConnect={() => handleConnect('LinkedIn')}
              onDisconnect={() => handleDisconnect('LinkedIn')}
              isLoading={actionLoading === 'LinkedIn'}
            />

            <PlatformCard 
              name="Facebook"
              icon={<Facebook className="w-8 h-8 text-white" />}
              color="bg-[#1877F2]"
              status={getStatus('Facebook')}
              accountName={companyName}
              onConnect={() => handleConnect('Facebook')}
              onDisconnect={() => handleDisconnect('Facebook')}
              isLoading={actionLoading === 'Facebook'}
            />

            <PlatformCard 
              name="Instagram"
              icon={<Instagram className="w-8 h-8 text-white" />}
              color="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
              status={getStatus('Instagram')}
              accountName={`${companyName} Business`}
              onConnect={() => handleConnect('Instagram')}
              onDisconnect={() => handleDisconnect('Instagram')}
              isLoading={actionLoading === 'Instagram'}
            />

            <PlatformCard 
              name="X (Twitter)"
              icon={<Twitter className="w-8 h-8 text-white fill-current" />}
              color="bg-black"
              status={getStatus('X (Twitter)')}
              accountName={`${companyName} Feed`}
              onConnect={() => handleConnect('X (Twitter)')}
              onDisconnect={() => handleDisconnect('X (Twitter)')}
              isLoading={actionLoading === 'X (Twitter)'}
            />

          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, href = '#' }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) {
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
      active 
        ? 'bg-[#25D366]/10 text-[#075E54] font-bold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
    }`}>
      <div className={`${active ? 'text-[#25D366]' : 'text-gray-400 group-hover:text-gray-600'} [&>svg]:w-5 [&>svg]:h-5`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}

function PlatformCard({ 
  name, 
  icon, 
  color, 
  status, 
  accountName, 
  onConnect, 
  onDisconnect, 
  isLoading 
}: { 
  name: string, 
  icon: React.ReactNode, 
  color: string, 
  status: 'connected' | 'disconnected', 
  accountName?: string, 
  onConnect: () => void, 
  onDisconnect: () => void, 
  isLoading: boolean 
}) {
  const isConnected = status === 'connected';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
            {isConnected && accountName ? (
              <p className="text-sm font-medium text-gray-600 mt-0.5">{accountName}</p>
            ) : (
              <p className="text-sm font-medium text-gray-400 mt-0.5">Not configured</p>
            )}
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          isConnected 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-gray-50 text-gray-500 border-gray-200'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-3">
        {isConnected ? (
          <>
            <button 
              onClick={onDisconnect}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
            <button 
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#075E54] font-semibold rounded-xl text-sm transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Token
            </button>
          </>
        ) : (
          <button 
            onClick={onConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
            {isLoading ? 'Connecting...' : `Connect ${name}`}
          </button>
        )}
      </div>
    </div>
  );
}
