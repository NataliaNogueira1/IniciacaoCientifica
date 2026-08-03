import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/app/components/Button";

describe("Button", () => {
  it("renderiza o título", () => {
    render(<Button title="Salvar" />);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("chama onClick ao clicar", () => {
    const handleClick = vi.fn();
    render(<Button title="Salvar" onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("fica desabilitado quando disabled=true", () => {
    render(<Button title="Salvar" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("não chama onClick quando desabilitado", () => {
    const handleClick = vi.fn();
    render(<Button title="Salvar" disabled onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
