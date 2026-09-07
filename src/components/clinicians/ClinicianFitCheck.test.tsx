import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicianFitCheck } from "./ClinicianFitCheck";

vi.mock("@/lib/tracking", () => ({
  trackHomeEvent: vi.fn(),
}));

describe("ClinicianFitCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("reveals the positive result at four agreements", () => {
    const onApply = vi.fn();
    render(<ClinicianFitCheck onApply={onApply} />);

    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "I Agree" }));
    }
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "I Don't Agree" }));
    }

    expect(
      screen.getByRole("heading", {
        name: "ValorWell may fit the way you want to practice.",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("shows the alternate result below a majority and still permits applying", () => {
    const onApply = vi.fn();
    render(<ClinicianFitCheck onApply={onApply} />);

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "I Agree" }));
    }
    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "I Don't Agree" }));
    }

    expect(
      screen.getByRole("heading", {
        name: "ValorWell may not be the environment you're looking for—and that's okay.",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Still Interested? Apply Anyway" }),
    );
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("lets a high-intent clinician skip directly to the application", () => {
    const onApply = vi.fn();
    render(<ClinicianFitCheck onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: "Skip to Apply" }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("allows a previous principle to be revisited", () => {
    render(<ClinicianFitCheck onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "I Agree" }));
    expect(screen.getByText("02 / 07")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("01 / 07")).toBeInTheDocument();
  });
});
