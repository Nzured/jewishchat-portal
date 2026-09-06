"use client";

import * as React from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GroupService } from "@/services/group/group.service";

interface JoinErrorData {
  requiresAuth?: boolean;
  message?: string;
}

function failureMessage(status?: number): string {
  if (status === 403) return "This group is not accepting new members right now.";
  if (status === 410) return "That join link expired. Please try again.";
  return "Could not open the group link. Please try again.";
}

export function useJoinGroup(slug: string) {
  const router = useRouter();
  const [isJoining, setIsJoining] = React.useState(false);

  const join = React.useCallback(async () => {
    if (isJoining) return;
    setIsJoining(true);

    const popup = window.open("", "_blank");

    try {
      const tokenRes = await GroupService.startGroupJoin(slug);
      const token = tokenRes?.data?.token;
      if (!token) throw new Error("Join token missing");

      const redirectRes = await GroupService.redeemJoinToken(token);
      const redirectUrl = redirectRes?.data?.redirectUrl;
      if (!redirectUrl) throw new Error("Redirect url missing");

      if (popup) {
        popup.opener = null;
        popup.location.href = redirectUrl;
      } else {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      popup?.close();

      const response = (error as AxiosError<JoinErrorData>)?.response;
      if (response?.status === 401) {
        toast.info("Login to open this group link.");
        router.push("/login");
        return;
      }

      toast.error(response?.data?.message || failureMessage(response?.status));
    } finally {
      setIsJoining(false);
    }
  }, [isJoining, router, slug]);

  return { join, isJoining };
}
