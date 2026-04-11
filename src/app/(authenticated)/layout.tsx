import BottomNav from "@/components/layout/bottom-nav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3">
        <div>
          <p className="text-[10px] font-medium text-gray-400">Coaching Hub</p>
          <p className="text-sm font-bold text-gray-900">コーチングハブ</p>
        </div>
      </header>
      <main className="flex-1 px-3 pb-24 pt-3 md:px-6 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
