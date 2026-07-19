"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/app/components/InputText";
import SelectField from "@/app/components/SelectField";
import Button from "@/app/components/Button";
import BeeButton from "@/app/components/BeeButton";
import BeeIcon from "@/app/components/BeeIcon";
import { useAuth, clearAuthUser } from "@/app/hooks/useAuth";
import UserCard from "@/app/components/UserCard";

const COLMEIAS: Record<
  string,
  { cidade: string; latitude: number; longitude: number; altitude: number }
> = {
  "SENAI-SOR-1": { cidade: "Florianopolis, SC", latitude: -27.5954, longitude: -48.548,  altitude: 12  },
  "COL-002":     { cidade: "Curitiba, PR",       latitude: -25.4284, longitude: -49.2733, altitude: 934 },
  "COL-003":     { cidade: "Porto Alegre, RS",   latitude: -30.0346, longitude: -51.2177, altitude: 10  },
  "COL-004":     { cidade: "Sao Paulo, SP",      latitude: -23.5505, longitude: -46.6333, altitude: 760 },
};

interface FormData {
  colmeia: string;
  dataHora: string;
  temperaturaInterna: string;
  temperaturaExterna: string;
  umidadeInterna: string;
  umidadeExterna: string;
  pressaoAtmosferica: string;
  velocidadeVento: string;
  peso: string;
  presencaRainha: string;
  comida: string;
  condicaoClimatica: string;
  saudavel: string;
  predadorPresente: string;
  tipoPredador: string;
  tipoPredadorOutros: string;
  observacoes: string;
}

const initialForm: FormData = {
  colmeia: "",
  dataHora: "",
  temperaturaInterna: "",
  temperaturaExterna: "",
  umidadeInterna: "",
  umidadeExterna: "",
  pressaoAtmosferica: "",
  velocidadeVento: "",
  peso: "",
  presencaRainha: "",
  comida: "",
  condicaoClimatica: "",
  saudavel: "",
  predadorPresente: "",
  tipoPredador: "",
  tipoPredadorOutros: "",
  observacoes: "",
};

function parseNum(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildObservacoes(form: FormData): string | null {
  const parts: string[] = [];
  if (form.observacoes.trim()) parts.push(form.observacoes.trim());
  if (
    form.predadorPresente === "SIM" &&
    form.tipoPredador === "OUTROS" &&
    form.tipoPredadorOutros.trim()
  ) {
    parts.push(`Predador (outros): ${form.tipoPredadorOutros.trim()}`);
  }
  return parts.length > 0 ? parts.join("\n") : null;
}

/** Lança abelhinhas dos inputs preenchidos e chama onDone quando termina */
function launchBees(rects: DOMRect[], onDone: () => void) {
  const validRects = rects.filter(
    (r) => r.width > 0 && r.height > 0 && r.top >= 0 && r.top < window.innerHeight
  );

  if (validRects.length === 0) {
    setTimeout(onDone, 100);
    return;
  }

  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed", inset: "0",
    pointerEvents: "none", zIndex: "9999",
  });
  document.body.appendChild(container);

  const vw = window.innerWidth;

  validRects.forEach((rect, i) => {
    const span = document.createElement("span");
    Object.assign(span.style, {
      position: "fixed",
      left: `${rect.left + rect.width * 0.15}px`,
      top:  `${rect.top  + rect.height / 2}px`,
      fontSize: "18px",
      lineHeight: "1",
      pointerEvents: "none",
      userSelect: "none",
    });
    span.setAttribute("aria-hidden", "true");
    span.textContent = "🐝";
    container.appendChild(span);

    const delay  = i * 120;
    const dur    = 1100 + (i % 3) * 150;
    const curveY = (i % 2 === 0 ? -1 : 1) * (30 + (i % 4) * 15);

    span.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${vw * 0.25}px,${curveY}px) scale(1.1)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${vw * 0.6}px,${curveY * 0.5}px) scale(0.9)`, opacity: 0.8, offset: 0.75 },
        { transform: `translate(${vw}px,${curveY * 0.2}px) scale(0.6)`, opacity: 0 },
      ],
      { duration: dur, delay, easing: "ease-in", fill: "forwards" }
    );
  });

  const lastDelay = (validRects.length - 1) * 120;
  const lastDur   = 1100 + ((validRects.length - 1) % 3) * 150;

  setTimeout(() => {
    if (document.body.contains(container)) document.body.removeChild(container);
    onDone();
  }, lastDelay + lastDur + 300);
}

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm]               = useState<FormData>(initialForm);
  const [saving, setSaving]           = useState(false);
  const [beesFlying, setBeesFlying]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<(typeof COLMEIAS)[string] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    setLocalizacao(form.colmeia ? (COLMEIAS[form.colmeia] ?? null) : null);
  }, [form.colmeia]);

  useEffect(() => {
    const now   = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm((p) => ({ ...p, dataHora: local }));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === "predadorPresente" && value !== "SIM") {
        next.tipoPredador = "";
        next.tipoPredadorOutros = "";
      }
      if (name === "tipoPredador" && value !== "OUTROS") {
        next.tipoPredadorOutros = "";
      }
      return next;
    });
  }

  function handleSaveClick() {
    if (saving || beesFlying || !formRef.current) return;

    // Captura rects de TODOS os inputs/selects visíveis antes de qualquer re-render
    const rects = Array.from(
      formRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea"
      )
    ).map((el) => el.getBoundingClientRect());

    // Dispara animação imediatamente (sem setState antes)
    launchBees(rects, async () => {
      setSaving(true);
      setError(null);
      try {
        const token = user?.token ?? "";
        const res = await fetch("/api/registros", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            colmeia: form.colmeia,
            dataHora: new Date(form.dataHora).toISOString(),
            temperaturaInterna: parseNum(form.temperaturaInterna),
            temperaturaExterna: parseNum(form.temperaturaExterna),
            umidadeInterna: parseNum(form.umidadeInterna),
            umidadeExterna: parseNum(form.umidadeExterna),
            pressaoAtmosferica: parseNum(form.pressaoAtmosferica),
            velocidadeVento: parseNum(form.velocidadeVento),
            peso: parseNum(form.peso),
            presencaRainha: form.presencaRainha === "SIM",
            presencaPredador: form.predadorPresente === "SIM",
            tipoPredador:
              form.predadorPresente === "SIM" ? form.tipoPredador || null : null,
            comida: form.comida,
            condicaoClimatica: form.condicaoClimatica,
            saudavel: form.saudavel === "SIM",
            observacoes: buildObservacoes(form),
          }),
        });
        if (!res.ok) {
          if (res.status === 401) {
            clearAuthUser();
            router.replace("/login");
            return;
          }
          const data = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(data?.message ?? "Erro ao salvar registro");
        }
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar registro");
      } finally {
        setSaving(false);
        setBeesFlying(false);
      }
    });

    setBeesFlying(true);
  }

  function handleReset() {
    setSubmitted(false);
    setSaving(false);
    setBeesFlying(false);
    setError(null);
    setForm(initialForm);
    setLocalizacao(null);
  }

  // Enquanto verifica autenticação, não renderiza nada para evitar flash
  if (authLoading || !user) return null;

  function handleLogout() {
    clearAuthUser();
    router.replace("/login");
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-4 py-10 gap-4 sm:gap-6"
      aria-label="Pagina de registro da colmeia"
    >
      {/* Card do usuário — aparece em cima no mobile, canto superior direito no desktop */}
      <div className="w-full max-w-2xl flex justify-end sm:fixed sm:top-6 sm:right-6 sm:w-auto sm:z-50">
        <UserCard user={user} onLogout={handleLogout} />
      </div>

      {/* Formulário principal — sempre centralizado */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
        role="region"
        aria-label="Formulario de registro"
      >
        <div className="bg-yellow-950 px-6 py-7 flex items-start gap-4">
          <div className="-mt-1">
            <BeeIcon size="1.6rem" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-yellow-300 leading-tight">
              Registro de Situação da Colmeia
            </h1>
            <p className="text-sm text-yellow-300">
              Nos ajude a monitorar a saúde das abelhas Mandaçaia
            </p>
          </div>
        </div>

        {submitted ? (
          <div
            className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <span className="text-5xl" role="img" aria-label="Sucesso">🍯</span>
            <h2 className="text-lg font-bold text-yellow-950">Registro enviado com sucesso!</h2>
            <p className="text-sm text-yellow-950">
              Os dados de hoje da colmeia <strong>{form.colmeia || "selecionada"}</strong> foram salvos.
            </p>
            <Button title="Novo registro" onClick={handleReset} />
          </div>
        ) : (
          <form
            ref={formRef}
            noValidate
            className="px-6 py-6 flex flex-col gap-6"
            aria-label="Formulario de registro de saude e sensor da colmeia"
          >
            <fieldset className="flex flex-col gap-4">
              <legend className="text-base font-bold text-yellow-950 mb-1 flex items-center gap-2">
                Localização
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Colmeia"
                  id="colmeia"
                  required
                  placeholder="Selecione a colmeia"
                  value={form.colmeia}
                  onChange={handleChange}
                  options={Object.keys(COLMEIAS).map((k) => ({ value: k, label: k }))}
                />
                <InputText
                  label="Data e hora"
                  id="dataHora"
                  type="datetime-local"
                  required
                  value={form.dataHora}
                  onChange={handleChange}
                />
              </div>
              {localizacao && (
                <div
                  className="rounded-lg border border-amber-300 bg-amber-50 p-3"
                  role="region"
                  aria-label="Localizacao da colmeia"
                  aria-live="polite"
                >
                  <p className="text-xs font-semibold text-amber-800 flex items-center gap-1 mb-1">
                    📍 Localização encontrada
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-yellow-950">
                    <span><strong>Cidade:</strong> {localizacao.cidade}</span>
                    <span><strong>Lat:</strong> {localizacao.latitude}</span>
                    <span><strong>Long:</strong> {localizacao.longitude}</span>
                    <span><strong>Alt:</strong> {localizacao.altitude} m</span>
                  </div>
                </div>
              )}
            </fieldset>

            <hr className="border-gray-200" />

            <fieldset className="flex flex-col gap-4">
              <legend className="text-base font-bold text-yellow-950 mb-1 flex items-center gap-2">
                Dados do Sensor
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText label="Temperatura interna (°C)"  id="temperaturaInterna"  type="number" step="0.01" placeholder="Digite a temperatura interna"   value={form.temperaturaInterna}  onChange={handleChange} />
                <InputText label="Temperatura externa (°C)"  id="temperaturaExterna"  type="number" step="0.01" placeholder="Digite a temperatura externa"   value={form.temperaturaExterna}  onChange={handleChange} />
                <InputText label="Umidade interna (%)"       id="umidadeInterna"      type="number" step="0.01" min="0" max="100" placeholder="Digite a umidade interna" value={form.umidadeInterna}  onChange={handleChange} />
                <InputText label="Umidade externa (%)"       id="umidadeExterna"      type="number" step="0.01" min="0" max="100" placeholder="Digite a umidade externa" value={form.umidadeExterna}  onChange={handleChange} />
                <InputText label="Pressão atmosférica (hPa)" id="pressaoAtmosferica"  type="number" step="0.01" placeholder="Digite a pressão atmosférica" value={form.pressaoAtmosferica}  onChange={handleChange} />
                <InputText label="Velocidade do vento (km/h)" id="velocidadeVento"    type="number" step="0.01" min="0" placeholder="Digite a velocidade do vento" value={form.velocidadeVento} onChange={handleChange} />
                <InputText label="Peso da colmeia (kg)"      id="peso"                type="number" step="0.01" min="0" placeholder="Digite o peso da colmeia" value={form.peso}           onChange={handleChange} className="sm:col-span-2" />
              </div>
            </fieldset>

            <hr className="border-gray-200" />

            <fieldset className="flex flex-col gap-4">
              <legend className="text-base font-bold text-yellow-950 mb-1 flex items-center gap-2">
                Saúde da Colmeia
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Nível de comida"
                  id="comida"
                  required
                  placeholder="Selecione o nível de comida disponível"
                  value={form.comida}
                  onChange={handleChange}
                  options={[
                    { value: "ABUNDANTE", label: "Abundante" },
                    { value: "ADEQUADO",  label: "Adequado"  },
                    { value: "BAIXO",     label: "Baixo"     },
                    { value: "CRITICO",   label: "Crítico"   },
                  ]}
                />
                <SelectField
                  label="Condição climática"
                  id="condicaoClimatica"
                  required
                  placeholder="Selecione a condição climática atual"
                  value={form.condicaoClimatica}
                  onChange={handleChange}
                  options={[
                    { value: "ENSOLARADO", label: "Ensolarado" },
                    { value: "NUBLADO",    label: "Nublado"    },
                    { value: "CHUVOSO",    label: "Chuvoso"    },
                    { value: "TEMPESTADE", label: "Tempestade" },
                  ]}
                />
                <SelectField
                  label="Rainha presente?"
                  id="presencaRainha"
                  required
                  placeholder="Selecione se a rainha está presente"
                  value={form.presencaRainha}
                  onChange={handleChange}
                  options={[
                    { value: "SIM", label: "Sim" },
                    { value: "NAO", label: "Não" },
                  ]}
                />
                <SelectField
                  label="Colmeia saudável?"
                  id="saudavel"
                  required
                  placeholder="Selecione se a colmeia está saudável"
                  value={form.saudavel}
                  onChange={handleChange}
                  options={[
                    { value: "SIM", label: "Sim" },
                    { value: "NAO", label: "Não" },
                  ]}
                />
                <SelectField
                  label="Predador presente?"
                  id="predadorPresente"
                  required
                  placeholder="Selecione se há predador na colmeia"
                  value={form.predadorPresente}
                  onChange={handleChange}
                  options={[
                    { value: "SIM", label: "Sim" },
                    { value: "NAO", label: "Não" },
                  ]}
                />
                {form.predadorPresente === "SIM" && (
                  <SelectField
                    label="Tipo de predador"
                    id="tipoPredador"
                    required
                    placeholder="Selecione o tipo de predador"
                    value={form.tipoPredador}
                    onChange={handleChange}
                    options={[
                      { value: "FORMIGAS", label: "Formigas" },
                      { value: "LAGARTIXAS", label: "Lagartixas" },
                      { value: "FORIDEO", label: "Forídeo" },
                      { value: "OUTROS", label: "Outros" },
                    ]}
                  />
                )}
                {form.predadorPresente === "SIM" && form.tipoPredador === "OUTROS" && (
                  <InputText
                    label="Especifique o predador"
                    id="tipoPredadorOutros"
                    required
                    placeholder="Descreva o tipo de predador"
                    value={form.tipoPredadorOutros}
                    onChange={handleChange}
                    className="sm:col-span-2"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="observacoes" className="text-sm font-semibold text-yellow-950">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows={3}
                  placeholder="Descreva qualquer anomalia, comportamento incomum ou nota relevante…"
                  value={form.observacoes}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-yellow-950 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors duration-150 resize-y"
                  aria-label="Observacoes sobre a colmeia"
                />
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="text-sm text-red-600 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-row gap-3 pt-2">
              <BeeButton
                title="Registrar"
                loading={saving}
                disabled={beesFlying}
                onClick={handleSaveClick}
                className="flex-1"
              />
              <Button
                type="button"
                title="Cancelar"
                variant="secondary"
                onClick={handleReset}
                disabled={saving || beesFlying}
                className="flex-1"
              />
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
