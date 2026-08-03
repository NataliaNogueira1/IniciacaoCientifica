"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/app/components/InputText";
import Button from "@/app/components/Button";
import BeeIcon from "@/app/components/BeeIcon";
import IconPickerField, { DEFAULT_ICON } from "@/app/components/IconPickerField";
import { useAuth, saveAuthUser, clearAuthUser } from "@/app/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

const DEFAULT_EMOJI = DEFAULT_ICON;

interface PerfilForm {
  nome: string;
  sobrenome: string;
  email: string;
  dataNascimento: string;
  instituicao: string;
  emoji: string;
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

interface PerfilData {
  id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  instituicao: string;
  permissao: string;
  emoji: string | null;
  criacao: string;
  ultimoLogin: string | null;
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();

  const [form, setForm] = useState<PerfilForm>({
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    instituicao: "",
    emoji: DEFAULT_EMOJI,
    senhaAtual: "",
    novaSenha: "",
    confirmarNovaSenha: "",
  });
  const [cpf, setCpf] = useState("");
  const [permissao, setPermissao] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Carrega dados do perfil
  useEffect(() => {
    if (!user) return;
    fetch("/api/perfil", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          clearAuthUser();
          router.replace("/login");
          return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
        }
        if (!r.ok) {
          const msg = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status}${msg ? ": " + msg : ""}`);
        }
        return r.json();
      })
      .then((data: PerfilData) => {
        setForm({
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          dataNascimento: data.dataNascimento
            ? data.dataNascimento.slice(0, 10)
            : "",
          instituicao: data.instituicao ?? "",
          emoji: data.emoji ?? DEFAULT_EMOJI,
          senhaAtual: "",
          novaSenha: "",
          confirmarNovaSenha: "",
        });
        setCpf(data.cpf);
        setPermissao(data.permissao);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Erro ao carregar dados do perfil. (${msg})`);
      })
      .finally(() => setLoading(false));
  }, [user]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (form.novaSenha && form.novaSenha !== form.confirmarNovaSenha) {
      setError("As novas senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user!.token}`,
        },
        body: JSON.stringify({
          nome: form.nome,
          sobrenome: form.sobrenome,
          email: form.email,
          dataNascimento: form.dataNascimento,
          instituicao: form.instituicao || null,
          emoji: form.emoji,
          senhaAtual: form.senhaAtual || null,
          novaSenha: form.novaSenha || null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Erro ao salvar perfil.");
      }

      const updated = (await res.json()) as PerfilData;

      // Atualiza o token no localStorage com o novo nome/emoji
      const updatedUser = {
        ...user!,
        nome: updated.nome,
        email: updated.email,
        emoji: updated.emoji ?? DEFAULT_EMOJI,
      };
      saveAuthUser(updatedUser);
      setUser(updatedUser);

      setSuccess(true);
      setForm((p) => ({ ...p, senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      aria-label="Página de edição de perfil"
    >
      {/* Botão voltar — fixo no canto superior esquerdo, mesmo nível do menu */}
      <button
        type="button"
        onClick={() => router.back()}
        className="fixed top-8 right-4 sm:right-16 z-50 flex items-center gap-2 bg-yellow-950 text-yellow-300 hover:bg-yellow-900 transition-colors px-4 py-2 rounded-full shadow-md text-sm font-semibold"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Voltar
      </button>

      <div className="max-w-2xl w-full mt-16 sm:mt-0">
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-yellow-950 px-6 py-7 flex items-start gap-4">
            <div className="-mt-1">
              <BeeIcon size="1.6rem" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <h1 className="text-xl font-bold text-yellow-300 leading-tight">
                Meu Perfil
              </h1>
              <p className="text-sm text-yellow-300">
                Edite suas informações pessoais
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="px-6 py-8 flex flex-col gap-5"
            aria-label="Formulário de edição de perfil"
          >
          {/* Emoji picker */}
          <div className="flex justify-center">
            <IconPickerField
              value={form.emoji}
              onChange={(icon) => setForm((p) => ({ ...p, emoji: icon }))}
            />
          </div>

          {/* CPF somente leitura */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-yellow-950">
              CPF
            </label>
            <input
              value={cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
              readOnly
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              aria-label="CPF não editável"
            />
          </div>

          {/* Permissão somente leitura */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-yellow-950">
              Nível de acesso
            </label>
            <input
              value={permissao === "Admin" ? "Administrador" : "Pesquisador(a)"}
              readOnly
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              aria-label="Nível de acesso não editável"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="Nome"
              id="nome"
              required
              value={form.nome}
              onChange={handleChange}
            />
            <InputText
              label="Sobrenome"
              id="sobrenome"
              required
              value={form.sobrenome}
              onChange={handleChange}
            />
          </div>

          <InputText
            label="E-mail"
            id="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <InputText
            label="Data de nascimento"
            id="dataNascimento"
            type="date"
            required
            value={form.dataNascimento}
            onChange={handleChange}
            max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 14); return d.toISOString().slice(0, 10); })()}
          />

          <InputText
            label="Instituição"
            id="instituicao"
            placeholder="Universidade, empresa…"
            value={form.instituicao}
            onChange={handleChange}
          />

          {/* Seção de troca de senha */}
          <hr className="border-gray-200" />
          <p className="text-sm font-semibold text-yellow-950">
            Alterar senha
          </p>

          <InputText
            label="Senha atual"
            id="senhaAtual"
            type="password"
            showToggle
            placeholder="Digite sua senha atual"
            value={form.senhaAtual}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              label="Nova senha"
              id="novaSenha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.novaSenha}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <InputText
              label="Confirmar nova senha"
              id="confirmarNovaSenha"
              type="password"
              placeholder="Repita a nova senha"
              value={form.confirmarNovaSenha}
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

          {success && (
            <p
              role="status"
              className="text-sm text-green-700 rounded-md border border-green-200 bg-green-50 px-3 py-2"
            >
              ✅ Perfil atualizado com sucesso!
            </p>
          )}

          <Button
            type="submit"
            title={saving ? "Salvando…" : "Salvar alterações"}
            loading={saving}
            className="w-full"
          />
          </form>
        </div>
      </div>
    </main>
  );
}
