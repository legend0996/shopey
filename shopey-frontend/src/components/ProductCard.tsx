"use client";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "./ui/Button";
import { toast } from "sonner";
import clsx from "clsx";
import { resolveImageUrl } from "@/lib/images";
import { usePathname, useRouter } from "next/navigation";
import { savePendingAction } from "@/lib/pendingAction";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const pathname = usePathname();
  const wished = has(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!token) {
      savePendingAction({ type: "add_to_cart", product });
      toast.info("Please log in to add items to cart");
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!token) {
      savePendingAction({ type: "toggle_wishlist", product });
      toast.info("Please log in to manage wishlist");
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    try {
      const added = await toggle(String(product.id));
      toast.success(added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Wishlist update failed. Please try again.");
    }
  };

  const imageUrl = resolveImageUrl(product.image);

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={clsx("w-4 h-4 transition-colors", wished ? "text-red-500" : "text-gray-400")}
              fill={wished ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {product.featured && (
            <span className="absolute top-2 left-2 bg-[#C9A14A] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="p-3.5">
          <h3 className="text-sm font-medium text-slate-900 line-clamp-1 mb-0.5">{product.name}</h3>

          {product.rating !== undefined && (
            <div className="flex items-center gap-1 mb-1.5">
              <svg className="w-3.5 h-3.5 text-[#C9A14A]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-xs text-gray-400">({product.reviewCount})</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-slate-900">
              KES {product.price.toLocaleString()}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="shrink-0 px-3! py-1.5! text-xs!"
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
