import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

interface ComingSoonProps extends React.ComponentProps<"div"> {
  title: string;
  description: string;
}

export function ComingSoon({ title, description, className, ...props }: ComingSoonProps) {
  return (
    <div
      data-slot="coming-soon"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-line-strong bg-surface-bg px-8 py-16 text-center",
        className,
      )}
      {...props}
    >
      <Typography as="p" variant="h4" className="font-semibold text-ink-1">
        {title}
      </Typography>
      <Typography as="p" variant="p" className="max-w-sm text-ink-3">
        {description}
      </Typography>
    </div>
  );
}
