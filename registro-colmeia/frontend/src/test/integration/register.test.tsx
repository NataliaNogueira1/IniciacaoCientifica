import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const { default: RegisterPage } = await import("@/app/register/page");

describe("Página de Cadastro — integração", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // mock do fetch de colmeias
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ nome: "SENAI-SOR-1", cidade: "Florianópolis" }]),
    });
  });

  it("renderiza o botão de criar conta", async () => {
    render(<RegisterPage />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument()
    );
  });

  it("valida nome com menos de 2 caracteres", async () => {
    render(<RegisterPage />);
    await waitFor(() => screen.getByRole("button", { name: /criar conta/i }));

    fireEvent.change(document.querySelector("#nome") as HTMLElement, { target: { value: "A" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/nome deve ter pelo menos 2/i);
    });
  });

  it("valida e-mail inválido", async () => {
    render(<RegisterPage />);
    await waitFor(() => screen.getByRole("button", { name: /criar conta/i }));

    fireEvent.change(document.querySelector("#nome") as HTMLElement, { target: { value: "Natália" } });
    fireEvent.change(document.querySelector("#sobrenome") as HTMLElement, { target: { value: "Nogueira" } });
    fireEvent.change(document.querySelector("#cpf") as HTMLElement, { target: { value: "16205343045" } });
    fireEvent.change(document.querySelector("#dataNascimento") as HTMLElement, { target: { value: "2000-01-01" } });
    fireEvent.change(document.querySelector("#email") as HTMLElement, { target: { value: "emailinvalido" } });
    // Seleciona instituição para não travar antes do e-mail
    fireEvent.change(document.querySelector("#instituicao") as HTMLElement, { target: { value: "SENAI-SOR-1" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/e-mail válido/i);
    });
  });

  it("valida senhas que não coincidem", async () => {
    render(<RegisterPage />);
    await waitFor(() => screen.getByRole("button", { name: /criar conta/i }));

    fireEvent.change(document.querySelector("#nome") as HTMLElement, { target: { value: "Natália" } });
    fireEvent.change(document.querySelector("#sobrenome") as HTMLElement, { target: { value: "Nogueira" } });
    fireEvent.change(document.querySelector("#cpf") as HTMLElement, { target: { value: "16205343045" } });
    fireEvent.change(document.querySelector("#dataNascimento") as HTMLElement, { target: { value: "2000-01-01" } });
    fireEvent.change(document.querySelector("#email") as HTMLElement, { target: { value: "natalia@gmail.com" } });
    fireEvent.change(document.querySelector("#instituicao") as HTMLElement, { target: { value: "SENAI-SOR-1" } });
    fireEvent.change(document.querySelector("#senha") as HTMLElement, { target: { value: "abc123" } });
    fireEvent.change(document.querySelector("#confirmarSenha") as HTMLElement, { target: { value: "abc456" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/senhas não coincidem/i);
    });
  });

  it("formata CPF ao digitar", async () => {
    render(<RegisterPage />);
    await waitFor(() => document.querySelector("#cpf"));
    fireEvent.change(document.querySelector("#cpf") as HTMLElement, { target: { value: "16205343045" } });
    expect((document.querySelector("#cpf") as HTMLInputElement).value).toBe("162.053.430-45");
  });

  it("tem link para a página de login", async () => {
    render(<RegisterPage />);
    await waitFor(() => screen.getByRole("link", { name: /entrar/i }));
    expect(screen.getByRole("link", { name: /entrar/i })).toHaveAttribute("href", "/login");
  });
});
