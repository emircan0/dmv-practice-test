import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStudyTool, generateStudyTool } from '../src/us/studyTools.ts';
const pool=Array.from({length:12},(_,i)=>({id:'q'+i,topic:i<6?'road-signs':'parking',correctIndex:0,options:['A','B']}));
const attempt=(state='CA',profile='general-first')=>({state,profile,questions:pool,answers:Object.fromEntries(pool.map((q,i)=>[q.id,i<6?1:0])),completedAt:100});
test('plans are based on real history and prioritize weaker topics across seven days',()=>{
 const result=buildStudyTool([attempt(),attempt('NY')],'CA','general-first','plan',pool,1000);
 assert.equal(result.answered,12);assert.equal(result.uniqueQuestions,12);assert.equal(result.correct,6);
 assert.equal(result.days.length,7);assert.equal(result.days[0].topic,'road-signs');assert.equal(result.days[0].goal,6);
 assert.equal(result.days[2].mode,'mistakes');assert.equal(result.topics[0].accuracy,0);
});
test('no data or repeatedly answering one question cannot spend credits or fabricate a plan',()=>{
 let balance=3,saved=0;
 const access={premium:false,credits:balance,save:()=>saved++,remove:()=>saved--,setCredits:n=>balance=n};
 assert.throws(()=>generateStudyTool(()=>buildStudyTool([],'CA','general-first','plan',pool),access),/study_data_needed/);
 assert.equal(balance,3);assert.equal(saved,0);
 const repeated=Array.from({length:10},()=>({...attempt(),questions:[pool[0]],answers:{q0:0}}));
 assert.throws(()=>buildStudyTool(repeated,'CA','general-first','report',pool),/study_data_needed/);
});
test('credit access spends exactly three on a successful generation, Premium spends none, failure refunds',()=>{
 let balance=6,records=[];
 const access=()=>({premium:false,credits:balance,save:a=>records.push(a),remove:a=>records=records.filter(x=>x!==a),setCredits:n=>balance=n});
 const create=()=>buildStudyTool([attempt()],'CA','general-first','report',pool,1000);
 const result=generateStudyTool(create,access());assert.equal(balance,3);assert.equal(records[0],result);
 generateStudyTool(create,{...access(),premium:true});assert.equal(balance,3);
 assert.throws(()=>generateStudyTool(create,{...access(),save:()=>{throw new Error('save failed')}}),/save failed/);assert.equal(balance,3);
 assert.throws(()=>generateStudyTool(create,{...access(),credits:2}),/insufficient_credits/);assert.equal(balance,3);
});
