import { Chip } from "@/components/ui/Chip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { NOT_APPLICABLE } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";

const MAX_VISIBLE_ROLES = 3;

export function RoleChips({ roles }: { roles?: string[] }) {
  if (!roles || roles.length === 0) {
    return <Chip label={NOT_APPLICABLE} shape="pill" type="neutral" />;
  }

  const visibleRoles = roles.slice(0, MAX_VISIBLE_ROLES);
  const remainingRoles = roles.slice(MAX_VISIBLE_ROLES);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleRoles.map((role) => (
        <Chip key={role} label={wordFormatter(role)} shape="pill" type="neutral" />
      ))}
      {remainingRoles.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Chip label={`+${remainingRoles.length}`} shape="pill" type="neutral" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {remainingRoles.map((role) => wordFormatter(role)).join(", ")}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
