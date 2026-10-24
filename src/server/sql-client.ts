import {GameError,type SqlResult} from './engine';
import type {SqlLab} from './sql-lab';
export type SqlEnv={SQL_LABS?:DurableObjectNamespace<SqlLab>};
export async function querySqlLab(input:string,room:string,env:SqlEnv):Promise<SqlResult>{
 if(!env.SQL_LABS)throw new GameError('sql_unavailable');
 let result:SqlResult;
 try{result=await env.SQL_LABS.get(env.SQL_LABS.idFromName(room)).query(input);}catch{throw new GameError('sql_unavailable');}
 if(result.code==='lab_quota')throw new GameError('sql_quota');
 if(result.code==='lab_busy')throw new GameError('sql_busy');return result;
}
