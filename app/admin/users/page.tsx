import Link from "next/link";
import { Op, type WhereOptions } from "sequelize";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { UsersIcon, PlusIcon } from "@/components/ui/admin-icons";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserRoleCell } from "@/components/admin/users/UserRoleCell";
import { UserDisabledToggle } from "@/components/admin/users/UserDisabledToggle";
import { UserRowMenu } from "@/components/admin/users/UserRowMenu";
import { User } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { formatThaiDate } from "@/lib/utils";
import type { StaffRole } from "@/app/admin/users/actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STAFF_ROLES = ["ADMIN", "APPROVER", "CONTRIBUTOR"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const { page: pageParam, q, role } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: WhereOptions = {
    role: role ? role : { [Op.in]: STAFF_ROLES },
    ...(q ? { [Op.or]: [{ name: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }] } : {}),
  };

  const [{ rows: users, count: totalUsers }, session] = await Promise.all([
    User.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    auth(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const currentUserId = session?.user?.id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={UsersIcon} title="จัดการผู้ใช้งาน" subtitle={`ผู้ใช้งานทั้งหมด ${totalUsers} คน`} />
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มผู้ใช้งานใหม่
        </Link>
      </div>

      <UserFilters />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อ / อีเมล</th>
              <th className="px-6 py-3 font-medium">บทบาท</th>
              <th className="px-6 py-3 font-medium">เปิดใช้งาน</th>
              <th className="px-6 py-3 font-medium">สร้างเมื่อ</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-slate-800">
                      {user.name || "—"} {isSelf && <span className="text-xs font-normal text-slate-400">(คุณ)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <UserRoleCell id={user.id} role={user.role as StaffRole} isSelf={isSelf} />
                  </td>
                  <td className="px-6 py-3.5">
                    <UserDisabledToggle id={user.id} disabled={user.disabled} isSelf={isSelf} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">{formatThaiDate(user.createdAt.toISOString())}</td>
                  <td className="px-6 py-3.5">
                    <UserRowMenu id={user.id} isSelf={isSelf} />
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/users" extraParams={{ q, role }} />
    </div>
  );
}
