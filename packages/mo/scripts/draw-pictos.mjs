#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "svg", "pictos");

const INK = "#1E2A2E";
const C = {
  white: "#FFFDF9",
  cream: "#F7EBD6",
  sand: "#EBD5B0",
  honey: "#F0C46A",
  honeyDeep: "#E2AE55",
  honeyLight: "#FBE3A8",
  peach: "#FBD9C4",
  pink: "#F4B9A0",
  coral: "#EE9A8A",
  mint: "#BFE0D4",
  mintLight: "#D9EEE6",
  sky: "#BFE3F2",
  skyLight: "#DFF0F6",
  lilac: "#C9C1EC",
  lilacLight: "#E6E2F4",
  teal: "#3A8C93",
  tealLight: "#6FB3B8",
  tealPale: "#9FC9CC",
  brown: "#7A4E33",
  stone: "#E7E1D4",
};

function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const rad = (deg) => (deg * Math.PI) / 180;

function sampleSegment(a, b, step = 1.2) {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
  const out = [];
  for (let i = 0; i < n; i++) out.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
  return out;
}

function arcPoints(cx, cy, rx, ry, a0, a1, rot = 0) {
  const span = Math.abs(a1 - a0);
  const n = Math.max(8, Math.ceil((rad(span) * Math.max(rx, ry)) / 1.2));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    const r = rad(rot);
    out.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return out;
}

function ellipse(cx, cy, rx, ry = rx, rot = 0) {
  const pts = arcPoints(cx, cy, rx, ry, 0, 360, rot);
  pts.pop();
  return pts;
}

const circle = (cx, cy, r) => ellipse(cx, cy, r, r);

function quad(a, c, b, n = 10) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

function roundPoly(input, radius = 4) {
  const points = input.filter((p, i) => {
    const q = input[(i + 1) % input.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.01;
  });
  const n = points.length;
  const corners = points.map((cur, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const r = Array.isArray(radius) ? radius[i] : radius;
    const d1 = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    const d2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const k1 = Math.min(r, d1 / 2) / d1;
    const k2 = Math.min(r, d2 / 2) / d2;
    return {
      cur,
      r,
      a: [cur[0] + (prev[0] - cur[0]) * k1, cur[1] + (prev[1] - cur[1]) * k1],
      b: [cur[0] + (next[0] - cur[0]) * k2, cur[1] + (next[1] - cur[1]) * k2],
    };
  });
  const out = [];
  corners.forEach((c, i) => {
    out.push(...quad(c.a, c.cur, c.b, Math.max(4, Math.ceil(c.r))));
    out.push(...sampleSegment(c.b, corners[(i + 1) % n].a));
  });
  return out;
}

const rrect = (x, y, w, h, r = 6) =>
  roundPoly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    r,
  );

function catmull(points, closed = true, perSeg = 12) {
  const out = [];
  const n = points.length;
  const get = (i) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(points[n - 1]);
  return out;
}

function blob(cx, cy, radii, rot = 0) {
  const n = radii.length;
  return catmull(radii.map((r, i) => {
    const a = rad(rot + (360 * i) / n);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }));
}

function rotate(points, cx, cy, deg) {
  const r = rad(deg);
  return points.map(([x, y]) => [cx + (x - cx) * Math.cos(r) - (y - cy) * Math.sin(r), cy + (x - cx) * Math.sin(r) + (y - cy) * Math.cos(r)]);
}

function polyline(points, step = 1.2) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) out.push(...sampleSegment(points[i], points[i + 1], step));
  out.push(points[points.length - 1]);
  return out;
}

function resample(points, closed, step = 1.1) {
  const src = closed ? [...points, points[0]] : points;
  const out = [];
  for (let i = 0; i < src.length - 1; i++) out.push(...sampleSegment(src[i], src[i + 1], step));
  if (!closed) out.push(src[src.length - 1]);
  return out;
}

function normals(points, closed) {
  const n = points.length;
  return points.map((p, i) => {
    const a = points[closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
    const b = points[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
}

function widthProfile(n, base, rand, closed) {
  const knots = Math.max(3, Math.round(n / 18));
  const vals = Array.from({ length: knots + 1 }, () => 1 + (rand() - 0.5) * 0.36);
  if (closed) vals[knots] = vals[0];
  return Array.from({ length: n }, (_, i) => {
    const t = (i / Math.max(1, n - 1)) * knots;
    const k = Math.min(knots - 1, Math.floor(t));
    const f = t - k;
    const s = f * f * (3 - 2 * f);
    let w = base * (vals[k] * (1 - s) + vals[k + 1] * s);
    if (!closed) {
      const edge = Math.min(i, n - 1 - i) / Math.max(1, n - 1);
      w *= 0.75 + 0.25 * Math.min(1, edge * 6);
    }
    return w;
  });
}

function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let best = -1;
    let dist = eps;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (d > dist) {
        dist = d;
        best = i;
      }
    }
    if (best >= 0) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const fmt = (pts) => {
  if (pts.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) throw new Error("Point non fini dans un tracé.");
  return path(simplify(pts, 0.12));
};

const path = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + "Z";

function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function inkRing(shape, width, rand) {
  let pts = resample(shape, true);
  if (signedArea(pts) < 0) pts = pts.toReversed();
  const nm = normals(pts, true);
  const w = widthProfile(pts.length, width, rand, true);
  const outer = pts.map((p, i) => [p[0] - nm[i][0] * w[i] * 0.5, p[1] - nm[i][1] * w[i] * 0.5]);
  const inner = pts.map((p, i) => [p[0] + nm[i][0] * w[i] * 0.5, p[1] + nm[i][1] * w[i] * 0.5]).toReversed();
  return fmt(outer) + fmt(inner);
}

function inkStroke(line, width, rand) {
  const pts = resample(line, false);
  const nm = normals(pts, false);
  const w = widthProfile(pts.length, width, rand, false);
  const left = pts.map((p, i) => [p[0] + nm[i][0] * w[i] * 0.5, p[1] + nm[i][1] * w[i] * 0.5]);
  const right = pts.map((p, i) => [p[0] - nm[i][0] * w[i] * 0.5, p[1] - nm[i][1] * w[i] * 0.5]);
  const cap = (p, n, r, from) => {
    const a0 = Math.atan2(n[1], n[0]);
    const out = [];
    for (let k = 1; k < 8; k++) {
      const a = a0 + (from ? -1 : 1) * Math.PI * (k / 8);
      out.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]);
    }
    return out;
  };
  const last = pts.length - 1;
  const endCap = cap(pts[last], nm[last], w[last] * 0.5, true);
  const startCap = cap(pts[0], [-nm[0][0], -nm[0][1]], w[0] * 0.5, true);
  return fmt([...left, ...endCap, ...right.toReversed(), ...startCap]);
}

function centroid(pts) {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
}

function rayHit(pts, c, a) {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  let best = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const ex = x2 - x1;
    const ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((x1 - c[0]) * ey - (y1 - c[1]) * ex) / den;
    const u = ((x1 - c[0]) * dy - (y1 - c[1]) * dx) / den;
    if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
  }
  return best;
}

function crescent(shape, depth = 0.22) {
  const pts = resample(shape, true, 1.5);
  const c = centroid(pts);
  const out = [];
  const back = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const a = rad(15 + (150 * i) / n);
    const r = rayHit(pts, c, a);
    const pinch = Math.sin((Math.PI * i) / n);
    const ri = r * (1 - depth * pinch);
    out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
    back.push([c[0] + Math.cos(a) * ri, c[1] + Math.sin(a) * ri - r * depth * 0.35 * pinch]);
  }
  return fmt([...out, ...back.toReversed()]);
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * 0.86));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function drawing(name, inkWidth) {
  const rand = rng(`${name}:${inkWidth}`);
  const paths = [];
  const api = {
    fill(shape, color, { ink = true, shadow = true, width = 1 } = {}) {
      paths.push(`<path d="${fmt(shape)}" fill="${color}"/>`);
      if (shadow) paths.push(`<path d="${crescent(shape)}" fill="${shade(color)}" opacity="0.55"/>`);
      if (ink) paths.push(`<path d="${inkRing(shape, inkWidth * width, rand)}" fill="${INK}"/>`);
    },
    flat(shape, color, opacity) {
      paths.push(`<path d="${fmt(shape)}" fill="${color}"${opacity ? ` opacity="${opacity}"` : ""}/>`);
    },
    line(points, { width = 1, color = INK, smooth = false } = {}) {
      const pts = smooth ? catmull(points, false) : polyline(points);
      paths.push(`<path d="${inkStroke(pts, inkWidth * width, rand)}" fill="${color}"/>`);
    },
    arc(cx, cy, r, a0, a1, opts) {
      api.line(arcPoints(cx, cy, r, r, a0, a1), opts);
    },
    band(points, thickness, color, { smooth = true } = {}) {
      const pts = resample(smooth ? catmull(points, false) : polyline(points), false);
      const nm = normals(pts, false);
      const left = pts.map((p, i) => [p[0] + nm[i][0] * thickness * 0.5, p[1] + nm[i][1] * thickness * 0.5]);
      const right = pts.map((p, i) => [p[0] - nm[i][0] * thickness * 0.5, p[1] - nm[i][1] * thickness * 0.5]);
      api.fill([...left, ...right.toReversed()], color, { shadow: false });
    },
    dot(cx, cy, r, color = INK) {
      paths.push(`<path d="${fmt(circle(cx, cy, r))}" fill="${color}"/>`);
    },
    sparkle(cx, cy, s, color = INK) {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = rad(-90 + i * 45);
        const r = i % 2 === 0 ? s : s * 0.28;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      paths.push(`<path d="${fmt(catmull(pts, true, 3))}" fill="${color}"/>`);
    },
    highlight(cx, cy, rx, ry, rot = -30) {
      paths.push(`<path d="${fmt(ellipse(cx, cy, rx, ry, rot))}" fill="#FFFFFF" opacity="0.7"/>`);
    },
  };
  return { api, paths };
}

const face = (d, color) => {
  d.fill(circle(60, 60, 36), color);
  d.highlight(46, 40, 7, 4);
};

const PICTOS = {
  lit(d) {
    d.fill(rrect(16, 34, 12, 66, 5), C.teal, { shadow: false });
    d.fill(rrect(96, 56, 10, 44, 4), C.teal, { shadow: false });
    d.fill(rrect(22, 62, 80, 20, 7), C.white);
    d.fill(ellipse(40, 58, 13, 8, -6), C.white, { shadow: false });
    d.fill(roundPoly([[52, 54], [100, 58], [100, 82], [50, 82]], 7), C.honey);
    d.line([[60, 64], [92, 66]], { width: 0.7 });
    d.line([[22, 92], [102, 92]], { width: 0.9 });
  },
  pomme(d) {
    d.fill(catmull([[60, 40], [74, 32], [92, 40], [96, 62], [86, 90], [72, 100], [60, 96], [48, 100], [34, 90], [24, 62], [28, 40], [46, 32]]), C.coral);
    d.highlight(40, 50, 6, 4);
    d.line([[60, 42], [62, 30], [66, 20]], { smooth: true });
    d.fill(ellipse(76, 26, 11, 5.5, -25), C.mint, { shadow: false });
  },
  pizza(d) {
    d.fill(roundPoly([[24, 34], [96, 34], [60, 104]], [6, 6, 8]), C.honeyLight);
    d.fill(rrect(20, 24, 80, 16, 8), C.honeyDeep, { shadow: false });
    d.fill(circle(50, 52, 7), C.coral, { shadow: false });
    d.fill(circle(70, 50, 6), C.coral, { shadow: false });
    d.fill(circle(60, 74, 6), C.coral, { shadow: false });
    d.dot(64, 62, 2.2, C.mint);
    d.dot(46, 66, 1.8, C.mint);
  },
  glace(d) {
    d.fill(roundPoly([[38, 60], [82, 60], [60, 108]], [4, 4, 5]), C.honeyDeep, { shadow: false });
    d.line([[46, 68], [68, 92]], { width: 0.6 });
    d.line([[74, 68], [54, 92]], { width: 0.6 });
    d.fill(blob(60, 46, [22, 23, 20, 22, 24, 22, 21, 23]), C.pink);
    d.fill(catmull([[40, 56], [48, 62], [56, 57], [64, 63], [72, 57], [80, 62], [80, 54], [40, 54]]), C.pink, { shadow: false, ink: false });
    d.highlight(50, 36, 6, 3.5);
    d.fill(circle(64, 20, 6), C.coral, { shadow: false });
    d.line([[64, 15], [68, 8]], { width: 0.7 });
  },
  gateau(d) {
    d.fill(rrect(22, 66, 76, 34, 7), C.peach);
    d.fill(rrect(32, 44, 56, 26, 7), C.white);
    d.line([[32, 56], [40, 62], [48, 56], [56, 62], [64, 56], [72, 62], [80, 56], [88, 60]], { width: 0.8, smooth: true });
    d.line([[22, 80], [34, 86], [46, 80], [58, 86], [70, 80], [82, 86], [98, 80]], { width: 0.8, smooth: true, color: C.coral });
    d.fill(rrect(57, 24, 7, 20, 2.5), C.tealLight, { shadow: false });
    d.fill(catmull([[60.5, 8], [66, 16], [60.5, 22], [55, 16]]), C.honey, { shadow: false });
    d.sparkle(84, 22, 5);
    d.sparkle(34, 30, 3.5);
  },
  bonbon(d) {
    d.fill(roundPoly([[38, 60], [16, 44], [20, 76]], 4), C.lilac, { shadow: false });
    d.fill(roundPoly([[82, 60], [104, 44], [100, 76]], 4), C.lilac, { shadow: false });
    d.fill(ellipse(60, 60, 26, 18), C.pink);
    d.line([[50, 44], [44, 74]], { width: 0.7, color: C.white });
    d.line([[64, 43], [58, 77]], { width: 0.7, color: C.white });
    d.line([[76, 47], [71, 74]], { width: 0.7, color: C.white });
  },
  popcorn(d) {
    d.fill(circle(44, 42, 12), C.honeyLight, { shadow: false });
    d.fill(circle(76, 42, 12), C.honeyLight, { shadow: false });
    d.fill(circle(60, 34, 13), C.white, { shadow: false });
    d.fill(circle(50, 52, 11), C.white, { shadow: false });
    d.fill(circle(70, 52, 11), C.honeyLight, { shadow: false });
    d.fill(roundPoly([[32, 56], [88, 56], [80, 104], [40, 104]], 4), C.white);
    d.flat(roundPoly([[42, 58], [52, 58], [52, 102], [45, 102]], 1), C.coral);
    d.flat(roundPoly([[64, 58], [74, 58], [71, 102], [64, 102]], 1), C.coral);
    d.fill(roundPoly([[32, 56], [88, 56], [80, 104], [40, 104]], 4), "none", { shadow: false });
  },
  palette(d) {
    d.fill(catmull([[30, 36], [60, 22], [92, 32], [102, 58], [90, 86], [64, 98], [48, 92], [52, 78], [42, 70], [26, 74], [18, 56]]), C.sand);
    d.fill(circle(36, 56, 6), C.cream, { shadow: false });
    d.fill(circle(54, 36, 7), C.coral, { shadow: false });
    d.fill(circle(76, 38, 7), C.honey, { shadow: false });
    d.fill(circle(88, 58, 7), C.teal, { shadow: false });
    d.fill(circle(74, 78, 7), C.lilac, { shadow: false });
  },
  puzzle(d) {
    const s = [];
    s.push(...polyline([[28, 40], [50, 40]]));
    s.push(...arcPoints(60, 34, 10, 10, 150, 390).slice(0, -1));
    s.push(...polyline([[70, 40], [86, 40], [86, 56]]));
    s.push(...arcPoints(92, 66, 10, 10, -120, 120).slice(0, -1));
    s.push(...polyline([[86, 76], [86, 92], [28, 92], [28, 40]]));
    d.fill(roundPoly(resample(s, true, 3), 2), C.tealPale);
    d.highlight(40, 52, 6, 3.5);
  },
  manette(d) {
    d.fill(catmull([[26, 46], [60, 42], [94, 46], [104, 64], [100, 86], [88, 90], [76, 76], [44, 76], [32, 90], [20, 86], [16, 64]]), C.lilac);
    d.fill(roundPoly([[34, 54], [40, 54], [40, 58], [44, 58], [44, 64], [40, 64], [40, 68], [34, 68], [34, 64], [30, 64], [30, 58], [34, 58]], 1.2), C.teal, { shadow: false });
    d.fill(circle(80, 56, 4.5), C.coral, { shadow: false });
    d.fill(circle(90, 64, 4.5), C.honey, { shadow: false });
    d.line([[54, 54], [58, 54]], { width: 0.9 });
    d.line([[62, 54], [66, 54]], { width: 0.9 });
  },
  musique(d) {
    d.line([[46, 82], [46, 34]], { width: 1.1 });
    d.line([[86, 74], [86, 26]], { width: 1.1 });
    d.band([[46, 36], [86, 28]], 10, C.teal, { smooth: false });
    d.fill(ellipse(38, 84, 11, 8, -20), C.teal);
    d.fill(ellipse(78, 76, 11, 8, -20), C.teal);
    d.sparkle(24, 40, 4);
    d.sparkle(100, 92, 5);
  },
  micro(d) {
    d.line([[38, 56], [40, 70], [52, 80], [68, 80], [80, 70], [82, 56]], { smooth: true });
    d.line([[60, 82], [60, 98]]);
    d.line([[46, 100], [74, 100]]);
    d.fill(rrect(46, 18, 28, 50, 14), C.stone);
    d.line([[50, 34], [70, 34]], { width: 0.6 });
    d.line([[50, 44], [70, 44]], { width: 0.6 });
    d.highlight(54, 26, 3.5, 6, 0);
  },
  casque(d) {
    d.band([[26, 72], [26, 48], [42, 24], [60, 20], [78, 24], [94, 48], [94, 72]], 9, C.teal);
    d.fill(rrect(16, 60, 22, 36, 9), C.pink);
    d.fill(rrect(82, 60, 22, 36, 9), C.pink);
  },
  cinema(d) {
    d.fill(rrect(24, 50, 72, 48, 6), C.teal);
    d.fill(rotate(rrect(22, 32, 74, 16, 4), 24, 48, -14), C.white, { shadow: false });
    d.line(rotate([[38, 34], [32, 46]], 24, 48, -14), { width: 1.4 });
    d.line(rotate([[56, 34], [50, 46]], 24, 48, -14), { width: 1.4 });
    d.line(rotate([[74, 34], [68, 46]], 24, 48, -14), { width: 1.4 });
    d.line(rotate([[90, 34], [84, 46]], 24, 48, -14), { width: 1.4 });
    d.line([[36, 66], [84, 66]], { width: 0.7, color: C.white });
    d.line([[36, 78], [70, 78]], { width: 0.7, color: C.white });
  },
  reveil(d) {
    d.line([[38, 90], [32, 102]]);
    d.line([[82, 90], [88, 102]]);
    d.fill(ellipse(34, 32, 11, 9, -35), C.honey, { shadow: false });
    d.fill(ellipse(86, 32, 11, 9, 35), C.honey, { shadow: false });
    d.fill(circle(60, 64, 32), C.tealLight);
    d.fill(circle(60, 64, 24), C.white, { shadow: false });
    d.line([[60, 64], [60, 48]]);
    d.line([[60, 64], [72, 70]]);
    d.dot(60, 64, 2.6);
  },
  oreille(d) {
    d.fill(catmull([[56, 20], [80, 24], [90, 46], [82, 66], [70, 76], [66, 94], [50, 100], [38, 90], [40, 70], [34, 50], [38, 30]]), C.pink);
    d.line([[52, 76], [52, 60], [60, 46], [70, 44], [74, 54], [66, 62]], { smooth: true, width: 0.9 });
    d.arc(84, 60, 26, -40, 40, { width: 0.8 });
    d.arc(84, 60, 36, -30, 30, { width: 0.8 });
  },
  velo(d) {
    d.fill(circle(32, 78, 18), "none", { shadow: false });
    d.fill(circle(88, 78, 18), "none", { shadow: false });
    d.dot(32, 78, 3);
    d.dot(88, 78, 3);
    d.line([[32, 78], [50, 52], [78, 52], [88, 78]], { width: 1.2, color: C.teal });
    d.line([[50, 52], [60, 78], [78, 52]], { width: 1.2, color: C.teal });
    d.line([[32, 78], [60, 78]], { width: 1.2, color: C.teal });
    d.line([[46, 42], [50, 52]], { width: 1 });
    d.fill(rrect(38, 36, 18, 7, 3.5), C.coral, { shadow: false });
    d.line([[78, 52], [74, 36], [84, 32]], { width: 1 });
  },
  haltere(d) {
    d.fill(rrect(30, 56, 60, 8, 4), C.stone, { shadow: false });
    d.fill(rrect(18, 36, 16, 48, 6), C.teal);
    d.fill(rrect(86, 36, 16, 48, 6), C.teal);
    d.fill(rrect(8, 46, 12, 28, 4), C.tealLight, { shadow: false });
    d.fill(rrect(100, 46, 12, 28, 4), C.tealLight, { shadow: false });
  },
  bouee(d) {
    d.line([[12, 96], [24, 90], [36, 96], [48, 90], [60, 96], [72, 90], [84, 96], [96, 90], [108, 96]], { smooth: true, color: C.teal, width: 1.1 });
    d.fill(circle(60, 56, 34), C.coral);
    d.flat(roundPoly([[56, 22], [64, 22], [64, 40], [56, 40]], 1), C.white);
    d.flat(roundPoly([[56, 72], [64, 72], [64, 90], [56, 90]], 1), C.white);
    d.flat(roundPoly([[26, 52], [44, 52], [44, 60], [26, 60]], 1), C.white);
    d.flat(roundPoly([[76, 52], [94, 52], [94, 60], [76, 60]], 1), C.white);
    d.fill(circle(60, 56, 34), "none", { shadow: false });
    d.fill(circle(60, 56, 15), C.skyLight, { shadow: false });
  },
  arbre(d) {
    d.fill(roundPoly([[54, 70], [66, 70], [70, 104], [50, 104]], 3), C.brown, { shadow: false });
    d.fill(blob(60, 48, [32, 28, 34, 30, 33, 29, 35, 28, 31]), C.mint);
    d.highlight(44, 34, 7, 4);
    d.line([[30, 104], [90, 104]]);
  },
  tente(d) {
    d.fill(roundPoly([[60, 20], [102, 96], [18, 96]], [4, 5, 5]), C.honey);
    d.fill(roundPoly([[60, 50], [76, 96], [44, 96]], [2, 2, 2]), C.teal, { shadow: false });
    d.line([[60, 20], [60, 10]], { width: 0.9 });
    d.fill(roundPoly([[60, 10], [74, 14], [60, 18]], 1.5), C.coral, { shadow: false });
    d.line([[10, 98], [110, 98]]);
  },
  arcenciel(d) {
    d.band(arcPoints(60, 84, 42, 42, 180, 360), 9, C.coral, { smooth: false });
    d.band(arcPoints(60, 84, 33, 33, 180, 360), 9, C.honey, { smooth: false });
    d.band(arcPoints(60, 84, 24, 24, 180, 360), 9, C.mint, { smooth: false });
    d.fill(blob(22, 86, [12, 10, 9, 11, 13, 10]), C.white, { shadow: false });
    d.fill(blob(98, 86, [11, 13, 10, 9, 12, 10]), C.white, { shadow: false });
  },
  fete(d) {
    d.line([[40, 66], [46, 84], [56, 106]], { smooth: true, width: 0.7 });
    d.line([[76, 60], [70, 84], [58, 106]], { smooth: true, width: 0.7 });
    d.fill(ellipse(40, 44, 18, 22, -10), C.pink);
    d.fill(ellipse(78, 38, 18, 22, 10), C.honey);
    d.highlight(32, 34, 4, 6, 10);
    d.highlight(72, 28, 4, 6, -10);
    d.fill(roundPoly([[38, 64], [44, 64], [41, 70]], 1), C.pink, { shadow: false });
    d.fill(roundPoly([[74, 58], [80, 59], [76, 65]], 1), C.honey, { shadow: false });
    d.sparkle(100, 72, 5);
    d.sparkle(18, 80, 4);
  },
  cadeau(d) {
    d.fill(rrect(24, 54, 72, 48, 5), C.pink);
    d.fill(rrect(18, 42, 84, 16, 5), C.coral, { shadow: false });
    d.flat(rrect(54, 44, 12, 56, 1), C.honey);
    d.line([[54, 58], [54, 102]], { width: 0.6 });
    d.line([[66, 58], [66, 102]], { width: 0.6 });
    d.fill(ellipse(48, 32, 13, 8, 25), C.honey, { shadow: false });
    d.fill(ellipse(72, 32, 13, 8, -25), C.honey, { shadow: false });
    d.fill(circle(60, 40, 5), C.honey, { shadow: false });
  },
  trophee(d) {
    d.arc(32, 44, 12, 90, 270, { width: 1.1 });
    d.arc(88, 44, 12, -90, 90, { width: 1.1 });
    d.fill(roundPoly([[36, 24], [84, 24], [80, 56], [60, 70], [40, 56]], [3, 3, 10, 8, 10]), C.honey);
    d.fill(rrect(54, 68, 12, 14, 2), C.honeyDeep, { shadow: false });
    d.fill(rrect(38, 82, 44, 16, 5), C.teal);
    d.sparkle(60, 42, 7, C.white);
  },
  couronne(d) {
    d.fill(roundPoly([[22, 40], [42, 60], [60, 30], [78, 60], [98, 40], [92, 92], [28, 92]], [3, 4, 3, 4, 3, 5, 5]), C.honey);
    d.fill(circle(22, 36, 5), C.honey, { shadow: false });
    d.fill(circle(60, 26, 5), C.honey, { shadow: false });
    d.fill(circle(98, 36, 5), C.honey, { shadow: false });
    d.fill(circle(60, 74, 6), C.coral, { shadow: false });
    d.fill(circle(40, 78, 4.5), C.teal, { shadow: false });
    d.fill(circle(80, 78, 4.5), C.teal, { shadow: false });
  },
  sac(d) {
    d.arc(60, 44, 14, 180, 360, { width: 1.1 });
    d.fill(roundPoly([[28, 44], [92, 44], [98, 102], [22, 102]], [4, 4, 7, 7]), C.lilac);
    d.dot(46, 52, 2.4);
    d.dot(74, 52, 2.4);
    d.sparkle(60, 76, 7, C.white);
  },
  ticket(d) {
    const t = rotate(roundPoly([[20, 42], [100, 42], [100, 56], [94, 60], [100, 64], [100, 78], [20, 78], [20, 64], [26, 60], [20, 56]], [5, 5, 1, 4, 1, 5, 5, 1, 4, 1]), 60, 60, -12);
    d.fill(t, C.honey);
    d.line(rotate([[78, 46], [78, 74]], 60, 60, -12), { width: 0.6 });
    d.sparkle(...rotate([[50, 60]], 60, 60, -12)[0], 8, C.white);
  },
  main(d) {
    d.fill(rrect(32, 28, 12, 40, 6), C.peach, { shadow: false });
    d.fill(rrect(46, 20, 12, 46, 6), C.peach, { shadow: false });
    d.fill(rrect(60, 22, 12, 44, 6), C.peach, { shadow: false });
    d.fill(rrect(74, 30, 12, 38, 6), C.peach, { shadow: false });
    d.fill(rotate(rrect(78, 58, 12, 30, 6), 84, 82, 40), C.peach, { shadow: false });
    d.fill(roundPoly([[32, 56], [86, 56], [84, 88], [70, 102], [48, 102], [34, 88]], [6, 6, 10, 6, 6, 10]), C.peach);
  },
  pouce(d) {
    d.fill(rotate(rrect(44, 20, 16, 40, 8), 52, 50, -8), C.peach, { shadow: false });
    d.fill(rrect(36, 50, 52, 46, 12), C.peach);
    d.line([[52, 64], [86, 64]], { width: 0.7 });
    d.line([[52, 76], [86, 76]], { width: 0.7 });
    d.fill(rrect(20, 48, 18, 52, 5), C.teal, { shadow: false });
  },
  coche(d) {
    d.fill(circle(60, 60, 38), C.mint);
    d.line([[40, 62], [54, 76], [82, 44]], { width: 2.4, color: C.teal });
    d.highlight(42, 38, 7, 4);
  },
  souffle(d) {
    d.line([[16, 46], [70, 46], [82, 40], [82, 28], [70, 24], [62, 32]], { smooth: true, color: C.teal, width: 1.2 });
    d.line([[24, 64], [90, 64], [102, 72], [98, 86], [86, 86], [82, 78]], { smooth: true, color: C.teal, width: 1.2 });
    d.line([[18, 82], [56, 82]], { color: C.tealLight, width: 1.1 });
    d.fill(ellipse(40, 100, 9, 4.5, -25), C.mint, { shadow: false });
  },
  patte(d) {
    d.fill(blob(60, 76, [20, 18, 16, 18, 20, 22, 24, 22]), C.sand);
    d.fill(ellipse(32, 52, 8, 10, -20), C.sand, { shadow: false });
    d.fill(ellipse(48, 36, 8, 10, -8), C.sand, { shadow: false });
    d.fill(ellipse(72, 36, 8, 10, 8), C.sand, { shadow: false });
    d.fill(ellipse(88, 52, 8, 10, 20), C.sand, { shadow: false });
  },
  poisson(d) {
    d.fill(roundPoly([[80, 60], [104, 42], [100, 60], [104, 78]], [3, 4, 2, 4]), C.tealLight, { shadow: false });
    d.fill(ellipse(54, 60, 32, 22), C.sky);
    d.arc(66, 60, 10, -60, 60, { width: 0.7 });
    d.dot(38, 54, 3.2);
    d.fill(circle(20, 32, 4), "none", { shadow: false });
    d.fill(circle(30, 20, 3), "none", { shadow: false });
  },
  famille(d) {
    d.fill(circle(34, 38, 11), C.peach, { shadow: false });
    d.fill(circle(86, 38, 11), C.peach, { shadow: false });
    d.fill(circle(60, 62, 9), C.peach, { shadow: false });
    d.fill(roundPoly([[20, 54], [48, 54], [50, 102], [18, 102]], [12, 12, 4, 4]), C.teal);
    d.fill(roundPoly([[72, 54], [100, 54], [102, 102], [70, 102]], [12, 12, 4, 4]), C.lilac);
    d.fill(roundPoly([[48, 74], [72, 74], [72, 102], [48, 102]], [10, 10, 3, 3]), C.honey);
  },
  biberon(d) {
    d.fill(catmull([[60, 10], [66, 18], [66, 26], [54, 26], [54, 18]]), C.pink, { shadow: false });
    d.fill(rrect(44, 26, 32, 12, 4), C.teal, { shadow: false });
    d.fill(rrect(40, 38, 40, 66, 10), C.white);
    d.flat(rrect(43, 62, 34, 39, 8), C.skyLight);
    d.fill(rrect(40, 38, 40, 66, 10), "none", { shadow: false });
    d.line([[66, 50], [76, 50]], { width: 0.6 });
    d.line([[66, 62], [76, 62]], { width: 0.6 });
    d.line([[66, 74], [76, 74]], { width: 0.6 });
  },
  ecole(d) {
    d.fill(rrect(20, 54, 80, 46, 3), C.cream);
    d.fill(roundPoly([[14, 58], [60, 30], [106, 58]], [3, 4, 3]), C.coral, { shadow: false });
    d.fill(rrect(52, 76, 16, 24, 2), C.teal, { shadow: false });
    d.fill(rrect(28, 66, 14, 12, 2), C.sky, { shadow: false });
    d.fill(rrect(78, 66, 14, 12, 2), C.sky, { shadow: false });
    d.line([[60, 30], [60, 12]], { width: 0.9 });
    d.fill(roundPoly([[60, 12], [76, 16], [60, 22]], 1.5), C.honey, { shadow: false });
  },
  maison(d) {
    d.fill(rrect(28, 54, 64, 46, 3), C.peach);
    d.fill(roundPoly([[18, 60], [60, 22], [102, 60]], [4, 5, 4]), C.teal, { shadow: false });
    d.fill(rrect(52, 72, 16, 28, 3), C.honey, { shadow: false });
    d.fill(rrect(74, 66, 12, 12, 2), C.sky, { shadow: false });
    d.dot(64, 86, 1.6);
    d.line([[12, 100], [108, 100]]);
  },
  voiture(d) {
    d.fill(roundPoly([[38, 52], [50, 34], [76, 34], [88, 52]], [6, 6, 6, 2]), C.skyLight, { shadow: false });
    d.line([[63, 36], [63, 52]], { width: 0.8 });
    d.fill(roundPoly([[14, 56], [106, 56], [106, 84], [14, 84]], [10, 10, 6, 6]), C.tealLight);
    d.fill(circle(36, 86, 11), INK, { shadow: false, ink: false });
    d.fill(circle(84, 86, 11), INK, { shadow: false, ink: false });
    d.dot(36, 86, 4, C.stone);
    d.dot(84, 86, 4, C.stone);
    d.fill(rrect(98, 62, 8, 6, 2), C.honey, { shadow: false, ink: false });
  },
  fusee(d) {
    d.fill(catmull([[60, 98], [52, 110], [60, 118], [68, 110]]), C.honey, { shadow: false });
    d.fill(roundPoly([[42, 70], [28, 94], [46, 88]], 2), C.teal, { shadow: false });
    d.fill(roundPoly([[78, 70], [92, 94], [74, 88]], 2), C.teal, { shadow: false });
    d.fill(catmull([[60, 10], [76, 34], [80, 62], [76, 96], [44, 96], [40, 62], [44, 34]]), C.white);
    d.fill(circle(60, 52, 9), C.sky, { shadow: false });
    d.line([[46, 26], [74, 26]], { width: 0.7, color: C.coral });
  },
  cible(d) {
    d.fill(circle(56, 64, 38), C.coral);
    d.fill(circle(56, 64, 27), C.white, { shadow: false });
    d.fill(circle(56, 64, 16), C.coral, { shadow: false });
    d.fill(circle(56, 64, 6), C.white, { shadow: false });
    d.line([[58, 62], [100, 20]], { width: 1.1 });
    d.fill(roundPoly([[96, 16], [108, 14], [104, 26], [100, 20]], 1.5), C.teal, { shadow: false });
  },
  photo(d) {
    d.fill(rrect(40, 28, 24, 14, 3), C.stone, { shadow: false });
    d.fill(rrect(16, 38, 88, 60, 10), C.teal);
    d.fill(circle(60, 68, 20), C.white, { shadow: false });
    d.fill(circle(60, 68, 12), C.sky, { shadow: false });
    d.highlight(55, 63, 4, 2.5);
    d.dot(90, 50, 3.4, C.honey);
  },
  feu(d) {
    d.line([[26, 100], [94, 84]], { width: 2.2, color: C.brown });
    d.line([[26, 84], [94, 100]], { width: 2.2, color: C.brown });
    d.fill(catmull([[60, 16], [80, 46], [84, 70], [72, 88], [48, 88], [36, 70], [42, 50], [52, 58]]), C.honey);
    d.fill(catmull([[60, 50], [70, 66], [68, 80], [52, 80], [50, 66]]), C.coral, { shadow: false });
  },
  sourire(d) {
    face(d, C.honeyLight);
    d.dot(48, 54, 3.4);
    d.dot(72, 54, 3.4);
    d.arc(60, 64, 14, 25, 155);
  },
  rire(d) {
    face(d, C.honeyLight);
    d.arc(48, 56, 5, 200, 340, { width: 0.9 });
    d.arc(72, 56, 5, 200, 340, { width: 0.9 });
    d.fill([...arcPoints(60, 66, 16, 14, 0, 180)], C.coral, { shadow: false });
  },
  triste(d) {
    face(d, C.skyLight);
    d.dot(48, 54, 3.4);
    d.dot(72, 54, 3.4);
    d.arc(60, 86, 13, 215, 325);
  },
  bof(d) {
    face(d, C.stone);
    d.dot(48, 54, 3.4);
    d.dot(72, 54, 3.4);
    d.line([[48, 76], [72, 76]]);
  },
  chut(d) {
    face(d, C.lilacLight);
    d.arc(48, 52, 5, 20, 160, { width: 0.9 });
    d.arc(72, 52, 5, 20, 160, { width: 0.9 });
    d.line([[52, 76], [68, 76]]);
    d.fill(rrect(56, 60, 10, 30, 5), C.peach, { shadow: false });
  },
};

for (const [name, draw] of Object.entries(PICTOS)) {
  for (const [suffix, viewBox, width] of [["", "0 0 120 120", 3], ["-petit", "6 6 108 108", 4.8]]) {
    const { api, paths } = drawing(name, width);
    draw(api);
    const body = paths.filter((p) => !p.includes('fill="none"')).join("");
    writeFileSync(join(OUT, `${name}${suffix}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`);
  }
}
console.log(`${Object.keys(PICTOS).length} pictos dessinés.`);
