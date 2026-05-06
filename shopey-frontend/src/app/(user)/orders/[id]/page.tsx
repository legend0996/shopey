"use client";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { STATUS_MAP, OrderStatus } from "@/types";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { resolveImageUrl } from "@/lib/images";

const STATUS_ORDER: OrderStatus[] = ["pending", "processing", "picked", "in_transit", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id).then((r) => r.data?.order ?? r.data),
    enabled: !!id,
  });

  const handleDownloadReceipt = async () => {
    try {
      const resp = await orderService.getReceipt(id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      a.click();
    } catch {
      toast.error("Could not download receipt");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-16 text-gray-400">Order not found.</div>;
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status as OrderStatus);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order #{order.id?.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400">
            {new Date(order.created_at).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <Badge status={order.status} />
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Delivery Timeline</h2>
        <div className="relative">
          {STATUS_ORDER.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} className="flex items-start gap-3 mb-4 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#C9A14A]" : "bg-gray-200"}` }>
                    {done ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`w-0.5 h-6 ${done && i < currentIdx ? "bg-[#C9A14A]" : "bg-gray-200"}`} />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className={`text-sm font-medium ${active ? "text-[#C9A14A]" : done ? "text-slate-900" : "text-gray-400"}`}>
                    {STATUS_MAP[s]?.label ?? s}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Items</h2>
        <ul className="space-y-3">
          {order.items?.map((item: { id: string; product: { name: string; image: string }; quantity: number; price: number }) => (
            <li key={item.id} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <Image src={resolveImageUrl(item.product?.image)} alt={item.product?.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{item.product?.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">KES {(item.price * item.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
        {[
          ["Subtotal", `KES ${order.subtotal?.toLocaleString()}`],
          ["Delivery Fee", `KES ${order.delivery_fee?.toLocaleString()}`],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-sm text-gray-500">
            <span>{l}</span><span>{v}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-slate-900">
          <span>Total Paid</span>
          <span>KES {order.final_amount?.toLocaleString()}</span>
        </div>
      </div>

      {order.status === "delivered" && (
        <Button variant="secondary" fullWidth onClick={handleDownloadReceipt}>
          ↓ Download Receipt
        </Button>
      )}
    </div>
  );
}
