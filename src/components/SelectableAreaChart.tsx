'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
    <div ref={chartRef} className="relative h-full w-full cursor-pointer">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }} onClick={handleClick}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#026F4F" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#026F4F" stopOpacity={0.0} />
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
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#026F4F"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
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
        </AreaChart>
      </ResponsiveContainer>

      {selected && dotPos && (
        <div
          className="pointer-events-none absolute z-10"
          style={{ left: dotPos.x, top: dotPos.y, transform: 'translate(-50%, calc(-100% - 12px))' }}
        >
          <div className="rounded-[10px] border border-[#E9E9E9] bg-white p-3 shadow-md whitespace-nowrap">
            <p className="text-sm font-semibold text-[#2D2F33]">{selected.label}</p>
            <p className="text-sm text-[#026F4F]">{formatValue(selected.value)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
