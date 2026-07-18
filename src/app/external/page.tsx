import { Typography } from "@/components/ui/Typography";

export default function InternalHomePage() {
  return (
    <div className="flex flex-col gap-2">
      <Typography variant="h2">Welcome back</Typography>
      <Typography variant="muted">This is the internal team dashboard.</Typography>
    </div>
  );
}
