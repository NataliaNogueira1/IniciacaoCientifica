"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputText from "@/app/components/InputText";
import Button from "@/app/components/Button";
import BeeIcon from "@/app/components/BeeIcon";
import { saveAuthUser, type AuthUser } from "@/app/hooks/useAuth";

interface LoginForm {
  email: string;
  senha: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [form, setForm] = useState<LoginForm>({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, senha: form.senha }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Erro ao fazer login.");
      }

      const data = (await res.json()) as AuthUser;
      saveAuthUser(data);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      aria-label="Página de login"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-yellow-950 px-6 py-7 flex items-start gap-4">
          <div className="-mt-1">
            <BeeIcon size="1.6rem" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">
              Registro de Colmeia
            </h1>
            <p className="text-sm text-yellow-300">
              Entre com sua conta para continuar
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="px-6 py-8 flex flex-col gap-5"
          aria-label="Formulário de login"
        >
          <InputText
            label="E-mail"
            id="email"
            type="email"
            required
            placeholder="seu@email.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <InputText
            label="Senha"
            id="senha"
            type="password"
            required
            placeholder="Digite sua senha"
            value={form.senha}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {error && (
            <p
              role="alert"
              className="text-sm text-red-600 rounded-md border border-red-200 bg-red-50 px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            title={loading ? "Entrando…" : "Entrar"}
            disabled={loading}
            className="w-full"
          />

          <p className="text-center text-sm text-yellow-950">
            Não tem conta?{" "}
            <a
              href="/register"
              className="font-semibold text-amber-700 underline hover:text-amber-900"
            >
              Cadastre-se
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
