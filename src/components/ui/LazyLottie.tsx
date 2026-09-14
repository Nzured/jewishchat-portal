"use client";

import dynamic from "next/dynamic";
import type { LottieComponentProps } from "lottie-react";

export type LazyLottieProps = Omit<LottieComponentProps, "animationData">;

export function createLazyLottie(loadAnimation: () => Promise<{ default: object }>) {
  return dynamic(
    async () => {
      const [{ default: Lottie }, { default: animationData }] = await Promise.all([
        import("lottie-react"),
        loadAnimation(),
      ]);

      const LazyLottie = (props: LazyLottieProps) => (
        <Lottie animationData={animationData} {...props} />
      );
      return LazyLottie;
    },
    { ssr: false },
  );
}
