import { CategoryProvider } from "@/app/internal/categories/_context/CategoryContext";

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <CategoryProvider>{children}</CategoryProvider>;
}
