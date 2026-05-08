"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const adminLoginPath = pathname?.startsWith("/securedlink") ? "/securedlink/login" : "/admin/login";
  const isLoginPage = pathname === "/securedlink/login" || pathname === "/admin/login";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => adminService.me().then((r) => r.data),
    retry: 0,
    enabled: !isLoginPage,
  });

  useEffect(() => {
    if (!isLoginPage && isError) {
      localStorage.removeItem("admin_token");
      router.replace(adminLoginPath);
    }
  }, [adminLoginPath, isError, isLoginPage, router]);

  useEffect(() => {
    if (isLoginPage && data?.admin) {
      router.replace(pathname?.startsWith("/securedlink") ? "/securedlink" : "/admin");
    }
  }, [data?.admin, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading admin session...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <span className="text-lg font-bold text-slate-900">Shopey</span>
          <p className="text-xs text-[#C9A14A] font-medium">Admin Portal</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: "Dashboard", href: "/securedlink" },
            { label: "Orders", href: "/securedlink/orders" },
            { label: "Shops", href: "/securedlink/shops" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-50 hover:text-[#C9A14A] transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full text-left text-sm text-red-500 hover:text-red-700 transition-colors"
            onClick={() => {
              localStorage.removeItem("admin_token");
              window.location.href = adminLoginPath;
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
