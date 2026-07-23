import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { Role } from "@/types/Role";

export function RoleCard({ row }: { row: Role }) {
  return (
    <Link href={`/internal/roles/${row.id}`} className="block">
      <Card size="sm" className="transition-shadow hover:shadow-md active:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Typography variant="small" className="font-mono font-medium text-ink-2">
                {wordFormatter(row?.name)}
              </Typography>
              <Typography variant="muted">{row?.description ?? NOT_APPLICABLE}</Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
