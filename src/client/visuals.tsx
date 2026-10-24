import React from 'react';
import {openingBeats} from './intro';
import {BotFace} from './rpg';
export type Environment='lobby'|'sealed'|'ballroom'|'blackout'|'equipment'|'kuma'|'gallery'|'maintenance'|'spring'|'garden'|'lounge'|'spa'|'show';
export const environments:Environment[]=['lobby','sealed','ballroom','blackout','equipment','kuma','gallery','maintenance','spring','garden','lounge','spa','show'];
export const atlasPosition=(index:number)=>`${(index%3)*50}% ${Math.floor(index/3)*50}%`;
export type Emotion='neutral'|'happy'|'surprised'|'worried';
const emotionRow:Record<Emotion,number>={neutral:0,happy:1,surprised:2,worried:3};
export const expressionPosition=(character:number,emotion:Emotion)=>`${character*25}% ${emotionRow[emotion]*100/3}%`;
export const staffExpressionPosition=(character:number,emotion:Emotion)=>`${(character-5)*100/3}% ${emotionRow[emotion]*100/3}%`;
export function environmentFor(kind:string,chapter=1,step=0,sourceId?:string):Environment{
 if(kind==='opening'){const env=openingBeats[step]?.environment as Environment;return environments.includes(env)?env:'lobby';}
 if(kind==='ending')return 'ballroom';
 if(kind==='epilogue')return step<2?'maintenance':'spring';
 if(kind==='witnesses')return ['ballroom','ballroom','lobby','blackout'][step] as Environment||'lobby';
 if(kind==='suspects')return ['ballroom','maintenance','lobby','maintenance','gallery'][step] as Environment||'lobby';
 if(sourceId==='album-index')return 'gallery';
 if(sourceId==='board-locked')return 'equipment';
 return ({1:'equipment',2:'kuma',3:'lobby',4:'gallery',5:'maintenance',6:'ballroom'} as Record<number,Environment>)[chapter]||'lobby';
}
export function characterFor(speaker:string):number|'pip'|'kuma'|null{
 if(/^(PIP)(\b|$)/i.test(speaker))return 'pip';if(/^KUMA/i.test(speaker))return 'kuma';
 const names=[/\bMio\b|ミオ/,/\bRen\b|レン/,/\bAya\b|アヤ/,/\bDaichi\b|ダイチ/,/\bSora\b|ソラ/,/Hotel manager|^Manager$|支配人/,/Reception|受付/,/Stage technician|舞台担当/,/Guest|宿泊者/];
 const index=names.findIndex(pattern=>pattern.test(speaker));return index<0?null:index;
}
export function SceneArt({environment,className=''}:{environment:Environment;className?:string}){const intro=['garden','lounge','spa','show'].indexOf(environment);return <div aria-hidden="true" data-environment={environment} className={'scene-environment '+className} style={intro>=0?{backgroundImage:"url('/art/holiday-intro.png')",backgroundSize:'200% 200%',backgroundPosition:`${intro%2*100}% ${Math.floor(intro/2)*100}%`}:{backgroundPosition:atlasPosition(environments.indexOf(environment))}}/>}
export function SpeakerPortrait({speaker,emotion='neutral'}:{speaker:string;emotion?:Emotion}){const character=characterFor(speaker);if(character===null)return null;const core=typeof character==='number'&&character<5,staff=typeof character==='number'&&character>=5;return <div className="single-speaker" data-character={String(character)} data-emotion={emotion} aria-hidden="true">{character==='pip'||character==='kuma'?<BotFace pip={character==='pip'}/>:<div className={'portrait-atlas cutout-portrait '+(core?'expression-atlas':staff?'staff-expression-atlas':'')} style={{backgroundPosition:core?expressionPosition(character,emotion):staff?staffExpressionPosition(character,emotion):atlasPosition(character)}}/>}</div>}
export function recordCategory(tool:string){return ['settings','help','correspondence'].includes(tool)?'case':tool;}
