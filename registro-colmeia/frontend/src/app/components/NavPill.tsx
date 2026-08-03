"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { House, BarChart2, Pencil } from "lucide-react";

type NavPage = "registro" | "dados" | "home";

interface NavPillProps {
  active: NavPage;
}

const ITEMS: { page: NavPage; icon: React.ReactNode; label: string; href: string }[] = [
  { page: "home",     icon: <House size={16} strokeWidth={2} />,     label: "Início",  href: "/" },
  { page: "registro", icon: <Pencil size={16} strokeWidth={2} />,    label: "Registro",href: "/" },
  { page: "dados",    icon: <BarChart2 size={16} strokeWidth={2} />, label: "Dados",   href: "/dados" },
];

export default function NavPill({ active }: NavPillProps) {
  const router = useRouter();

  return (
    <div
      className="flex items-center bg-white border-2 border-yellow-800 rounded-full p-1 gap-0.5 shadow"
      role="navigation"
      aria-label="Navegação principal"
    >
      {ITEMS.map((item) => {
        const isActive = item.page === active;
        return (
          <button
            key={item.page}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`
              relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
              ${isActive
                ? "bg-amber-400 text-yellow-950 shadow-inner scale-110"
                : "text-yellow-800 hover:bg-amber-100"
              }
            `}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}
