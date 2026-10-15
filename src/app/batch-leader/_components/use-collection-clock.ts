"use client";

import { useEffect, useState } from "react";

// A presentation clock; services remain authoritative for expiry and access.
export function useCollectionClock(referenceTime?: string) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (referenceTime) return;
    const timer = window.setInterval(() => setTick(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, [referenceTime]);
  return referenceTime ? Date.parse(referenceTime) : tick;
}
