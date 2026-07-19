"use client";

import React, { useEffect, useState } from "react";
import { House, LogIn } from "lucide-react";
import BeeIcon from "@/app/components/BeeIcon";
import IconAvatar from "@/app/components/IconAvatar";
import { getAuthUser, clearAuthUser, type AuthUser } from "@/app/hooks/useAuth";

export default function DadosHeader() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  function logout() {
    clearAuthUser();
    setUser(null);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <BeeIcon size="1.6rem" />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-yellow-950">Dados das Colmeias</h1>
        <p className="text-sm text-yellow-800">Registros públicos de monitoramento</p>
      </div>

      <div className="flex items-center gap-1">
        <a
          href="/"
          className="flex items-center gap-1.5 text-sm text-yellow-950 hover:text-amber-700 transition-colors px-3 py-2 rounded-lg hover:bg-amber-100"
          title="Página inicial"
          aria-label="Ir para página inicial"
        >
          <House size={18} strokeWidth={1.75} />
          <span className="hidden sm:inline">Início</span>
        </a>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full"
              aria-expanded={open}
              aria-haspopup="true"
              aria-label="Menu do usuário"
            >
              <IconAvatar icon={user.emoji} size="sm" className="ring-2 ring-yellow-800" />
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-14 z-50 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100" role="menu">
                  <div className="bg-yellow-950 px-4 py-4 flex flex-col items-center gap-1">
                    <IconAvatar icon={user.emoji} size="md" />
                    <p className="text-yellow-300 font-bold text-sm mt-1">{user.nome}</p>
                    <p className="text-yellow-500 text-xs truncate max-w-[160px]">{user.email}</p>
                  </div>
                  <div className="px-3 py-2 flex flex-col gap-1">
                    <a href="/perfil" role="menuitem"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Editar perfil
                    </a>
                    <a href="/" role="menuitem"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Fazer registro
                    </a>
                    <button onClick={logout} role="menuitem"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full"
                    >
                      Sair da conta
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <a
            href="/login?redirect=/dados"
            className="flex items-center gap-1.5 text-sm text-yellow-950 hover:text-amber-700 transition-colors px-3 py-2 rounded-lg hover:bg-amber-100"
            title="Entrar"
            aria-label="Ir para login"
          >
            <LogIn size={18} strokeWidth={1.75} />
            <span className="hidden sm:inline">Entrar</span>
          </a>
        )}
      </div>
    </div>
  );
}
