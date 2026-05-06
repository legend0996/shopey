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
import { resolveImageUrl } from "@/lib/images";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-8">
      <div className="relative h-95 sm:h-130 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        <Image src={resolveImageUrl(product.image)} alt={product.name} fill className="object-cover" />
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
              addItem(product);
              toast.success("Added to cart");
            }}
          >
            Add to Cart
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              toggle(product.id);
              toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
            }}
          >
            {wished ? "Remove Wishlist" : "Add to Wishlist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
