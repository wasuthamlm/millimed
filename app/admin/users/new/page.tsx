import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm } from "@/components/admin/users/UserForm";
import { UsersIcon } from "@/components/ui/admin-icons";

export const dynamic = "force-dynamic";

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={UsersIcon} title="เพิ่มผู้ใช้งานใหม่" />
      <UserForm />
    </div>
  );
}
