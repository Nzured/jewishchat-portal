"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import StepperCard, { type StepperCardStep } from "@/components/ui/StepperCard";
import { EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import {
  clearPendingGroupDraft,
  loadPendingGroupDraft,
  savePendingGroupDraft,
} from "@/lib/pendingGroupDraft";
import type { CreateGroupFormValues } from "@/types/Group";
import { useGroups } from "../_context/GroupsContext";
import AuthRequiredModal from "./_components/AuthRequiredModal";
import CategorizationForm from "./_components/CategorizationForm";
import GroupDetailsForm from "./_components/GroupDetailsForm";
import GroupImageUploader from "./_components/GroupImageUploader";
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

export default function CreateGroupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const { draftId, restoreDraftId, saveDraftStep1, saveDraftStep2, uploadGroupImage, submitDraft } =
    useGroups();
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
  const { user } = useUser();

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

  // Ids are derived from position so skipping a step can't leave gaps or duplicates.
  const steps: StepperCardStep[] = (
    [
      {
        title: "Group Details",
        cardTitle: "Your group",
        description: "Start with the invite link, then tell people what the group is.",
        children: <GroupDetailsForm register={register} control={control} errors={errors} />,
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
      ...(user && !user.whatsappVerified
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

  // A signed-out user is bounced to signup/login and back (see
  // PendingGroupDraftRedirect) with their progress parked in sessionStorage
  // under this same, already-authenticated `user` — so if it's there at
  // mount, land straight back on the last step instead of step 1.
  const [currentStep, setCurrentStep] = useState(() =>
    user && loadPendingGroupDraft() ? steps.length : 1,
  );

  // Rehydrates the draft id and form values that were parked before the
  // signup/login detour — see requestAuthToContinue.
  useEffect(() => {
    if (!user) return;
    const pending = loadPendingGroupDraft();
    if (!pending) return;

    restoreDraftId(pending.draftId);
    reset({ ...pending.values, image: null });
    clearPendingGroupDraft();
  }, [user, restoreDraftId, reset]);

  const goToNextStep = () => setCurrentStep((step) => Math.min(steps.length, step + 1));

  const submitStep = async (
    fields: FieldPath<CreateGroupFormValues>[],
    save: (values: CreateGroupFormValues) => Promise<void>,
  ) => {
    if (!(await trigger(fields))) return;

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

  // A signed-out user can fill out the whole form, but needs an account before
  // it's actually submitted. Their progress is already saved server-side under
  // draftId — this just parks it client-side so it can be resumed after auth.
  const requestAuthToContinue = async () => {
    if (!(await trigger(["image"]))) return;

    if (draftId) {
      const { image: _image, ...values } = getValues();
      savePendingGroupDraft({ draftId, values });
    }
    setShowAuthModal(true);
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      void submitStep(STEP_1_FIELDS, saveDraftStep1);
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
    void submitStep(["image"], async ({ image }) => {
      if (image) {
        setUploadProgress(0);
        try {
          await uploadGroupImage(image, setUploadProgress);
        } finally {
          setUploadProgress(null);
        }
      }

      await submitDraft();
      toast.success("Your group has been submitted for review.");
      router.push(EXTERNAL_GROUPS_PATH);
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-6">
      <StepperCard
        steps={steps}
        currentStep={currentStep}
        onBack={() => setCurrentStep((step) => Math.max(1, step - 1))}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
        submitLabel="Create group"
      />

      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onCreateAccount={() => router.push("/signup")}
        onLogIn={() => router.push("/login")}
      />
    </div>
  );
}
