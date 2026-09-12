export const sizeCanvasToDisplay = (canvas: HTMLCanvasElement, width: number, height: number): number => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  return ratio;
};

export const drawGridlines = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rows = 4,
) => {
  ctx.strokeStyle = "#ececeb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= rows; i += 1) {
    const yy = y + (h / rows) * i;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
  }
};

export const drawAxisLabels = (
  ctx: CanvasRenderingContext2D,
  pad: { left: number; top: number; right: number; bottom: number },
  chartW: number,
  chartH: number,
  height: number,
  min: number,
  max: number,
) => {
  ctx.font = "11px Inter, Arial";
  ctx.fillStyle = "#a3a3a0";
  ctx.textAlign = "right";
  const range = Math.max(max - min, 1);
  for (let i = 0; i <= 4; i += 1) {
    ctx.fillText(`${Math.round(max - (range / 4) * i)}`, pad.left - 12, pad.top + (chartH / 4) * i + 4);
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#aaa9a5";
  for (let i = 0; i <= 4; i += 1) {
    ctx.fillText(`${i * 25}%`, pad.left + (chartW / 4) * i, height - 8);
  }
};

export const decimateStep = (length: number, budget: number): number => Math.max(1, Math.ceil(length / budget));

export const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const clearCanvas = (ctx: CanvasRenderingContext2D, w: number, h: number, bg = "#fbfbfa") => {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
};
