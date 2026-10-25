import content from './content.json';
import {localizeEvidence,type LocalizedPresentation} from '../shared/evidence';

export type Lang='en'|'ja';
export type Member={id:string;name:string;token:string;cards:number[];notices?:number[]};
export type PrivateDiscovery={trigger:string;card:number;member:string;seq:number};
export type DialogueDecision={eligible:string[];votes:Record<string,number>;proposed?:number;override?:number;locked?:number};
export type State={code:string;language:Lang;host:string;members:Member[];started:boolean;stage:number;pending:boolean;revision:number;unlocked:string[];read:string[];solved:string[];notes:{id:string;by:string;text:string}[];pins:string[];sharedCards?:string[];boardLocked:boolean;tokenShared:boolean;recovered:boolean;verified:boolean;sqlRevealed:boolean;originalOpened:boolean;archiveOpened:boolean;controllerOpened:boolean;hints:Record<string,number>;dialogueVotes:Record<string,Record<string,number>>;dialogueDecisions?:Record<string,DialogueDecision>;privateDiscoveries?:PrivateDiscovery[];complete:boolean;createdAt?:number;lastActiveAt?:number};
export class GameError extends Error { constructor(public code:string){super(code);} }
const requireThat=(ok:unknown,code:string)=>{if(!ok)throw new GameError(code);};
const unique=(a:string[])=>[...new Set(a)];
const norm=(s:unknown)=>String(s??'').normalize('NFKC').trim().toUpperCase().replace(/[‐‑–−]/g,'-');
const nameKey=(s:unknown)=>String(s??'').normalize('NFKC').trim().toLocaleLowerCase('en-US');
const text=(s:unknown,max=300)=>String(s??'').trim().slice(0,max);
const token=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const initial=['welcome','suspects','witnesses','asset-card','dock-log','work-orders','search-help','case-settings','directory','board-help'];
const dialogueChoiceCounts:Record<string,number>={'opening:1':2,'opening:2':2,'opening:4':3,'opening:7':2,'opening:8':2,'opening:14':2,'opening:15':2,'chapter-1:2':2,'chapter-2:3':2,'chapter-3:3':2,'chapter-4:3':2,'chapter-5:3':2,'chapter-6:2':2,'epilogue:1':2};
const dialogueAvailable=(s:State,key:string)=>key.startsWith('opening:')||(/^chapter-([1-6]):/.exec(key)?.[1]!==undefined&&Number(/^chapter-([1-6]):/.exec(key)![1])<=s.stage)||((key.startsWith('ending:')||key.startsWith('epilogue:'))&&s.complete);
const privateTriggerCards:Record<string,number>={'tour-spa':3,'witness-screen':0,'service-door':1,'ren-safety':2,'board-code':4,'photo-time':5,'stage-cue':6};
const privateTriggerStage:Record<string,number>={'tour-spa':1,'witness-screen':1,'service-door':1,'ren-safety':2,'board-code':3,'photo-time':4,'stage-cue':5};
const recordPrivateTriggers:Record<string,string>={witnesses:'witness-screen','work-orders':'service-door','safety-report':'ren-safety','case-settings':'board-code','image-details':'photo-time','cue-sheet':'stage-cue'};
const chapters=[
 [],
 ['welcome','suspects','witnesses','asset-card','dock-log','work-orders','search-help'],
 ['kuma-summary','kitchen-note','source-supplement','source-policy','safety-report','safety-replies','review-notice','source-revision'],
 ['support-request','case-settings','directory','board-help','tablet-lending','session-register'],
 ['album-index','image-details','photo-sequence','photo-late','service-index','media-manifest','playlist-history','cue-sheet'],
 ['service-index','route-ticket','media-manifest','playlist-history','cue-sheet'],
 []
];
export const puzzles=content.puzzles;
export const byId=new Map(content.evidence.map(e=>[e.id,e]));
export function create(code:string,name:string,language:Lang){
 requireThat(language==='en'||language==='ja','language');
 const member:Member={id:crypto.randomUUID(),name:text(name,30),token:token(),cards:[],notices:[]};
 requireThat(member.name,'name');
 const now=Date.now();const state:State={code,language,host:member.id,members:[member],started:false,stage:1,pending:false,revision:1,unlocked:[...initial],read:[],solved:[],notes:[],pins:[],sharedCards:[],boardLocked:false,tokenShared:false,recovered:false,verified:false,sqlRevealed:false,originalOpened:false,archiveOpened:false,controllerOpened:false,hints:{},dialogueVotes:{},dialogueDecisions:{},privateDiscoveries:[],complete:false,createdAt:now,lastActiveAt:now};
 return {state,member};
}
export function auth(s:State,key:string){const m=s.members.find(m=>m.token===key);requireThat(m,'session');return m!;}
export function join(s:State,name:string){
 requireThat(s.members.length<7,'full');const display=text(name,30);requireThat(display,'name');
 requireThat(!s.members.some(m=>nameKey(m.name)===nameKey(display)),'name_taken');
 const m:Member={id:crypto.randomUUID(),name:display,token:token(),cards:[],notices:[]};s.members.push(m);
 s.revision++;return m;
}
export function view(s:State,m:Member,online:string[]=[]){
 const cardShared=(id:string)=>(s.sharedCards||[]).includes(id)||s.notes.some(n=>n.id==='card:'+id);
 const cardView=(i:number)=>{const card=content.private_cards[i];return{id:card.id,title:card.title[s.language],location:card.location[s.language],text:card.text[s.language],shared:cardShared(card.id)}};
 const pending=(m.notices||[])[0];const latest=(s.privateDiscoveries||[]).at(-1);const latestMember=latest&&s.members.find(x=>x.id===latest.member);
 return {code:s.code,language:s.language,host:s.host,me:m.id,started:s.started,stage:s.stage,pending:s.pending,revision:s.revision,complete:s.complete,
 members:s.members.map(x=>({id:x.id,name:x.name,online:online.includes(x.id)})),
 records:s.unlocked.map(id=>{const e=byId.get(id)!;return{id,title:e.title[s.language],tool:e.tool,read:s.read.includes(id),pinned:!s.boardLocked&&s.pins.includes(id)}}),
 cards:m.cards.map(cardView),privateDiscovery:pending===undefined?null:cardView(pending),privateEvent:latest&&latestMember?{seq:latest.seq,member:latest.member,name:latestMember.name,location:content.private_cards[latest.card].location[s.language]}:null,
 board:{locked:s.boardLocked,tokenShared:s.tokenShared,recovered:s.recovered,notes:s.boardLocked?[]:s.notes,pins:s.boardLocked?[]:s.pins},
 verified:s.verified,solved:s.solved,dialogueVotes:s.dialogueVotes||{},dialogueDecisions:s.dialogueDecisions||{},
 receipts:s.solved.map(id=>{const p=puzzles.find(p=>p.id===id)!;return{id,flag:p.flag,title:p.title[s.language],takeaway:p.takeaway[s.language]}}),
 puzzle:s.stage<=5?{id:puzzles[s.stage-1].id,title:puzzles[s.stage-1].title[s.language],task:puzzles[s.stage-1].task[s.language],hints:puzzles[s.stage-1].hints.slice(0,s.hints[puzzles[s.stage-1].id]||0).map(h=>h[s.language])}:null};
}
function discoverPrivate(s:State,caller:Member,trigger:string,online:string[]=[],strict=true){
 const card=privateTriggerCards[trigger];requireThat(card!==undefined,'private_trigger');if(s.stage<privateTriggerStage[trigger]){requireThat(!strict,'private_trigger');return;}
 s.privateDiscoveries||=[];if(s.privateDiscoveries.some(x=>x.trigger===trigger))return;
 const existing=s.members.find(x=>x.cards.includes(card));if(existing)return;
 const active=s.members.filter(x=>online.includes(x.id)||x.id===caller.id);const pool=active.length?active:[caller];
 const fewest=Math.min(...pool.map(x=>x.cards.length));const tied=pool.filter(x=>x.cards.length===fewest);const pick=tied[crypto.getRandomValues(new Uint32Array(1))[0]%tied.length];
 pick.cards=unique([...pick.cards.map(String),String(card)]).map(Number);pick.notices=unique([...(pick.notices||[]).map(String),String(card)]).map(Number);
 s.privateDiscoveries.push({trigger,card,member:pick.id,seq:s.privateDiscoveries.length+1});
}
function unlock(s:State,ids:string[]){s.unlocked=unique([...s.unlocked,...ids]);}
function record(s:State,id:string){requireThat(s.unlocked.includes(id),'unavailable');s.read=unique([...s.read,id]);const e=byId.get(id)!;return{id,title:e.title[s.language],body:e.body[s.language],tool:e.tool,presentation:localizeEvidence(('presentation' in e?e.presentation:undefined) as LocalizedPresentation|undefined,s.language)};}
function needsRead(s:State,ids:string[]){requireThat(ids.every(id=>s.read.includes(id)),'read_evidence');}
export function resolvePath(input:string){
 const full=input.startsWith('/')?input:'/public/launch/'+input;const out:string[]=[];
 for(const p of full.split('/')){if(!p||p==='.')continue;if(p==='..')out.pop();else out.push(p);}
 return '/'+out.join('/');
}
export type SqlResult={query:string;rows:(string|null)[][];error:boolean;engine:'sqlite';code?:string};
export type Services={query?:(input:string)=>Promise<SqlResult>;online?:string[]};
function decisionFor(s:State,key:string,caller:Member,online:string[]=[]){s.dialogueDecisions||={};if(!s.dialogueDecisions[key]){const legacy={...(s.dialogueVotes?.[key]||{})};const active=s.members.filter(x=>online.includes(x.id)||x.id===caller.id||legacy[x.id]!==undefined).map(x=>x.id);s.dialogueDecisions[key]={eligible:active.length?active:[caller.id],votes:legacy};}return s.dialogueDecisions[key]}
export function reconcileDialogues(s:State,online:string[]=[]){let changed=false;for(const decision of Object.values(s.dialogueDecisions||{})){if(decision.locked!==undefined)continue;const existing=new Set(s.members.map(x=>x.id));let active=decision.eligible.filter(id=>existing.has(id)&&(online.length===0||online.includes(id)));if(!active.length&&online.length){const replacements=s.members.filter(member=>online.includes(member.id)).map(member=>member.id);if(replacements.length){decision.eligible=unique([...decision.eligible,...replacements]);active=replacements;changed=true}}if(!active.length||active.some(id=>decision.votes[id]===undefined))continue;const counts=new Map<number,number>();for(const id of active){const vote=decision.votes[id];counts.set(vote,(counts.get(vote)||0)+1)}const best=Math.max(...counts.values());const leaders=[...counts].filter(([,count])=>count===best).map(([choice])=>choice);const selected=leaders.length===1?leaders[0]:decision.votes[s.host];if(selected===undefined||!leaders.includes(selected))continue;if(decision.proposed!==selected){decision.proposed=selected;changed=true}if(active.length===1){decision.locked=selected;changed=true}}return changed}
export async function queryFixtures(input:string,run?:Services['query']){
 requireThat(typeof input==='string'&&input.length<=200,'query_length');
 requireThat(run,'sql_unavailable');return run!(input);
}
export async function act(s:State,m:Member,a:Record<string,unknown>,services:Services={}):Promise<Record<string,unknown>>{
 requireThat(a&&typeof a==='object'&&!Array.isArray(a),'json');
 let result:Record<string,unknown>={};const type=text(a.type,40);
 requireThat(type==='language'||type==='start'||type==='remove-member'||s.started,'not_started');
 switch(type){
 case 'language':requireThat(s.host===m.id&&!s.started,'host_lobby');requireThat(a.language==='en'||a.language==='ja','language');s.language=a.language as Lang;break;
 case 'start':{
  requireThat(s.host===m.id&&!s.started,'host_lobby');s.started=true;
  s.members.forEach(x=>{x.cards=[];x.notices=[]});s.privateDiscoveries=[];s.sharedCards=[];break;
 }
 case 'read':{const id=text(a.id,80);result.record=record(s,id);const trigger=recordPrivateTriggers[id];if(trigger)discoverPrivate(s,m,trigger,services.online,false);break;}
 case 'discover-private':requireThat(a.trigger==='tour-spa','private_trigger');discoverPrivate(s,m,'tour-spa',services.online);break;
 case 'ack-private':{const card=content.private_cards.findIndex(c=>c.id===a.id);requireThat(card>=0&&(m.notices||[]).includes(card),'private_notice');m.notices=(m.notices||[]).filter(i=>i!==card);break;}
 case 'lookup':{
  const key=norm(a.ref);const map:Record<string,string>={'TK-204':'kuma-summary','K-12':'kitchen-note','S-9':'source-supplement','SYS-1':'source-policy','SAF-17':'safety-report','ACK-17':'safety-replies','REV-2':'review-notice','REG-7':'session-register'};
  const id=map[key];requireThat(id,'not_found');unlock(s,[id]);result.record=record(s,id);break;
 }
 case 'sql':{
  const r=await queryFixtures(text(a.query,201),services.query);
  if(r.rows.some(row=>row[0]==='EQ-1842')){s.sqlRevealed=true;unlock(s,['booking-receipts']);}
  result.sql=r;break;
 }
 case 'sources':unlock(s,chapters[2]);result.record=record(s,'kuma-summary');break;
 case 'verify':{
  requireThat(norm(a.extension)==='204','desk');
  if(!s.unlocked.includes('support-request')){result.message=s.language==='ja'?'現在、照合対象のサポート依頼は届いていません。':'There is no received support request to verify yet.';break;}
  s.verified=true;unlock(s,['security-response','tablet-lending','session-register','album-index']);result.record=record(s,'security-response');break;
 }
 case 'badge':requireThat(s.unlocked.includes('support-request'),'unavailable');result.message=s.language==='ja'?'ホテルの職員証画像とEQ-1842の画面が届いた。':'The sender supplies a hotel badge and an EQ-1842 screenshot.';break;
 case 'send-code':{
  requireThat(s.unlocked.includes('support-request'),'unavailable');
  requireThat(!s.verified&&!s.recovered&&!s.tokenShared,'stale_request');
  requireThat(norm(a.code)==='NEON-4826','code');s.tokenShared=true;s.boardLocked=true;unlock(s,['board-locked']);result.record=record(s,'board-locked');break;
 }
 case 'recover':{
  requireThat(s.tokenShared&&s.boardLocked&&s.verified,'verify_first');
  const choices=Array.isArray(a.choices)?a.choices:[];
  requireThat(choices.length===2&&choices.includes('unnecessary_authority')&&choices.includes('discourages_independent_check'),'recovery');
  s.boardLocked=false;s.recovered=true;break;
 }
 case 'album':unlock(s,['album-index','image-details','photo-sequence','photo-late']);result.record=record(s,'album-index');break;
 case 'original':requireThat(s.read.includes('image-details')&&norm(a.asset)==='IMG_2841','original_context');s.originalOpened=true;unlock(s,['photo-original','service-index']);result.record=record(s,'photo-original');break;
 case 'file':{
  const p=resolvePath(text(a.path,200));
  const files=content.virtual_files.files as Record<string,string>;requireThat(files[p],'not_found');
  const id=files[p];unlock(s,[id]);if(id==='route-archive')s.archiveOpened=true;result.record=record(s,id);break;
 }
 case 'controller':requireThat(norm(a.controller)==='CT-44','controller');s.controllerOpened=true;unlock(s,['dock-inventory','pip-snapshot']);result.record=record(s,'dock-inventory');break;
 case 'operations':unlock(s,['route-ticket','media-manifest','playlist-history','cue-sheet']);result.record=record(s,'route-ticket');break;
 case 'revision':unlock(s,['source-revision']);result.record=record(s,'source-revision');break;
 case 'hint':{
  const p=puzzles[s.stage-1];requireThat(p&&!s.complete,'stage');s.hints[p.id]=Math.min(3,(s.hints[p.id]||0)+1);break;
 }
 case 'pin':{
  requireThat(!s.boardLocked,'board_locked');const id=text(a.id,80);requireThat(s.read.includes(id),'read_evidence');s.pins=unique([...s.pins,id]);break;
 }
 case 'remove-member':{
  requireThat(s.host===m.id,'host_lobby');const id=text(a.id,80);requireThat(id!==m.id&&s.members.some(x=>x.id===id),'member');
  const removed=s.members.find(x=>x.id===id)!;s.members=s.members.filter(x=>x.id!==id);const transferred=removed.cards.filter(i=>!m.cards.includes(i));const unread=transferred.filter(i=>{const cardId=content.private_cards[i].id;return!(s.sharedCards||[]).includes(cardId)&&!s.notes.some(n=>n.id==='card:'+cardId)});m.cards=unique([...m.cards,...removed.cards].map(String)).map(Number);m.notices=unique([...(m.notices||[]),...unread].map(String)).map(Number);for(const discovery of s.privateDiscoveries||[])if(discovery.member===id)discovery.member=m.id;for(const ballot of Object.values(s.dialogueVotes||{}))delete ballot[id];for(const decision of Object.values(s.dialogueDecisions||{})){delete decision.votes[id];decision.eligible=decision.eligible.filter(memberId=>memberId!==id)}reconcileDialogues(s,services.online);break;
 }
 case 'note':requireThat(!s.boardLocked,'board_locked');requireThat(text(a.text,600),'empty');s.notes.push({id:crypto.randomUUID(),by:m.name,text:text(a.text,600)});s.notes=s.notes.slice(-150);break;
 case 'share-card':{
  requireThat(!s.boardLocked,'board_locked');const card=content.private_cards.find(c=>c.id===a.id);requireThat(card&&m.cards.some(i=>content.private_cards[i].id===card.id),'card');const id='card:'+card!.id;const wasShared=(s.sharedCards||[]).includes(card!.id)||s.notes.some(n=>n.id===id);s.sharedCards=unique([...(s.sharedCards||[]),card!.id]);if(!wasShared)s.notes.push({id,by:m.name,text:card!.text[s.language]});s.notes=s.notes.slice(-150);break;
 }
 case 'dialogue-vote':{
  const key=text(a.key,80);const choice=Number(a.choice),count=dialogueChoiceCounts[key];requireThat(Number.isInteger(choice)&&count!==undefined&&choice>=0&&choice<count&&dialogueAvailable(s,key),'dialogue_vote');
  const decision=decisionFor(s,key,m,services.online);requireThat(decision.locked===undefined&&decision.proposed===undefined,'dialogue_locked');requireThat(decision.eligible.includes(m.id),'dialogue_vote');decision.votes[m.id]=choice;s.dialogueVotes||={};s.dialogueVotes[key]=decision.votes;reconcileDialogues(s,services.online);break;
 }
 case 'dialogue-finalize':{
  const key=text(a.key,80);const choice=Number(a.choice),count=dialogueChoiceCounts[key];requireThat(s.host===m.id,'host_lobby');requireThat(Number.isInteger(choice)&&count!==undefined&&choice>=0&&choice<count&&dialogueAvailable(s,key),'dialogue_vote');const decision=decisionFor(s,key,m,services.online);reconcileDialogues(s,services.online);requireThat(decision.locked===undefined&&decision.proposed!==undefined,'dialogue_vote');if(choice!==decision.proposed)decision.override=choice;decision.locked=choice;break;
 }
 case 'submit':{
  const id=text(a.puzzle);const p=puzzles[s.stage-1];if(p&&id===p.id&&s.pending&&s.solved.includes(id)){result.message=p.flag;break;}requireThat(p&&id===p.id&&!s.pending,'stage');
  const v=(a.answers||{}) as Record<string,unknown>;
  if(id==='sql'){
   requireThat(s.sqlRevealed,'run_query');needsRead(s,['booking-receipts','dock-log','asset-card']);
   requireThat(norm(v.booking)==='EQ-1842'&&norm(v.pass)==='SP-62'&&v.conclusion==='credential_only','deduction');
  }else if(id==='prompt'){
   needsRead(s,['source-supplement','source-policy','safety-report','kitchen-note']);
   requireThat(v.paragraph==='B'&&norm(v.report)==='SAF-17'&&v.mode==='manual_only','deduction');
  }else if(id==='social'){
   requireThat(s.verified,'verify_first');requireThat(!s.boardLocked,'board_locked');needsRead(s,['case-settings','security-response']);
   requireThat(v.capability==='board_owner'&&v.need==='unnecessary','deduction');
  }else if(id==='metadata'){
   requireThat(s.originalOpened,'original');needsRead(s,['image-details','photo-sequence','photo-original']);
   requireThat(norm(v.capture).replace('時',':').replace('分','')==='18:43'&&norm(v.route)==='MNT-44'&&v.contents==='unknown','deduction');
  }else if(id==='path'){
   requireThat(s.archiveOpened&&s.controllerOpened,'trace');needsRead(s,['route-archive','route-ticket','dock-inventory','playlist-history','media-manifest','cue-sheet']);
   requireThat(norm(v.location)==='LA-B'&&v.source==='REH-1410'&&norm(v.departure).replace('時',':').replace('分','')==='18:42','deduction');
  }
  s.solved.push(p.id);s.pending=true;
  result.message=p.flag;break;
 }
 case 'continue':{const expected=Number(a.stage);if(!s.pending&&Number.isInteger(expected)&&expected<s.stage){result.message=s.language==='ja'?'チームはすでに次の章へ進みました。':'The team has already moved to the next chapter.';break;}requireThat(s.pending&&s.stage<=5,'stage');s.pending=false;s.stage++;if(s.stage<=5)unlock(s,chapters[s.stage]);break;}
 case 'finale':{
  if(s.complete){result.record=record(s,'reveal');break;}
  requireThat(s.stage===6&&!s.complete,'stage');
  const v=(a.answers||{}) as Record<string,unknown>;const selected=Array.isArray(v.evidence)?v.evidence as string[]:[];
  requireThat(v.culprit==='mio'&&v.route==='rear'&&v.deception==='recording'&&v.motive==='deflect','deduction');
  for(const group of content.finale.evidence_groups)requireThat(group.sources.some(id=>selected.includes(id)&&s.read.includes(id)),'evidence_groups');
  s.complete=true;unlock(s,['reveal','ending']);result.record=record(s,'reveal');break;
 }
 default:throw new GameError('action');
 }
 s.revision++;return result;
}
