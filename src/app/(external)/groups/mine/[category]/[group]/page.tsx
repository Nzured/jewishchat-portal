"use client";

import * as React from "react";
import { ArrowLeft, ExternalLink, Image as ImageIcon, Link2 } from "lucide-react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import CategorizationForm from "@/app/(external)/groups/new/_components/CategorizationForm";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChangePhotoModal } from "@/components/ui/ChangePhotoModal";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { GroupSuspensionBanner } from "@/components/ui/GroupSuspensionBanner";
import { Input } from "@/components/ui/Input";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { SwitchBanner } from "@/components/ui/SwitchBanner";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_MINE_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { normalizeWhatsappGroupLink, validateWhatsappGroupLink } from "@/lib/whatsapp";
import { GroupService } from "@/services/group/group.service";
import { checkWhatsappLink } from "@/services/group/whatsappLink";
import { CreateGroupFormValues, Group, GroupStatus } from "@/types/Group";

const STUCK_OFFSET_PX = 64;

const NAME_MAX_LENGTH = 100;
const SHORT_DESC_MAX_LENGTH = 200;
const ABOUT_MAX_LENGTH = 1000;
const RESUBMISSION_MESSAGE_MAX_LENGTH = 500;
const REVIEWED_STATUSES = new Set<GroupStatus>([
  GroupStatus.SUSPENDED,
  GroupStatus.PENDING,
  GroupStatus.PENDING_MODERATION,
  GroupStatus.MANUAL_REVIEW,
]);
const LINK_CHECK_DEBOUNCE_MS = 500;
const STATUS_COPY: Partial<Record<GroupStatus, { label: string; dot: string; note: string }>> = {
  [GroupStatus.ACTIVE]: {
    label: "Visible in the directory",
    dot: "bg-brand-green",
    note: "Saved changes appear in the directory straight away.",
  },
  [GroupStatus.SUSPENDED]: {
    label: "Hidden from the directory",
    dot: "bg-state-danger",
    note: "This listing is offline. Saved changes apply once it is reinstated.",
  },
  [GroupStatus.PENDING]: {
    label: "Awaiting review",
    dot: "bg-state-warn",
    note: "Saved changes are reviewed before the listing goes live.",
  },
  [GroupStatus.PENDING_MODERATION]: {
    label: "Awaiting review",
    dot: "bg-state-warn",
    note: "Saved changes are reviewed before the listing goes live.",
  },
  [GroupStatus.MANUAL_REVIEW]: {
    label: "Awaiting review",
    dot: "bg-state-warn",
    note: "Saved changes are reviewed before the listing goes live.",
  },
};

function toFormValues(group: Group): CreateGroupFormValues {
  return {
    whatsappLink: group.joinUrl ?? "",
    name: group.name ?? "",
    shortDesc: group.shortDesc ?? "",
    about: group.about ?? "",
    linkVisibilityLoggedInOnly: Boolean(group.linkVisibilityLoggedInOnly),
    mainCategoryId: group.mainCategory?.id ?? null,
    additionalCategoryIds: (group.categories ?? [])
      .filter((category) => category.id !== group.mainCategory?.id)
      .map((category) => category.id),
    locationCountry: group.locationCountry ?? "",
    locationState: group.locationState ?? "",
    locationCity: group.locationCity ?? "",
    memberCount: group.memberCount,
    image: null,
  };
}

function photoFileName(url?: string | null) {
  if (!url) return null;
  const path = url.split("?")[0];
  return path.substring(path.lastIndexOf("/") + 1) || null;
}

export default function EditGroupPage() {
  const params = useParams<{ category: string; group: string }>();
  const categorySlug = params.category;
  const groupSlug = params.group;
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useUser();
  const [group, setGroup] = React.useState<Group | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = React.useState(false);
  const [resubmissionMessage, setResubmissionMessage] = React.useState("");

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isDirty },
  } = useForm<CreateGroupFormValues>({
    defaultValues: {
      linkVisibilityLoggedInOnly: false,
      mainCategoryId: null,
      additionalCategoryIds: [],
      locationCountry: "",
      locationState: "",
      locationCity: "",
      image: null,
    },
  });

  React.useEffect(() => {
    if (!isSessionLoading && !user) router.replace("/login");
  }, [isSessionLoading, user, router]);

  React.useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    let stuck: boolean | null = null;
    const update = () => {
      const next = el.getBoundingClientRect().top <= STUCK_OFFSET_PX;
      if (next === stuck) return;
      stuck = next;
      el.classList.toggle("is-stuck", next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [group]);

  React.useEffect(() => {
    if (!categorySlug || !groupSlug || !user) return;
    let ignore = false;

    GroupService.getGroupByCategoryAndSlug(categorySlug, groupSlug)
      .then((res) => {
        if (ignore) return;
        const found = res?.data ?? null;
        const isOwner = Boolean(found?.isOwnGroup || found?.submittedByUuid === user.uuid);
        setGroup(isOwner ? found : null);
        if (isOwner && found) reset(toFormValues(found));
      })
      .catch(() => {
        if (!ignore) setGroup(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [categorySlug, groupSlug, user, reset]);

  const whatsappLink = useWatch({ control, name: "whatsappLink" });
  const debouncedLink = useDebouncedValue(whatsappLink, LINK_CHECK_DEBOUNCE_MS);
  const [isCheckingLink, setIsCheckingLink] = React.useState(false);

  React.useEffect(() => {
    if (!debouncedLink || debouncedLink === group?.whatsappLink) return;
    if (!normalizeWhatsappGroupLink(debouncedLink)) return;
    let ignore = false;

    const runCheck = async () => {
      setIsCheckingLink(true);
      await trigger("whatsappLink");
      if (!ignore) setIsCheckingLink(false);
    };

    void runCheck();

    return () => {
      ignore = true;
    };
  }, [debouncedLink, group?.whatsappLink, trigger]);

  const nameLength = (useWatch({ control, name: "name" }) ?? "").length;
  const shortDescLength = (useWatch({ control, name: "shortDesc" }) ?? "").length;

  const onSubmit = async (values: CreateGroupFormValues) => {
    if (!group || values.mainCategoryId == null) return;

    setIsSaving(true);
    try {
      const message = resubmissionMessage.trim();
      const res = await GroupService.updateGroup(group.uuid, {
        whatsappLink: values.whatsappLink,
        name: values.name,
        shortDesc: values.shortDesc,
        about: values.about,
        linkVisibilityLoggedInOnly: values.linkVisibilityLoggedInOnly,
        mainCategoryId: values.mainCategoryId,
        additionalCategoryIds: values.additionalCategoryIds,
        locationCity: values.locationCity,
        locationState: values.locationState,
        locationCountry: values.locationCountry,
        memberCount: values.memberCount ?? 0,
        ...(message ? { resubmissionMessage: message } : {}),
      });

      const updated = res.data ?? group;
      setGroup(updated);
      reset(toFormValues(updated));
      setResubmissionMessage("");
      toast.success("Your listing has been updated.");
    } catch {
      toast.error("Those changes could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoSave = async (photo: File) => {
    if (!group) return;

    const { data } = await GroupService.getGroupPhotoUploadUrl(group.uuid);
    await GroupService.uploadGroupPhoto(data.uploadUrl, photo);

    const refreshed = await GroupService.getGroupByCategoryAndSlug(categorySlug, groupSlug);
    if (refreshed?.data) setGroup(refreshed.data);
    toast.success("Your group photo has been updated.");
  };

  if (isLoading || isSessionLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <Skeleton className="h-[520px] flex-1 rounded-xl" />
          <Skeleton className="h-[420px] w-full rounded-xl lg:w-[320px]" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <NoData
        title="Listing not found"
        description="This group either does not exist or is not one of yours."
      />
    );
  }

  const status = STATUS_COPY[group.status];
  const fileName = photoFileName(group.thumbnailUrl);

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="flex w-full flex-col gap-6"
    >
      <NextLink
        href={EXTERNAL_GROUPS_MINE_PATH}
        className="flex w-fit items-center gap-2 text-sm font-medium text-brand-green transition-colors hover:text-brand-deep"
      >
        <ArrowLeft className="size-4" />
        Back to my groups
      </NextLink>

      <div
        ref={headerRef}
        className={cn(
          "sticky top-16 z-30 -mx-4 flex flex-col gap-4 border-b border-transparent px-4 py-3 transition-[background-color,border-color,backdrop-filter] duration-300 sm:flex-row sm:items-end sm:justify-between md:-mx-8 md:px-8",
          "[&.is-stuck]:border-surface-line [&.is-stuck]:bg-surface-bg/80 [&.is-stuck]:backdrop-blur-xl",
          "motion-reduce:transition-none",
        )}
      >
        <div className="flex flex-col gap-1">
          <Typography
            as="span"
            variant="xs"
            className="font-mono tracking-[1.5px] text-brand-green uppercase"
          >
            Edit listing
          </Typography>
          <Typography as="h1" variant="h2" className="font-display font-bold text-ink-1">
            {group.name}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size={"lg"}
            disabled={!isDirty || isSaving}
            onClick={() => {
              reset(toFormValues(group));
              setResubmissionMessage("");
            }}
          >
            Discard changes
          </Button>
          <Button size={"lg"} type="submit" color="primary" disabled={!isDirty || isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <GroupSuspensionBanner group={group} showResubmitHint />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Card className="gap-5 px-(--card-spacing)">
            <Typography
              as="span"
              variant="xs"
              className="font-mono tracking-[1.5px] text-ink-4 uppercase"
            >
              The group
            </Typography>

            <FieldGroup className="gap-5">
              <Field data-invalid={!!errors.whatsappLink}>
                <FieldLabel required htmlFor="whatsappLink">
                  WhatsApp group link
                </FieldLabel>
                <Input
                  type="url"
                  id="whatsappLink"
                  leftIcon={<Link2 />}
                  placeholder="https://chat.whatsapp.com/"
                  loading={isCheckingLink}
                  {...register("whatsappLink", {
                    required: "WhatsApp link is required",
                    setValueAs: (value: string) =>
                      normalizeWhatsappGroupLink(value) ?? value.trim(),
                    validate: async (value: string) => {
                      const format = validateWhatsappGroupLink(value);
                      if (format !== true) return format;

                      const normalized = normalizeWhatsappGroupLink(value) ?? value.trim();
                      if (normalized === group?.whatsappLink) return true;

                      const { available, message } = await checkWhatsappLink(normalized);
                      return available
                        ? true
                        : (message ?? "This WhatsApp group is already listed.");
                    },
                  })}
                />
                <FieldDescription>
                  Changing the link means it is checked again for format and duplicates before your
                  listing goes back up.
                </FieldDescription>
                <FieldError errors={[errors.whatsappLink]} />
              </Field>

              <Field data-invalid={!!errors.name}>
                <div className="flex items-baseline gap-2">
                  <FieldLabel required htmlFor="name">
                    Group name
                  </FieldLabel>
                  <Typography as="span" variant="xs" className="text-ink-4 tabular-nums">
                    {nameLength}/{NAME_MAX_LENGTH}
                  </Typography>
                </div>
                <Input
                  type="text"
                  id="name"
                  maxLength={NAME_MAX_LENGTH}
                  showCounter={false}
                  {...register("name", { required: "Group name is required" })}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.shortDesc}>
                <div className="flex items-baseline gap-2">
                  <FieldLabel required htmlFor="shortDesc">
                    Short description
                  </FieldLabel>
                  <Typography as="span" variant="xs" className="text-ink-4 tabular-nums">
                    {shortDescLength}/{SHORT_DESC_MAX_LENGTH}
                  </Typography>
                </div>
                <Input
                  type="text"
                  id="shortDesc"
                  maxLength={SHORT_DESC_MAX_LENGTH}
                  showCounter={false}
                  {...register("shortDesc", { required: "Short description is required" })}
                />
                <FieldError errors={[errors.shortDesc]} />
              </Field>

              <Field data-invalid={!!errors.about}>
                <div className="flex items-baseline gap-2">
                  <FieldLabel htmlFor="about">About the group</FieldLabel>
                  <Typography as="span" variant="xs" className="text-ink-4">
                    Optional
                  </Typography>
                </div>
                <Textarea
                  id="about"
                  maxLength={ABOUT_MAX_LENGTH}
                  aria-invalid={errors.about ? "true" : undefined}
                  {...register("about")}
                />
                <FieldError errors={[errors.about]} />
              </Field>
            </FieldGroup>
          </Card>

          <CategorizationForm
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />
        </div>

        <aside className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
          <Card className="gap-4 px-(--card-spacing)">
            <Typography
              as="span"
              variant="xs"
              className="font-mono tracking-[1.5px] text-ink-4 uppercase"
            >
              Group photo
            </Typography>

            <div className="flex items-center gap-4">
              {group.thumbnailUrl ? (
                <Avatar variant="tile" size="2xl" src={group.thumbnailUrl} name={group.name} />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-state-bg-success text-brand-deep">
                  <ImageIcon className="size-6" />
                </span>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Typography variant="small" className="truncate font-medium text-ink-1">
                  {fileName ?? "No photo yet"}
                </Typography>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPhotoModalOpen(true)}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="px-(--card-spacing)">
            <Controller
              control={control}
              name="linkVisibilityLoggedInOnly"
              render={({ field }) => (
                <SwitchBanner
                  label="Who can see the join link"
                  title="Logged in members only"
                  description="Visitors who are not signed in see a prompt to log in where the join button would be."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  name={field.name}
                />
              )}
            />
          </Card>

          {status && (
            <Card className="gap-3 px-(--card-spacing)">
              <Typography
                as="span"
                variant="xs"
                className="font-mono tracking-[1.5px] text-ink-4 uppercase"
              >
                Currently live
              </Typography>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`size-2 shrink-0 rounded-full ${status.dot}`} />
                  <Typography as="span" variant="small" className="text-ink-1">
                    {status.label}
                  </Typography>
                </div>

                <Button variant="link" size="sm" rightIcon={<ExternalLink />} asChild>
                  <NextLink href={getGroupPath(group)}>View</NextLink>
                </Button>
              </div>

              <Typography variant="xs" className="text-ink-4">
                {status.note}
              </Typography>
            </Card>
          )}

          {REVIEWED_STATUSES.has(group.status) && (
            <Card className="gap-4 px-(--card-spacing)">
              <Typography
                as="span"
                variant="xs"
                className="font-mono tracking-[1.5px] text-ink-4 uppercase"
              >
                Message to the review team
              </Typography>

              <Field>
                <div className="flex items-baseline gap-2">
                  <FieldLabel htmlFor="resubmissionMessage">What did you change?</FieldLabel>
                  <Typography as="span" variant="xs" className="text-ink-4">
                    Optional
                  </Typography>
                </div>
                <Textarea
                  id="resubmissionMessage"
                  rows={5}
                  maxLength={RESUBMISSION_MESSAGE_MAX_LENGTH}
                  value={resubmissionMessage}
                  onChange={(event) => setResubmissionMessage(event.target.value)}
                />
                <FieldDescription>Optional, but it usually speeds up the review.</FieldDescription>
              </Field>
            </Card>
          )}
        </aside>
      </div>

      <ChangePhotoModal
        open={isPhotoModalOpen}
        onOpenChange={setIsPhotoModalOpen}
        title="Change group photo"
        onSave={handlePhotoSave}
      />
    </form>
  );
}
