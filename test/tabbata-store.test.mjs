import test from "node:test";
import assert from "node:assert/strict";
import {createTabbataStore} from "../tabbata-store.mjs";

function fakeDatabase(){
 const rows=new Map();const statements=[];
 const query=async(_url,sql,params=[])=>{
  statements.push(sql);
  if(sql.startsWith("CREATE ")||sql.startsWith("DELETE FROM tabbata_cases WHERE expires_at"))return [];
  if(sql.startsWith("INSERT INTO tabbata_cases")){
   const [id,hash,payload]=params;const row={id,token_hash:hash,payload:JSON.parse(payload),created_at:"2026-11-14T00:00:00Z",expires_at:"2026-11-15T00:00:00Z"};rows.set(id,row);return [{id,created_at:row.created_at,expires_at:row.expires_at}];
  }
  if(sql.startsWith("SELECT id,payload")){
   const [id,hash]=params;const row=rows.get(id);return row&&row.token_hash===hash?[{id,payload:row.payload,created_at:row.created_at,expires_at:row.expires_at}]:[];
  }
  if(sql.startsWith("UPDATE tabbata_cases")){
   const [id,hash,payload]=params;const row=rows.get(id);if(!row||row.token_hash!==hash)return [];
   row.payload=JSON.parse(payload);return [{id}];
  }
  if(sql.startsWith("DELETE FROM tabbata_cases WHERE id=$1 AND token_hash=$2")){
   const [id,hash]=params;const row=rows.get(id);if(!row||row.token_hash!==hash)return [];
   rows.delete(id);return [{id}];
  }
  throw new Error("Unexpected SQL: "+sql);
 };
 return {query,rows,statements};
}
test("case access tokens are random, stored only as hashes and required for every operation",async()=>{
 const db=fakeDatabase();const store=createTabbataStore({databaseUrl:"postgresql://example.invalid/db",query:db.query});
 const created=await store.create({project:{name:"Sample"}});
 assert.match(created.id,/^[0-9a-f-]{36}$/);
 assert.match(created.token,/^[A-Za-z0-9_-]{40,60}$/);
 assert.equal(db.rows.get(created.id).token_hash.length,64);
 assert.notEqual(db.rows.get(created.id).token_hash,created.token);
 assert.equal((await store.get(created.id,"wrong-token")).null,undefined);
 assert.equal(await store.get(created.id,"wrong-token"),null);
 assert.equal(await store.update(created.id,"wrong-token",{bad:true}),false);
 assert.equal(await store.delete(created.id,"wrong-token"),false);
 const read=await store.get(created.id,created.token);
 assert.equal(read.payload.project.name,"Sample");
 assert.equal(await store.update(created.id,created.token,{project:{name:"Updated"}}),true);
 assert.equal((await store.get(created.id,created.token)).payload.project.name,"Updated");
 assert.equal(await store.delete(created.id,created.token),true);
 assert.equal(await store.get(created.id,created.token),null);
});
test("database configuration is mandatory and schema creation is cached",async()=>{
 const unavailable=createTabbataStore({});
 await assert.rejects(()=>unavailable.create({}),/not configured/);
 const db=fakeDatabase();const store=createTabbataStore({databaseUrl:"postgresql://example.invalid/db",query:db.query});
 await store.create({one:1});await store.create({two:2});
 assert.equal(db.statements.filter(sql=>sql.startsWith("CREATE TABLE")).length,1);
 assert.equal(db.statements.filter(sql=>sql.startsWith("CREATE INDEX")).length,1);
});
