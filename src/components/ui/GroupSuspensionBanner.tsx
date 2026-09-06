import { AlertTriangle } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Group, GroupStatus } from "@/types/Group";
import { REPORT_CATEGORY_LABELS, ReportCategories } from "@/types/Report";

interface GroupSuspensionBannerProps {
  group: Group;
  title?: string;
  showResubmitHint?: boolean;
  className?: string;
}

export function GroupSuspensionBanner({
  group,
  title = "This listing is suspended",
  showResubmitHint = false,
  className,
}: GroupSuspensionBannerProps) {
  if (group.status !== GroupStatus.SUSPENDED) return null;

  const { suspensionCategory, suspensionReason } = group;
  const categoryLabel = suspensionCategory
    ? (REPORT_CATEGORY_LABELS[suspensionCategory as ReportCategories] ?? suspensionCategory)
    : null;

  return (
    <Banner
      variant="warning"
      icon={<AlertTriangle />}
      className={className}
      title={title}
      description={
        <>
          {categoryLabel
            ? `Suspended for ${categoryLabel.toLowerCase()}.`
            : "Suspended by our moderation team."}
          {suspensionReason && <> {suspensionReason}</>}
          {showResubmitHint && <> Make your changes and send it back for review.</>}
        </>
      }
    />
  );
}
