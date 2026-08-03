"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { House, BarChart2, Pencil, UserPen, LogOut, ShieldCheck, Users, ClipboardList, Database, Hexagon } from "lucide-react";
import IconAvatar from "@/app/components/IconAvatar";
import type { AuthUser } from "@/app/hooks/useAuth";

type NavPage = "registro" | "dados" | "home" | "admin" | "solicitacoes" | "colmeias";

const NAV_ITEMS_BASE: { page: NavPage; icon: React.ReactNode; label: string; href: string }[] = [
  { page: "home",     icon: <House    size={17} strokeWidth={2} />, label: "Início",   href: "/"          },
  { page: "registro", icon: <Pencil   size={17} strokeWidth={2} />, label: "Registro", href: "/registro"  },
  { page: "dados",    icon: <BarChart2 size={17} strokeWidth={2} />, label: "Dados",   href: "/dados"     },
];

const NAV_ITEMS_ADMIN: { page: NavPage; icon: React.ReactNode; label: string; href: string }[] = [
  { page: "home",         icon: <House     size={17} strokeWidth={2} />, label: "Início",       href: "/"                   },
  { page: "registro",     icon: <Pencil    size={17} strokeWidth={2} />, label: "Registro",     href: "/registro"           },
  { page: "dados",        icon: <BarChart2 size={17} strokeWidth={2} />, label: "Dados",        href: "/dados"              },
  { page: "admin",        icon: <Users     size={17} strokeWidth={2} />, label: "Usuários",     href: "/admin"              },
  { page: "colmeias",     icon: <Hexagon   size={17} strokeWidth={2} />, label: "Colmeias",     href: "/admin/colmeias"     },
  { page: "solicitacoes", icon: <Database  size={17} strokeWidth={2} />, label: "Solicitações", href: "/admin/solicitacoes" },
];

interface TopBarProps {
  user: AuthUser;
  active: NavPage;
  onLogout: () => void;
}

export default function TopBar({ user, active, onLogout }: TopBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user.permissao === "Admin";
  const NAV_ITEMS = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_BASE;

  function goToPerfil() {
    setMenuOpen(false);
    router.push("/perfil");
  }

  return (
    <>
      {/* ── Mobile: barra horizontal no topo ── */}
      <div
        className="sm:hidden w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="bg-yellow-950 px-4 py-3 flex items-center justify-between gap-3">
          {/* Nav icons */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.page === active;
              return (
                <button
                  key={item.page}
                  onClick={() => router.push(item.href)}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200
                    ${isActive
                      ? "bg-amber-400 text-yellow-950 shadow-inner"
                      : "text-yellow-400 hover:bg-yellow-900"
                    }
                  `}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>

          {/* Avatar — só ícone, sem nome/email */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full p-1"
            aria-label={`Menu do usuário ${user.nome}`}
            aria-expanded={menuOpen}
          >
            <IconAvatar icon={user.emoji} size="xs" className="ring-2 ring-yellow-700 shrink-0" />
          </button>
        </div>

        {/* Dropdown mobile */}
        {menuOpen && (
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
            {/* Nome, email e permissão aparecem aqui após clicar */}
            <div className="flex items-center gap-3 px-1 pb-2 border-b border-gray-100 mb-1">
              <IconAvatar icon={user.emoji} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-yellow-950 truncate">{user.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${
                user.permissao === "Admin"
                  ? "bg-amber-400 text-amber-950"
                  : "bg-yellow-100 text-yellow-900"
              }`}>
                {user.permissao === "Admin" ? "Admin" : "Pesquisador(a)"}
              </span>
            </div>
            <button
              onClick={goToPerfil}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg px-3 py-2 transition-colors"
            >
              <UserPen size={15} /> Editar perfil
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors"
            >
              <LogOut size={15} /> Sair da conta
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop: pill flutuante no canto superior direito ── */}
      <div
        className="hidden sm:flex fixed top-6 right-16 z-50 items-center"
        role="navigation"
        aria-label="Navegação principal"
      >
        {/*
          Estrutura: [pill com 3 ícones] + [avatar sobrepostando a borda direita do pill]
          O pill tem borda amarela e fundo branco. O avatar fica "dentro" do pill
          pela direita, como na imagem de referência.
        */}
        <div className="relative flex items-center">
          {/* Pill de navegação */}
          <div className="flex items-center bg-yellow-950 border-2 border-yellow-800 rounded-full px-2.5 py-2 gap-1.5 shadow-md pr-14">
            {NAV_ITEMS.map((item) => {
              const isActive = item.page === active;
              return (
                <button
                  key={item.page}
                  onClick={() => router.push(item.href)}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200
                    ${isActive
                      ? "bg-amber-400 text-yellow-950 shadow-inner scale-110"
                      : "text-yellow-500 hover:bg-yellow-800 hover:text-yellow-300"
                    }
                  `}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>

          {/* Avatar saindo pela direita do pill */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`Menu do usuário ${user.nome}`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="absolute -right-1 flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-full"
          >
            <IconAvatar
              icon={user.emoji}
              size="sm"
              className="ring-2 ring-yellow-950 shadow-md"
            />
          </button>
        </div>

        {/* Dropdown desktop */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-14 z-50 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
              role="menu"
            >
              <div className="bg-yellow-950 px-4 py-4 flex flex-col items-center gap-2">
                <IconAvatar icon={user.emoji} size="md" />
                <div className="text-center">
                  <p className="text-yellow-300 font-bold text-sm leading-tight">{user.nome}</p>
                  <p className="text-yellow-500 text-xs mt-0.5 truncate max-w-[160px]">{user.email}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${
                  user.permissao === "Admin"
                    ? "bg-amber-400 text-amber-950"
                    : "bg-yellow-100 text-yellow-900"
                }`}>
                  {user.permissao === "Admin" ? "Administrador" : "Pesquisador(a)"}
                </span>
              </div>
              <div className="px-3 py-3 flex flex-col gap-2">
                <button
                  onClick={goToPerfil}
                  role="menuitem"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors"
                >
                  <UserPen size={14} /> Editar perfil
                </button>
                <button
                  onClick={onLogout}
                  role="menuitem"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} /> Sair da conta
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
