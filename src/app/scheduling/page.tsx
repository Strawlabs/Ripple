'use client';
import React, { useState } from 'react';
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
  Edit2,
  CalendarDays,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function SchedulingPage() {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const posts = [
    {
      id: 1,
      date: 4,
      platform: 'LinkedIn',
      platformLetter: 'L',
      platformColor: 'bg-[#0077B5]',
      time: '09:00 AM',
      caption: "Exciting news! We're thrilled to announce our latest product update. We've been working hard to bring you these new features..."
    },
    {
      id: 2,
      date: 12,
      platform: 'Instagram',
      platformLetter: 'I',
      platformColor: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      time: '02:30 PM',
      caption: "Behind the scenes at the office today! 🏢✨ Working on something special for our amazing community. Stay tuned..."
    },
    {
      id: 3,
      date: 18,
      platform: 'Facebook',
      platformLetter: 'F',
      platformColor: 'bg-[#1877F2]',
      time: '11:15 AM',
      caption: "Top 5 tips to improve your workflow productivity in 2024. Read our latest blog post to learn more!"
    },
    {
      id: 4,
      date: 24,
      platform: 'LinkedIn',
      platformLetter: 'L',
      platformColor: 'bg-[#0077B5]',
      time: '10:00 AM',
      caption: "Join us for our upcoming webinar on the future of AI in marketing. Register now to secure your spot!"
    },
    {
      id: 5,
      date: 24,
      platform: 'Instagram',
      platformLetter: 'I',
      platformColor: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      time: '04:00 PM',
      caption: "Customer spotlight! 🌟 So happy to see how Acme Corp is using our platform to scale their operations."
    }
  ];

  // Helper to get posts for a date
  const getPostsForDate = (date: number) => {
    return posts.filter(p => p.date === date);
  };

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen shrink-0 relative z-20">
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
          <SidebarLink icon={<CalendarIcon />} label="Scheduling" active />
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#075E54]">Scheduling Center</h1>
              <p className="text-gray-600 mt-1">Plan, schedule, and review your upcoming content.</p>
            </div>
            
            <div className="flex items-center gap-4">
               {/* View Tabs */}
               <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                 <button className="px-4 py-1.5 text-sm font-bold rounded-lg bg-[#25D366]/10 text-[#075E54]">Month</button>
                 <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-gray-500 hover:text-gray-700">Week</button>
                 <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-gray-500 hover:text-gray-700">Day</button>
               </div>
               <button className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl shadow-sm font-bold transition-colors">
                 New Post
               </button>
            </div>
          </header>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-t-3xl border-x border-t border-gray-200 shadow-sm mt-4">
             <div className="flex items-center gap-4">
               <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <h2 className="text-xl font-bold text-gray-800 w-40 text-center">October 2026</h2>
               <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>
             <button className="px-4 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
               Today
             </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white border-x border-b border-gray-200 rounded-b-3xl shadow-sm overflow-hidden flex flex-col">
            {/* Days of week */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px">
               {/* 35 grid cells for a 5-week month view */}
               {Array.from({ length: 35 }).map((_, i) => {
                 const dayNum = i - 2; // Offset to start month on a specific day
                 const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                 const dayPosts = isCurrentMonth ? getPostsForDate(dayNum) : [];

                 return (
                   <div key={i} className={`min-h-[120px] bg-white p-2 flex flex-col ${isCurrentMonth ? '' : 'bg-gray-50/50'}`}>
                     <span className={`text-sm font-semibold mb-2 ml-1 ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                       {isCurrentMonth ? dayNum : ''}
                     </span>
                     
                     <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">
                       {dayPosts.map(post => (
                         <button 
                           key={post.id}
                           onClick={() => setSelectedPost(post)}
                           className={`text-left p-2 rounded-lg border border-gray-100 hover:shadow-md transition-all group ${
                             selectedPost?.id === post.id ? 'ring-2 ring-[#25D366] bg-green-50' : 'bg-white shadow-sm'
                           }`}
                         >
                           <div className="flex items-center gap-1.5 mb-1">
                             <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold ${post.platformColor}`}>
                               {post.platformLetter}
                             </div>
                             <span className="text-xs font-bold text-gray-500">{post.time}</span>
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
          </div>
        </div>

        {/* Side Panel Overlay */}
        {selectedPost && (
          <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-gray-200 z-30 flex flex-col transform transition-transform duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#128C7E]" />
                Scheduled Post
              </h3>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
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
                   <p className="text-sm font-medium text-[#128C7E]">{selectedPost.time} • Oct {selectedPost.date}, 2026</p>
                 </div>
              </div>

              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content</h5>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Media</h5>
                <div className="aspect-video bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Image attached</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-3 gap-2">
               <button className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-gray-50 rounded-xl text-gray-600 hover:text-[#075E54] transition-colors border border-transparent hover:border-gray-200">
                 <Edit2 className="w-4 h-4" />
                 <span className="text-xs font-semibold">Edit</span>
               </button>
               <button className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-gray-50 rounded-xl text-gray-600 hover:text-[#075E54] transition-colors border border-transparent hover:border-gray-200">
                 <CalendarDays className="w-4 h-4" />
                 <span className="text-xs font-semibold">Reschedule</span>
               </button>
               <button className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-600 transition-colors border border-transparent hover:border-red-100">
                 <Trash2 className="w-4 h-4" />
                 <span className="text-xs font-semibold">Cancel</span>
               </button>
            </div>
          </div>
        )}

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
