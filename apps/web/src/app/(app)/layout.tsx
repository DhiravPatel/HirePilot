import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
