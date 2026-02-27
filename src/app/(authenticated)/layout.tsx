export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Coaching Hub</p>
          <p className="text-sm font-semibold text-gray-900">
            今日の練習ログ
          </p>
        </div>
      </header>
      <main className="flex-1 px-3 pb-20 pt-3 md:px-6 md:pb-6">
        {children}
      </main>
    </div>
  );
}

