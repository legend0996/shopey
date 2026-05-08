"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCartStore } from "@/store/cartStore";
import { resolveImageUrl } from "@/lib/images";
import { useAuthStore } from "@/store/authStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const token = useAuthStore((s) => s.token);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add products to continue to checkout."
          action={<Link href="/"><Button>Continue Shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1fr_360px] gap-6">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-2xl font-bold text-slate-900 mb-5">Shopping Cart</h1>
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                <Image src={resolveImageUrl(product.image)} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">{product.name}</h2>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50">−</button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50">+</button>
                  <button onClick={() => removeItem(product.id)} className="ml-3 text-sm text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">KES {(product.price * quantity).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">KES {product.price.toLocaleString()} each</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit sticky top-24">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Items</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>KES {subtotal().toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>KES {subtotal().toLocaleString()}</span>
          </div>
        </div>
        <Link href={token ? "/checkout" : "/login?next=%2Fcheckout"} className="block mt-5">
          <Button fullWidth size="lg">{token ? "Proceed to Checkout" : "Login to Checkout"}</Button>
        </Link>
      </aside>
    </div>
  );
}
