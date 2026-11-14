const CURRENCY_MARKERS = {
  NGN: ["NGN", "₦"],
  USD: ["USD", "$"],
  GBP: ["GBP", "£"],
  EUR: ["EUR", "€"]
};

const HEADER_ALIASES = {
  amount: ["amount", "actual amount", "expenditure", "expenditure amount", "spent", "paid", "total amount", "value"],
  category: ["category", "budget category", "expense category", "cost category", "budget line", "account code", "account name", "expense type"],
  date: ["date", "transaction date", "expense date", "payment date", "transaction date"],
  receipt: ["receipt reference", "receipt ref", "receipt no", "receipt number", "receipt id", "invoice no", "invoice number", "voucher no", "voucher number"],
  reference: ["reference", "transaction reference", "transaction id", "payment reference", "voucher reference"],
  description: ["description", "particulars", "narration", "details", "item"]
};

function normaliseHeader(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findColumn(headers, field) {
  const aliases = HEADER_ALIASES[field];
  const matches = headers.filter(header => {
    const normalized = normaliseHeader(header);
    return aliases.some(alias => normalized === alias || normalized.startsWith(alias + " "));
  });
  if (matches.length > 1) return { ambiguous: matches };
  return { header: matches[0] ?? null };
}

function parseAmountMinor(value, currency) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  let raw = String(value).trim();
  if (/^\(.*\)$/.test(raw) || raw.startsWith("-")) throw new Error("negative amounts and accounting parentheses require human review");
  const markerPattern = /^(NGN|USD|GBP|EUR|₦|\$|£|€)\s*|\s*(NGN|USD|GBP|EUR)$/i;
  const marker = raw.match(markerPattern);
  if (marker) {
    const token = (marker[1] ?? marker[2]).toUpperCase();
    const markerCurrency = token === "₦" ? "NGN" : token === "$" ? "USD" : token === "£" ? "GBP" : token === "€" ? "EUR" : token;
    if (markerCurrency !== currency) throw new Error("currency marker does not match the selected case currency");
    raw = raw.replace(markerPattern, "").trim();
  }
  raw = raw.replace(/[,\s]/g, "");
  if (!/^\d{1,12}(?:\.\d{1,2})?$/.test(raw)) throw new Error("amount is not a non-negative number with up to two decimal places");
  const [whole, fraction = ""] = raw.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor)) throw new Error("amount exceeds the supported range");
  return minor;
}

function parseIsoDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString().slice(0, 10);
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(text + "T00:00:00.000Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : null;
}

function normaliseCategory(value) {
  return String(value ?? "").normalize("NFKD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normaliseReference(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseSchedule(document, role, currency) {
  if (!document) return { status: "not_provided", rows: [], total_minor: null, issues: [] };
  const tableSegments = (document.segments ?? []).filter(segment => segment.cells && typeof segment.cells === "object" && !Array.isArray(segment.cells));
  if (!tableSegments.length) return {
    status: "unsupported",
    rows: [],
    total_minor: null,
    issues: [{ type: "table_structure_missing", document: document.name, message: "This file has no readable spreadsheet or CSV header-and-row structure. Upload a CSV or XLSX schedule with column headings." }]
  };
  const headers = Object.keys(tableSegments[0].cells);
  const columns = Object.fromEntries(Object.keys(HEADER_ALIASES).map(field => [field, findColumn(headers, field)]));
  const issues = [];
  for (const field of ["amount", ...(role === "budget" ? ["category"] : [])]) {
    if (columns[field].ambiguous) {
      issues.push({ type: "ambiguous_column", field, candidates: columns[field].ambiguous, document: document.name });
    } else if (!columns[field].header) {
      issues.push({ type: "missing_column", field, document: document.name });
    }
  }
  if (issues.length) return { status: "incomplete", rows: [], total_minor: null, issues, headers };

  const rows = [];
  let total = 0;
  for (const segment of tableSegments) {
    const cells = segment.cells;
    const rawAmount = cells[columns.amount.header];
    if (rawAmount === null || rawAmount === undefined || String(rawAmount).trim() === "") continue;
    const category = columns.category.header ? String(cells[columns.category.header] ?? "").trim() : "";
    const description = columns.description.header ? String(cells[columns.description.header] ?? "").trim() : "";
    if (/^(grand )?total$|^subtotal$/i.test(category || description)) continue;
    try {
      const amount_minor = parseAmountMinor(rawAmount, currency);
      if (amount_minor === null) continue;
      if (role === "budget" && !category) throw new Error("budget category is blank");
      const date = columns.date.header ? parseIsoDate(cells[columns.date.header]) : null;
      rows.push({
        locator: String(segment.locator ?? "Unknown row"),
        amount_minor,
        category,
        category_key: normaliseCategory(category),
        date,
        raw_date: columns.date.header ? String(cells[columns.date.header] ?? "").trim() : "",
        receipt_reference: columns.receipt.header ? String(cells[columns.receipt.header] ?? "").trim() : "",
        reference: columns.reference.header ? String(cells[columns.reference.header] ?? "").trim() : "",
        description
      });
      total += amount_minor;
      if (!Number.isSafeInteger(total)) throw new Error("schedule total exceeds the supported range");
    } catch (error) {
      issues.push({
        type: "invalid_row",
        document: document.name,
        locator: String(segment.locator ?? "Unknown row"),
        message: String(error.message).slice(0, 180)
      });
    }
  }
  if (document.truncated) issues.push({
    type: "truncated_document",
    document: document.name,
    message: "The extracted schedule reached the document limit; totals are partial and must not be treated as complete."
  });
  return {
    status: issues.length ? "incomplete" : "parsed",
    rows,
    total_minor: total,
    issues,
    headers,
    has_category: Boolean(columns.category.header),
    has_date: Boolean(columns.date.header),
    has_receipt: Boolean(columns.receipt.header),
    has_reference: Boolean(columns.reference.header)
  };
}

function compareTotals(schedule, enteredMinor, label) {
  if (schedule.status === "not_provided") return { status: "not_provided", label };
  if (schedule.total_minor === null || enteredMinor === null || enteredMinor === undefined) {
    return { status: "not_comparable", label, schedule_total_minor: schedule.total_minor, entered_total_minor: enteredMinor ?? null };
  }
  const difference_minor = schedule.total_minor - enteredMinor;
  return {
    status: difference_minor === 0 ? "matched" : "variance",
    label,
    schedule_total_minor: schedule.total_minor,
    entered_total_minor: enteredMinor,
    difference_minor
  };
}

export function reconcileFinancialSchedules({
  budgetSchedule = null,
  expenseSchedule = null,
  approvedBudgetMinor = null,
  reportedSpendMinor = null,
  currency = "NGN",
  periodStart = null,
  periodEnd = null
} = {}) {
  if (!budgetSchedule && !expenseSchedule) {
    return {
      status: "not_provided",
      summary: "No line-item financial schedules were supplied. The entered budget totals can still be compared separately.",
      currency,
      budget_schedule: null,
      expense_schedule: null,
      checks: []
    };
  }
  const budget = parseSchedule(budgetSchedule, "budget", currency);
  const expenses = parseSchedule(expenseSchedule, "expense", currency);
  const checks = [];
  const budgetTotal = compareTotals(budget, approvedBudgetMinor, "Approved budget schedule vs entered approved budget");
  const expenseTotal = compareTotals(expenses, reportedSpendMinor, "Expense schedule vs reported expenditure");
  if (budgetSchedule) checks.push({ type: "budget_schedule_total", ...budgetTotal });
  if (expenseSchedule) checks.push({ type: "expense_schedule_total", ...expenseTotal });

  const budgetByCategory = new Map();
  for (const row of budget.rows) {
    if (!row.category_key) continue;
    budgetByCategory.set(row.category_key, (budgetByCategory.get(row.category_key) ?? 0) + row.amount_minor);
  }
  const spendByCategory = new Map();
  for (const row of expenses.rows) {
    if (!row.category_key) continue;
    const current = spendByCategory.get(row.category_key) ?? { category: row.category, amount_minor: 0, locators: [] };
    current.amount_minor += row.amount_minor;
    current.locators.push(row.locator);
    spendByCategory.set(row.category_key, current);
  }
  const categoryVariances = [];
  if (budget.status !== "not_provided" && expenses.status !== "not_provided" && budget.status !== "unsupported" && expenses.status !== "unsupported") {
    for (const [key, actual] of spendByCategory) {
      const approved = budgetByCategory.get(key);
      if (approved === undefined) {
        categoryVariances.push({ type: "unbudgeted_category", category: actual.category, actual_minor: actual.amount_minor, locators: actual.locators });
      } else if (actual.amount_minor > approved) {
        categoryVariances.push({
          type: "category_over_budget",
          category: actual.category,
          approved_minor: approved,
          actual_minor: actual.amount_minor,
          variance_minor: actual.amount_minor - approved,
          locators: actual.locators
        });
      }
    }
  }
  checks.push(...categoryVariances);

  const referenceRows = new Map();
  for (const row of expenses.rows) {
    const value = row.receipt_reference || row.reference;
    const key = normaliseReference(value);
    if (!key) continue;
    const current = referenceRows.get(key) ?? { reference: value, locators: [] };
    current.locators.push(row.locator);
    referenceRows.set(key, current);
  }
  const duplicateReferences = [...referenceRows.values()].filter(item => item.locators.length > 1);
  for (const duplicate of duplicateReferences) checks.push({ type: "duplicate_reference", ...duplicate });

  const missingReceiptReferences = expenses.has_receipt
    ? expenses.rows.filter(row => !row.receipt_reference).map(row => ({ type: "missing_receipt_reference", locator: row.locator, description: row.description, amount_minor: row.amount_minor }))
    : [];
  checks.push(...missingReceiptReferences);

  const outsidePeriod = [];
  const unparsedDates = [];
  if (periodStart && periodEnd && expenses.has_date) {
    for (const row of expenses.rows) {
      if (!row.date) {
        if (row.raw_date) unparsedDates.push({ locator: row.locator, value: row.raw_date });
      } else if (row.date < periodStart || row.date > periodEnd) {
        outsidePeriod.push({ locator: row.locator, date: row.date, amount_minor: row.amount_minor });
      }
    }
  }
  checks.push(...outsidePeriod.map(item => ({ type: "outside_reporting_period", ...item })));

  const issues = [...budget.issues, ...expenses.issues];
  const attention = checks.some(check => ["variance", "category_over_budget", "unbudgeted_category", "duplicate_reference", "missing_receipt_reference", "outside_reporting_period"].includes(check.type) || check.status === "variance");
  const incomplete = issues.length > 0 || budget.status === "unsupported" || expenses.status === "unsupported" ||
    (budgetSchedule && budget.status !== "parsed") || (expenseSchedule && expenses.status !== "parsed");
  const suppliedCount = Number(Boolean(budgetSchedule)) + Number(Boolean(expenseSchedule));
  const status = incomplete ? "incomplete" : attention ? "attention_required" : suppliedCount === 2 ? "reconciled" : "partial";
  const issueCount = checks.filter(check => check.type !== "budget_schedule_total" && check.type !== "expense_schedule_total" || check.status === "variance").length;
  const summary = incomplete
    ? "The financial schedules could not be fully reconciled. Review the extraction or row-level issues before relying on these totals."
    : attention
      ? "The supplied schedules contain differences or evidence gaps that need human review. An overall budget underspend does not cancel a category-level overspend."
      : status === "reconciled"
        ? "The supplied budget and expense schedules reconcile to the entered totals, with no detected category overruns or duplicate/missing receipt references."
        : "A partial financial check was completed. Supply both the approved budget and expense schedules for category-level reconciliation.";

  return {
    status,
    summary,
    currency,
    schedule_totals: {
      budget_minor: budget.total_minor,
      expense_minor: expenses.total_minor
    },
    budget_schedule: budgetSchedule ? { name: budgetSchedule.name, status: budget.status, row_count: budget.rows.length, total_minor: budget.total_minor } : null,
    expense_schedule: expenseSchedule ? { name: expenseSchedule.name, status: expenses.status, row_count: expenses.rows.length, total_minor: expenses.total_minor } : null,
    checks,
    issues,
    unparsed_dates: unparsedDates,
    period: periodStart && periodEnd ? { start: periodStart, end: periodEnd } : null,
    notes: [
      "These checks are arithmetic and document-structure checks, not an audit or a determination of expense eligibility.",
      "A duplicate reference is a review flag, not proof that a payment or receipt is duplicated.",
      "A missing receipt reference means the schedule cell is blank; it does not prove that no receipt exists."
    ],
    issue_count: issueCount
  };
}
