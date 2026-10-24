import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {Miniflare,convertV4MiniflareOptions,Log,LogLevel} from 'miniflare';
await mkdir('.test',{recursive:true});
await build({entryPoints:['src/server/engine.ts'],outfile:'.test/engine.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {create,join,auth,view,act:engineAct,resolvePath,queryFixtures:engineQuery}=await import('../.test/engine.mjs?'+Date.now());
await build({entryPoints:['src/client/rpg.tsx'],outfile:'.test/rpg.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {questTasks,QuestGuide,Tutorial,HotelMap,KumaChat,EvidenceBody,PrivateDiscoveryCard}=await import('../.test/rpg.mjs?'+Date.now());
const {renderToStaticMarkup}=await import('react-dom/server');
const React=await import('react');
await build({entryPoints:['src/client/narrative.tsx'],outfile:'.test/narrative.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {ScenePlayer,WorldScene,openingBeats,parseTestimony,dialogueEmotion}=await import('../.test/narrative.mjs?'+Date.now());
await build({entryPoints:['src/client/story.ts'],outfile:'.test/story.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {nextStory,chapterScripts,clearScripts,explanationBeats,epilogueBeats,dialogueRecordKind}=await import('../.test/story.mjs?'+Date.now());
await build({entryPoints:['src/client/visuals.tsx'],outfile:'.test/visuals.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {characterFor,environmentFor,atlasPosition,expressionPosition,staffExpressionPosition,recordCategory,SpeakerPortrait}=await import('../.test/visuals.mjs?'+Date.now());
await build({entryPoints:['src/client/phone.tsx'],outfile:'.test/phone.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {conversationLines,SupportPhone,PhoneDesk}=await import('../.test/phone.mjs?'+Date.now());
await build({entryPoints:['src/client/intro.ts'],outfile:'.test/intro.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {hotelTourStops}=await import('../.test/intro.mjs?'+Date.now());
await build({entryPoints:['src/server/sql-client.ts'],outfile:'.test/sql-client.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {querySqlLab}=await import('../.test/sql-client.mjs');
// Execute the Cloudflare Worker in an isolated workerd runtime, not a preview server.
const bundling=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--outdir','.worker-build'],{encoding:'utf8',env:{...process.env,WRANGLER_SEND_METRICS:'false'},timeout:120000});
if(bundling.status!==0)throw new Error(bundling.stderr+'\n'+bundling.stdout);
const scripts=(await readdir('.worker-build')).filter(p=>p.endsWith('.js'));
assert.ok(scripts.length===1,scripts.join(','));
const mf=new Miniflare(convertV4MiniflareOptions({name:'neon-test',modules:true,scriptPath:'.worker-build/'+scripts[0],compatibilityDate:'2026-10-20',compatibilityFlags:['nodejs_compat'],durableObjects:{ROOMS:{className:'GameRoom',useSQLite:true},SQL_LABS:{className:'SqlLab',useSQLite:true}},durableObjectsPersist:false,unsafeInspectDurableObjects:true,log:new Log(LogLevel.ERROR)}));
const labNamespace=await mf.getDurableObjectNamespace('SQL_LABS');
const sqlEnv={SQL_LABS:labNamespace};let engineQueryCount=0;
const realQuery=async input=>JSON.parse(JSON.stringify(await querySqlLab(input,'engine-tests-'+Math.floor(engineQueryCount++/10),sqlEnv)));
const act=(state,member,action)=>engineAct(state,member,action,{query:realQuery});
const actOnline=(state,member,action,online)=>engineAct(state,member,action,{query:realQuery,online});
const queryFixtures=input=>engineQuery(input,realQuery);
let checks=0;
try{
const ok=(value,message)=>{assert.ok(value,message);checks++};
const rejects=async(fn,code)=>{await assert.rejects(fn,e=>e.code===code);checks++};
const {checkSqlite}=await import('./sqlite.mjs');const sqlReport=await checkSqlite(mf,labNamespace);checks+=sqlReport.checks;await writeFile('sqlite-test-report.json',JSON.stringify(sqlReport,null,2)+'\n');
function make(lang='en'){return create('ABC234','Host',lang)}
async function read(s,m,...ids){for(const id of ids)await act(s,m,{type:'read',id})}
async function firstTwo(s,m){
 await act(s,m,{type:'start'});
 await act(s,m,{type:'discover-private',trigger:'tour-spa'});
 await read(s,m,'witnesses','work-orders');
 const r=await act(s,m,{type:'sql',query:"' OR 1=1 -- "});ok(r.sql.rows.length===5,'SQL reveals multiple records');
 await read(s,m,'booking-receipts','dock-log','asset-card');
 await act(s,m,{type:'submit',puzzle:'sql',answers:{booking:'EQ-1842',pass:'SP-62',conclusion:'credential_only'}});
 await act(s,m,{type:'continue'});
 await read(s,m,'source-supplement','source-policy','safety-report','kitchen-note');
 await act(s,m,{type:'submit',puzzle:'prompt',answers:{paragraph:'B',report:'SAF-17',mode:'manual_only'}});
 await act(s,m,{type:'continue'});
}
const {state:s,member:m}=make();
for(let i=1;i<7;i++)join(s,'Detective '+i);
assert.throws(()=>join(s,'Eighth'),e=>e.code==='full');checks++;
assert.throws(()=>auth(s,'wrong'),e=>e.code==='session');checks++;
const other=s.members[1];await rejects(()=>act(s,other,{type:'start'}),'host_lobby');
await act(s,m,{type:'language',language:'ja'});ok(view(s,other).language==='ja','One room language for all players');
await act(s,m,{type:'language',language:'en'});
await act(s,m,{type:'start'});
await act(s,m,{type:'dialogue-vote',key:'opening:1',choice:1});
await act(s,other,{type:'dialogue-vote',key:'opening:1',choice:0});
ok(view(s,m).dialogueVotes['opening:1'][m.id]===1&&view(s,other).dialogueVotes['opening:1'][other.id]===0,'Dialogue votes synchronize without exposing session tokens');
await rejects(()=>act(s,m,{type:'dialogue-vote',key:'../bad',choice:9}),'dialogue_vote');
await rejects(()=>act(s,m,{type:'dialogue-vote',key:'chapter-6:2',choice:0}),'dialogue_vote');
await act(s,m,{type:'verify',extension:'204'});
ok(!s.verified&&!s.unlocked.includes('security-response'),'Cannot verify or expose a future request');
await rejects(()=>act(s,m,{type:'send-code',code:'NEON-4826'}),'unavailable');
await rejects(()=>act(s,m,{type:'original',asset:'IMG_2841'}),'original_context');
await act(s,m,{type:'read',id:'case-settings'});ok(!s.members.some(x=>x.cards.includes(4)),'Reading an available future record early does not fail or award its later observation');
s.started=false;
await firstTwo(s,m);
ok(s.members.reduce((sum,p)=>sum+p.cards.length,0)===4,'Private observations appear only when their story locations are reached');
await rejects(()=>act(s,m,{type:'language',language:'ja'}),'host_lobby');
const publicView=JSON.stringify(view(s,other));ok(!publicView.includes(m.token),'Private token is not broadcast');
ok(!publicView.includes('reveal"'),'Final solution not listed before completion');
await rejects(()=>act(s,m,{type:'read',id:'reveal'}),'unavailable');
await act(s,m,{type:'read',id:'witnesses'});await act(s,m,{type:'pin',id:'witnesses'});ok(view(s,other).board.pins.includes('witnesses'),'Pinned testimony is available to the other player');
await act(s,m,{type:'note',text:'Retain this before penalty.'});
await act(s,m,{type:'send-code',code:'NEON-4826'});
ok(s.boardLocked&&s.tokenShared,'Sharing locks the shared board');
ok(view(s,other).board.locked&&view(s,other).board.notes.length===0,'Locked board does not expose notes');
await rejects(()=>act(s,m,{type:'note',text:'Locked'}),'board_locked');
await rejects(()=>act(s,m,{type:'recover',choices:['unnecessary_authority','discourages_independent_check']}),'verify_first');
ok(view(s,other).records.every(r=>!r.pinned),'Locked snapshots hide all pin badges');
await read(s,other,'directory','case-settings');
await act(s,other,{type:'verify',extension:'204'});
await rejects(()=>act(s,m,{type:'recover',choices:['booking_proves_identity','badge_is_independent']}),'recovery');
await act(s,other,{type:'recover',choices:['unnecessary_authority','discourages_independent_check']});
ok(!s.boardLocked&&s.recovered&&s.notes[0].text==='Retain this before penalty.','Recovery retains board and all progress');
await rejects(()=>act(s,m,{type:'send-code',code:'NEON-4826'}),'stale_request');
await read(s,m,'case-settings','security-response');
await act(s,m,{type:'submit',puzzle:'social',answers:{capability:'board_owner',need:'unnecessary'}});
await act(s,m,{type:'continue'});
await act(s,m,{type:'album'});await read(s,m,'image-details');
await act(s,m,{type:'original',asset:'IMG_2841'});await read(s,m,'image-details','photo-sequence','photo-original');
await act(s,m,{type:'submit',puzzle:'metadata',answers:{capture:'１８：４３',route:'MNT-44',contents:'unknown'}});
await act(s,m,{type:'continue'});
await rejects(()=>act(s,m,{type:'file',path:'../../etc/passwd'}),'not_found');
ok(resolvePath('../launch/../../archive/maintenance/./MNT-44.txt')==='/archive/maintenance/MNT-44.txt','Equivalent virtual paths normalize correctly');
await act(s,m,{type:'file',path:'../../archive/maintenance/MNT-44.txt'});
await rejects(()=>act(s,m,{type:'controller',controller:'PIP-004'}),'controller');
await act(s,m,{type:'controller',controller:'CT-44'});await act(s,m,{type:'operations'});
await read(s,m,'route-archive','route-ticket','dock-inventory','playlist-history','media-manifest','cue-sheet');
await act(s,m,{type:'submit',puzzle:'path',answers:{location:'LA-B',source:'REH-1410',departure:'18時42分'}});
ok(s.pending&&s.stage===5,'A solved chapter waits for explicit shared Continue');
await act(s,m,{type:'continue'});
ok(s.stage===6&&s.solved.length===5,'All five findings advance to finale');
await read(s,m,'review-notice','source-revision');
await rejects(()=>act(s,m,{type:'finale',answers:{culprit:'mio',route:'rear',deception:'recording',motive:'deflect',evidence:[]}}),'evidence_groups');
await act(s,m,{type:'finale',answers:{culprit:'mio',route:'rear',deception:'recording',motive:'deflect',evidence:['photo-original','playlist-history','review-notice','source-revision']}});
ok(s.complete&&s.unlocked.includes('ending'),'Finale supported by four evidence groups');
ok(s.members.reduce((sum,p)=>sum+p.cards.length,0)===7&&s.privateDiscoveries.length===7,'All seven observations are discovered progressively across the case');
const {state:no,member:n}=make('ja');await firstTwo(no,n);ok(n.cards.length===4,'Solo receives each observation as its location is reached');
await act(no,n,{type:'verify',extension:'204'});await read(no,n,'case-settings','security-response');
await act(no,n,{type:'submit',puzzle:'social',answers:{capability:'board_owner',need:'unnecessary'}});
await act(no,n,{type:'continue'});
ok(!no.tokenShared&&!no.recovered&&no.stage===4,'Verified no-share route needs no recovery');
const normal=await queryFixtures('trolley'),attack=await queryFixtures("' OR 1=1 -- "),alt=await queryFixtures("' OR 'x'='x' -- "),mutate=await queryFixtures("'; DROP TABLE reservations; -- ");
ok(normal.rows.length===0&&attack.rows.length===5&&alt.rows.length===5&&mutate.error,'Separate SQLite challenge evaluates real SQL');
const forbidden=await queryFixtures("' OR (SELECT 1)=1 -- "), arithmetic=await queryFixtures("' OR 2>1 -- " );
ok(!forbidden.error&&forbidden.rows.length===5&&arithmetic.rows.length===5,'Real SQL accepts a subquery and alternative predicate');
await rejects(()=>engineQuery('projector'),'sql_unavailable');

// Regression checks for independent review findings.
const {state:bounded,member:owner}=make();const guest=join(bounded,'Guest');
await act(bounded,owner,{type:'start'});await act(bounded,guest,{type:'dialogue-vote',key:'opening:1',choice:0});
await act(bounded,owner,{type:'discover-private',trigger:'tour-spa'});
await rejects(()=>act(bounded,guest,{type:'remove-member',id:owner.id}),'host_lobby');
await act(bounded,owner,{type:'remove-member',id:guest.id});
ok(!bounded.members.some(x=>x.id===guest.id),'Host can release an occupied seat');
ok(!Object.values(bounded.dialogueVotes).some(ballot=>guest.id in ballot),'Removed seats are pruned from dialogue votes');
assert.throws(()=>auth(bounded,guest.token),e=>e.code==='session');checks++;
const card=view(bounded,owner).cards[0].id;
for(let i=0;i<155;i++)await act(bounded,owner,{type:'share-card',id:card});
ok(bounded.notes.length===1,'Sharing a card is idempotent');
for(let i=0;i<155;i++)await act(bounded,owner,{type:'note',text:'bounded'});
await act(bounded,owner,{type:'share-card',id:card});
ok(bounded.notes.length===150,'All note writers enforce the same cap');
await rejects(()=>act(bounded,owner,null),'json');

// Progressive private discoveries look random, but balance across online players.
const {state:progressive,member:p1}=make();const p2=join(progressive,'Two'),p3=join(progressive,'Three');await act(progressive,p1,{type:'start'});const online=progressive.members.map(x=>x.id);
await actOnline(progressive,p1,{type:'discover-private',trigger:'tour-spa'},online);
await actOnline(progressive,p1,{type:'read',id:'witnesses'},online);
await actOnline(progressive,p1,{type:'read',id:'work-orders'},online);
ok(progressive.members.every(x=>x.cards.length===1),'First three discoveries balance across three online players');
ok(progressive.privateDiscoveries.length===3&&new Set(progressive.privateDiscoveries.map(x=>x.trigger)).size===3,'Each location can trigger only one private discovery');
const recipient=progressive.members.find(x=>x.id===progressive.privateDiscoveries.at(-1).member);const observer=progressive.members.find(x=>x.id!==recipient.id);const recipientView=view(progressive,recipient,online),observerView=view(progressive,observer,online);
ok(!!recipientView.privateDiscovery&&!observerView.cards.some(card=>card.id===recipientView.privateDiscovery.id),'Only the selected player receives that discovery');
ok(observerView.privateEvent.name===recipient.name&&!JSON.stringify(observerView).includes(recipientView.privateDiscovery.text),'Other players receive a social prompt without the secret detail');
await act(progressive,recipient,{type:'ack-private',id:recipientView.privateDiscovery.id});ok(view(progressive,recipient).privateDiscovery===null&&view(progressive,recipient).cards.length===1,'Acknowledging keeps the observation but closes its RPG reveal');
await rejects(()=>act(progressive,p1,{type:'discover-private',trigger:'stage-cue'}),'private_trigger');

// UI guidance must follow actual evidence gates without supplying answers.
const content=JSON.parse(await readFile('src/server/content.json','utf8'));
const allRecords=content.evidence.map(e=>({...e,read:true,title:e.title.en}));
for(let stage=1;stage<=6;stage++){
 const v={stage,pending:false,complete:false,verified:true,records:allRecords,board:{locked:false}};
 ok(questTasks(v).every(task=>task.done),'All inspected evidence completes quest checklist for stage '+stage);
 const empty={...v,verified:false,records:[],board:{locked:stage===3}};
 ok(questTasks(empty).some(task=>!task.done),'Quest offers an unfinished next action for stage '+stage);
 for(const task of questTasks(v))if(task.go.record)ok(content.evidence.some(e=>e.id===task.go.record),'Quest links to a real evidence record');
}
const guideState={stage:1,pending:false,complete:false,verified:false,records:[],board:{locked:false}};
for(const language of ['en','ja']){
 const guide=renderToStaticMarkup(React.createElement(QuestGuide,{s:guideState,lang:language,onGo(){},onContinue(){},onHint(){},busy:false}));
 ok(guide.includes(language==='en'?'Investigate':'調べる'),'Quest has an actionable localized CTA');
 ok(guide.includes(language==='en'?'Hint':'ヒント'),'Hint is exposed beside the single quest action');
 const cleared=renderToStaticMarkup(React.createElement(QuestGuide,{s:{...guideState,pending:true},lang:language,onGo(){},onContinue(){},busy:false}));
 ok(cleared.includes(language==='en'?'Next chapter':'次の章へ'),'Cleared chapter exposes explicit advance');
 const tutorial=renderToStaticMarkup(React.createElement(Tutorial,{lang:language,onClose(){}}));
 ok(tutorial.includes('aria-modal="true"')&&tutorial.includes(language==='en'?'Follow the glowing quest':'光るクエスト'),'Tutorial provides a localized accessible opening');
 const map=renderToStaticMarkup(React.createElement(HotelMap,{lang:language,onGo(){}}));ok((map.match(/<button/g)||[]).length===6,'Map has six interactive destinations');
 const chat=renderToStaticMarkup(React.createElement(KumaChat,{lang:language,stage:1,onAction:async()=>undefined,onNavigate(){},onClose(){}}));ok(chat.includes('role="log"')&&chat.includes('maxLength="200"'),'Chat includes bounded input and announced transcript');
}
const discoveryMarkup=renderToStaticMarkup(React.createElement(PrivateDiscoveryCard,{lang:'en',discovery:{id:'card-4',title:'Yellow by the slippers',location:'Hot-spring entrance',text:'A private detail'},onKeep(){},onShare(){}}));
ok(discoveryMarkup.includes('ONLY YOU NOTICED')&&discoveryMarkup.includes('Share with team')&&discoveryMarkup.includes('aria-modal="true"'),'Private discovery uses a clear RPG reveal with keep and share actions');

const suspects=content.evidence.find(e=>e.id==='suspects');
for(const language of ['en','ja']){
 const cast=renderToStaticMarkup(React.createElement(EvidenceBody,{id:'suspects',body:suspects.body[language]}));
 ok((cast.match(/class="cast-portrait"/g)||[]).length===5,'Cast view includes all five illustrated suspects');
}
const timeline=renderToStaticMarkup(React.createElement(EvidenceBody,{id:'dock-log',body:content.evidence.find(e=>e.id==='dock-log').body.en}));
ok(timeline.includes('SP-62')&&timeline.includes('18:42'),'Visual timeline retains the pass and departure evidence');

// Visual-novel evidence preserves the original bilingual accounts.
for(const language of ['en','ja']){
 const witness=content.evidence.find(e=>e.id==='witnesses').body[language];
 const lines=parseTestimony(witness);
 ok(lines.length===4&&lines.every(line=>line.speaker&&line.text),'Four witness dialogues parse in '+language);
 ok(lines.map(x=>x.text).join(' ').includes('18:55'),'Witness dialogue retains the direct-view caveat time');
 const opening=renderToStaticMarkup(React.createElement(ScenePlayer,{lang:language,kind:'opening',onClose(){},onComplete(){},onPins(){}}));
 ok(opening.includes('aria-modal="true"')&&opening.includes('spoken-line'),'Prologue renders as a scene and dialogue box');
 const interview=renderToStaticMarkup(React.createElement(ScenePlayer,{lang:language,kind:'witnesses',body:witness,records:[{id:'playlist-history',title:'Playback history',read:true,pinned:false}],cards:[{id:'card-1',text:'Private screen clue'}],onShareCard(){},onClose(){},onComplete(){},onPins(){},onPin(){}}));
 ok(interview.includes(language==='en'?'Press the wording':'言葉を追及')&&interview.includes(language==='en'?'Present evidence':'証拠を示す'),'Witness scene supports pressing and presenting evidence');
 ok(interview.includes(language==='en'?'private observation is relevant':'個別の観察がこの証言に関係'),'Relevant private clues can interrupt an interview');
 ok(interview.includes(language==='en'?'Pin evidence':'証拠をピン留め'),'Testimony can be pinned directly to the shared evidence board');
 const ending=renderToStaticMarkup(React.createElement(ScenePlayer,{lang:language,kind:'ending',body:'A complete explanation.',onClose(){},onComplete(){},onPins(){}}));
 ok(ending.includes(language==='en'?'Walk us through the evidence':'証拠に沿って'),'Final explanation opens as a character conversation');
 const world=renderToStaticMarkup(React.createElement(WorldScene,{lang:language,onGo(){},onStory(){},onWitnesses(){}}));
 ok(!world.includes('KUMA')&&world.includes(language==='en'?'Talk to witnesses':'関係者と話す'),'World has witnesses and no duplicate KUMA entry');
 const serviceBay=renderToStaticMarkup(React.createElement(WorldScene,{lang:language,stage:5,onGo(){},onStory(){},onWitnesses(){}}));
 ok(serviceBay.includes(language==='en'?'Dock console':'ドック端末')&&serviceBay.includes(language==='en'?'AV control':'AV管理')&&!serviceBay.includes(language==='en'?'Front desk terminal':'フロント端末'),'Hotel hotspots follow the active chapter');
 const reward=renderToStaticMarkup(React.createElement(QuestGuide,{s:{...guideState,pending:true,receipts:[{title:'Cleared',flag:'FLAG{private-receipt}',takeaway:'Check primary sources'}]},lang:language,onGo(){},onContinue(){},busy:false}));
 ok(reward.includes('Check primary sources')&&!reward.includes('FLAG{'),'Chapter clear gives a takeaway without displaying a raw flag');
}
ok(openingBeats.filter(beat=>beat.choice?.length>1).length>=2,'Opening includes multiple conversational choices');
ok(openingBeats.every(beat=>beat.speaker.length===2&&beat.text.length===2),'Opening is bilingual throughout');

// Story checkpoints must catch up across multiplayer advancement and remain gated.
const seen=new Set();const finished={started:true,stage:6,complete:true,solved:['sql','prompt','social','metadata','path']};const order=[];
for(let i=0;i<20;i++){const checkpoint=nextStory(finished,id=>seen.has(id));if(!checkpoint)break;order.push(checkpoint.id);seen.add(checkpoint.id);}
assert.deepEqual(order,['opening','chapter-1','clear-1','chapter-2','clear-2','chapter-3','clear-3','chapter-4','clear-4','chapter-5','clear-5','chapter-6','ending','epilogue']);checks++;
ok(nextStory(finished,id=>seen.has(id))===null,'Seen conversations do not loop');
const behind=new Set(['opening','chapter-1']);
ok(nextStory({started:true,stage:3,complete:false,solved:['sql','prompt']},id=>behind.has(id)).id==='clear-1','A slower player receives the missed chapter-clear conversation before the next intro');
ok(nextStory({started:false,stage:1,complete:false,solved:[]},()=>false)===null,'No story plays in the lobby');
ok(nextStory({started:true,stage:2,complete:false,solved:['sql']},id=>['opening','chapter-1','clear-1','chapter-2'].includes(id))===null,'Unsolved future chapters and final explanation stay gated');
for(let chapter=1;chapter<=6;chapter++){
 ok(chapterScripts[chapter].some(beat=>beat.choice?.length),'Every chapter intro has a player response');
 for(const language of ['en','ja']){
  const rendered=renderToStaticMarkup(React.createElement(ScenePlayer,{lang:language,kind:'chapter',chapter,onClose(){},onComplete(){},onPins(){}}));
  ok(rendered.includes('spoken-line')&&rendered.includes(chapterScripts[chapter][0].text[language==='en'?0:1]),'Chapter '+chapter+' has localized RPG dialogue');
 }
}
for(let chapter=1;chapter<=5;chapter++)ok(clearScripts[chapter].length>=2&&clearScripts[chapter].every(beat=>beat.text.every(Boolean)),'Solved chapter '+chapter+' has bilingual aftermath dialogue');
for(const language of ['en','ja']){
 const original=content.evidence.find(e=>e.id==='reveal').body[language];const beats=explanationBeats(original,language);const flattened=beats.map(beat=>beat.text.join(' ')+(beat.choice||[]).map(c=>c.reply.join(' ')).join(' ')).join(' ');
 ok(original.split('\n').slice(0,3).every(paragraph=>flattened.includes(paragraph)),'Explanation dialogue preserves all original findings in '+language);
 ok(beats.some(beat=>beat.speaker[0]==='Mio')&&beats.some(beat=>beat.choice?.[0]?.speaker?.[0]==='Your team'),'Final scene includes Mio and player-led explanation');
 const epilogue=epilogueBeats(content.evidence.find(e=>e.id==='ending').body[language],language);
 ok(epilogue.some(beat=>beat.face==='pip'&&beat.choice?.length===2),'PIP return has two holiday responses');
 ok(epilogue.at(-1).text[language==='en'?0:1].includes(language==='en'?'Autonomous mode stays disabled':'自律モードは修理まで停止'),'Epilogue preserves repair restriction');
}
ok(['support-request','security-response','album-index','board-locked'].every(id=>dialogueRecordKind(id)==='record'),'Story-bearing reports use the conversation player');
ok(dialogueRecordKind('dock-log')===null,'Technical evidence remains separately inspectable');
const holiday=renderToStaticMarkup(React.createElement(WorldScene,{lang:'en',complete:true,onGo(){},onStory(){},onWitnesses(){}}));
ok(holiday.includes('PIP found. Holiday restored.')&&!holiday.includes('PIP is missing'),'Completed hotel scene no longer claims PIP is missing');

// v0.6 scene identity, archive taxonomy and phone presentation.
const speakers=['Mio, Events Director','Ren, Robotics Engineer','Aya, Head Chef','Daichi, Maintenance','Sora, Travel Influencer','Hotel manager','Reception','Stage technician','Guest note'];
speakers.forEach((speaker,index)=>ok(characterFor(speaker)===index,'Speaker resolves to only their individual portrait: '+speaker));
ok(characterFor('Your team')===null&&characterFor('PIP')==='pip'&&characterFor('KUMA')==='kuma','Narrator, PIP and KUMA cannot resolve to another human portrait');
ok(new Set(Array.from({length:9},(_,i)=>atlasPosition(i))).size===9,'Portrait cells have nine distinct crops');
ok(new Set(['neutral','happy','surprised','worried'].map(emotion=>expressionPosition(0,emotion))).size===4,'Main cast has four distinct expression rows');
ok(new Set(['neutral','happy','surprised','worried'].map(emotion=>staffExpressionPosition(5,emotion))).size===4,'Supporting cast has four distinct expression rows');
const surprisedSora=renderToStaticMarkup(React.createElement(SpeakerPortrait,{speaker:'Sora',emotion:'surprised'}));ok(surprisedSora.includes('expression-atlas')&&surprisedSora.includes('data-emotion="surprised"'),'Main cast portrait renders the requested expression atlas state');
const worriedManager=renderToStaticMarkup(React.createElement(SpeakerPortrait,{speaker:'Hotel manager',emotion:'worried'}));ok(worriedManager.includes('staff-expression-atlas')&&worriedManager.includes('data-emotion="worried"'),'Supporting cast portrait renders the requested expression atlas state');
ok(dialogueEmotion('suspects','Mio',1,0,'',false)==='worried'&&dialogueEmotion('clear','Sora',4,1,'',false)==='surprised','Dialogue context selects character reactions');
ok(environmentFor('opening',1,openingBeats.findIndex(b=>b.time==='18:35'))==='sealed'&&environmentFor('opening',1,openingBeats.findIndex(b=>b.time==='18:55'))==='ballroom'&&environmentFor('opening',1,openingBeats.findIndex(b=>b.time==='19:00'))==='blackout','Opening visuals reflect the door, preview and blackout');
ok(environmentFor('chapter',2)==='kuma'&&environmentFor('chapter',4)==='gallery'&&environmentFor('chapter',5)==='maintenance','Investigation chapters have distinct locations');
ok(environmentFor('ending')==='ballroom'&&environmentFor('epilogue',1,2)==='spring','Final explanation and holiday ending use their own locations');
ok(recordCategory('concierge')==='concierge'&&recordCategory('settings')==='case','KUMA archive remains separate from Notebook');
for(const language of ['en','ja']){
 const source=content.evidence.find(e=>e.id==='support-request').body[language];const lines=conversationLines(source);
 ok(lines.length===3&&!lines.some(line=>/^(Actions|操作)[:：]/.test(line)),'Fake-support transcript omits plain-text action instructions');
 ok(lines.join(' ').includes('EQ-1842')&&lines.join(' ').includes('CASE-19'),'Phone transcript retains the actual social-engineering request');
 const initial=renderToStaticMarkup(React.createElement(SupportPhone,{lang:language,body:source,busy:false,closed:false,onAction:async()=>undefined,onClose(){},onContact(){},onPins(){}}));
 ok(initial.includes(language==='en'?'Read next message':'次のメッセージ')&&!initial.includes('support-response-actions'),'Response actions are hidden until the conversation ends');
 const phone=renderToStaticMarkup(React.createElement(PhoneDesk,{lang:language,onAction:async()=>undefined,onActive(){}}));
 ok(phone.includes('phone-keypad')&&phone.includes('role="log"')&&!phone.includes('204'),'Dialer exposes a keypad and transcript without giving away the extension');
}
const single=renderToStaticMarkup(React.createElement(SpeakerPortrait,{speaker:'Mio'}));
ok(single.includes('data-character="0"')&&!single.includes('hotel-neon-cast'),'Dialogue renders one portrait without the group artwork');
for(const asset of ['public/art/character-portraits.png','public/art/story-locations.png']){const bytes=await readFile(asset);ok(bytes.subarray(1,4).toString()==='PNG',asset+' is a packaged PNG');}

// A holiday should precede the mystery; the tour can trigger a private observation without gating progression.
const tourIndex=openingBeats.findIndex(beat=>beat.tour);const showIndex=openingBeats.findIndex(beat=>beat.environment==='show');const entryIndex=openingBeats.findIndex(beat=>beat.time==='18:35');
ok(openingBeats[0].time==='18:20'&&tourIndex>0&&tourIndex<showIndex&&showIndex<entryIndex,'Arrival and hotel tour precede discovering the PIP show and the demo-room entry');
ok(hotelTourStops.length===3&&new Set(hotelTourStops.map(stop=>stop.id)).size===3,'Tour offers three distinct stops');
ok(hotelTourStops.every(stop=>stop.label.every(Boolean)&&stop.text.every(Boolean)),'All tour stops have English and Japanese dialogue');
ok(openingBeats.slice(tourIndex+1,showIndex).some(beat=>beat.choice?.length===3),'Players discuss and choose their holiday priority before the show');
for(const environment of ['garden','lounge','spa','show']){
 const {SceneArt}=await import('../.test/visuals.mjs');const art=renderToStaticMarkup(React.createElement(SceneArt,{environment}));
 ok(art.includes('holiday-intro.png')&&art.includes('200% 200%'),'Opening environment '+environment+' uses its own new visual');
}
const introImage=await readFile('public/art/holiday-intro.png');ok(introImage.subarray(1,4).toString()==='PNG','Holiday opening artwork is packaged');

// Privacy guidance and image/evidence regressions.
for(const language of ['en','ja']){
 const dialogue=openingBeats.map(beat=>beat.text[language==='ja'?1:0]).join(' ');
 ok(dialogue.includes(language==='ja'?'その人の画面にだけ':'chosen player’s screen'),'Intro explicitly explains private discoveries in '+language);
 ok(dialogue.includes(language==='ja'?'進行に沿ってすべて':'discover every observation as they progress'),'Intro explains progressive solo discovery in '+language);
}
await build({entryPoints:['src/client/image-viewer.tsx'],outfile:'.test/image-viewer.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'});
const {EvidenceImageViewer}=await import('../.test/image-viewer.mjs');
const posted=renderToStaticMarkup(React.createElement(EvidenceImageViewer,{kind:'posted',lang:'en',onClose:()=>{}}));
const original=renderToStaticMarkup(React.createElement(EvidenceImageViewer,{kind:'original',lang:'ja',onClose:()=>{}}));
ok(!posted.includes('MNT-44')&&original.includes('MNT-44'),'Posted zoom does not disclose retained-original placard');
ok(posted.includes('role="dialog"')&&posted.includes('type="range"'),'Image enlargement has a separate accessible zoom viewer');
const presentation=await act(s,m,{type:'read',id:'dock-log'});
ok(presentation.record.presentation.kind==='table'&&presentation.record.presentation.rows.length===4,'Authorized evidence read delivers structured log rows');
const privateRoom=make();const unread=JSON.stringify(view(privateRoom.state,privateRoom.member));
ok(!unread.includes('presentation'),'Snapshot does not leak future evidence tables');


 const post=(path,data,token)=>mf.dispatchFetch('http://neon.test'+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data)});
 let response=await post('/api/create',{name:'Worker host',language:'en'});let made=await response.json();
 assert.equal(response.status,200,JSON.stringify(made));checks++;const code=made.snapshot.code,key=made.token;
 response=await post(`/api/rooms/${code}/join`,{name:'Second player'});const joined=await response.json();ok(joined.snapshot.members.length===2,'Actual Durable Object joins two seats');
 response=await post(`/api/rooms/${code}/action`,{type:'start'},key);assert.equal(response.status,200);checks++;
 response=await post(`/api/rooms/${code}/action`,{type:'sql',query:"' OR 1=1 -- "},key);const executed=await response.json();
 assert.equal(response.status,200,JSON.stringify(executed));ok(executed.sql.rows.length===5,'Worker calls separate SQLite challenge Durable Object');
 const wsResponse=await mf.dispatchFetch(`http://neon.test/api/rooms/${code}/ws`,{headers:{Upgrade:'websocket','Sec-WebSocket-Protocol':'neon, '+joined.token}});
 assert.equal(wsResponse.status,101);checks++;const ws=wsResponse.webSocket;ws.accept();
 const update=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('No WebSocket update')),5000);ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.snapshot?.board?.notes?.some(n=>n.text==='Synchronized finding')){clearTimeout(timer);resolve(msg);}});});
 await post(`/api/rooms/${code}/action`,{type:'note',text:'Synchronized finding'},key);const synced=await update;
 ok(synced.snapshot.me===joined.snapshot.me,'WebSocket update is personalised and synchronizes another screen');
 await mf.unsafeEvictDurableObject('neon-test','GameRoom',{name:code,webSockets:'hibernate'});
 const restored=await mf.dispatchFetch(`http://neon.test/api/rooms/${code}/snapshot`,{headers:{Authorization:'Bearer '+key}});const saved=await restored.json();
 ok(saved.snapshot.board.notes.some(n=>n.text==='Synchronized finding'),'SQLite progress survives Durable Object eviction');
 const resumedMessage=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Hibernated WebSocket did not resume')),5000);ws.addEventListener('message',event=>{const x=JSON.parse(event.data);if(x.snapshot?.board?.notes?.some(n=>n.text==='After hibernation')){clearTimeout(timeout);resolve(x);}});});
 await post(`/api/rooms/${code}/action`,{type:'note',text:'After hibernation'},key);await resumedMessage;checks++;
 const hostResponse=await mf.dispatchFetch(`http://neon.test/api/rooms/${code}/ws`,{headers:{Upgrade:'websocket','Sec-WebSocket-Protocol':'neon, '+key}});const hostSocket=hostResponse.webSocket;hostSocket.accept();
 const transferred=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Host did not transfer')),5000);ws.addEventListener('message',event=>{const x=JSON.parse(event.data);if(x.snapshot?.host===joined.snapshot.me){clearTimeout(timeout);resolve(x);}});});
 hostSocket.close();await transferred;checks++;
 const denied=await post(`/api/rooms/${code}/action`,{type:'read',id:'reveal'},'bad-key');assert.equal(denied.status,401);checks++;
 const origin=await mf.dispatchFetch(`http://neon.test/api/rooms/${code}/action`,{method:'POST',headers:{Origin:'https://untrusted.test','Content-Type':'application/json'},body:JSON.stringify({type:'note',text:'forged'})});assert.equal(origin.status,403);checks++;
 // A host absent before any other connection must not strand the lobby.
 const alone=await (await post('/api/create',{name:'Absent host',language:'en'})).json();
 const replacement=await (await post(`/api/rooms/${alone.snapshot.code}/join`,{name:'New host'})).json();
 const late=await mf.dispatchFetch(`http://neon.test/api/rooms/${alone.snapshot.code}/ws`,{headers:{Upgrade:'websocket','Sec-WebSocket-Protocol':'neon, '+replacement.token}});
 late.webSocket.accept();
 const lobby=await (await mf.dispatchFetch(`http://neon.test/api/rooms/${alone.snapshot.code}/snapshot`,{headers:{Authorization:'Bearer '+replacement.token}})).json();
 ok(lobby.snapshot.host===replacement.snapshot.me,'Later online player takes over an absent host');
 const started=await post(`/api/rooms/${alone.snapshot.code}/action`,{type:'start'},replacement.token);assert.equal(started.status,200);checks++;
 late.webSocket.close();
 const malformed=await post(`/api/rooms/${code}/action`,null,key);assert.equal(malformed.status,400);checks++;
 const oversized=await mf.dispatchFetch(`http://neon.test/api/rooms/${code}/action`,{method:'POST',headers:{Authorization:'Bearer '+key},body:new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(' '.repeat(8193)));controller.close();}}),duplex:'half'});
 assert.equal(oversized.status,400);ok((await oversized.json()).error==='size','Streamed bodies are byte-limited without Content-Length');
 const unicode=await post(`/api/rooms/${code}/action`,{type:'note',text:'猫'.repeat(3000)},key);assert.equal(unicode.status,400);checks++;
 ws.close();
}finally{await mf.dispose();}
const report={checks_passed:checks,date:new Date().toISOString(),scope:'Engine, progressive private-discovery privacy and balancing, synchronized dialogue votes, interactive witness/static-render and expression mapping, localized quest guidance, isolated Cloudflare workerd/SQLite Durable Object and WebSocket synchronization; including real separate challenge SQLite and containment checks; not a browser or blind playtest',limits:['Desktop isolated UI fixture tested; full production Worker/browser end-to-end not tested','Not deployed to a Cloudflare account','No measured play duration','Mobile browser QA remains unverified']};
await writeFile('test-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
