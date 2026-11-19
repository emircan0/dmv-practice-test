import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdFrequency, showFullscreen } from '../src/us/adPolicy.ts';
function fakeAd(){
 const listeners=new Map();let destroyed=0,shown=0;
 return {addAdEventListener:(event,fn)=>{listeners.set(event,fn);return()=>listeners.delete(event)},load:()=>{},show:async()=>{shown++},destroy:()=>{destroyed++},emit:(event,payload)=>listeners.get(event)?.(payload),counts:()=>({destroyed,shown,listeners:listeners.size})};
}
const events={loaded:'loaded',closed:'closed',error:'error',earned:'earned'};
test('reward is granted once only from earned event; every ad is destroyed on close',async()=>{
 const ad=fakeAd();const result=showFullscreen(ad,events,()=>true);
 ad.emit('loaded');ad.emit('earned',{amount:3});ad.emit('earned',{amount:3});ad.emit('closed');
 assert.equal(await result,3);assert.deepEqual(ad.counts(),{shown:1,destroyed:1,listeners:0});
 const skipped=fakeAd();const none=showFullscreen(skipped,events,()=>true);skipped.emit('loaded');skipped.emit('closed');assert.equal(await none,0);
});
test('premium/session change before load cancels showing, errors and timeouts clean up',async()=>{
 const ad=fakeAd();const blocked=showFullscreen(ad,events,()=>false);ad.emit('loaded');assert.equal(await blocked,0);assert.equal(ad.counts().shown,0);
 const failed=fakeAd();const result=showFullscreen(failed,events,()=>true);failed.emit('error',new Error());await assert.rejects(result,/ad_unavailable/);assert.equal(failed.counts().destroyed,1);
 const timed=fakeAd();await assert.rejects(showFullscreen(timed,events,()=>true,1),/ad_unavailable/);assert.equal(timed.counts().listeners,0);
});
test('interstitials exclude exams/daily, duplicate visits, first two sessions, and rapid repeats',()=>{
 let now=1000;const next=createAdFrequency(()=>now);
 assert.equal(next('exam','exam'),false);assert.equal(next('daily','daily'),false);
 assert.equal(next('1','practice'),false);assert.equal(next('1','practice'),false);
 assert.equal(next('2','practice'),false);assert.equal(next('3','practice'),true);
 for(let i=4;i<9;i++)assert.equal(next(String(i),'practice'),false);
 now+=120001;assert.equal(next('9','practice'),true);
});
