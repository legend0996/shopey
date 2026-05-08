"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { resolveImageUrl } from "@/lib/images";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { usePathname, useRouter } from "next/navigation";
import { savePendingAction } from "@/lib/pendingAction";
import { useState } from "react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id).then((r) => r.data?.product ?? r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
        <Skeleton className="h-110 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-16 text-gray-400">Product not found.</div>;
  }

  const wished = has(product.id);
  const fromApi = Array.isArray(product.gallery)
    ? product.gallery.map((img: { url?: string; image_url?: string }) => img.url || img.image_url).filter(Boolean)
    : [];
  const gallery = fromApi.length > 0
    ? fromApi
    : Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : [];

  const activeImage = gallery[activeIndex] || product.image;
  const canSlide = gallery.length > 1;

  const goPrev = () => {
    if (!canSlide) return;
    setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const goNext = () => {
    if (!canSlide) return;
    setActiveIndex((prev) => (prev + 1) % gallery.length);
  };

  const requireAuth = (action: "add_to_cart" | "toggle_wishlist") => {
    if (token) return true;
    savePendingAction({ type: action, product });
    toast.info("Please log in to continue");
    router.push(`/login?next=${encodeURIComponent(pathname || `/products/${product.id}`)}`);
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <button
          className="relative h-95 sm:h-130 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#C9A14A]"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open product image zoom"
        >
          <Image src={resolveImageUrl(activeImage)} alt={product.name} fill className="object-cover" />
        </button>

        {canSlide ? (
          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" onClick={goPrev} aria-label="Previous image">Previous</Button>
            <span className="text-xs text-gray-500">{activeIndex + 1} / {gallery.length}</span>
            <Button variant="secondary" size="sm" onClick={goNext} aria-label="Next image">Next</Button>
          </div>
        ) : null}

        {gallery.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {gallery.map((img: string, index: number) => (
              <button
                key={`${img}-${index}`}
                className={`relative h-20 rounded-xl overflow-hidden border ${
                  activeIndex === index ? "border-[#C9A14A] ring-1 ring-[#C9A14A]" : "border-gray-200"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <Image src={resolveImageUrl(img)} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-2">{product.category}</p>
          </div>
          {product.featured ? <Badge label="Featured" className="bg-[#C9A14A]/10 text-[#C9A14A]" /> : null}
        </div>

        <p className="text-3xl font-bold text-slate-900">KES {product.price.toLocaleString()}</p>

        {product.rating ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-[#C9A14A]">★</span>
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount ?? 0} reviews)</span>
          </div>
        ) : null}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Description</h2>
          <p className="text-sm leading-7 text-gray-600">{product.description || "No description available."}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            onClick={() => {
              if (!requireAuth("add_to_cart")) return;
              addItem(product);
              toast.success("Added to cart");
            }}
          >
            Add to Cart
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={async () => {
              if (!requireAuth("toggle_wishlist")) return;
              try {
                const added = await toggle(String(product.id));
                toast.success(added ? "Added to wishlist" : "Removed from wishlist");
              } catch {
                toast.error("Wishlist update failed");
              }
            }}
          >
            {wished ? "Remove Wishlist" : "Add to Wishlist"}
          </Button>
        </div>
      </div>

      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} title={product.name} size="xl">
        <div className="space-y-3">
          <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden bg-gray-50">
            <Image src={resolveImageUrl(activeImage)} alt={product.name} fill className="object-contain" />
          </div>
          {canSlide ? (
            <div className="flex items-center justify-between">
              <Button variant="secondary" size="sm" onClick={goPrev}>Previous</Button>
              <Button variant="secondary" size="sm" onClick={goNext}>Next</Button>
            </div>
          ) : null}
          {gallery.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((img: string, index: number) => (
                <button
                  key={`lightbox-${img}-${index}`}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 ${
                    activeIndex === index ? "border-[#C9A14A]" : "border-gray-200"
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <Image src={resolveImageUrl(img)} alt={`${product.name} preview ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
