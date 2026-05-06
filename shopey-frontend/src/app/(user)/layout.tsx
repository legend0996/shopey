import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shopey – Premium Shopping" };

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Shopey. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
