import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: () => "/" }),
}));

vi.mock("@/app/hooks/useAuth", () => ({
  saveAuthUser: vi.fn(),
}));

const { default: LoginPage } = await import("@/app/login/page");

describe("Página de Login — integração", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it("renderiza campos de e-mail e senha", async () => {
    render(<LoginPage />);
    // A página usa Suspense; aguarda o form aparecer
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /e-mail/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("exibe erro quando credenciais são inválidas", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "E-mail ou senha inválidos." }),
    });

    render(<LoginPage />);
    await waitFor(() => screen.getByRole("textbox", { name: /e-mail/i }));

    fireEvent.change(screen.getByRole("textbox", { name: /e-mail/i }), {
      target: { value: "errado@email.com" },
    });
    // campo senha não tem role textbox — usar querySelector
    const senhaInput = document.querySelector("#senha") as HTMLInputElement;
    fireEvent.change(senhaInput, { target: { value: "senhaerrada" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    });
  });

  it("tem link para a página de cadastro", async () => {
    render(<LoginPage />);
    await waitFor(() => screen.getByRole("link", { name: /cadastre-se/i }));
    expect(screen.getByRole("link", { name: /cadastre-se/i })).toHaveAttribute("href", "/register");
  });
});
