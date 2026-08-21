import { PageHeader } from "@/components/admin/PageHeader";
import { KeyIcon } from "@/components/ui/admin-icons";
import { ApiKeyManager, type ApiKeyRow } from "@/components/admin/api-keys/ApiKeyManager";
import * as apiKeyService from "@/lib/services/api-keys";

export const dynamic = "force-dynamic";

export default async function AdminApiKeysPage() {
  const keys = await apiKeyService.listApiKeys();

  const rows: ApiKeyRow[] = keys.map((k) => ({
    id: k.id,
    label: k.label,
    keyPrefix: k.keyPrefix,
    scopes: k.scopes,
    active: k.active,
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
    createdAt: k.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={KeyIcon}
        title="API Keys"
        subtitle="จัดการ key สำหรับระบบภายนอก (เช่น CMS) ที่เรียกใช้ REST API ของเว็บนี้"
      />
      <ApiKeyManager keys={rows} />
    </div>
  );
}
