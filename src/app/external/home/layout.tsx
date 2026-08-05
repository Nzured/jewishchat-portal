import { HomeProvider } from "./_context/HomeContext";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <HomeProvider>{children}</HomeProvider>;
}
