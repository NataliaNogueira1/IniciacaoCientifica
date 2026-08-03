import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import Toast, { useToast } from "@/app/components/Toast";

describe("useToast hook", () => {
  it("adiciona e remove toasts", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast.success("Salvo!"); });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Salvo!");
    expect(result.current.toasts[0].type).toBe("success");

    act(() => { result.current.removeToast(result.current.toasts[0].id); });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("suporta tipos error, warning e info", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.error("Erro");
      result.current.toast.warning("Aviso");
      result.current.toast.info("Info");
    });
    expect(result.current.toasts.map(t => t.type)).toEqual(["error", "warning", "info"]);
  });
});

describe("Toast componente", () => {
  it("não renderiza nada quando toasts está vazio", () => {
    const { container } = render(<Toast toasts={[]} onRemove={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza mensagem de toast", () => {
    const toasts = [{ id: "1", type: "success" as const, message: "Operação realizada!" }];
    render(<Toast toasts={toasts} onRemove={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Operação realizada!");
  });

  it("chama onRemove ao clicar no X", () => {
    const onRemove = vi.fn();
    const toasts = [{ id: "1", type: "error" as const, message: "Erro" }];
    render(<Toast toasts={toasts} onRemove={onRemove} />);
    screen.getByRole("button").click();
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
