import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { SecretAdminAccess } from "@/components/layout/SecretAdminAccess";
import { getHeaderNavLinks } from "@/lib/queries/nav";
import { getFooterData } from "@/lib/queries/footer";
import { getSiteSocial, getSiteLogo } from "@/lib/queries/site-settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [navLinks, footerData, social, logoUrl] = await Promise.all([
    getHeaderNavLinks(),
    getFooterData(),
    getSiteSocial(),
    getSiteLogo(),
  ]);

  return (
    <>
      <Navbar navLinks={navLinks} logoUrl={logoUrl ?? undefined} />
      <main className="flex-1">{children}</main>
      <Footer columns={footerData.columns} contact={footerData.contact} config={footerData.config} social={social} />
      <ScrollToTopButton />
      <SecretAdminAccess />
    </>
  );
}
