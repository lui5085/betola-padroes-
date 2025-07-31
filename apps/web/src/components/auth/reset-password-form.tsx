"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "./password-input";
import { PasswordConfirmInput } from "./password-confirm-input";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/\d/, "A senha deve conter pelo menos um número")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "A senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao redefinir a senha.');
      }

      window.location.href = '/login?reset=success';
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      form.setError("root", { message: errorMessage });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card border rounded-lg shadow-lg">
      <div className="space-y-2 mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Redefinir Senha</h1>
        <p className="text-muted-foreground">
          Crie uma nova senha forte para sua conta.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Digite sua nova senha"
                    showRequirements={true}
                    error={fieldState.error?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <PasswordConfirmInput
                    passwordToMatch={password}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Confirme sua nova senha"
                    error={fieldState.error?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive text-center">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>
      </Form>
    </div>
  );
}; 