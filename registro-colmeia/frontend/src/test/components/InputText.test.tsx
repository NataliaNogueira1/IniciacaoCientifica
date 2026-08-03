import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InputText from "@/app/components/InputText";

describe("InputText", () => {
  it("renderiza o label e o input", () => {
    render(<InputText label="Nome" id="nome" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });

  it("exibe asterisco quando required=true", () => {
    render(<InputText label="Nome" id="nome" required value="" onChange={() => {}} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando error é fornecido", () => {
    render(<InputText label="Nome" id="nome" error="Campo obrigatório" value="" onChange={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("chama onChange ao digitar", () => {
    const handleChange = vi.fn();
    render(<InputText label="Nome" id="nome" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Natália" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("exibe botão de olho quando showToggle=true e type=password", () => {
    render(<InputText label="Senha" id="senha" type="password" showToggle value="" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /mostrar senha/i })).toBeInTheDocument();
  });

  it("alterna visibilidade da senha ao clicar no olho", () => {
    render(<InputText label="Senha" id="senha" type="password" showToggle value="abc" onChange={() => {}} />);
    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: /mostrar senha/i }));
    expect(input).toHaveAttribute("type", "text");
  });

  it("não exibe botão de olho quando showToggle não está definido", () => {
    render(<InputText label="Senha" id="senha" type="password" value="" onChange={() => {}} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
