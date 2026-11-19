import test from 'node:test';
import assert from 'node:assert/strict';
import { storeOfferings, premiumStatus, lifetimeMonths } from '../src/us/commerceModel.ts';
const item=(id,period,category,price=9.99,currency='USD')=>({identifier:'pkg-'+id,product:{identifier:id,subscriptionPeriod:period,productCategory:category,price,priceString:'$'+price,currencyCode:currency,title:id,description:'Store description'}});
const ids={monthly:'us.monthly',lifetime:'us.lifetime'};
test('only explicitly configured monthly and lifetime products can be purchased',()=>{
 const offers=storeOfferings([item('old-app.lifetime',null,'NON_SUBSCRIPTION'),item(ids.monthly,'P1M','SUBSCRIPTION'),item(ids.lifetime,null,'NON_SUBSCRIPTION',19.99)],ids);
 assert.deepEqual(offers.map(o=>o.kind),['lifetime','monthly']);
 assert.equal(offers[0].price,'$19.99');
 assert.equal(lifetimeMonths(offers),2);
});
test('yearly, consumable-looking subscription periods, free and invalid prices are not relabeled as lifetime/monthly',()=>{
 assert.equal(storeOfferings([item(ids.monthly,'P1Y','SUBSCRIPTION'),item(ids.lifetime,'P1M','SUBSCRIPTION'),item(ids.monthly,'P1M','SUBSCRIPTION',0),item(ids.lifetime,null,'NON_SUBSCRIPTION',NaN)],ids).length,0);
});
test('price comparisons require matching currencies and verified entitlement determines access',()=>{
 const offers=storeOfferings([item(ids.monthly,'P1M','SUBSCRIPTION'),item(ids.lifetime,null,'NON_SUBSCRIPTION',19.99,'EUR')],ids);
 assert.equal(lifetimeMonths(offers),null);
 assert.equal(premiumStatus({entitlements:{active:{other:{isActive:true}}},managementURL:null},'premium').active,false);
 const status=premiumStatus({entitlements:{active:{premium:{isActive:true,productIdentifier:ids.lifetime,expirationDate:null}}},managementURL:null},'premium');
 assert.equal(status.active,true);assert.equal(status.expiresAt,null);
});
