"use client";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService, CheckoutPayload } from "@/services/orderService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

interface CheckoutSummary {
  order_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  final_amount: number;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<"details" | "summary" | "mpesa">("details");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [description, setDescription] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add some products before checkout."
          action={<Link href="/"><Button>Browse Products</Button></Link>}
        />
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!county || !town) return toast.error("Enter delivery county and town");
    setLoading(true);
    try {
      const payload: CheckoutPayload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        county,
        town,
        description,
      };
      const res = await orderService.checkout(payload);
      setSummary(res.data);
      setStep("summary");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMpesa = async () => {
    if (!summary) return;
    if (!phone) return toast.error("Enter your M-Pesa phone number");
    setLoading(true);
    try {
      await orderService.mpesaPay({ order_id: summary.order_id, phone });
      setStep("mpesa");
      clearCart();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {["details", "summary", "mpesa"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? "bg-[#C9A14A] text-white" : (["details","summary","mpesa"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 w-8" />}
          </div>
        ))}
        <div className="flex gap-4 ml-2 text-xs font-medium text-gray-500">
          <span className={step === "details" ? "text-[#C9A14A]" : ""}>Details</span>
          <span className={step === "summary" ? "text-[#C9A14A]" : ""}>Summary</span>
          <span className={step === "mpesa" ? "text-[#C9A14A]" : ""}>Payment</span>
        </div>
      </div>

      {step === "details" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-slate-900">Delivery Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="County" placeholder="Nairobi" value={county} onChange={(e) => setCounty(e.target.value)} />
              <Input label="Town" placeholder="Westlands" value={town} onChange={(e) => setTown(e.target.value)} />
            </div>
            <Input label="Delivery Instructions (optional)" placeholder="Near KFC..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Order Items</h2>
            <ul className="divide-y divide-gray-50">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between py-2 text-sm">
                  <span className="text-slate-700">{product.name} × {quantity}</span>
                  <span className="font-medium text-slate-900">KES {(product.price * quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between text-sm font-semibold">
              <span>Subtotal</span>
              <span>KES {subtotal().toLocaleString()}</span>
            </div>
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleCheckout}>Continue to Summary</Button>
        </div>
      )}

      {step === "summary" && summary && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Order Summary</h2>
            {[
              ["Subtotal", `KES ${summary.subtotal.toLocaleString()}`],
              ["Delivery Fee", `KES ${summary.delivery_fee.toLocaleString()}`],
              ["Total", `KES ${summary.total.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
              <span>Amount to Pay</span>
              <span className="text-[#C9A14A]">KES {summary.final_amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-slate-900">M-Pesa Payment</h2>
            <Input label="M-Pesa Phone" type="tel" placeholder="+254712345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleMpesa}>
            Pay KES {summary.final_amount.toLocaleString()} via M-Pesa
          </Button>
        </div>
      )}

      {step === "mpesa" && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">STK Push Sent!</h2>
          <p className="text-gray-500 mb-6">Check your phone and enter your M-Pesa PIN to complete payment.</p>
          <Button onClick={() => router.push("/orders")}>View My Orders</Button>
        </div>
      )}
    </div>
  );
}
