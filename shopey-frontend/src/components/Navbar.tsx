"use client";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { CartDrawer } from "@/components/CartDrawer";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#C9A14A] tracking-tight">Shopey</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              <Link href="/" className="hover:text-[#C9A14A] transition-colors">Home</Link>
              <Link href="/wishlist" className="hover:text-[#C9A14A] transition-colors">Wishlist</Link>
              <Link href="/cart" className="hover:text-[#C9A14A] transition-colors">Cart</Link>
              <Link href="/orders" className="hover:text-[#C9A14A] transition-colors">Orders</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A14A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/profile">
                    <button className="text-sm text-slate-700 hover:text-[#C9A14A] transition-colors font-medium">
                      {user.name?.split(" ")[0]}
                    </button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
              ) : (
                <div className="hidden md:flex gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
              <Link href="/" className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/wishlist" className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link href="/cart" className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Cart</Link>
              <Link href="/orders" className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Orders</Link>
              {user ? (
                <>
                  <Link href="/profile" className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 p-2">
                  <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" fullWidth size="sm">Login</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button fullWidth size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
