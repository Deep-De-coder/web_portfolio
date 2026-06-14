/* ------------------------------------------------------------------ *
 * Draws the laptop boot sequence onto a 2D canvas (used as a Three.js
 * CanvasTexture for the MacBook screen). `stage` 0..1 drives the boot:
 *
 *   0.00–0.30  black → DS logo fades in
 *   0.30–0.62  progress bar fills, "initializing WebGPU"
 *   0.62–0.78  "WEBGPU READY · NPU 38 TOPS"
 *   0.78–1.00  Ask chat UI mock (user + assistant bubble, blinking cursor)
 *
 * `t` is wall-clock seconds for the blinking cursor.
 * ------------------------------------------------------------------ */

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const CYAN = '#22d3ee';
const INK = '#e8f6fb';

export function drawScreen(ctx, W, H, stage, t) {
  // Background — deep space with a faint vertical gradient + vignette.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#070a12');
  g.addColorStop(1, '#03040a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;

  // ---- Boot logo + progress (stage < 0.78) ----
  const bootFade = 1 - smooth(0.74, 0.82, stage); // fade boot UI out as chat arrives
  if (bootFade > 0.01) {
    ctx.globalAlpha = bootFade;

    // DS monogram mark
    const logoIn = smooth(0.02, 0.26, stage);
    const ringR = H * 0.12;
    const ly = H * 0.34;
    ctx.globalAlpha = bootFade * logoIn;
    ctx.lineWidth = Math.max(2, H * 0.006);
    ctx.strokeStyle = CYAN;
    ctx.beginPath();
    ctx.arc(cx, ly, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * logoIn);
    ctx.stroke();
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = H * 0.05 * logoIn;
    ctx.fillStyle = INK;
    ctx.font = `700 ${Math.round(H * 0.1)}px "Space Grotesk", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DS', cx, ly + H * 0.004);
    ctx.shadowBlur = 0;

    // Progress bar
    const prog = smooth(0.3, 0.62, stage);
    const barW = W * 0.42;
    const barH = Math.max(3, H * 0.012);
    const bx = cx - barW / 2;
    const by = H * 0.6;
    ctx.globalAlpha = bootFade * smooth(0.26, 0.34, stage);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, bx, by, barW, barH, barH / 2);
    ctx.fill();
    ctx.fillStyle = CYAN;
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = H * 0.03;
    roundRect(ctx, bx, by, barW * prog, barH, barH / 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Status line under the bar
    ctx.globalAlpha = bootFade * smooth(0.26, 0.34, stage);
    ctx.fillStyle = 'rgba(168,200,214,0.85)';
    ctx.font = `500 ${Math.round(H * 0.034)}px "DM Sans", system-ui, sans-serif`;
    const ready = stage > 0.62;
    const label = ready
      ? 'WEBGPU READY · NPU 38 TOPS'
      : `INITIALIZING WEBGPU · ${Math.round(prog * 100)}%`;
    ctx.fillStyle = ready ? CYAN : 'rgba(168,200,214,0.85)';
    ctx.fillText(label, cx, by + H * 0.08);

    ctx.globalAlpha = 1;
  }

  // ---- Chat UI (stage > 0.74) ----
  const chatIn = smooth(0.78, 0.92, stage);
  if (chatIn > 0.01) {
    ctx.globalAlpha = chatIn;
    const pad = W * 0.07;

    // Top bar
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, W, H * 0.12);
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    ctx.arc(pad, H * 0.06, H * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.font = `600 ${Math.round(H * 0.04)}px "DM Sans", system-ui, sans-serif`;
    ctx.fillText('Ask Deep · running locally', pad + H * 0.03, H * 0.06);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(34,211,238,0.7)';
    ctx.font = `500 ${Math.round(H * 0.03)}px "DM Sans", system-ui, sans-serif`;
    ctx.fillText('WebGPU', W - pad, H * 0.06);

    // User bubble (right)
    ctx.textAlign = 'left';
    const ubw = W * 0.5;
    const ubx = W - pad - ubw;
    const uby = H * 0.24;
    ctx.fillStyle = 'rgba(34,211,238,0.16)';
    roundRect(ctx, ubx, uby, ubw, H * 0.13, H * 0.03);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `500 ${Math.round(H * 0.038)}px "DM Sans", system-ui, sans-serif`;
    ctx.fillText('What can you build?', ubx + W * 0.03, uby + H * 0.075);

    // Assistant bubble (left) — types in
    const aby = H * 0.46;
    const abw = W * 0.62;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, pad, aby, abw, H * 0.32, H * 0.03);
    ctx.fill();
    ctx.fillStyle = 'rgba(232,246,251,0.92)';
    ctx.font = `500 ${Math.round(H * 0.038)}px "DM Sans", system-ui, sans-serif`;
    const full =
      'Production ML systems, in-browser AI, and fast, beautiful interfaces — running on-device, no data leaves your machine.';
    const typed = full.slice(0, Math.floor(full.length * smooth(0.82, 1.0, stage)));
    const lines = wrap(ctx, typed, abw - W * 0.06);
    lines.forEach((ln, i) => ctx.fillText(ln, pad + W * 0.03, aby + H * 0.06 + i * H * 0.055));
    // Blinking caret
    if (Math.floor(t * 2) % 2 === 0 && lines.length) {
      const last = lines[lines.length - 1];
      const cw = ctx.measureText(last).width;
      ctx.fillStyle = CYAN;
      ctx.fillRect(
        pad + W * 0.03 + cw + 4,
        aby + H * 0.06 + (lines.length - 1) * H * 0.055 - H * 0.03,
        Math.max(2, W * 0.004),
        H * 0.04
      );
    }
    ctx.globalAlpha = 1;
  }

  // Scanline sheen for a "screen" feel
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
