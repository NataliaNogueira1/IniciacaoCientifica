"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BeeOverlayProps {
  active: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
  onDone: () => void;
}

function getFilledRects(form: HTMLFormElement): DOMRect[] {
  return Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    )
  )
    .filter((el) => el.value.trim() !== "")
    .map((el) => el.getBoundingClientRect());
}

export default function BeeOverlay({ active, formRef, onDone }: BeeOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ranRef = useRef(false);

  // Garante que o portal só renderiza no cliente
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!active || !mounted) return;
    if (ranRef.current) return;
    ranRef.current = true;

    // Pequeno delay para garantir que o containerRef já está no DOM
    const startTimer = setTimeout(() => {
      if (!formRef.current || !containerRef.current) {
        onDone();
        ranRef.current = false;
        return;
      }

      const rects = getFilledRects(formRef.current);
      if (rects.length === 0) {
        onDone();
        ranRef.current = false;
        return;
      }

      const container = containerRef.current;
      container.innerHTML = "";
      const vw = window.innerWidth;

      rects.forEach((rect, i) => {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        Object.assign(span.style, {
          position: "fixed",
          left: `${rect.left + rect.width * 0.15}px`,
          top: `${rect.top + rect.height / 2}px`,
          fontSize: "18px",
          lineHeight: "1",
          zIndex: "9999",
          pointerEvents: "none",
          userSelect: "none",
        });
        span.textContent = "🐝";
        container.appendChild(span);

        const delay = i * 120;
        const dur = 1100 + (i % 3) * 150;
        const curveY = (i % 2 === 0 ? -1 : 1) * (30 + (i % 4) * 15);

        span.animate(
          [
            { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
            { transform: `translate(${vw * 0.25}px, ${curveY}px) scale(1.1)`, opacity: 1, offset: 0.4 },
            { transform: `translate(${vw * 0.6}px, ${curveY * 0.5}px) scale(0.9)`, opacity: 0.8, offset: 0.75 },
            { transform: `translate(${vw}px, ${curveY * 0.2}px) scale(0.6)`, opacity: 0 },
          ],
          { duration: dur, delay, easing: "ease-in", fill: "forwards" }
        );
      });

      const lastDelay = (rects.length - 1) * 120;
      const lastDur = 1100 + ((rects.length - 1) % 3) * 150;
      const totalMs = lastDelay + lastDur + 300;

      timerRef.current = setTimeout(() => {
        container.innerHTML = "";
        ranRef.current = false;
        onDone();
      }, totalMs);
    }, 50);

    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset ranRef quando active volta a false
  useEffect(() => {
    if (!active) ranRef.current = false;
  }, [active]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
      aria-hidden="true"
    />,
    document.body
  );
}
