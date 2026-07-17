"use client";

import { useEffect, useRef, useState } from "react";

/** Animación al entrar en viewport sin ocultar el HTML del servidor (evita “página vacía”). */
export function LandingFadeIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={
        visible
          ? "translate-y-0 opacity-100 transition-all duration-700 ease-out"
          : "translate-y-3 opacity-90 transition-none"
      }
    >
      {children}
    </div>
  );
}
