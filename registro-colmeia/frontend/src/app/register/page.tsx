"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/app/components/InputText";
import Button from "@/app/components/Button";
import BeeIcon from "@/app/components/BeeIcon";

interface RegisterForm {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  dataNascimento: string;
  instituicao: string;
}

const initialForm: RegisterForm = {
  nome: "",
  sobrenome: "",
  cpf: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  dataNascimento: "",
  instituicao: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          sobrenome: form.sobrenome,
          cpf: form.cpf,
          email: form.email,
          senha: form.senha,
          dataNascimento: form.dataNascimento,
          instituicao: form.instituicao || null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Erro ao criar conta.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-yellow-950 px-6 py-7 flex items-start gap-4">
            <div className="-mt-1">
              <BeeIcon size="1.6rem" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-yellow-300 leading-tight">
                Conta criada!
              </h1>
            </div>
          </div>
          <div
            className="flex flex-col items-center gap-4 px-6 py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <span className="text-5xl" role="img" aria-label="Sucesso">🍯</span>
            <h2 className="text-lg font-bold text-yellow-950">Cadastro realizado com sucesso!</h2>
            <p className="text-sm text-yellow-950">Agora você pode entrar com sua conta.</p>
            <Button title="Ir para o login" onClick={() => router.push("/login")} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      aria-label="Página de cadastro"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-yellow-950 px-6 py-7 flex items-start gap-4">
          <div className="-mt-1">
            <BeeIcon size="1.6rem" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">
              Criar conta
            </h1>
            <p className="text-sm text-yellow-300">
              Preencha os dados para se cadastrar
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="px-6 py-8 flex flex-col gap-5"
          aria-label="Formulário de cadastro"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="Nome"
              id="nome"
              required
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              autoComplete="given-name"
            />
            <InputText
              label="Sobrenome"
              id="sobrenome"
              required
              placeholder="Seu sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="CPF"
              id="cpf"
              required
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleChange}
              autoComplete="off"
            />
            <InputText
              label="Data de nascimento"
              id="dataNascimento"
              type="date"
              required
              value={form.dataNascimento}
              onChange={handleChange}
            />
          </div>

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
            label="Instituição"
            id="instituicao"
            placeholder="Universidade, empresa… (opcional)"
            value={form.instituicao}
            onChange={handleChange}
            autoComplete="organization"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="Senha"
              id="senha"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <InputText
              label="Confirmar senha"
              id="confirmarSenha"
              type="password"
              required
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

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
            title={loading ? "Criando conta…" : "Criar conta"}
            disabled={loading}
            className="w-full"
          />

          <p className="text-center text-sm text-yellow-950">
            Já tem conta?{" "}
            <a
              href="/login"
              className="font-semibold text-amber-700 underline hover:text-amber-900"
            >
              Entrar
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
