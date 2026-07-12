'use client';
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
  Check,
  CheckCircle2,
  Download,
  Zap,
  Building,
  Building2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const currentPlan: string = "Creator";

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
          <SidebarLink icon={<Bell />} label="Notifications" />
          <SidebarLink icon={<CreditCard />} label="Billing" active />
          <SidebarLink icon={<Settings />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <header>
            <h1 className="text-3xl font-extrabold text-[#075E54]">Billing & Subscription</h1>
            <p className="text-gray-600 mt-1">Manage your plan, billing details, and view your usage.</p>
          </header>

          {/* Current Plan Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Current Plan: {currentPlan}</h2>
                  <p className="text-sm font-semibold text-[#128C7E]">$29 / month, billed annually</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 md:ml-14 mt-2">Your next billing date is <strong className="text-gray-700">Nov 24, 2026</strong>. <br className="hidden md:block" />Your registered card ending in 4242 will be charged.</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm text-sm font-semibold transition-colors">
                Cancel Plan
              </button>
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl shadow-sm text-sm font-bold transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Usage Metrics Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Current Billing Cycle Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
               <UsageBar label="Posts Generated" current={142} total={250} />
               <UsageBar label="AI Credits" current={45} total={100} />
               <UsageBar label="Social Accounts" current={4} total={5} />
               <UsageBar label="Storage Used" current={2.4} total={5} unit="GB" />
            </div>
          </div>

          {/* Plan Comparison Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <PlanCard 
                name="Free"
                icon={<MessageCircle className="w-6 h-6 text-gray-500" />}
                price="$0"
                period="forever"
                description="Perfect for individuals just getting started."
                features={['1 Social Account', '10 AI Credits / mo', 'Basic Analytics', 'Community Support']}
                isActive={currentPlan === 'Free'}
              />

              <PlanCard 
                name="Creator"
                icon={<Zap className="w-6 h-6 text-[#25D366]" />}
                price="$29"
                period="per month"
                description="For solo creators and small brands growing their presence."
                features={['5 Social Accounts', '100 AI Credits / mo', 'Advanced Analytics', 'Email Support']}
                isActive={currentPlan === 'Creator'}
                highlight="Most Popular"
              />

              <PlanCard 
                name="Business"
                icon={<Building className="w-6 h-6 text-blue-500" />}
                price="$99"
                period="per month"
                description="For growing teams that need more power and collaboration."
                features={['15 Social Accounts', '500 AI Credits / mo', 'Team Collaboration', 'Priority Support']}
                isActive={currentPlan === 'Business'}
              />

              <PlanCard 
                name="Agency"
                icon={<Building2 className="w-6 h-6 text-purple-500" />}
                price="$249"
                period="per month"
                description="For agencies managing multiple clients and brands at scale."
                features={['Unlimited Accounts', 'Unlimited AI Credits', 'White-label Reports', 'Dedicated Manager']}
                isActive={currentPlan === 'Agency'}
              />

            </div>
          </div>

          {/* Billing History Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Billing History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 border-b border-gray-100 font-bold">Date</th>
                    <th className="px-6 py-4 border-b border-gray-100 font-bold">Description</th>
                    <th className="px-6 py-4 border-b border-gray-100 font-bold">Amount</th>
                    <th className="px-6 py-4 border-b border-gray-100 font-bold">Status</th>
                    <th className="px-6 py-4 border-b border-gray-100 text-right font-bold">Invoice</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  
                  <BillingRow 
                    date="Oct 24, 2026"
                    desc="Creator Plan - Monthly Subscription"
                    amount="$29.00"
                    status="Paid"
                  />
                  <BillingRow 
                    date="Sep 24, 2026"
                    desc="Creator Plan - Monthly Subscription"
                    amount="$29.00"
                    status="Paid"
                  />
                  <BillingRow 
                    date="Aug 24, 2026"
                    desc="Creator Plan - Monthly Subscription"
                    amount="$29.00"
                    status="Paid"
                  />
                  <BillingRow 
                    date="Jul 24, 2026"
                    desc="Creator Plan - Monthly Subscription"
                    amount="$29.00"
                    status="Failed"
                  />

                </tbody>
              </table>
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

function UsageBar({ label, current, total, unit = '' }: { label: string, current: number, total: number, unit?: string }) {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const isNearLimit = percentage >= 85;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {current}{unit} <span className="text-gray-400 font-medium">/ {total}{unit}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${isNearLimit ? 'bg-orange-500' : 'bg-[#25D366]'}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {isNearLimit && (
        <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Nearing limit
        </div>
      )}
    </div>
  );
}

function PlanCard({ name, icon, price, period, description, features, isActive, highlight }: { name: string, icon: React.ReactNode, price: string, period: string, description: string, features: string[], isActive: boolean, highlight?: string }) {
  return (
    <div className={`relative bg-white rounded-3xl border-2 flex flex-col transition-all hover:shadow-md ${
      isActive ? 'border-[#25D366] shadow-sm' : 'border-gray-100 shadow-sm hover:border-gray-200'
    }`}>
      {highlight && (
        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
          <span className="bg-[#075E54] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {highlight}
          </span>
        </div>
      )}
      
      <div className="p-6 border-b border-gray-100 flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-[#25D366]/10' : 'bg-gray-50'}`}>
            {icon}
          </div>
          <h4 className="text-xl font-bold text-gray-900">{name}</h4>
        </div>
        
        <div className="mb-4">
          <span className="text-3xl font-extrabold text-gray-900">{price}</span>
          <span className="text-sm font-medium text-gray-500 ml-1">{period}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-6 min-h-[40px] leading-relaxed">{description}</p>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-0 mt-6">
        {isActive ? (
          <button className="w-full py-3 bg-gray-50 text-[#075E54] border border-gray-200 rounded-xl text-sm font-bold cursor-default flex items-center justify-center gap-2">
             <Check className="w-4 h-4" />
             Current Plan
          </button>
        ) : (
          <button className="w-full py-3 bg-white border-2 border-gray-200 hover:border-[#128C7E] hover:bg-[#128C7E]/5 text-gray-700 hover:text-[#075E54] rounded-xl text-sm font-bold transition-colors">
            Select Plan
          </button>
        )}
      </div>
    </div>
  );
}

function BillingRow({ date, desc, amount, status }: { date: string, desc: string, amount: string, status: 'Paid' | 'Failed' }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{date}</td>
      <td className="px-6 py-4 text-gray-600">{desc}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">{amount}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
          status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button className="p-2 text-gray-400 hover:text-[#075E54] hover:bg-gray-100 rounded-lg transition-colors inline-flex justify-center" title="Download Invoice">
          <Download className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
