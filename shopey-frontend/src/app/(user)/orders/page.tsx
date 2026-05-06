"use client";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { Badge } from "@/components/ui/Badge";
import { OrderCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Order } from "@/types";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

export default function OrdersPage() {
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getMyOrders().then((r) => r.data?.orders ?? r.data ?? []),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          title="Sign in to view orders"
          description="You need to be logged in to see your orders."
          action={<Link href="/login"><Button>Sign In</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Shop and place your first order."
          action={<Link href="/"><Button>Start Shopping</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-[#C9A14A]/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Badge status={order.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{order.items?.length ?? 0} item(s)</span>
                  <span className="font-bold text-slate-900">KES {order.final_amount?.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
