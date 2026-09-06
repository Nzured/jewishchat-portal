"use client";

import { Grainient } from "@/components/ui/Grainient";

export function GradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Grainient
        color1="#ffffff"
        color2="#E8F5F1"
        color3="#8FFDEB"
        timeSpeed={0.5}
        colorBalance={-0.35}
        warpStrength={0.6}
        warpFrequency={3}
        warpSpeed={0.5}
        warpAmplitude={25}
        blendAngle={200}
        blendSoftness={0.4}
        rotationAmount={120}
        noiseScale={0}
        grainAmount={0}
        grainScale={0}
        grainAnimated={false}
        contrast={1}
        gamma={1.2}
        saturation={0.6}
        centerX={-0.3}
        centerY={-0.45}
        zoom={1.5}
      />
    </div>
  );
}
