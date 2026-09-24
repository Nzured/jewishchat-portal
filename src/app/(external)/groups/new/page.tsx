"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import StepperCard, { type StepperCardStep } from "@/components/ui/StepperCard";
import { EXTERNAL_GROUPS_MINE_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { useTurnstile } from "@/hooks/useTurnstile";
import {
  clearPendingGroupDraft,
  loadPendingGroupDraft,
  savePendingGroupDraft,
} from "@/lib/pendingGroupDraft";
import { getGroupPath } from "@/lib/publicPaths";
import { GroupService } from "@/services/group/group.service";
import {
  type CreateGroupFormValues,
  type GroupDraftStep1Payload,
  type GroupDraftStep2Payload,
  GroupStatus,
} from "@/types/Group";
import { useGroups } from "../_context/GroupsContext";
import AuthRequiredModal from "./_components/AuthRequiredModal";
import CategorizationForm from "./_components/CategorizationForm";
import GroupDetailsForm from "./_components/GroupDetailsForm";
import GroupImageUploader from "./_components/GroupImageUploader";
import GroupSubmissionSuccess, {
  type GroupSubmissionSummary,
} from "./_components/GroupSubmissionSuccess";
import type { FieldPath } from "react-hook-form";

const STEP_1_FIELDS: FieldPath<CreateGroupFormValues>[] = [
  "whatsappLink",
  "name",
  "shortDesc",
  "about",
  "linkVisibilityLoggedInOnly",
];

const STEP_2_FIELDS: FieldPath<CreateGroupFormValues>[] = [
  "mainCategoryId",
  "additionalCategoryIds",
  "locationCountry",
  "locationState",
  "locationCity",
  "memberCount",
];

const DEFAULT_FORM_VALUES = {
  linkVisibilityLoggedInOnly: false,
  mainCategoryId: null,
  additionalCategoryIds: [],
  locationCountry: "",
  locationState: "",
  locationCity: "",
  image: null,
};

const IS_REVIEW_STEP_ENABLED = false;

const TURNSTILE_REQUIRED_MESSAGE = "Please complete the verification to continue.";
const TURNSTILE_EXPIRED_MESSAGE = "Your verification has expired. Please verify again.";

function parseStepData<T>(data?: string): Partial<T> {
  if (!data) return {};
  try {
    return JSON.parse(data) as Partial<T>;
  } catch {
    return {};
  }
}

function CreateGroupFlow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submittedGroup, setSubmittedGroup] = useState<GroupSubmissionSummary | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeDraftId = searchParams.get("draftId");
  const [isResumingDraft, setIsResumingDraft] = useState(Boolean(resumeDraftId));
  const {
    draftId,
    restoreDraftId,
    saveDraftStep1,
    saveDraftStep2,
    uploadGroupImage,
    submitDraft,
    fetchCategories,
  } = useGroups();
  const {
    register,
    control,
    setValue,
    trigger,
    getValues,
    reset,
    getFieldState,
    clearErrors,
    subscribe,
    formState: { errors },
  } = useForm<CreateGroupFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { user } = useUser();
  const {
    token: turnstileToken,
    widget: turnstileWidget,
    isReady: turnstileReady,
    reset: resetTurnstile,
  } = useTurnstile();

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ name }) => {
          const field = name as FieldPath<CreateGroupFormValues> | undefined;
          if (field && getFieldState(field).error) {
            clearErrors(field);
          }
        },
      }),
    [subscribe, getFieldState, clearErrors],
  );

  const steps: StepperCardStep[] = (
    [
      {
        title: "Group Details",
        cardTitle: "Your group",
        description: "Start with the invite link, then tell people what the group is.",
        children: (
          <GroupDetailsForm
            register={register}
            control={control}
            errors={errors}
            trigger={trigger}
          />
        ),
      },
      {
        title: "Categorization",
        cardTitle: "Add the details",
        description: "Tell members where you meet, how often, and who the group is for.",
        children: (
          <CategorizationForm
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />
        ),
      },
      ...(IS_REVIEW_STEP_ENABLED && user && !user.whatsappVerified
        ? [
            {
              title: "Review",
              cardTitle: "Review and publish",
              description: "Double-check everything before your group goes live.",
              children: null,
            },
          ]
        : []),
      {
        title: "Photo",
        cardTitle: "Add a group photo",
        description:
          "Listings with a photo get opened more often. You can skip this and add one later.",
        children: (
          <GroupImageUploader control={control} errors={errors} uploadProgress={uploadProgress} />
        ),
      },
    ] satisfies Omit<StepperCardStep, "id">[]
  ).map((step, index) => ({ ...step, id: index + 1 }));

  const stepsLength = steps.length;

  const [currentStep, setCurrentStep] = useState(() =>
    user && loadPendingGroupDraft() ? steps.length : 1,
  );

  useEffect(() => {
    if (!user) return;
    const pending = loadPendingGroupDraft();
    if (!pending) return;

    restoreDraftId(pending.draftId);
    reset({ ...pending.values, image: null });
    clearPendingGroupDraft();
  }, [user, restoreDraftId, reset]);

  useEffect(() => {
    if (!resumeDraftId) return;
    let ignore = false;

    GroupService.getDraft(resumeDraftId)
      .then((res) => {
        if (ignore || !res?.data) return;
        const draft = res.data;
        const step1 = parseStepData<GroupDraftStep1Payload>(draft.step1Data);
        const step2 = parseStepData<GroupDraftStep2Payload>(draft.step2Data);

        restoreDraftId(draft.draftId ?? resumeDraftId);
        reset({ ...DEFAULT_FORM_VALUES, ...step1, ...step2, image: null });
        setCurrentStep(draft.step2Data ? stepsLength : draft.step1Data ? 2 : 1);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setIsResumingDraft(false);
      });

    return () => {
      ignore = true;
    };
  }, [resumeDraftId, restoreDraftId, reset, stepsLength]);

  const goToNextStep = () => setCurrentStep((step) => Math.min(steps.length, step + 1));

  const submitStep = async (
    fields: FieldPath<CreateGroupFormValues>[],
    save: (values: CreateGroupFormValues) => Promise<void>,
    guard?: () => boolean,
  ) => {
    if (!(await trigger(fields))) return;
    if (guard && !guard()) return;

    setIsSubmitting(true);
    try {
      await save(getValues());
      goToNextStep();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAuthToContinue = async () => {
    if (!(await trigger(["image"]))) return;

    if (draftId) {
      const { image: _image, ...values } = getValues();
      savePendingGroupDraft({ draftId, values });
    }
    setShowAuthModal(true);
  };

  const requireTurnstile = () => {
    if (turnstileReady) return true;
    toast.error(TURNSTILE_REQUIRED_MESSAGE);
    return false;
  };

  const requireFreshTurnstile = () => {
    if (turnstileReady) return true;
    toast.error(TURNSTILE_EXPIRED_MESSAGE);
    resetTurnstile();
    return false;
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      void submitStep(STEP_1_FIELDS, saveDraftStep1, requireTurnstile);
      return;
    }
    if (currentStep === 2) {
      void submitStep(STEP_2_FIELDS, saveDraftStep2);
      return;
    }
    if (!user) {
      void requestAuthToContinue();
      return;
    }
    void submitStep(
      ["image"],
      async (values) => {
        const { image } = values;
        if (image) {
          setUploadProgress(0);
          try {
            await uploadGroupImage(image, setUploadProgress);
          } finally {
            setUploadProgress(null);
          }
        }

        const [draft, categories] = await Promise.all([
          submitDraft(turnstileToken).catch((error: unknown) => {
            resetTurnstile();
            throw error;
          }),
          fetchCategories(),
        ]);

        setSubmittedGroup({
          slug: draft.slug,
          whatsappLink: values.whatsappLink,
          name: values.name,
          shortDesc: values.shortDesc,
          about: values.about,
          linkVisibilityLoggedInOnly: values.linkVisibilityLoggedInOnly,
          mainCategory: categories.find((category) => category.id === values.mainCategoryId),
          categories: categories.filter((category) =>
            values.additionalCategoryIds.includes(category.id),
          ),
          locationCity: values.locationCity,
          locationState: values.locationState,
          locationCountry: values.locationCountry,
          memberCount: values.memberCount,
          status: draft.status,
        });
      },
      requireFreshTurnstile,
    );
  };

  const handleViewListing = () => {
    const group = submittedGroup;
    const categorySlug = group?.mainCategory?.slug;
    const isLive = group?.status === GroupStatus.ACTIVE;
    if (group?.slug && categorySlug && isLive) {
      router.push(getGroupPath({ slug: group.slug, mainCategorySlug: categorySlug }));
      return;
    }
    router.push(EXTERNAL_GROUPS_MINE_PATH);
  };

  const handleAddAnotherGroup = () => {
    reset(DEFAULT_FORM_VALUES);
    setSubmittedGroup(null);
    setCurrentStep(1);
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-6">
      {isResumingDraft ? (
        <Skeleton className="h-[560px] w-full rounded-2xl" />
      ) : submittedGroup ? (
        <GroupSubmissionSuccess
          group={submittedGroup}
          onAddAnotherGroup={handleAddAnotherGroup}
          onViewListing={handleViewListing}
        />
      ) : (
        <StepperCard
          steps={steps}
          currentStep={currentStep}
          onBack={() => setCurrentStep((step) => Math.max(1, step - 1))}
          onContinue={handleContinue}
          isSubmitting={isSubmitting}
          submitLabel="Create group"
        />
      )}

      {!submittedGroup && (
        <div className="fixed right-4 bottom-4 z-50 overflow-hidden rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none">
          {turnstileWidget}
        </div>
      )}

      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onCreateAccount={() => router.push("/signup")}
        onLogIn={() => router.push("/login")}
      />
    </div>
  );
}

export default function CreateGroupPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-[560px] w-full max-w-3xl rounded-2xl" />}>
      <CreateGroupFlow />
    </Suspense>
  );
}
