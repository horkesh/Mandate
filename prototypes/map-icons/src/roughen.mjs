// Original presentation-only xorshift32. Never touches a game RNG stream.
export function hashSeed(value) {
  let hash = 2166136261;
  for (const c of String(value)) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return hash;
}

export function roughen(shape, seed) {
  let state = seed >>> 0 || 1;
  const noise = () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296 * 2 - 1;
  };
  const points = [];
  const segments = shape.closed ? shape.points.length : shape.points.length - 1;
  for (let i = 0; i < segments; i++) {
    const a = shape.points[i], b = shape.points[(i + 1) % shape.points.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0]-a[0], b[1]-a[1]) / 1.4));
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      points.push([a[0]+(b[0]-a[0])*t+noise()*0.105, a[1]+(b[1]-a[1])*t+noise()*0.105]);
    }
  }
  if (!shape.closed) points.push([...shape.points.at(-1)]);
  return { ...shape, points };
}
