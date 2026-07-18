"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { Permission } from "@/types/Permission";

interface PermissionsPanelProps {
  permissions: Permission[];
  grantedIds: Set<number>;
  onToggle: (permissionId: number, granted: boolean) => void;
}

export function PermissionsPanel({ permissions, grantedIds, onToggle }: PermissionsPanelProps) {
  const [query, setQuery] = useState("");
  const totalGranted = permissions.filter((p) => grantedIds.has(p.id)).length;

  const filteredPermissions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return permissions;
    return permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(search) ||
        permission.description.toLowerCase().includes(search),
    );
  }, [permissions, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Typography variant="xs" className="font-semibold tracking-wide text-ink-3 uppercase">
          Permissions
        </Typography>
        <Typography variant="xs" className="text-ink-3">
          {totalGranted} / {permissions.length} granted
        </Typography>
      </div>

      <Input
        leftIcon={<Search className="size-4" />}
        placeholder="Search permissions"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="flex flex-col gap-3">
        {filteredPermissions?.map((permission) => {
          const granted = grantedIds.has(permission.id);
          return (
            <Card key={permission.id} size="sm">
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <Typography variant="small" className="font-semibold text-ink-1">
                    {permission.name}
                  </Typography>
                  <Typography variant="xs" className="text-ink-3">
                    {permission.description}
                  </Typography>
                </div>
                <Switch
                  checked={granted}
                  onCheckedChange={(checked) => onToggle(permission.id, checked)}
                />
              </CardContent>
            </Card>
          );
        })}

        {filteredPermissions.length === 0 && <EmptyState message="No permissions found." />}
      </div>
    </div>
  );
}
