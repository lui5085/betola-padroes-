"use client";
export const dynamic = "force-dynamic";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Token Inválido ou Ausente</h1>
          <p className="text-muted-foreground mt-2">
            O link de redefinição de senha é inválido ou expirou. Por favor, tente novamente.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}