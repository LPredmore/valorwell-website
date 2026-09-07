import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicianInterestForm } from "./ClinicianInterestForm";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  keyNumber: 0,
  trackClinicianInterestRegistered: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  billingHubSupabase: {
    functions: { invoke: mocks.invoke },
  },
  createWebsiteSubmissionKey: () => `clinician-interest-${++mocks.keyNumber}`,
}));

vi.mock("@/lib/clinicianConversionTracking", () => ({
  trackClinicianInterestRegistered: mocks.trackClinicianInterestRegistered,
}));

function fillRequired(email = "Clinician@Example.com") {
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "Jordan" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "Taylor" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.click(
    screen.getByLabelText(/I agree to receive clinician onboarding/i),
  );
}

describe("ClinicianInterestForm", () => {
  beforeEach(() => {
    mocks.keyNumber = 0;
    mocks.invoke.mockResolvedValue({
      data: { ok: true, lifecycle: "invite_sent" },
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("collects only the initial interest fields", () => {
    render(<ClinicianInterestForm />);

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/I agree to receive clinician onboarding/i),
    ).toBeInTheDocument();

    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/license type/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/licensed state/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("validates required fields before invoking the function", async () => {
    render(<ClinicianInterestForm />);
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));

    expect(await screen.findByText("First name is required.")).toBeInTheDocument();
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
    expect(screen.getByText("Communication consent is required.")).toBeInTheDocument();
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(mocks.trackClinicianInterestRegistered).not.toHaveBeenCalled();
  });

  it("normalizes the email, provisions access, and tracks verified success", async () => {
    render(<ClinicianInterestForm />);
    fillRequired(" Clinician@Example.com ");
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));

    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
    expect(mocks.invoke).toHaveBeenCalledWith("register-clinician-interest", {
      body: {
        firstName: "Jordan",
        lastName: "Taylor",
        email: "clinician@example.com",
        communicationConsent: true,
        company: "",
        submissionKey: "clinician-interest-1",
      },
    });
    expect(mocks.trackClinicianInterestRegistered).toHaveBeenCalledOnce();
    expect(mocks.trackClinicianInterestRegistered).toHaveBeenCalledWith(
      "clinician-interest-1",
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      /You raised your hand. We'll take it from here./i,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      /Check your email for the next steps/i,
    );
  });

  it("shows a generic failure without exposing backend details or tracking a lead", async () => {
    mocks.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: "service_role secret failure" },
    });

    render(<ClinicianInterestForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not register your interest right now. Please try again.",
    );
    expect(screen.queryByText(/service_role/i)).not.toBeInTheDocument();
    expect(mocks.trackClinicianInterestRegistered).not.toHaveBeenCalled();
  });
});
