"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Combobox } from "@/components/ui/Combobox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { findLocationCountry, LOCATION_COUNTRIES } from "@/configs/locations";
import { fetchIpLocation } from "@/lib/geolocation";
import { Category } from "@/types/Category";
import type { CreateGroupFormValues } from "@/types/Group";
import { useGroups } from "../../_context/GroupsContext";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface CategorizationFormProps {
  register: UseFormRegister<CreateGroupFormValues>;
  control: Control<CreateGroupFormValues>;
  errors: FieldErrors<CreateGroupFormValues>;
  setValue: UseFormSetValue<CreateGroupFormValues>;
}

/** Categories carry `displayOrder` only once an admin has ordered them; the rest fall to the end. */
function byDisplayOrder(a: Category, b: Category) {
  const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
  return orderA === orderB ? a.name.localeCompare(b.name) : orderA - orderB;
}

function SectionLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography variant="tiny" className="font-medium tracking-[0.08em] text-ink-4 uppercase">
      {children}
      {required && <span className="text-state-danger"> *</span>}
    </Typography>
  );
}

function CategoryChip({
  category,
  selected,
  variant,
  onClick,
}: {
  category: Category;
  selected: boolean;
  variant: "main" | "additional";
  onClick: () => void;
}) {
  return (
    <Chip
      label={category.name}
      aria-pressed={selected}
      onClick={onClick}
      leftIcon={
        selected ? (
          <Check className="size-3.5" />
        ) : (
          <Icon name={category.icon} className="size-3.5" />
        )
      }
      className={
        selected
          ? variant === "main"
            ? "border-brand-deep bg-brand-deep text-white hover:bg-brand-deep/90 active:bg-brand-deep/80"
            : "border-brand-green/30 bg-brand-soft text-brand-green hover:bg-brand-soft active:bg-brand-soft/80"
          : undefined
      }
    />
  );
}

function ChipSkeletons() {
  return (
    <div className="flex flex-wrap gap-2">
      {[88, 112, 136, 96, 120, 104].map((width, index) => (
        <Skeleton key={index} className="h-8 rounded-full" style={{ width }} />
      ))}
    </div>
  );
}

/** A search box over a scrollable, bordered container — every category lives inside it, no cap. */
function CategoryPicker({
  categories,
  isLoading,
  search,
  onSearchChange,
  variant,
  isSelected,
  onToggle,
}: {
  categories: Category[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  variant: "main" | "additional";
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;
}) {
  const trimmedSearch = search.trim();
  const filtered = trimmedSearch
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(trimmedSearch.toLowerCase()),
      )
    : categories;

  return (
    <Card className="gap-0 py-0">
      <div className="p-2">
        <Input
          type="search"
          placeholder="Search categories..."
          leftIcon={<Search className="size-3.5" />}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          disabled={isLoading}
          className="h-9 min-h-0 py-1.5 text-sm"
        />
      </div>
      <div className="max-h-56 overflow-y-auto p-3">
        {isLoading ? (
          <ChipSkeletons />
        ) : filtered.length === 0 ? (
          <NoData
            title="No categories found"
            description={`No categories match "${trimmedSearch}".`}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                variant={variant}
                selected={isSelected(category.id)}
                onClick={() => onToggle(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function CategorizationForm({
  register,
  control,
  errors,
  setValue,
}: CategorizationFormProps) {
  const { fetchCategories } = useGroups();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainCategorySearch, setMainCategorySearch] = useState("");
  const [additionalCategorySearch, setAdditionalCategorySearch] = useState("");

  const mainCategoryId = useWatch({ control, name: "mainCategoryId" });
  const additionalIds = useWatch({ control, name: "additionalCategoryIds" }) ?? [];
  const country = useWatch({ control, name: "locationCountry" });
  const state = useWatch({ control, name: "locationState" });
  const city = useWatch({ control, name: "locationCity" });
  const locationRef = useRef({ country, state, city });
  useEffect(() => {
    locationRef.current = { country, state, city };
  });

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((result) => {
        if (!cancelled) setCategories(result);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchCategories]);

  useEffect(() => {
    let cancelled = false;

    fetchIpLocation()
      .then((location) => {
        if (cancelled || !location) return;
        // Never clobber a value the user (or a resumed draft) already has.
        const current = locationRef.current;
        if (current.country || current.state || current.city) return;

        const matchedCountry = findLocationCountry(location.country);
        if (matchedCountry) {
          setValue("locationCountry", matchedCountry.name);
          const matchedRegion = matchedCountry.regions.find(
            (region) => region.name.toLowerCase() === location.region.trim().toLowerCase(),
          );
          setValue("locationState", matchedRegion?.name ?? location.region);
        }
        if (location.city) setValue("locationCity", location.city);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedCategories = useMemo(() => [...categories].sort(byDisplayOrder), [categories]);
  const mainCategory = sortedCategories.find((category) => category.id === mainCategoryId);

  const regions = findLocationCountry(country)?.regions ?? [];

  const selectMainCategory = (id: number) => {
    setValue("mainCategoryId", id);
    setValue(
      "additionalCategoryIds",
      additionalIds.filter((categoryId) => categoryId !== id),
    );
  };

  const toggleAdditionalCategory = (id: number) => {
    setValue(
      "additionalCategoryIds",
      additionalIds.includes(id)
        ? additionalIds.filter((categoryId) => categoryId !== id)
        : [...additionalIds, id],
    );
  };

  return (
    <FieldGroup className="gap-5">
      <Controller
        control={control}
        name="mainCategoryId"
        rules={{ validate: (value) => value != null || "Pick a main category" }}
        render={() => (
          <Field data-invalid={!!errors.mainCategoryId} className="gap-2.5">
            <SectionLabel required>Main category</SectionLabel>
            <CategoryPicker
              categories={sortedCategories}
              isLoading={isLoading}
              search={mainCategorySearch}
              onSearchChange={setMainCategorySearch}
              variant="main"
              isSelected={(id) => id === mainCategoryId}
              onToggle={selectMainCategory}
            />
            {mainCategory && (
              <FieldDescription>
                Your listing appears under{" "}
                <strong className="font-semibold">{mainCategory.name}</strong> and its URL uses this
                category.
              </FieldDescription>
            )}
            <FieldError errors={[errors.mainCategoryId]} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="additionalCategoryIds"
        render={() => (
          <Field className="gap-2.5">
            <SectionLabel>Additional categories</SectionLabel>
            <CategoryPicker
              categories={sortedCategories.filter((category) => category.id !== mainCategoryId)}
              isLoading={isLoading}
              search={additionalCategorySearch}
              onSearchChange={setAdditionalCategorySearch}
              variant="additional"
              isSelected={(id) => additionalIds.includes(id)}
              onToggle={toggleAdditionalCategory}
            />
          </Field>
        )}
      />

      <Field data-invalid={!!errors.locationCountry}>
        <FieldLabel required htmlFor="locationCountry">
          Country
        </FieldLabel>
        <Controller
          control={control}
          name="locationCountry"
          rules={{ required: "Country is required" }}
          render={({ field }) => (
            <Combobox
              id="locationCountry"
              placeholder="Select a country"
              searchPlaceholder="Search countries..."
              aria-invalid={errors.locationCountry ? "true" : undefined}
              items={LOCATION_COUNTRIES.map(({ name }) => ({ label: name, value: name }))}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                setValue("locationState", "");
                setValue("locationCity", "");
              }}
            />
          )}
        />
        <FieldError errors={[errors.locationCountry]} />
      </Field>

      <Field data-invalid={!!errors.locationState}>
        <FieldLabel required htmlFor="locationState">
          State or region
        </FieldLabel>
        <Controller
          control={control}
          name="locationState"
          rules={{ required: "State or region is required" }}
          render={({ field }) =>
            regions && regions.length > 0 ? (
              <Combobox
                id="locationState"
                placeholder="Select a state or region"
                searchPlaceholder="Search states..."
                disabled={!country}
                aria-invalid={errors.locationState ? "true" : undefined}
                items={regions.map(({ name }) => ({ label: name, value: name }))}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("locationCity", "");
                }}
              />
            ) : (
              <Input
                {...field}
                id="locationState"
                placeholder="State, province, or region"
                disabled={!country}
                onChange={(event) => {
                  field.onChange(event);
                  setValue("locationCity", "");
                }}
              />
            )
          }
        />
        <FieldError errors={[errors.locationState]} />
      </Field>

      <Field data-invalid={!!errors.locationCity}>
        <FieldLabel htmlFor="locationCity">City</FieldLabel>
        <Controller
          control={control}
          name="locationCity"
          render={({ field }) => (
            <Input {...field} id="locationCity" placeholder="City" disabled={!state} />
          )}
        />
        <FieldError errors={[errors.locationCity]} />
      </Field>

      <Field data-invalid={!!errors.memberCount}>
        <FieldLabel htmlFor="memberCount">Current member count</FieldLabel>
        <Input
          id="memberCount"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="e.g. 250"
          {...register("memberCount", {
            setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
            validate: (value) =>
              value === undefined ||
              (Number.isInteger(value) && value >= 0) ||
              "Enter the number of members, or leave this blank",
          })}
        />
        <FieldError errors={[errors.memberCount]} />
      </Field>
    </FieldGroup>
  );
}
