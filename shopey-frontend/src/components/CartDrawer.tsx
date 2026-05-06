"use client";
import { Drawer } from "./ui/Drawer";
import { useCartStore } from "@/store/cartStore";
import { Button } from "./ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/lib/images";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <Drawer open={open} onClose={onClose} title={`Cart (${items.length})`}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-slate-500 text-sm">Your cart is empty</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <Image src={resolveImageUrl(product.image)} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{product.name}</p>
                  <p className="text-sm text-[#C9A14A] font-semibold">KES {product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-sm font-medium"
                    >−</button>
                    <span className="text-sm font-medium w-5 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-sm font-medium"
                    >+</button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">KES {subtotal().toLocaleString()}</span>
            </div>
            <Button fullWidth onClick={handleCheckout}>Proceed to Checkout</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
