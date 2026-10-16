'use strict';
const $=id=>document.getElementById(id);let feed,index=-1;
const specs={eventId:['ID（変更・中止時も維持）','text'],eventName:['イベント名','text'],eventDate:['開催日','date'],startTime:['開始時刻（日本時間）','time'],durationMinutes:['所要時間（分）','number'],venue:['開催場所','text'],building:['館',['north','south']],floor:['階','number'],exhibitId:['展示ID',Object.keys(AquaFeed.venues)],sourceUrl:['公式出典URL','url'],status:['状態',['scheduled','changed','cancelled']],eventDescription:['案内','text']};
for(const [k,[name,type]] of Object.entries(specs)){const label=document.createElement('label');label.textContent=name;const input=document.createElement(Array.isArray(type)?'select':'input');input.id=k;
  if(Array.isArray(type))for(const v of type){const o=document.createElement('option');o.value=v;o.textContent=v;input.append(o);}else input.type=type;label.append(input);$('fields').append(label);}
function blank(){return {schemaVersion:1,timeZone:'Asia/Tokyo',sourcePolicy:'manual_official_verification',reviewedBy:'',publishedAt:new Date().toISOString(),validFrom:'',validThrough:'',completeRange:false,items:[]};}
function error(e){$('result').textContent=e.message;}
function show(){
  $('reviewer').value=feed.reviewedBy;$('from').value=feed.validFrom;$('through').value=feed.validThrough;$('complete').checked=feed.completeRange;
  $('json').value=JSON.stringify(feed,null,2);$('items').replaceChildren();
  feed.items.forEach((e,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${e.eventDate} ${e.startTime} ${e.eventName}`;$('items').append(o);});
  if(feed.items.length){index=Math.min(Math.max(index,0),feed.items.length-1);$('items').value=index;edit();}else newItem();
}
function edit(){const e=feed.items[index];for(const k of Object.keys(specs))$(k).value=e?.[k]??'';$('review').checked=false;}
function newItem(){index=-1;for(const k of Object.keys(specs))$(k).value='';$('eventId').value='event_'+crypto.randomUUID().replaceAll('-','');$('status').value='scheduled';$('building').value='north';$('exhibitId').value='main_pool';$('floor').value=3;$('review').checked=false;}
$('new').onclick=newItem;$('items').onchange=()=>{index=Number($('items').value);edit();};
$('load').onclick=async()=>{try{const r=await fetch('events.json',{cache:'no-cache'});if(!r.ok)throw Error('配信を読み込めません');const j=await r.json();AquaFeed.validate(j);feed=j;show();$('result').textContent='読み込みました。';}catch(e){error(e);}};
$('file').onchange=async()=>{try{const f=$('file').files[0];if(!f)return;if(f.size>2*1024*1024)throw Error('ファイルが大きすぎます');const j=JSON.parse(await f.text());AquaFeed.validate(j);feed=j;show();}catch(e){error(e);}};
$('apply').onclick=()=>{try{const j=JSON.parse($('json').value);AquaFeed.validate(j);feed=j;show();}catch(e){error(e);}};
$('save').onclick=()=>{try{
  const old=index<0?{}:feed.items[index],e={...old};for(const k of Object.keys(specs))e[k]=['floor','durationMinutes'].includes(k)?Number($(k).value):$(k).value.trim();
  delete e.endTime;const changed=Object.keys(specs).some(k=>e[k]!==old[k]);
  if(changed||!old.verifiedAt){e.verificationStatus=$('review').checked?'reviewed':'pending';e.verifiedAt=new Date().toISOString();}
  else if($('review').checked){e.verificationStatus='reviewed';e.verifiedAt=new Date().toISOString();}
  const next=structuredClone(feed);if(index<0)next.items.push(e);else next.items[index]=e;
  next.publishedAt=new Date().toISOString();next.reviewedBy=$('reviewer').value.trim();next.validFrom=$('from').value;next.validThrough=$('through').value;
  AquaFeed.validate(next);feed=next;index=feed.items.indexOf(e);show();$('result').textContent='反映しました。未照合の変更は確認待ちになり、アプリの計画・通知には使用されません。';
}catch(e){error(e);}};
$('remove').onclick=()=>{if(index>=0){feed.items.splice(index,1);show();$('result').textContent='編集データから削除しました。開催中止は元のIDで中止に変更してください。';}};
$('download').onclick=()=>{try{
  const j={...feed,reviewedBy:$('reviewer').value.trim(),validFrom:$('from').value,validThrough:$('through').value,completeRange:$('complete').checked,publishedAt:new Date().toISOString()};
  const report=AquaFeed.validate(j);const url=URL.createObjectURL(new Blob([JSON.stringify(j,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='events.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  feed=j;show();$('result').textContent=`${report.count}件を書き出しました。照合済み${report.reviewed}件。GitHubへ反映して公開結果を確認してください。`;
}catch(e){error(e);}};
feed=blank();show();
