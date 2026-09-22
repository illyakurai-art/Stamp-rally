import { AuthForm } from "@/components/auth-form";
import { LanguageSelector } from "@/components/language-selector";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-start justify-center px-6 py-8 md:py-16">
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm">
        <AuthForm />
      </div>
    </div>
  );
}
