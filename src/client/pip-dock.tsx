import React from 'react';
import type {Lang} from './rpg';
export function PipDockEvidence({lang,body,onEnlarge}:{lang:Lang;body:string;onEnlarge?:()=>void}){
 const t=(en:string,ja:string)=>lang==='ja'?ja:en;
 return <section className="pip-dock-evidence"><figure className="original-image"><button type="button" className="original-image-trigger" onClick={onEnlarge} aria-label={t('Enlarge stored dock image','保存されたドック画像を拡大')}><img src="/art/pip-dock-camera.webp" alt={t('PIP beside folded towels, with a blue trolley cover over its shoulders.','畳んだタオルの横で、青い台車カバーを肩に掛けたPIP。')}/></button><figcaption>{t('Stored intake-camera image · Linen Annex B · Click to enlarge','保存された受入カメラ画像・リネン別館B・クリックで拡大')}</figcaption></figure>
 <div className="wired-dock-panel"><h3>⌁ {t('Wired dock handshake','有線ドックの接続記録')}</h3><dl><div><dt>{t('Hardware serial','製造番号')}</dt><dd>PIP-004</dd></div><div><dt>{t('Location','所在地')}</dt><dd>LA-B · {t('Linen Annex B','リネン別館B')}</dd></div><div><dt>{t('Dock point / connected','ドック拠点／接続時刻')}</dt><dd>B-03 / 18:47</dd></div></dl><p>{t('The dock read the serial over its wired connection. The camera image alone does not verify identity.','製造番号はドックの有線接続で取得。カメラ画像だけで機体を識別したわけではありません。')}</p></div>
 <div className="pip-status-bubble"><b>PIP · {t('Stored status','保存ステータス')}</b><p>{t('CURRENT LOCATION: LINEN STORE.\nCURRENT QUALIFICATION: OVERQUALIFIED.\nTEAM HOLIDAY: INTERRUPTED—PLEASE RESUME AFTER RECOVERY.','現在地：リネン室。\n業務との適性：オーバースペック。\nチームの休暇：中断中――復旧後に再開してください。')}</p></div>
 <blockquote><b>{t('Hotel manager','支配人')}</b><p>{t('“That’s our robot. I’m sending staff to collect it now. We still need to explain who arranged this—and what the screen showed at 18:55.”','「うちのロボットですね。今すぐ職員に回収してもらいます。あとは、誰が手配したのか、18:55の画面は何だったのかを解明しましょう。」')}</p></blockquote>
 <details className="original-source"><summary>{t('Original dock report','元のドック報告')}</summary><pre>{body}</pre></details></section>;
}
