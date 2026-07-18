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
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder?: number;

  color?: CategoryColor;
  groupsCount?: number;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  icon: string;
}
