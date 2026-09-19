import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-start justify-center px-6 py-8 md:py-16">
      <div className="w-full max-w-sm">
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}