"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, clearAuthUser } from "@/app/hooks/useAuth";
import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import TopBar from "@/app/components/TopBar";
import BeeIcon from "@/app/components/BeeIcon";
import Toast, { useToast } from "@/app/components/Toast";

interface RegistroSnapshot {
  dataHora: string;
  colmeia: string;
  temperaturaInterna: number | null;
  temperaturaExterna: number | null;
  umidadeInterna: number | null;
  umidadeExterna: number | null;
  pressaoAtmosferica: number | null;
  velocidadeVento: number | null;
  peso: number | null;
  presencaRainha: boolean | null;
  presencaPredador: boolean | null;
  tipoPredador: string | null;
  comida: string | null;
  condicaoClimatica: string | null;
  saudavel: boolean | null;
  observacoes: string | null;
}

interface Solicitacao {
  id: string;
  idRegistro: string;
  registro: RegistroSnapshot;
  usuario: { nome: string; sobrenome: string; email: string };
  tipo: "Editar" | "Excluir";
  status: "Pendente" | "Aprovada" | "Rejeitada";
  dadosNovos: string | null;
  motivoRejeicao: string | null;
  criacao: string;
  resolucao: string | null;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string | null) {
  if (!s) return "—";
  const str = s.endsWith("Z") || s.includes("+") ? s : s + "Z";
  return new Date(str).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const COMIDA_LABEL: Record<string, string> = {
  ABUNDANTE: "Abundante", ADEQUADO: "Adequado", BAIXO: "Baixo", CRITICO: "Crítico",
};
const CLIMA_LABEL: Record<string, string> = {
  ENSOLARADO: "Ensolarado", NUBLADO: "Nublado", CHUVOSO: "Chuvoso", TEMPESTADE: "Tempestade",
};

function fmtVal(key: string, val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (key === "dataHora") return fmtDate(val as string);
  if (key === "presencaRainha" || key === "presencaPredador" || key === "saudavel")
    return (val as boolean) ? "Sim" : "Não";
  if (key === "comida") return COMIDA_LABEL[val as string] ?? String(val);
  if (key === "condicaoClimatica") return CLIMA_LABEL[val as string] ?? String(val);
  if (typeof val === "number") return String(parseFloat(String(val)));
  if (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== "")
    return String(parseFloat(val));
  return String(val);
}

// Converte chaves PascalCase → camelCase (dadosNovos é salvo pelo backend em PascalCase)
function toCamelKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1), v])
  );
}

const FIELD_LABELS: Record<string, string> = {
  colmeia: "Colmeia", dataHora: "Data/Hora",
  temperaturaInterna: "Temp. Interna (°C)", temperaturaExterna: "Temp. Externa (°C)",
  umidadeInterna: "Umidade Interna (%)", umidadeExterna: "Umidade Externa (%)",
  pressaoAtmosferica: "Pressão (hPa)", velocidadeVento: "Vento (km/h)", peso: "Peso (kg)",
  presencaRainha: "Rainha", presencaPredador: "Predador", tipoPredador: "Tipo Predador",
  comida: "Comida", condicaoClimatica: "Clima", saudavel: "Saudável", observacoes: "Observações",
};

const FIELD_ORDER = Object.keys(FIELD_LABELS);

// ── Componente de diff ────────────────────────────────────────────────────────

function DiffView({ antes, depois }: { antes: RegistroSnapshot; depois: Record<string, unknown> }) {
  const antesObj = antes as unknown as Record<string, unknown>;
  const depoisNorm = toCamelKeys(depois);
  const rows = FIELD_ORDER.filter((k) => k in depoisNorm || antesObj[k] != null);

  return (
    <div className="border-t border-amber-200 bg-white overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-semibold text-gray-500 w-36">Campo</th>
            <th className="px-3 py-2 text-left font-semibold text-red-700 bg-red-50 w-1/2">− Antes</th>
            <th className="px-3 py-2 text-left font-semibold text-green-700 bg-green-50 w-1/2">+ Depois</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((key) => {
            const aRaw = antesObj[key];
            const aVal = fmtVal(key, aRaw);
            const dRaw = key in depoisNorm ? depoisNorm[key] : aRaw;
            const dVal = fmtVal(key, dRaw);
            const changed = aVal !== dVal;
            return (
              <tr key={key} className={`border-b border-gray-100 ${changed ? "" : "opacity-40"}`}>
                <td className="px-3 py-1.5 font-medium text-gray-600 whitespace-nowrap">
                  {FIELD_LABELS[key] ?? key}
                </td>
                <td className={`px-3 py-1.5 whitespace-pre-wrap ${changed ? "bg-red-50 text-red-800 line-through" : "text-gray-400"}`}>
                  {aVal}
                </td>
                <td className={`px-3 py-1.5 whitespace-pre-wrap ${changed ? "bg-green-50 text-green-800 font-semibold" : "text-gray-400"}`}>
                  {dVal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function SolicitacoesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"Pendente" | "Aprovada" | "Rejeitada">("Pendente");
  const [motivoRejeicao, setMotivoRejeicao] = useState<Record<string, string>>({});
  const [expandido, setExpandido] = useState<string | null>(null);
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.permissao !== "Admin") router.replace("/");
  }, [authLoading, user, router]);

  const fetchSolicitacoes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/solicitacoes?status=${filtroStatus}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.status === 401) { clearAuthUser(); router.replace("/login"); return; }
      if (!res.ok) throw new Error("Erro ao carregar solicitações.");
      setSolicitacoes(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [user, filtroStatus, router]);

  useEffect(() => { fetchSolicitacoes(); }, [fetchSolicitacoes]);

  async function aprovar(id: string) {
    setActionLoading(id + "_aprovar");
    try {
      const res = await fetch(`/api/admin/solicitacoes/${id}/aprovar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user!.token}` },
      });
      if (res.ok) fetchSolicitacoes();
      else {
        const d = await res.json().catch(() => null) as { message?: string } | null;
        toast.error(d?.message ?? "Erro ao aprovar solicitação.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function rejeitar(id: string) {
    const motivo = motivoRejeicao[id] ?? "";
    setActionLoading(id + "_rejeitar");
    try {
      const res = await fetch(`/api/admin/solicitacoes/${id}/rejeitar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user!.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      if (res.ok) fetchSolicitacoes();
      else toast.error("Erro ao rejeitar solicitação.");
    } finally {
      setActionLoading(null);
    }
  }

  function parseDados(json: string | null): Record<string, unknown> | null {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
  }

  if (authLoading || !user) return null;

  function handleLogout() {
    clearAuthUser();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen px-4 py-8" aria-label="Solicitações de alteração de registros">
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="sm:contents">
        <TopBar user={user} active="solicitacoes" onLogout={handleLogout} />
      </div>
      <div className="max-w-5xl mx-auto mt-4 sm:mt-0 sm:pt-24">
        {/* Título */}
        <div className="w-full bg-yellow-950 rounded-2xl shadow-xl px-6 py-7 flex items-start gap-4 mb-6">
          <div className="-mt-1"><BeeIcon size="1.6rem" /></div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">Solicitações de Alteração</h1>
            <p className="text-sm text-yellow-300">Aprove ou rejeite pedidos de edição e exclusão</p>
          </div>
        </div>

        {/* Filtro status */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["Pendente", "Aprovada", "Rejeitada"] as const).map((s) => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === s
                  ? "bg-yellow-950 text-yellow-300"
                  : "bg-white text-yellow-950 hover:bg-amber-100 border border-gray-200"
              }`}>
              {s === "Pendente" ? "Pendentes" : s === "Aprovada" ? "Aprovadas" : "Rejeitadas"}
            </button>
          ))}
          <span className="ml-auto">
            <span className="inline-flex items-center gap-1.5 bg-yellow-950 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              {solicitacoes.length} solicitaç{solicitacoes.length !== 1 ? "ões" : "ão"}
            </span>
          </span>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
        {loading && <p className="text-yellow-800 text-sm mb-4">Carregando…</p>}

        <div className="flex flex-col gap-3">
          {solicitacoes.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">
              Nenhuma solicitação {filtroStatus === "Pendente" ? "pendente" : filtroStatus === "Aprovada" ? "aprovada" : "rejeitada"}.
            </div>
          )}

          {solicitacoes.map((sol) => {
            const dados = parseDados(sol.dadosNovos);
            const isExpanded = expandido === sol.id;
            return (
              <div key={sol.id} className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="p-4 flex items-start gap-4 flex-wrap">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    sol.tipo === "Editar" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {sol.tipo === "Editar" ? <Pencil size={16} /> : <Trash2 size={16} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        sol.tipo === "Editar" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"
                      }`}>
                        {sol.tipo === "Editar" ? "Edição" : "Exclusão"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        sol.status === "Pendente" ? "bg-yellow-100 text-yellow-800"
                        : sol.status === "Aprovada" ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {sol.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-yellow-950">
                      {sol.usuario.nome} {sol.usuario.sobrenome}
                      <span className="text-gray-400 font-normal text-xs ml-2">{sol.usuario.email}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Registro: <span className="font-mono">{sol.idRegistro.slice(0, 8)}…</span>
                      {" · "} Colmeia: <strong>{sol.registro.colmeia}</strong>
                      {" · "} Data obs.: {fmtDate(sol.registro.dataHora)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Solicitado em: {fmtDate(sol.criacao)}
                      {sol.resolucao ? ` · Resolvido em: ${fmtDate(sol.resolucao)}` : ""}
                    </p>
                    {sol.motivoRejeicao && (
                      <p className="text-xs text-red-600 mt-1">Motivo da rejeição: {sol.motivoRejeicao}</p>
                    )}
                    {sol.tipo === "Editar" && dados && (
                      <button
                        onClick={() => setExpandido(isExpanded ? null : sol.id)}
                        className="text-xs text-amber-700 hover:text-amber-900 mt-1.5 underline"
                      >
                        {isExpanded ? "Ocultar alterações" : "Ver alterações"}
                      </button>
                    )}
                  </div>

                  {sol.status === "Pendente" && (
                    <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
                      <button
                        onClick={() => aprovar(sol.id)}
                        disabled={actionLoading === sol.id + "_aprovar"}
                        className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        {actionLoading === sol.id + "_aprovar" ? "Aprovando…" : "Aprovar"}
                      </button>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Motivo (opcional)"
                          value={motivoRejeicao[sol.id] ?? ""}
                          onChange={(e) => setMotivoRejeicao((p) => ({ ...p, [sol.id]: e.target.value }))}
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300 min-w-0"
                        />
                        <button
                          onClick={() => rejeitar(sol.id)}
                          disabled={actionLoading === sol.id + "_rejeitar"}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors disabled:opacity-50 shrink-0"
                        >
                          <XCircle size={13} />
                          {actionLoading === sol.id + "_rejeitar" ? "…" : "Rejeitar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && dados && (
                  <DiffView antes={sol.registro} depois={dados} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
