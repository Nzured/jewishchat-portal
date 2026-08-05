"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";
import Stepper from "./Stepper";

export interface StepperCardStep {
  id: number;
  /** Label shown on the stepper rail above the card. */
  title: string;
  /** Card header title. Falls back to `title`. */
  cardTitle?: React.ReactNode;
  /** Card header subtitle. */
  description?: React.ReactNode;
  /** Body rendered while this step is active. */
  children?: React.ReactNode;
}

interface StepperCardProps {
  steps: StepperCardStep[];
  currentStep: number;
  onBack?: () => void;
  onContinue?: () => void;
  backLabel?: string;
  continueLabel?: string;
  submitLabel?: string;
  continueDisabled?: boolean;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
}

export default function StepperCard({
  steps,
  currentStep,
  onBack,
  onContinue,
  backLabel = "Back",
  continueLabel = "Continue",
  submitLabel,
  continueDisabled = false,
  isSubmitting = false,
  footer,
  className,
  cardClassName,
  contentClassName,
}: StepperCardProps) {
  const activeStep = steps.find((step) => step.id === currentStep);
  const isLastStep = currentStep >= Math.max(...steps.map((step) => step.id));
  const showBack = currentStep > 1;

  return (
    <div className={className}>
      <Stepper items={steps} currentStep={currentStep} />
      <Card
        className={cn(
          "mt-8 [--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(6)]",
          cardClassName,
        )}
      >
        <CardHeader className="gap-2">
          <CardTitle className="font-display text-2xl leading-tight font-bold text-ink-1 sm:text-[36px]">
            {activeStep?.cardTitle ?? activeStep?.title}
          </CardTitle>
          {activeStep?.description && (
            <CardDescription className="font-sans text-sm leading-normal font-normal text-ink-2 sm:text-[18px]">
              {activeStep.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className={contentClassName}>{activeStep?.children}</CardContent>

        <CardFooter className={cn("gap-3", showBack ? "justify-between" : "justify-end")}>
          {footer ?? (
            <>
              {showBack && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onBack}
                  disabled={isSubmitting}
                  leftIcon={<ArrowLeft />}
                >
                  {backLabel}
                </Button>
              )}
              <Button
                type="button"
                onClick={onContinue}
                disabled={continueDisabled || isSubmitting}
                rightIcon={<ArrowRight />}
              >
                {isLastStep ? (submitLabel ?? continueLabel) : continueLabel}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
