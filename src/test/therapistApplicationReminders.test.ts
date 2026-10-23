import {describe,expect,it} from "vitest";
import {applicationReminderContent} from "../../supabase/functions/_shared/therapistReminderContent";
describe("CRM contacted application campaigns",()=>{
 const link="https://valorwell.org/therapistapplication";
 it("all three reminders use application rather than interview scheduler",()=>{
  for (const step of [2,3,4] as const) {
   const c=applicationReminderContent(step,"Taylor");
   expect(c.text).toContain(link);
   expect(c.html).toContain('<a href="'+link+'">');
   expect(c.text).not.toContain("/clinicians/interview");
   expect(c.html).not.toContain("calendly.com");
  }
 });
 it("distinguishes two business-day check-in, soft nudge, and final follow-up",()=>{
  const first=applicationReminderContent(2,"A");
  const soft=applicationReminderContent(3,"A");
  const last=applicationReminderContent(4,"A");
  expect(first.text).toContain("A couple of days ago");
  expect(soft.subject).toContain("Still interested");
  expect(last.text).toContain("last follow-up");
  expect(new Set([first.subject,soft.subject,last.subject]).size).toBe(3);
  expect(soft.text).not.toContain("final");
 });
 it("escapes names in HTML",()=>{
  const c=applicationReminderContent(2,'<script>alert("x")</script>');
  expect(c.html).not.toContain("<script>");
  expect(c.html).toContain("&lt;script&gt;");
 });
});
