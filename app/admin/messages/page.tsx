import Link from "next/link";
import type { WhereOptions } from "sequelize";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { MailIcon } from "@/components/ui/admin-icons";
import { MessageFilters } from "@/components/admin/messages/MessageFilters";
import { MessageStatusCell } from "@/components/admin/messages/MessageStatusCell";
import { MessageRowMenu } from "@/components/admin/messages/MessageRowMenu";
import { ContactMessage } from "@/lib/db/models/index";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: WhereOptions = status ? { status } : {};

  const { rows: messages, count: totalMessages } = await ContactMessage.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalMessages / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={MailIcon} title="ข้อความติดต่อ" subtitle={`ข้อความทั้งหมด ${totalMessages} รายการ`} />

      <MessageFilters />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ผู้ส่ง</th>
              <th className="px-6 py-3 font-medium">หัวข้อ</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">วันที่ส่ง</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5">
                  <Link href={`/admin/messages/${message.id}`} className="font-medium text-slate-800 hover:text-brand-navy">
                    {message.name}
                  </Link>
                  <p className="text-xs text-slate-400">{message.email}</p>
                </td>
                <td className="max-w-xs truncate px-6 py-3.5 text-slate-600">{message.subject || "—"}</td>
                <td className="px-6 py-3.5">
                  <MessageStatusCell id={message.id} status={message.status} />
                </td>
                <td className="px-6 py-3.5 text-slate-400">{formatThaiDate(message.createdAt.toISOString())}</td>
                <td className="px-6 py-3.5">
                  <MessageRowMenu id={message.id} />
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบข้อความที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/messages" extraParams={{ status }} />
    </div>
  );
}
