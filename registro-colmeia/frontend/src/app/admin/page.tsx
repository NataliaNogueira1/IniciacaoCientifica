"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, clearAuthUser } from "@/app/hooks/useAuth";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import TopBar from "@/app/components/TopBar";
import BeeIcon from "@/app/components/BeeIcon";
import IconAvatar from "@/app/components/IconAvatar";
import Toast, { useToast } from "@/app/components/Toast";
import { ConfirmDialog, useConfirm } from "@/app/components/ConfirmDialog";

interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  instituicao: string;
  permissao: string;
  ativo: boolean;
  aprovado: boolean;
  reprovado: boolean;
  criacao: string;
  ultimoLogin: string | null;
  emoji: string | null;
}

const PERMISSAO_LABEL: Record<string, string> = {
  Admin: "Administrador",
  Pesquisador: "Pesquisador(a)",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  // Garante interpretação UTC mesmo se o 'Z' vier ausente
  const str = s.endsWith("Z") || s.includes("+") ? s : s + "Z";
  return new Date(str).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "aprovados" | "desativados">("todos");
  const [busca, setBusca] = useState("");
  const { toasts, removeToast, toast } = useToast();
  const { confirmState, onClose: closeConfirm, confirm } = useConfirm();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.permissao !== "Admin") router.replace("/");
  }, [authLoading, user, router]);

  const fetchUsuarios = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/usuarios", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.status === 401) { clearAuthUser(); router.replace("/login"); return; }
      if (!res.ok) throw new Error("Erro ao carregar usuários.");
      setUsuarios(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  async function aprovar(id: string) {
    setActionLoading(id + "_aprovar");
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/aprovar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user!.token}` },
      });
      if (res.ok) fetchUsuarios();
      else toast.error("Erro ao aprovar usuário.");
    } finally {
      setActionLoading(null);
    }
  }

  async function desativar(id: string) {
    const ok = await confirm({ message: "Tem certeza que deseja desativar este usuário?", confirmLabel: "Desativar" });
    if (!ok) return;
    setActionLoading(id + "_desativar");
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/desativar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user!.token}` },
      });
      if (res.ok) fetchUsuarios();
      else {
        const d = await res.json().catch(() => null) as { message?: string } | null;
        toast.error(d?.message ?? "Erro ao desativar usuário.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function reprovar(id: string) {
    const ok = await confirm({ message: "Reprovar este usuário? Ele ficará desativado e poderá tentar se cadastrar novamente.", confirmLabel: "Reprovar" });
    if (!ok) return;
    setActionLoading(id + "_reprovar");
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/reprovar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user!.token}` },
      });
      if (res.ok) fetchUsuarios();
      else {
        const d = await res.json().catch(() => null) as { message?: string } | null;
        toast.error(d?.message ?? "Erro ao reprovar usuário.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function alterarPermissao(id: string, permissao: string, nomeUsuario?: string) {
    const label = permissao === "Admin" ? "Administrador" : "Pesquisador(a)";
    const nome = nomeUsuario ?? "este usuário";
    const ok = await confirm({ message: `Alterar a permissão de ${nome} para ${label}?`, confirmLabel: "Alterar", variant: "warning" });
    if (!ok) return;
    setActionLoading(id + "_perm");
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/permissao`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user!.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ permissao }),
      });
      if (res.ok) {
        fetchUsuarios();
      } else {
        const d = await res.json().catch(() => null) as { message?: string } | null;
        toast.error(d?.message ?? "Erro ao alterar permissão.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (authLoading || !user) return null;

  function handleLogout() {
    clearAuthUser();
    router.replace("/login");
  }

  const filtrados = usuarios.filter((u) => {
    const passaFiltro =
      filtro === "pendentes" ? !u.aprovado && u.ativo && !u.reprovado :
      filtro === "aprovados" ? u.aprovado && u.ativo :
      filtro === "desativados" ? !u.ativo :
      true;
    const termoBusca = busca.trim().toLowerCase();
    const passaBusca = !termoBusca || `${u.nome} ${u.sobrenome}`.toLowerCase().includes(termoBusca);
    return passaFiltro && passaBusca;
  });

  const pendentesCount = usuarios.filter((u) => !u.aprovado && u.ativo).length;

  return (
    <main className="min-h-screen px-4 py-8" aria-label="Gestão de usuários">
      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog state={confirmState} onClose={closeConfirm} />
      {/* TopBar */}
      <div className="sm:contents">
        <TopBar user={user} active="admin" onLogout={handleLogout} />
      </div>
      <div className="max-w-5xl mx-auto mt-4 sm:mt-0 sm:pt-24">
        {/* Título */}
        <div className="w-full bg-yellow-950 rounded-2xl shadow-xl px-6 py-7 flex items-start gap-4 mb-6">
          <div className="-mt-1">
            <BeeIcon size="1.6rem" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">Gestão de Usuários</h1>
            <p className="text-sm text-yellow-300">Aprove, desative e gerencie permissões</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["todos", "aprovados", "pendentes", "desativados"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                filtro === f
                  ? "bg-yellow-950 text-yellow-300"
                  : "bg-white text-yellow-950 hover:bg-amber-100 border border-gray-200"
              }`}
            >
              {f === "pendentes" ? "Pendentes" : f === "aprovados" ? "Aprovados" : f === "desativados" ? "Desativados" : "Todos"}
              {f === "pendentes" && pendentesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full inline-flex items-center justify-center leading-none">
                  {pendentesCount}
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto">
            <span className="inline-flex items-center gap-1.5 bg-yellow-950 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              {filtrados.length} usuário{filtrados.length !== 1 ? "s" : ""}
            </span>
          </span>
        </div>

        {/* Busca por nome */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Buscar por nome…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-yellow-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
            aria-label="Buscar usuário por nome"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpar busca"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
        {loading && <p className="text-yellow-800 text-sm mb-4">Carregando…</p>}

        {/* Lista */}
        <div className="flex flex-col gap-3">
          {filtrados.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">
              Nenhum usuário nesta categoria.
            </div>
          )}
          {filtrados.map((u) => (
            <div
              key={u.id}
              className={`bg-white rounded-2xl shadow p-4 flex flex-col gap-3 ${!u.ativo ? "opacity-60" : ""}`}
            >
              {/* Linha superior: avatar + nome + badges */}
              <div className="flex items-start gap-3">
                {u.aprovado && (
                  <IconAvatar icon={u.emoji} size="sm" className="shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-yellow-950 text-sm">
                      {u.nome} {u.sobrenome}
                    </span>
                    {u.aprovado && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        u.permissao === "Admin"
                          ? "bg-amber-400 text-amber-950"
                          : "bg-yellow-100 text-yellow-900"
                      }`}>
                        {PERMISSAO_LABEL[u.permissao] ?? u.permissao}
                      </span>
                    )}
                    {!u.ativo && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle size={10} /> {u.reprovado ? "Reprovado" : "Desativado"}
                      </span>
                    )}
                    {u.ativo && !u.aprovado && !u.reprovado && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Clock size={10} /> Pendente
                      </span>
                    )}
                    {u.aprovado && u.ativo && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle size={10} /> Aprovado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    CPF: {u.cpf} {u.instituicao ? `· ${u.instituicao}` : ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    Cadastro: {fmtDate(u.criacao)}
                    {u.ultimoLogin ? ` · Último login: ${fmtDate(u.ultimoLogin)}` : ""}
                  </p>
                </div>
              </div>

              {/* Linha de ações */}
              <div className="flex items-center gap-2 flex-wrap">
                {u.aprovado && (
                  <select
                    value={u.permissao}
                    disabled={!u.ativo || actionLoading === u.id + "_perm"}
                    onChange={(e) => alterarPermissao(u.id, e.target.value, `${u.nome} ${u.sobrenome}`)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-yellow-950 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 cursor-pointer"
                    aria-label="Alterar permissão"
                  >
                    <option value="Pesquisador">Pesquisador(a)</option>
                    <option value="Admin">Administrador</option>
                  </select>
                )}

                {!u.aprovado && u.ativo && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <select
                      defaultValue="Pesquisador"
                      id={`perm-aprovar-${u.id}`}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-yellow-950 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      aria-label="Cargo ao aprovar"
                    >
                      <option value="Pesquisador">Pesquisador(a)</option>
                      <option value="Admin">Administrador</option>
                    </select>
                    <button
                      onClick={() => {
                        const sel = document.getElementById(`perm-aprovar-${u.id}`) as HTMLSelectElement;
                        alterarPermissao(u.id, sel.value, `${u.nome} ${u.sobrenome}`).then(() => aprovar(u.id));
                      }}
                      disabled={actionLoading === u.id + "_aprovar" || actionLoading === u.id + "_perm"}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {actionLoading === u.id + "_aprovar" || actionLoading === u.id + "_perm" ? "Aprovando…" : "Aprovar"}
                    </button>
                    <button
                      onClick={() => reprovar(u.id)}
                      disabled={actionLoading === u.id + "_reprovar"}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {actionLoading === u.id + "_reprovar" ? "…" : "Reprovar"}
                    </button>
                  </div>
                )}

                {u.aprovado && (
                  u.ativo ? (
                    <button
                      onClick={() => desativar(u.id)}
                      disabled={actionLoading === u.id + "_desativar"}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      {actionLoading === u.id + "_desativar" ? "…" : "Desativar"}
                    </button>
                  ) : (
                    <button
                      onClick={() => aprovar(u.id)}
                      disabled={actionLoading === u.id + "_aprovar"}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={13} />
                      {actionLoading === u.id + "_aprovar" ? "…" : "Reativar"}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
