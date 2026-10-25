import React,{useEffect,useRef,useState} from 'react';
import type {Lang} from './rpg';
export type SupportAttachment='badge'|'case';
export function supportAttachment(kind:SupportAttachment,lang:Lang){
 const t=(en:string,ja:string)=>lang==='ja'?ja:en;
 const label=kind==='badge'?t('Staff badge image','職員証画像'):t('Case reference screenshot','案件番号のスクリーンショット');
 const common='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><rect width="900" height="560" rx="24" fill="#edf2ef"/><style>text{font-family:Arial,sans-serif;fill:#233e49}</style>';
 const svg=common+(kind==='badge'?`
 <rect width="900" height="115" rx="24" fill="#254f56"/><rect y="85" width="900" height="30" fill="#254f56"/><text x="42" y="72" style="fill:#f5dfae;font-size:38px;letter-spacing:5px">HOTEL NEON</text><text x="42" y="155" style="font-size:16px;letter-spacing:3px">${t('STAFF ACCESS CARD','職員アクセスカード')}</text>
 <rect x="42" y="185" width="205" height="240" rx="14" fill="#d3dfda"/><circle cx="145" cy="258" r="43" fill="#7d9995"/><path d="M66 401q0-99 79-99t79 99" fill="#7d9995"/>
 <text x="290" y="225" style="font-size:32px">${t('Incident Support','インシデントサポート')}</text><text x="290" y="275" style="font-size:22px">${t('Guest Services · Event Liaison','ゲストサービス・イベント連絡')}</text><text x="290" y="338" style="font-size:18px">${t('Badge reference','職員証番号')}</text><text x="290" y="378" style="font-size:31px;font-family:monospace">HN-IS-019</text>
 <path d="M46 468h808" stroke="#a1b7ac"/><text x="46" y="509" style="font-size:18px">${t('Hotel Operations','ホテル運営部')}</text><text x="661" y="509" style="font-size:17px">NEON / STAFF</text>`:`
 <rect width="900" height="75" rx="24" fill="#2c4354"/><rect y="45" width="900" height="30" fill="#2c4354"/><circle cx="34" cy="38" r="7" fill="#e09f92"/><circle cx="59" cy="38" r="7" fill="#e1c58e"/><circle cx="84" cy="38" r="7" fill="#9ac4ae"/><text x="120" y="46" style="fill:#ecf2ef;font-size:20px">NEON · ${t('Incident workspace','インシデント管理')}</text>
 <text x="42" y="132" style="font-size:15px;letter-spacing:3px">${t('CASE REFERENCE','案件参照')}</text><text x="42" y="189" style="font-size:44px">CASE-19</text><rect x="627" y="132" width="230" height="48" rx="24" fill="#d7e7df"/><text x="649" y="163" style="font-size:19px">${t('Support requested','サポート依頼あり')}</text>
 <path d="M42 218h815" stroke="#bacbc6"/><text x="42" y="264" style="font-size:21px">${t('Linked booking','関連予約')}</text><text x="355" y="264" style="font-size:28px;font-family:monospace">EQ-1842</text><text x="42" y="325" style="font-size:21px">${t('Equipment','機材')}</text><text x="355" y="325" style="font-size:23px">${t('Covered service trolley','カバー付き業務用台車')}</text><text x="42" y="386" style="font-size:21px">${t('Queue','キュー')}</text><text x="355" y="386" style="font-size:23px">${t('Maintenance search','保守検索')}</text>
 <rect x="42" y="429" width="815" height="84" rx="12" fill="#dfe8e8"/><text x="64" y="463" style="font-size:18px">${t('Hotel Incident Support','ホテルインシデントサポート')}</text><text x="64" y="494" style="font-size:17px">${t('Reference shared in conversation · 19:09','会話内で共有された案件参照・19:09')}</text>`)+ '</svg>';
 return {label,src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)};
}
export function SupportAttachments({lang}:{lang:Lang}){
 const [selected,setSelected]=useState<SupportAttachment|null>(null);const close=useRef<HTMLButtonElement>(null);const origin=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{if(selected)close.current?.focus();else origin.current?.focus()},[selected]);
 const t=(en:string,ja:string)=>lang==='ja'?ja:en;
 return <div className="support-attachments"><small>📎 {t('Attachments','添付ファイル')}</small><div>{(['badge','case'] as const).map(kind=>{const attachment=supportAttachment(kind,lang);return <button type="button" key={kind} onClick={e=>{origin.current=e.currentTarget;setSelected(kind)}}><img src={attachment.src} alt={attachment.label}/><span>{attachment.label}</span><small>⌕ {t('View image','画像を開く')}</small></button>})}</div>{selected&&<div className="support-attachment-viewer" role="dialog" aria-modal="true" aria-label={supportAttachment(selected,lang).label} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();setSelected(null)}if(e.key==='Tab'){e.preventDefault();close.current?.focus()}}}><button type="button" ref={close} onClick={()=>setSelected(null)}>{t('Close image','画像を閉じる')} ×</button><img src={supportAttachment(selected,lang).src} alt={supportAttachment(selected,lang).label}/><p>{supportAttachment(selected,lang).label}</p></div>}</div>;
}
