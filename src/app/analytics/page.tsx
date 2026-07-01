'use client';
import React, { useState } from 'react';
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
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';

const trendData = [
  { name: 'Mon', engagement: 1200 },
  { name: 'Tue', engagement: 1800 },
  { name: 'Wed', engagement: 1500 },
  { name: 'Thu', engagement: 2100 },
  { name: 'Fri', engagement: 2800 },
  { name: 'Sat', engagement: 1900 },
  { name: 'Sun', engagement: 2400 },
];

const platformData = [
  { name: 'LinkedIn', Engagement: 4500, Reach: 12000 },
  { name: 'Facebook', Engagement: 3200, Reach: 8000 },
  { name: 'Instagram', Engagement: 5800, Reach: 15000 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [chartToggle, setChartToggle] = useState('Daily');

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
          <SidebarLink icon={<Share2 />} label="Social Accounts" />
          <SidebarLink icon={<Calendar />} label="Scheduling" />
          <SidebarLink icon={<LineChartIcon />} label="Analytics" active />
          
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
        <div className="max-w-6xl mx-auto">
          
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-[#075E54]">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your performance and measure your impact.</p>
            </div>
            
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                {dateRange}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {/* Note: In a real app this would be a dropdown menu */}
            </div>
          </header>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Total Reach" value="124.5k" trend="+12.5%" isPositive={true} />
            <MetricCard label="Engagement" value="48.2k" trend="+5.2%" isPositive={true} />
            <MetricCard label="Followers Growth" value="+1,245" trend="+1.8%" isPositive={true} />
            <MetricCard label="Click Through Rate" value="3.4%" trend="-0.4%" isPositive={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Engagement Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Engagement Trend</h2>
                  <p className="text-sm text-gray-500">Likes, comments, and shares over time</p>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                  <button className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${chartToggle === 'Daily' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setChartToggle('Daily')}>Daily</button>
                  <button className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${chartToggle === 'Weekly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setChartToggle('Weekly')}>Weekly</button>
                  <button className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${chartToggle === 'Monthly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setChartToggle('Monthly')}>Monthly</button>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="engagement" stroke="#25D366" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Platform Performance</h2>
                <p className="text-sm text-gray-500">Compare metrics across channels</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} margin={{ top: 5, right: 0, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Engagement" fill="#128C7E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Reach" fill="#25D366" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Top Posts */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Top Performing Posts</h2>
                <p className="text-sm text-gray-500">Based on overall engagement</p>
              </div>
              <button className="text-sm font-semibold text-[#128C7E] hover:text-[#075E54]">View All</button>
            </div>
            
            <div className="space-y-4">
              <TopPostItem 
                rank={1}
                platform="LinkedIn"
                platformColor="bg-[#0077B5]"
                caption="Exciting news! We're thrilled to announce our latest product update..."
                engagement="4.2k"
              />
              <TopPostItem 
                rank={2}
                platform="Instagram"
                platformColor="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
                caption="Behind the scenes at the office today! 🏢✨ Working on something special..."
                engagement="3.8k"
              />
              <TopPostItem 
                rank={3}
                platform="Facebook"
                platformColor="bg-[#1877F2]"
                caption="Top 5 tips to improve your workflow productivity in 2024. Read our latest..."
                engagement="2.1k"
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

function MetricCard({ label, value, trend, isPositive }: { label: string, value: string, trend: string, isPositive: boolean }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function TopPostItem({ rank, platform, platformColor, caption, engagement }: { rank: number, platform: string, platformColor: string, caption: string, engagement: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
      <div className="w-6 text-center font-bold text-gray-400">#{rank}</div>
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
        <ImageIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold ${platformColor}`}>
            {platform.substring(0, 1)}
          </div>
          <span className="text-xs font-bold text-gray-500">{platform}</span>
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
