"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export default function AdminShopsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [userId, setUserId] = useState("");
  const [productId, setProductId] = useState("");

  const create = useMutation({
    mutationFn: () => adminService.createShop({ name, phone, location }),
    onSuccess: () => {
      toast.success("Shop created successfully");
      setName(""); setPhone(""); setLocation("");
    },
    onError: () => toast.error("Failed to create shop"),
  });

  const featureUser = useMutation({
    mutationFn: () => adminService.featureUser({ user_id: userId }),
    onSuccess: () => {
      toast.success("User featured successfully");
      setUserId("");
    },
    onError: () => toast.error("Failed to feature user"),
  });

  const featureProduct = useMutation({
    mutationFn: () => adminService.featureProduct({ product_id: productId }),
    onSuccess: () => {
      toast.success("Product featured successfully");
      setProductId("");
    },
    onError: () => toast.error("Failed to feature product"),
  });

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Shops</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Add New Shop</h2>
        <Input label="Shop Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shopey Nairobi" />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254..." />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Westlands, Nairobi" />
        <Button fullWidth loading={create.isPending} onClick={() => create.mutate()}>Create Shop</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Feature User</h2>
        <Input label="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user_123" />
        <Button fullWidth variant="secondary" loading={featureUser.isPending} onClick={() => featureUser.mutate()}>
          Feature User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Feature Product</h2>
        <Input label="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="prod_123" />
        <Button fullWidth variant="secondary" loading={featureProduct.isPending} onClick={() => featureProduct.mutate()}>
          Feature Product
        </Button>
      </div>
    </div>
  );
}
