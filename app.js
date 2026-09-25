/* ============================================================
   PocketPulse — app.js
   All MVP functionality:
     · Add / delete transactions
     · Per-category totals (Food, Transport, Fun)
     · Spending breakdown doughnut chart (Chart.js)
     · Monthly spending limit + progress bar
     · Category filter
     · Clear all
     · Dark / light mode toggle
     · LocalStorage persistence
   ============================================================ */

'use strict';

/* ── CONSTANTS ── */
const STORAGE_KEY        = 'pocketpulse_transactions';
const STORAGE_LIMIT_KEY  = 'pocketpulse_limit';
const STORAGE_THEME_KEY  = 'pocketpulse_theme';

const CATEGORY_META = {
  food:      { icon: '🍔', label: 'Food',      color: '#f59e0b' },
  transport: { icon: '🚗', label: 'Transport',  color: '#10b981' },
  fun:       { icon: '🎮', label: 'Fun',        color: '#ec4899' },
  other:     { icon: '📦', label: 'Other',      color: '#6c63ff' },
};

/* ── STATE ── */
let transactions = [];   // { id, desc, amount, category, date }
let spendingLimit = 0;   // 0 = not set
let chart = null;        // Chart.js instance

/* ── DOM REFS ── */
const form            = document.getElementById('transactionForm');
const txDescEl        = document.getElementById('txDesc');
const txAmountEl      = document.getElementById('txAmount');
const txCategoryEl    = document.getElementById('txCategory');
const txDateEl        = document.getElementById('txDate');
const descError       = document.getElementById('descError');
const amountError     = document.getElementById('amountError');

const totalSpendingEl = document.getElementById('totalSpending');
const txCountEl       = document.getElementById('txCount');
const totalFoodEl     = document.getElementById('totalFood');
const totalTransportEl= document.getElementById('totalTransport');
const totalFunEl      = document.getElementById('totalFun');

const txListEl        = document.getElementById('txList');
const emptyStateEl    = document.getElementById('emptyState');
const filterCategoryEl= document.getElementById('filterCategory');
const clearAllBtn     = document.getElementById('clearAllBtn');

const limitInput      = document.getElementById('limitInput');
const setLimitBtn     = document.getElementById('setLimitBtn');
const progressFill    = document.getElementById('progressFill');
const progressBar     = document.getElementById('progressBar');
const progressSpent   = document.getElementById('progressSpent');
const progressLimit   = document.getElementById('progressLimit');
const limitStatus     = document.getElementById('limitStatus');

const themeToggleBtn  = document.getElementById('themeToggleBtn');
const themeIcon       = document.getElementById('themeIcon');
const chartEmptyEl    = document.getElementById('chartEmpty');
const chartCanvas     = document.getElementById('spendingChart');

/* ── HELPERS ── */
const fmt = (n) => `$${Number(n).toFixed(2)}`;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function sumByCategory(cat) {
  return transactions
    .filter(t => t.category === cat)
    .reduce((a, t) => a + t.amount, 0);
}

function totalAll() {
  return transactions.reduce((a, t) => a + t.amount, 0);
}

/* ── LOCAL STORAGE ── */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_LIMIT_KEY, String(spendingLimit));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    transactions = raw ? JSON.parse(raw) : [];
  } catch { transactions = []; }

  const rawLimit = localStorage.getItem(STORAGE_LIMIT_KEY);
  spendingLimit = rawLimit ? parseFloat(rawLimit) : 0;
  if (spendingLimit > 0) limitInput.value = spendingLimit;
}

/* ── THEME ── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(STORAGE_THEME_KEY, theme);
  // update chart colours if chart exists
  if (chart) {
    chart.options.plugins.legend.labels.color = theme === 'dark' ? '#ede9fe' : '#1e1b4b';
    chart.update();
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ── CHART ── */
function buildChart() {
  const ctx = chartCanvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const data = {
    labels: ['Food', 'Transport', 'Fun', 'Other'],
    datasets: [{
      data: [
        sumByCategory('food'),
        sumByCategory('transport'),
        sumByCategory('fun'),
        sumByCategory('other'),
      ],
      backgroundColor: [
        CATEGORY_META.food.color,
        CATEGORY_META.transport.color,
        CATEGORY_META.fun.color,
        CATEGORY_META.other.color,
      ],
      borderWidth: 3,
      borderColor: isDark ? '#1a1730' : '#ffffff',
      hoverBorderWidth: 4,
      hoverOffset: 8,
    }],
  };

  if (chart) {
    chart.data.datasets[0].data = data.datasets[0].data;
    chart.data.datasets[0].borderColor = isDark ? '#1a1730' : '#ffffff';
    chart.update();
    return;
  }

  chart = new Chart(ctx, {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#ede9fe' : '#1e1b4b',
            padding: 16,
            font: { size: 13, weight: '600', family: "'Segoe UI', system-ui, sans-serif" },
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${fmt(ctx.parsed)}  (${ctx.label})`,
          },
          backgroundColor: isDark ? '#221f3a' : '#ffffff',
          titleColor: isDark ? '#ede9fe' : '#1e1b4b',
          bodyColor: isDark ? '#a78bfa' : '#6b7280',
          borderColor: isDark ? '#2e2a4a' : '#e5e0ff',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
        },
      },
      animation: {
        animateRotate: true,
        duration: 500,
      },
    },
  });
}

function updateChart() {
  const total = totalAll();
  const hasData = total > 0;

  if (hasData) {
    chartEmptyEl.classList.add('hidden');
    chartCanvas.style.display = 'block';
    buildChart();
  } else {
    chartEmptyEl.classList.remove('hidden');
    if (chart) {
      chart.data.datasets[0].data = [0, 0, 0, 0];
      chart.update();
    }
    chartCanvas.style.display = hasData ? 'block' : 'none';
  }
}

/* ── SUMMARY CARDS ── */
function updateSummary() {
  const total = totalAll();
  totalSpendingEl.textContent = fmt(total);
  txCountEl.textContent = `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`;
  totalFoodEl.textContent = fmt(sumByCategory('food'));
  totalTransportEl.textContent = fmt(sumByCategory('transport'));
  totalFunEl.textContent = fmt(sumByCategory('fun'));
}

/* ── SPENDING LIMIT ── */
function updateLimit() {
  const spent = totalAll();
  progressSpent.textContent = `Spent: ${fmt(spent)}`;

  if (!spendingLimit || spendingLimit <= 0) {
    progressFill.style.width = '0%';
    progressFill.className = 'progress-fill';
    progressBar.setAttribute('aria-valuenow', '0');
    progressLimit.textContent = 'Limit: —';
    limitStatus.textContent = '';
    limitStatus.className = 'limit-status';
    return;
  }

  const pct = Math.min((spent / spendingLimit) * 100, 100);
  progressFill.style.width = `${pct}%`;
  progressBar.setAttribute('aria-valuenow', pct.toFixed(0));
  progressLimit.textContent = `Limit: ${fmt(spendingLimit)}`;

  if (pct >= 100) {
    progressFill.className = 'progress-fill danger';
    limitStatus.textContent = `⚠️ Over limit by ${fmt(spent - spendingLimit)}!`;
    limitStatus.className = 'limit-status danger';
  } else if (pct >= 80) {
    progressFill.className = 'progress-fill warn';
    limitStatus.textContent = `⚡ Approaching limit — ${fmt(spendingLimit - spent)} remaining`;
    limitStatus.className = 'limit-status warn';
  } else {
    progressFill.className = 'progress-fill';
    limitStatus.textContent = `✅ ${fmt(spendingLimit - spent)} remaining`;
    limitStatus.className = 'limit-status normal';
  }
}

/* ── TRANSACTION LIST ── */
function categoryBadgeClass(cat) {
  return `tx-category-badge badge-${cat}`;
}

function renderList() {
  const filter = filterCategoryEl.value;
  const filtered = filter === 'all'
    ? [...transactions]
    : transactions.filter(t => t.category === filter);

  // show / hide empty state
  const isEmpty = filtered.length === 0;
  emptyStateEl.classList.toggle('hidden', !isEmpty);
  txListEl.innerHTML = '';

  if (isEmpty) return;

  // newest first
  [...filtered].reverse().forEach(tx => {
    const meta = CATEGORY_META[tx.category] || CATEGORY_META.other;
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.dataset.id = tx.id;

    const dateStr = tx.date
      ? new Date(tx.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    li.innerHTML = `
      <div class="tx-cat-icon">${meta.icon}</div>
      <div class="tx-info">
        <div class="tx-desc" title="${escapeHtml(tx.desc)}">${escapeHtml(tx.desc)}</div>
        <div class="tx-meta">
          <span class="${categoryBadgeClass(tx.category)}">${meta.label}</span>
          ${dateStr ? `<span>${dateStr}</span>` : ''}
        </div>
      </div>
      <span class="tx-amount">${fmt(tx.amount)}</span>
      <button class="tx-delete" aria-label="Delete transaction" title="Delete">✕</button>
    `;

    li.querySelector('.tx-delete').addEventListener('click', () => deleteTransaction(tx.id));
    txListEl.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── ADD TRANSACTION ── */
function validateForm() {
  let valid = true;
  descError.textContent   = '';
  amountError.textContent = '';

  const desc   = txDescEl.value.trim();
  const amount = parseFloat(txAmountEl.value);

  if (!desc) {
    descError.textContent = 'Please enter a description.';
    valid = false;
  }
  if (!txAmountEl.value || isNaN(amount) || amount <= 0) {
    amountError.textContent = 'Please enter a valid amount greater than 0.';
    valid = false;
  }
  return valid;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const tx = {
    id:       uid(),
    desc:     txDescEl.value.trim(),
    amount:   parseFloat(parseFloat(txAmountEl.value).toFixed(2)),
    category: txCategoryEl.value,
    date:     txDateEl.value || '',
  };

  transactions.push(tx);
  save();
  refreshAll();
  form.reset();
  // reset today's date after form reset
  txDateEl.value = todayISO();
  txDescEl.focus();
});

/* ── DELETE TRANSACTION ── */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  refreshAll();
}

/* ── CLEAR ALL ── */
clearAllBtn.addEventListener('click', () => {
  if (transactions.length === 0) return;
  if (!confirm('Clear all transactions? This cannot be undone.')) return;
  transactions = [];
  save();
  refreshAll();
});

/* ── SET LIMIT ── */
setLimitBtn.addEventListener('click', () => {
  const val = parseFloat(limitInput.value);
  if (!limitInput.value || isNaN(val) || val <= 0) {
    limitInput.classList.add('input-error');
    limitInput.focus();
    setTimeout(() => limitInput.classList.remove('input-error'), 1500);
    return;
  }
  spendingLimit = val;
  save();
  updateLimit();
});

limitInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') setLimitBtn.click();
});

/* ── FILTER ── */
filterCategoryEl.addEventListener('change', renderList);

/* ── THEME TOGGLE ── */
themeToggleBtn.addEventListener('click', toggleTheme);

/* ── REFRESH ALL ── */
function refreshAll() {
  updateSummary();
  updateLimit();
  updateChart();
  renderList();
}

/* ── DATE HELPER ── */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ── INIT ── */
(function init() {
  // Restore theme
  const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'light';
  applyTheme(savedTheme);

  // Set default date to today
  txDateEl.value = todayISO();

  // Load data
  load();
  refreshAll();
})();
