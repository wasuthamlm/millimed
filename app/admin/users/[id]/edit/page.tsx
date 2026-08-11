import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm, type InitialUser } from "@/components/admin/users/UserForm";
import { UsersIcon } from "@/components/ui/admin-icons";
import { User } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import type { StaffRole } from "@/app/admin/users/actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, session] = await Promise.all([User.findByPk(id), auth()]);
  if (!user || user.role === "CUSTOMER") notFound();

  const initialUser: InitialUser = {
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    role: user.role as StaffRole,
    disabled: user.disabled,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={UsersIcon} title="แก้ไขผู้ใช้งาน" subtitle={user.email} />
      <UserForm initialUser={initialUser} isSelf={session?.user?.id === user.id} />
    </div>
  );
}
