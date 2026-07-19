"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import type { Registro } from "./page";

// ── Campos disponíveis para correlação ───────────────────────────────────────
const CAMPOS_NUMERICOS = [
  { key: "temperaturaInterna",  label: "Temp. Interna (°C)",        src: "leitura" },
  { key: "temperaturaExterna",  label: "Temp. Externa (°C)",        src: "leitura" },
  { key: "umidadeInterna",      label: "Umidade Interna (%)",       src: "leitura" },
  { key: "umidadeExterna",      label: "Umidade Externa (%)",       src: "leitura" },
  { key: "pressaoAtmosferica",  label: "Pressão Atmosférica (hPa)", src: "leitura" },
  { key: "velocidadeVento",     label: "Velocidade do Vento (km/h)",src: "leitura" },
  { key: "peso",                label: "Peso da Colmeia (kg)",      src: "leitura" },
  { key: "altitude",            label: "Altitude (m)",              src: "localizacao" },
  { key: "latitude",            label: "Latitude",                  src: "localizacao" },
  { key: "longitude",           label: "Longitude",                 src: "localizacao" },
  { key: "presencaRainha",      label: "Presença de Rainha (0/1)",  src: "saude" },
  { key: "presencaPredador",    label: "Presença de Predador (0/1)",src: "saude" },
  { key: "saudavel",            label: "Saudável (0/1)",            src: "saude" },
];

const COLORS = ["#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#f97316","#06b6d4"];

function getVal(r: Registro, campo: string): number | null {
  const campoInfo = CAMPOS_NUMERICOS.find((c) => c.key === campo);
  if (!campoInfo) return null;

  if (campoInfo.src === "leitura") {
    const v = r.leitura?.[campo as keyof typeof r.leitura];
    return typeof v === "number" ? v : null;
  }
  if (campoInfo.src === "localizacao") {
    const v = r.colmeia.localizacao?.[campo as keyof typeof r.colmeia.localizacao];
    return typeof v === "number" ? v : null;
  }
  if (campoInfo.src === "saude") {
    const v = r.saude?.[campo as keyof typeof r.saude];
    if (typeof v === "boolean") return v ? 1 : 0;
    return null;
  }
  return null;
}

function toTimeSeries(registros: Registro[], campo: string) {
  return registros
    .filter((r) => getVal(r, campo) !== null)
    .map((r) => ({
      data: new Date(r.dataHora).toLocaleDateString("pt-BR"),
      value: getVal(r, campo),
      colmeia: r.colmeia.nome,
    }))
    .reverse();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-sm font-bold text-yellow-950 mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ── Dashboards ────────────────────────────────────────────────────────────────

function Dashboards({ registros }: { registros: Registro[] }) {
  const tempSeries    = toTimeSeries(registros, "temperaturaInterna");
  const tempExtSeries = toTimeSeries(registros, "temperaturaExterna");
  const umidSeries    = toTimeSeries(registros, "umidadeInterna");
  const pesoSeries    = toTimeSeries(registros, "peso");
  const pressaoSeries = toTimeSeries(registros, "pressaoAtmosferica");
  const ventoSeries   = toTimeSeries(registros, "velocidadeVento");

  const saudeData = useMemo(() => {
    const s = registros.filter((r) => r.saude).reduce(
      (acc, r) => { r.saude!.saudavel ? acc.saudavel++ : acc.naoSaudavel++; return acc; },
      { saudavel: 0, naoSaudavel: 0 }
    );
    return [
      { name: "Saudável", value: s.saudavel },
      { name: "Não saudável", value: s.naoSaudavel },
    ];
  }, [registros]);

  const rainhaData = useMemo(() => {
    const s = registros.filter((r) => r.saude).reduce(
      (acc, r) => { r.saude!.presencaRainha ? acc.sim++ : acc.nao++; return acc; },
      { sim: 0, nao: 0 }
    );
    return [{ name: "Presente", value: s.sim }, { name: "Ausente", value: s.nao }];
  }, [registros]);

  const predadorData = useMemo(() => {
    const s = registros.filter((r) => r.saude).reduce(
      (acc, r) => { r.saude!.presencaPredador ? acc.sim++ : acc.nao++; return acc; },
      { sim: 0, nao: 0 }
    );
    return [{ name: "Com predador", value: s.sim }, { name: "Sem predador", value: s.nao }];
  }, [registros]);

  const comidaData = useMemo(() => {
    const map: Record<string, number> = {};
    const labels: Record<string, string> = { ABUNDANTE: "Abundante", ADEQUADO: "Adequado", BAIXO: "Baixo", CRITICO: "Crítico" };
    registros.forEach((r) => { if (r.saude) map[r.saude.comida] = (map[r.saude.comida] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] ?? k, qtd: v }));
  }, [registros]);

  const climaData = useMemo(() => {
    const map: Record<string, number> = {};
    const labels: Record<string, string> = { ENSOLARADO: "Ensolarado", NUBLADO: "Nublado", CHUVOSO: "Chuvoso", TEMPESTADE: "Tempestade" };
    registros.forEach((r) => { if (r.saude) map[r.saude.condicaoClimatica] = (map[r.saude.condicaoClimatica] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] ?? k, qtd: v }));
  }, [registros]);

  const tipoPredadorData = useMemo(() => {
    const map: Record<string, number> = {};
    registros.forEach((r) => {
      if (r.saude?.presencaPredador && r.saude.tipoPredador)
        map[r.saude.tipoPredador] = (map[r.saude.tipoPredador] || 0) + 1;
    });
    return Object.entries(map).map(([k, v]) => ({ name: k, qtd: v }));
  }, [registros]);

  if (registros.length === 0) return <p className="text-yellow-800 text-sm">Nenhum dado disponível.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tempSeries.length > 0 && (
        <DashboardCard title="Temperatura Interna ao longo do tempo">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tempSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" dot={false} name="Temp. Interna (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}

      {tempExtSeries.length > 0 && (
        <DashboardCard title="Temperatura Externa ao longo do tempo">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tempExtSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#f97316" dot={false} name="Temp. Externa (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}

      {umidSeries.length > 0 && (
        <DashboardCard title="Umidade Interna ao longo do tempo">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={umidSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#06b6d4" dot={false} name="Umidade Interna (%)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}

      {pressaoSeries.length > 0 && (
        <DashboardCard title="Pressão Atmosférica ao longo do tempo">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pressaoSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" dot={false} name="Pressão (hPa)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}

      {ventoSeries.length > 0 && (
        <DashboardCard title="Velocidade do Vento ao longo do tempo">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ventoSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} name="Vento (km/h)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}

      {pesoSeries.length > 0 && (
        <DashboardCard title="Peso da Colmeia ao longo do tempo">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pesoSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" dot={false} name="Peso (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}

      <DashboardCard title="Saúde das Colmeias">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={saudeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {saudeData.map((_, i) => <Cell key={i} fill={["#10b981","#ef4444"][i]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Presença de Rainha">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={rainhaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {rainhaData.map((_, i) => <Cell key={i} fill={["#f59e0b","#94a3b8"][i]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Presença de Predador">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={predadorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {predadorData.map((_, i) => <Cell key={i} fill={["#ef4444","#10b981"][i]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Nível de Comida">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={comidaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="qtd" fill="#f59e0b" name="Registros" />
          </BarChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Condição Climática">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={climaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="qtd" fill="#3b82f6" name="Registros" />
          </BarChart>
        </ResponsiveContainer>
      </DashboardCard>

      {tipoPredadorData.length > 0 && (
        <DashboardCard title="Tipo de Predador">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tipoPredadorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="qtd" fill="#ef4444" name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      )}
    </div>
  );
}

// ── Correlação ────────────────────────────────────────────────────────────────

function Correlacao({ registros }: { registros: Registro[] }) {
  const [campoX, setCampoX] = useState("temperaturaInterna");
  const [campoY, setCampoY] = useState("umidadeInterna");

  const scatterData = useMemo(() =>
    registros
      .filter((r) => getVal(r, campoX) !== null && getVal(r, campoY) !== null)
      .map((r) => ({ x: getVal(r, campoX), y: getVal(r, campoY), colmeia: r.colmeia.nome })),
    [registros, campoX, campoY]
  );

  const colmeias = useMemo(() => [...new Set(registros.map((r) => r.colmeia.nome))], [registros]);
  const labelX = CAMPOS_NUMERICOS.find((c) => c.key === campoX)?.label ?? campoX;
  const labelY = CAMPOS_NUMERICOS.find((c) => c.key === campoY)?.label ?? campoY;

  const isBoolX = CAMPOS_NUMERICOS.find((c) => c.key === campoX)?.src === "saude";
  const isBoolY = CAMPOS_NUMERICOS.find((c) => c.key === campoY)?.src === "saude";
  const domainX = isBoolX ? [0, 1] : ["auto", "auto"];
  const domainY = isBoolY ? [0, 1] : ["auto", "auto"];

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-sm font-bold text-yellow-950 mb-4">Correlação entre variáveis</h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-yellow-950">Eixo X</label>
          <select value={campoX} onChange={(e) => setCampoX(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            {CAMPOS_NUMERICOS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-yellow-950">Eixo Y</label>
          <select value={campoY} onChange={(e) => setCampoY(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            {CAMPOS_NUMERICOS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="self-end text-xs text-yellow-800">{scatterData.length} pontos</div>
      </div>
      {scatterData.length === 0 ? (
        <p className="text-yellow-800 text-sm">Nenhum registro com ambos os campos preenchidos.</p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ bottom: 50, left: 20, right: 20, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name={labelX} tick={{ fontSize: 10 }}
              domain={domainX}
              padding={isBoolX ? { left: 40, right: 40 } : { left: 10, right: 10 }}
              label={{ value: labelX, position: "insideBottom", offset: -25, fontSize: 11 }} />
            <YAxis type="number" dataKey="y" name={labelY} tick={{ fontSize: 10 }}
              domain={domainY}
              padding={isBoolY ? { top: 40, bottom: 40 } : { top: 10, bottom: 10 }}
              label={{ value: labelY, angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }}
              formatter={(val) => [typeof val === "number" ? val.toFixed(3) : val, ""]} />
            <Legend verticalAlign="top" height={36} />
            {colmeias.map((col, i) => (
              <Scatter key={col} name={col}
                data={scatterData.filter((d) => d.colmeia === col)}
                fill={COLORS[i % COLORS.length]} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function Charts({
  registros,
  tab,
}: {
  registros: Registro[];
  tab: "dashboards" | "correlacao";
}) {
  if (tab === "dashboards") return <Dashboards registros={registros} />;
  return <Correlacao registros={registros} />;
}
