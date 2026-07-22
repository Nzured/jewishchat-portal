"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import verifiedAnimation from "@/assets/animations/Verified.json";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { getHomePathForUserType } from "@/lib/auth";
import { UserType } from "@/types/User";

interface OtpVerificationSuccessProps {
  userType: UserType;
}

export default function OtpVerificationSuccess({ userType }: OtpVerificationSuccessProps) {
  const [progress, setProgress] = useState(0);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && isAnimationDone) {
      const timeout = setTimeout(() => {
        toast.success("User has successfully signed up");
        router.push(getHomePathForUserType(userType));
        router.refresh();
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [progress, isAnimationDone, router, userType]);

  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-[320px] mx-auto py-8">
      <div className="w-24 h-24 mb-6">
        <Lottie
          animationData={verifiedAnimation}
          loop={false}
          className="w-full h-full"
          onComplete={() => setIsAnimationDone(true)}
        />
      </div>

      <Typography variant="h2" className="text-[28px] font-semibold text-ink-1 mb-2 tracking-tight">
        You&apos;re verified!
      </Typography>

      <Typography variant="p" className="text-[15px] text-ink-3 mb-8 max-w-[200px]">
        Taking you to the directory...
      </Typography>

      <Progress value={progress} className="w-[180px] h-1.5 bg-brand-green/20" />
    </div>
  );
}
