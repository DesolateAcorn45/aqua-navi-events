'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {validate}=require('./site/feed-validation.js');
// Deterministic fictional fixture. Do not couple tests to the live feed's dates/count.
const feed={schemaVersion:1,timeZone:'Asia/Tokyo',sourcePolicy:'manual_official_verification',reviewedBy:'Test',publishedAt:'2026-10-16T00:00:00Z',validFrom:'2026-10-16',validThrough:'2026-10-18',completeRange:true,items:[{eventId:'fixture',eventName:'試験用予定',eventDate:'2026-10-16',startTime:'10:15',durationMinutes:10,venue:'試験場所',building:'south',floor:2,exhibitId:'kuroshio',sourceUrl:'https://nagoyaaqua.jp/calendar/',verifiedAt:'2026-10-16T00:00:00Z',verificationStatus:'reviewed',status:'scheduled'}]};
const now=Date.parse('2026-10-16T03:00:00Z');
test('reviewed three-day schedule is finite, unique and dated',()=>{
  const report=validate(feed,now);assert.equal(report.count,1);assert.equal(report.reviewed,1);
  assert.deepEqual(report.dates,['2026-10-16']);
});
test('publication refuses malformed dates, private fields, duplicates and location mismatches',()=>{
  for(const mutate of [j=>j.items[0].eventDate='2026-02-30',j=>j.photos=[],j=>j.items[0].memo='private',
    j=>j.items.push({...j.items[0],eventId:'different'}),j=>j.items[0].building=j.items[0].building==='south'?'north':'south',j=>j.items[0].floor=1,
    j=>j.items[0].startTime='24:00',j=>j.items[0].verifiedAt='2026-10-17T00:00:00Z',
    j=>j.items[0].sourceUrl='https://example.com/',j=>j.items[0].endTime='10:14']){
    const j=structuredClone(feed);mutate(j);assert.throws(()=>validate(j,now));
  }
});
test('pending and cancelled occurrences retain identity without becoming reviewed',()=>{
  const j=structuredClone(feed),id=j.items[0].eventId;j.items[0].verificationStatus='pending';j.items[0].status='cancelled';
  assert.equal(validate(j,now).reviewed,0);assert.equal(j.items[0].eventId,id);
});
