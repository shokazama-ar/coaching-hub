"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", Icon: Home },
  { href: "/practice-logs", label: "練習ログ", Icon: ClipboardList },
  { href: "/athletes", label: "選手", Icon: Users },
  { href: "/settings/profile", label: "設定", Icon: Settings },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                isActive ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
