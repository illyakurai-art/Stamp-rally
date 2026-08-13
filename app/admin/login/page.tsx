import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-start justify-center px-6 py-8 md:py-16 bg-gradient-to-br from-[#C9A8C7] via-[#B892C4] to-[#9B79B0]">
      <div className="w-full max-w-sm">
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
