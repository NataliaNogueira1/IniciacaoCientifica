import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { ConfirmDialog, useConfirm } from "@/app/components/ConfirmDialog";

describe("useConfirm hook", () => {
  it("retorna null inicialmente", () => {
    const { result } = renderHook(() => useConfirm());
    expect(result.current.confirmState).toBeNull();
  });

  it("abre o diálogo ao chamar confirm()", async () => {
    const { result } = renderHook(() => useConfirm());
    act(() => { result.current.confirm({ message: "Confirmar?" }); });
    expect(result.current.confirmState).not.toBeNull();
    expect(result.current.confirmState?.message).toBe("Confirmar?");
  });
});

describe("ConfirmDialog componente", () => {
  it("não renderiza quando state=null", () => {
    const { container } = render(<ConfirmDialog state={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza a mensagem de confirmação", () => {
    const state = { message: "Desativar usuário?", resolve: vi.fn() };
    render(<ConfirmDialog state={state} onClose={() => {}} />);
    expect(screen.getByText("Desativar usuário?")).toBeInTheDocument();
  });

  it("chama resolve(true) ao confirmar", () => {
    const resolve = vi.fn();
    const onClose = vi.fn();
    const state = { message: "Confirmar?", resolve, confirmLabel: "Sim" };
    render(<ConfirmDialog state={state} onClose={onClose} />);
    fireEvent.click(screen.getByText("Sim"));
    expect(resolve).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
  });

  it("chama resolve(false) ao cancelar", () => {
    const resolve = vi.fn();
    const onClose = vi.fn();
    const state = { message: "Confirmar?", resolve };
    render(<ConfirmDialog state={state} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(resolve).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });
});
