import test from 'node:test';
import assert from 'node:assert/strict';
import {tenderPayload} from '../routes/tenderRoutes.js';
import {quotationPayload} from '../routes/quotationRoutes.js';
import {authorize} from '../middleware/authorize.js';

const user={_id:'507f1f77bcf86cd799439011'};

test('tender evaluation derives partial approval and controlled totals',()=>{
  const result=tenderPayload({title:'Test',hospitalName:'Hospital',status:'Under Evaluation',items:[
    {productName:'Mask',quantity:100,quotedRate:20,approvalStatus:'Approved',approvedQuantity:80,approvedRate:18},
    {productName:'Line',quantity:50,quotedRate:10,approvalStatus:'Rejected',approvedQuantity:0,approvedRate:0}
  ]},user);
  assert.equal(result.status,'Partially Approved');
  assert.equal(result.totalValue,2500);
  assert.equal(result.approvedValue,1440);
});

test('pending tender items keep the overall result under evaluation',()=>{
  const result=tenderPayload({title:'Test',hospitalName:'Hospital',status:'Approved',items:[
    {productName:'Mask',quantity:100,quotedRate:20,approvalStatus:'Approved',approvedQuantity:100,approvedRate:18},
    {productName:'Line',quantity:50,quotedRate:10,approvalStatus:'Pending'}
  ]},user);
  assert.equal(result.status,'Under Evaluation');
});

test('approved quantity cannot exceed the offered quantity',()=>{
  const result=tenderPayload({title:'Test',hospitalName:'Hospital',items:[
    {productName:'Mask',quantity:10,approvalStatus:'Approved',approvedQuantity:20,approvedRate:5}
  ]},user);
  assert.equal(result.items[0].approvedQuantity,10);
});

test('quotation totals are recalculated from quantity, discount and tax rate',()=>{
  const result=quotationPayload({clientName:'Hospital',items:[
    {description:'Mask',quantity:2,unitRate:100,discount:20,taxRate:10}
  ]},user);
  assert.equal(result.subtotal,200);
  assert.equal(result.discountTotal,20);
  assert.equal(result.taxTotal,18);
  assert.equal(result.grandTotal,198);
  assert.equal(result.items[0].lineTotal,198);
});

test('role middleware blocks users outside the allowed business function',()=>{
  const middleware=authorize('Director','Admin','Sales');
  let statusCode=200;let response;
  middleware({user:{role:'Inventory'}},{status(code){statusCode=code;return this},json(value){response=value}},()=>assert.fail('Unauthorized role reached next middleware'));
  assert.equal(statusCode,403);
  assert.match(response.message,/permission/i);
});
