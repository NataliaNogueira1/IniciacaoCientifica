"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, clearAuthUser } from "@/app/hooks/useAuth";
import { Pencil, Plus, X, CheckCircle, XCircle } from "lucide-react";
import TopBar from "@/app/components/TopBar";
import BeeIcon from "@/app/components/BeeIcon";
import InputText from "@/app/components/InputText";
import Button from "@/app/components/Button";
import Toast, { useToast } from "@/app/components/Toast";
import { ConfirmDialog, useConfirm } from "@/app/components/ConfirmDialog";

interface Localizacao {
  id: string;
  cidade: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

interface Colmeia {
  id: string;
  nome: string;
  localizacao: Localizacao;
}

interface ColmeiaForm {
  nome: string;
  cidade: string;
  latitude: string;
  longitude: string;
  altitude: string;
}

const emptyForm: ColmeiaForm = { nome: "", cidade: "", latitude: "", longitude: "", altitude: "" };

export default function ColmeiasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [colmeias, setColmeias] = useState<Colmeia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Colmeia | null>(null);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<ColmeiaForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"ativas" | "inativas" | "todas">("todas");
  const { toasts, removeToast, toast } = useToast();
  const { confirmState, onClose: closeConfirm, confirm } = useConfirm();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.permissao !== "Admin") router.replace("/");
  }, [authLoading, user, router]);

  const fetchColmeias = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/colmeias", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.status === 401) { clearAuthUser(); router.replace("/login"); return; }
      if (!res.ok) throw new Error("Erro ao carregar colmeias.");
      setColmeias(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => { fetchColmeias(); }, [fetchColmeias]);

  function abrirCriar() {
    setForm(emptyForm);
    setFormError(null);
    setCriando(true);
    setEditando(null);
  }

  function abrirEditar(c: Colmeia) {
    setForm({
      nome: c.nome.replace("[INATIVA] ", ""),
      cidade: c.localizacao.cidade,
      latitude: String(c.localizacao.latitude),
      longitude: String(c.localizacao.longitude),
      altitude: String(c.localizacao.altitude),
    });
    setFormError(null);
    setEditando(c);
    setCriando(false);
  }

  function fechar() {
    setCriando(false);
    setEditando(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function validar(): string | null {
    if (!form.nome.trim()) return "Nome é obrigatório.";
    if (!form.cidade.trim()) return "Cidade é obrigatória.";
    if (isNaN(Number(form.latitude))) return "Latitude inválida.";
    if (isNaN(Number(form.longitude))) return "Longitude inválida.";
    if (isNaN(Number(form.altitude))) return "Altitude inválida.";
    return null;
  }

  async function salvar() {
    const err = validar();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError(null);
    try {
      const body = {
        nome: form.nome.trim(),
        cidade: form.cidade.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        altitude: Number(form.altitude),
      };
      const url = editando ? `/api/admin/colmeias/${editando.id}` : "/api/admin/colmeias";
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user!.token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null) as { message?: string } | null;
        throw new Error(d?.message ?? "Erro ao salvar.");
      }
      fechar();
      fetchColmeias();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtiva(c: Colmeia) {
    const inativa = c.nome.startsWith("[INATIVA]");
    const nome = c.nome.replace("[INATIVA] ", "");
    const ok = await confirm({
      message: inativa
        ? `Reativar a colmeia "${nome}"?`
        : `Desativar a colmeia "${nome}"? Ela não aparecerá mais nas opções de registro.`,
      confirmLabel: inativa ? "Reativar" : "Desativar",
      variant: inativa ? "warning" : "danger",
    });
    if (!ok) return;
    const endpoint = inativa ? "reativar" : "desativar";
    const res = await fetch(`/api/admin/colmeias/${c.id}/${endpoint}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${user!.token}` },
    });
    if (res.ok) {
      toast.success(inativa ? "Colmeia reativada." : "Colmeia desativada.");
      fetchColmeias();
    } else {
      toast.error("Erro ao alterar status da colmeia.");
    }
  }

  if (authLoading || !user) return null;

  function handleLogout() { clearAuthUser(); router.replace("/login"); }

  const filtradas = colmeias.filter((c) => {
    const inativa = c.nome.startsWith("[INATIVA]");
    if (filtro === "ativas") return !inativa;
    if (filtro === "inativas") return inativa;
    return true;
  });

  return (
    <main className="min-h-screen px-4 py-8" aria-label="Gestão de colmeias">
      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog state={confirmState} onClose={closeConfirm} />
      <div className="sm:contents">
        <TopBar user={user} active="colmeias" onLogout={handleLogout} />
      </div>
      <div className="max-w-5xl mx-auto mt-4 sm:mt-0 sm:pt-24">
        {/* Título */}
        <div className="w-full bg-yellow-950 rounded-2xl shadow-xl px-6 py-7 flex items-start gap-4 mb-6">
          <div className="-mt-1"><BeeIcon size="1.6rem" /></div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">Gestão de Colmeias</h1>
            <p className="text-sm text-yellow-300">Adicione, edite ou desative colmeias e suas localizações</p>
          </div>
        </div>

        {/* Filtros + badge + botão novo */}
        <div className="flex flex-wrap gap-2 mb-5 items-center">
          {(["todas", "ativas", "inativas"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === f ? "bg-yellow-950 text-yellow-300" : "bg-white text-yellow-950 hover:bg-amber-100 border border-gray-200"
              }`}>
              {f === "ativas" ? "Ativas" : f === "inativas" ? "Inativas" : "Todas"}
            </button>
          ))}
          <span className="inline-flex items-center gap-1.5 bg-yellow-950 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            {filtradas.length} colmeia{filtradas.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={abrirCriar}
            className="sm:ml-auto flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-yellow-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Nova colmeia
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
        {loading && <p className="text-yellow-800 text-sm mb-4">Carregando…</p>}

        {/* Formulário inline de criação/edição */}
        {(criando || editando) && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-yellow-950 px-5 py-4 flex items-center justify-between">
              <h2 className="text-yellow-300 font-bold text-sm">
                {criando ? "Nova Colmeia" : `Editar: ${editando!.nome.replace("[INATIVA] ", "")}`}
              </h2>
              <button onClick={fechar} className="text-yellow-400 hover:text-yellow-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText label="Nome da colmeia" id="nome" required placeholder="ex: SENAI-SOR-1" value={form.nome} onChange={handleChange} />
                <InputText label="Cidade" id="cidade" required placeholder="ex: Florianópolis, SC" value={form.cidade} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputText label="Latitude" id="latitude" required placeholder="-27.5954" value={form.latitude} onChange={handleChange} inputMode="decimal" />
                <InputText label="Longitude" id="longitude" required placeholder="-48.5480" value={form.longitude} onChange={handleChange} inputMode="decimal" />
                <InputText label="Altitude (m)" id="altitude" required placeholder="12" value={form.altitude} onChange={handleChange} inputMode="decimal" />
              </div>
              {formError && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  title={saving ? "Salvando…" : criando ? "Criar colmeia" : "Salvar alterações"}
                  onClick={salvar}
                  disabled={saving}
                  className="flex-1"
                />
                <button
                  onClick={fechar}
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm py-2 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="flex flex-col gap-3">
          {filtradas.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">
              Nenhuma colmeia {filtro === "ativas" ? "ativa" : filtro === "inativas" ? "inativa" : ""}.
            </div>
          )}
          {filtradas.map((c) => {
            const inativa = c.nome.startsWith("[INATIVA]");
            const nome = c.nome.replace("[INATIVA] ", "");
            return (
              <div key={c.id} className={`bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${inativa ? "opacity-60" : ""}`}>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-yellow-950 text-sm">{nome}</span>
                    {inativa && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">Inativa</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {c.localizacao.cidade}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Lat: {c.localizacao.latitude} · Long: {c.localizacao.longitude} · Alt: {c.localizacao.altitude} m
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => abrirEditar(c)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-colors"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => toggleAtiva(c)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      inativa
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-800"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                    }`}
                  >
                    {inativa ? <><CheckCircle size={13} /> Reativar</> : <><XCircle size={13} /> Desativar</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
