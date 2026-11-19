export interface CourtyardHotspot {
  id: string;
  discovery: string;
  kind: "lamp" | "detail";
  x: number;
  y: number;
  label: string;
  neLabel: string;
}

// Normalized locations in the supplied 1672 × 941 courtyard artwork.
export const courtyardHotspots: CourtyardHotspot[] = [
  { id: "court-left", discovery: "light", kind: "lamp", x: 0.206, y: 0.86, label: "Diya beside the rangoli", neLabel: "रङ्गोलीछेउको दियो" },
  { id: "court-right", discovery: "light", kind: "lamp", x: 0.71, y: 0.667, label: "Diya on the temple ledge", neLabel: "मन्दिरको डिलमा दियो" },
  { id: "court-step-left", discovery: "light", kind: "lamp", x: 0.485, y: 0.714, label: "Diya beside the left steps", neLabel: "बायाँ खुड्किलाछेउको दियो" },
  { id: "court-step-right", discovery: "light", kind: "lamp", x: 0.614, y: 0.716, label: "Diya beside the right steps", neLabel: "दायाँ खुड्किलाछेउको दियो" },
  { id: "court-center", discovery: "light", kind: "lamp", x: 0.502, y: 0.67, label: "Diya near the temple entrance", neLabel: "मन्दिरको प्रवेशछेउको दियो" },
  { id: "garlands", discovery: "garlands", kind: "detail", x: 0.066, y: 0.518, label: "Marigold garland at the door", neLabel: "ढोकामा सयपत्रीको माला" },
  { id: "eaves", discovery: "architecture", kind: "detail", x: 0.555, y: 0.535, label: "Carved timber beneath the eaves", neLabel: "छानामुनिका बुट्टेदार काठ" },
  { id: "rangoli", discovery: "courtyard", kind: "detail", x: 0.128, y: 0.888, label: "Rangoli in the courtyard", neLabel: "आँगनको रङ्गोली" },
];
