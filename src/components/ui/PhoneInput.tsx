"use client";

import * as React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Input";
import { fetchIpLocationCached } from "@/lib/geolocation";
import { cn } from "@/lib/utils";

const FALLBACK_COUNTRY: CountryCode = "IL";

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryName(country: CountryCode) {
  try {
    return regionNames?.of(country) ?? country;
  } catch {
    return country;
  }
}

const flagComponents = Flags as unknown as Record<
  string,
  React.ComponentType<{ title?: string; className?: string }> | undefined
>;

function CountryFlag({ country, title }: { country: string; title: string }) {
  const Flag = flagComponents[country];
  if (!Flag) return <span className="h-3.5 w-5 shrink-0 rounded-[2px] bg-surface-line" />;
  return <Flag title={title} className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover" />;
}

const COUNTRY_ITEMS = getCountries()
  .map((country) => {
    const dialCode = `+${getCountryCallingCode(country)}`;
    const name = countryName(country);
    return {
      value: country,
      label: `${name} (${dialCode})`,
      triggerLabel: dialCode,
      icon: <CountryFlag country={country} title={name} />,
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

const SUPPORTED = new Set<string>(getCountries());

export function isValidPhone(value: string | undefined): boolean {
  if (!value) return false;
  return isValidPhoneNumber(value);
}

function split(value: string | undefined, fallback: CountryCode) {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined;
  if (!parsed) return { country: fallback, national: "" };
  return { country: parsed.country ?? fallback, national: parsed.nationalNumber };
}

interface PhoneInputProps {
  value?: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  defaultCountry?: CountryCode;
  id?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onValueChange,
  onBlur,
  defaultCountry,
  id,
  error,
  disabled,
  placeholder = "Enter your phone number",
  className,
}: PhoneInputProps) {
  const initial = React.useMemo(() => split(value, defaultCountry ?? FALLBACK_COUNTRY), []);
  const [country, setCountry] = React.useState<CountryCode>(initial.country);
  const [national, setNational] = React.useState(initial.national);

  const emittedRef = React.useRef(value ?? "");
  const touchedRef = React.useRef(Boolean(value));

  React.useEffect(() => {
    const incoming = value ?? "";
    if (incoming === emittedRef.current) return;
    emittedRef.current = incoming;
    const next = split(incoming, defaultCountry ?? FALLBACK_COUNTRY);
    setCountry(next.country);
    setNational(next.national);
    if (incoming) touchedRef.current = true;
  }, [value, defaultCountry]);

  React.useEffect(() => {
    if (defaultCountry || touchedRef.current) return;

    let cancelled = false;
    void fetchIpLocationCached().then((location) => {
      const detected = location?.countryCode?.toUpperCase();
      if (cancelled || !detected || !SUPPORTED.has(detected)) return;
      if (touchedRef.current) return;
      setCountry(detected as CountryCode);
    });

    return () => {
      cancelled = true;
    };
  }, [defaultCountry]);

  const emit = (nextCountry: CountryCode, nextNational: string) => {
    const digits = nextNational.replace(/\D/g, "");
    const next = digits ? `+${getCountryCallingCode(nextCountry)}${digits}` : "";
    emittedRef.current = next;
    onValueChange(next);
  };

  const handleCountryChange = (nextCountry: string) => {
    touchedRef.current = true;
    setCountry(nextCountry as CountryCode);
    emit(nextCountry as CountryCode, national);
  };

  const handleNationalChange = (raw: string) => {
    touchedRef.current = true;
    const digits = raw.replace(/\D/g, "");
    setNational(digits);
    emit(country, digits);
  };

  const handleBlur = () => {
    const parsed = national
      ? parsePhoneNumberFromString(`+${getCountryCallingCode(country)}${national}`)
      : undefined;
    if (parsed?.isValid()) setNational(parsed.formatNational());
    onBlur?.();
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-2">
        <Combobox
          items={COUNTRY_ITEMS}
          value={country}
          onValueChange={handleCountryChange}
          disabled={disabled}
          searchPlaceholder="Search country"
          className="w-[124px] shrink-0"
          contentClassName="w-[min(320px,calc(100vw-3rem))]"
          aria-invalid={error ? true : undefined}
          onBlur={onBlur}
        />
        <Input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder}
          disabled={disabled}
          value={national}
          onChange={(event) => handleNationalChange(event.target.value)}
          onBlur={handleBlur}
          aria-invalid={error ? true : undefined}
          className="flex-1"
        />
      </div>
      {error && <p className="text-xs text-state-danger">{error}</p>}
    </div>
  );
}
