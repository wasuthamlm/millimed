export type PopupFrequency = "every-visit" | "once-per-day" | "once-per-session";

export type PopupConfig = {
  enabled: boolean;
  titleTh: string;
  image: string;
  link: string;
  frequency: PopupFrequency;
  startDate: string;
  endDate: string;
};
