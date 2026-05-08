"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Product } from "@/types";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

const FALLBACK_CATEGORIES = ["All", "Electronics", "Fashion", "Food", "Beauty", "Home", "Sports"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popularity", label: "Most Popular" },
];

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  return text.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className="bg-[#C9A14A]/20 text-slate-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function HomePage() {
  const router = useRouter();
  const [paramsState, setParamsState] = useState<URLSearchParams>(
    () => new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  );

  const [search, setSearch] = useState(paramsState.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(paramsState.get("q") || "");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const category = paramsState.get("category") || "All";
  const minPrice = paramsState.get("minPrice") || "";
  const maxPrice = paramsState.get("maxPrice") || "";
  const rating = paramsState.get("rating") || "";
  const inStock = paramsState.get("inStock") === "true";
  const featured = paramsState.get("featured") === "true";
  const newest = paramsState.get("newest") === "true";
  const sort = paramsState.get("sort") || "newest";
  const brand = paramsState.get("brand") || "";
  const page = Number(paramsState.get("page") || "1");

  useEffect(() => {
    const syncFromUrl = () => {
      setParamsState(new URLSearchParams(window.location.search));
      const query = new URLSearchParams(window.location.search).get("q") || "";
      setSearch(query);
      setDebouncedSearch(query);
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const updateQuery = useCallback((updates: Record<string, string | number | boolean | null | undefined>) => {
    const next = new URLSearchParams(paramsState.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === false) {
        next.delete(key);
        return;
      }

      next.set(key, String(value));
    });

    const target = `/?${next.toString()}`;
    router.replace(target);
    setParamsState(new URLSearchParams(next.toString()));
  }, [paramsState, router]);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      updateQuery({ q: value, page: 1 });
    }, 400);
  };

  const { data: productsPayload, isLoading, isFetching, error } = useQuery({
    queryKey: ["products", paramsState.toString()],
    queryFn: () =>
      productService.search({
        q: paramsState.get("q") || undefined,
        category: category === "All" ? undefined : category,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        rating: rating ? Number(rating) : undefined,
        inStock: paramsState.get("inStock") === "true" ? true : undefined,
        featured: paramsState.get("featured") === "true" ? true : undefined,
        newest: paramsState.get("newest") === "true" ? true : undefined,
        brand: brand || undefined,
        sort: sort as "newest" | "price_asc" | "price_desc" | "rating" | "popularity",
        page,
        limit: 12,
      }).then((r) => r.data),
  });

  const products = productsPayload?.products ?? [];
  const pagination = productsPayload?.pagination;

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["product-suggestions", debouncedSearch],
    queryFn: () => productService.suggestions(debouncedSearch).then((r) => r.data?.suggestions ?? []),
    enabled: debouncedSearch.trim().length > 1,
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productService.getCategories().then((r) => r.data ?? []),
  });

  const categories = categoriesResponse?.length
    ? ["All", ...categoriesResponse.map((item: { name: string }) => item.name).filter(Boolean)]
    : FALLBACK_CATEGORIES;

  const { data: featuredProducts } = useQuery({
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
          <div className="relative">
              <Input
              aria-label="Search products"
              placeholder="Search by name, category, tags, description..."
              value={search}
                aria-expanded={suggestionOpen}
                aria-autocomplete="list"
              onFocus={() => setSuggestionOpen(true)}
              onBlur={() => setTimeout(() => setSuggestionOpen(false), 150)}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />

            {suggestionOpen && search.trim().length > 1 ? (
              <div className="absolute left-0 right-0 mt-2 z-20 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden text-left">
                {suggestionsLoading ? (
                  <div className="p-3 text-sm text-gray-500">Loading suggestions...</div>
                ) : suggestions?.length ? (
                  suggestions.map((item: Product) => (
                    <button
                      key={item.id}
                      className="w-full px-3 py-2.5 text-sm hover:bg-gray-50 text-left"
                      onClick={() => router.push(`/products/${item.id}`)}
                    >
                      <div className="font-medium text-slate-800">{highlightMatch(item.name, search)}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500">No suggestions</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </motion.section>

      {/* Featured */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">⭐ Featured</h2>
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin">
            {featuredProducts.map((product: Product, i: number) => (
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
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-slate-900">Shop Products</h2>
          <button
            className="md:hidden text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white"
            onClick={() => setMobileFilterOpen(true)}
          >
            Filters
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateQuery({ category: cat, page: 1 })}
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

        <div className="grid md:grid-cols-[250px_1fr] gap-6">
          <aside className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit sticky top-20 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Sort</label>
              <select
                value={sort}
                onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input aria-label="Minimum price" placeholder="Min" value={minPrice} onChange={(e) => updateQuery({ minPrice: e.target.value, page: 1 })} />
              <Input aria-label="Maximum price" placeholder="Max" value={maxPrice} onChange={(e) => updateQuery({ maxPrice: e.target.value, page: 1 })} />
            </div>

            <Input
              aria-label="Filter by brand"
              placeholder="Brand"
              value={brand}
              onChange={(e) => updateQuery({ brand: e.target.value, page: 1 })}
            />

            <select
              value={rating}
              onChange={(e) => updateQuery({ rating: e.target.value, page: 1 })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              aria-label="Minimum rating"
            >
              <option value="">Any rating</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
              <option value="2">2★ & above</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={inStock} onChange={(e) => updateQuery({ inStock: e.target.checked, page: 1 })} /> In stock only
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={featured} onChange={(e) => updateQuery({ featured: e.target.checked, page: 1 })} /> Featured only
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={newest} onChange={(e) => updateQuery({ newest: e.target.checked, page: 1 })} /> Newest first
            </label>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                router.replace("/");
                setParamsState(new URLSearchParams());
                setSearch("");
                setDebouncedSearch("");
              }}
            >
              Reset Filters
            </Button>
          </aside>

          <div>
            {isLoading || isFetching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <EmptyState
                title="Could not load products"
                description="Something went wrong while searching. Please try again."
              />
            ) : !products || products.length === 0 ? (
              <EmptyState
                icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                title="No products found"
                description={debouncedSearch ? `No results for "${debouncedSearch}"` : "Try adjusting your filters."}
              />
            ) : (
              <>
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

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
                      disabled={!pagination?.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateQuery({ page: page + 1 })}
                      disabled={!pagination?.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Drawer open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} title="Filters" side="right">
        <div className="space-y-4">
          <select
            value={sort}
            onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Input placeholder="Min price" value={minPrice} onChange={(e) => updateQuery({ minPrice: e.target.value, page: 1 })} />
          <Input placeholder="Max price" value={maxPrice} onChange={(e) => updateQuery({ maxPrice: e.target.value, page: 1 })} />
          <Input placeholder="Brand" value={brand} onChange={(e) => updateQuery({ brand: e.target.value, page: 1 })} />
          <select
            value={rating}
            onChange={(e) => updateQuery({ rating: e.target.value, page: 1 })}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any rating</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
            <option value="2">2★ & above</option>
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={inStock} onChange={(e) => updateQuery({ inStock: e.target.checked, page: 1 })} /> In stock only</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={featured} onChange={(e) => updateQuery({ featured: e.target.checked, page: 1 })} /> Featured only</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newest} onChange={(e) => updateQuery({ newest: e.target.checked, page: 1 })} /> Newest first</label>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              router.replace("/");
              setParamsState(new URLSearchParams());
              setSearch("");
              setDebouncedSearch("");
              setMobileFilterOpen(false);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
