"use client";
import { useState } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCodeHint, setDevCodeHint] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const adminHome = pathname?.startsWith("/securedlink") ? "/securedlink" : "/admin";

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Enter email and password");
    setLoading(true);
    try {
      const res = await adminService.login({ email, password });
      const devCode = res?.data?.dev_code;
      if (devCode) {
        setDevCodeHint(String(devCode));
      }
      setStep("verify");
      toast.success("Code sent to your email");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) return toast.error("Enter the verification code");
    setLoading(true);
    try {
      const res = await adminService.verify({ email, code });
      const token = res.data?.token;
      if (token) {
        localStorage.setItem("admin_token", token);
        toast.success("Welcome, Admin!");
        router.push(adminHome);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-slate-900">Admin Portal</span>
          <p className="text-sm text-gray-500 mt-1">Secure access only</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {step === "login" ? (
            <>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@shopey.co.ke" />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              <Button fullWidth loading={loading} onClick={handleLogin}>Sign In</Button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                Enter the code sent to <strong>{email}</strong>
              </div>
              {devCodeHint && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                  Dev code: <strong>{devCodeHint}</strong>
                </div>
              )}
              <Input label="Verification Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} />
              <Button fullWidth loading={loading} onClick={handleVerify}>Verify</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
