import {describe,expect,it} from "vitest";
import {applicationReminderContent} from "../../supabase/functions/_shared/therapistReminderContent";

describe("therapist application reminder campaign",()=>{
  const link="https://valorwell.org/therapistapplication";
  it("both reminder messages point only to the application, not the interview scheduler",()=>{
    for (const step of [2,3] as const) {
      const message=applicationReminderContent(step,"Taylor");
      expect(message.text).toContain(link);
      expect(message.html).toContain('<a href="'+link+'">');
      expect(message.text).not.toContain("/clinicians/interview");
      expect(message.text).not.toContain("calendly.com");
      expect(message.html).not.toContain("/clinicians/interview");
    }
  });
  it("retains two distinct, professional steps and a final reminder promise",()=>{
    const first=applicationReminderContent(2,"A");
    const last=applicationReminderContent(3,"A");
    expect(first.subject).not.toEqual(last.subject);
    expect(first.text).toContain("The ValorWell Team");
    expect(last.text).toContain("final reminder");
    expect(last.text).toContain("won't send additional reminders");
    expect(first.text).toContain("one-time verification code");
  });
  it("never renders user-provided names as HTML",()=>{
    const message=applicationReminderContent(2,'<script>alert("test")</script>');
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
  });
});
