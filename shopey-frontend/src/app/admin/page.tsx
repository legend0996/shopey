"use client";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Skeleton } from "@/components/ui/Skeleton";

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboard().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of Shopey operations</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Total Orders" value={data?.total_orders ?? data?.totalOrders ?? 0} icon="📦" />
          <KpiCard label="Revenue (KES)" value={(data?.revenue ?? 0).toLocaleString()} icon="💰" />
          <KpiCard label="Total Users" value={data?.total_users ?? data?.totalUsers ?? 0} icon="👥" />
        </div>
      )}

      {/* Recent Activity placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick Info</h2>
        <p className="text-sm text-gray-400">Navigate to <strong>Orders</strong> to manage deliveries.</p>
      </div>
    </div>
  );
}
