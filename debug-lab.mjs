// TrySERV developer practice lab — learning-only and never contacts SERV.
// Scenarios are grounded in OpenServ's November 2026 published Chat Completions API.
export const CHAT_URL="https://inference-api.openserv.ai/v1/chat/completions";
const COMMON_MESSAGES=[
 {role:"system",content:"You are a concise assistant that explains technical concepts clearly."},
 {role:"user",content:"Explain when SERV Reasoning helps with ambiguous decisions."}
];
const SOURCE={
 title:"Official SERV Chat Completions reference",
 url:"https://docs.openserv.ai/serv-reasoning/api/chat-completions"
};
const CASES=[
 {
  id:"missing-instructions",category:"Request validation",
  title:"A request without instructions",
  symptom:"Your SERV request is rejected before it can answer.",
  task:"Find and correct the missing instruction in this HTTP request blueprint.",
  notes:"Every Chat Completions call through SERV needs a system or developer instruction.",
  source:SOURCE,
  starter:{
   endpoint:CHAT_URL,
   model:"gpt-5.4-mini",
   messages:[{role:"user",content:"Explain when SERV Reasoning is appropriate."}]
  }
 },
 {
  id:"wrong-endpoint",category:"API configuration",
  title:"A request pointed at the wrong server",
  symptom:"Your request is configured with the wrong Chat Completions endpoint.",
  task:"Correct the endpoint so this blueprint targets SERV Chat Completions.",
  notes:"A valid model and prompt cannot compensate for the wrong service URL.",
  source:SOURCE,
  starter:{
   endpoint:"https://example.com/v1/chat/completions",
   model:"gpt-5.4-mini",
   messages:COMMON_MESSAGES
  }
 },
 {
  id:"unknown-model",category:"Model selection",
  title:"A model that isn't in this lesson",
  symptom:"Your request uses a model name not supported by the TrySERV practice lab.",
  task:"Pick a verified SERV model from the options used in these lessons.",
  notes:"TrySERV tests the small models covered in its current curriculum, not the entire SERV model catalog.",
  source:{title:"Official SERV quickstart and model examples",url:"https://docs.openserv.ai/serv-reasoning/introduction"},
  starter:{
   endpoint:CHAT_URL,
   model:"imaginary-serv-model",
   messages:COMMON_MESSAGES
  }
 }
];
const AVAILABLE=new Set(["gpt-5.4-mini","gpt-5.4-nano"]);
export function debugCases(){
 return CASES.map(({id,category,title,symptom,task,notes,source,starter})=>({
  id,category,title,symptom,task,notes,source,starter:structuredClone(starter)
 }));
}
export function validateDebugBlueprint(id,config){
 if(!CASES.some(c=>c.id===id))throw new Error("Unknown practice scenario.");
 if(!config||typeof config!=="object"||Array.isArray(config))
  throw new Error("The request blueprint must be a JSON object.");
 const problems=[];
 if(typeof config.endpoint!=="string"||config.endpoint!==CHAT_URL)
  problems.push({field:"endpoint",message:"This is not the documented SERV Chat Completions endpoint.",hint:"Check the official HTTP example and its exact host and path."});
 if(typeof config.model!=="string"||!AVAILABLE.has(config.model))
  problems.push({field:"model",message:"The selected model is not supported in this learning lab.",hint:"Use a model from the current lesson: gpt-5.4-mini or gpt-5.4-nano."});
 if(!Array.isArray(config.messages)||config.messages.length<2||config.messages.length>8){
  problems.push({field:"messages",message:"Supply an array of at least two role/content messages.",hint:"Look at the system and user messages in the official API example."});
 }else{
  const messages=config.messages;
  if(messages.some(m=>!m||typeof m!=="object"||typeof m.role!=="string"||typeof m.content!=="string"||m.content.trim().length<3||m.content.length>500)){
   problems.push({field:"messages",message:"Each message needs a supported role and meaningful text.",hint:"Every message should have a role and nonempty content."});
  }else{
   const known=new Set(["system","developer","user","assistant"]);
   if(messages.some(m=>!known.has(m.role)))
    problems.push({field:"messages.role",message:"A message uses a role that is not valid for this exercise.",hint:"Use a system or developer role for stable instructions and a user role for the task."});
   if(!messages.some(m=>["system","developer"].includes(m.role)&&m.content.trim().length>=8))
    problems.push({field:"messages.instructions",message:"SERV requires an explicit system or developer instruction.",hint:"Provide a meaningful system or developer message describing the assistant's job."});
   if(!messages.some(m=>m.role==="user"&&m.content.trim().length>=8))
    problems.push({field:"messages.user",message:"A user task is required for this exercise.",hint:"Include a specific user message with the task to answer."});
  }
 }
 const source=CASES.find(c=>c.id===id).source;
 if(problems.length)return {passed:false,problems,reference:source,executed:false};
 return {
  passed:true,problems:[],reference:source,executed:false,
  note:"Validated against the TrySERV learning rules. No external API call has been made.",
  request:{
   method:"POST",url:CHAT_URL,
   headers:{"Authorization":"Bearer $SERV_API_KEY","Content-Type":"application/json"},
   body:{model:config.model,messages:config.messages}
  }
 };
}
