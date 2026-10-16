(function(root){
  'use strict';
  const venues={main_pool:['north',[2,3]],aurora:['north',[2,3]],kuroshio:['south',[2]],coral:['south',[1,2,3]],antarctic:['south',[3]],turtle_pool:['south',[2,3]]};
  const topKeys=['schemaVersion','timeZone','sourcePolicy','reviewedBy','publishedAt','validFrom','validThrough','completeRange','items'];
  const itemKeys=['eventId','eventName','eventDate','startTime','endTime','durationMinutes','venue','building','floor','exhibitId','eventDescription','sourceUrl','sourcePublishedAt','verifiedAt','verificationStatus','status'];
  function check(ok,message){if(!ok)throw Error(message);}
  function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v;}
  function instant(v){check(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(v)&&date(v.slice(0,10))&&Number.isFinite(Date.parse(v)),'タイムゾーン付きの有効な日時が必要です');return Date.parse(v);}
  function clock(v){check(typeof v==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v),'時刻はHH:mmです');return Number(v.slice(0,2))*60+Number(v.slice(3));}
  function text(v,label,max=300){check(typeof v==='string'&&v.trim().length>0&&v.length<=max,label+'を確認してください');}
  function keys(o,allowed){check(o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>allowed.includes(k)),'許可されていない項目があります。個人記録・写真は公開できません');}
  function validate(j,now=Date.now()){
    keys(j,topKeys);check(j.schemaVersion===1&&j.timeZone==='Asia/Tokyo'&&j.sourcePolicy==='manual_official_verification','配信形式が不正です');
    text(j.reviewedBy,'照合者',80);check(instant(j.publishedAt)<=now,'公開日時が未来です');
    check(date(j.validFrom)&&date(j.validThrough)&&j.validFrom<=j.validThrough,'対象期間が不正です');
    check(typeof j.completeRange==='boolean'&&Array.isArray(j.items)&&j.items.length<=1000,'予定一覧が不正です');
    const ids=new Set(),identities=new Set();
    for(const e of j.items){
      keys(e,itemKeys);text(e.eventId,'ID',120);check(/^[a-zA-Z0-9_-]+$/.test(e.eventId)&&!ids.has(e.eventId),'IDが不正または重複');ids.add(e.eventId);
      text(e.eventName,'イベント名',120);text(e.venue,'開催場所',120);
      check(date(e.eventDate)&&e.eventDate>=j.validFrom&&e.eventDate<=j.validThrough,'開催日が対象期間外です');
      const v=venues[e.exhibitId];check(v&&v[0]===e.building&&v[1].includes(e.floor),'展示ID・館・階が一致しません');
      const start=clock(e.startTime),duration=e.endTime==null?e.durationMinutes:clock(e.endTime)-start;
      check(Number.isInteger(duration)&&duration>0&&duration<=240&&start+duration<1440,'所要時間が不正です');
      if(e.endTime!=null&&e.durationMinutes!=null)check(duration===e.durationMinutes,'終了時刻と所要時間が一致しません');
      check(['scheduled','changed','cancelled'].includes(e.status)&&['reviewed','pending'].includes(e.verificationStatus),'状態が不正です');
      const verified=instant(e.verifiedAt);check(verified<=now&&verified<=instant(j.publishedAt),'確認日時が未来または公開日時より後です');
      if(e.sourcePublishedAt!=null)check(instant(e.sourcePublishedAt)<=verified,'出典公開日時が確認日時より後です');
      let u;try{u=new URL(e.sourceUrl);}catch{}check(u&&u.protocol==='https:'&&['nagoyaaqua.jp','www.nagoyaaqua.jp'].includes(u.hostname)&&!u.username&&!u.password&&!u.hash,'公式出典URLが必要です');
      if(e.eventDescription!=null)check(typeof e.eventDescription==='string'&&e.eventDescription.length<=1000,'説明が長すぎます');
      const identity=[e.eventDate,e.eventName.replace(/\s/g,'').toLowerCase(),e.startTime,e.exhibitId,e.floor].join('|');
      check(!identities.has(identity),'同じ予定が重複しています');identities.add(identity);
    }
    return {count:j.items.length,dates:[...new Set(j.items.map(e=>e.eventDate))].sort(),reviewed:j.items.filter(e=>e.verificationStatus==='reviewed').length};
  }
  const api={validate,date,clock,venues};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AquaFeed=api;
})(globalThis);
