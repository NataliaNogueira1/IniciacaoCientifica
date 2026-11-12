// Funções de desenho do cenário do Mandaçaia Run, compartilhadas entre o jogo
// e a prévia exibida na tela de seleção de jogos (/jogo).

export const CANVAS_W = 900;
export const CANVAS_H = 420;
export const GROUND_Y = CANVAS_H - 56;

export const BEE_X = 100;
export const BEE_W = 42;
export const BEE_H = 26;

export const OBS_W = 34;

// Céu em gradiente (fundo)
export function drawSky(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, "#bfdbfe"); // azul claro no topo
  grad.addColorStop(0.5, "#fef9c3");
  grad.addColorStop(1, "#fde68a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

// Nuvens decorativas em parallax (fundo)
export function drawClouds(ctx: CanvasRenderingContext2D, frame: number) {
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
export function drawSun(ctx: CanvasRenderingContext2D, frame: number) {
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
export function drawTrees(ctx: CanvasRenderingContext2D, frame: number) {
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
export function drawGround(ctx: CanvasRenderingContext2D, frame: number) {
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
export function drawHoneyDrip(ctx: CanvasRenderingContext2D, x: number, topH: number, frame: number) {
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
export function drawPollenTrail(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
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

// Mandaçaia em vetor, no mesmo estilo dos predadores (formas chapadas e simples).
// Cabeça sempre à direita (sentido do voo). Abelha sem ferrão: abdômen arredondado.
export function drawBee(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const bob  = Math.sin(frame * 0.18) * 1.5; // leve balanço vertical
  const flap = Math.sin(frame * 0.6) * 0.35;
  const cy   = BEE_H / 2;
  ctx.save();
  ctx.translate(x, y + bob);

  // pernas
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (const lx of [22, 27, 32]) {
    ctx.beginPath();
    ctx.moveTo(lx, cy + 6);
    ctx.lineTo(lx - 2, cy + 11);
    ctx.stroke();
  }

  // asas (2 pares, atrás do corpo)
  ctx.fillStyle = "rgba(186,230,253,0.75)";
  ctx.strokeStyle = "rgba(14,116,144,0.6)";
  ctx.lineWidth = 1;
  for (const [wx, rot] of [[22, -0.7], [28, -0.25]] as const) {
    ctx.save();
    ctx.translate(wx, cy - 5);
    ctx.rotate(rot - flap);
    ctx.beginPath();
    ctx.ellipse(0, -7, 3.8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // abdômen (marrom escuro) com faixas amarelas da quadrifasciata
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.ellipse(14, cy, 13, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(14, cy, 13, 8.5, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#facc15";
  ctx.fillRect(6, 0, 3.5, BEE_H);
  ctx.fillRect(12, 0, 3.5, BEE_H);
  ctx.fillRect(18, 0, 3.5, BEE_H);
  ctx.restore();

  // tórax peludo
  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.ellipse(28, cy, 7.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // cabeça, olho e antena
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.arc(37, cy + 1, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(39, cy - 0.5, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0c0a09";
  ctx.beginPath();
  ctx.arc(39.6, cy - 0.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#292524";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(38, cy - 3.5);
  ctx.quadraticCurveTo(40, cy - 9, 44, cy - 8);
  ctx.stroke();

  ctx.restore();
}
// Ninho da Melipona quadrifasciata (mandaçaia): aglomerado de várias bolinhas
// (células e potes de cerume) em vez de favos hexagonais retos.
export function drawHoneycomb(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
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
