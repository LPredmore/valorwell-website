import { useState } from "react";
import { FileText, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  LANGUAGES, PRE_INTERVIEW_DISCLOSURES, type ApplicantDisclosures,
  type ApplicantEmployment, type ApplicantProfile, type Attestation, type Employment,
} from "@/lib/therapistProfessional";

const inputClass = "mt-2";
function Line({ label, value, onChange, required = false, placeholder = "", type = "text" }: {
  label: string; value: string; onChange: (value: string) => void;
  required?: boolean; placeholder?: string; type?: string;
}) {
  return <label className="block"><span className="text-sm font-medium text-foreground">{label}{required && " *"}</span>
    <Input className={inputClass} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
  </label>;
}
export const EMPTY_PROFILE: ApplicantProfile = { firstName: "",middleName:"",lastName:"",phone:"",taxonomy:"",languages:[] };
export const EMPTY_DISCLOSURES: ApplicantDisclosures = { boardCertified:null,answers:{} };
export const EMPTY_EMPLOYMENT: ApplicantEmployment = { choice:null,entries:[] };
export const EMPTY_ATTESTATION: Attestation = { accepted:false,legalName:"" };

export function ProfileQuestions({ value, onChange }: {value:ApplicantProfile;onChange:(v:ApplicantProfile)=>void}) {
  const set=(key:keyof ApplicantProfile)=>(v:string)=>onChange({...value,[key]:v});
  return <div className="space-y-6">
    <div><h2 className="text-xl font-bold">Professional contact details</h2>
      <p className="mt-2 text-sm text-muted-foreground">We already have your email. Please confirm how we should address and contact you.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Line label="First name" required value={value.firstName} onChange={set("firstName")}/>
      <Line label="Middle name (optional)" value={value.middleName} onChange={set("middleName")}/>
      <Line label="Last name" required value={value.lastName} onChange={set("lastName")}/>
      <Line label="Phone number" type="tel" required value={value.phone} onChange={set("phone")} placeholder="(555) 555-0100"/>
    </div>
    <div><h3 className="font-semibold">Languages you provide therapy in *</h3>
      <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{LANGUAGES.map(language =>
        <label key={language} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
          <input type="checkbox" checked={value.languages.includes(language)} onChange={()=>
            onChange({...value,languages:value.languages.includes(language)
              ?value.languages.filter(l=>l!==language):[...value.languages,language]})}/>
          {language}
        </label>)}</div>
    </div>
    <Line label="Healthcare taxonomy code (if known)" value={value.taxonomy} onChange={set("taxonomy")}
      placeholder="10-digit taxonomy code"/>
    <p className="text-xs text-muted-foreground">Not sure of your taxonomy code? Leave it blank; we can confirm it later. We will not ask for your SSN, date of birth, or medical information here.</p>
  </div>;
}

export function DisclosureQuestions({value,onChange}: {value:ApplicantDisclosures;onChange:(v:ApplicantDisclosures)=>void}) {
  const questions=PRE_INTERVIEW_DISCLOSURES.filter(q=>!q.showWhen || value.boardCertified===true);
  const answered=questions.filter(q=>typeof value.answers[String(q.number)]?.answer==="boolean").length;
  return <div className="space-y-5">
    <div><h2 className="text-xl font-bold">Professional disclosures</h2>
      <p className="mt-2 text-sm text-muted-foreground">Answer the questions below accurately. A Yes answer does not automatically disqualify you; it may simply require review. These relate to professional practice, not personal medical information.</p>
      <p className="mt-3 text-sm font-medium" aria-live="polite">{answered} of {questions.length} answered</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{width:String(Math.round(answered/questions.length*100))+"%"}}/></div>
    </div>
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-2 text-sm font-semibold">Do you currently hold a professional board certification?</legend>
      <div className="mt-2 flex gap-2">{[true,false].map(yes=>
        <label key={String(yes)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm">
          <input name="board-certified" type="radio" checked={value.boardCertified===yes}
            onChange={()=>onChange({...value,boardCertified:yes,answers:yes?value.answers:Object.fromEntries(Object.entries(value.answers).filter(([k])=>Number(k)<=14))})}/>
          {yes?"Yes":"No"}
        </label>)}</div>
    </fieldset>
    {questions.map((q,index)=>{
      const answer=value.answers[String(q.number)]??{answer:null,explanation:""};
      return <fieldset key={q.number} className="rounded-xl border border-border p-4">
        <legend className="max-w-full px-2 text-sm font-medium leading-6">{index+1}. {q.text}</legend>
        <p className="mb-2 text-xs text-muted-foreground">{q.category}</p>
        <div className="flex gap-3">{[false,true].map(yes=><label key={String(yes)}
          className={"flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm "+(answer.answer===yes?"border-primary bg-primary/5":"border-border")}>
          <input type="radio" name={"disclosure-"+q.number} checked={answer.answer===yes}
            onChange={()=>onChange({...value,answers:{...value.answers,[q.number]:{answer:yes,explanation:yes?answer.explanation:""}}})}/>
          {yes?"Yes":"No"}
        </label>)}</div>
        {answer.answer===true&&<label className="mt-3 block text-sm">
          Please briefly explain (required)
          <textarea rows={3} maxLength={2000} value={answer.explanation}
            className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm"
            onChange={e=>onChange({...value,answers:{...value.answers,[q.number]:{answer:true,explanation:e.target.value}}})}/>
        </label>}
      </fieldset>;
    })}
    <p className="text-xs text-muted-foreground">Separate credentialing disclosures may be requested after an offer. Your answers will be reviewed under the applicable professional and legal requirements.</p>
  </div>;
}

const emptyJob=():Employment=>({employer:"",title:"",start:"",end:"",city:"",state:"",summary:"",current:false});
function Job({entry,index,onChange,onRemove}: {entry:Employment;index:number;onChange:(e:Employment)=>void;onRemove:()=>void}) {
  const set=(key:keyof Employment)=>(v:string)=>onChange({...entry,[key]:v});
  return <div className="rounded-xl border border-border p-4">
    <div className="mb-4 flex justify-between"><h3 className="font-semibold">Position {index+1}</h3>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={"Remove position "+(index+1)}><Trash2 className="h-4 w-4"/></Button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <Line label="Employer" required value={entry.employer} onChange={set("employer")}/>
      <Line label="Job title" required value={entry.title} onChange={set("title")}/>
      <Line label="Start (month/year)" value={entry.start} onChange={set("start")}/>
      <Line label="End (month/year)" value={entry.end} onChange={set("end")}/>
      <Line label="City" value={entry.city} onChange={set("city")}/>
      <Line label="State" value={entry.state} onChange={set("state")}/>
    </div>
    <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={entry.current}
      onChange={e=>onChange({...entry,current:e.target.checked,end:e.target.checked?"":entry.end})}/> Current position</label>
    <label className="mt-3 block text-sm">Overview (optional)
      <textarea rows={2} maxLength={1000} value={entry.summary} onChange={e=>set("summary")(e.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm"/></label>
  </div>;
}

export function EmploymentQuestions({value,onChange,onParse,parsing}:{
  value:ApplicantEmployment;onChange:(v:ApplicantEmployment)=>void;onParse:(file:File)=>Promise<void>;parsing:boolean;
}) {
  const [uploadError,setUploadError]=useState("");
  const setJob=(index:number,entry:Employment)=>onChange({...value,entries:value.entries.map((e,i)=>i===index?entry:e)});
  return <div className="space-y-5">
    <h2 className="text-xl font-bold">Your experience (optional)</h2>
    <p className="text-sm text-muted-foreground">Your key qualifications are already captured. Add work history to give us helpful context, or skip for now. Uploading a résumé can save you the typing.</p>
    <div className="grid gap-3">
      <button type="button" onClick={()=>onChange({...value,choice:"resume"})}
        className={"rounded-xl border p-4 text-left "+(value.choice==="resume"?"border-primary bg-primary/5":"border-border")}>
        <UploadCloud className="mb-2 h-5 w-5"/><strong>Upload my résumé</strong>
        <p className="text-sm text-muted-foreground">AI-assisted extraction with your review before saving</p>
      </button>
      <button type="button" onClick={()=>onChange({...value,choice:"manual"})}
        className={"rounded-xl border p-4 text-left "+(value.choice==="manual"?"border-primary bg-primary/5":"border-border")}>
        <FileText className="mb-2 h-5 w-5"/><strong>Enter employment history myself</strong>
        <p className="text-sm text-muted-foreground">Add only the positions you want us to review.</p>
      </button>
      <button type="button" onClick={()=>onChange({choice:"skip",entries:[]})}
        className={"rounded-xl border p-4 text-left "+(value.choice==="skip"?"border-primary bg-primary/5":"border-border")}>
        <strong>Skip this step for now</strong>
        <p className="text-sm text-muted-foreground">You can provide details later if needed.</p>
      </button>
    </div>
    {value.choice==="resume"&&<div className="rounded-xl border border-border p-4">
      <Label htmlFor="ta-resume">Choose a résumé (PDF, DOCX or TXT, max 2 MB)</Label>
      <Input id="ta-resume" className="mt-2" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        disabled={parsing} onChange={async e=>{
          const file=e.target.files?.[0];if(!file)return;
          if(file.size>2*1024*1024){setUploadError("File must be under 2 MB.");return;}
          setUploadError("");
          try{await onParse(file)}catch(err){setUploadError(err instanceof Error?err.message:"Couldn't read the résumé; enter jobs manually or skip.")}
          e.target.value="";
        }}/>
      {parsing&&<p role="status" className="mt-3 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/> Extracting work history…</p>}
      {uploadError&&<p role="alert" className="mt-3 text-sm text-destructive">{uploadError}</p>}
      <p className="mt-2 text-xs text-muted-foreground">By uploading, you agree to have the document temporarily processed by our AI service to prefill your form. It will not decide your interview eligibility. The original file is not retained by ValorWell.</p>
    </div>}
    {value.choice!=="skip"&&value.choice!==null&&<div className="space-y-3">
      {value.entries.length>0&&<p className="text-sm font-medium">Review and edit every extracted position before saving. Missing details are left blank.</p>}
      {value.entries.map((entry,i)=><Job key={i} index={i} entry={entry}
        onChange={e=>setJob(i,e)} onRemove={()=>onChange({...value,entries:value.entries.filter((_,j)=>i!==j)})}/>)}
      <Button variant="outline" type="button" disabled={value.entries.length>=20}
        onClick={()=>onChange({...value,entries:[...value.entries,emptyJob()]})}><Plus className="mr-2 h-4 w-4"/> Add position</Button>
      {value.entries.length===0&&<p className="text-sm text-muted-foreground">No positions entered yet. You can add one or choose Skip.</p>}
    </div>}
  </div>;
}

export function ReviewQuestions({profile,disclosures,employment,attestation,onChange,licensedStates}:{
  profile:ApplicantProfile;disclosures:ApplicantDisclosures;employment:ApplicantEmployment;
  attestation:Attestation;onChange:(v:Attestation)=>void;licensedStates:string[];
}) {
  const disclosed=Object.values(disclosures.answers).filter(q=>q.answer===true).length;
  return <div className="space-y-5">
    <h2 className="text-xl font-bold">Review and submit</h2>
    <p className="text-sm text-muted-foreground">You've completed the professional application. Review your summary and attest that your answers are accurate. We will review your eligibility before sending any interview invitation.</p>
    <div className="rounded-xl bg-secondary/50 p-5 text-sm space-y-2">
      <p><strong>Name:</strong> {[profile.firstName,profile.middleName,profile.lastName].filter(Boolean).join(" ")}</p>
      <p><strong>Phone:</strong> {profile.phone}</p>
      <p><strong>Licensure:</strong> {licensedStates.join(", ")}</p>
      <p><strong>Languages:</strong> {profile.languages.join(", ")}</p>
      <p><strong>Professional disclosures:</strong> Completed, {disclosed} Yes answer(s) for review</p>
      <p><strong>Employment history:</strong> {employment.choice==="skip"?"Skipped for now":String(employment.entries.length)+" position(s)"}</p>
    </div>
    <Line label="Type your full legal name *" value={attestation.legalName}
      onChange={v=>onChange({...attestation,legalName:v})}/>
    <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm leading-6">
      <input type="checkbox" className="mt-1" checked={attestation.accepted}
        onChange={e=>onChange({...attestation,accepted:e.target.checked})}/>
      I attest that the information I provided is true, complete and accurate to the best of my knowledge.
    </label>
    <p className="text-xs text-muted-foreground">Submitting an application does not guarantee acceptance or an interview. Your application will not be used for automated medical/disability screening.</p>
  </div>;
}
