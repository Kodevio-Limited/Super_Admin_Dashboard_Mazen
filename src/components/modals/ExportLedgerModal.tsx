'use client';

import React, { useState } from 'react';
import { Calendar, Download, X } from 'lucide-react';

interface ExportLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (startDate: string, endDate: string) => void;
}

export default function ExportLedgerModal({
  isOpen,
  onClose,
  onExport,
}: ExportLedgerModalProps) {
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-30');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      onExport(startDate, endDate);
      setDownloading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal Card - 666px x 407px from Figma #1940:1728 */}
      <div className="relative bg-white w-full max-w-[666px] rounded-[20px] p-8 md:p-10 shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-[27px] font-bold text-[#2D2F33] tracking-tight">
            Export Ledger
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#989898] hover:text-[#2D2F33] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-[17px] text-[#989898] leading-relaxed mb-8">
          Select a date range to download your full accounting history as a CSV file.
        </p>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#686868]">
              Start Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-14 px-4 bg-[#F8F9FA] border border-[#E9E9E9] rounded-2xl text-sm font-medium text-[#2D2F33] focus:border-[#026F4F] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#686868]">
              End Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-14 px-4 bg-[#F8F9FA] border border-[#E9E9E9] rounded-2xl text-sm font-medium text-[#2D2F33] focus:border-[#026F4F] focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 h-14 rounded-full bg-[#E9E9E9] hover:bg-gray-300 text-[#2D2F33] font-semibold text-base transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-8 h-14 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base shadow-[0px_4.8px_19.4px_13px_rgba(0,0,0,0.12)] transition-all flex items-center gap-2 cursor-pointer"
          >
            {downloading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Download size={18} />
                <span>Download CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
