export {SqlLab} from './sql-lab';
import { DurableObject } from 'cloudflare:workers';
import { create,join,auth,view,act,reconcileDialogues,GameError,type State } from './engine';
import {querySqlLab,type SqlEnv} from './sql-client';
import {roomExpiryAt} from './retention';
interface Env extends SqlEnv {ROOMS:DurableObjectNamespace<GameRoom>;ASSETS:Fetcher}
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function failure(error:unknown){const code=error instanceof GameError?error.code:error instanceof SyntaxError?'json':'internal';return json({error:code},code==='session'?401:code==='internal'?500:400);}
async function body(request:Request){
 if(Number(request.headers.get('content-length')||0)>8192)throw new GameError('size');
 const reader=request.body?.getReader();if(!reader)throw new GameError('json');
 const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>8192){await reader.cancel();throw new GameError('size');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(!value||typeof value!=='object'||Array.isArray(value))throw new GameError('json');return value;
}
export class GameRoom extends DurableObject<Env>{
 state:State|undefined;
 constructor(ctx:DurableObjectState,env:Env){super(ctx,env);ctx.blockConcurrencyWhile(async()=>{this.state=await ctx.storage.get<State>('room');if(this.state){const now=Date.now(),legacy=this.state.lastActiveAt===undefined||this.state.sharedCards===undefined;this.state.createdAt??=now;this.state.lastActiveAt??=this.state.createdAt;this.state.sharedCards??=this.state.notes.filter(note=>note.id.startsWith('card:')).map(note=>note.id.slice(5));if(legacy)await ctx.storage.put('room',this.state);await ctx.storage.setAlarm(Math.max(now,roomExpiryAt(this.state,now)));}});}
 locked(operation:()=>Promise<Response>){return this.ctx.blockConcurrencyWhile(async()=>{try{return await operation()}catch(error){return failure(error)}});}
 online(exclude?:WebSocket){return [...new Set(this.ctx.getWebSockets().filter(ws=>ws!==exclude&&ws.readyState===1).flatMap(ws=>{try{return[ws.deserializeAttachment()?.id]}catch{return[]}}))].filter(Boolean) as string[];}
 async persist(touch=true){if(!this.state)return;const now=Date.now();if(touch)this.state.lastActiveAt=now;await this.ctx.storage.put('room',this.state);await this.ctx.storage.setAlarm(roomExpiryAt(this.state,now));}
 ensureHost(){const s=this.state!;const active=this.online();if(!active.includes(s.host)&&active.length){s.host=active[0];s.revision++;return true}return false}
 push(){const s=this.state!;for(const ws of this.ctx.getWebSockets()){try{const id=ws.deserializeAttachment()?.id;const m=s.members.find(m=>m.id===id);if(m)ws.send(JSON.stringify({snapshot:view(s,m,this.online())}));else ws.close(1008,'Seat removed');}catch{}}}
 async fetch(req:Request):Promise<Response>{
  try{
   if(new URL(req.url).pathname==='/init'){
    return await this.locked(async()=>{
     if(this.state)return json({error:'exists'},409);const b=await body(req);const {state,member}=create(b.code,b.name,b.language);this.state=state;await this.persist();return json({token:member.token,snapshot:view(state,member)});
    });
   }
   if(!this.state)return json({error:'room_not_found'},404);
   if(req.headers.get('Upgrade')?.toLowerCase()==='websocket'){
    const protocols=(req.headers.get('Sec-WebSocket-Protocol')||'').split(',').map(x=>x.trim());
    const m=auth(this.state,protocols[1]||'');const pair=new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1],[m.id]);pair[1].serializeAttachment({id:m.id});
    await this.locked(async()=>{this.ensureHost();if(reconcileDialogues(this.state!,this.online()))this.state!.revision++;await this.persist();return json({ok:true})});this.push();return new Response(null,{status:101,webSocket:pair[0],headers:{'Sec-WebSocket-Protocol':'neon'}});
   }
   return await this.locked(async()=>{
    const s=this.state!;const path=new URL(req.url).pathname;
    if(path==='/join'){
     const b=await body(req);const m=join(s,b.name);await this.persist();this.push();return json({token:m.token,snapshot:view(s,m,this.online())});
    }
    const m=auth(s,req.headers.get('Authorization')?.replace(/^Bearer /,'')||'');
    if(path==='/snapshot'){await this.persist();return json({snapshot:view(s,m,this.online())});}
    if(path==='/action'){
     const action=await body(req);const result=await act(s,m,action,{query:input=>querySqlLab(input,s.code,this.env),online:this.online()});await this.persist();this.push();return json({...result,snapshot:view(s,m,this.online())});
    }
    return json({error:'not_found'},404);
   });
  }catch(error){return failure(error);}
 }
 async webSocketMessage(ws:WebSocket,message:string|ArrayBuffer){if(message==='ping')ws.send('pong');}
 async webSocketClose(ws:WebSocket,code:number,reason:string){
  try{ws.close([1005,1006,1015].includes(code)?1000:code,reason)}catch{}if(!this.state)return;
  await this.locked(async()=>{const active=this.online(ws);let changed=false;if(!active.includes(this.state!.host)&&active.length){this.state!.host=active[0];changed=true}if(reconcileDialogues(this.state!,active))changed=true;if(changed)this.state!.revision++;await this.persist();return json({ok:true})});this.push();
 }
 async webSocketError(ws:WebSocket){try{ws.close(1011,'Connection interrupted')}catch{}}
 async alarm(){if(!this.state)return;const now=Date.now();if(this.online().length){await this.persist();return}const expires=roomExpiryAt(this.state,now);if(now<expires){await this.ctx.storage.setAlarm(expires);return}const code=this.state.code;try{await this.env.SQL_LABS?.get(this.env.SQL_LABS.idFromName(code)).cleanup()}catch{}this.state=undefined;await this.ctx.storage.deleteAlarm();await this.ctx.storage.deleteAll();}
}
export default {
 async fetch(req:Request,env:Env):Promise<Response>{
  const url=new URL(req.url);
  if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);
  if(req.method==='POST'||req.headers.get('Upgrade')?.toLowerCase()==='websocket'){
   const origin=req.headers.get('Origin');if(origin&&origin!==url.origin)return json({error:'origin'},403);
  }
  if(url.pathname==='/api/create'&&req.method==='POST'){
   try{
    const b=await body(req);for(let i=0;i<4;i++){
     const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const random=crypto.getRandomValues(new Uint8Array(6));const code=[...random].map(x=>chars[x%chars.length]).join('');
     const stub=env.ROOMS.get(env.ROOMS.idFromName(code));const response=await stub.fetch('https://room/init',{method:'POST',body:JSON.stringify({...b,code})});
     if(response.status!==409)return response;
    }return json({error:'retry'},503);
   }catch{return json({error:'request'},400);}
  }
  const match=url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{6})\/(join|snapshot|action|ws)$/);
  if(!match)return json({error:'not_found'},404);
  const endpoint=match[2];if(endpoint==='ws'&&req.headers.get('Upgrade')?.toLowerCase()!=='websocket')return json({error:'upgrade'},426);
  if((endpoint==='action'||endpoint==='join')&&req.method!=='POST')return json({error:'method'},405);
  const stub=env.ROOMS.get(env.ROOMS.idFromName(match[1]));const next=new URL(req.url);next.pathname='/'+endpoint;
  return stub.fetch(new Request(next,req));
 }
} satisfies ExportedHandler<Env>;
