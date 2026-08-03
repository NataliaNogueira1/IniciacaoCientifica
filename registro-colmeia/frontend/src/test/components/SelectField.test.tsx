import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectField from "@/app/components/SelectField";

const OPTIONS = [
  { value: "ABUNDANTE", label: "Abundante" },
  { value: "BAIXO", label: "Baixo" },
];

describe("SelectField", () => {
  it("renderiza o label e o select", () => {
    render(<SelectField label="Comida" id="comida" value="" onChange={() => {}} options={OPTIONS} />);
    expect(screen.getByLabelText("Comida")).toBeInTheDocument();
  });

  it("renderiza todas as opções incluindo placeholder", () => {
    render(<SelectField label="Comida" id="comida" placeholder="Selecione" value="" onChange={() => {}} options={OPTIONS} />);
    expect(screen.getByText("Selecione")).toBeInTheDocument();
    expect(screen.getByText("Abundante")).toBeInTheDocument();
    expect(screen.getByText("Baixo")).toBeInTheDocument();
  });

  it("chama onChange ao selecionar uma opção", () => {
    const handleChange = vi.fn();
    render(<SelectField label="Comida" id="comida" value="" onChange={handleChange} options={OPTIONS} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ABUNDANTE" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("exibe asterisco quando required=true", () => {
    render(<SelectField label="Comida" id="comida" required value="" onChange={() => {}} options={OPTIONS} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
