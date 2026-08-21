import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { getFooterData } from "@/lib/queries/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { contact } = await getFooterData();

  return (
    <Container className="flex flex-col gap-10 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">ติดต่อเรา</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <div className="flex h-fit flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold text-slate-900">ข้อมูลติดต่อ</h2>
          <ul className="flex flex-col gap-3 text-sm text-slate-600">
            {contact?.phone && (
              <li>
                <span className="block text-xs text-slate-400">โทร</span>
                {contact.phone}
              </li>
            )}
            {contact?.email && (
              <li>
                <span className="block text-xs text-slate-400">อีเมล</span>
                {contact.email}
              </li>
            )}
            {contact?.address && (
              <li>
                <span className="block text-xs text-slate-400">ที่อยู่</span>
                <span className="whitespace-pre-line leading-relaxed">{contact.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Container>
  );
}
