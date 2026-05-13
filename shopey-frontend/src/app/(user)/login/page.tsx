"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { consumePendingAction } from "@/lib/pendingAction";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const syncWishlist = useWishlistStore((s) => s.syncFromServer);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      const { token, user } = res.data;
      setAuth(token, user);
      await syncWishlist();

      const pendingAction = consumePendingAction();
      if (pendingAction?.type === "add_to_cart") {
        addItem(pendingAction.product);
        toast.success("Added to cart");
      }

      if (pendingAction?.type === "toggle_wishlist") {
        await toggleWishlist(String(pendingAction.product.id));
        toast.success("Wishlist updated");
      }

      const next = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next") || "/"
        : "/";
      toast.success(`Welcome back, ${user.name}!`);
      router.push(next);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#C9A14A]/10 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-[#C9A14A]">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your Shopey account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
            <div className="flex justify-end mb-2">
              <Link href="/login/forgot-password" className="text-xs text-[#C9A14A] hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" fullWidth loading={loading}>Sign In</Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#C9A14A] font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
