'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['2', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/reset-password');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F2F2F2]">
      {/* Left Banner Illustration */}
      <div className="relative hidden md:block w-1/2 lg:w-[48%] min-h-screen bg-gray-900 overflow-hidden">
        <Image
          src="/images/verify-banner.png"
          alt="Email Verification"
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
            Two-Factor Verification
          </h2>
          <p className="text-gray-200 text-sm max-w-md">
            Enter the 6-digit confirmation PIN dispatched to your registered super admin inbox.
          </p>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-[617px] bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-8">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6E727A] hover:text-[#2D2F33] mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <h1 className="text-[40px] font-bold text-[#2D2F33] tracking-tight leading-tight mb-2">
              Verify Email
            </h1>
            <p className="text-[#6E727A] text-[17px]">
              We&rsquo;ve sent 6 digits code on your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-[24px] font-bold text-[#026F4F] mb-6 font-satoshi">
                Verify OTP
              </h3>

              {/* 6-box OTP Inputs */}
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold text-[#2D2F33] bg-[#F8F9FA] border border-[#B9B9B9] focus:border-[#026F4F] focus:bg-white rounded-2xl focus:outline-none transition-all shadow-xs"
                  />
                ))}
              </div>

              <div className="text-right mt-4">
                <button
                  type="button"
                  onClick={() => alert('Verification code resent!')}
                  className="text-sm font-semibold text-[#026F4F] hover:underline"
                >
                  Send again
                </button>
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
                    <span>Verify</span>
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
