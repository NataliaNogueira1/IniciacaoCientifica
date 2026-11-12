import Link from "next/link";
import type { ReactNode } from "react";
import { House, BarChart2, Info, LogIn, Gamepad2, Sprout } from "lucide-react";
import PreviaMandacaiaRun from "./mandacaia-run/Previa";

const JOGOS: { href: string; imagem: ReactNode; titulo: string; descricao: string; disponivel: boolean }[] = [
  {
    href: "/jogo/mandacaia-run",
    imagem: <PreviaMandacaiaRun />,
    titulo: "Mandaçaia Run",
    descricao: "Ajude a mandaçaia a desviar dos favos e dos predadores e bata seu recorde!",
    disponivel: true,
  },
  {
    href: "/jogo/reflorestamento",
    imagem: (
      <div className="w-full h-full bg-linear-to-b from-sky-200 via-lime-100 to-green-300 flex items-center justify-center">
        <span className="text-7xl" aria-hidden="true">🌳</span>
      </div>
    ),
    titulo: "Reflorestamento",
    descricao: "Plante e cuide de árvores para restaurar a floresta e ajudar as abelhas.",
    disponivel: true,
  },
];

export default function SelecaoJogoPage() {
  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center" aria-label="Seleção de jogos">

      {/* Nav pública — pill flutuante no desktop, barra no mobile */}
      <div className="hidden sm:flex fixed top-6 right-16 z-50 items-center" role="navigation">
        <div className="flex items-center bg-yellow-950 border-2 border-yellow-800 rounded-full px-2.5 py-2 gap-1.5 shadow-md">
          <Link href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </Link>
          <Link href="/abelhas" aria-label="Abelhas"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <Info size={17} strokeWidth={2} />
          </Link>
          <Link href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/jogo" aria-label="Jogo" aria-current="page"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 scale-110 shadow-inner transition-all duration-200">
            <Gamepad2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/login" aria-label="Entrar"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300 transition-all duration-200">
            <LogIn size={17} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="sm:hidden w-full max-w-5xl bg-yellow-950 rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between mb-4" role="navigation">
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="Início"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <House size={17} strokeWidth={2} />
          </Link>
          <Link href="/abelhas" aria-label="Abelhas"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <Info size={17} strokeWidth={2} />
          </Link>
          <Link href="/dados" aria-label="Dados"
            className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
            <BarChart2 size={17} strokeWidth={2} />
          </Link>
          <Link href="/jogo" aria-label="Jogo" aria-current="page"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400 text-yellow-950 transition-all duration-200">
            <Gamepad2 size={17} strokeWidth={2} />
          </Link>
        </div>
        <Link href="/login" aria-label="Entrar"
          className="flex items-center justify-center w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-900 transition-all duration-200">
          <LogIn size={17} strokeWidth={2} />
        </Link>
      </div>

      {/* Título */}
      <div className="w-full max-w-5xl mb-6 sm:mt-16">
        <div className="bg-yellow-950 rounded-2xl shadow-xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shrink-0" aria-hidden="true">
            <Gamepad2 size={24} className="text-yellow-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-yellow-300">Jogos</h1>
            <p className="text-sm text-yellow-400 mt-0.5">Aprenda sobre as abelhas nativas se divertindo: escolha um jogo e comece a aventura!</p>
          </div>
        </div>
      </div>

      {/* Opções */}
      <ul className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-5">
        {JOGOS.map((jogo) => (
          <li key={jogo.href}>
            <Link
              href={jogo.href}
              className="h-full bg-yellow-950 rounded-2xl shadow-xl border-2 border-yellow-800 hover:border-amber-400 focus-visible:border-amber-400 focus-visible:outline-none overflow-hidden flex flex-col items-center text-center gap-3 pb-6 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-full aspect-[15/7] border-b-2 border-yellow-800 overflow-hidden">{jogo.imagem}</div>
              <h2 className="text-xl font-black text-yellow-300">{jogo.titulo}</h2>
              <p className="text-sm text-yellow-400 px-6">{jogo.descricao}</p>
              {jogo.disponivel ? (
                <span className="mt-auto flex items-center gap-2 bg-amber-400 text-yellow-950 font-black text-sm px-5 py-2 rounded-xl">
                  <Gamepad2 size={16} /> Jogar
                </span>
              ) : (
                <span className="mt-auto flex items-center gap-2 bg-yellow-900 text-amber-400 font-black text-sm px-5 py-2 rounded-xl">
                  <Sprout size={16} /> Em breve
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
