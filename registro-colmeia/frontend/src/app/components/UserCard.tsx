"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/app/hooks/useAuth";
import IconAvatar from "@/app/components/IconAvatar";
import { UserPen, LogOut } from "lucide-react";

const PERMISSAO_LABEL: Record<string, string> = {
  Admin: "Administrador",
  Pesquisador: "Pesquisador(a)",
};

const PERMISSAO_COLOR: Record<string, string> = {
  Admin: "bg-amber-400 text-amber-950",
  Pesquisador: "bg-yellow-100 text-yellow-900",
};

interface UserCardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function UserCard({ user, onLogout }: UserCardProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const badgeClass = PERMISSAO_COLOR[user.permissao] ?? "bg-gray-100 text-gray-700";
  const permissaoLabel = PERMISSAO_LABEL[user.permissao] ?? user.permissao;

  function goToPerfil() {
    setOpen(false);
    router.push("/perfil");
  }

  return (
    <>
      {/* ── Mobile: card horizontal ── */}
      <div
        className="sm:hidden w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        role="complementary"
        aria-label="Dados do usuário"
      >
        <div className="bg-yellow-950 px-5 py-4 flex items-center gap-4">
          {/* Avatar */}
          <IconAvatar icon={user.emoji} size="sm" className="shrink-0" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-yellow-300 font-bold text-sm leading-tight truncate">
              {user.nome}
            </p>
            <p className="text-yellow-500 text-xs truncate">{user.email}</p>
            <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
              {permissaoLabel}
            </span>
          </div>

          {/* Ações empilhadas */}
          <div className="flex flex-col items-stretch gap-1 shrink-0">
            <button
              onClick={goToPerfil}
              className="flex items-center gap-1.5 text-xs text-yellow-300 hover:text-amber-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Editar perfil"
            >
              <UserPen size={15} strokeWidth={2} />
              <span>Perfil</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Sair da conta"
            >
              <LogOut size={15} strokeWidth={2} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop: avatar clicável com dropdown ── */}
      <div className="hidden sm:block relative" aria-label="Menu do usuário">
        <button
          onClick={() => setOpen((v) => !v)}
          className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-full shadow-lg"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`Menu do usuário ${user.nome}`}
        >
          <IconAvatar icon={user.emoji} size="xs" className="ring-2 ring-yellow-800" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden="true"
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute right-0 top-14 z-50 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
              role="menu"
            >
              <div className="bg-yellow-950 px-5 py-5 flex flex-col items-center gap-2">
                <IconAvatar icon={user.emoji} size="lg" />
                <div className="text-center">
                  <p className="text-yellow-300 font-bold text-sm leading-tight">
                    {user.nome}
                  </p>
                  <p className="text-yellow-500 text-xs mt-0.5 truncate max-w-[180px]">
                    {user.email}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                  {permissaoLabel}
                </span>
              </div>

              <div className="px-4 py-3 flex flex-col gap-2">
                <button
                  onClick={goToPerfil}
                  role="menuitem"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  Editar perfil
                </button>
                <button
                  onClick={onLogout}
                  role="menuitem"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Sair da conta
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
