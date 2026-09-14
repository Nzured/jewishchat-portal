import { cache } from "react";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_HOME_PATH } from "@/configs/const";
import { UserServer } from "@/services/user/user.server";
import { MemberProfileClient } from "./_components/MemberProfileClient";
import type { Metadata } from "next";

export const revalidate = 300;

interface MemberProfilePageProps {
  params: Promise<{ user: string }>;
}

const findMember = cache((uuid: string) => UserServer.getUserById(uuid));

const fullName = (member: { firstName: string; lastName: string }) =>
  `${member.firstName} ${member.lastName}`.trim();

export async function generateMetadata({ params }: MemberProfilePageProps): Promise<Metadata> {
  const { user: uuid } = await params;
  const member = await findMember(uuid);
  if (!member) return { title: "Member not found" };

  return {
    title: `${fullName(member)} | ChatList`,
    description: `Groups listed on ChatList by ${fullName(member)}.`,
  };
}

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { user: uuid } = await params;
  const member = await findMember(uuid);
  if (!member) notFound();

  const name = fullName(member);

  return (
    <div className="flex w-full flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: name }]} />

      <div className="flex items-center gap-4">
        <Avatar src={member.profilePic} name={name} size="xl" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography variant="h1" className="truncate font-display font-bold">
            {name}
          </Typography>
          <Typography variant="muted">Community member</Typography>
        </div>
      </div>

      <MemberProfileClient memberUuid={member.uuid} />
    </div>
  );
}
