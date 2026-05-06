"use client";
import { useState } from "react";
import { riderService } from "@/services/riderService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RiderLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone || !password) return toast.error("Enter phone and password");
    setLoading(true);
    try {
      const res = await riderService.login({ phone, password });
      const token = res.data?.token;
      if (token) {
        localStorage.setItem("rider_token", token);
        toast.success("Welcome, Rider!");
        router.push("/rider");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#C9A14A]/10 rounded-2xl mb-4">
            <span className="text-2xl">🛵</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Rider Login</h1>
          <p className="text-sm text-gray-500 mt-1">Access your deliveries</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254712345678" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button fullWidth loading={loading} onClick={handleLogin}>Sign In</Button>
        </div>
      </div>
    </div>
  );
}
