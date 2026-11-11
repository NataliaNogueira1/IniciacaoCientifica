"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { House, RotateCcw, BarChart2, Info, LogIn, Gamepad2, ArrowUp } from "lucide-react";

// ── Constantes do jogo ────────────────────────────────────────────────────────

const CANVAS_W = 900;
const CANVAS_H = 420;
const GROUND_Y = CANVAS_H - 56;

const BEE_X = 100;
const BEE_W = 42;
const BEE_H = 26;

// ── Recorde persistido no navegador ───────────────────────────────────────────
const BEST_KEY = "mandacaia-run:best";

function loadBest(): number {
  try {
    const n = parseInt(window.localStorage.getItem(BEST_KEY) ?? "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0; // localStorage indisponível (modo privado, bloqueado etc.)
  }
}

function saveBest(value: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* ignora falhas de escrita */
  }
}

// Física com controle justo:
// - JUMP_V: impulso inicial ao apertar (menor = salto mais curto e preciso)
// - GRAVITY_NORMAL: gravidade padrão enquanto sobe
// - GRAVITY_FALL: gravidade maior na descida (responsividade ao soltar)
// - MAX_FALL: velocidade máxima de queda (evita queda brusca demais)
const JUMP_V        = -5.5;  // impulso inicial suave
const GRAVITY_NORMAL = 0.28; // subida suave
const GRAVITY_FALL   = 0.50; // descida mais rápida → controle responsivo
const MAX_FALL       = 7.0;  // limite de velocidade de queda

const OBS_W           = 34;
const OBS_GAP_MIN     = 110;  // abertura menor → mais difícil
const OBS_GAP_MAX     = 160;
const OBS_SPACING_MIN = 240;  // obstáculos mais próximos
const OBS_SPACING_MAX = 340;
const OBS_SPEED_INIT  = 5.0;  // velocidade inicial maior
const OBS_SPEED_MAX   = 13.0;
const SPEED_INC       = 0.0012; // acelera mais rápido

type Phase = "idle" | "playing" | "dead";

interface Obs {
  x: number;
  topH: number;
  botY: number;
  passed: boolean;
}

// ── Helpers de desenho ────────────────────────────────────────────────────────

// Nuvens decorativas em parallax (fundo)
function drawClouds(ctx: CanvasRenderingContext2D, frame: number) {
  const clouds = [
    { x: 80,  y: 40,  r: 22, speed: 0.18 },
    { x: 260, y: 28,  r: 18, speed: 0.12 },
    { x: 460, y: 50,  r: 26, speed: 0.22 },
    { x: 650, y: 32,  r: 20, speed: 0.15 },
    { x: 820, y: 44,  r: 24, speed: 0.20 },
  ];
  ctx.save();
  clouds.forEach(({ x, y, r, speed }) => {
    const cx = ((x - frame * speed) % (CANVAS_W + 80) + CANVAS_W + 80) % (CANVAS_W + 80) - 40;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.arc(cx,     y,     r,       0, Math.PI * 2);
    ctx.arc(cx + r, y - 6, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.6, y + 2, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// Sol
function drawSun(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.save();
  const pulse = 1 + Math.sin(frame * 0.03) * 0.03;
  ctx.translate(52, 52);
  ctx.scale(pulse, pulse);
  // raios
  ctx.strokeStyle = "#fde047";
  ctx.lineWidth   = 2.5;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i + frame * 0.005;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
    ctx.lineTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
    ctx.stroke();
  }
  // disco
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = "#fbbf24";
  ctx.fill();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();
}

// Árvores no fundo (parallax médio)
function drawTrees(ctx: CanvasRenderingContext2D, frame: number) {
  const trees = [
    { x: 120, h: 55, w: 36 },
    { x: 310, h: 44, w: 30 },
    { x: 500, h: 60, w: 40 },
    { x: 700, h: 48, w: 32 },
    { x: 870, h: 52, w: 36 },
  ];
  ctx.save();
  trees.forEach(({ x, h, w }) => {
    const tx = ((x - frame * 0.6) % (CANVAS_W + 80) + CANVAS_W + 80) % (CANVAS_W + 80) - 40;
    const baseY = GROUND_Y;
    // tronco
    ctx.fillStyle = "#92400e";
    ctx.fillRect(tx - 4, baseY - h * 0.4, 8, h * 0.4);
    // copa
    ctx.beginPath();
    ctx.ellipse(tx, baseY - h * 0.45, w / 2, h * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#65a30d";
    ctx.fill();
    // florzinha no topo
    ctx.font = "12px serif";
    ctx.fillText("🌺", tx - 6, baseY - h * 0.95);
  });
  ctx.restore();
}

// Flores no chão com variedade
function drawGround(ctx: CanvasRenderingContext2D, frame: number) {
  // grama
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(0, GROUND_Y - 4, CANVAS_W, 4);
  // trilho
  ctx.fillStyle = "#78350f";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  // detalhe de grama com pontas
  ctx.fillStyle = "#22c55e";
  for (let gx = 0; gx < CANVAS_W; gx += 14) {
    const offset = ((gx - frame * 3.2) % CANVAS_W + CANVAS_W) % CANVAS_W;
    ctx.fillRect(offset, GROUND_Y - 8, 3, 8);
  }

  const flowerEmojis = ["🌸", "🌼", "🌻", "🌺", "🌷", "🍀", "🌸", "🌼"];
  const positions    = [40, 140, 250, 380, 490, 600, 720, 840];
  positions.forEach((px, i) => {
    const fx = ((px - frame * 3.2) % CANVAS_W + CANVAS_W) % CANVAS_W;
    ctx.font = "18px serif";
    ctx.fillText(flowerEmojis[i % flowerEmojis.length], fx, GROUND_Y + 24);
  });
}

// Mel escorrendo pela superfície do ninho: filetes descem devagar pelas bolinhas
// e, ao chegar na ponta, uma gota se solta, cai e some. Depois o ciclo recomeça.
// A fase usa topH para que os obstáculos não escorram todos ao mesmo tempo.
function drawHoneyDrip(ctx: CanvasRenderingContext2D, x: number, topH: number, frame: number) {
  const SPEED = 0.55;                        // px/frame do filete
  const FALL  = 45;                          // frames da gota caindo
  const REST  = 40;                          // pausa antes de recomeçar
  const run   = topH / SPEED;                // frames para o filete percorrer o ninho
  const total = run + FALL + REST;
  const lanes = [0.22, 0.52, 0.8];           // posição horizontal de cada filete

  lanes.forEach((lx, i) => {
    const f  = (frame + i * 67 + topH * 3) % total;
    const cx = x + OBS_W * lx;
    ctx.save();

    if (f < run) {
      // filete descendo pelo ninho (recortado na área do ninho)
      const head = f * SPEED;
      ctx.beginPath();
      ctx.rect(x, 0, OBS_W, topH);
      ctx.clip();
      ctx.strokeStyle = "rgba(251,191,36,0.9)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, head);
      ctx.stroke();
      ctx.fillStyle = "#fcd34d";
      ctx.beginPath();
      ctx.arc(cx, head, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (f < run + FALL) {
      // chegou à ponta: o filete esvai e a gota se solta e cai acelerando
      const k = (f - run) / FALL; // 0 → 1
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, 0, OBS_W, topH);
      ctx.clip();
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = "rgba(251,191,36,0.9)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, topH);
      ctx.stroke();
      ctx.restore();

      ctx.globalAlpha = 1 - k * k;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx, topH + 3 + k * k * 60, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}
// Rastro de pólen atrás da abelha
function drawPollenTrail(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.save();
  for (let i = 1; i <= 5; i++) {
    const tx     = x - i * 10;
    const ty     = y + BEE_H / 2 + Math.sin(frame * 0.2 + i) * 3;
    const alpha  = (1 - i / 6) * 0.5;
    const radius = 3 - i * 0.4;
    ctx.beginPath();
    ctx.arc(tx, ty, Math.max(radius, 0.5), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251,191,36,${alpha})`;
    ctx.fill();
  }
  ctx.restore();
}

// Abelha como emoji — simples e reconhecível
function drawBee(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const bob = Math.sin(frame * 0.18) * 1.5; // leve balanço vertical
  ctx.save();
  // Abelha desenhada em vetor: a orientação não depende da fonte de emoji do SO.
  // Cabeça sempre à direita (sentido do voo), ferrão à esquerda.
  ctx.translate(x, y + bob);
  const cy = BEE_H / 2;
  const flap = Math.sin(frame * 0.6) * 0.35;

  // asas (atrás do corpo)
  ctx.fillStyle = "rgba(186,230,253,0.85)";
  ctx.strokeStyle = "rgba(14,116,144,0.6)";
  ctx.lineWidth = 1;
  for (const dx of [0, 7]) {
    ctx.save();
    ctx.translate(16 + dx, cy - 6);
    ctx.rotate(-0.5 - flap);
    ctx.beginPath();
    ctx.ellipse(0, -6, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ferrão
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(4, cy - 2);
  ctx.lineTo(-2, cy);
  ctx.lineTo(4, cy + 2);
  ctx.closePath();
  ctx.fill();

  // corpo
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.ellipse(20, cy, 17, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // listras (recortadas no corpo)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(20, cy, 17, 10, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#451a03";
  ctx.fillRect(11, 0, 4, BEE_H);
  ctx.fillRect(19, 0, 4, BEE_H);
  ctx.fillRect(27, 0, 4, BEE_H);
  ctx.restore();

  // cabeça, olho e antena
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(37, cy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(39, cy - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(39.5, cy - 2, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(38, cy - 5);
  ctx.quadraticCurveTo(41, cy - 11, 44, cy - 9);
  ctx.stroke();
  ctx.restore();
}

// Ninho da Melipona quadrifasciata (mandaçaia): aglomerado de várias bolinhas
// (células e potes de cerume) em vez de favos hexagonais retos.
function drawHoneycomb(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  if (h <= 0) return;
  ctx.save();
  // recorta na área da hitbox para o desenho coincidir com a colisão
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // fundo escuro entre as bolinhas
  ctx.fillStyle = "#5c2a0a";
  ctx.fillRect(x, y, w, h);

  const r    = 5.6;   // raio base das bolinhas
  const rowH = 9.2;   // espaçamento vertical (bolinhas encostadas)
  const rows = Math.ceil(h / rowH) + 1;
  const tones = ["#b45309", "#d97706", "#f59e0b", "#a16207"];

  for (let row = 0; row < rows; row++) {
    const odd  = row % 2 === 1;
    const cols = odd ? 2 : 3;
    const gap  = w / 3;
    for (let col = 0; col < cols; col++) {
      const k  = row * 3 + col;
      const bx = x + (odd ? gap + col * gap : gap / 2 + col * gap);
      const by = y + row * rowH + 2;
      const br = r + Math.sin(k * 1.7) * 0.7; // leve variação de tamanho

      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = tones[k % tones.length];
      ctx.fill();
      ctx.strokeStyle = "#3b1a06";
      ctx.lineWidth = 1;
      ctx.stroke();

      // brilho
      ctx.beginPath();
      ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(254,243,199,0.7)";
      ctx.fill();
    }
  }
  ctx.restore();
}
function drawScore(ctx: CanvasRenderingContext2D, score: number, best: number) {
  ctx.save();
  ctx.fillStyle = "#451a03";
  ctx.font      = "bold 16px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`RECORDE ${String(best).padStart(5, "0")}`, CANVAS_W - 14, 26);
  ctx.fillText(String(score).padStart(5, "0"), CANVAS_W - 14, 48);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, lines: string[]) {
  ctx.save();
  ctx.fillStyle = "rgba(69,26,3,0.62)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fef08a";
  ctx.font      = "bold 30px monospace";
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 22);

  ctx.font      = "17px monospace";
  ctx.fillStyle = "#fde68a";
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_W / 2, CANVAS_H / 2 + 14 + i * 26);
  });
  ctx.restore();
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function JogoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({
    phase: "idle" as Phase,
    beeY:  GROUND_Y / 2 - BEE_H,
    beeVY: 0,
    holding: false,   // espaço/toque mantido pressionado
    obstacles: [] as Obs[],
    score: 0,
    best:  0,
    speed: OBS_SPEED_INIT,
    frame: 0,
  });
  const rafRef = useRef<number>(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best,  setBest ] = useState(0);

  // carrega o recorde salvo (só no cliente, para evitar divergência de hidratação)
  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = loadBest();
      stateRef.current.best = saved;
      setBest(saved);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function checkCollision(obs: Obs, beeY: number): boolean {
    const bx1 = BEE_X + 6,      bx2 = BEE_X + BEE_W - 6;
    const by1 = beeY  + 4,      by2 = beeY  + BEE_H - 4;
    const ox1 = obs.x,           ox2 = obs.x + OBS_W;
    if (bx2 < ox1 || bx1 > ox2) return false;
    if (by1 < obs.topH)          return true;
    if (by2 > obs.botY)          return true;
    return false;
  }

  function spawnObs(fromX: number): Obs {
    const gap  = OBS_GAP_MIN + Math.random() * (OBS_GAP_MAX - OBS_GAP_MIN);
    const topH = 50 + Math.random() * (GROUND_Y - gap - 100);
    return { x: fromX, topH, botY: topH + gap, passed: false };
  }

  function resetGame() {
    const s   = stateRef.current;
    s.phase   = "playing";
    s.beeY    = GROUND_Y / 2 - BEE_H;
    s.beeVY   = 0;
    s.holding = false;
    s.obstacles = [spawnObs(CANVAS_W + 80)];
    s.score   = 0;
    s.speed   = OBS_SPEED_INIT;
    s.frame   = 0;
    setPhase("playing");
    setScore(0);
  }

  const handleAction = useCallback(() => {
    const s = stateRef.current;
    if      (s.phase === "idle")    { resetGame(); }
    else if (s.phase === "playing") { s.beeVY = JUMP_V; }
    else if (s.phase === "dead")    { resetGame(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rastreia se o botão está pressionado para gravidade variável
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        const s = stateRef.current;
        if (!s.holding) {
          s.holding = true;
          handleAction();
        }
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        stateRef.current.holding = false;
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup",   onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup",   onUp);
    };
  }, [handleAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop() {
      if (!ctx) return;
      const s = stateRef.current;
      s.frame++;

      // fundo — gradiente céu mais rico
      const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      grad.addColorStop(0, "#bfdbfe"); // azul claro no topo
      grad.addColorStop(0.5, "#fef9c3");
      grad.addColorStop(1, "#fde68a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const f = s.phase === "playing" ? s.frame : 0;

      drawSun(ctx, s.frame);
      drawClouds(ctx, f);
      drawTrees(ctx, f);
      drawGround(ctx, f);

      if (s.phase === "playing") {
        // física com gravidade variável
        const grav = s.beeVY < 0 ? GRAVITY_NORMAL : GRAVITY_FALL;
        s.beeVY = Math.min(s.beeVY + grav, MAX_FALL);
        s.beeY  += s.beeVY;

        // limites
        if (s.beeY + BEE_H >= GROUND_Y) {
          s.beeY  = GROUND_Y - BEE_H;
          s.phase = "dead";
          setPhase("dead");
          if (s.score > s.best) { s.best = s.score; setBest(s.score); saveBest(s.score); }
        }
        if (s.beeY <= 0) { s.beeY = 0; s.beeVY = 0; }

        // velocidade crescente
        s.speed = Math.min(OBS_SPEED_MAX, s.speed + SPEED_INC);

        // mover obstáculos
        s.obstacles.forEach((o) => { o.x -= s.speed; });

        // spawn novo obstáculo quando o último cruzou o limiar
        const last = s.obstacles[s.obstacles.length - 1];
        const spacing = OBS_SPACING_MIN + Math.random() * (OBS_SPACING_MAX - OBS_SPACING_MIN);
        if (last && last.x < CANVAS_W - spacing) {
          s.obstacles.push(spawnObs(CANVAS_W + 30));
        }

        // limpar fora da tela
        s.obstacles = s.obstacles.filter((o) => o.x + OBS_W > -20);

        // score e colisão
        s.obstacles.forEach((o) => {
          if (!o.passed && o.x + OBS_W < BEE_X) {
            o.passed = true;
            s.score++;
            setScore(s.score);
          }
          if (checkCollision(o, s.beeY)) {
            s.phase = "dead";
            setPhase("dead");
            if (s.score > s.best) { s.best = s.score; setBest(s.score); saveBest(s.score); }
          }
        });
      }

      // obstáculos com gotinha de mel
      s.obstacles.forEach((o) => {
        drawHoneycomb(ctx, o.x, 0, OBS_W, o.topH);
        drawHoneyDrip(ctx, o.x, o.topH, s.frame);
        drawHoneycomb(ctx, o.x, o.botY, OBS_W, GROUND_Y - o.botY);
      });

      // rastro de pólen + abelha
      drawPollenTrail(ctx, BEE_X, s.beeY, s.frame);
      drawBee(ctx, BEE_X, s.beeY, s.frame);

      // score
      drawScore(ctx, s.score, s.best);

      // overlays
      if (s.phase === "idle") {
        drawOverlay(ctx, "🐝 Mandaçaia Run", [
          "Pressione Espaço, seta para cima ou toque para começar",
        ]);
      }
      if (s.phase === "dead") {
        drawOverlay(ctx, "💥 Colisão!", [
          `Pontuação: ${s.score}   Recorde: ${s.best}`,
          "Espaço, seta para cima ou toque para recomeçar",
        ]);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center" aria-label="Jogo Mandaçaia Run">

      {/* Nav pública — pill flutuante no desktop, barra no mobile */}
      <div className="hidden sm:flex fixed top-6 right-16 z-50 items-center" role="navigation">
        <div className="flex items-center bg-yellow-950 border-2 border-yellow-800 rounded-full px-2.5 py-2 gap-1.5 shadow-md">
          <Link href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </Link>
          <Link href="/abelhas" aria-label="Abelhas"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <Info size={17} strokeWidth={2} />
          </Link>
          <Link href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/jogo" aria-label="Jogo" aria-current="page"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 scale-110 shadow-inner transition-all duration-200">
            <Gamepad2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/login" aria-label="Entrar"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <LogIn size={17} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="sm:hidden w-full max-w-5xl bg-yellow-950 rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between mb-4" role="navigation">
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </Link>
          <Link href="/abelhas" aria-label="Abelhas"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <Info size={17} strokeWidth={2} />
          </Link>
          <Link href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/jogo" aria-label="Jogo" aria-current="page"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 transition-all duration-200">
            <Gamepad2 size={17} strokeWidth={2} />
          </Link>
        </div>
        <Link href="/login" aria-label="Entrar"
          className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
          <LogIn size={17} strokeWidth={2} />
        </Link>
      </div>

      {/* Título em caixa */}
      <div className="w-full max-w-5xl mb-4 sm:mt-16">
        <div className="bg-yellow-950 rounded-2xl shadow-xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shrink-0 text-2xl" aria-hidden="true">🐝</div>
          <div>
            <h1 className="text-2xl font-black text-yellow-300">Mandaçaia Run</h1>
            <p className="text-sm text-yellow-400 mt-0.5">Ajude a mandaçaia a desviar dos favos e bata seu recorde!</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="w-full max-w-5xl bg-yellow-950 rounded-2xl shadow-xl overflow-hidden cursor-pointer select-none"
        onPointerDown={() => { stateRef.current.holding = true; handleAction(); }}
        onPointerUp={()   => { stateRef.current.holding = false; }}
        onPointerLeave={() => { stateRef.current.holding = false; }}
        role="button"
        aria-label="Área do jogo — clique ou pressione espaço para jogar"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); handleAction(); }
        }}
      >
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-auto" />
      </div>

      {/* Placar + controles */}
      <div className="w-full max-w-5xl mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Pontuação</p>
          <p className="text-3xl font-bold text-yellow-950">{String(score).padStart(5, "0")}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Recorde</p>
          <p className="text-3xl font-bold text-amber-600">{String(best).padStart(5, "0")}</p>
        </div>
        <div className="bg-yellow-950 rounded-2xl shadow-xl p-4 flex flex-col gap-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-yellow-500 uppercase font-semibold tracking-wide">Controles</p>
          <div className="grid grid-cols-3 gap-2" role="list" aria-label="Formas de controlar a abelha">
            <kbd
              role="listitem"
              className="flex items-center justify-center h-11 rounded-lg bg-yellow-100 text-yellow-950 border-b-4 border-yellow-600 text-sm font-bold font-sans"
            >
              Espaço
            </kbd>
            <kbd
              role="listitem"
              aria-label="Seta para cima"
              className="flex items-center justify-center h-11 rounded-lg bg-yellow-100 text-yellow-950 border-b-4 border-yellow-600"
            >
              <ArrowUp size={20} strokeWidth={3} aria-hidden="true" />
            </kbd>
            <span
              role="listitem"
              className="flex items-center justify-center h-11 rounded-lg bg-yellow-900 border border-yellow-700 text-yellow-300 text-sm font-bold"
            >
              Toque
            </span>
          </div>
          <p className="text-sm text-yellow-400">Pressione para fazer a abelha subir e desviar dos favos de mel!</p>
        </div>
      </div>

      {phase === "dead" && (
        <button
          onClick={handleAction}
          className="mt-5 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-yellow-950 font-bold text-lg px-8 py-3 rounded-xl shadow-lg transition-colors"
        >
          <RotateCcw size={18} /> Jogar de novo
        </button>
      )}

      <p className="text-center text-xs text-yellow-800 opacity-60 mt-6 pb-4">
        © {new Date().getFullYear()} Projeto Colmeia Smart · SENAI Gaspar Ricardo Júnior
      </p>
    </main>
  );
}
