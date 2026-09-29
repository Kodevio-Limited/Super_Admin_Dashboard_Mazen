'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function VerifyEmailPage() {
  const router = useRouter();
  const t = useTranslations('sa.auth.verifyEmail');
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
          alt={t('bannerTitle')}
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
            {t('bannerTitle')}
          </h2>
          <p className="text-gray-200 text-sm max-w-md">
            {t('bannerDescription')}
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
              <ArrowLeft size={18} className="rtl:-scale-x-100" />
              <span>{t('back')}</span>
            </Link>
            <h1 className="text-[40px] font-bold text-[#2D2F33] tracking-tight leading-tight mb-2">
              {t('title')}
            </h1>
            <p className="text-[#6E727A] text-[17px]">
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-[24px] font-bold text-[#026F4F] mb-6 font-satoshi">
                {t('verifyOtp')}
              </h3>

              {/* 6-box OTP Inputs — order stays visually LTR for digit sequence */}
              <div className="flex items-center justify-between gap-2 sm:gap-4" dir="ltr">
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

              <div className="text-end mt-4">
                <button
                  type="button"
                  onClick={() => alert(t('codeResent'))}
                  className="text-sm font-semibold text-[#026F4F] hover:underline"
                >
                  {t('sendAgain')}
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
                    <span>{t('verify')}</span>
                    <ArrowRight size={20} className="rtl:-scale-x-100" />
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
