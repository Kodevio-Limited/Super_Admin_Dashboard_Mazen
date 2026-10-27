'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

// Selectable area chart mirroring the Owner dashboard Reports & Analytics →
// Revenue Over Time interaction: click a point to select/deselect it (dot +
// dashed guide + value tooltip), scroll over the chart to move the selection.
interface SelectableAreaChartProps {
  data: { label: string; value: number }[];
  formatValue: (v: number) => string;
  yDomain: [number, number];
  yTicks: number[];
  formatTick: (v: number) => string;
  gradientId: string;
}

export default function SelectableAreaChart({
  data,
  formatValue,
  yDomain,
  yTicks,
  formatTick,
  gradientId,
}: SelectableAreaChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((state: any) => {
    const idx = state?.activeTooltipIndex;
    if (idx === undefined || idx === null) return;
    setSelectedIndex((prev) => {
      if (prev === idx) {
        setDotPos(null);
        return null;
      }
      return idx;
    });
  }, []);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      // Scrolling over the chart moves the selection instead of the page.
      e.preventDefault();
      const direction = Math.sign(e.deltaY);
      setSelectedIndex((prev) => {
        const base = prev ?? 0;
        const next = base - direction;
        return Math.max(0, Math.min(data.length - 1, next));
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [data.length]);

  const selected = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <div ref={chartRef} className="relative h-full w-full cursor-pointer select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }} onClick={handleClick}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#026F4F" stopOpacity={0.18} />
              <stop offset="60%" stopColor="#026F4F" stopOpacity={0.04} />
              <stop offset="100%" stopColor="#026F4F" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E9E9E9" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#E9E9E9' }}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatTick}
          />
          {selectedIndex !== null && selected && (
            <ReferenceLine
              segment={[
                { x: selected.label, y: yDomain[0] },
                { x: selected.label, y: selected.value },
              ]}
              stroke="#026F4F"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#026F4F"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            isAnimationActive={false}
            activeDot={false}
            dot={(props: any) => {
              const { index, cx, cy } = props;
              if (index !== selectedIndex) return <g key={`dot-${index}`} />;
              return (
                <circle
                  key={`dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="#026F4F"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  ref={(node) => {
                    if (!node) return;
                    setDotPos((prev) =>
                      prev && prev.x === cx && prev.y === cy ? prev : { x: cx, y: cy },
                    );
                  }}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {selected && dotPos && (
        <div
          className="pointer-events-none absolute z-20 transition-all duration-150"
          style={{ left: dotPos.x, top: dotPos.y, transform: 'translate(-50%, calc(-100% - 14px))' }}
        >
          <div className="rounded-xl border border-gray-100 bg-white/95 px-3.5 py-2 shadow-xl backdrop-blur-sm whitespace-nowrap">
            <p className="text-xs font-medium text-[#989898]">{selected.label}</p>
            <p className="text-sm font-bold text-[#026F4F] mt-0.5">{formatValue(selected.value)}</p>
          </div>
          <div className="mx-auto -mt-1 h-2 w-2 rotate-45 border-r border-b border-gray-100 bg-white shadow-sm" />
        </div>
      )}
    </div>
  );
}
