// Browser-local lesson completion. This is progress guidance, not a credential.
export const LESSON_IDS=Object.freeze(["ecosystem","understand","decide","build"]);
export function normalizeProgress(value){
  const list=Array.isArray(value)?value:[];
  return LESSON_IDS.filter(id=>list.includes(id));
}
export function loadProgress(value){
  try{return normalizeProgress(JSON.parse(value??"[]"));}catch{return [];}
}
export function markLessonComplete(progress,id){
  const current=normalizeProgress(progress);
  if(!LESSON_IDS.includes(id))return {completed:current,newlyCompleted:false};
  const newlyCompleted=!current.includes(id);
  return {completed:normalizeProgress([...current,id]),newlyCompleted};
}

export const DEBUG_CASE_IDS=Object.freeze(["missing-instructions","wrong-endpoint","unknown-model"]);
export function debugProgressCount(value){
 const list=Array.isArray(value)?value:[];
 return DEBUG_CASE_IDS.filter(id=>list.includes(id)).length;
}
export function summaryProgress(lessons,debugCases){
 const lessonsCompleted=normalizeProgress(lessons).length;
 const repairsCompleted=debugProgressCount(debugCases);
 return {
  lessonsCompleted,
  lessonsTotal:LESSON_IDS.length,
  repairsCompleted,
  repairsTotal:DEBUG_CASE_IDS.length,
  learningPathComplete:lessonsCompleted===LESSON_IDS.length,
  practiceComplete:repairsCompleted===DEBUG_CASE_IDS.length
 };
}
