import Link from "next/link";
import Image from "next/image";
import { Op, type WhereOptions } from "sequelize";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { BoxIcon, PlusIcon, ArchiveIcon } from "@/components/ui/admin-icons";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductStatusCell } from "@/components/admin/products/ProductStatusCell";
import { ProductFlagsCell } from "@/components/admin/products/ProductFlagsCell";
import { ProductRowMenu } from "@/components/admin/products/ProductRowMenu";
import { Product, ProductCategory, Media } from "@/lib/db/models/index";
import { formatCurrencyTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string }>;
}) {
  const { page: pageParam, q, category, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: WhereOptions = {
    ...(q
      ? {
          [Op.or]: [{ nameTh: { [Op.iLike]: `%${q}%` } }, { nameEn: { [Op.iLike]: `%${q}%` } }, { sku: { [Op.iLike]: `%${q}%` } }],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
    ...(status ? { status } : {}),
  };

  const [{ rows: products, count: totalProducts }, allCategories] = await Promise.all([
    Product.findAndCountAll({
      where,
      order: [["updatedAt", "DESC"]],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      include: [
        { model: ProductCategory, as: "categoryRef" },
        { model: Media, as: "image" },
      ],
    }),
    ProductCategory.findAll({
      where: { active: true },
      order: [["order", "ASC"], ["nameTh", "ASC"]],
      attributes: ["id", "nameTh"],
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader icon={BoxIcon} title="สินค้า" subtitle={`สินค้าทั้งหมด ${totalProducts} รายการ`} />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products?status=ARCHIVED"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <ArchiveIcon className="h-4 w-4" />
            ถังขยะ
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
          >
            <PlusIcon className="h-4 w-4" />
            เพิ่มสินค้าใหม่
          </Link>
        </div>
      </div>

      <ProductFilters categories={allCategories.map((c) => ({ id: c.id, nameTh: c.nameTh }))} />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อสินค้า</th>
              <th className="px-6 py-3 font-medium">หมวดหมู่</th>
              <th className="px-6 py-3 font-medium">ราคา</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">แนะนำ/ขายดี</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const category = product.get("categoryRef") as ProductCategory | null;
              const image = product.get("image") as Media | null;
              return (
                <tr key={product.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                        {image ? (
                          <Image src={image.url} alt={product.nameTh} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-slate-300">—</div>
                        )}
                      </div>
                      <div>
                        <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-slate-800 hover:text-brand-navy">
                          {product.nameTh}
                        </Link>
                        <p className="text-xs text-slate-400">{product.nameEn || product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{category?.nameTh ?? "—"}</td>
                  <td className="px-6 py-3.5 text-slate-500">{product.price != null ? formatCurrencyTHB(Number(product.price)) : "—"}</td>
                  <td className="px-6 py-3.5">
                    <ProductStatusCell id={product.id} status={product.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <ProductFlagsCell id={product.id} featured={product.featured} bestSeller={product.bestSeller} />
                  </td>
                  <td className="px-6 py-3.5">
                    <ProductRowMenu id={product.id} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบสินค้าที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/products" extraParams={{ q, category, status }} />
    </div>
  );
}
