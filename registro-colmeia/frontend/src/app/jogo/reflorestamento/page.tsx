import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReflorestamentoPage() {
  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center justify-center" aria-label="Jogo Reflorestamento">
      <div className="w-full max-w-xl bg-yellow-950 rounded-2xl shadow-xl px-6 py-10 flex flex-col items-center text-center gap-4">
        <span className="text-6xl" aria-hidden="true">🌳</span>
        <h1 className="text-2xl font-black text-yellow-300">Reflorestamento</h1>
        <p className="text-sm text-yellow-400">Este jogo ainda está em desenvolvimento. Volte em breve!</p>
        <Link href="/jogo"
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-yellow-950 font-black text-sm px-5 py-2 rounded-xl transition-all">
          <ArrowLeft size={16} /> Voltar aos jogos
        </Link>
      </div>
    </main>
  );
}
