export interface FilterOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FilterItem {
  key: string;
  label: string;
  component: "AUTOSELECT" | "NUMBER_INPUT" | "NUMBER_RANGE" | "DROPDOWN" | "DATE_RANGE";
  value: string | string[] | null;
  options?: FilterOption[];
  searchValue?: string;
}
