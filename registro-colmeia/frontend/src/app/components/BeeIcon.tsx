import React from "react";

export default function BeeIcon({ size = "2rem" }: { size?: string }) {
  const s = size;

  return (
    <>
      <style>{`
        .bee-wrap {
          --b: ${s};
          display: inline-block;
          position: relative;
          width: calc(var(--b) * 1.8 + var(--b) * 0.5);
          height: calc(var(--b) * 1.8);
        }

        /* ── corpo ── */
        .bee-body {
          height: var(--b);
          width: calc(var(--b) * 1.8);
          background-color: gold;
          background-image: linear-gradient(
            to right,
            transparent 34%, black 34%, black 49%,
            transparent 49%, transparent 61%,
            black 61%, black 76%, transparent 76%
          );
          border-radius: calc(var(--b) * 1.5);
          position: absolute;
          bottom: 0;
          left: 0;
          animation: bee-bounce 0.33s 0s alternate infinite ease-in-out;
        }

        @keyframes bee-bounce {
          from { transform: translateY(calc(var(--b) / -14)); }
          to   { transform: translateY(calc(var(--b) / -10)); }
        }

        /* ── asas ── */
        .bee-body::before,
        .bee-body::after {
          content: '';
          display: block;
          position: absolute;
          top: calc(var(--b) / -1.7);
          width: calc(var(--b) / 1.1);
          height: calc(var(--b) / 1.1);
          background-color: rgba(255,255,255,0.5);
          border-top-left-radius: var(--b);
          border-top-right-radius: var(--b);
          border-bottom-right-radius: var(--b);
          border: 2px solid rgba(0,0,0,0.5);
        }
        .bee-body::before {
          left: 40%;
          transform: rotate(-15deg);
        }
        .bee-body::after {
          border-color: rgba(0,0,0,0.3);
          z-index: -1;
          left: 20%;
        }

        /* ── olhos ── */
        .bee-face::before,
        .bee-face::after {
          content: '';
          display: block;
          position: absolute;
          height: calc(var(--b) / 5);
          width: calc(var(--b) / 8);
          background-color: black;
          border-radius: 50%;
          top: calc(var(--b) / 3);
        }
        .bee-face::before { left: 6%;  }
        .bee-face::after  { left: 20%; }
      `}</style>

      <div className="bee-wrap" aria-hidden="true">
        <div className="bee-body">
          <div className="bee-face" />
        </div>
      </div>
    </>
  );
}
