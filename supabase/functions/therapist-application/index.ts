import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const TENANT="00000000-0000-0000-0000-000000000001";
const BASE="https://valorwell.org/therapistapplication";
const CORS={"Access-Control-Allow-Origin":"https://valorwell.org","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info, x-cron-secret","Access-Control-Allow-Methods":"POST, OPTIONS"};
const LICENSES=new Set(["clinical_social_worker","professional_counselor","mental_health_counselor","marriage_family_therapist","psychologist","other"]);
const STATES=new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const LIMIT=10;
function respond(status:number,body:Record<string,unknown>){return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...CORS}});}
function emailOf(v:unknown){return String(v||"").trim().toLowerCase();}
function emailOK(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=255;}
function secureToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");}
async function hash(s:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");}
function npiOK(v:string){
  if(!/^\d{10}$/.test(v))return false;
  return ("80840"+v).split("").map(Number).reverse().reduce((sum,n,i)=>{const m=i%2?2*n:n;return sum+(m>9?m-9:m);},0)%10===0;
}
function db(){const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!url||!key)throw new Error("Database configuration is unavailable");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
function inPast(minutes:number){return new Date(Date.now()-minutes*60_000).toISOString();}
function future(minutes:number){return new Date(Date.now()+minutes*60_000).toISOString();}
function isApp(row:any){return row?.submission_type==="clinician_application"&&row?.source_system==="website"&&row?.consent===true&&row?.payload?.source==="clinician_interest_form";}
async function findSubmission(client:any,email:string){
  const {data,error}=await client.from("website_submissions").select("id,tenant_id,provider_applicant_id,submission_type,source_system,consent,payload,status")
    .eq("tenant_id",TENANT).eq("submission_type","clinician_application").eq("source_system","website")
    .contains("payload",{email}).order("created_at",{ascending:false}).limit(10);
  if(error)throw new Error("Email lookup is unavailable");
  return (data||[]).find((s:any)=>isApp(s)&&emailOf(s.payload?.email)===email)??null;
}
async function requestLink(client:any,input:any){
  const email=emailOf(input.email);
  if(!emailOK(email))return respond(200,{ok:true,message:"If the address matches a ValorWell interest registration, a secure link will be emailed."});
  const record=await findSubmission(client,email);
  if(!record||record.payload?.therapist_qualification?.completed_at)return respond(200,{ok:true});
  const {data:old,error:oldError}=await client.from("therapist_application_invites").select("*")
    .eq("submission_id",record.id).maybeSingle();
  if(oldError)throw new Error("Invitation lookup failed");
  if(old && new Date(old.last_requested_at).getTime()>Date.now()-15*60_000)return respond(200,{ok:true});
  const invite={tenant_id:TENANT,submission_id:record.id,email,invite_token:secureToken(),expires_at:future(7*24*60),used_at:null,email_status:"queued",email_attempts:0,next_attempt_at:new Date().toISOString(),last_requested_at:new Date().toISOString(),updated_at:new Date().toISOString(),email_sent_at:null};
  const {error}=await client.from("therapist_application_invites").upsert(invite,{onConflict:"submission_id"});
  if(error)throw new Error("Could not arrange the secure email");
  return respond(200,{ok:true});
}
async function verify(client:any,input:any){
  const email=emailOf(input.email),token=String(input.inviteToken||"");
  if(!emailOK(email)||!/^[a-f0-9]{64}$/.test(token))return respond(403,{ok:false,message:"This invitation is invalid or expired. Request a new link."});
  const {data,error}=await client.from("therapist_application_invites")
    .update({used_at:new Date().toISOString(),updated_at:new Date().toISOString()})
    .eq("tenant_id",TENANT).eq("email",email).eq("invite_token",token).is("used_at",null)
    .gt("expires_at",new Date().toISOString())
    .select("id,submission_id,email").maybeSingle();
  if(error||!data)return respond(403,{ok:false,message:"This invitation is invalid or expired. Request a new link."});
  const {data:source,error:srcError}=await client.from("website_submissions").select("id,submission_type,source_system,consent,payload")
    .eq("id",data.submission_id).eq("tenant_id",TENANT).maybeSingle();
  if(srcError||!source||!isApp(source)||emailOf(source.payload?.email)!==email)return respond(403,{ok:false,message:"This invitation cannot be used."});
  const sessionToken=secureToken();
  const {error:saveError}=await client.from("therapist_application_sessions")
    .insert({token_hash:await hash(sessionToken),invite_id:data.id,expires_at:future(45)});
  if(saveError)throw new Error("Could not begin a secure session");
  return respond(200,{ok:true,sessionToken,expiresInSeconds:2700});
}
async function save(client:any,input:any){
  const secret=String(input.sessionToken||"");
  if(!/^[a-f0-9]{64}$/.test(secret))return respond(401,{ok:false,message:"Your session has expired. Use a new email link."});
  const {data:s,error:sError}=await client.from("therapist_application_sessions").select("invite_id,expires_at")
    .eq("token_hash",await hash(secret)).gt("expires_at",new Date().toISOString()).maybeSingle();
  if(sError||!s)return respond(401,{ok:false,message:"Your session has expired. Use a new email link."});
  const {data:i,error:iError}=await client.from("therapist_application_invites").select("submission_id,email,tenant_id")
    .eq("id",s.invite_id).eq("tenant_id",TENANT).maybeSingle();
  if(iError||!i)return respond(401,{ok:false,message:"Session is unavailable."});
  const licenseType=String(input.licenseType||"");
  const selected=input.licensedStates;
  const nums=input.licenseNumbers;
  if(!LICENSES.has(licenseType)||!Array.isArray(selected)||selected.length<1||selected.length>51||
    selected.some((v:any)=>typeof v!=="string"||!STATES.has(v))||new Set(selected).size!==selected.length||
    !nums||typeof nums!=="object"||Array.isArray(nums)||Object.keys(nums).length!==selected.length||
    selected.some((v:string)=>typeof nums[v]!=="string"||!nums[v].trim()||nums[v].trim().length>100)||
    Object.keys(nums).some(v=>!selected.includes(v)))return respond(422,{ok:false,message:"Check your license and state details."});
  if(typeof input.hasNpi!=="boolean")return respond(422,{ok:false,message:"Please indicate whether you have an NPI."});
  const hasNpi=input.hasNpi;
  const npi=hasNpi?String(input.npi||"").trim():null;
  if(hasNpi&&!npiOK(npi||""))return respond(422,{ok:false,message:"Enter a valid 10-digit NPI."});
  const {data:record,error:recError}=await client.from("website_submissions").select("*")
    .eq("id",i.submission_id).eq("tenant_id",TENANT).maybeSingle();
  if(recError||!record||!isApp(record)||emailOf(record.payload?.email)!==i.email)return respond(404,{ok:false,message:"Your interest registration could not be found."});
  const details={license_type:licenseType,licensed_states:selected,license_numbers:Object.fromEntries(selected.map((v:string)=>[v,nums[v].trim()])),has_npi:hasNpi,npi,completed_at:new Date().toISOString()};
  // Add qualification details to the authoritative website submission; never overwrite the initial identity.
  const updatedPayload={...record.payload,therapist_qualification:details};
  const {error:updatedError}=await client.from("website_submissions")
    .update({payload:updatedPayload,status:"reviewing",updated_at:new Date().toISOString()})
    .eq("id",record.id).eq("tenant_id",TENANT);
  if(updatedError)throw new Error("Could not save your qualification details");
  // Link an existing CRM profile if present. Do not create staff accounts, change statuses,
  // or enroll the currently paused Invitation to Interview campaign.
  if(!record.provider_applicant_id){
    const {data:matches,error:matchError}=await client.from("provider_applicants").select("id,email,application_data,converted_staff_id")
      .eq("tenant_id",TENANT).ilike("email",i.email).order("created_at",{ascending:false}).limit(5);
    if(!matchError){
      const matched=(matches||[]).find((v:any)=>emailOf(v.email)===i.email&&!v.converted_staff_id);
      if(matched){
        await client.from("provider_applicants").update({
          license_type:licenseType,target_states:selected,primary_state:selected[0],
          application_data:{...(matched.application_data||{}),therapist_qualification:details},updated_at:new Date().toISOString()
        }).eq("id",matched.id).eq("tenant_id",TENANT);
        await client.from("website_submissions").update({provider_applicant_id:matched.id,status:"routed"}).eq("id",record.id);
      }
    }
  }
  await client.from("therapist_application_sessions").delete().eq("token_hash",await hash(secret));
  return respond(200,{ok:true,message:"Saved"});
}
function sender(value:string,name:string){
  const clean=value.trim().replace(/[<>\r\n]/g,"");
  const label=name.trim().replace(/[<>\r\n]/g,"");
  return label?label+" <"+clean+">":clean;
}
async function sendOutbox(client:any){
  const key=Deno.env.get("RESEND_API_KEY");
  if(!key)throw new Error("Resend transport is not configured");
  const {data:settings,error:settingsError}=await client.from("crm_resend_email_settings")
    .select("from_name,from_email,reply_to_email,connection_status").eq("tenant_id",TENANT).maybeSingle();
  if(settingsError||!settings||settings.connection_status!=="connected"||!settings.from_email)throw new Error("Resend sender is not connected");
  const {data:jobs,error}=await client.from("therapist_application_invites").select("*")
    .eq("tenant_id",TENANT).in("email_status",["queued","failed"])
    .lte("next_attempt_at",new Date().toISOString()).gt("expires_at",new Date().toISOString())
    .lt("email_attempts",LIMIT).order("created_at",{ascending:true}).limit(10);
  if(error)throw new Error("Outbox unavailable");
  let sent=0,failed=0;
  for(const job of jobs||[]){
    const {data:claim,error:claimError}=await client.from("therapist_application_invites")
      .update({email_status:"processing",email_attempts:job.email_attempts+1,updated_at:new Date().toISOString()})
      .eq("id",job.id).eq("email_status",job.email_status).eq("email_attempts",job.email_attempts).select("id").maybeSingle();
    if(claimError||!claim)continue;
    const url=BASE+"?invite="+encodeURIComponent(job.invite_token);
    const body="Thank you for expressing interest in joining ValorWell as a clinician. Please continue with a few brief professional qualification questions: "+url+"\n\nUse the same email address you provided on ValorWell.org/clinicians. This private link expires in 7 days.\n\nValorWell";
    try{
      const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{
        "Authorization":"Bearer "+key,"Content-Type":"application/json",
        "Idempotency-Key":"vw-therapist-next-"+job.id
      },body:JSON.stringify({from:sender(settings.from_email,settings.from_name||"ValorWell"),
        to:[job.email],reply_to:settings.reply_to_email||undefined,
        subject:"ValorWell — complete your brief clinician qualifications",
        text:body,html:'<div style="font:16px Arial,sans-serif;line-height:1.6"><p>Thank you for expressing interest in ValorWell.</p><p>We have a few short questions about your clinical licensure. No resume or documents are needed yet.</p><p><a href="'+url+'">Continue your therapist application</a></p><p>Enter the same email address you used on our website. This link expires in 7 days.</p><p>ValorWell</p></div>'})});
      if(!response.ok)throw new Error("Mail transport rejected message");
      await client.from("therapist_application_invites").update({
        email_status:"sent",email_sent_at:new Date().toISOString(),updated_at:new Date().toISOString()
      }).eq("id",job.id);
      sent++;
    }catch{
      const delay=Math.min(60,Math.pow(2,Math.min(job.email_attempts,6)));
      await client.from("therapist_application_invites").update({
        email_status:"failed",next_attempt_at:future(delay),updated_at:new Date().toISOString()
      }).eq("id",job.id);
      failed++;
    }
  }
  return respond(200,{ok:true,processed:sent+failed,sent,failed});
}
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:CORS});
  if(req.method!=="POST")return respond(405,{ok:false,message:"Method not allowed"});
  try{
    const input=await req.json().catch(()=>null);
    if(!input||typeof input!=="object")return respond(400,{ok:false,message:"Invalid request"});
    const client=db();
    if(input.action==="drain"){
      const supplied=req.headers.get("x-cron-secret")||"";
      const expected=Deno.env.get("CRON_SECRET")||"";
      if(!expected||supplied!==expected)return respond(403,{ok:false,message:"Forbidden"});
      return await sendOutbox(client);
    }
    if(input.action==="request")return await requestLink(client,input);
    if(input.action==="verify")return await verify(client,input);
    if(input.action==="save")return await save(client,input);
    return respond(400,{ok:false,message:"Unknown action"});
  }catch(e){
    console.error(JSON.stringify({function:"therapist-application",error:e instanceof Error?e.message:"unexpected"}));
    return respond(503,{ok:false,message:"This step is temporarily unavailable. Please try again."});
  }
});
