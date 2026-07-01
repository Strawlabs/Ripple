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
  Save,
  Building,
  Hash,
  Users,
  ShieldCheck,
  CheckCircle2,
  Smile,
  Briefcase,
  GraduationCap,
  Palette,
  Laugh
} from 'lucide-react';
import Link from 'next/link';

export default function BrandMemoryPage() {
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
          <SidebarLink icon={<BrainCircuit />} label="Brand Memory" active />
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
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-[#075E54]">Brand Memory</h1>
              <p className="text-gray-600 mt-1">Train the AI on your brand's core identity, tone, and audience.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-md font-bold transition-colors w-full md:w-auto justify-center">
               <Save className="w-4 h-4" />
               Save Brand Memory
            </button>
          </header>

          <div className="space-y-8 pb-10">
            
            {/* Company Profile */}
            <Section title="Company Profile" icon={<Building className="w-5 h-5 text-[#128C7E]" />} desc="Basic information about your business.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField label="Company Name" placeholder="e.g. Acme Corp" defaultValue="Acme Corp" />
                <InputField label="Tagline" placeholder="e.g. Making the world better" defaultValue="Innovating the future of social management." />
              </div>
              <div className="space-y-6">
                <TextareaField label="Products / Key Offerings" placeholder="What do you sell?" defaultValue="Social media scheduling tool, AI content generator, unified inbox, analytics dashboard." />
                <TextareaField label="Services / Core Features" placeholder="What services do you provide?" defaultValue="SaaS platform for marketing teams, dedicated account management for enterprise clients, 24/7 technical support." />
              </div>
            </Section>

            {/* Brand Personality */}
            <Section title="Brand Personality" icon={<Sparkles className="w-5 h-5 text-purple-500" />} desc="Select the tone that best represents your brand's voice.">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ToneCard icon={<Briefcase />} label="Professional" active />
                <ToneCard icon={<Smile />} label="Friendly" active />
                <ToneCard icon={<Building />} label="Corporate" />
                <ToneCard icon={<GraduationCap />} label="Educational" />
                <ToneCard icon={<Palette />} label="Creative" />
                <ToneCard icon={<Laugh />} label="Humorous" />
              </div>
            </Section>

            {/* Target Audience */}
            <Section title="Target Audience" icon={<Users className="w-5 h-5 text-blue-500" />} desc="Who are you trying to reach?">
              <TextareaField 
                label="Audience Personas" 
                placeholder="Describe your ideal customers..." 
                defaultValue="Founders, Developers, Marketing Managers, Social Media Executives, Tech Enthusiasts, Startups." 
                rows={3} 
              />
            </Section>

            {/* Content Rules */}
            <Section title="Content Rules" icon={<ShieldCheck className="w-5 h-5 text-orange-500" />} desc="Strict guidelines the AI should always follow.">
              <TextareaField 
                label="Guidelines & Restrictions" 
                placeholder="e.g. Always professional, avoid emojis..." 
                defaultValue="Always maintain a professional but approachable tone. Avoid excessive use of emojis (max 2 per post). Never mention competitors. Always mention the brand name 'Acme Corp' in every long-form post." 
                rows={4} 
              />
            </Section>

            {/* Preferred Hashtags */}
            <Section title="Preferred Hashtags" icon={<Hash className="w-5 h-5 text-pink-500" />} desc="Default hashtags to include in your posts.">
              <div className="mb-3 flex flex-wrap gap-2">
                 <HashtagChip label="SocialMedia" />
                 <HashtagChip label="MarketingTips" />
                 <HashtagChip label="AcmeCorp" />
                 <HashtagChip label="SaaS" />
                 <HashtagChip label="Innovation" />
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a hashtag..." 
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm"
                />
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
                  Add
                </button>
              </div>
            </Section>

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

function Section({ title, icon, desc, children }: { title: string, icon: React.ReactNode, desc: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6 ml-14">{desc}</p>
      <div className="ml-0 md:ml-14">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, placeholder, defaultValue }: { label: string, placeholder: string, defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 transition-shadow"
      />
    </div>
  );
}

function TextareaField({ label, placeholder, defaultValue, rows = 3 }: { label: string, placeholder: string, defaultValue?: string, rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea 
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 transition-shadow resize-none"
      />
    </div>
  );
}

function ToneCard({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative ${
      active 
        ? 'border-[#25D366] bg-[#25D366]/5 text-[#075E54]' 
        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
    }`}>
      {active && (
        <div className="absolute top-2 right-2 text-[#25D366]">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
      <div className={`mb-2 [&>svg]:w-6 [&>svg]:h-6 ${active ? 'text-[#25D366]' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${active ? 'text-[#075E54]' : 'text-gray-600'}`}>{label}</span>
    </button>
  );
}

function HashtagChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#128C7E]/10 text-[#128C7E] border border-[#128C7E]/20 rounded-full text-sm font-medium">
      <span>#{label}</span>
      <button className="hover:text-[#075E54] hover:bg-[#128C7E]/20 rounded-full p-0.5 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
}
