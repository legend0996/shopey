"use client";
import { useWishlistStore } from "@/store/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Product } from "@/types";

export default function WishlistPage() {
  const { ids } = useWishlistStore();

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll().then((r) => r.data?.products ?? r.data ?? []),
    enabled: ids.length > 0,
  });

  const wishlisted: Product[] = (allProducts ?? []).filter((p: Product) => ids.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Wishlist</h1>

      {ids.length === 0 ? (
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
          {wishlisted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
