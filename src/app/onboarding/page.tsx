'use client';

import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, ArrowRight, ArrowLeft, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  const steps = [
    { id: 1, title: 'Business Info' },
    { id: 2, title: 'Brand Personality' },
    { id: 3, title: 'Social Channels' },
    { id: 4, title: 'WhatsApp' },
    { id: 5, title: 'Complete Setup' },
  ];

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans selection:bg-[#25D366] selection:text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-3xl text-[#075E54] tracking-tight">Ripple</span>
        </div>
        <div className="text-sm font-semibold text-gray-500">
          Step {step} of 5
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#25D366] rounded-full z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        ></div>
        
        {steps.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s.id ? 'bg-[#25D366] text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'
            }`}>
              {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
            </div>
            <span className={`text-xs font-medium absolute -bottom-6 whitespace-nowrap ${
              step >= s.id ? 'text-[#075E54]' : 'text-gray-400'
            }`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12 mt-6">
        
        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-[#075E54]">Tell us about your business</h2>
            <p className="text-gray-600">This helps Ripple understand what you do and who you serve.</p>
            
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-semibold text-[#075E54] mb-2">Company Name</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#075E54] mb-2">Industry</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all bg-white text-gray-700">
                  <option>Select an industry...</option>
                  <option>E-commerce & Retail</option>
                  <option>Technology & Software</option>
                  <option>Healthcare & Wellness</option>
                  <option>Food & Beverage</option>
                  <option>Professional Services</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#075E54] mb-2">Website URL</label>
                <input type="url" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#075E54] mb-2">Business Description</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all resize-none" placeholder="What does your business do? What makes it special?"></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Brand Personality */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-[#075E54]">Choose your brand personality</h2>
            <p className="text-gray-600">How should Ripple sound when writing posts and responding to comments?</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              {['Professional', 'Friendly', 'Corporate', 'Educational', 'Creative', 'Humorous'].map((trait) => (
                <div key={trait} className="cursor-pointer border-2 border-gray-200 hover:border-[#25D366] rounded-2xl p-4 text-center transition-all hover:bg-[#25D366]/5 group">
                  <span className="font-bold text-gray-700 group-hover:text-[#075E54]">{trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Social Channels */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-[#075E54]">Connect your social channels</h2>
            <p className="text-gray-600">Where do you want Ripple to publish your content?</p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0077B5] rounded-full flex items-center justify-center text-white font-bold">in</div>
                  <div>
                    <h4 className="font-bold text-gray-800">LinkedIn</h4>
                    <p className="text-sm text-gray-500">Company Page or Personal Profile</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  Connect
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white font-bold">f</div>
                  <div>
                    <h4 className="font-bold text-gray-800">Facebook</h4>
                    <p className="text-sm text-gray-500">Facebook Page</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  Connect
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center text-white font-bold">ig</div>
                  <div>
                    <h4 className="font-bold text-gray-800">Instagram</h4>
                    <p className="text-sm text-gray-500">Professional Account</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: WhatsApp Connection */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <h2 className="text-3xl font-extrabold text-[#075E54]">Connect WhatsApp</h2>
            <p className="text-gray-600">Scan this code with your phone to link Ripple to your WhatsApp account.</p>
            
            <div className="flex justify-center mt-8 mb-6">
              <div className="w-64 h-64 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <QrCode className="w-16 h-16 mb-2" />
                <span className="font-medium text-sm">QR Code Placeholder</span>
              </div>
            </div>
            
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Waiting for scan...
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-[#25D366]/30 mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#075E54]">You're all set!</h2>
            <p className="text-gray-600">Ripple is ready to supercharge your marketing.</p>
            
            <div className="max-w-sm mx-auto mt-8 text-left space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                <span className="font-semibold text-gray-700">Business Profile Created</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                <span className="font-semibold text-gray-700">Brand Voice Analyzed</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                <span className="font-semibold text-gray-500">Social Accounts Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                <span className="font-semibold text-gray-700">WhatsApp Connected</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              step > 1 ? 'text-gray-600 hover:bg-gray-100' : 'text-transparent cursor-default'
            }`}
            disabled={step === 1}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          {step < 5 ? (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              className="flex items-center gap-2 px-8 py-3 bg-[#075E54] hover:bg-[#128C7E] text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
