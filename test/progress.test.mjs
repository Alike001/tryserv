import test from "node:test";
import assert from "node:assert/strict";
import {LESSON_IDS,normalizeProgress,loadProgress,markLessonComplete,summaryProgress,debugProgressCount} from "../public/progress.mjs";

test("only known lesson IDs are counted, in a stable curriculum order",()=>{
 assert.deepEqual(normalizeProgress(["decide","unknown","ecosystem","decide"]),["ecosystem","decide"]);
 assert.equal(LESSON_IDS.length,4);
});
test("lesson completion is recorded once without a points or reward system",()=>{
 let state=[];
 for(const id of LESSON_IDS){
   const next=markLessonComplete(state,id);
   assert.equal(next.newlyCompleted,true);
   state=next.completed;
 }
 assert.deepEqual(state,LESSON_IDS);
 const again=markLessonComplete(state,"build");
 assert.equal(again.newlyCompleted,false);
 assert.deepEqual(again.completed,LESSON_IDS);
 const invalid=markLessonComplete(state,"fake");
 assert.equal(invalid.newlyCompleted,false);
 assert.deepEqual(invalid.completed,LESSON_IDS);
 assert.equal(Object.hasOwn(summaryProgress(state,[]),"points"),false);
});
test("existing browser storage keeps previously completed lesson IDs",()=>{
 assert.deepEqual(loadProgress(JSON.stringify(["ecosystem","understand"])),["ecosystem","understand"]);
 assert.deepEqual(loadProgress("not valid JSON"),[]);
 assert.deepEqual(loadProgress('["ecosystem","ecosystem","unknown"]'),["ecosystem"]);
 assert.deepEqual(loadProgress('"misleading-string"'),[]);
});
test("four completed lessons and three debugging repairs remain separate progress tracks",()=>{
 const lessons=[...LESSON_IDS];
 const none=summaryProgress(lessons,[]);
 assert.equal(none.learningPathComplete,true);
 assert.equal(none.practiceComplete,false);
 assert.equal(none.lessonsCompleted,4);
 assert.equal(none.repairsCompleted,0);
 const debug=["wrong-endpoint","missing-instructions","unknown-model"];
 const complete=summaryProgress(lessons,debug);
 assert.equal(complete.practiceComplete,true);
 assert.equal(complete.repairsCompleted,3);
 assert.equal(complete.lessonsCompleted,4);
});
test("debug mission progress ignores duplicates and unknown names",()=>{
 assert.equal(debugProgressCount(["wrong-endpoint","wrong-endpoint","fake"]),1);
 assert.equal(debugProgressCount("wrong-endpoint"),0);
 assert.equal(summaryProgress(["ecosystem"],["wrong-endpoint"]).learningPathComplete,false);
});
