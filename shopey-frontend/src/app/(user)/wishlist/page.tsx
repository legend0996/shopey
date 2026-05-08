"use client";
import { useQuery } from "@tanstack/react-query";
import { wishlistService } from "@/services/wishlistService";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const token = useAuthStore((s) => s.token);

  const { data: wishlisted, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.getAll().then((r) => r.data ?? []),
    enabled: Boolean(token),
  });

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Login required"
          description="Please sign in to view and manage your wishlist."
          action={<Link href="/login?next=%2Fwishlist"><Button>Go to Login</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Wishlist</h1>

      {!isLoading && (!wishlisted || wishlisted.length === 0) ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          title="Your wishlist is empty"
          description="Browse products and tap the heart icon to save items."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlisted.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
