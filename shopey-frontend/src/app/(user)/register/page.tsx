"use client";
import { useState } from "react";
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

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onRegister = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.register(data);
      setEmail(data.email);
      setStep("verify");
      toast.success("Verification code sent to your email!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!verifyCode.trim()) return toast.error("Enter the verification code");
    setLoading(true);
    try {
      const res = await authService.verify({ email, code: verifyCode });
      const { token, user } = res.data;
      setAuth(token, user);
      toast.success("Account verified! Welcome to Shopey.");
      router.push("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === "register" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === "register"
              ? "Join Shopey for a premium shopping experience"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === "register" ? (
            <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
              <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register("email")} />
              <Input label="Phone" type="tel" placeholder="+254712345678" error={errors.phone?.message} {...register("phone")} />
              <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
              <Input label="Referral Code (optional)" placeholder="REF123" {...register("referralCode")} />
              <Button type="submit" fullWidth loading={loading}>Create Account</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                We sent a 6-digit code to <strong>{email}</strong>. Check your inbox.
              </div>
              <Input
                label="Verification Code"
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
              />
              <Button fullWidth loading={loading} onClick={onVerify}>Verify Account</Button>
              <button
                className="w-full text-sm text-gray-400 hover:text-[#C9A14A] transition-colors"
                onClick={() => setStep("register")}
              >
                ← Back to registration
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C9A14A] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
