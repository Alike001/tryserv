import crypto from "node:crypto";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN=/^[A-Za-z0-9_-]{40,60}$/;
async function defaultQuery(databaseUrl,statement,params=[]){
  const {neon}=await import("@neondatabase/serverless");
  const sql=neon(databaseUrl);
  return sql.query(statement,params);
}
function tokenHash(token){return crypto.createHash("sha256").update(token).digest("hex");}
function unpack(row){
  if(!row)return null;
  let payload=row.payload;
  if(typeof payload==="string")payload=JSON.parse(payload);
  return {id:row.id,payload,created_at:row.created_at,expires_at:row.expires_at};
}

export function createTabbataStore({databaseUrl,query=defaultQuery}={}){
  let schemaPromise=null;
  async function ensureSchema(){
    if(!databaseUrl)throw new Error("Tabbata storage is not configured.");
    if(!schemaPromise){
      schemaPromise=(async()=>{
        await query(databaseUrl,`CREATE TABLE IF NOT EXISTS tabbata_cases (
          id uuid PRIMARY KEY,
          token_hash text NOT NULL,
          payload jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
        )`,[]);
        await query(databaseUrl,"CREATE INDEX IF NOT EXISTS tabbata_cases_expiry_idx ON tabbata_cases (expires_at)",[]);
        await query(databaseUrl,"DELETE FROM tabbata_cases WHERE expires_at <= now()",[]);
      })().catch(error=>{schemaPromise=null;throw error;});
    }
    await schemaPromise;
  }
  return {
    async create(payload){
      await ensureSchema();
      await query(databaseUrl,"DELETE FROM tabbata_cases WHERE expires_at <= now()",[]);
      const id=crypto.randomUUID();
      const token=crypto.randomBytes(32).toString("base64url");
      const rows=await query(databaseUrl,
        "INSERT INTO tabbata_cases (id,token_hash,payload) VALUES ($1,$2,$3::jsonb) RETURNING id,created_at,expires_at",
        [id,tokenHash(token),JSON.stringify(payload)]);
      const row=Array.isArray(rows)?rows[0]:null;
      if(!row)throw new Error("Could not create the review workspace.");
      return {id,token,created_at:row.created_at??null,expires_at:row.expires_at??null};
    },
    async get(id,token){
      if(!UUID.test(String(id))||typeof token!=="string"||!TOKEN.test(token))return null;
      await ensureSchema();
      await query(databaseUrl,"DELETE FROM tabbata_cases WHERE expires_at <= now()",[]);
      const rows=await query(databaseUrl,
        "SELECT id,payload,created_at,expires_at FROM tabbata_cases WHERE id=$1 AND token_hash=$2 AND expires_at>now() LIMIT 1",
        [id,tokenHash(token)]);
      return unpack(Array.isArray(rows)?rows[0]:null);
    },
    async update(id,token,payload){
      if(!UUID.test(String(id))||typeof token!=="string"||!TOKEN.test(token))return false;
      await ensureSchema();
      await query(databaseUrl,"DELETE FROM tabbata_cases WHERE expires_at <= now()",[]);
      const rows=await query(databaseUrl,
        "UPDATE tabbata_cases SET payload=$3::jsonb,updated_at=now() WHERE id=$1 AND token_hash=$2 AND expires_at>now() RETURNING id",
        [id,tokenHash(token),JSON.stringify(payload)]);
      return Array.isArray(rows)&&rows.length>0;
    },
    async appendReviewerAction(id,token,action,maxActions=50){
      if(!UUID.test(String(id))||typeof token!=="string"||!TOKEN.test(token))
        return {status:"not_found",reviewer_actions:[]};
      if(!action||typeof action!=="object"||Array.isArray(action)||!Number.isInteger(maxActions)||maxActions<1||maxActions>100)
        throw new Error("Reviewer action is invalid.");
      await ensureSchema();
      await query(databaseUrl,"DELETE FROM tabbata_cases WHERE expires_at <= now()",[]);
      const rows=await query(databaseUrl,`WITH target AS (
        SELECT id,
          CASE WHEN jsonb_typeof(payload->'reviewer_actions')='array'
            THEN payload->'reviewer_actions' ELSE '[]'::jsonb END AS actions
        FROM tabbata_cases
        WHERE id=$1 AND token_hash=$2 AND expires_at>now()
        FOR UPDATE
      ),
      updated AS (
        UPDATE tabbata_cases AS cases
        SET payload=jsonb_set(cases.payload,'{reviewer_actions}',target.actions || $3::jsonb,true),
            updated_at=now()
        FROM target
        WHERE cases.id=target.id AND jsonb_array_length(target.actions)<$4
        RETURNING cases.payload
      )
      SELECT payload, 'appended'::text AS result FROM updated
      UNION ALL
      SELECT NULL::jsonb,
        CASE WHEN EXISTS(SELECT 1 FROM target) THEN 'limit' ELSE 'not_found' END AS result
      WHERE NOT EXISTS(SELECT 1 FROM updated)`,
      [id,tokenHash(token),JSON.stringify(action),maxActions]);
      const row=Array.isArray(rows)?rows[0]:null;
      if(!row)return {status:"not_found",reviewer_actions:[]};
      if(row.result!=="appended")return {status:row.result,reviewer_actions:[]};
      let payload=row.payload;
      if(typeof payload==="string")payload=JSON.parse(payload);
      return {
        status:"appended",
        reviewer_actions:Array.isArray(payload?.reviewer_actions)?payload.reviewer_actions:[]
      };
    },
    async delete(id,token){
      if(!UUID.test(String(id))||typeof token!=="string"||!TOKEN.test(token))return false;
      await ensureSchema();
      await query(databaseUrl,"DELETE FROM tabbata_cases WHERE expires_at <= now()",[]);
      const rows=await query(databaseUrl,
        "DELETE FROM tabbata_cases WHERE id=$1 AND token_hash=$2 RETURNING id",
        [id,tokenHash(token)]);
      return Array.isArray(rows)&&rows.length>0;
    }
  };
}
