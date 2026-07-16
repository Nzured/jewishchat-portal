import { iconNames, type IconName } from "lucide-react/dynamic";

export const ICON_SEARCH_RESULTS_CAP = 60;

// Widened to `string[]` (rather than keeping the ~1,962-member `IconName` union) so
// downstream `.filter()`/`.slice()` calls don't push that huge union through generic
// inference, which the type-aware ESLint rules can misreport as an unsafe/error type.
export const ALL_ICON_NAMES: string[] = iconNames;

export const DEFAULT_ICON_NAMES: string[] = [
  "car",
  "pie-chart",
  "webcam",
  "church",
  "cherry",
  "id-card",
  "carrot",
  "chess-pawn",
  "paintbrush",
  "star",
  "user-circle",
  "croissant",
  "cigarette",
  "cat",
  "clock",
  "concierge-bell",
  "home",
  "laptop",
  "shirt",
  "sofa",
  "gem",
  "paw-print",
  "wrench",
  "calendar",
  "shopping-bag",
  "book",
  "music",
  "video",
  "coffee",
  "utensils",
  "plane",
  "bike",
  "dumbbell",
  "baby",
  "heart",
  "gift",
  "briefcase",
  "graduation-cap",
  "scissors",
  "hammer",
  "leaf",
  "flower-2",
  "tree-pine",
  "sun",
  "anchor",
  "rocket",
  "building-2",
  "fish",
] satisfies IconName[];
