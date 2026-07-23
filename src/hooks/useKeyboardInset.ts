"use client";

import * as React from "react";

/** Amount of the viewport currently covered by the on-screen keyboard, in pixels. */
export function useKeyboardInset() {
  const [inset, setInset] = React.useState(0);

  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(Math.max(0, Math.round(covered)));
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
