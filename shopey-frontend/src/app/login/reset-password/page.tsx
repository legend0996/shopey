"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

const resetSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(1, "Code required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      await authService.resetPassword(data);
      toast.success("Password reset successful. You can now log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the code sent to your email and your new password.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register("email")} />
            <Input label="Reset Code" type="text" placeholder="Enter code" error={errors.code?.message} {...register("code")} />
            <Input label="New Password" type="password" placeholder="••••••••" error={errors.newPassword?.message} {...register("newPassword")} />
            <Button type="submit" fullWidth loading={loading}>Reset Password</Button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/login" className="text-[#C9A14A] font-medium hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
}
