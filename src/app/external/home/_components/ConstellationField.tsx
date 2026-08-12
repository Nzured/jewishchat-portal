"use client";

import * as THREE from "three";

const NODE_COUNT = 150;
const MAX_LINKS = 320;
const REPEL_RADIUS = 2.4;

const HUB_COUNT = 12;

const POINT_SIZE = 6.5;

function tokenColor(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || undefined);
}

const CAMERA_Z = 15;
const CAMERA_FOV = 46;
const MIN_DPR = 1;
const MAX_DPR = 1.75;

const VERTEX_SHADER = `
  attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (14.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(vColor, alpha * 0.92);
  }
`;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type FieldData = {
  base: Float32Array;
  seeds: Float32Array;
  links: number[];
};

function buildField(): FieldData {
  const rand = mulberry32(0x1e9783);
  const base = new Float32Array(NODE_COUNT * 3);
  const seeds = new Float32Array(NODE_COUNT);

  const hubs = Array.from({ length: HUB_COUNT }, (_, i) => {
    const angle = (i / HUB_COUNT) * Math.PI * 2;
    const radius = 3.6 + rand() * 2.6;
    return [Math.cos(angle) * radius * 1.65, Math.sin(angle) * radius * 0.82, (rand() - 0.5) * 3.4];
  });

  for (let i = 0; i < NODE_COUNT; i += 1) {
    const hub = hubs[i % HUB_COUNT];
    base[i * 3 + 0] = hub[0] + (rand() - 0.5) * 3.6;
    base[i * 3 + 1] = hub[1] + (rand() - 0.5) * 2.4;
    base[i * 3 + 2] = hub[2] + (rand() - 0.5) * 1.8;
    seeds[i] = rand() * Math.PI * 2;
  }

  const links: number[] = [];
  for (let i = 0; i < NODE_COUNT && links.length < MAX_LINKS * 2; i += 1) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j += 1) {
      if (i === j) continue;
      const dx = base[i * 3] - base[j * 3];
      const dy = base[i * 3 + 1] - base[j * 3 + 1];
      const dz = base[i * 3 + 2] - base[j * 3 + 2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    for (const { j } of dists.slice(0, 2)) {
      if (i < j) links.push(i, j);
    }
  }

  return { base, seeds, links };
}

export type ConstellationHandle = {
  resize: () => void;

  start: () => void;

  stop: () => void;

  renderOnce: () => void;

  dispose: () => void;
};

export function createConstellation(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
): ConstellationHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 1000);
  camera.position.set(0, 0, CAMERA_Z);

  const field = buildField();
  const linkCount = field.links.length / 2;

  const live = new Float32Array(field.base);
  const pointColors = new Float32Array(NODE_COUNT * 3);
  const pointSizes = new Float32Array(NODE_COUNT);
  const linePositions = new Float32Array(linkCount * 2 * 3);
  const lineColors = new Float32Array(linkCount * 2 * 3);

  const nodeColor = tokenColor("--constellation-node");
  const linkColor = tokenColor("--constellation-link");

  for (let i = 0; i < NODE_COUNT; i += 1) {
    pointColors[i * 3 + 0] = nodeColor.r;
    pointColors[i * 3 + 1] = nodeColor.g;
    pointColors[i * 3 + 2] = nodeColor.b;
    pointSizes[i] = POINT_SIZE;
  }
  for (let v = 0; v < linkCount * 2; v += 1) {
    lineColors[v * 3 + 0] = linkColor.r;
    lineColors[v * 3 + 1] = linkColor.g;
    lineColors[v * 3 + 2] = linkColor.b;
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(live, 3));
  pointsGeometry.setAttribute("color", new THREE.BufferAttribute(pointColors, 3));
  pointsGeometry.setAttribute("size", new THREE.BufferAttribute(pointSizes, 1));

  const pointsMaterial = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
  });

  const linesGeometry = new THREE.BufferGeometry();
  linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  linesGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

  const linesMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
  });

  const lineSegments = new THREE.LineSegments(linesGeometry, linesMaterial);
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(lineSegments, points);

  let pointerX = 0;
  let pointerY = 0;
  let viewportWidth = 0;
  let viewportHeight = 0;

  function onPointerMove(event: PointerEvent) {
    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width === 0 || height === 0) return;

    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, MIN_DPR), MAX_DPR));
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    viewportHeight = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_Z;
    viewportWidth = viewportHeight * camera.aspect;

    if (!running) update(elapsed);
  }

  function update(elapsed: number) {
    const mx = (pointerX * viewportWidth) / 2;
    const my = (pointerY * viewportHeight) / 2;

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const seed = field.seeds[i];

      let x = field.base[i * 3] + Math.sin(elapsed * 0.24 + seed) * 0.34;
      let y = field.base[i * 3 + 1] + Math.cos(elapsed * 0.19 + seed * 1.7) * 0.28;
      const z = field.base[i * 3 + 2] + Math.sin(elapsed * 0.15 + seed * 0.6) * 0.2;

      const dx = x - mx;
      const dy = y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS && dist > 0.0001) {
        const push = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.85;
        x += (dx / dist) * push;
        y += (dy / dist) * push;
      }

      live[i * 3] = x;
      live[i * 3 + 1] = y;
      live[i * 3 + 2] = z;
    }

    for (let k = 0; k < field.links.length; k += 2) {
      const i = field.links[k];
      const j = field.links[k + 1];

      for (const [slot, node] of [
        [k, i],
        [k + 1, j],
      ] as const) {
        linePositions[slot * 3] = live[node * 3];
        linePositions[slot * 3 + 1] = live[node * 3 + 1];
        linePositions[slot * 3 + 2] = live[node * 3 + 2];
      }
    }

    pointsGeometry.attributes.position.needsUpdate = true;
    linesGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  let elapsed = 0;
  let lastFrame = 0;
  let rafId = 0;
  let running = false;

  function frame(now: number) {
    const delta = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    elapsed += delta;
    update(elapsed);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  }

  function renderOnce() {
    cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(resize);
  }

  function dispose() {
    stop();
    window.removeEventListener("pointermove", onPointerMove);
    pointsGeometry.dispose();
    linesGeometry.dispose();
    pointsMaterial.dispose();
    linesMaterial.dispose();
    renderer.dispose();
  }

  resize();

  return { resize, start, stop, renderOnce, dispose };
}
