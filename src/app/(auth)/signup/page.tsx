"use client";

import { useState, useRef, useEffect } from "react";
import AuthIllustration from "@/components/layout/auth/AuthIllustration";
import { Tabs } from "@/components/ui/Tabs";
import { TabsHeader } from "@/components/ui/TabsHeader";
import { cn } from "@/lib/utils";
import EmailVerificationTab from "./_components/EmailVerificationTab";
import Form from "./_components/Form";
import OtpVerificationSuccess from "./_components/OtpVerificationSuccess";

const SIGNUP_STEPS = [
  { value: "details", label: "Your Details" },
  { value: "verify", label: "Verify Email", disabled: true },
];

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | "auto">("auto");

  const detailsRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    const activeRef = activeTab === "details" ? detailsRef : verifyRef;
    if (!activeRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (activeRef.current) {
        setContainerHeight(activeRef.current.offsetHeight);
      }
    });

    resizeObserver.observe(activeRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeTab]);

  return (
    <div className="grid min-h-screen lg:h-screen w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden lg:grid-cols-2">
      <AuthIllustration />
      <div className="flex h-full flex-col items-center justify-center px-6 py-8 lg:py-0 overflow-x-hidden [view-transition-name:auth-form]">
        <div className="w-full max-w-[480px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsHeader items={SIGNUP_STEPS} variant="steps" />

            <div
              className="w-full overflow-hidden relative mt-4 lg:h-[var(--container-height)] lg:transition-[height] lg:duration-500 lg:ease-in-out"
              style={
                {
                  "--container-height":
                    containerHeight === "auto" ? "auto" : `${containerHeight}px`,
                } as React.CSSProperties
              }
            >
              <div
                className={cn(
                  "flex w-[200%] transition-transform duration-500 ease-in-out items-start",
                  activeTab === "details" ? "translate-x-0" : "-translate-x-1/2",
                )}
              >
                <div ref={detailsRef} className="w-1/2 flex-shrink-0 pr-4">
                  <Form
                    onSuccess={(data) => {
                      setEmail(data.email || "");
                      setActiveTab("verify");
                    }}
                  />
                </div>
                <div ref={verifyRef} className="w-1/2 flex-shrink-0 pl-4 relative">
                  <div
                    className={cn(
                      "transition-all duration-500 ease-in-out w-full",
                      isVerified
                        ? "opacity-0 pointer-events-none absolute inset-x-0 top-0 translate-x-8"
                        : "opacity-100 translate-x-0 relative",
                    )}
                  >
                    <EmailVerificationTab
                      email={email}
                      onChangeEmailClick={() => setActiveTab("details")}
                      onVerified={() => setIsVerified(true)}
                    />
                  </div>
                  <div
                    className={cn(
                      "transition-all duration-500 ease-in-out w-full",
                      !isVerified
                        ? "opacity-0 pointer-events-none absolute inset-x-0 top-0 -translate-x-8"
                        : "opacity-100 translate-x-0 relative",
                    )}
                  >
                    {isVerified && <OtpVerificationSuccess />}
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
