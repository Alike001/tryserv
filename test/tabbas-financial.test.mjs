import test from "node:test";
import assert from "node:assert/strict";
import {reconcileFinancialSchedules} from "../tabbas-financial.mjs";

const budgetSchedule = {
  name: "approved-budget.csv",
  truncated: false,
  segments: [
    {locator: "Row 2", cells: {"Category": "Materials", "Approved amount NGN": "2000000"}},
    {locator: "Row 3", cells: {"Category": "Construction", "Approved amount NGN": "2000000"}},
    {locator: "Row 4", cells: {"Category": "Testing", "Approved amount NGN": "1000000"}}
  ]
};
const expenseSchedule = {
  name: "expense-schedule.csv",
  truncated: false,
  segments: [
    {locator: "Row 2", cells: {"Date": "2026-06-30T00:00:00.000Z", "Category": "Materials", "Description": "Pipes", "Amount NGN": "1400000", "Receipt reference": "REC-001"}},
    {locator: "Row 3", cells: {"Date": "2026-07-14", "Category": "Materials", "Description": "Fittings", "Amount NGN": "100000", "Receipt reference": "REC-001"}},
    {locator: "Row 4", cells: {"Date": "2026-08-02", "Category": "Construction", "Description": "Site works", "Amount NGN": "1200000", "Receipt reference": "REC-002"}},
    {locator: "Row 5", cells: {"Date": "2026-09-03", "Category": "Testing", "Description": "Water quality", "Amount NGN": "1800000", "Receipt reference": ""}}
  ]
};

test("reconciles schedule totals and exposes category overspend hidden by an overall underspend", () => {
  const result = reconcileFinancialSchedules({
    budgetSchedule,
    expenseSchedule,
    approvedBudgetMinor: 500000000,
    reportedSpendMinor: 450000000,
    currency: "NGN",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30"
  });
  assert.equal(result.status, "attention_required");
  assert.equal(result.schedule_totals.budget_minor, 500000000);
  assert.equal(result.schedule_totals.expense_minor, 450000000);
  assert.equal(result.checks.find(item => item.type === "budget_schedule_total").status, "matched");
  assert.equal(result.checks.find(item => item.type === "expense_schedule_total").status, "matched");
  const over = result.checks.find(item => item.type === "category_over_budget");
  assert.equal(over.category, "Testing");
  assert.equal(over.variance_minor, 80000000);
  assert.equal(result.checks.filter(item => item.type === "duplicate_reference").length, 1);
  assert.equal(result.checks.filter(item => item.type === "missing_receipt_reference").length, 1);
  assert.equal(result.checks.filter(item => item.type === "outside_reporting_period").length, 1);
  assert.match(result.summary, /underspend does not cancel/i);
});

test("reports an expense schedule variance against the narrative total", () => {
  const result = reconcileFinancialSchedules({
    expenseSchedule,
    reportedSpendMinor: 440000000,
    currency: "NGN"
  });
  const total = result.checks.find(item => item.type === "expense_schedule_total");
  assert.equal(total.status, "variance");
  assert.equal(total.difference_minor, 10000000);
  assert.equal(result.status, "attention_required");
});

test("does not treat an unsupported schedule as reconciled", () => {
  const malformed = {
    name: "expenses.csv",
    truncated: false,
    segments: [{locator: "Row 2", cells: {"Date": "2026-07-01", "Description": "Materials", "Cost": "1000"}}]
  };
  const result = reconcileFinancialSchedules({expenseSchedule: malformed, currency: "NGN"});
  assert.equal(result.status, "incomplete");
  assert.ok(result.issues.some(issue => issue.type === "missing_column" && issue.field === "amount"));
});

test("multiple XLSX worksheets are not silently combined",()=>{
 const workbook={
  name:"monthly-expenses.xlsx",truncated:false,
  segments:[
   {locator:"Sheet July · Row 2",cells:{"Category":"Travel","Amount":"1000"}},
   {locator:"Sheet August · Row 2",cells:{"Category":"Travel","Amount":"1500"}}
  ]
 };
 const result=reconcileFinancialSchedules({expenseSchedule:workbook,currency:"NGN"});
 assert.equal(result.status,"incomplete");
 assert.ok(result.issues.some(issue=>issue.type==="multiple_worksheets"));
});
test("inconsistent worksheet column sets fail visibly",()=>{
 const workbook={
  name:"multi-sheet.xlsx",truncated:false,
  segments:[
   {locator:"Row 2",cells:{"Category":"Materials","Amount":"1000"}},
   {locator:"Row 3",cells:{"Category":"Transport","Cost":"200"}}
  ]
 };
 const result=reconcileFinancialSchedules({expenseSchedule:workbook,currency:"NGN"});
 assert.equal(result.status,"incomplete");
 assert.ok(result.issues.some(issue=>issue.type==="inconsistent_columns"));
});
test("invalid amounts and truncated files make the result incomplete", () => {
  const malformed = {
    name: "expenses.csv",
    truncated: true,
    segments: [
      {locator: "Row 2", cells: {"Amount NGN": "1,00,00", "Receipt reference": "R-1"}},
      {locator: "Row 3", cells: {"Amount NGN": "2500", "Receipt reference": "R-2"}}
    ]
  };
  const result = reconcileFinancialSchedules({expenseSchedule: malformed, currency: "NGN"});
  assert.equal(result.status, "incomplete");
  assert.ok(result.issues.some(issue => issue.type === "invalid_row"));
  assert.ok(result.issues.some(issue => issue.type === "truncated_document"));
});

test("checks receipt references against separate supporting documents",()=>{
 const expenseSchedule={
  name:"actuals.csv",truncated:false,
  segments:[
   {locator:"Row 2",cells:{"Amount":"1000","Receipt reference":"REC-001"}},
   {locator:"Row 3",cells:{"Amount":"2000","Receipt reference":"REC-002"}}
  ]
 };
 const supportingDocuments=[{
  name:"receipt-bundle.txt",
  segments:[{locator:"Line 1",text:"Receipt REC-001 records a payment for approved materials."}]
 }];
 const result=reconcileFinancialSchedules({expenseSchedule,supportingDocuments,currency:"NGN"});
 assert.equal(result.status,"attention_required");
 assert.ok(result.checks.some(item=>item.type==="receipt_reference_found"&&item.reference==="REC-001"));
 assert.ok(result.checks.some(item=>item.type==="receipt_reference_not_found"&&item.reference==="REC-002"));
});
test("accepts correctly grouped currency values and converts to minor units",()=>{
 const schedule={
  name:"expenses.csv",truncated:false,
  segments:[{locator:"Row 2",cells:{"Amount":"NGN 1,250.00"}}]
 };
 const result=reconcileFinancialSchedules({expenseSchedule:schedule,reportedSpendMinor:125000,currency:"NGN"});
 assert.equal(result.status,"partial");
 assert.equal(result.schedule_totals.expense_minor,125000);
 assert.equal(result.checks.find(item=>item.type==="expense_schedule_total").status,"matched");
});
test("currency markers must agree with the case currency", () => {
  const foreignCurrency = {
    name: "expenses.csv",
    truncated: false,
    segments: [{locator: "Row 2", cells: {"Amount": "$100.00"}}]
  };
  const result = reconcileFinancialSchedules({expenseSchedule: foreignCurrency, currency: "NGN"});
  assert.equal(result.status, "incomplete");
  assert.match(result.issues[0].message, /currency marker/);
});

test("does not claim category reconciliation when the expense schedule has no category column",()=>{
 const budget={name:"budget.csv",truncated:false,segments:[{locator:"Row 2",cells:{"Category":"Travel","Amount":"1000"}}]};
 const expenses={name:"actuals.csv",truncated:false,segments:[{locator:"Row 2",cells:{"Amount":"500"}}]};
 const result=reconcileFinancialSchedules({budgetSchedule:budget,expenseSchedule:expenses,approvedBudgetMinor:100000,reportedSpendMinor:50000,currency:"NGN"});
 assert.equal(result.status,"partial");
 assert.match(result.summary,/category-level reconciliation was not possible/);
});
test("blank expense categories make a category schedule incomplete",()=>{
 const budget={name:"budget.csv",truncated:false,segments:[{locator:"Row 2",cells:{"Category":"Travel","Amount":"1000"}}]};
 const expenses={name:"actuals.csv",truncated:false,segments:[{locator:"Row 2",cells:{"Category":"","Amount":"500"}}]};
 const result=reconcileFinancialSchedules({budgetSchedule:budget,expenseSchedule:expenses,currency:"NGN"});
 assert.equal(result.status,"incomplete");
 assert.ok(result.issues.some(issue=>issue.type==="invalid_row"&&/expense category is blank/.test(issue.message)));
});
test("both schedules without entered control totals remain partial, not reconciled",()=>{
 const budget={name:"budget.csv",truncated:false,segments:[{locator:"Row 2",cells:{"Category":"Travel","Approved amount":"1000"}}]};
 const expenses={name:"actuals.csv",truncated:false,segments:[{locator:"Row 2",cells:{"Category":"Travel","Amount":"500"}}]};
 const result=reconcileFinancialSchedules({budgetSchedule:budget,expenseSchedule:expenses,currency:"NGN"});
 assert.equal(result.status,"partial");
 assert.match(result.summary,/control totals are missing/);
});
test("blank transaction dates make an explicit reporting-period check incomplete",()=>{
 const schedule={
  name:"actuals.csv",truncated:false,
  segments:[{locator:"Row 2",cells:{"Date":"","Amount":"1000"}}]
 };
 const result=reconcileFinancialSchedules({expenseSchedule:schedule,currency:"NGN",periodStart:"2026-07-01",periodEnd:"2026-09-30"});
 assert.equal(result.status,"incomplete");
 assert.ok(result.issues.some(issue=>issue.type==="unparsed_date"&&/blank/.test(issue.message)));
});
test("no schedule is reported as not provided rather than silently passed", () => {
  const result = reconcileFinancialSchedules({approvedBudgetMinor: 500000000, reportedSpendMinor: 450000000});
  assert.equal(result.status, "not_provided");
  assert.match(result.summary, /No line-item financial schedules/);
});
