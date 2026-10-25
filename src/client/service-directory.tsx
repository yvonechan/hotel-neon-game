import React from 'react';
import type {Lang} from './rpg';
export function ServiceDirectory({lang,body,onOpenFile}:{lang:Lang;body:string;onOpenFile?:(name:string)=>void}){
 const t=(en:string,ja:string)=>lang==='ja'?ja:en;
 return <section className="service-directory" aria-label={t('Service-document folder structure','保守資料のフォルダ構成')}>
 <div className="directory-location"><span>{t('CURRENT FOLDER','現在のフォルダ')}</span><code>/public/launch/</code></div>
 <ul className="service-folder-tree"><li><span className="folder-name">▱ /</span><ul>
 <li><details open><summary>▱ public</summary><ul><li><details open><summary>▱ launch <em>{t('You are here','現在地')}</em></summary><ul className="public-file-list">{['readme.txt','service-index.txt','route-note.txt'].map(name=><li key={name}>{onOpenFile?<button onClick={()=>onOpenFile(name)}>▤ <code>{name}</code><span>↗</span></button>:<span>▤ <code>{name}</code></span>}</li>)}</ul></details></li></ul></details></li>
 <li><details open><summary>▱ archive <small>{t('Outside the current folder','現在のフォルダの外')}</small></summary><ul><li><details open><summary>▱ maintenance</summary><ul><li className="indexed-file">▤ <code>MNT-44.txt</code><small>{t('Listed in the index · current route revision','索引に記載・現行の経路改訂')}</small></li></ul></details></li></ul></details></li>
 <li><span className="folder-name">▱ media</span></li>
 </ul></li></ul>
 <p className="directory-rule">{t('Filenames are resolved relative to /public/launch/. This viewer is intended for public launch documents.','ファイル名は /public/launch/ を基準に解決します。このビューアの対象は公開実演資料です。')}</p>
 <div className="directory-tools"><b>{t('Separate hotel tools','ホテル内の別ツール')}</b><span>▷ {t('AV playback history','AV再生履歴')}</span><span>⊙ {t('Service-dock inventory','保守ドック一覧')}</span></div>
 <details className="original-source"><summary>{t('Original index text','元の索引テキスト')}</summary><pre>{body}</pre></details>
 </section>;
}
