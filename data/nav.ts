export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const navLinks: NavLink[] = [
  { label: "หน้าแรก", href: "/" },
  {
    label: "รู้จักเรา",
    href: "#",
    children: [
      { label: "นโยบายและเป้าหมาย", href: "/about/policy" },
      { label: "วิสัยทัศน์องค์กร", href: "/about/vision" },
      { label: "คุณภาพที่ได้รับการรับรอง", href: "/about/quality-certification" },
      { label: "ประกันคุณภาพการผลิต", href: "/about/quality-assurance" },
      { label: "กลุ่มธุรกิจ", href: "/about/business-group" },
    ],
  },
  { label: "ผลิตภัณฑ์", href: "/products" },
  { label: "ข่าวสารและกิจกรรม", href: "/news" },
  {
    label: "ภาพยนตร์โฆษณา",
    href: "#",
    children: [
      { label: "I HERB", href: "/advertisements/i-herb" },
      { label: "HYATEAR", href: "/advertisements/hyatear" },
      { label: "CYSTERINE", href: "/advertisements/cysterine" },
    ],
  },
  { label: "ร่วมงานกับเรา", href: "/careers" },
  { label: "ติดต่อเรา", href: "/contact" },
];
