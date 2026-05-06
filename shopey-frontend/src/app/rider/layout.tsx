"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rider_token");
      if (!token && pathname !== "/rider/login") {
        router.replace("/rider/login");
      }
    }
  }, [pathname, router]);

  if (pathname === "/rider/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rider Top Nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900">Shopey</span>
            <span className="ml-2 text-xs bg-[#C9A14A]/10 text-[#C9A14A] font-semibold px-2 py-0.5 rounded-full">Rider</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/rider" className="text-slate-600 hover:text-[#C9A14A] transition-colors">Deliveries</Link>
            <button
              className="text-red-500 hover:text-red-700 transition-colors"
              onClick={() => {
                localStorage.removeItem("rider_token");
                window.location.href = "/rider/login";
              }}
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
