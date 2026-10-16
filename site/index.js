'use strict';
const el=id=>document.getElementById(id);let feed;
el('feed').href=new URL('events.json',location.href);el('feed').textContent=el('feed').href;
el('copy').onclick=async()=>{try{await navigator.clipboard.writeText(el('feed').href);el('copy').textContent='コピーしました';}catch{el('feed').focus();}};
el('date').value=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function render(){
  const date=el('date').value;el('events').replaceChildren();
  const items=feed.items.filter(e=>e.eventDate===date).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  el('status').textContent=`対象：${feed.validFrom}〜${feed.validThrough} / 公開：${new Date(feed.publishedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}（日本時間） / ${items.length}件`;
  if(!items.length){const p=document.createElement('p');p.textContent='この日の配信データはありません。公式スケジュールを確認してください。';el('events').append(p);}
  for(const e of items){const c=document.createElement('article'),title=document.createElement('h3'),detail=document.createElement('p'),source=document.createElement('a');
    const stale=Date.now()-Date.parse(e.verifiedAt)>7*86400000;
    title.textContent=`${e.startTime}　${e.eventName}`;detail.textContent=`${e.venue} / ${e.durationMinutes??(AquaFeed.clock(e.endTime)-AquaFeed.clock(e.startTime))}分 / ${e.status==='cancelled'?'中止':e.verificationStatus==='pending'||stale?'要確認':'公式資料照合済み'} / 確認：${new Date(e.verifiedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}`;
    source.textContent='公式出典';source.href=e.sourceUrl;c.append(title,detail,source);el('events').append(c);}
}
el('date').onchange=()=>{if(feed)render();};
fetch('events.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(j=>{AquaFeed.validate(j);feed=j;render();}).catch(()=>el('status').textContent='読み込めませんでした。公式スケジュールをご確認ください。');
