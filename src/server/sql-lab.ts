import {DurableObject} from 'cloudflare:workers';
import {compileChallenge,SqlPolicyError} from './sql-policy';
import type {SqlResult} from './engine';
import {chargeSqlBudget,type SqlBudget} from './sql-budget';
const fixtures=[
 ['EQ-1820','covered service trolley','internal','18:12;T-07;SP-51;W-LIFT'],
 ['EQ-1841','heated trolley','internal','18:41;T-02;KT-11;BALLROOM'],
 ['EQ-1842','covered service trolley','internal','18:42;T-07;SP-62;W-LIFT'],
 ['EQ-1844','covered service trolley','internal','18:44;T-09;SP-64;AV-S'],
 ['EQ-1905','projector','guest','19:05;PROJECTOR;AV-S']
];
/** No room data, tokens, filesystem handles or public HTTP route belong in this class. */
export class SqlLab extends DurableObject<Record<string,never>>{
 constructor(ctx:DurableObjectState,env:Record<string,never>){super(ctx,env);
  ctx.storage.transactionSync(()=>{
   if(ctx.storage.kv.get('schema_version')===1)return;
   ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS reservations(ref TEXT PRIMARY KEY,item TEXT NOT NULL,visibility TEXT NOT NULL,receipt TEXT NOT NULL)');
   for(const row of fixtures)ctx.storage.sql.exec('INSERT OR IGNORE INTO reservations VALUES(?,?,?,?)',...row);
   ctx.storage.kv.put('schema_version',1);
  });
 }
 async query(input:string):Promise<SqlResult>{
  return this.ctx.blockConcurrencyWhile(async()=>{
   const charged=chargeSqlBudget(await this.ctx.storage.get<SqlBudget>('budget'),Date.now());
   if('code' in charged)return{query:'',rows:[],error:true,engine:'sqlite',code:charged.code};
   await this.ctx.storage.put('budget',charged.budget);
   let query='';
   try{
    const compiled=compileChallenge(input);query=compiled.query;
    // Five rows, at most four SELECTs, no joins/CTEs/expanding functions: finite query work.
    const cursor=this.ctx.storage.sql.exec(`SELECT substr(CAST(ref AS TEXT),1,1025) AS ref,substr(CAST(item AS TEXT),1,1025) AS item,substr(CAST(receipt AS TEXT),1,1025) AS receipt FROM (${compiled.sql}) AS lab LIMIT 20`);
    const rows:(string|null)[][]=[];let bytes=0;
    for(const row of cursor.raw()){
     if(row.length!==3||row.some(value=>value!==null&&(typeof value!=='string'||new TextEncoder().encode(value).length>1024)))throw new SqlPolicyError();
     const values=row as (string|null)[];bytes+=new TextEncoder().encode(JSON.stringify(values)).length;if(bytes>16384)throw new SqlPolicyError();rows.push(values);
    }
    return{query,rows,error:false,engine:'sqlite'};
   }catch(error){
    if(!query&&typeof input==='string'&&input.length<=200)query=`SELECT ref,item,receipt FROM reservations WHERE item LIKE '%${input}%' AND visibility = 'guest'`;
    return{query,rows:[],error:true,engine:'sqlite',code:error instanceof SqlPolicyError?'query_unsupported':'query_rejected'};
   }
  });
 }
}
