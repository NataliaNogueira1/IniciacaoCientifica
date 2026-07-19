"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { getAuthUser, type AuthUser } from "@/app/hooks/useAuth";

const Charts = dynamic(() => import("@/app/dados/Charts"), { ssr: false });
const DadosHeader = dynamic(() => import("@/app/dados/DadosHeader"), { ssr: false });
const EditModal = dynamic(() => import("@/app/dados/EditModal"), { ssr: false });

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface Registro {
  id: string;
  idUsuario: string;
  dataHora: string;
  criacao: string;
  colmeia: {
    nome: string;
    localizacao: {
      cidade: string;
      latitude: number;
      longitude: number;
      altitude: number;
    } | null;
  };
  saude: {
    presencaRainha: boolean;
    presencaPredador: boolean;
    tipoPredador: string | null;
    comida: string;
    condicaoClimatica: string;
    saudavel: boolean;
    observacoes: string | null;
  } | null;
  leitura: {
    temperaturaInterna: number | null;
    temperaturaExterna: number | null;
    umidadeInterna: number | null;
    umidadeExterna: number | null;
    pressaoAtmosferica: number | null;
    velocidadeVento: number | null;
    peso: number | null;
  } | null;
}

interface ApiResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: Registro[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const COMIDA_LABEL: Record<string, string> = {
  ABUNDANTE: "Abundante", ADEQUADO: "Adequado",
  BAIXO: "Baixo", CRITICO: "Crítico",
};
const CLIMA_LABEL: Record<string, string> = {
  ENSOLARADO: "Ensolarado", NUBLADO: "Nublado",
  CHUVOSO: "Chuvoso", TEMPESTADE: "Tempestade",
};

function fmt(v: number | null | undefined) {
  return v != null ? v.toFixed(2) : "—";
}
function fmtDate(s: string) {
  return new Date(s).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function exportCSV(registros: Registro[]) {
  const header = [
    "Data/Hora", "Colmeia", "Cidade", "Latitude", "Longitude", "Altitude", "ID Usuário",
    "Temp. Interna (°C)", "Temp. Externa (°C)",
    "Umidade Interna (%)", "Umidade Externa (%)",
    "Pressão (hPa)", "Vento (km/h)", "Peso (kg)",
    "Rainha", "Predador", "Tipo Predador",
    "Comida", "Clima", "Saudável", "Observações",
  ].join(";");

  const rows = registros.map((r) =>
    [
      fmtDate(r.dataHora), r.colmeia.nome,
      r.colmeia.localizacao?.cidade ?? "",
      r.colmeia.localizacao?.latitude ?? "",
      r.colmeia.localizacao?.longitude ?? "",
      r.colmeia.localizacao?.altitude ?? "",
      r.idUsuario,
      r.leitura?.temperaturaInterna ?? "",
      r.leitura?.temperaturaExterna ?? "",
      r.leitura?.umidadeInterna ?? "",
      r.leitura?.umidadeExterna ?? "",
      r.leitura?.pressaoAtmosferica ?? "",
      r.leitura?.velocidadeVento ?? "",
      r.leitura?.peso ?? "",
      r.saude ? (r.saude.presencaRainha ? "Sim" : "Não") : "",
      r.saude ? (r.saude.presencaPredador ? "Sim" : "Não") : "",
      r.saude?.tipoPredador ?? "",
      r.saude ? (COMIDA_LABEL[r.saude.comida] ?? r.saude.comida) : "",
      r.saude ? (CLIMA_LABEL[r.saude.condicaoClimatica] ?? r.saude.condicaoClimatica) : "",
      r.saude ? (r.saude.saudavel ? "Sim" : "Não") : "",
      r.saude?.observacoes ?? "",
    ].join(";")
  );

  const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registros_colmeia_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function DadosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [colmeias, setColmeias] = useState<{ nome: string; cidade: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroColmeia, setFiltroColmeia] = useState("");
  const [filtroDe, setFiltroDe] = useState("");
  const [filtroAte, setFiltroAte] = useState("");
  const [tab, setTab] = useState<"tabela" | "dashboards" | "correlacao">("tabela");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [minData, setMinData] = useState("");
  const [maxData, setMaxData] = useState("");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [selecionado, setSelecionado] = useState<Registro | null>(null);
  const PAGE_SIZE = 100;

  useEffect(() => { setAuthUser(getAuthUser()); }, []);

  const fetchColmeias = useCallback(async () => {
    const res = await fetch("/api/publico/colmeias");
    if (res.ok) setColmeias(await res.json());
  }, []);

  const fetchPeriodo = useCallback(async () => {
    const res = await fetch("/api/publico/periodo");
    if (res.ok) {
      const { primeiro, ultimo } = await res.json() as { primeiro: string | null; ultimo: string | null };
      if (primeiro) setMinData(primeiro.slice(0, 10));
      if (ultimo) setMaxData(ultimo.slice(0, 10));
    }
  }, []);

  const fetchRegistros = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(p), pageSize: String(PAGE_SIZE),
      });
      if (filtroColmeia) params.set("colmeia", filtroColmeia);
      if (filtroDe) params.set("de", new Date(filtroDe).toISOString());
      if (filtroAte) params.set("ate", new Date(filtroAte).toISOString());

      const res = await fetch(`/api/publico/registros?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar registros.");
      const json: ApiResponse = await res.json();
      setRegistros(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
      setPage(json.page);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [filtroColmeia, filtroDe, filtroAte]);

  // Remove auto-refresh useEffect
  useEffect(() => { fetchColmeias(); }, [fetchColmeias]);
  useEffect(() => { fetchPeriodo(); }, [fetchPeriodo]);
  useEffect(() => { fetchRegistros(1); }, [fetchRegistros]);

  async function handleDelete(id: string) {
    if (!authUser || !confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      const res = await fetch(`/api/registros/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authUser.token}` },
      });
      if (res.ok || res.status === 204) fetchRegistros(page);
      else alert("Não foi possível excluir este registro.");
    } catch {
      alert("Erro ao excluir registro.");
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <DadosHeader />

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-yellow-950">Colmeia</label>
            <select
              value={filtroColmeia}
              onChange={(e) => setFiltroColmeia(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-yellow-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todas</option>
              {colmeias.map((c) => <option key={c.nome} value={c.nome}>{c.nome} {c.cidade ? `— ${c.cidade}` : ""}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-yellow-950">De</label>
            <input type="date" value={filtroDe} onChange={(e) => setFiltroDe(e.target.value)}
              min={minData} max={maxData}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-yellow-950">Até</label>
            <input type="date" value={filtroAte} onChange={(e) => setFiltroAte(e.target.value)}
              min={minData} max={maxData}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => fetchRegistros(1)}
              disabled={loading}
              className="text-gray-400 hover:text-yellow-950 transition-colors disabled:opacity-30"
              title="Atualizar dados"
              aria-label="Atualizar dados"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => exportCSV(registros)}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-yellow-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              ⬇ Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["tabela", "dashboards", "correlacao"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-yellow-950 text-yellow-300" : "bg-white text-yellow-950 hover:bg-amber-100"
              }`}>
              {t === "tabela" ? "Tabela" : t === "dashboards" ? "Dashboards" : "Correlação"}
            </button>
          ))}
          <span className="ml-auto">
            <span className="inline-flex items-center gap-1.5 bg-yellow-950 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              {total.toLocaleString("pt-BR")} registro{total !== 1 ? "s" : ""}
            </span>
          </span>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {loading && <p className="text-yellow-800 text-sm mb-4">Carregando…</p>}

        {/* Tabela */}
        {tab === "tabela" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {/* Toolbar de seleção — só aparece para usuários logados com linha selecionada */}
            {authUser && selecionado && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-200 border-b border-amber-300">
                <span className="text-xs text-amber-900 font-medium flex-1 truncate">
                  Registro selecionado: <span className="font-mono">{selecionado.id.slice(0, 8)}…</span>
                </span>
                <button
                  onClick={() => { setEditando(selecionado); setSelecionado(null); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-yellow-950 font-semibold transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(selecionado.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xs"
                  aria-label="Desmarcar seleção"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-yellow-950 text-yellow-300">
                  <tr>
                    {[
                      ...(authUser ? [""] : []),
                      "ID Registro","ID Usuário","Data/Hora","Colmeia","Cidade",
                      "Latitude","Longitude","Altitude",
                      "Temp. Interna (°C)","Temp. Externa (°C)",
                      "Umidade Interna (%)","Umidade Externa (%)",
                      "Pressão (hPa)","Vento (km/h)","Peso (kg)",
                      "Rainha","Predador","Tipo Predador",
                      "Comida","Clima","Saudável","Observações",
                    ].map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold whitespace-nowrap border-r border-yellow-800 last:border-r-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr key={r.id} className={`cursor-pointer ${selecionado?.id === r.id ? "bg-amber-100" : i % 2 === 0 ? "bg-white" : "bg-amber-50"}`}
                      onClick={() => authUser && setSelecionado(selecionado?.id === r.id ? null : r)}>
                      {authUser && (
                        <td className="px-3 py-2 border-r border-gray-200 text-center">
                          <input
                            type="radio"
                            name="linha-selecionada"
                            checked={selecionado?.id === r.id}
                            onChange={() => setSelecionado(selecionado?.id === r.id ? null : r)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                            aria-label={`Selecionar registro ${r.id.slice(0, 8)}`}
                          />
                        </td>
                      )}
                      <td className="px-3 py-2 font-mono text-gray-400 whitespace-nowrap border-r border-gray-200">{r.id.slice(0, 8)}…</td>
                      <td className="px-3 py-2 font-mono text-gray-400 whitespace-nowrap border-r border-gray-200">{r.idUsuario.slice(0, 8)}…</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-gray-200">{fmtDate(r.dataHora)}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium border-r border-gray-200">{r.colmeia.nome}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-gray-200">{r.colmeia.localizacao?.cidade ?? "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.colmeia.localizacao?.latitude ?? "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.colmeia.localizacao?.longitude ?? "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.colmeia.localizacao?.altitude ?? "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.temperaturaInterna)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.temperaturaExterna)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.umidadeInterna)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.umidadeExterna)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.pressaoAtmosferica)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.velocidadeVento)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{fmt(r.leitura?.peso)}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.saude ? (r.saude.presencaRainha ? "Sim" : "Não") : "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.saude ? (r.saude.presencaPredador ? "Sim" : "Não") : "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.saude?.tipoPredador ?? "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.saude ? (COMIDA_LABEL[r.saude.comida] ?? r.saude.comida) : "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.saude ? (CLIMA_LABEL[r.saude.condicaoClimatica] ?? r.saude.condicaoClimatica) : "—"}</td>
                      <td className="px-3 py-2 border-r border-gray-200">{r.saude ? (r.saude.saudavel ? "Sim" : "Não") : "—"}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{r.saude?.observacoes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginação */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => fetchRegistros(page - 1)}
                className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-amber-50">
                ← Anterior
              </button>
              <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => fetchRegistros(page + 1)}
                className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-amber-50">
                Próxima →
              </button>
            </div>
          </div>
        )}

        {/* Dashboards e Correlação — renderizados no cliente via dynamic import */}
        {(tab === "dashboards" || tab === "correlacao") && !loading && (
          <Charts registros={registros} tab={tab} />
        )}
      </div>

      {editando && authUser && (
        <EditModal
          registro={editando}
          token={authUser.token}
          onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); fetchRegistros(page); }}
        />
      )}
    </main>
  );
}
