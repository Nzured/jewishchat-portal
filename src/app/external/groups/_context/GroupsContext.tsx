"use client";

import * as React from "react";
import { GroupService } from "@/services/group/group.service";
import { Category } from "@/types/Category";
import {
  CreateGroupFormValues,
  GetPhotoUrlResponse,
  Group,
  GroupDraft,
  GroupStatus,
} from "@/types/Group";

interface GroupsContextType {
  fetchGroupBySlug: (slug: string) => Promise<Group>;
  fetchCategories: () => Promise<Category[]>;
  draftId: string | null;
  /** Rehydrates the draft id after a detour through signup/login. */
  restoreDraftId: (id: string) => void;
  saveDraftStep1: (values: CreateGroupFormValues) => Promise<void>;
  saveDraftStep2: (values: CreateGroupFormValues) => Promise<void>;
  getImageUploadUrl: () => Promise<GetPhotoUrlResponse>;
  uploadGroupImage: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
  submitDraft: () => Promise<GroupDraft>;
}

const GroupsContext = React.createContext<GroupsContextType | undefined>(undefined);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<GroupStatus>(GroupStatus.STARTED);
  const [draftId, setDraftId] = React.useState<string | null>(null);

  const fetchGroupBySlug = React.useCallback(async (slug: string) => {
    const res = await GroupService.getGroupBySlug(slug);
    return res.data;
  }, []);

  // Categories are the same for every consumer and never change mid-session, so
  // the request is shared: repeat callers (and React's dev double-effect) reuse
  // the in-flight or already-resolved promise instead of hitting the API again.
  const categoriesRequest = React.useRef<Promise<Category[]> | null>(null);

  const fetchCategories = React.useCallback(() => {
    categoriesRequest.current ??= GroupService.getCategories()
      .then((res) => res.data)
      .catch((error) => {
        // A failed fetch shouldn't be cached — let the next caller retry.
        categoriesRequest.current = null;
        throw error;
      });

    return categoriesRequest.current;
  }, []);

  const saveDraftStep1 = React.useCallback(
    async (values: CreateGroupFormValues) => {
      let id = draftId;
      if (!id || status !== GroupStatus.IN_PROGRESS) {
        const created = await GroupService.getDraftId();
        id = created.data.draftId;
        setDraftId(id);
        setStatus(created.data.status);
      }

      const res = await GroupService.saveDraftStep1(
        {
          whatsappLink: values.whatsappLink,
          name: values.name,
          shortDesc: values.shortDesc,
          about: values.about,
          linkVisibilityLoggedInOnly: values.linkVisibilityLoggedInOnly,
        },
        id,
      );

      setStatus(res.data.status);
    },
    [draftId, status],
  );

  const saveDraftStep2 = React.useCallback(
    async (values: CreateGroupFormValues) => {
      if (!draftId || values.mainCategoryId == null) {
        throw new Error("Step 2 cannot be saved before step 1 has created the draft.");
      }
      const res = await GroupService.saveDraftStep2(
        {
          mainCategoryId: values.mainCategoryId,
          additionalCategoryIds: values.additionalCategoryIds,
          locationCity: values.locationCity,
          locationState: values.locationState,
          locationCountry: values.locationCountry,
          memberCount: values.memberCount ?? 0,
        },
        draftId,
      );

      setStatus(res.data.status);
    },
    [draftId],
  );

  const restoreDraftId = React.useCallback((id: string) => {
    setDraftId(id);
    setStatus(GroupStatus.IN_PROGRESS);
  }, []);

  const getImageUploadUrl = React.useCallback(async () => {
    if (!draftId) throw new Error("Draft ID is not set");
    const res = await GroupService.saveDraftStep4(draftId);
    return res.data;
  }, [draftId]);

  const uploadGroupImage = React.useCallback(
    async (file: File, onProgress?: (percent: number) => void) => {
      const { uploadUrl, fileKey } = await getImageUploadUrl();
      await GroupService.uploadGroupPhoto(uploadUrl, file, onProgress);
      return fileKey;
    },
    [getImageUploadUrl],
  );
  const submitDraft = React.useCallback(async () => {
    if (!draftId) throw new Error("Draft ID is not set");
    const res = await GroupService.submitDraft(draftId);
    setStatus(res.data.status);
    return res.data;
  }, [draftId]);

  return (
    <GroupsContext.Provider
      value={{
        fetchGroupBySlug,
        fetchCategories,
        draftId,
        restoreDraftId,
        saveDraftStep1,
        saveDraftStep2,
        getImageUploadUrl,
        uploadGroupImage,
        submitDraft,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = React.useContext(GroupsContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupsProvider");
  }
  return context;
}
