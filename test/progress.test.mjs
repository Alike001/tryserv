import test from "node:test";
import assert from "node:assert/strict";
import {LESSON_IDS,XP_PER_LESSON,normalizeProgress,loadProgress,pointsFor,award} from "../public/progress.mjs";

test("only known lesson IDs are counted",()=>{
 assert.deepEqual(normalizeProgress(["decide","unknown","ecosystem","decide"]),["ecosystem","decide"]);
 assert.equal(LESSON_IDS.length,4);
 assert.equal(XP_PER_LESSON,20);
});
test("20 XP exactly once per completed lesson, maximum 80 XP",()=>{
 let state=[];
 for(const id of LESSON_IDS){
   const next=award(state,id);
   assert.equal(next.awarded,true);
   assert.equal(next.points,pointsFor(state)+20);
   state=next.completed;
 }
 assert.equal(pointsFor(state),80);
 const again=award(state,"build");
 assert.equal(again.awarded,false);
 assert.equal(again.points,80);
 assert.equal(award(state,"fake").points,80);
});
test("progress is resilient to invalid storage and duplicate IDs",()=>{
 assert.deepEqual(loadProgress("not valid JSON"),[]);
 assert.deepEqual(loadProgress('["ecosystem","ecosystem","unknown"]'),["ecosystem"]);
 assert.deepEqual(loadProgress('"misleading-string"'),[]);
});
