'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        router.push('/onboarding');
      } else {
        throw new Error('Signup succeeded but no user data was returned.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Continue with Google clicked');
  };

  const handleWhatsAppSignup = () => {
    console.log('Continue with WhatsApp clicked');
  };

  return (
    <div className="min-h-screen bg-[#ece5dd] font-sans selection:bg-[#25D366] selection:text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-3xl text-[#075E54] tracking-tight">Ripple</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-[#075E54]">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign up to manage your AI marketing campaigns. <br />
          Already have an account? <Link href="/login" className="font-semibold text-[#128C7E] hover:text-[#075E54]">Log in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#075E54]">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all text-gray-900"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#075E54]">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all text-gray-900"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#075E54]">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#075E54]">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-white bg-[#25D366] hover:bg-[#128C7E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 rounded-full">Or continue with</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleWhatsAppSignup}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-[#25D366] rounded-2xl shadow-sm bg-white text-lg font-bold text-[#075E54] hover:bg-[#25D366]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] transition-all"
              >
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
                Continue with WhatsApp
              </button>
              
              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-2xl shadow-sm bg-white text-lg font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
