import {describe,expect,it} from "vitest";
import {
  ALL_DISCLOSURES, PRE_INTERVIEW_DISCLOSURES,validateApplicantProfile,
  validateApplicantDisclosures,validateApplicantEmployment,validateApplicantAttestation
} from "./therapistProfessional";

describe("phase-gated professional application",()=>{
  it("uses 14 appropriate professional disclosures and 2 board-only disclosures",()=>{
    expect(ALL_DISCLOSURES).toHaveLength(22);
    expect(PRE_INTERVIEW_DISCLOSURES.map(q=>q.number)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,21,22]);
    expect(PRE_INTERVIEW_DISCLOSURES.some(q=>q.number>=15&&q.number<=20)).toBe(false);
  });
  it("requires honest completion of every applicable disclosure",()=>{
    const answers=Object.fromEntries(Array.from({length:14},(_,i)=>[String(i+1),{answer:false,explanation:""}]));
    expect(validateApplicantDisclosures({boardCertified:false,answers}).ok).toBe(true);
    expect(validateApplicantDisclosures({boardCertified:true,answers}).ok).toBe(false);
    expect(validateApplicantDisclosures({boardCertified:false,answers:{...answers,"12":{answer:true,explanation:""}}}).ok).toBe(false);
    expect(validateApplicantDisclosures({boardCertified:false,answers:{...answers,"12":{answer:true,explanation:"Context for manual review"}}}).ok).toBe(true);
  });
  it("saves verified contact details without requiring medical or demographic information",()=>{
    const good={firstName:"A",middleName:"",lastName:"Clinician",phone:"816-555-0100",taxonomy:"",languages:["English"]};
    expect(validateApplicantProfile(good).ok).toBe(true);
    expect(validateApplicantProfile({...good,languages:[]}).ok).toBe(false);
    expect(validateApplicantProfile({...good,taxonomy:"123"}).ok).toBe(false);
  });
  it("permits skipping work history, and validates supplied jobs",()=>{
    expect(validateApplicantEmployment({choice:"skip",entries:[]}).ok).toBe(true);
    expect(validateApplicantEmployment({choice:"resume",entries:[{employer:"Community Clinic",title:"Therapist",start:"2021",end:"",current:true}]}).ok).toBe(true);
    expect(validateApplicantEmployment({choice:"manual",entries:[{employer:"",title:"Therapist"}]}).ok).toBe(false);
  });
  it("requires a named final attestation",()=>{
    expect(validateApplicantAttestation({accepted:false,legalName:"Morgan Clinician"}).ok).toBe(false);
    expect(validateApplicantAttestation({accepted:true,legalName:"Morgan Clinician"}).ok).toBe(true);
  });
});
