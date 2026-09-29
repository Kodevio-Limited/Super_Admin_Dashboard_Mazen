'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('sa.auth.login');
  const [email, setEmail] = useState('admin@restaurantecho.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F2F2F2]">
      {/* Left Banner */}
      <div className="relative hidden md:block w-1/2 lg:w-[48%] min-h-screen bg-gray-900 overflow-hidden">
        <Image src="/images/login-banner.png" alt="Restaurant Platform Admin" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
          <div className="relative w-[140px] h-[42px] mb-6">
            <Image src="/images/logo-69e842.png" alt="Logo" fill className="object-contain filter brightness-0 invert" />
          </div>
          <h2 className="text-3xl font-bold font-satoshi mb-2">{t('bannerTitle')}</h2>
          <p className="text-gray-200 text-sm max-w-md">{t('bannerDescription')}</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-[617px] bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-10 text-start">
            <h1 className="text-[40px] font-bold text-[#2D2F33] tracking-tight leading-tight mb-2">{t('title')}</h1>
            <p className="text-[#6E727A] text-[17px]">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#2D2F33]">{t('emailLabel')}</label>
              <div className="relative flex items-center">
                <div className="absolute start-4 text-[#989898]"><Mail size={20} /></div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  dir="ltr"
                  className="w-full h-[56px] ps-12 pe-4 bg-[#F8F9FA] border border-[#E9E9E9] rounded-2xl text-[16px] text-[#2D2F33] focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#2D2F33]">{t('passwordLabel')}</label>
              <div className="relative flex items-center">
                <div className="absolute start-4 text-[#989898]"><Lock size={20} /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full h-[56px] ps-12 pe-12 bg-[#F8F9FA] border border-[#E9E9E9] rounded-2xl text-[16px] text-[#2D2F33] focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 text-[#989898] hover:text-[#2D2F33] transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-end pt-1">
                <Link href="/forgot-password" className="text-sm font-semibold text-[#026F4F] hover:underline">{t('forgotPassword')}</Link>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isLoading} className="w-full h-[59px] bg-[#026F4F] hover:bg-[#01533B] active:scale-[0.99] text-white font-semibold text-[18px] rounded-full shadow-[0px_4px_16px_rgba(2,111,79,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('signIn')}</span>
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
