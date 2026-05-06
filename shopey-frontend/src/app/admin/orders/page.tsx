"use client";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Badge } from "@/components/ui/Badge";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Order } from "@/types";
import Link from "next/link";

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminService.getOrders().then((r) => r.data?.orders ?? r.data ?? []),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Order ID", "Customer", "Amount", "Status", "Date", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : orders?.map((order: Order & { customer?: { name: string } }) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-slate-700">{order.customer?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">KES {order.final_amount?.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={order.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-KE")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/securedlink/orders/${order.id}`} className="text-[#C9A14A] hover:underline text-xs font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
