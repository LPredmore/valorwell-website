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
  CLINICIAN_INTEREST_FORM_ID: "valorwell-clinician-interest",
  CLINICIAN_INTEREST_FORM_NAME: "valorwell_clinician_interest",
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
      data: { ok: true, result: "persisted", lifecycle: "interest_recorded" },
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("collects low-friction interest and optional consented mobile data", () => {
    const { container } = render(<ClinicianInterestForm />);
    expect(container.querySelector("form")).toHaveAttribute(
      "id", "valorwell-clinician-interest",
    );
    expect(container.querySelector("form")).toHaveAttribute(
      "name", "valorwell_clinician_interest",
    );

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/I agree to receive clinician onboarding/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/Mobile phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to receive recruiting follow-up text/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/license type/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/licensed state/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("requires a valid number for optional SMS and normalizes opted-in US numbers",async()=>{
    render(<ClinicianInterestForm/>);
    fillRequired();
    fireEvent.click(screen.getByLabelText(/I agree to receive recruiting follow-up text/i));
    fireEvent.click(screen.getByRole("button",{name:"Raise My Hand"}));
    expect(await screen.findByRole("alert")).toHaveTextContent(/valid US mobile phone number/i);
    expect(mocks.invoke).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Mobile phone/i),{target:{value:"(816) 555-0123"}});
    fireEvent.click(screen.getByRole("button",{name:"Raise My Hand"}));
    await waitFor(()=>expect(mocks.invoke).toHaveBeenCalledOnce());
    expect(mocks.invoke.mock.calls[0][1].body.phone).toBe("+18165550123");
    expect(mocks.invoke.mock.calls[0][1].body.smsConsent).toBe(true);
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
        phone: "",
        smsConsent: false,
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

  it("does not report a successful honeypot response as an Ads lead", async () => {
    const { container } = render(<ClinicianInterestForm />);
    fillRequired();
    const honeypot = container.querySelector<HTMLInputElement>("#clinician-company");
    expect(honeypot).not.toBeNull();
    fireEvent.change(honeypot!, { target: { value: "Bot company" } });
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));

    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledOnce());
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(mocks.trackClinicianInterestRegistered).not.toHaveBeenCalled();
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
      "We could not confirm your registration because our system is having trouble. Please try again in a few minutes.",
    );
    expect(screen.queryByText(/service_role/i)).not.toBeInTheDocument();
    expect(mocks.trackClinicianInterestRegistered).not.toHaveBeenCalled();
  });

  it("reuses the same submission key when the applicant retries after a failure", async () => {
    mocks.invoke.mockResolvedValueOnce({ data: null, error: { message: "504" } });
    render(<ClinicianInterestForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    const keys = mocks.invoke.mock.calls.map((c) => c[1].body.submissionKey);
    expect(keys).toEqual(["clinician-interest-1", "clinician-interest-1"]);
  });

  it("does not count an unconfirmed ok response as a lead", async () => {
    mocks.invoke.mockResolvedValueOnce({ data: { ok: true }, error: null });
    render(<ClinicianInterestForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mocks.trackClinicianInterestRegistered).not.toHaveBeenCalled();
  });

  it("tracks a verified duplicate as a confirmed registration", async () => {
    mocks.invoke.mockResolvedValueOnce({ data: { ok: true, result: "verified_duplicate" }, error: null });
    render(<ClinicianInterestForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(mocks.trackClinicianInterestRegistered).toHaveBeenCalledOnce();
  });

  it("starts a new key only when the server reports a key conflict", async () => {
    mocks.invoke
      .mockResolvedValueOnce({ data: { ok: false, result: "key_conflict", newKeyRequired: true, message: "Please submit again." }, error: null })
      .mockResolvedValueOnce({ data: { ok: true, result: "persisted" }, error: null });
    render(<ClinicianInterestForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Raise My Hand" }));
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    const keys = mocks.invoke.mock.calls.map((c) => c[1].body.submissionKey);
    expect(keys).toEqual(["clinician-interest-1", "clinician-interest-2"]);
  });
});
