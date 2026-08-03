"use client";

import React, { useState } from "react";
import type { Registro } from "./page";
import { X } from "lucide-react";

interface EditModalProps {
  registro: Registro;
  token: string;
  isAdmin?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const COMIDA_OPTS = [
  { value: "ABUNDANTE", label: "Abundante" },
  { value: "ADEQUADO",  label: "Adequado" },
  { value: "BAIXO",     label: "Baixo" },
  { value: "CRITICO",   label: "Crítico" },
];
const CLIMA_OPTS = [
  { value: "ENSOLARADO", label: "Ensolarado" },
  { value: "NUBLADO",    label: "Nublado" },
  { value: "CHUVOSO",    label: "Chuvoso" },
  { value: "TEMPESTADE", label: "Tempestade" },
];
const PREDADOR_OPTS = [
  { value: "FORMIGAS",   label: "Formigas" },
  { value: "LAGARTIXAS", label: "Lagartixas" },
  { value: "FORIDEO",    label: "Forídeo" },
  { value: "OUTROS",     label: "Outros" },
];

function num(v: number | null | undefined) { return v != null ? String(v) : ""; }
function parseNum(s: string) { const n = Number(s); return s.trim() === "" ? null : Number.isFinite(n) ? n : null; }

export default function EditModal({ registro, token, isAdmin = false, onClose, onSaved }: EditModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);

  const [dataHora, setDataHora] = useState(registro.dataHora.slice(0, 16));
  const [presencaRainha, setPresencaRainha] = useState(registro.saude?.presencaRainha ?? false);
  const [presencaPredador, setPresencaPredador] = useState(registro.saude?.presencaPredador ?? false);
  const [tipoPredador, setTipoPredador] = useState(registro.saude?.tipoPredador ?? "");
  const [comida, setComida] = useState(registro.saude?.comida ?? "ADEQUADO");
  const [condicaoClimatica, setCondicaoClimatica] = useState(registro.saude?.condicaoClimatica ?? "ENSOLARADO");
  const [saudavel, setSaudavel] = useState(registro.saude?.saudavel ?? true);
  const [observacoes, setObservacoes] = useState(registro.saude?.observacoes ?? "");
  const [tempInt, setTempInt] = useState(num(registro.leitura?.temperaturaInterna));
  const [tempExt, setTempExt] = useState(num(registro.leitura?.temperaturaExterna));
  const [umidInt, setUmidInt] = useState(num(registro.leitura?.umidadeInterna));
  const [umidExt, setUmidExt] = useState(num(registro.leitura?.umidadeExterna));
  const [pressao, setPressao] = useState(num(registro.leitura?.pressaoAtmosferica));
  const [vento, setVento] = useState(num(registro.leitura?.velocidadeVento));
  const [peso, setPeso] = useState(num(registro.leitura?.peso));

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/registros/${registro.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          colmeia: registro.colmeia.nome,
          dataHora: new Date(dataHora).toISOString(),
          temperaturaInterna: parseNum(tempInt),
          temperaturaExterna: parseNum(tempExt),
          umidadeInterna: parseNum(umidInt),
          umidadeExterna: parseNum(umidExt),
          pressaoAtmosferica: parseNum(pressao),
          velocidadeVento: parseNum(vento),
          peso: parseNum(peso),
          presencaRainha, presencaPredador,
          tipoPredador: presencaPredador ? tipoPredador || null : null,
          comida, condicaoClimatica, saudavel,
          observacoes: observacoes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null) as { message?: string } | null;
        throw new Error(d?.message ?? "Erro ao salvar.");
      }
      const d = await res.json().catch(() => null) as { message?: string; id?: string } | null;
      // Se veio `message` sem `id`, é uma solicitação pendente (pesquisador)
      if (d?.message && !d.id) {
        setSolicitacaoEnviada(true);
      } else {
        onSaved();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "rounded-lg border border-gray-300 px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400";
  const labelCls = "text-xs font-semibold text-yellow-950 mb-0.5 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-yellow-950 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-yellow-300 font-bold text-base">
            {isAdmin ? "Editar Registro" : "Solicitar Edição de Registro"}
          </h2>
          <button onClick={onClose} className="text-yellow-400 hover:text-yellow-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Estado: solicitação enviada */}
        {solicitacaoEnviada ? (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">📋</span>
            <h3 className="text-base font-bold text-yellow-950">Solicitação enviada!</h3>
            <p className="text-sm text-gray-600">
              Sua solicitação de edição foi enviada para aprovação de um administrador.
            </p>
            <button
              onClick={onClose}
              className="bg-amber-400 hover:bg-amber-500 text-yellow-950 font-semibold text-sm px-6 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {!isAdmin && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ℹ️ Como pesquisador, sua edição será enviada como solicitação para aprovação do administrador.
              </p>
            )}

            <div className="flex flex-col gap-0.5">
              <label className={labelCls}>Data e Hora</label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className={inputCls}
              />
            </div>

            <p className="text-xs font-bold text-yellow-950 uppercase tracking-wide border-b border-gray-200 pb-1">
              Leituras do Sensor
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                ["Temp. Interna (°C)", tempInt, setTempInt],
                ["Temp. Externa (°C)", tempExt, setTempExt],
                ["Umidade Interna (%)", umidInt, setUmidInt],
                ["Umidade Externa (%)", umidExt, setUmidExt],
                ["Pressão (hPa)", pressao, setPressao],
                ["Vento (km/h)", vento, setVento],
                ["Peso (kg)", peso, setPeso],
              ] as [string, string, (v: string) => void][]).map(([lbl, val, setter]) => (
                <div key={lbl}>
                  <label className={labelCls}>{lbl}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    className={inputCls}
                    placeholder="—"
                  />
                </div>
              ))}
            </div>

            <p className="text-xs font-bold text-yellow-950 uppercase tracking-wide border-b border-gray-200 pb-1">
              Saúde
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Comida</label>
                <select value={comida} onChange={(e) => setComida(e.target.value)} className={inputCls}>
                  {COMIDA_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Clima</label>
                <select value={condicaoClimatica} onChange={(e) => setCondicaoClimatica(e.target.value)} className={inputCls}>
                  {CLIMA_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2 justify-center pt-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presencaRainha}
                    onChange={(e) => setPresencaRainha(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                  Rainha presente
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saudavel}
                    onChange={(e) => setSaudavel(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                  Colmeia saudável
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presencaPredador}
                    onChange={(e) => setPresencaPredador(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                  Predador presente
                </label>
              </div>
              {presencaPredador && (
                <div>
                  <label className={labelCls}>Tipo de Predador</label>
                  <select value={tipoPredador} onChange={(e) => setTipoPredador(e.target.value)} className={inputCls}>
                    <option value="">—</option>
                    {PREDADOR_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className={inputCls + " resize-y"}
                placeholder="Observações…"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-yellow-950 font-semibold text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Enviando…" : isAdmin ? "Salvar" : "Enviar Solicitação"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
