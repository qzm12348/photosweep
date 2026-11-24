// PhotoSweep 工具栏弹窗脚本（管理额度显示、打开 Google 相册、重置悬浮面板位置）
const DAILY_FREE_LIMIT = 500;

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function renderStatus() {
  const data = await chrome.storage.local.get([
    "ps_is_pro",
    "ps_daily_date",
    "ps_daily_used",
    "ps_total_cleaned"
  ]);

  const badge = document.getElementById("license-badge");
  const quotaText = document.getElementById("quota-text");
  const totalText = document.getElementById("total-cleaned-text");

  const isPro = Boolean(data.ps_is_pro);
  const today = getTodayKey();
  const used = data.ps_daily_date === today ? Number(data.ps_daily_used || 0) : 0;
  const remaining = Math.max(0, DAILY_FREE_LIMIT - used);
  const totalCleaned = Number(data.ps_total_cleaned || 0);

  if (isPro) {
    badge.textContent = "PRO";
    badge.classList.add("pro");
    quotaText.textContent = "无限制 (PRO)";
  } else {
    badge.textContent = "FREE";
    badge.classList.remove("pro");
    quotaText.textContent = `${remaining} / ${DAILY_FREE_LIMIT}`;
  }

  totalText.textContent = `${totalCleaned} 项`;
}

document.getElementById("btn-open-photos").addEventListener("click", async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab && activeTab.url && activeTab.url.startsWith("https://photos.google.com")) {
    await chrome.tabs.sendMessage(activeTab.id, { type: "PHOTOSWEEP_SHOW_PANEL" }).catch(() => {});
    window.close();
    return;
  }
  await chrome.tabs.create({ url: "https://photos.google.com/" });
  window.close();
});

document.getElementById("btn-show-panel").addEventListener("click", async () => {
  const hint = document.getElementById("popup-hint");
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!activeTab || !activeTab.url || !activeTab.url.startsWith("https://photos.google.com")) {
    hint.textContent = "当前标签页不是 photos.google.com，请先点击上方按钮打开 Google 相册。";
    return;
  }

  try {
    await chrome.tabs.sendMessage(activeTab.id, { type: "PHOTOSWEEP_SHOW_PANEL", resetPosition: true });
    window.close();
  } catch (err) {
    hint.textContent = "页面尚未加载脚本，请刷新 Google 相册页面后重试。";
  }
});

renderStatus();
