"use client";

import React, { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ConfirmDialogProps {
  state: ConfirmState | null;
  onClose: () => void;
}

export function ConfirmDialog({ state, onClose }: ConfirmDialogProps) {
  if (!state) return null;

  const isDanger = state.variant !== "warning";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) { state.resolve(false); onClose(); } }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-yellow-950 px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <h2 className="text-yellow-300 font-bold text-sm">
            {state.title ?? "Confirmação"}
          </h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm text-gray-700">{state.message}</p>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={() => { state.resolve(true); onClose(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isDanger
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-amber-400 hover:bg-amber-500 text-yellow-950"
            }`}
          >
            {state.confirmLabel ?? "Confirmar"}
          </button>
          <button
            onClick={() => { state.resolve(false); onClose(); }}
            className="flex-1 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {state.cancelLabel ?? "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook para usar o confirm customizado
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const onClose = useCallback(() => setState(null), []);

  return { confirmState: state, onClose, confirm };
}
