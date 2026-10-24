import React from 'react';
import type {EvidencePresentation} from '../shared/evidence';
export function StructuredEvidence({presentation:p,body,lang}:{presentation:EvidencePresentation;body:string;lang:'en'|'ja'}){const t=(en:string,ja:string)=>lang==='ja'?ja:en;return <div className={'structured-evidence '+p.kind}>
 {p.fields&&<dl className="evidence-fields">{p.fields.map(([key,value],i)=><div key={i}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}
 {p.columns&&p.rows&&<div className="evidence-table-scroll"><table><thead><tr>{p.columns.map((column,i)=><th scope="col" key={i}>{column}</th>)}</tr></thead><tbody>{p.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
 {p.sections?.map((section,i)=><section className="report-section" key={i}><h3>{section.heading}</h3><p>{section.text}</p></section>)}
 {p.notes?.map((note,i)=><p className="evidence-caveat" key={i}>ⓘ {note}</p>)}
 <details className="original-source"><summary>{t('Original source record','元の記録を表示')}</summary><pre>{body}</pre></details></div>}
