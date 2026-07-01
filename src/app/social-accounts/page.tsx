import React from 'react';
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
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  RefreshCw,
  LogOut,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

export default function SocialAccountsPage() {
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
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarLink icon={<MessageSquare />} label="Conversations" />
          <SidebarLink icon={<Library />} label="Content Library" />
          <SidebarLink icon={<BrainCircuit />} label="Brand Memory" />
          <SidebarLink icon={<Share2 />} label="Social Accounts" active />
          <SidebarLink icon={<Calendar />} label="Scheduling" />
          <SidebarLink icon={<LineChart />} label="Analytics" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Advanced</p>
          </div>
          <SidebarLink icon={<Sparkles />} label="AI Studio" />
          <SidebarLink icon={<Megaphone />} label="Campaigns" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Settings</p>
          </div>
          <SidebarLink icon={<Bell />} label="Notifications" />
          <SidebarLink icon={<CreditCard />} label="Billing" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <PlatformCard 
              name="LinkedIn"
              icon={<Linkedin className="w-8 h-8 text-white" />}
              color="bg-[#0077B5]"
              status="connected"
              accountName="Acme Corp (Company Page)"
            />

            <PlatformCard 
              name="Facebook"
              icon={<Facebook className="w-8 h-8 text-white" />}
              color="bg-[#1877F2]"
              status="connected"
              accountName="Acme Corp"
            />

            <PlatformCard 
              name="Instagram"
              icon={<Instagram className="w-8 h-8 text-white" />}
              color="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
              status="disconnected"
            />

            <PlatformCard 
              name="X (Twitter)"
              icon={<Twitter className="w-8 h-8 text-white fill-current" />}
              color="bg-black"
              status="disconnected"
            />

          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
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

function PlatformCard({ name, icon, color, status, accountName }: { name: string, icon: React.ReactNode, color: string, status: 'connected' | 'disconnected', accountName?: string }) {
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
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors border border-gray-200">
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#075E54] font-semibold rounded-xl text-sm transition-colors border border-gray-200">
              <RefreshCw className="w-4 h-4" />
              Refresh Token
            </button>
          </>
        ) : (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
            <LinkIcon className="w-4 h-4" />
            Connect {name}
          </button>
        )}
      </div>
    </div>
  );
}
