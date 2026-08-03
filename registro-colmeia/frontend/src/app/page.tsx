"use client";

import React from "react";
import BeeIcon from "@/app/components/BeeIcon";
import { BarChart2, BookOpen, Mail, ExternalLink, House, LogIn, Hexagon } from "lucide-react";

// ── Menu público ──────────────────────────────────────────────────────────────

function PublicNav() {
  return (
    <>
      {/* Desktop: pill flutuante igual às outras páginas */}
      <div className="hidden sm:flex fixed top-6 right-16 z-50 items-center" role="navigation">
        <div className="flex items-center bg-yellow-950 border-2 border-yellow-800 rounded-full px-2.5 py-2 gap-1.5 shadow-md">
          <a href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 scale-110 shadow-inner transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </a>
          <a href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </a>
          <a href="/login" aria-label="Entrar"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <LogIn size={17} strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* Mobile: barra no topo igual ao TopBar */}
      <div className="sm:hidden w-full bg-yellow-950 rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between" role="navigation">
        <div className="flex items-center gap-1">
          <a href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </a>
          <a href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </a>
        </div>
        <a href="/login" aria-label="Entrar"
          className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
          <LogIn size={17} strokeWidth={2} />
        </a>
      </div>
    </>
  );
}

// ── Página Home ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8" aria-label="Página inicial">
      <PublicNav />

      <div className="max-w-4xl mx-auto mt-4 sm:mt-0 sm:pt-24 flex flex-col gap-6">

        {/* Hero — mesmo estilo do card de título das outras páginas */}
        <div className="w-full bg-yellow-950 rounded-2xl shadow-xl px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <div className="-mt-1 mb-1">
              <BeeIcon size="1.6rem" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-300 leading-tight">
              Sistema para Monitoramento de Colmeias de <em>Melipona quadrifasciata</em>
            </h1>
            <p className="text-sm text-yellow-400 leading-relaxed">
              Uma plataforma de iniciação científica para registro, armazenamento e gestão
              de dados ambientais e de saúde de colmeias, desenvolvida no SENAI Gaspar Ricardo Júnior.
              Os dados produzidos são abertos e destinados a pesquisas futuras e estratégias de conservação da espécie.
            </p>
          </div>
        </div>

        {/* Sobre o projeto + Abelhas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Hexagon size={18} className="text-amber-700" strokeWidth={1.5} />
              </div>
              <h2 className="font-bold text-yellow-950">Sobre o Projeto</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Este projeto de iniciação científica propõe e implementa uma plataforma para registro,
              armazenamento e gestão de dados ambientais e de saúde de colmeias da espécie{" "}
              <em>Melipona quadrifasciata</em>. Pesquisadores registram variáveis como temperatura,
              umidade, peso, presença de predadores e condições climáticas, estabelecendo uma base
              estruturada para análises históricas, modelos preditivos e estratégias de conservação.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 text-lg" aria-hidden="true">🐝</div>
              <h2 className="font-bold text-yellow-950">Abelhas Mandaçaia</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A <em>Melipona quadrifasciata</em>, conhecida como mandaçaia, é uma abelha nativa
              brasileira sem ferrão com uma das maiores distribuições geográficas do gênero no Brasil.
              Atua na polinização de espécies nativas da Mata Atlântica e culturas agrícolas como
              café, goiaba e maracujá. O declínio de suas colônias, causado por predadores,
              agroquímicos e perda de habitat, motiva o monitoramento contínuo como ferramenta
              de conservação e manejo preventivo.
            </p>
          </div>
        </div>

        {/* Dados abertos */}
        <div className="bg-white rounded-2xl shadow-xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <BarChart2 size={18} className="text-yellow-950" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-yellow-950 mb-0.5">Dados Abertos</h2>
            <p className="text-sm text-gray-600">
              Todos os registros de monitoramento são públicos, em conformidade com os princípios
              FAIR de dados científicos. Acesse a base completa, visualize dashboards de correlação
              entre variáveis ambientais e indicadores de saúde, e exporte em CSV para sua pesquisa.
            </p>
          </div>
          <a href="/dados"
            className="flex items-center gap-1.5 bg-yellow-950 hover:bg-yellow-900 text-yellow-300 font-semibold text-sm px-4 py-2 rounded-lg transition-colors shrink-0">
            <BarChart2 size={14} /> Explorar dados
          </a>
        </div>

        {/* Artigo */}
        <div className="bg-yellow-950 rounded-2xl shadow-xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-yellow-950" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-yellow-300 mb-0.5">Artigo Científico</h2>
            <p className="text-sm text-yellow-400">
              <strong className="text-yellow-300">Sistema para Monitoramento de Colmeias de <em>Melipona quadrifasciata</em> como Ferramenta de Apoio à Conservação da Espécie.</strong>
              <br />
              Leia o artigo completo sobre o desenvolvimento do sistema, a metodologia adotada e os resultados obtidos.
            </p>
          </div>
          <a href="#artigo"
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-yellow-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors shrink-0">
            <ExternalLink size={14} /> Ler artigo
          </a>
        </div>

        {/* Contato */}
        <div className="bg-white rounded-2xl shadow-xl px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-amber-700" strokeWidth={1.5} />
            </div>
            <h2 className="font-bold text-yellow-950">Contato</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-yellow-950 mb-1">Instituição</p>
              <p>SENAI Gaspar Ricardo Júnior</p>
              <p>Sorocaba - SP</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-yellow-800 opacity-60 pb-4">
          © {new Date().getFullYear()} Projeto Colmeia Smart · SENAI Gaspar Ricardo Júnior
        </p>

      </div>
    </main>
  );
}
