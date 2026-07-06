export type CategoryColor =
  | "emerald"
  | "amber"
  | "blue"
  | "rose"
  | "slate"
  | "green"
  | "orange"
  | "indigo";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: CategoryColor;
  groupsCount: number;
}
