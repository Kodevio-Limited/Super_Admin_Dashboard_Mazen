'use client';

import { useEffect } from 'react';

// Reference-counted body scroll lock so nested modals don't prematurely
// restore scrolling while an outer modal is still open. The previous value is
// captured once (when the count goes 0 → 1): if each lock captured its own
// `prev`, a lock taken while another was active would restore 'hidden' when it
// happened to be the last to close, stranding the page with scrolling off.
let lockCount = 0;
let prevOverflow = '';

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (lockCount === 0) prevOverflow = document.body.style.overflow;
    lockCount += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = prevOverflow;
    };
  }, [active]);
}

export function useEscapeToClose(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active, onClose]);
}
