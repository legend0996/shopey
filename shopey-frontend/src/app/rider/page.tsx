"use client";
import { useQuery } from "@tanstack/react-query";
import { riderService } from "@/services/riderService";
import { Badge } from "@/components/ui/Badge";
import { OrderCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Delivery } from "@/types";
import Link from "next/link";

export default function RiderDeliveriesPage() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["rider", "deliveries"],
    queryFn: () => riderService.getDeliveries().then((r) => r.data?.deliveries ?? r.data ?? []),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Deliveries</h1>
        <p className="text-sm text-gray-400 mt-0.5">Tap a delivery to view details and update status</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : !deliveries || deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries assigned"
          description="Check back soon for new assignments."
        />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d: Delivery) => (
            <Link key={d.id} href={`/rider/deliveries/${d.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-[#C9A14A]/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">Order #{d.order_id?.slice(-8).toUpperCase()}</p>
                  <Badge status={d.status} />
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {d.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
