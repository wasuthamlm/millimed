export type FooterLink = {
  id: string;
  label: string;
  href: string;
};

export type FooterColumn = {
  id: string;
  title: string;
  links: FooterLink[];
};
