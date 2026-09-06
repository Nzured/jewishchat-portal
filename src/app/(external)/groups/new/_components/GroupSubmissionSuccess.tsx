import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { formatLocation } from "@/lib/location";
import { cn } from "@/lib/utils";
import { GroupStatus } from "@/types/Group";

export interface GroupSubmissionSummary {
  whatsappLink?: string;
  name: string;
  shortDesc?: string;
  about?: string;
  linkVisibilityLoggedInOnly?: boolean;
  mainCategory?: { name: string };
  categories?: { name: string }[];
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  memberCount?: number;
  status: GroupStatus;
}

interface GroupSubmissionSuccessProps {
  group: GroupSubmissionSummary;
  onAddAnotherGroup: () => void;
  onViewListing: () => void;
}

interface SummaryRow {
  label: string;
  value: React.ReactNode;
}

function buildSummaryRows(group: GroupSubmissionSummary): SummaryRow[] {
  const rows: SummaryRow[] = [
    { label: "Group Link", value: group.whatsappLink },
    { label: "Name", value: group.name },
    { label: "Short description", value: group.shortDesc },
    { label: "About", value: group.about },
    {
      label: "Join link visibility",
      value: group.linkVisibilityLoggedInOnly ? "Logged in members only" : "Everyone",
    },
    { label: "Main category", value: group.mainCategory?.name },
    {
      label: "Additional categories",
      value: group.categories?.length
        ? group.categories.map((category) => category.name).join(", ")
        : undefined,
    },
    { label: "Location", value: formatLocation(group) },
    { label: "Member count", value: group.memberCount?.toLocaleString() },
  ];

  return rows.filter((row) => row.value !== undefined && row.value !== "");
}

export default function GroupSubmissionSuccess({
  group,
  onAddAnotherGroup,
  onViewListing,
}: GroupSubmissionSuccessProps) {
  const isPendingModeration = group.status === GroupStatus.PENDING_MODERATION;
  const rows = buildSummaryRows(group);

  return (
    <Card className="mx-auto w-full max-w-xl [--card-spacing:--spacing(8)]">
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            isPendingModeration
              ? "bg-state-bg-warning text-state-warn"
              : "bg-state-bg-success text-state-success",
          )}
        >
          {isPendingModeration ? <Clock className="size-6" /> : <Check className="size-6" />}
        </span>

        <div className="flex flex-col gap-2">
          <Typography variant="h2" className="font-display font-bold text-ink-1">
            {isPendingModeration ? (
              <>
                Your group is{" "}
                <span className="font-accent font-normal text-state-warn italic">
                  pending review
                </span>
              </>
            ) : (
              <>
                Your group is{" "}
                <span className="font-accent font-normal text-brand-green italic">live</span>
              </>
            )}
          </Typography>
          <Typography variant="p" className="text-ink-3">
            {isPendingModeration
              ? "Thanks for submitting your group. Our team reviews new listings before they go live, and we'll let you know as soon as it's approved."
              : "Your group is now listed in the directory and can be found in search."}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onAddAnotherGroup}>
            Add another group
          </Button>
          <Button type="button" onClick={onViewListing}>
            View your listing
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-4">
          What you submitted
        </Typography>

        <div className="rounded-lg border border-surface-line">
          {rows.map((row, index) => (
            <div key={row.label}>
              {index > 0 && <Separator />}
              <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-4 px-4 py-3">
                <Typography variant="small" className="text-ink-3">
                  {row.label}
                </Typography>
                <Typography variant="small" className="font-medium break-words text-ink-1">
                  {row.value}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
