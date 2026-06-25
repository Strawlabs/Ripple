import React from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  Share2, 
  CalendarClock, 
  LineChart, 
  BrainCircuit,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const metadata = {
  title: 'Ripple | Your AI Marketing Manager on WhatsApp',
  description: 'Create posts, generate images, publish content, schedule campaigns, and manage social media using simple WhatsApp conversations.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans selection:bg-[#25D366] selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#075E54]">Ripple</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-gray-600 hover:text-gray-900 font-medium">Log in</button>
            <button className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-full font-medium transition-colors">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#075E54] tracking-tight">
              Your AI Marketing Manager <br className="hidden md:block"/>on <span className="text-[#25D366]">WhatsApp</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create posts, generate images, publish content, schedule campaigns, and manage social media using simple WhatsApp conversations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#075E54] border-2 border-gray-200 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#075E54]">Everything you need, right in your chat</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<MessageCircle className="w-6 h-6 text-[#25D366]" />}
                title="WhatsApp Posting"
                description="Manage all your social channels without ever leaving your favorite messaging app."
              />
              <FeatureCard 
                icon={<Sparkles className="w-6 h-6 text-[#25D366]" />}
                title="AI Content Creation"
                description="Generate engaging copy, hashtags, and even images just by texting what you want."
              />
              <FeatureCard 
                icon={<Share2 className="w-6 h-6 text-[#25D366]" />}
                title="Social Publishing"
                description="Publish instantly to LinkedIn, Facebook, Instagram, and X with one approval message."
              />
              <FeatureCard 
                icon={<CalendarClock className="w-6 h-6 text-[#25D366]" />}
                title="Scheduling"
                description="Tell Ripple to 'post this on Friday at 9am' and consider it done."
              />
              <FeatureCard 
                icon={<LineChart className="w-6 h-6 text-[#25D366]" />}
                title="Analytics"
                description="Ask 'how did my posts do this week?' and get a clear summary right in chat."
              />
              <FeatureCard 
                icon={<BrainCircuit className="w-6 h-6 text-[#25D366]" />}
                title="Brand Memory"
                description="Ripple remembers your brand voice, preferred colors, and target audience."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-[#ece5dd]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#075E54] mb-16">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <StepCard step="1" title="Send Message" description="Text Ripple your idea or upload a photo." />
              <StepCard step="2" title="AI Creates Content" description="Ripple writes the perfect copy and adds hashtags." />
              <StepCard step="3" title="Approve" description="Review the draft in WhatsApp and say 'looks good'." />
              <StepCard step="4" title="Publish Everywhere" description="Ripple schedules and posts it across platforms." />
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-400 mb-8">Works with your favorite platforms</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              <div className="font-bold text-xl text-gray-800">WhatsApp</div>
              <div className="font-bold text-xl text-gray-800">LinkedIn</div>
              <div className="font-bold text-xl text-gray-800">Facebook</div>
              <div className="font-bold text-xl text-gray-800">Instagram</div>
              <div className="font-bold text-xl text-gray-800">X (Twitter)</div>
              <div className="font-bold text-xl text-gray-800">YouTube</div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 bg-[#ece5dd]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#075E54] mb-16">Simple Pricing</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <PricingCard name="Free" price="$0" features={["5 AI posts/mo", "1 Platform", "Standard Support"]} />
              <PricingCard name="Creator" price="$29" featured features={["30 AI posts/mo", "3 Platforms", "Priority Support"]} />
              <PricingCard name="Business" price="$99" features={["Unlimited posts", "All Platforms", "Custom Brand Voice"]} />
              <PricingCard name="Agency" price="$299" features={["White-label", "Multiple brands", "24/7 Phone Support"]} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#075E54] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
            <span className="font-bold text-xl">Ripple</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Ripple. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#075E54] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm relative pt-12">
      <div className="absolute -top-6 left-6 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-[#ece5dd]">
        {step}
      </div>
      <h3 className="text-xl font-bold text-[#075E54] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, features, featured = false }: { name: string, price: string, features: string[], featured?: boolean }) {
  return (
    <div className={`p-6 rounded-3xl ${featured ? 'bg-[#25D366] text-white shadow-xl scale-105' : 'bg-white text-gray-800 border border-gray-200'}`}>
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <div className="text-4xl font-extrabold mb-6">{price}<span className="text-sm font-normal opacity-80">/mo</span></div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${featured ? 'text-white' : 'text-[#25D366]'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-xl font-bold transition-colors ${featured ? 'bg-white text-[#075E54] hover:bg-gray-50' : 'bg-[#ece5dd] text-[#075E54] hover:bg-gray-200'}`}>
        Get Started
      </button>
    </div>
  );
}
