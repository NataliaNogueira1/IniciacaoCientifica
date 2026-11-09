"use client";

import React from "react";
import Link from "next/link";
import BeeIcon from "@/app/components/BeeIcon";
import {
  BarChart2,
  House,
  LogIn,
  Info,
  MapPin,
  Flower2,
  ShieldAlert,
  Thermometer,
  Gamepad2,
} from "lucide-react";

// ── Menu público (mesmo padrão da Home) ─────────────────────────────────────────

function PublicNav() {
  return (
    <>
      {/* Desktop: pill flutuante igual às outras páginas */}
      <div className="hidden sm:flex fixed top-6 right-16 z-50 items-center" role="navigation">
        <div className="flex items-center bg-yellow-950 border-2 border-yellow-800 rounded-full px-2.5 py-2 gap-1.5 shadow-md">
          <Link href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </Link>
          <Link href="/abelhas" aria-label="Abelhas" aria-current="page"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 scale-110 shadow-inner transition-all duration-200">
            <Info size={17} strokeWidth={2} />
          </Link>
          <Link href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/jogo" aria-label="Jogo"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <Gamepad2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/login" aria-label="Entrar"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <LogIn size={17} strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Mobile: barra no topo igual ao TopBar */}
      <div className="sm:hidden w-full bg-yellow-950 rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between" role="navigation">
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </Link>
          <Link href="/abelhas" aria-label="Abelhas" aria-current="page"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 transition-all duration-200">
            <Info size={17} strokeWidth={2} />
          </Link>
          <Link href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/jogo" aria-label="Jogo"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <Gamepad2 size={17} strokeWidth={2} />
          </Link>
        </div>
        <Link href="/login" aria-label="Entrar"
          className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
          <LogIn size={17} strokeWidth={2} />
        </Link>
      </div>
    </>
  );
}

// ── Cartão de característica reutilizável ────────────────────────────────────────

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
          {icon}
        </div>
        <h2 className="font-bold text-yellow-950">{title}</h2>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

// ── Abelhas voando dentro do card ────────────────────────────────────────────────

function FlyingBees() {
  // Enxame: várias abelhas, cada uma com caminho, tamanho, velocidade e atraso
  // próprios. Umas voam para a direita (bee-right-*) e outras para a esquerda
  // (bee-left-*). Os atrasos são distribuídos para que o voo nunca fique vazio.
  const bees = [
    { size: "1.6rem", anim: "bee-right-a", dur: "9s",  delay: "0s",    top: "18%" },
    { size: "1.2rem", anim: "bee-right-b", dur: "11s", delay: "-4s",   top: "52%", opacity: 0.9 },
    { size: "1rem",   anim: "bee-right-c", dur: "13s", delay: "-8s",   top: "72%", opacity: 0.75 },
    { size: "1.3rem", anim: "bee-right-a", dur: "10s", delay: "-6s",   top: "38%", opacity: 0.85 },
    { size: "0.9rem", anim: "bee-right-b", dur: "14s", delay: "-11s",  top: "84%", opacity: 0.65 },
    { size: "1.4rem", anim: "bee-left-a",  dur: "12s", delay: "-2s",   top: "28%", opacity: 0.9 },
    { size: "1.1rem", anim: "bee-left-b",  dur: "10s", delay: "-7s",   top: "62%", opacity: 0.8 },
    { size: "0.95rem",anim: "bee-left-a",  dur: "15s", delay: "-13s",  top: "46%", opacity: 0.6 },
  ];

  return (
    <div
      className="relative bg-yellow-950 rounded-2xl shadow-xl h-40 sm:h-48 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        /* translateX em % é relativo à largura da PRÓPRIA abelha, por isso
           usamos valores grandes para cruzar o card inteiro. As que vão para a
           direita começam e terminam FORA do card, então o loop nunca "pisca". */
        @keyframes bee-right-a {
          0%   { transform: translate(-200%, 0) scaleX(-1) rotate(0deg); }
          25%  { transform: translate(1000%, -2.2rem) scaleX(-1) rotate(4deg); }
          50%  { transform: translate(1900%, 1.5rem) scaleX(-1) rotate(-3deg); }
          75%  { transform: translate(2800%, -1.8rem) scaleX(-1) rotate(3deg); }
          100% { transform: translate(3600%, 0.5rem) scaleX(-1) rotate(0deg); }
        }
        @keyframes bee-right-b {
          0%   { transform: translate(-200%, 0) scaleX(-1) rotate(0deg); }
          30%  { transform: translate(1200%, 2rem) scaleX(-1) rotate(-4deg); }
          55%  { transform: translate(2100%, -2.4rem) scaleX(-1) rotate(4deg); }
          80%  { transform: translate(3200%, 1.6rem) scaleX(-1) rotate(-2deg); }
          100% { transform: translate(4300%, -0.8rem) scaleX(-1) rotate(0deg); }
        }
        @keyframes bee-right-c {
          0%   { transform: translate(-200%, 0) scaleX(-1) rotate(0deg); }
          20%  { transform: translate(1200%, -1.4rem) scaleX(-1) rotate(3deg); }
          48%  { transform: translate(2500%, 2.2rem) scaleX(-1) rotate(-4deg); }
          72%  { transform: translate(3700%, -1rem) scaleX(-1) rotate(2deg); }
          100% { transform: translate(5000%, 1.2rem) scaleX(-1) rotate(0deg); }
        }
        /* Sentido contrário: começam na direita (fora) e vão até a esquerda (fora).
           scaleX(-1) espelha a abelha para ela "olhar" na direção do voo. */
        @keyframes bee-left-a {
          0%   { transform: translate(3600%, 0) rotate(0deg); }
          25%  { transform: translate(2600%, 1.8rem) rotate(4deg); }
          50%  { transform: translate(1700%, -1.6rem) rotate(-3deg); }
          75%  { transform: translate(800%, 2rem) rotate(3deg); }
          100% { transform: translate(-300%, -0.6rem) rotate(0deg); }
        }
        @keyframes bee-left-b {
          0%   { transform: translate(4300%, 0) rotate(0deg); }
          28%  { transform: translate(3000%, -2rem) rotate(-4deg); }
          54%  { transform: translate(2000%, 2.2rem) rotate(4deg); }
          78%  { transform: translate(900%, -1.4rem) rotate(-2deg); }
          100% { transform: translate(-300%, 1rem) rotate(0deg); }
        }
        .bee-flyer {
          position: absolute;
          left: 0;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }
      `}</style>

      {bees.map((b, i) => (
        <div
          key={i}
          className="bee-flyer"
          style={{
            top: b.top,
            opacity: b.opacity ?? 1,
            animationName: b.anim,
            animationDuration: b.dur,
            animationDelay: b.delay,
          }}
        >
          <BeeIcon size={b.size} />
        </div>
      ))}
    </div>
  );
}

// ── Página informativa ──────────────────────────────────────────────────────────

export default function AbelhasPage() {
  return (
    <main className="min-h-screen px-4 py-8" aria-label="Página informativa sobre as abelhas">
      <PublicNav />

      <div className="max-w-4xl mx-auto mt-4 sm:mt-0 sm:pt-24 flex flex-col gap-6">

        {/* Hero — mesmo estilo do card de título das outras páginas */}
        <div className="w-full bg-yellow-950 rounded-2xl shadow-xl px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <div className="-mt-1 mb-1">
              <BeeIcon size="1.6rem" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-300 leading-tight">
              Saiba mais sobre as abelhas <em>Melipona quadrifasciata</em>
            </h1>
            <p className="text-sm text-yellow-400 leading-relaxed">
              Conhecida popularmente como mandaçaia, é uma abelha nativa brasileira sem ferrão.
              Conheça abaixo suas principais características, sua importância ecológica e por que
              o monitoramento contínuo de suas colmeias é uma ferramenta de conservação.
            </p>
          </div>
        </div>

        {/* Características principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoCard icon={<span className="text-lg" aria-hidden="true">🐝</span>} title="A Mandaçaia">
            A <em>Melipona quadrifasciata</em> é uma abelha social sem ferrão da tribo Meliponini.
            Produz mel em pequenos potes de cerume, vive em colônias perenes com uma única rainha
            e se destaca pelas faixas amarelas características no abdômen, que dão origem ao nome
            científico <em>quadrifasciata</em> (quatro faixas).
          </InfoCard>

          <InfoCard icon={<MapPin size={18} strokeWidth={1.5} />} title="Distribuição">
            É endêmica do Brasil e possui uma das maiores distribuições geográficas do gênero
            <em> Melipona</em>, ocorrendo da Bahia ao Rio Grande do Sul, associada principalmente
            ao bioma da Mata Atlântica. Habita regiões de clima ameno e constrói seus ninhos em
            ocos de árvores.
          </InfoCard>

          <InfoCard icon={<Flower2 size={18} strokeWidth={1.5} />} title="Papel na Polinização">
            Atua na polinização de espécies nativas da Mata Atlântica e de culturas agrícolas
            de importância econômica, como café, goiaba, maracujá e berinjela. A polinização por
            vibração (buzz pollination) que realiza é essencial para a reprodução de muitas plantas,
            contribuindo diretamente para a segurança alimentar e a biodiversidade.
          </InfoCard>

          <InfoCard icon={<ShieldAlert size={18} strokeWidth={1.5} />} title="Ameaças">
            Suas colônias estão em declínio devido à perda e fragmentação de habitat, ao uso de
            agroquímicos, às mudanças climáticas e à ação de predadores naturais. Esse cenário
            reforça a necessidade de acompanhamento sistemático da saúde das colmeias para apoiar
            o manejo preventivo e estratégias de conservação.
          </InfoCard>
        </div>

        {/* Por que monitorar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Thermometer size={18} className="text-amber-700" strokeWidth={1.5} />
            </div>
            <h2 className="font-bold text-yellow-950">Por que monitorar as colmeias?</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Variáveis como temperatura interna e externa, umidade, pressão atmosférica, peso da
            colmeia, presença de predadores e condições climáticas revelam muito sobre o bem-estar
            da colônia. Registrar esses dados de forma contínua e estruturada permite identificar
            padrões, antecipar problemas e embasar decisões de manejo. Além disso, forma uma base
            histórica aberta, valiosa para o treinamento de modelos preditivos e para a pesquisa
            científica voltada à conservação da espécie.
          </p>
        </div>

        {/* Animação de abelhas voando — fecho visual no mesmo estilo da página */}
        <FlyingBees />

        <p className="text-center text-xs text-yellow-800 opacity-60 pb-4">
          © {new Date().getFullYear()} Projeto Colmeia Smart · SENAI Gaspar Ricardo Júnior
        </p>

      </div>
    </main>
  );
}
