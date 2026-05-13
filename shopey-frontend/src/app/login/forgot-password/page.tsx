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

const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      toast.success("Reset code sent to your email.");
      // Redirect to reset-password page with email as query param
      setTimeout(() => {
        router.push(`/login/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 1200); // Give user a moment to see the message
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset code.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {sent ? (
            <div className="text-center text-green-600">Check your email for the reset code.<br/>Redirecting...</div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register("email")} />
              <Button type="submit" fullWidth loading={loading}>Send Reset Code</Button>
            </form>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/login" className="text-[#C9A14A] font-medium hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
}
