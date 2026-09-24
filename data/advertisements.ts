export type Advertisement = {
  title: string;
  youtubeId: string;
};

// Matches the "ภาพยนตร์โฆษณา" nav dropdown (data/nav.ts) and the video IDs
// already published on the old site / the advertisements/* pages in this DB.
export const advertisements: Advertisement[] = [
  { title: "I HERB", youtubeId: "H1ZKk7B4d9A" },
  { title: "HYATEAR", youtubeId: "ggpQVm9x6dU" },
  { title: "CYSTERINE", youtubeId: "xjrjtL9eeWk" },
];
