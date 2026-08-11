import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { MailIcon } from "@/components/ui/admin-icons";
import { MessageDetailActions } from "@/components/admin/messages/MessageDetailActions";
import { markMessageRead } from "@/app/admin/messages/actions";
import { ContactMessage } from "@/lib/db/models/index";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const message = await ContactMessage.findByPk(id);
  if (!message) notFound();

  if (message.status === "NEW") {
    await markMessageRead(id);
    message.status = "READ";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={MailIcon} title={message.subject || "ข้อความติดต่อ"} subtitle={formatThaiDate(message.createdAt.toISOString())} />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-400">ชื่อผู้ส่ง</p>
            <p className="text-sm text-slate-800">{message.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">อีเมล</p>
            <a href={`mailto:${message.email}`} className="text-sm text-brand-navy hover:underline">
              {message.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">เบอร์โทร</p>
            <p className="text-sm text-slate-800">{message.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">หัวข้อ</p>
            <p className="text-sm text-slate-800">{message.subject || "—"}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-medium text-slate-400">ข้อความ</p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{message.body}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "ข้อความจากเว็บไซต์"}`)}`}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          ตอบกลับทางอีเมล
        </a>
        <MessageDetailActions id={message.id} status={message.status} />
      </div>
    </div>
  );
}
