import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { billingHubSupabase } from "@/integrations/supabase/client";

const states = [
["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],
["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],
["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
] as const;
const options = [
  {value:"clinical_social_worker",label:"Clinical Social Worker (LCSW, LICSW, LISW)"},
  {value:"professional_counselor",label:"Professional Counselor (LPC, LCPC, LPCC)"},
  {value:"mental_health_counselor",label:"Mental Health Counselor (LMHC)"},
  {value:"marriage_family_therapist",label:"Marriage and Family Therapist (LMFT)"},
  {value:"psychologist",label:"Licensed Psychologist (PhD, PsyD)"},
  {value:"other",label:"Other independently licensed mental health therapist"},
] as const;
type Step = "identify"|"license"|"numbers"|"npi"|"done";
type Result = {ok?:boolean;sessionToken?:string;expiresInSeconds?:number;message?:string;error?:string};
const emailValid = (value:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function isNpi(value:string) {
  if(!/^\d{10}$/.test(value)) return false;
  const digits = ("80840"+value).split("").map(Number).reverse();
  return digits.reduce((sum,num,i) => sum + ((i%2===1) ? (num*2>9?num*2-9:num*2) : num),0)%10===0;
}
async function invoke(body:Record<string,unknown>):Promise<Result> {
  const {data,error}=await billingHubSupabase.functions.invoke("therapist-application",{body});
  if(error||!data?.ok) throw new Error(data?.message||data?.error||"We could not complete that step. Please try again.");
  return data as Result;
}
export default function TherapistApplication() {
  const [step,setStep]=useState<Step>("identify");
  const [email,setEmail]=useState("");
  const [token,setToken]=useState("");
  const [session,setSession]=useState("");
  const [pending,setPending]=useState(false);
  const [notice,setNotice]=useState("");
  const [license,setLicense]=useState("");
  const [selected,setSelected]=useState<string[]>([]);
  const [numbers,setNumbers]=useState<Record<string,string>>({});
  const [filter,setFilter]=useState("");
  const [hasNpi,setHasNpi]=useState<"yes"|"no"|"" >("");
  const [npi,setNpi]=useState("");
  useEffect(()=>{
    const invite=new URLSearchParams(window.location.search).get("invite")||"";
    if(invite.length<160) setToken(invite);
  },[]);
  const names = useMemo(()=>new Map<string,string>(states as unknown as [string,string][]),[]);
  const visibleStates=states.filter(([,name])=>name.toLowerCase().includes(filter.toLowerCase()));
  const toggle=(code:string)=>setSelected(prev=>prev.includes(code)?prev.filter(x=>x!==code):[...prev,code]);
  const act=async(action:"verify"|"request")=>{
    setNotice("");
    if(!emailValid(email.trim())) {setNotice("Enter the email address you used on the ValorWell clinician interest form.");return;}
    setPending(true);
    try {
      const res=await invoke({action,email:email.trim().toLowerCase(),inviteToken:token||undefined});
      if(action==="verify" && res.sessionToken) {
        setSession(res.sessionToken);
        setStep("license");
        // Remove the one-time secret from URL after exchange.
        window.history.replaceState({}, "", "/therapistapplication");
      } else {
        setNotice("If that email matches an interest registration, we will send a secure link to continue.");
      }
    } catch(e) {setNotice(e instanceof Error?e.message:"Unable to verify right now.");}
    finally {setPending(false);}
  };
  const nextLicense=()=>{
    if(!license) {setNotice("Select your general licensure type.");return;}
    if(!selected.length) {setNotice("Choose at least one state where you are licensed.");return;}
    setNotice("");setStep("numbers");
  };
  const nextNumbers=()=>{
    if(selected.some(state=>!numbers[state]?.trim()||numbers[state].trim().length>100)){
      setNotice("Enter a license number for each selected state.");return;
    }
    setNotice("");setStep("npi");
  };
  const save=async()=>{
    if(!hasNpi) {setNotice("Tell us whether you have an NPI number.");return;}
    if(hasNpi==="yes"&&!isNpi(npi.trim())) {setNotice("Enter a valid 10-digit NPI number.");return;}
    setNotice("");setPending(true);
    try {
      await invoke({action:"save",sessionToken:session,licenseType:license,licensedStates:selected,
        licenseNumbers:Object.fromEntries(selected.map(st=>[st,numbers[st].trim()])),
        hasNpi:hasNpi==="yes",npi:hasNpi==="yes"?npi.trim():null});
      setSession("");setStep("done");
    }catch(e){setNotice(e instanceof Error?e.message:"Could not save your answers. Try again.");}
    finally{setPending(false);}
  };
  const btn="min-h-11 rounded-md px-6 py-3 font-semibold transition disabled:opacity-60";
  return <Layout>
    <Helmet><title>Therapist Application | ValorWell</title><meta name="robots" content="noindex,nofollow"/></Helmet>
    <main className="min-h-[70vh] bg-[#F4F1E8] py-12 text-[#111814] sm:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-sm font-bold uppercase tracking-widest text-[#3B5147]">ValorWell clinicians</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Your therapist application</h1>
        <p className="mt-3 text-base text-[#3B5147]">Just a few professional details. You can complete this in a couple of minutes.</p>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-9">
          {step!=="identify"&&step!=="done"&&<div className="mb-8"><p className="mb-2 text-sm font-semibold text-[#3B5147]">Step {step==="license"?1:step==="numbers"?2:3} of 3</p><div className="h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-[#3B5147]" style={{width:step==="license"?"33.33%":step==="numbers"?"66.67%":"100%"}}/></div></div>}
          {step==="identify"&&<form onSubmit={e=>{e.preventDefault();void act(token?"verify":"request");}} className="space-y-5">
            <div><h2 className="text-xl font-bold">Confirm your email address</h2><p className="mt-2 text-sm text-gray-600">Enter the same email you used when you raised your hand on our clinician page. For security, we'll check your invitation.</p></div>
            <div><label className="mb-2 block font-semibold" htmlFor="ta-email">Email address</label><input id="ta-email" type="email" required autoComplete="email" maxLength={255} className="w-full rounded-md border border-gray-300 p-3" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <button type="submit" disabled={pending} className={btn+" w-full bg-[#3B5147] text-white"}>{pending?"Checking…":token?"Continue securely":"Email me a secure link"}</button>
          </form>}
          {step==="license"&&<div className="space-y-5">
            <div><h2 className="text-xl font-bold">Licensure</h2><p className="mt-2 text-sm text-gray-600">Select your general mental health license type and every state where you currently hold a license to practice.</p></div>
            <div><label className="mb-2 block font-semibold" htmlFor="ta-license">General licensure type</label>
              <select id="ta-license" className="w-full rounded-md border border-gray-300 bg-white p-3" value={license} onChange={e=>setLicense(e.target.value)}>
                <option value="">Select licensure type…</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <fieldset><legend className="mb-2 font-semibold">States where you are licensed</legend>
              <input type="search" aria-label="Search states" placeholder="Search states…" className="mb-3 w-full rounded-md border border-gray-300 p-3" value={filter} onChange={e=>setFilter(e.target.value)}/>
              {selected.length>0&&<p className="mb-2 text-sm text-[#3B5147]">{selected.length} selected: {selected.map(c=>names.get(c)).join(", ")}</p>}
              <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-md border border-gray-200 p-2 sm:grid-cols-2">{visibleStates.map(([code,name])=><label key={code} className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-[#F4F1E8]"><input type="checkbox" checked={selected.includes(code)} onChange={()=>toggle(code)} className="h-4 w-4 accent-[#3B5147]"/>{name}</label>)}</div>
            </fieldset><button type="button" className={btn+" w-full bg-[#3B5147] text-white"} onClick={nextLicense}>Continue</button>
          </div>}
          {step==="numbers"&&<div className="space-y-5">
            <h2 className="text-xl font-bold">License numbers by state</h2>
            <p className="text-sm text-gray-600">Enter your license number for each state you selected. You do not need to choose your license type again.</p>
            {selected.map(code=><div key={code}><label className="mb-2 block font-semibold" htmlFor={"ta-number-"+code}>{names.get(code)} license number</label><input id={"ta-number-"+code} type="text" required maxLength={100} autoComplete="off" className="w-full rounded-md border border-gray-300 p-3" value={numbers[code]||""} onChange={e=>setNumbers(prev=>({...prev,[code]:e.target.value}))}/></div>)}
            <div className="flex gap-3"><button type="button" className={btn+" border border-gray-300"} onClick={()=>{setNotice("");setStep("license")}}>Back</button><button type="button" className={btn+" flex-1 bg-[#3B5147] text-white"} onClick={nextNumbers}>Continue</button></div>
          </div>}
          {step==="npi"&&<div className="space-y-5">
            <h2 className="text-xl font-bold">National Provider Identifier (NPI)</h2>
            <fieldset><legend className="mb-3 font-semibold">Do you have an NPI number?</legend>
              <div className="flex gap-6">{(["yes","no"] as const).map(v=><label key={v} className="flex cursor-pointer items-center gap-2"><input type="radio" name="hasNpi" checked={hasNpi===v} onChange={()=>setHasNpi(v)}/> {v==="yes"?"Yes":"No"}</label>)}</div>
            </fieldset>
            {hasNpi==="yes"&&<div><label htmlFor="ta-npi" className="mb-2 block font-semibold">NPI number</label><input id="ta-npi" type="text" required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} className="w-full rounded-md border border-gray-300 p-3" value={npi} onChange={e=>setNpi(e.target.value.replace(/\D/g,""))}/><p className="mt-2 text-sm text-gray-600">10 digits</p></div>}
            <div className="flex gap-3"><button type="button" className={btn+" border border-gray-300"} onClick={()=>{setNotice("");setStep("numbers")}}>Back</button><button type="button" disabled={pending} className={btn+" flex-1 bg-[#3B5147] text-white"} onClick={()=>void save()}>{pending?"Saving…":"Submit"}</button></div>
          </div>}
          {step==="done"&&<div role="status" className="py-9 text-center"><h2 className="text-2xl font-bold">Your details were saved.</h2><p className="mt-3 text-gray-600">Thank you for taking this next step with ValorWell.</p></div>}
          {notice&&<p role="alert" className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">{notice}</p>}
        </div>
      </div>
    </main>
  </Layout>;
}
