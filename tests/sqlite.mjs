import assert from 'node:assert/strict';
import {build} from 'esbuild';
export async function checkSqlite(mf,namespace){
 let checks=0,attempt=0;const ok=(value,message)=>{assert.ok(value,message);checks++};
 const call=async(input,name='sql-boundaries-'+Math.floor(attempt++/10))=>JSON.parse(JSON.stringify(await namespace.get(namespace.idFromName(name)).query(input)));
 let result=await call('projector');ok(!result.error&&result.engine==='sqlite'&&result.rows.length===1&&result.rows[0][0]==='EQ-1905','Actual workerd SQLite evaluates the public query');
 for(const input of ["' OR 1=1 -- ","' OR 'holiday'='holiday' -- ","' OR 2>1 -- ","' OR (SELECT count(*) FROM reservations)>0 -- ","' OR lower('YES')='yes' -- ","' OR ref IN (SELECT ref FROM reservations) -- ","'/**/OR/**/1=1--", "' OR ';'=';' -- "]){result=await call(input);ok(!result.error&&result.rows.length===5,'Equivalent predicates, subqueries, harmless functions, literals and comments execute: '+input);}
 result=await call("' AND 1=0 -- ");ok(!result.error&&result.rows.length===0,'SQLite computes false predicates rather than matching payload strings');
 result=await call("projector' OR ref='EQ-1842' -- ");ok(!result.error&&result.rows.length===2,'A different predicate actually changes returned records');
 result=await call("' UNION SELECT 'EQ-9000','tea','decaf' -- ");ok(!result.error&&result.rows.length===6&&result.rows.some(row=>row[0]==='EQ-9000'),'Bounded UNION really evaluates supplied literals');
 result=await call("O''Reilly");ok(!result.error&&result.rows.length===0,'Escaped SQL string quotes are tokenized correctly');
 result=await call('; DROP TABLE reservations;');ok(!result.error&&result.rows.length===0,'SQL-looking text inside the original search literal stays inert');
 const denied=[
  "'; DROP TABLE reservations; -- ","') AS x; DELETE FROM reservations; -- ","' OR EXISTS(SELECT 1 FROM sqlite_schema) -- ",
  "' UNION SELECT ref,item,receipt FROM room -- ","' UNION SELECT ref,item,receipt FROM __cf_kv -- ",
  "' OR EXISTS(SELECT 1 FROM pragma_table_info('reservations')) -- ","' OR EXISTS(SELECT 1 FROM main.reservations) -- ",
  "' OR load_extension('x') -- ","' OR length(randomblob(1000000))>0 -- ","' OR length(zeroblob(1000000))>0 -- ",
  "' OR printf('%999999s','x')='x' -- ","' OR readfile('/etc/passwd') IS NOT NULL -- ",
  "' OR (WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n) SELECT count(*) FROM n)>0 -- ",
  "' OR EXISTS(SELECT 1 FROM reservations JOIN reservations) -- ","' OR sqlite_version()='x' -- ",
  "' OR \"ref\"='EQ-1842' -- ","' OR `ref`='EQ-1842' -- ","' OR [ref]='EQ-1842' -- ",
  "' OR "+'('.repeat(20)+'1=1'+')'.repeat(20)+' -- ',"' OR "+'NOT '.repeat(30)+'1 -- ',
  "' UNION SELECT 1,2,3 UNION SELECT 1,2,3 UNION SELECT 1,2,3 UNION SELECT 1,2,3 -- ",
  "' OR 1000001=1000001 -- ","' OR 1=1 /*",'x'.repeat(201),'x\n',null,{}
 ];
 for(const input of denied){result=await call(input);ok(result.error&&result.rows.length===0,'Unsafe/unsupported syntax rejected with no result: '+String(input));}
 result=await call('projector');ok(result.rows[0][0]==='EQ-1905','Rejected writes leave the fixtures intact');
 const labStorage=await mf.unsafeGetDurableObjectStorage('neon-test','SqlLab',{name:'output-boundary'});
 // Privileged test-only storage hook creates oversized fixture data; no player action can write it.
 await call('projector','output-boundary');await labStorage.exec("UPDATE reservations SET receipt=? WHERE ref='EQ-1905'",'x'.repeat(2000));
 result=await call('projector','output-boundary');ok(result.error&&result.rows.length===0,'Oversized output is rejected, not silently delivered');
 const post=(path,body,token)=>mf.dispatchFetch('http://neon.test'+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
 const rateRoom=await(await post('/api/create',{name:'Rate check',language:'en'})).json();const rateName=rateRoom.snapshot.code;
 await post(`/api/rooms/${rateName}/action`,{type:'start'},rateRoom.token);
 const rateQuery=async()=>await(await post(`/api/rooms/${rateName}/action`,{type:'sql',query:'projector'},rateRoom.token)).json();
 for(let i=0;i<14;i++){result=await rateQuery();ok(!result.error,'Authenticated room query within budget');}
 result=await rateQuery();ok(result.error==='sql_busy','Room SQL rate limit is enforced');
 await mf.unsafeEvictDurableObject('neon-test','SqlLab',{name:rateName});result=await rateQuery();ok(result.error==='sql_busy','Eviction does not reset the persisted query budget');
 result=await call('projector','other-room');ok(!result.error,'A throttled room does not consume another room budget');
 await build({entryPoints:['src/server/sql-budget.ts'],outfile:'.test/sql-budget.mjs',bundle:true,platform:'node',format:'esm',logLevel:'silent'});
 const {chargeSqlBudget}=await import('../.test/sql-budget.mjs');const now=172800001,old={window:now,count:14,day:2,daily:499};
 ok(chargeSqlBudget(old,now+9999).code==='lab_busy','Rate window remains closed until its boundary');
 const afterWindow=chargeSqlBudget(old,now+10000);ok(afterWindow.budget?.count===1&&afterWindow.budget.daily===500,'Window reset preserves and charges the daily quota');
 ok(chargeSqlBudget({...old,count:0,daily:500},now+20000).code==='lab_quota','Daily quota survives short window resets');
 const nextDay=chargeSqlBudget({...old,daily:500},259200001);ok(nextDay.budget?.daily===1,'Daily quota resets at the UTC day boundary');
 return{checks,engine:'SQLite in actual local Cloudflare workerd Durable Objects',limits:['Not deployed to a Cloudflare account','Restricted SELECT grammar; not arbitrary SQLite SQL','No full production-browser or public load test']};
}
