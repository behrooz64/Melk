// ---------- Number helpers (Persian <-> Latin digits, formatting) ----------

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function toLatinDigits(str) {
  return String(str).replace(/[۰-۹]/g, d => FA_DIGITS.indexOf(d));
}

function parseNumber(str) {
  if (!str) return 0;
  const cleaned = toLatinDigits(str).replace(/[,،٬\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatInt(n) {
  n = Math.round(n);
  return n.toLocaleString('fa-IR');
}

function formatPercent(n, digits = 2) {
  return n.toLocaleString('fa-IR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + '٪';
}

// Live-format a plain number input as the user types, keeping caret sane.
function attachLiveFormatting(input) {
  input.addEventListener('input', () => {
    const raw = parseNumber(input.value);
    input.value = raw ? formatInt(raw) : '';
    calculate();
  });
}

// ---------- Elements ----------

const priceEl = document.getElementById('price');
const depositEl = document.getElementById('deposit');
const rentEl = document.getElementById('rent');
const rateEl = document.getElementById('rate');

const resultCard = document.getElementById('resultCard');
const emptyState = document.getElementById('emptyState');

const outDepositRent = document.getElementById('outDepositRent');
const outCashRent = document.getElementById('outCashRent');
const outTotalRent = document.getElementById('outTotalRent');
const outMonthlyRatio = document.getElementById('outMonthlyRatio');
const outAnnualYield = document.getElementById('outAnnualYield');

[priceEl, depositEl, rentEl, rateEl].forEach(attachLiveFormatting);

// ---------- Calculation (exact formula, no interpretation/thresholds) ----------
//
// depositRent = (deposit / 1,000,000,000) * ratePerBillion
// totalRent   = depositRent + cashRent
// monthlyRatio (%) = (totalRent / price) * 100
// annualYield  (%) = monthlyRatio * 12

function calculate() {
  const price = parseNumber(priceEl.value);
  const deposit = parseNumber(depositEl.value);
  const cashRent = parseNumber(rentEl.value);
  const ratePerBillion = parseNumber(rateEl.value) || 30000000;

  if (!price || (!cashRent && !deposit)) {
    resultCard.hidden = true;
    emptyState.hidden = false;
    return;
  }

  const depositRent = (deposit / 1000000000) * ratePerBillion;
  const totalRent = depositRent + cashRent;
  const monthlyRatio = (totalRent / price) * 100;
  const annualYield = monthlyRatio * 12;

  outDepositRent.textContent = formatInt(depositRent) + ' تومان';
  outCashRent.textContent = formatInt(cashRent) + ' تومان';
  outTotalRent.textContent = formatInt(totalRent) + ' تومان';
  outMonthlyRatio.textContent = formatPercent(monthlyRatio);
  outAnnualYield.textContent = formatPercent(annualYield);

  resultCard.hidden = false;
  emptyState.hidden = true;
}

// ---------- PWA install hint (Android Chrome doesn't always show a native prompt reliably) ----------

const installHint = document.getElementById('installHint');
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installHint.hidden = false;
});

const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;

if (isStandalone) {
  installHint.hidden = true;
}

// ---------- Service worker registration ----------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      // Offline install still works without SW registration succeeding on first paint.
    });
  });
}
