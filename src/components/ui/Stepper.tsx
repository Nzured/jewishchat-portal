"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

export interface StepperItem {
  id: number;
  title: string;
  children?: React.ReactNode;
}

export default function Stepper({
  items,
  currentStep,
  className,
}: {
  items: StepperItem[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center sm:justify-between", className)}>
      {Array.isArray(items) &&
        items.map((item, index) => {
          const isActive = item.id === currentStep;
          const isCompleted = item.id < currentStep;

          return (
            <Fragment key={item.id}>
              <div className="flex shrink-0 flex-row items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ease-out",
                    isActive
                      ? "scale-110 border-brand-green bg-brand-green ring-4 ring-brand-soft"
                      : "border-ink-3 bg-white",
                    isCompleted && "border-surface-line bg-state-bg-success",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-3.5 text-state-success animate-in zoom-in-50 duration-300 motion-reduce:animate-none" />
                  ) : (
                    <Typography
                      variant={"small"}
                      className={cn(
                        "font-normal transition-colors duration-200",
                        isActive ? "text-white" : "text-ink-3",
                      )}
                    >
                      {item.id}
                    </Typography>
                  )}
                </div>
                <Typography
                  variant={"large"}
                  className={cn(
                    "hidden font-normal transition-colors duration-200 sm:inline",
                    isActive ? "text-ink-1" : "text-ink-3",
                  )}
                >
                  {item.title}
                </Typography>
              </div>
              {index < items.length - 1 && (
                <div className="mx-2 h-px flex-1 overflow-hidden bg-surface-line-strong">
                  <div
                    className={cn(
                      "h-full w-full origin-left bg-brand-green transition-transform duration-500 ease-out motion-reduce:transition-none",
                      isCompleted ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
    </div>
  );
}
