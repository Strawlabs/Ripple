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
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandMemoryId, setBrandMemoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Controlled database fields
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('');
  const [rules, setRules] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');

  // Local state only fields (unsupported by DB schema)
  const [tagline, setTagline] = useState('Innovating the future of social management.');
  const [productsOfferings, setProductsOfferings] = useState('Social media scheduling tool, AI content generator, unified inbox, analytics dashboard.');
  const [servicesFeatures, setServicesFeatures] = useState('SaaS platform for marketing teams, dedicated account management for enterprise clients, 24/7 technical support.');

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

        // 1. Fetch brand
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandError) throw brandError;

        if (brandData) {
          setBrandId(brandData.id);
          setCompanyName(brandData.company_name || '');
          setTone(brandData.tone || 'Professional');

          // 2. Fetch brand memory using brandData.id
          const { data: memoryData, error: memoryError } = await supabase
            .from('brand_memory')
            .select('*')
            .eq('brand_id', brandData.id)
            .maybeSingle();

          if (memoryError) throw memoryError;

          if (memoryData) {
            setBrandMemoryId(memoryData.id);
            setAudience(memoryData.audience || '');
            setRules(memoryData.rules || '');
            
            let parsedHashtags: string[] = [];
            if (Array.isArray(memoryData.hashtags)) {
              parsedHashtags = memoryData.hashtags;
            }
            setHashtags(parsedHashtags);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch brand memory details.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let activeBrandId = brandId;
      
      if (activeBrandId) {
        // Update existing brand
        const { error: brandUpdateError } = await supabase
          .from('brands')
          .update({
            company_name: companyName.trim(),
            tone: tone
          })
          .eq('id', activeBrandId);

        if (brandUpdateError) throw brandUpdateError;
      } else {
        // Insert new brand
        const { data: newBrand, error: brandInsertError } = await supabase
          .from('brands')
          .insert({
            user_id: user.id,
            company_name: companyName.trim(),
            tone: tone
          })
          .select()
          .single();

        if (brandInsertError) throw brandInsertError;
        if (newBrand) {
          activeBrandId = newBrand.id;
          setBrandId(newBrand.id);
        }
      }

      if (!activeBrandId) {
        throw new Error('Could not establish brand record ID.');
      }

      // Handle brand memory table
      if (brandMemoryId) {
        // Update brand memory
        const { error: memoryUpdateError } = await supabase
          .from('brand_memory')
          .update({
            audience: audience.trim(),
            hashtags: hashtags,
            rules: rules.trim()
          })
          .eq('id', brandMemoryId);

        if (memoryUpdateError) throw memoryUpdateError;
      } else {
        // Insert brand memory
        const { data: newMemory, error: memoryInsertError } = await supabase
          .from('brand_memory')
          .insert({
            brand_id: activeBrandId,
            audience: audience.trim(),
            hashtags: hashtags,
            rules: rules.trim()
          })
          .select()
          .single();

        if (memoryInsertError) throw memoryInsertError;
        if (newMemory) {
          setBrandMemoryId(newMemory.id);
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving brand memory.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHashtag.trim()) return;
    const cleanTag = newHashtag.trim().replace(/^#/, '');
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags([...hashtags, cleanTag]);
    }
    setNewHashtag('');
  };

  const handleDeleteHashtag = (tagToDelete: string) => {
    setHashtags(hashtags.filter(t => t !== tagToDelete));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ece5dd] flex items-center justify-center">
        <div className="text-[#075E54] font-bold text-xl animate-pulse">Loading brand memory...</div>
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
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-md font-bold transition-colors w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
               <Save className="w-4 h-4" />
               {saving ? 'Saving...' : 'Save Brand Memory'}
            </button>
          </header>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Brand memory saved successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-8 pb-10">
            
            {/* Company Profile */}
            <Section title="Company Profile" icon={<Building className="w-5 h-5 text-[#128C7E]" />} desc="Basic information about your business.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField label="Company Name" placeholder="e.g. Acme Corp" value={companyName} onChange={setCompanyName} />
                <InputField label="Tagline" placeholder="e.g. Making the world better" value={tagline} onChange={setTagline} />
              </div>
              <div className="space-y-6">
                <TextareaField label="Products / Key Offerings" placeholder="What do you sell?" value={productsOfferings} onChange={setProductsOfferings} />
                <TextareaField label="Services / Core Features" placeholder="What services do you provide?" value={servicesFeatures} onChange={setServicesFeatures} />
              </div>
            </Section>

            {/* Brand Personality */}
            <Section title="Brand Personality" icon={<Sparkles className="w-5 h-5 text-purple-500" />} desc="Select the tone that best represents your brand's voice.">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ToneCard icon={<Briefcase />} label="Professional" active={tone === 'Professional'} onClick={() => setTone('Professional')} />
                <ToneCard icon={<Smile />} label="Friendly" active={tone === 'Friendly'} onClick={() => setTone('Friendly')} />
                <ToneCard icon={<Building />} label="Corporate" active={tone === 'Corporate'} onClick={() => setTone('Corporate')} />
                <ToneCard icon={<GraduationCap />} label="Educational" active={tone === 'Educational'} onClick={() => setTone('Educational')} />
                <ToneCard icon={<Palette />} label="Creative" active={tone === 'Creative'} onClick={() => setTone('Creative')} />
                <ToneCard icon={<Laugh />} label="Humorous" active={tone === 'Humorous'} onClick={() => setTone('Humorous')} />
              </div>
            </Section>

            {/* Target Audience */}
            <Section title="Target Audience" icon={<Users className="w-5 h-5 text-blue-500" />} desc="Who are you trying to reach?">
              <TextareaField 
                label="Audience Personas" 
                placeholder="Describe your ideal customers..." 
                value={audience} 
                onChange={setAudience}
                rows={3} 
              />
            </Section>

            {/* Content Rules */}
            <Section title="Content Rules" icon={<ShieldCheck className="w-5 h-5 text-orange-500" />} desc="Strict guidelines the AI should always follow.">
              <TextareaField 
                label="Guidelines & Restrictions" 
                placeholder="e.g. Always professional, avoid emojis..." 
                value={rules} 
                onChange={setRules}
                rows={4} 
              />
            </Section>

            {/* Preferred Hashtags */}
            <Section title="Preferred Hashtags" icon={<Hash className="w-5 h-5 text-pink-500" />} desc="Default hashtags to include in your posts.">
              <div className="mb-3 flex flex-wrap gap-2">
                 {hashtags.map((tag) => (
                   <HashtagChip key={tag} label={tag} onDelete={() => handleDeleteHashtag(tag)} />
                 ))}
              </div>
              <form onSubmit={handleAddHashtag} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a hashtag..." 
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800"
                />
                <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer">
                  Add
                </button>
              </form>
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

function InputField({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 transition-all"
      />
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange, rows = 3 }: { label: string, placeholder: string, value: string, onChange: (val: string) => void, rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm text-gray-800 transition-shadow resize-none"
      />
    </div>
  );
}

function ToneCard({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative cursor-pointer ${
        active 
          ? 'border-[#25D366] bg-[#25D366]/5 text-[#075E54]' 
          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
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

function HashtagChip({ label, onDelete }: { label: string, onDelete?: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#128C7E]/10 text-[#128C7E] border border-[#128C7E]/20 rounded-full text-sm font-medium">
      <span>#{label}</span>
      <button 
        type="button" 
        onClick={onDelete}
        className="hover:text-red-600 hover:bg-[#128C7E]/20 rounded-full p-0.5 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
}
