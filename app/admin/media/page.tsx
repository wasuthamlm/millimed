import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { ImageIcon } from "@/components/ui/admin-icons";
import { FolderList } from "@/components/admin/media/FolderList";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaUploader } from "@/components/admin/media/MediaUploader";
import { Media, MediaFolder } from "@/lib/db/models/index";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; folder?: string }>;
}) {
  const { page: pageParam, folder } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const activeFolderId = folder || null;

  const [allFolders, totalCount, { rows: media, count: totalItems }] = await Promise.all([
    MediaFolder.findAll({ order: [["name", "ASC"]] }),
    Media.count(),
    Media.findAndCountAll({
      where: activeFolderId ? { folderId: activeFolderId } : {},
      order: [["createdAt", "DESC"]],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const folderCounts = await Promise.all(allFolders.map((f) => Media.count({ where: { folderId: f.id } })));
  const folders = allFolders.map((f, i) => ({ id: f.id, name: f.name, count: folderCounts[i] }));

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader icon={ImageIcon} title="คลังสื่อ" subtitle={`ไฟล์ทั้งหมด ${totalCount} รายการ`} />
        <MediaUploader folderId={activeFolderId} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <FolderList folders={folders} activeFolderId={activeFolderId} totalCount={totalCount} />
        </div>

        <div className="flex flex-col gap-4">
          <MediaGrid
            items={media.map((m) => ({ id: m.id, url: m.url, filename: m.filename, folderId: m.folderId }))}
            folders={folders.map((f) => ({ id: f.id, name: f.name }))}
          />
          <Pager page={page} totalPages={totalPages} basePath="/admin/media" extraParams={{ folder: activeFolderId ?? undefined }} />
        </div>
      </div>
    </div>
  );
}
