"use client";

import { useEffect, useRef } from "react";
import {
  CANVAS_W, CANVAS_H, GROUND_Y, BEE_H, OBS_W,
  drawSky, drawSun, drawClouds, drawTrees, drawGround,
  drawHoneycomb, drawHoneyDrip, drawPollenTrail, drawBee,
} from "./desenho";

// Ninhos da cena de prévia: posição inicial e abertura entre o de cima e o de baixo
const NINHOS = [
  { x: 360, topH: 110, botY: 260 },
  { x: 640, topH: 70,  botY: 220 },
  { x: 920, topH: 140, botY: 290 },
];
const SCROLL = 3.2;        // mesma velocidade do chão
const LOOP   = CANVAS_W + 280;
const BEE_PX = 190;

// Cena ilustrativa do Mandaçaia Run em canvas, usada no card da tela de seleção.
export default function PreviaMandacaiaRun({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let raf = 0;

    const desenhar = () => {
      drawSky(ctx);
      drawSun(ctx, frame);
      drawClouds(ctx, frame);
      drawTrees(ctx, frame);
      drawGround(ctx, frame);

      NINHOS.forEach((n) => {
        const x = ((n.x - frame * SCROLL) % LOOP + LOOP) % LOOP - 140;
        drawHoneycomb(ctx, x, 0, OBS_W, n.topH);
        drawHoneyDrip(ctx, x, n.topH, frame);
        drawHoneycomb(ctx, x, n.botY, OBS_W, GROUND_Y - n.botY);
      });

      // abelha voando em ondas pelo meio da cena
      const beeY = 175 + Math.sin(frame * 0.035) * 30;
      drawPollenTrail(ctx, BEE_PX, beeY, frame);
      drawBee(ctx, BEE_PX, beeY - BEE_H / 2, frame);
    };

    if (reduzirMovimento) {
      frame = 40;
      desenhar();
      return;
    }

    const loop = () => {
      frame++;
      desenhar();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className={`block w-full h-auto ${className}`}
      role="img"
      aria-label="Cena do jogo: a mandaçaia voa entre ninhos de cerume num campo florido"
    />
  );
}
