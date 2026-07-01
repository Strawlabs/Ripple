'use client';
import React, { useState } from 'react';
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
  RefreshCw,
  ExternalLink,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const notifications = [
    {
      id: 1,
      type: 'approval',
      title: 'Approval Required: Acme Fall Campaign',
      message: 'Alex Smith requested your approval for 3 LinkedIn posts scheduled for next week.',
      time: '10 mins ago',
      unread: true,
      icon: <ShieldAlert className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-100',
    },
    {
      id: 2,
      type: 'failure',
      title: 'Publish Failed: Instagram Reel',
      message: 'Failed to publish "Behind the scenes" to Instagram due to an expired token. Please reconnect your account.',
      time: '1 hour ago',
      unread: true,
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      iconBg: 'bg-red-100',
    },
    {
      id: 3,
      type: 'success',
      title: 'Successfully Published to LinkedIn',
      message: 'Your post "The future of B2B marketing" is now live on the Acme Corp LinkedIn page.',
      time: '2 hours ago',
      unread: false,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-100',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Schedule Reminder: 3 posts going out today',
      message: 'You have 3 posts scheduled across Facebook and X starting at 2:00 PM today.',
      time: '5 hours ago',
      unread: false,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100',
    },
    {
      id: 5,
      type: 'report',
      title: 'Weekly Performance Report is Ready',
      message: 'Your engagement was up 15% this week! Click to view your full analytics breakdown.',
      time: '1 day ago',
      unread: false,
      icon: <FileBarChart className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
    },
    {
      id: 6,
      type: 'approval',
      title: 'Approval Required: Developer Conference Tweets',
      message: 'Sarah Jenkins drafted a thread for the upcoming conference. Requires review.',
      time: '2 days ago',
      unread: false,
      icon: <ShieldAlert className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-100',
    },
    {
      id: 7,
      type: 'success',
      title: 'Successfully Published to X (Twitter)',
      message: 'Your thread about product updates is now live and already has 12 retweets.',
      time: '3 days ago',
      unread: false,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-100',
    }
  ];

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-10">
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
          <SidebarLink icon={<LineChart />} label="Analytics" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Advanced</p>
          </div>
          <SidebarLink icon={<Sparkles />} label="AI Studio" />
          <SidebarLink icon={<Megaphone />} label="Campaigns" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Settings</p>
          </div>
          <SidebarLink icon={<Bell />} label="Notifications" active />
          <SidebarLink icon={<CreditCard />} label="Billing" />
          <SidebarLink icon={<Settings />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#075E54]">Notifications</h1>
              <p className="text-gray-600 mt-1">Stay updated on your approvals, publishing status, and alerts.</p>
            </div>
            
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm text-sm font-semibold transition-colors w-full md:w-auto">
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </header>

          {/* Filters */}
          <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
            <FilterTab label="All" active={activeTab === 'All'} onClick={() => setActiveTab('All')} />
            <FilterTab label="Unread" active={activeTab === 'Unread'} onClick={() => setActiveTab('Unread')} count={2} />
            <FilterTab label="Approval Required" active={activeTab === 'Approval Required'} onClick={() => setActiveTab('Approval Required')} />
            <FilterTab label="Publish Success" active={activeTab === 'Publish Success'} onClick={() => setActiveTab('Publish Success')} />
            <FilterTab label="Publish Failure" active={activeTab === 'Publish Failure'} onClick={() => setActiveTab('Publish Failure')} />
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col divide-y divide-gray-50">
             {notifications.map((notif) => (
               <div key={notif.id} className={`p-5 lg:p-6 transition-colors hover:bg-gray-50 flex flex-col sm:flex-row gap-4 sm:gap-6 ${notif.unread ? 'bg-green-50/30' : ''}`}>
                 
                 {/* Icon & Unread Dot */}
                 <div className="flex items-start shrink-0 relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white shadow-sm ${notif.iconBg}`}>
                      {notif.icon}
                    </div>
                    {notif.unread && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full"></div>
                    )}
                 </div>

                 {/* Content */}
                 <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1.5">
                      <h3 className={`text-base text-gray-900 ${notif.unread ? 'font-bold' : 'font-semibold'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap shrink-0">{notif.time}</span>
                    </div>
                    <p className={`text-sm mb-4 leading-relaxed ${notif.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                       {notif.type === 'approval' && (
                         <button className="flex items-center gap-1.5 px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                           <Eye className="w-3.5 h-3.5" />
                           Review Content
                         </button>
                       )}
                       {notif.type === 'failure' && (
                         <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                           <RefreshCw className="w-3.5 h-3.5" />
                           Retry Publish
                         </button>
                       )}
                       {notif.type === 'success' && (
                         <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors shadow-sm">
                           <ExternalLink className="w-3.5 h-3.5" />
                           View Live Post
                         </button>
                       )}
                       {notif.type === 'report' && (
                         <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                           <FileBarChart className="w-3.5 h-3.5" />
                           View Dashboard
                         </button>
                       )}
                    </div>
                 </div>

               </div>
             ))}
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

function FilterTab({ label, active = false, count, onClick }: { label: string, active?: boolean, count?: number, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        active 
          ? 'bg-[#075E54] text-white shadow-md' 
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
