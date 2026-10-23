export const APPLICATION_URL = "https://valorwell.org/therapistapplication";
const escapes = (value:string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
export function applicationReminderContent(step:2|3,firstName:string|null) {
 const greeting=firstName?"Hi "+firstName.trim()+",":"Hi,";
 const subject=step===2
  ?"A quick reminder about your ValorWell therapist application"
  :"Final reminder: your ValorWell therapist application";
 const paragraphs=step===2?[
   greeting,
   "Thank you again for your interest in joining ValorWell. The next step is to complete your professional application so we can review your qualifications.",
   "It starts with your licensure information and continues through a short professional profile. You can save your progress and return when convenient.",
   "Continue your application: "+APPLICATION_URL,
   "Use the same email address you provided when expressing interest. You'll receive a one-time verification code.",
   "If you've already begun, there's nothing more you need to do in response to this email.",
   "The ValorWell Team",
 ]:[
   greeting,
   "This is our final reminder about completing your ValorWell therapist application.",
   "If you're still interested, we'd welcome the opportunity to review your qualifications. Completing the application is the next step before consideration for an interview.",
   "Complete your application: "+APPLICATION_URL,
   "Use the email address from your original interest registration. Your progress can be saved as you go.",
   "We won't send additional reminders about this interest registration. You're welcome to return whenever the timing is right.",
   "The ValorWell Team",
 ];
 const html=paragraphs.map(p=>"<p>"+escapes(p).replace(APPLICATION_URL,
 '<a href="'+APPLICATION_URL+'">'+APPLICATION_URL+"</a>")+"</p>").join("");
 return {subject,text:paragraphs.join("\n\n"),html};
}
