"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Product } from "@/types";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

const CATEGORIES = ["All", "Electronics", "Fashion", "Food", "Beauty", "Home", "Sports"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const debouncedSearch = useDebounce(search, 400);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", debouncedSearch, category],
    queryFn: () =>
      productService
        .getAll({
          search: debouncedSearch || undefined,
          category: category === "All" ? undefined : category,
        })
        .then((r) => r.data?.products ?? r.data ?? []),
  });

  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeatured().then((r) => r.data?.products ?? r.data ?? []),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 px-4 bg-linear-to-br from-white to-gray-50 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div className="inline-block bg-[#C9A14A]/10 text-[#C9A14A] text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Premium Shopping in Kenya
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Discover & Shop<br />
          <span className="text-[#C9A14A]">Premium Products</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Fast delivery, curated selection, and unbeatable prices.
        </p>
        <div className="max-w-lg mx-auto">
          <Input
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </motion.section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">⭐ Featured</h2>
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin">
            {featured.map((product: Product, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 w-50 sm:w-55 snap-start"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:cursor-pointer ${
                category === cat
                  ? "bg-[#C9A14A] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : !products || products.length === 0 ? (
          <EmptyState
            icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            title="No products found"
            description={debouncedSearch ? `No results for "${debouncedSearch}"` : "Check back soon."}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: Product, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
