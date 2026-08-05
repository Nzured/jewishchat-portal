import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

/** The mono, letter-spaced caption every card on the group detail page is headed with. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Typography
      variant="tiny"
      className={cn("font-mono font-medium tracking-[1.6px] text-ink-3 uppercase", className)}
    >
      {children}
    </Typography>
  );
}
