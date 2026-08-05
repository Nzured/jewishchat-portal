"use client";

/**
 * Aurora — animated aurora background.
 *
 * Renders a transparent WebGL canvas: the aurora fades to *nothing*, never to
 * black. Drop it behind any background colour, image or gradient.
 *
 * Zero dependencies (raw WebGL — no `ogl`, no three.js).
 *
 * <div style={{ position: "relative" }}>
 *   <Aurora style={{ position: "absolute", inset: 0 }} />
 *   <YourContent />
 * </div>
 */

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

export type AuroraProps = {
  /** Left → middle → right colour stops of the aurora ribbon. */
  colorStops?: [string, string, string];
  /** How much the ribbon undulates. 0 = flat band, 1 = very wavy. */
  amplitude?: number;
  /** Softness of the fade-out edge. Low = hard edge, high = long gradient. */
  blend?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /**
   * Opacity gain. At 1 the core of the ribbon only reaches ~0.68 alpha, which
   * reads washed out; 1.4 lets it saturate to the full colour-stop hex.
   */
  intensity?: number;
  /** false = aurora hugs the top edge, true = bottom edge. */
  flip?: boolean;
  /** Freeze the animation on a still frame. */
  paused?: boolean;
  /** Honour `prefers-reduced-motion` and render a still frame. */
  respectReducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
};

const DEFAULTS = {
  colorStops: ["#7DE2D1", "#3FC7B4", "#A7E8D2"] as [string, string, string],
  amplitude: 0.55,
  blend: 0.8,
  speed: 0.28,
  intensity: 1.4,
  flip: false,
};

const VERT = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec3  uColorStops[3];
uniform float uAmplitude;
uniform float uBlend;
uniform float uIntensity;
uniform float uFlip;

// --- 2D simplex noise (Ashima Arts / Stefan Gustavson, MIT) -----------------
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
   -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
// ---------------------------------------------------------------------------

// Three-stop horizontal colour ramp, stops pinned at 0.0 / 0.5 / 1.0.
vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5
    ? mix(uColorStops[0], uColorStops[1], t * 2.0)
    : mix(uColorStops[1], uColorStops[2], (t - 0.5) * 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float y = mix(uv.y, 1.0 - uv.y, uFlip);

  vec3 rampColor = ramp(uv.x);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = y * 2.0 - height + 0.2;

  float intensity = 0.6 * height;

  const float midPoint = 0.2;
  float shape = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  // The whole point of this component.
  //
  // reactbits does:  rgb = intensity * rampColor      -> colour crushes to BLACK
  //                  a   = shape
  // ...so a faint pixel is a *dark* teal at *low* alpha, which composites to
  // grey mud over a light page.
  //
  // Here the colour keeps its full chroma at every point and the falloff lives
  // entirely in alpha, so a faint pixel is the *same* teal, just more
  // transparent. Green -> nothing, never green -> black.
  float alpha = clamp(intensity * uIntensity, 0.0, 1.0) * shape;

  gl_FragColor = vec4(rampColor * alpha, alpha); // premultiplied
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Aurora shader failed to compile: ${log}`);
  }
  return shader;
}

function Aurora({
  colorStops = DEFAULTS.colorStops,
  amplitude = DEFAULTS.amplitude,
  blend = DEFAULTS.blend,
  speed = DEFAULTS.speed,
  intensity = DEFAULTS.intensity,
  flip = DEFAULTS.flip,
  paused = false,
  respectReducedMotion = true,
  className,
  style,
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live props for the render loop, so changing a prop never rebuilds the
  // WebGL context (which would flash).
  const props = useRef({ colorStops, amplitude, blend, speed, intensity, flip, paused });
  useEffect(() => {
    props.current = { colorStops, amplitude, blend, speed, intensity, flip, paused };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    if (!gl || gl.isContextLost()) {
      // No WebGL, or a stale context handed back for a canvas whose previous
      // context was already lost (see the cleanup note below): leave the
      // canvas transparent rather than throwing.
      return;
    }

    let program: WebGLProgram | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
      }
    } catch (err) {
      console.error(err);
      return;
    }

    gl.useProgram(program);

    // Fullscreen triangle.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const u = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      time: gl.getUniformLocation(program, "uTime"),
      colorStops: gl.getUniformLocation(program, "uColorStops"),
      amplitude: gl.getUniformLocation(program, "uAmplitude"),
      blend: gl.getUniformLocation(program, "uBlend"),
      intensity: gl.getUniformLocation(program, "uIntensity"),
      flip: gl.getUniformLocation(program, "uFlip"),
    };

    // Single opaque-over-nothing quad writing straight premultiplied values —
    // no blend equation needed, and no chance of a dark halo from one.
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    const stops = new Float32Array(9);

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const reduceMotion =
      respectReducedMotion &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      const dt = Math.min((now - last) / 1000, 1 / 30); // clamp tab-switch jumps
      last = now;

      const p = props.current;
      const still = p.paused || reduceMotion;
      if (!still) clock += dt * p.speed;

      resize();

      for (let i = 0; i < 3; i++) {
        const [r, g, b] = hexToRgb(p.colorStops[i]);
        stops[i * 3] = r;
        stops[i * 3 + 1] = g;
        stops[i * 3 + 2] = b;
      }

      gl.uniform2f(u.resolution, width, height);
      gl.uniform1f(u.time, clock);
      gl.uniform3fv(u.colorStops, stops);
      gl.uniform1f(u.amplitude, p.amplitude);
      gl.uniform1f(u.blend, p.blend);
      gl.uniform1f(u.intensity, p.intensity);
      gl.uniform1f(u.flip, p.flip ? 1 : 0);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Deliberately not forcing context loss here (`loseContext()`): a
      // canvas can only ever have one context, so a forced loss on cleanup
      // means a remount on the same canvas (e.g. React Strict Mode's
      // mount → cleanup → mount in dev) gets that same context back,
      // permanently dead, and every shader compiles to a null log forever
      // after. Deleting the program/buffer already frees the GPU-side
      // resources; the context handle itself is reclaimed by the browser
      // once the canvas is actually removed from the DOM.
    };
  }, [respectReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}

export { Aurora };
