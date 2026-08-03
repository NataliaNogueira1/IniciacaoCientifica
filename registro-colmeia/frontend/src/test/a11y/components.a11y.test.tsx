import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import InputText from "@/app/components/InputText";
import SelectField from "@/app/components/SelectField";
import Button from "@/app/components/Button";

expect.extend(toHaveNoViolations);

describe("Acessibilidade — InputText", () => {
  it("não tem violações de acessibilidade no estado padrão", async () => {
    const { container } = render(
      <InputText label="Nome" id="nome" value="" onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("não tem violações quando exibe erro", async () => {
    const { container } = render(
      <InputText label="E-mail" id="email" type="email" error="E-mail inválido" value="" onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("não tem violações com showToggle (campo de senha)", async () => {
    const { container } = render(
      <InputText label="Senha" id="senha" type="password" showToggle value="" onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Acessibilidade — SelectField", () => {
  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <SelectField
        label="Colmeia"
        id="colmeia"
        placeholder="Selecione"
        value=""
        onChange={() => {}}
        options={[{ value: "COL-001", label: "COL-001" }]}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Acessibilidade — Button", () => {
  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Button title="Salvar" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("não tem violações quando desabilitado", async () => {
    const { container } = render(<Button title="Salvando…" disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
