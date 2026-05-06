"use client";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProfilePage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.ids.length);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          title="Sign in to view your profile"
          action={<Link href="/login"><Button>Sign In</Button></Link>}
        />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#C9A14A]/10 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-[#C9A14A]">
            {user.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/cart">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-[#C9A14A]/30 transition-colors">
            <p className="text-2xl font-bold text-slate-900">{cartCount}</p>
            <p className="text-sm text-gray-500">Cart Items</p>
          </div>
        </Link>
        <Link href="/orders">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-[#C9A14A]/30 transition-colors">
            <p className="text-2xl font-bold text-slate-900">–</p>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
        </Link>
        <Link href="/wishlist" className="col-span-2 sm:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-[#C9A14A]/30 transition-colors">
            <p className="text-2xl font-bold text-slate-900">{wishlistCount}</p>
            <p className="text-sm text-gray-500">Wishlist</p>
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {[
          { label: "My Orders", href: "/orders" },
          { label: "My Wishlist", href: "/wishlist" },
        ].map(({ label, href }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <Button variant="danger" fullWidth onClick={handleLogout}>Sign Out</Button>
    </div>
  );
}
