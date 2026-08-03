"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/app/components/InputText";
import SelectField from "@/app/components/SelectField";
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
  nome: "", sobrenome: "", cpf: "", email: "",
  senha: "", confirmarSenha: "", dataNascimento: "", instituicao: "",
};

// CPF: formata enquanto digita → 000.000.000-00
function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// CPF: extrai somente dígitos para enviar ao backend
function cpfDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

// Data máxima permitida: hoje − 14 anos
function maxDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 14);
  return d.toISOString().slice(0, 10);
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [instituicoes, setInstituicoes] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/publico/colmeias")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { nome: string; cidade: string }[]) => {
        // extrai nomes únicos de colmeias como opções de instituição
        const nomes = [...new Set(data.map((c) => c.nome))].sort();
        setInstituicoes(nomes);
      })
      .catch(() => {});
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (name === "cpf") {
      setForm((p) => ({ ...p, cpf: formatCpf(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  function validate(): string | null {
    if (form.nome.trim().length < 2)
      return "O nome deve ter pelo menos 2 caracteres.";
    if (form.sobrenome.trim().length < 2)
      return "O sobrenome deve ter pelo menos 2 caracteres.";
    if (cpfDigits(form.cpf).length !== 11)
      return "CPF inválido. Digite os 11 dígitos.";
    if (!form.dataNascimento)
      return "Informe a data de nascimento.";
    if (form.dataNascimento > maxDate())
      return "É necessário ter pelo menos 14 anos para se cadastrar.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email))
      return "Digite um e-mail válido.";
    if (!form.instituicao)
      return "Selecione uma instituição.";
    if (form.senha.length < 6)
      return "A senha deve ter pelo menos 6 caracteres.";
    if (form.senha !== form.confirmarSenha)
      return "As senhas não coincidem.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          sobrenome: form.sobrenome.trim(),
          cpf: cpfDigits(form.cpf),
          email: form.email.trim(),
          senha: form.senha,
          dataNascimento: form.dataNascimento,
          instituicao: form.instituicao.trim(),
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
            <div className="-mt-1"><BeeIcon size="1.6rem" /></div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-yellow-300 leading-tight">Conta criada!</h1>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center" role="status" aria-live="polite">
            <span className="text-5xl" role="img" aria-label="Sucesso">🍯</span>
            <h2 className="text-lg font-bold text-yellow-950">Cadastro realizado com sucesso!</h2>
            <p className="text-sm text-yellow-950">
              Sua conta foi criada e está aguardando aprovação de um administrador.
              Em breve você receberá o acesso.
            </p>
            <Button title="Ir para o login" onClick={() => router.push("/login")} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" aria-label="Página de cadastro">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-yellow-950 px-6 py-7 flex items-start gap-4">
          <div className="-mt-1"><BeeIcon size="1.6rem" /></div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">Criar conta</h1>
            <p className="text-sm text-yellow-300">Preencha os dados para se cadastrar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-8 flex flex-col gap-5" aria-label="Formulário de cadastro">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="Nome"
              id="nome"
              required
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              autoComplete="given-name"
              minLength={2}
            />
            <InputText
              label="Sobrenome"
              id="sobrenome"
              required
              placeholder="Seu sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              autoComplete="family-name"
              minLength={2}
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
              inputMode="numeric"
            />
            <InputText
              label="Data de nascimento"
              id="dataNascimento"
              type="date"
              required
              value={form.dataNascimento}
              onChange={handleChange}
              max={maxDate()}
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

          <SelectField
            label="Instituição"
            id="instituicao"
            required
            placeholder="Selecione sua instituição"
            value={form.instituicao}
            onChange={handleChange}
            options={instituicoes.map((nome) => ({ value: nome, label: nome }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="Senha"
              id="senha"
              type="password"
              showToggle
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
              showToggle
              required
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 rounded-md border border-red-200 bg-red-50 px-3 py-2">
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
            <a href="/login" className="font-semibold text-amber-700 underline hover:text-amber-900">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
