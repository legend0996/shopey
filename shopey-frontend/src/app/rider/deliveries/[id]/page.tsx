"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { riderService } from "@/services/riderService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

const STATUSES = [
  { key: "picked", label: "Mark as Picked" },
  { key: "in_transit", label: "Mark In Transit" },
  { key: "delivered", label: "Mark as Delivered" },
];

export default function RiderDeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const router = useRouter();

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["rider", "delivery", id],
    queryFn: () => riderService.getDeliveryById(id).then((r) => r.data?.delivery ?? r.data),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (status: string) =>
      riderService.updateStatus({ delivery_id: id, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider", "delivery", id] });
      qc.invalidateQueries({ queryKey: ["rider", "deliveries"] });
      toast.success("Status updated!");
    },
    onError: () => toast.error("Failed to update status"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!delivery) return <div className="text-center py-16 text-gray-400">Delivery not found.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-900">Delivery #{delivery.order_id?.slice(-8).toUpperCase()}</h1>
        <Badge status={delivery.status} />
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div>
          <p className="text-xs text-gray-400">Delivery Location</p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{delivery.location}</p>
        </div>
        {delivery.rider && (
          <div>
            <p className="text-xs text-gray-400">Assigned Rider</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{delivery.rider.name}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-slate-700">Update Delivery Status</h2>
        {STATUSES.map(({ key, label }) => (
          <Button
            key={key}
            fullWidth
            variant={delivery.status === key ? "secondary" : "primary"}
            loading={update.isPending && update.variables === key}
            disabled={delivery.status === key}
            onClick={() => update.mutate(key)}
          >
            {delivery.status === key ? `✓ ${label.replace("Mark", "Marked")}` : label}
          </Button>
        ))}
      </div>
    </div>
  );
}
