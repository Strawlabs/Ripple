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
  RefreshCw,
  Save,
  Send,
  Clock,
  Edit2,
  CheckCircle2,
  ChevronDown,
  Wand2,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function AIStudioPage() {
  const [topic, setTopic] = useState('How AI is transforming B2B marketing');
  const [platforms, setPlatforms] = useState(['LinkedIn', 'X (Twitter)']);

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

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
          <SidebarLink icon={<LineChart />} label="Analytics" />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Advanced</p>
          </div>
          <SidebarLink icon={<Sparkles />} label="AI Studio" active />
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-[#075E54]">AI Content Studio</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                  <Sparkles className="w-3 h-3" />
                  Brand Voice: Professional & Friendly
                </span>
              </div>
              <p className="text-gray-600">Generate high-converting social posts tailored to your brand identity.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm text-sm font-semibold transition-colors">
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl shadow-sm text-sm font-semibold transition-colors">
                <Clock className="w-4 h-4" />
                Schedule
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl shadow-sm text-sm font-bold transition-colors">
                <Send className="w-4 h-4" />
                Publish
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input Form Column */}
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
                        <option>Founders & CEOs</option>
                        <option>Developers</option>
                        <option>Bank Executives</option>
                        <option>Students</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Content Type</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 appearance-none bg-white cursor-pointer">
                        <option>Single Post</option>
                        <option>Carousel (Thread)</option>
                        <option>Image + Caption</option>
                        <option>Video Script</option>
                        <option>Multi-post Campaign</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-sm font-semibold text-gray-700">Platforms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['LinkedIn', 'Facebook', 'Instagram', 'X (Twitter)'].map(p => (
                        <button 
                          key={p}
                          onClick={() => togglePlatform(p)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                            platforms.includes(p) 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${platforms.includes(p) ? 'bg-[#25D366] border-[#25D366]' : 'border-gray-300'}`}>
                            {platforms.includes(p) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#075E54] hover:to-[#1DA851] text-white rounded-xl shadow-md font-bold text-base transition-all hover:shadow-lg">
                      <Sparkles className="w-5 h-5" />
                      Generate Content
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Preview Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <GeneratedPostCard 
                platform="LinkedIn"
                platformColor="bg-[#0077B5]"
                caption="The B2B marketing landscape is shifting rapidly. 🚀\n\nAI isn't just about writing copy faster—it's about understanding your audience at scale.\n\nHere are 3 ways AI is changing the game for revenue teams:\n1️⃣ Hyper-personalized outreach\n2️⃣ Predictive lead scoring\n3️⃣ Dynamic content creation\n\nHow is your team adapting to these changes?\n\n#B2BMarketing #ArtificialIntelligence #AcmeCorp #Growth"
                hashtags={['#B2BMarketing', '#ArtificialIntelligence', '#AcmeCorp', '#Growth']}
              />

              <GeneratedPostCard 
                platform="X (Twitter)"
                platformColor="bg-black"
                caption="AI isn't just a buzzword; it's the new standard for B2B marketing. If you're not using it for personalization and predictive scoring, you're falling behind. 🤖📈\n\nWhat's your biggest challenge with AI adoption? 👇\n\n#B2BMarketing #AI #TechTrends"
                hashtags={['#B2BMarketing', '#AI', '#TechTrends']}
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

function GeneratedPostCard({ platform, platformColor, caption, hashtags }: { platform: string, platformColor: string, caption: string, hashtags: string[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ${platformColor}`}>
            {platform.substring(0, 1)}
          </div>
          <h3 className="font-bold text-gray-800">{platform} <span className="font-medium text-gray-500">Preview</span></h3>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition-colors">
             <Edit2 className="w-3.5 h-3.5" />
             Edit
           </button>
           <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold transition-colors">
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
