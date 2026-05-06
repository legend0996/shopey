"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/images";

const ORDER_STATUSES = ["pending", "processing", "picked", "in_transit", "delivered"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [riderId, setRiderId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => adminService.getOrderFull(id).then((r) => r.data?.order ?? r.data),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminService.updateOrderStatus({ order_id: id, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const assignMutation = useMutation({
    mutationFn: () => adminService.assignRider({ order_id: id, rider_id: riderId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      toast.success("Rider assigned");
    },
    onError: () => toast.error("Failed to assign rider"),
  });

  const deliveryMutation = useMutation({
    mutationFn: (status: string) => adminService.updateDeliveryStatus({ order_id: id, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      toast.success("Delivery status updated");
    },
    onError: () => toast.error("Failed to update delivery status"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) return <div className="text-center py-16 text-gray-400">Order not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900">Order #{order.id?.slice(-8).toUpperCase()}</h1>
        <Badge status={order.status} />
      </div>

      {/* Customer / Shop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Customer", value: order.customer?.name },
          { label: "Phone", value: order.customer?.phone },
          { label: "Shop", value: order.shop?.name },
          { label: "Delivery", value: `${order.town}, ${order.county}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{value ?? "—"}</p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-700 mb-3">Items</h2>
        <ul className="space-y-3">
          {order.items?.map((item: { id: string; product: { name: string; image: string }; quantity: number; price: number }) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <Image src={resolveImageUrl(item.product?.image)} alt={item.product?.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{item.product?.name}</p>
                <p className="text-xs text-gray-400">× {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">KES {(item.price * item.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">Update Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setNewStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                newStatus === s ? "border-[#C9A14A] bg-[#C9A14A]/10 text-[#C9A14A]" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={!newStatus}
          loading={statusMutation.isPending}
          onClick={() => statusMutation.mutate(newStatus)}
        >
          Apply Status
        </Button>
      </div>

      {/* Assign Rider */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">Assign Rider</h2>
        <div className="flex gap-3">
          <Input placeholder="Rider ID" value={riderId} onChange={(e) => setRiderId(e.target.value)} />
          <Button
            size="sm"
            disabled={!riderId}
            loading={assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            Assign
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">Update Delivery Status</h2>
        <div className="flex flex-wrap gap-2">
          {["picked", "in_transit", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setDeliveryStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                deliveryStatus === status ? "border-[#C9A14A] bg-[#C9A14A]/10 text-[#C9A14A]" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={!deliveryStatus}
          loading={deliveryMutation.isPending}
          onClick={() => deliveryMutation.mutate(deliveryStatus)}
        >
          Apply Delivery Status
        </Button>
      </div>
    </div>
  );
}
