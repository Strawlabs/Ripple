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
  Plus,
  Clock,
  Lightbulb,
  Target,
  MessageCircle,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

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
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#075E54]">Ripple</span>
        </div>
        
        <nav className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" active />
          <SidebarLink icon={<MessageSquare />} label="Conversations" />
          <SidebarLink icon={<Library />} label="Content Library" />
          <SidebarLink icon={<BrainCircuit />} label="Brand Memory" />
          <SidebarLink icon={<Share2 />} label="Social Accounts" />
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

        {/* Logout Button */}
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

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#075E54]">Good morning, Acme Corp!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your social channels today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-[#075E54] bg-white rounded-full shadow-sm hover:shadow transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-[#25D366] to-[#075E54]"></div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard label="Posts Created" value="124" trend="+12%" />
          <StatCard label="Posts Published" value="89" trend="+5%" />
          <StatCard label="Scheduled Posts" value="12" />
          <StatCard label="Engagement" value="4.2k" trend="+22%" positive />
          <StatCard label="Reach" value="18.5k" trend="+15%" positive />
          <StatCard label="Followers Growth" value="+241" trend="+8%" positive />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-[#075E54] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionCard icon={<Plus />} title="Create Post" desc="Draft a new social post" color="bg-[#25D366]" />
            <ActionCard icon={<Clock />} title="Schedule Post" desc="Plan content for later" color="bg-[#128C7E]" />
            <ActionCard icon={<Lightbulb />} title="Generate Ideas" desc="Brainstorm with AI" color="bg-blue-500" />
            <ActionCard icon={<Target />} title="Generate Campaign" desc="Create a multi-post flow" color="bg-purple-500" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Upcoming Posts */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#075E54]">Upcoming Posts</h2>
              <button className="text-sm font-semibold text-[#128C7E] hover:text-[#075E54]">View Calendar</button>
            </div>
            
            <div className="space-y-4">
              <UpcomingPostItem 
                platform="in" 
                platformColor="bg-[#0077B5]"
                title="Exciting news about our new product launch!"
                time="Today, 2:00 PM"
              />
              <UpcomingPostItem 
                platform="f" 
                platformColor="bg-[#1877F2]"
                title="Behind the scenes at the Acme Corp office 🏢"
                time="Tomorrow, 10:00 AM"
              />
              <UpcomingPostItem 
                platform="ig" 
                platformColor="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
                title="5 tips for improving your workflow efficiency 🚀"
                time="Friday, 4:30 PM"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-[#075E54] mb-6">Recent Activity</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              
              <ActivityItem 
                type="published"
                icon={<CheckCircle2 className="w-4 h-4 text-white" />}
                iconBg="bg-green-500"
                text="Published post to LinkedIn"
                time="2h ago"
              />
              <ActivityItem 
                type="generated"
                icon={<Sparkles className="w-4 h-4 text-white" />}
                iconBg="bg-blue-500"
                text="AI generated 3 post ideas"
                time="5h ago"
              />
              <ActivityItem 
                type="whatsapp"
                icon={<MessageCircle className="w-4 h-4 text-white" />}
                iconBg="bg-[#25D366]"
                text="Approved post via WhatsApp"
                time="Yesterday"
              />
              <ActivityItem 
                type="connected"
                icon={<Share2 className="w-4 h-4 text-white" />}
                iconBg="bg-purple-500"
                text="Connected Instagram account"
                time="2 days ago"
              />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
      active 
        ? 'bg-[#25D366]/10 text-[#075E54] font-bold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
    }`}>
      <div className={`${active ? 'text-[#25D366]' : 'text-gray-400 group-hover:text-gray-600'} [&>svg]:w-5 [&>svg]:h-5`}>
        {icon}
      </div>
      {label}
    </a>
  );
}

function StatCard({ label, value, trend, positive = false }: { label: string, value: string, trend?: string, positive?: boolean }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-extrabold text-gray-800">{value}</h3>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            positive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <button className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left flex items-start gap-4 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 group-hover:text-[#075E54] transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </button>
  );
}

function UpcomingPostItem({ platform, platformColor, title, time }: { platform: string, platformColor: string, title: string, time: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${platformColor}`}>
        {platform}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 truncate max-w-md">{title}</h4>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
      <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-full hover:bg-white hover:shadow-sm transition-all">
        Edit
      </button>
    </div>
  );
}

function ActivityItem({ type, icon, iconBg, text, time }: { type: string, icon: React.ReactNode, iconBg: string, text: string, time: string }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      {/* Icon */}
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${iconBg}`}>
        {icon}
      </div>
      {/* Text */}
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <time className="text-xs font-medium text-[#128C7E]">{time}</time>
        </div>
        <div className="text-sm font-medium text-gray-700">{text}</div>
      </div>
    </div>
  );
}
