import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message?: React.ReactNode;
  className?: string;
}

function EmptyState({ message = "No results found.", className }: EmptyStateProps) {
  return (
    <Typography variant="small" className={cn("py-6 text-center text-ink-3", className)}>
      {message}
    </Typography>
  );
}

export { EmptyState };
