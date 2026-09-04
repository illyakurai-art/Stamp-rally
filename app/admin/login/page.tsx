import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#2D1B33]">
      <div className="w-full max-w-sm">
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
