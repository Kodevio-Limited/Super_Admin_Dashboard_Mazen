'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/verify-email');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F2F2F2]">
      {/* Left Banner Illustration */}
      <div className="relative hidden md:block w-1/2 lg:w-[48%] min-h-screen bg-gray-900 overflow-hidden">
        <Image
          src="/images/forgot-banner.png"
          alt="Password Recovery"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
          <div className="relative w-[140px] h-[42px] mb-6">
            <Image
              src="/images/logo-69e842.png"
              alt="Logo"
              fill
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <h2 className="text-3xl font-bold font-satoshi mb-2">
            Secure Password Recovery
          </h2>
          <p className="text-gray-200 text-sm max-w-md">
            Verify your identity with one-time security authentication and quickly regain access to your administrator controls.
          </p>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-[617px] bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6E727A] hover:text-[#2D2F33] mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Sign In</span>
            </Link>
            <h1 className="text-[40px] font-bold text-[#2D2F33] tracking-tight leading-tight mb-2">
              Forgot Password
            </h1>
            <p className="text-[#6E727A] text-[17px]">
              Provide email address which you used to create account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#2D2F33]">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#989898]">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full h-[56px] pl-12 pr-4 bg-[#F8F9FA] border border-[#E9E9E9] rounded-2xl text-[16px] text-[#2D2F33] focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[59px] bg-[#026F4F] hover:bg-[#01533B] active:scale-[0.99] text-white font-semibold text-[18px] rounded-full shadow-[0px_4px_16px_rgba(2,111,79,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Get Code</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
