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
  Search,
  Filter,
  Copy,
  Repeat,
  Edit2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ContentLibraryPage() {
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
          <SidebarLink icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarLink icon={<MessageSquare />} label="Conversations" />
          <SidebarLink icon={<Library />} label="Content Library" active />
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
      </aside>

      {/* Main Content */}
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
                  placeholder="Search keywords, date, platform..." 
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm shadow-sm"
                />
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
               <Filter className="w-4 h-4" />
               Filters
             </button>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-8 gap-2 no-scrollbar">
          <FilterTab label="All Content" active />
          <FilterTab label="Drafts" count={12} />
          <FilterTab label="Scheduled" count={5} />
          <FilterTab label="Published" count={84} />
          <FilterTab label="Failed" count={2} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <ContentCard 
            status="published"
            platform="LinkedIn"
            platformColor="bg-[#0077B5]"
            caption="Exciting news! We're thrilled to announce our latest product update. We've been working hard to bring you these new features..."
            engagement="1.2k"
            date="Oct 24, 2023"
          />
          
          <ContentCard 
            status="scheduled"
            platform="Instagram"
            platformColor="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
            caption="Behind the scenes at the office today! 🏢✨ Working on something special for our amazing community. Stay tuned..."
            engagement="-"
            date="Oct 26, 2023"
          />
          
          <ContentCard 
            status="draft"
            platform="Facebook"
            platformColor="bg-[#1877F2]"
            caption="Top 5 tips to improve your workflow productivity in 2024. Thread below 🧵👇"
            engagement="-"
            date="Unscheduled"
          />

          <ContentCard 
            status="published"
            platform="Instagram"
            platformColor="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
            caption="Customer spotlight! 🌟 So happy to see how Acme Corp is using our platform to scale their operations."
            engagement="856"
            date="Oct 20, 2023"
          />

          <ContentCard 
            status="failed"
            platform="LinkedIn"
            platformColor="bg-[#0077B5]"
            caption="Join us for our upcoming webinar on the future of AI in marketing. Register now to secure your spot!"
            engagement="-"
            date="Oct 23, 2023"
          />

          <ContentCard 
            status="published"
            platform="Facebook"
            platformColor="bg-[#1877F2]"
            caption="Did you know? Our platform integrates with over 50+ tools you already use every day. Learn more on our blog."
            engagement="3.4k"
            date="Oct 15, 2023"
          />

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

function FilterTab({ label, active = false, count }: { label: string, active?: boolean, count?: number }) {
  return (
    <button className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
      active 
        ? 'bg-[#075E54] text-white shadow-md' 
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`}>
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

function ContentCard({ status, platform, platformColor, caption, engagement, date }: { status: 'draft' | 'scheduled' | 'published' | 'failed', platform: string, platformColor: string, caption: string, engagement: string, date: string }) {
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    published: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200'
  };

  const statusLabels = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    published: 'Published',
    failed: 'Failed'
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      {/* Thumbnail Area */}
      <div className="h-48 bg-gray-100 relative flex items-center justify-center border-b border-gray-100">
        <ImageIcon className="w-10 h-10 text-gray-300" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${platformColor}`}>
            {platform.substring(0, 1)}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-gray-800 text-sm mb-4 line-clamp-3 flex-1">{caption}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Engagement</span>
            <span className="text-sm font-bold text-gray-800">{engagement}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</span>
             <span className="text-sm font-bold text-gray-800">{date}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 border-t border-gray-100 bg-gray-50 divide-x divide-gray-100">
        <button className="py-3 flex justify-center text-gray-500 hover:text-[#075E54] hover:bg-white transition-colors group/btn" title="Duplicate">
          <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        </button>
        <button className="py-3 flex justify-center text-gray-500 hover:text-[#075E54] hover:bg-white transition-colors group/btn" title="Republish">
          <Repeat className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        </button>
        <button className="py-3 flex justify-center text-gray-500 hover:text-[#075E54] hover:bg-white transition-colors group/btn" title="Edit">
          <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        </button>
        <button className="py-3 flex justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-colors group/btn" title="Delete">
          <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
