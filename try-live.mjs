import {checkExercise} from "./curriculum.mjs";

const ENDPOINT="https://inference-api.openserv.ai/v1/chat/completions";

// This function is called ONLY by a server-authorized endpoint.
// It accepts the bounded lesson builder schema, never arbitrary URLs or credentials.
export async function executeLearnerRequest({input,apiKey,fetchImpl=fetch,timeoutMs=30000}){
  if(typeof apiKey!=="string"||apiKey.length<12)throw new Error("SERV API is not configured.");
  const assessment=checkExercise("build",input);
  if(!assessment.passed)throw new Error(assessment.feedback);
  const controller=new AbortController();
  const started=performance.now();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetchImpl(ENDPOINT,{
      method:"POST",
      headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
      body:JSON.stringify({
        ...assessment.request,
        // Explicit test budget: a hard response ceiling for paid example requests.
        max_completion_tokens:800
      }),
      signal:controller.signal
    });
    if(!response.ok)throw new Error("SERV returned HTTP "+response.status+".");
    const result=await response.json();
    const choice=result?.choices?.[0];
    if(choice?.finish_reason!=="stop"||typeof choice.message?.content!=="string"||!choice.message.content.trim())
      throw new Error("SERV did not return a complete text response.");
    if(choice.message.content.length>6000)throw new Error("SERV response exceeded the demonstration display limit.");
    return {
      mode:"live-serv-request",
      status:"completed",
      response:choice.message.content.trim(),
      model:result.model??assessment.request.model,
      completion_id:result.id??null,
      latency_ms:Math.round(performance.now()-started),
      observed_at:new Date().toISOString(),
      usage:{
        input_tokens:result.usage?.prompt_tokens??null,
        output_tokens:result.usage?.completion_tokens??null
      },
      note:"Real SERV API response, not a recorded example. User input was transmitted to OpenServ."
    };
  }catch(error){
    if(controller.signal.aborted)throw new Error("SERV test request timed out.");
    throw error;
  }finally{clearTimeout(timer);}
}
