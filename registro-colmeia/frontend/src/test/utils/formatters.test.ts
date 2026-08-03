import { describe, it, expect } from "vitest";

// ── formatCpf (de register/page.tsx) ────────────────────────────────────────
function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function cpfDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

describe("formatCpf", () => {
  it("formata CPF completo corretamente", () => {
    expect(formatCpf("16205343045")).toBe("162.053.430-45");
  });

  it("formata parcialmente 6 dígitos", () => {
    expect(formatCpf("162053")).toBe("162.053");
  });

  it("formata parcialmente 9 dígitos", () => {
    expect(formatCpf("162053430")).toBe("162.053.430");
  });

  it("remove caracteres não numéricos antes de formatar", () => {
    expect(formatCpf("162.053.430-45")).toBe("162.053.430-45");
  });

  it("limita a 11 dígitos", () => {
    expect(cpfDigits(formatCpf("162053430451234"))).toBe("16205343045");
  });
});

describe("cpfDigits", () => {
  it("extrai apenas os dígitos do CPF formatado", () => {
    expect(cpfDigits("162.053.430-45")).toBe("16205343045");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(cpfDigits("")).toBe("");
  });
});

// ── Validação de email ────────────────────────────────────────────────────────
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe("Validação de email", () => {
  it("aceita email válido", () => {
    expect(emailRe.test("natalia@gmail.com")).toBe(true);
    expect(emailRe.test("pesquisador@senai.sc.br")).toBe(true);
  });

  it("rejeita email sem @", () => {
    expect(emailRe.test("nataliagmail.com")).toBe(false);
  });

  it("rejeita email sem domínio", () => {
    expect(emailRe.test("natalia@")).toBe(false);
  });

  it("rejeita email vazio", () => {
    expect(emailRe.test("")).toBe(false);
  });

  it("rejeita email com espaços", () => {
    expect(emailRe.test("natalia @gmail.com")).toBe(false);
  });
});

// ── Validação de data de nascimento (>= 14 anos) ──────────────────────────────
function maxDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 14);
  return d.toISOString().slice(0, 10);
}

describe("Validação de data de nascimento", () => {
  it("maxDate retorna data no formato YYYY-MM-DD", () => {
    expect(maxDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("data de hoje é inválida (menos de 14 anos)", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(today > maxDate()).toBe(true);
  });

  it("data de 20 anos atrás é válida", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    expect(d.toISOString().slice(0, 10) <= maxDate()).toBe(true);
  });
});
