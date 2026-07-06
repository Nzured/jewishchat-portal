import { Avatar } from "./Avatar";
import { Typography } from "./Typography";

interface AvatarStackUser {
  name: string;
  profilePic?: string;
}

interface AvatarStackProps {
  users: AvatarStackUser[];
  max?: number;
}

export function AvatarStack({ users, max = 3 }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={i}
          className="ring-2 ring-surface-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar variant="circle" size="sm" name={user.name} src={user.profilePic} />
        </div>
      ))}
      {overflow > 0 && (
        <Typography variant="small" className="ml-1.5 text-ink-3 font-medium">
          +{overflow}
        </Typography>
      )}
    </div>
  );
}
