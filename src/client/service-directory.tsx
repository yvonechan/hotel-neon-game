import React from 'react';
import type {Lang} from './rpg';
export function ServiceDirectory({lang,body,onOpenFile}:{lang:Lang;body:string;onOpenFile?:(name:string)=>void}){
 const t=(en:string,ja:string)=>lang==='ja'?ja:en;
 return <section className="service-directory" aria-label={t('Service-document folder structure','保守資料のフォルダ構成')}>
 <div className="directory-location"><span>{t('CURRENT FOLDER','現在のフォルダ')}</span><code>/public/launch/</code></div>
 <ul className="service-folder-tree"><li><span className="folder-name">▱ /</span><ul>
 <li><details open><summary>▱ public</summary><ul><li><details open><summary>▱ launch <em>{t('You are here','現在地')}</em></summary><ul className="public-file-list">{['readme.txt','service-index.txt','route-note.txt'].map(name=><li key={name}>{onOpenFile?<button onClick={()=>onOpenFile(name)}>▤ <code>{name}</code><span>↗</span></button>:<span>▤ <code>{name}</code></span>}</li>)}</ul></details></li></ul></details></li>
 </ul></li></ul>
 <p className="directory-rule">{t('Daichi: “I remember an older route document in a maintenance folder. It is not normally visible in this public viewer. Try searching the document index for words from the route sign.”','ダイチ：「古い経路資料はmaintenanceというフォルダにあったはず。公開ビューアでは普段見えないんです。設備表示の言葉で資料索引を検索してみてください。」')}</p>
 <div className="directory-tools"><b>{t('Separate hotel tools','ホテル内の別ツール')}</b><span>▷ {t('AV playback history','AV再生履歴')}</span><span>⊙ {t('Service-dock inventory','保守ドック一覧')}</span></div>
 <details className="original-source"><summary>{t('Original index text','元の索引テキスト')}</summary><pre>{body}</pre></details>
 </section>;
}
