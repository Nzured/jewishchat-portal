"use client";

import * as React from "react";
import { ChartColumn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { NAME_PART_ONE, NAME_PART_TWO } from "@/configs/const";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

interface CategoryRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function CategoryRow({
  icon,
  title,
  description,
  badge,
  checked,
  disabled,
  onCheckedChange,
}: CategoryRowProps) {
  const id = React.useId();

  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-state-bg-success text-brand-green [&_svg]:size-4">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={id} className="text-sm font-semibold text-ink-1">
            {title}
          </label>
          {badge && (
            <Typography
              as="span"
              variant="tiny"
              className="rounded-md bg-state-bg-success px-1.5 py-0.5 font-mono tracking-[1px] text-state-success uppercase"
            >
              {badge}
            </Typography>
          )}
        </div>
        <Typography variant="xs" className="text-ink-3">
          {description}
        </Typography>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={title}
        className="mt-0.5"
      />
    </div>
  );
}

export function CookieSettingsModal() {
  const { consent, isSettingsOpen, closeSettings, acceptAll, rejectAll, savePreferences } =
    useCookieConsent();
  const [analytics, setAnalytics] = React.useState(false);

  const [prevOpen, setPrevOpen] = React.useState(isSettingsOpen);
  if (isSettingsOpen !== prevOpen) {
    setPrevOpen(isSettingsOpen);
    if (isSettingsOpen) setAnalytics(consent?.analytics ?? false);
  }

  return (
    <Modal open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Cookie settings</ModalTitle>
          <ModalDescription>
            Choose which cookies {NAME_PART_ONE + NAME_PART_TWO} may set. You can change this at any
            time from the cookie settings link in the footer.
          </ModalDescription>
        </ModalHeader>

        <div className="flex flex-col divide-y divide-surface-line rounded-xl border border-surface-line">
          <CategoryRow
            icon={<ShieldCheck />}
            title="Strictly necessary"
            badge="Always on"
            description="Required for the site to work - signing in, keeping your session, security checks and remembering this choice. These cannot be switched off."
            checked
            disabled
          />
          <CategoryRow
            icon={<ChartColumn />}
            title="Analytics"
            description="Helps us see which groups and categories are being found, and count views without identifying you. Turning this off means your visits are not counted."
            checked={analytics}
            onCheckedChange={setAnalytics}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={rejectAll}>
            Reject all
          </Button>
          <Button type="button" variant="outline" onClick={() => savePreferences(analytics)}>
            Save preferences
          </Button>
          <Button type="button" color="primary" onClick={acceptAll}>
            Accept all
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
