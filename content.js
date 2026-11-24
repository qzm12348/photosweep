// PhotoSweep — Google Photos 多语言防卡死批量清理扩展（Content Script）
(() => {
  "use strict";

  // 防止重复注入
  if (window.__photoSweepInitialized) return;
  window.__photoSweepInitialized = true;

  const DAILY_FREE_LIMIT = 500;
  // 首发每天免费 500 项，超出后提示 Pro 解锁
  const FREE_LAUNCH_UNLIMITED = false;
  const CHECKOUT_URL = "https://qzm12348.github.io/photosweep/";

  // 多语言界面文案（中文 / English）
  const I18N = {
    zh: {
      title: "PhotoSweep",
      freeBadge: (rem) => (FREE_LAUNCH_UNLIMITED ? "首发全免费" : `免费版: 今日剩 ${rem}/${DAILY_FREE_LIMIT}`),
      proBadge: "PRO 已解锁",
      quickFilters: "15GB 空间快捷筛选",
      filters: [
        { label: "全部照片", path: "/" },
        { label: "大视频", path: "/search/videos", sidebarMatch: ["video", "视频"] },
        { label: "截图录屏", path: "/search/screenshots", sidebarMatch: ["screenshot", "截图"] },
        { label: "最近添加", path: "/search/_tra_" },
        { label: "空间管理", path: "/quotamanagement" },
        { label: "回收站", path: "/trash" }
      ],
      modeLabel: "执行模式",
      modeDry: "安全预览 (仅勾选)",
      modeTrash: "自动移入回收站",
      yearFilterLabel: "只删指定年份及以前",
      yearAllOpt: "全部日期 (不过滤)",
      yearBeforeOpt: (y) => `${y} 年及以前`,
      searchJumpPlaceholder: "输入年份或关键词直达 (如 2023)",
      searchJumpBtn: "直达",
      searchNotFound: "未找到 Google 相册顶部搜索框，请先回到主相册页。",
      targetLabel: "本次处理上限",
      batchLabel: "每批清理条数",
      delayLabel: "点击间隔",
      skipStarred: "跳过已收藏 / 加星标照片",
      stats: (s, t, b) => `已选: ${s}  |  已移入回收站: ${t}  |  当前批次: ${b}`,
      start: "开始执行",
      pause: "暂停",
      resume: "继续",
      stop: "停止",
      unselectAll: "一键取消当前已选",
      unlimitedOpt: "无限制 (Pro)",
      proTitle: "解锁 PhotoSweep Pro 终身版 ($4.99)",
      proDesc: "免费版每天可批量处理 500 项。解锁 Pro 版即可解除每日上限，一键清空数万张照片与大视频，一次买断终身使用。",
      proCheckoutBtn: "前往购买 Pro 授权码 ($4.99 一次性买断)",
      proKeyPlaceholder: "输入 Pro 激活码（PS2.xxx...）",
      proActivateBtn: "激活授权",
      proCloseBtn: "稍后再说",
      keyInvalid: "激活码无效或格式有误，请检查完整复制。",
      keyEmailMismatch: (bound) => `该激活码已绑定邮箱 ${bound}，无法在当前 Google 账号使用。`,
      keySuccess: "Pro 授权已激活！无限制批量清理已开启。",
      logReady: "已就绪。提示：当前默认处于安全预览模式，可先勾选确认无误再删除。",
      logQuotaReached: "今日免费额度已用完（500/500），已自动暂停并打开 Pro 解锁窗口。",
      logNoMore: "当前页面没有更多可勾选的照片，任务结束。",
      logPaused: "已暂停，可随时点击“继续”或手动检查当前已选照片。",
      logStopped: "任务已停止。",
      logUnselecting: "正在取消当前页面已勾选的项目...",
      logUnselected: (n) => `已取消勾选 ${n} 项。`,
      logDryDone: (n) => `安全预览完成：共自动勾选 ${n} 张照片，请检查后手动删除或切换为“自动移入回收站”。`
    },
    en: {
      title: "PhotoSweep",
      freeBadge: (rem) => (FREE_LAUNCH_UNLIMITED ? "FREE EDITION" : `FREE: ${rem}/${DAILY_FREE_LIMIT} left today`),
      proBadge: "PRO UNLOCKED",
      quickFilters: "15GB Storage Quick Filters",
      filters: [
        { label: "All Photos", path: "/" },
        { label: "Videos", path: "/search/videos", sidebarMatch: ["video", "视频"] },
        { label: "Screenshots", path: "/search/screenshots", sidebarMatch: ["screenshot", "截图"] },
        { label: "Recent", path: "/search/_tra_" },
        { label: "Quota", path: "/quotamanagement" },
        { label: "Trash", path: "/trash" }
      ],
      modeLabel: "Execution Mode",
      modeDry: "Dry-Run (Select Only)",
      modeTrash: "Auto Move to Trash",
      yearFilterLabel: "Delete Year & Older",
      yearAllOpt: "All Dates (No Filter)",
      yearBeforeOpt: (y) => `${y} & Older`,
      searchJumpPlaceholder: "Jump to year/keyword (e.g. 2023)",
      searchJumpBtn: "Go",
      searchNotFound: "Search bar not found. Please navigate to main Photos view first.",
      targetLabel: "Target Limit",
      batchLabel: "Batch Size",
      delayLabel: "Click Delay",
      skipStarred: "Skip Favorited / Starred items",
      stats: (s, t, b) => `Selected: ${s}  |  Trashed: ${t}  |  Batch: ${b}`,
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
      unselectAll: "One-Click Unselect All",
      unlimitedOpt: "Unlimited (Pro)",
      proTitle: "Unlock PhotoSweep Pro Lifetime ($4.99)",
      proDesc: "Free tier supports up to 500 items/day. Upgrade once to unlock unlimited batch cleaning for huge libraries.",
      proCheckoutBtn: "Get Pro License ($4.99 One-Time)",
      proKeyPlaceholder: "Enter Pro license key (PS2.xxx...)",
      proActivateBtn: "Activate",
      proCloseBtn: "Close",
      keyInvalid: "Invalid license key. Please double-check you copied the full key.",
      keyEmailMismatch: (bound) => `This key is bound to ${bound} and cannot be used on another Google account.`,
      keySuccess: "Pro license activated! Unlimited cleaning unlocked.",
      logReady: "Ready. Safe Dry-Run mode is active by default.",
      logQuotaReached: "Daily free quota reached (500/500). Upgrade to Pro to continue.",
      logNoMore: "No more selectable items found in view. Finished.",
      logPaused: "Paused. Review selection or click Resume.",
      logStopped: "Stopped.",
      logUnselecting: "Clearing selected checkboxes...",
      logUnselected: (n) => `Unselected ${n} items.`,
      logDryDone: (n) => `Dry-Run complete: selected ${n} items for review.`
    }
  };

  // 多语言删除/回收站按钮关键词字典（覆盖 12+ 常见语种）
  const TRASH_KEYWORDS = [
    "move to trash",
    "delete",
    "移至回收站",
    "移到回收站",
    "移到垃圾桶",
    "移至垃圾桶",
    "删除",
    "刪除",
    "mover a la papelera",
    "eliminar",
    "supprimer",
    "mettre à la corbeille",
    "löschen",
    "in den papierkorb verschieben",
    "ゴミ箱に移動",
    "削除",
    "휴지통으로 이동",
    "삭제",
    "excluir",
    "mover para a lixeira",
    "удалить",
    "в корзину",
    "sposta nel cestino",
    "elimina"
  ];

  const CONFIRM_KEYWORDS = [
    "move to trash",
    "移至回收站",
    "移到回收站",
    "移到垃圾桶",
    "删除",
    "刪除",
    "确定",
    "確定",
    "got it",
    "allow",
    "delete",
    "ok",
    "mover a la papelera",
    "eliminar",
    "supprimer",
    "in den papierkorb",
    "ゴミ箱に移動",
    "휴지통으로 이동"
  ];

  const STAR_KEYWORDS = [
    "favorite",
    "unfavorite",
    "starred",
    "收藏",
    "已收藏",
    "星标",
    "取消收藏",
    "favorito",
    "favori"
  ];

  // 运行时状态
  const state = {
    lang: (document.documentElement.lang || navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en",
    mode: "dry", // "dry" | "trash"
    cutoffYear: "all", // "all" | "2025" | ...
    targetCount: 25, // 数字或 "unlimited"
    batchSize: 25,
    delayMs: 180,
    skipStarred: true,
    isPro: false,
    dailyUsed: 0,
    totalCleaned: 0,
    running: false,
    paused: false,
    stopRequested: false,
    sessionSelected: 0,
    sessionTrashed: 0,
    currentBatch: 0,
    minimized: false
  };

  function getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ECDSA P-256 公钥（仅用于离线验签，私钥保存在开发者本地，无法伪造激活码）
  const LICENSE_PUBLIC_KEY_JWK = {
    kty: "EC",
    crv: "P-256",
    x: "crUmuMaUMxAKTMIitNzY4M2pP4WpY1nSJ5f15DZfUSc",
    y: "gbh5xQ4nk_IrJk0r8SkjTA9Ni9tpYWZ1rBNAg4R0thU"
  };

  function fromBase64Url(str) {
    const pad = "=".repeat((4 - (str.length % 4)) % 4);
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function detectCurrentGoogleEmail() {
    try {
      const candidates = document.querySelectorAll(
        'a[aria-label*="@"], button[aria-label*="@"], [data-email*="@"]'
      );
      const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      for (const el of candidates) {
        const text = el.getAttribute("data-email") || el.getAttribute("aria-label") || "";
        const m = emailRe.exec(text);
        if (m) return m[0].toLowerCase();
      }
    } catch (_) {}
    return "";
  }

  function maskEmail(email) {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, Math.min(2, name.length))}***@${domain}`;
  }

  // 离线非对称公钥验签：格式 PS2.<base64url(email)>.<base64url(ecdsa_p256_sig)>
  async function validateLicenseKey(raw) {
    try {
      const key = String(raw || "").trim();
      const parts = key.split(".");
      if (parts.length !== 3 || parts[0] !== "PS2") {
        return { valid: false, reason: "invalid" };
      }
      const email = new TextDecoder().decode(fromBase64Url(parts[1])).trim().toLowerCase();
      const sigBytes = fromBase64Url(parts[2]);
      if (!email || sigBytes.length < 32) {
        return { valid: false, reason: "invalid" };
      }
      const pubKey = await crypto.subtle.importKey(
        "jwk",
        LICENSE_PUBLIC_KEY_JWK,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );
      const data = new TextEncoder().encode(`PS2|${email}`);
      const ok = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        pubKey,
        sigBytes,
        data
      );
      if (!ok) return { valid: false, reason: "invalid" };

      const currentEmail = detectCurrentGoogleEmail();
      if (currentEmail && currentEmail !== email) {
        return { valid: false, reason: "email_mismatch", boundEmail: maskEmail(email) };
      }
      return { valid: true, email };
    } catch (_) {
      return { valid: false, reason: "invalid" };
    }
  }

  async function loadPersistedState() {
    try {
      const data = await chrome.storage.local.get([
        "ps_is_pro",
        "ps_daily_date",
        "ps_daily_used",
        "ps_total_cleaned",
        "ps_lang",
        "ps_delay_ms"
      ]);
      const today = getTodayKey();
      state.isPro = Boolean(data.ps_is_pro);
      state.dailyUsed = data.ps_daily_date === today ? Number(data.ps_daily_used || 0) : 0;
      state.totalCleaned = Number(data.ps_total_cleaned || 0);
      if (data.ps_lang === "zh" || data.ps_lang === "en") {
        state.lang = data.ps_lang;
      }
      if (typeof data.ps_delay_ms === "number") {
        state.delayMs = data.ps_delay_ms;
      }
      if (data.ps_daily_date !== today) {
        await chrome.storage.local.set({ ps_daily_date: today, ps_daily_used: 0 });
      }
    } catch (e) {
      // 忽略扩展上下文热重载异常
    }
  }

  async function incrementDailyUsed(delta) {
    if (delta <= 0) return;
    state.dailyUsed += delta;
    state.totalCleaned += delta;
    try {
      await chrome.storage.local.set({
        ps_daily_date: getTodayKey(),
        ps_daily_used: state.dailyUsed,
        ps_total_cleaned: state.totalCleaned
      });
    } catch (e) {
      // 忽略存储异常
    }
    refreshQuotaBadge();
  }

  function getRemainingFreeQuota() {
    if (FREE_LAUNCH_UNLIMITED || state.isPro) return Infinity;
    return Math.max(0, DAILY_FREE_LIMIT - state.dailyUsed);
  }

  // -------------------- DOM 自动化核心引擎 --------------------

  function isElementVisible(el, allowZeroOpacity = false) {
    if (!el || !el.isConnected) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    if (!allowZeroOpacity && style.opacity === "0") {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isInExtensionUi(el) {
    return Boolean(el.closest("#photosweep-panel") || el.closest("#photosweep-pro-modal"));
  }

  // 判断复选框是否属于主区域的照片/视频条目（排除侧边栏、顶部导航和插件自身面板）
  function isPhotoItemCheckbox(cb) {
    if (!cb || !cb.isConnected || isInExtensionUi(cb)) return false;
    // Google 相册未悬停照片的复选框默认 opacity: 0，因此必须允许零透明度
    if (!isElementVisible(cb, true)) return false;

    const rect = cb.getBoundingClientRect();
    if (rect.width <= 12 || rect.height <= 12) return false;
    if (rect.top < 48) return false;

    // 排除顶部栏固定工具按钮区域、左侧导航栏及弹窗
    if (cb.closest("header, nav, [role='banner'], [role='navigation'], [role='dialog']")) {
      return false;
    }

    // 排除日期分组头部的“选择以下日期的所有照片”全选框，避免点一下选中整天但只计 1 张
    const aria = (cb.getAttribute("aria-label") || "").toLowerCase();
    if (
      aria.includes("选择以下日期") ||
      aria.includes("select all") ||
      aria.includes("seleccionar todas") ||
      aria.includes("tout sélectionner") ||
      aria.includes("alle auswählen") ||
      aria.includes("すべて選択") ||
      aria.includes("모두 선택")
    ) {
      return false;
    }
    const parentTile = cb.parentElement;
    if (parentTile && parentTile.querySelector("h2, h3")) {
      return false;
    }

    // 命中已知 Google Photos 类、主内容区或带有照片选择语义的复选框
    const inMain = Boolean(cb.closest("c-wiz, [role='main'], main"));
    const isGphotoClass = cb.classList.contains("ckGgle") || Boolean(cb.closest(".ckGgle"));

    if (isGphotoClass || inMain) return true;
    if (aria && (aria.includes("select") || aria.includes("选择") || aria.includes("photo") || aria.includes("照片") || aria.includes("video") || aria.includes("视频"))) {
      return true;
    }
    return false;
  }

  // 判断当前照片节点是否带“收藏/星标”标记
  function isTileStarred(cb) {
    const tile = cb.closest("[data-latest-bg], [jsaction], div[style*='transform']") || cb.parentElement?.parentElement;
    if (!tile) return false;
    const starCandidate = tile.querySelector("[aria-label], [data-tooltip]");
    if (starCandidate) {
      const label = (
        (starCandidate.getAttribute("aria-label") || "") +
        " " +
        (starCandidate.getAttribute("data-tooltip") || "")
      ).toLowerCase();
      if (STAR_KEYWORDS.some((kw) => label.includes(kw))) {
        return true;
      }
    }
    // 检查星形 SVG path 特征
    const paths = tile.querySelectorAll("svg path");
    for (const p of paths) {
      const d = p.getAttribute("d") || "";
      if (d.includes("12 17.27") || d.includes("M12 17.27")) {
        return true;
      }
    }
    return false;
  }

  function getMainRoot() {
    return document.body;
  }

  // 获取当前已挂载的照片复选框列表
  function getPhotoCheckboxes(onlyUnchecked = false) {
    const root = getMainRoot();
    const candidates = Array.from(root.querySelectorAll('[role="checkbox"]'));
    return candidates.filter((cb) => {
      if (!isPhotoItemCheckbox(cb)) return false;
      if (onlyUnchecked) {
        return cb.getAttribute("aria-checked") !== "true";
      }
      return true;
    });
  }

  function getSelectedCountInDom() {
    return getPhotoCheckboxes(false).filter((cb) => cb.getAttribute("aria-checked") === "true").length;
  }

  // 收集当前视口内的日期分组标题及其年份（无 4 位年份时视为当年）
  function collectDateHeaders() {
    const currentYear = new Date().getFullYear();
    const nodes = Array.from(
      document.querySelectorAll(
        'h2, [role="checkbox"][aria-label*="选择以下日期"], [role="checkbox"][aria-label*="Select all"]'
      )
    ).filter((el) => !isInExtensionUi(el) && isElementVisible(el, true));

    return nodes
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const raw = ((el.textContent || "") + " " + (el.getAttribute("aria-label") || "")).trim();
        if (!raw) return null;
        const yearMatch = raw.match(/(19|20)\d{2}/);
        const year = yearMatch ? Number(yearMatch[0]) : currentYear;
        return { top: rect.top, year };
      })
      .filter(Boolean)
      .sort((a, b) => a.top - b.top);
  }

  function getCheckboxYear(cb, headers) {
    if (!headers || headers.length === 0) return null;
    const cbTop = cb.getBoundingClientRect().top;
    let matchedYear = null;
    for (const h of headers) {
      if (h.top <= cbTop + 16) {
        matchedYear = h.year;
      } else {
        break;
      }
    }
    return matchedYear;
  }

  // 利用 Google 相册顶部原生搜索框直达年份或关键词（零 404 风险）
  async function jumpToSearchQuery(query) {
    const q = String(query || "").trim();
    if (!q) return;
    const searchBtn = document.querySelector(
      'button[aria-label*="搜索"], button[aria-label*="Search"]'
    );
    if (searchBtn && isElementVisible(searchBtn) && !isInExtensionUi(searchBtn)) {
      triggerClick(searchBtn);
      await sleep(200);
    }
    const input = Array.from(
      document.querySelectorAll('input[type="text"], input[aria-label*="搜索"], input[aria-label*="Search"], input[placeholder*="搜索"], input[placeholder*="Search"]')
    ).find((el) => !isInExtensionUi(el) && isElementVisible(el));

    if (!input) {
      appendLog(I18N[state.lang].searchNotFound, "warn");
      return;
    }

    input.focus();
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    if (nativeSetter) {
      nativeSetter.call(input, q);
    } else {
      input.value = q;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(120);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true })
    );
    input.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true })
    );
  }

  // 稳健模拟用户点击（兼容 Google Photos 的 jsaction 事件捕获）
  function triggerClick(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const common = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: cx,
      clientY: cy
    };
    try {
      el.dispatchEvent(new PointerEvent("pointerdown", { ...common, pointerId: 1, isPrimary: true }));
      el.dispatchEvent(new MouseEvent("mousedown", common));
      el.dispatchEvent(new PointerEvent("pointerup", { ...common, pointerId: 1, isPrimary: true }));
      el.dispatchEvent(new MouseEvent("mouseup", common));
      el.click();
    } catch (e) {
      el.click();
    }
  }

  // 第一至第三层回退：触发工具栏删除/移至回收站操作
  async function triggerTrashAction() {
    const buttons = Array.from(document.querySelectorAll("button, [role='button']")).filter((btn) => {
      if (!isElementVisible(btn) || isInExtensionUi(btn)) return false;
      const rect = btn.getBoundingClientRect();
      // 工具栏按钮一般位于页面顶部区域
      return rect.top < 140;
    });

    // 第 1 层：通过多语言 aria-label / title / 文本匹配工具栏按钮
    for (const btn of buttons) {
      const text = [
        btn.getAttribute("aria-label") || "",
        btn.getAttribute("data-tooltip") || "",
        btn.getAttribute("title") || "",
        btn.textContent || ""
      ]
        .join(" ")
        .toLowerCase()
        .trim();
      if (!text) continue;
      if (TRASH_KEYWORDS.some((kw) => text.includes(kw))) {
        appendLog(state.lang === "zh" ? "命中 Layer-1 多语言按钮，正在点击回收站..." : "Layer-1 match: clicking Trash button...", "ok");
        triggerClick(btn);
        return true;
      }
    }

    // 第 2 层：检查顶部工具栏内 Google Material Trash SVG 路径
    const trashSvgFragments = [
      "M15 4V3H9v1H4v2h1v13",
      "M6 19c0 1.1.9 2 2 2h8",
      "M6 7H5v13",
      "M19 4h-3.5l-1-1h-5l-1 1H5v2h14"
    ];
    for (const btn of buttons) {
      const paths = btn.querySelectorAll("svg path");
      for (const p of paths) {
        const d = (p.getAttribute("d") || "").replace(/\s+/g, " ");
        if (trashSvgFragments.some((frag) => d.includes(frag))) {
          appendLog(state.lang === "zh" ? "命中 Layer-2 垃圾桶 SVG 图标，正在点击..." : "Layer-2 match: clicking Trash SVG icon...", "ok");
          triggerClick(btn);
          return true;
        }
      }
    }

    // 第 3 层：派发 Google Photos 原生删除快捷键（# = Shift+3，以及 Delete 键）
    appendLog(state.lang === "zh" ? "尝试 Layer-3 原生快捷键 (# / Delete)..." : "Trying Layer-3 keyboard shortcut (# / Delete)...", "warn");
    const target = document.activeElement || document.body;
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "#",
        code: "Digit3",
        keyCode: 51,
        which: 51,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
    );
    target.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "#",
        code: "Digit3",
        keyCode: 51,
        which: 51,
        shiftKey: true,
        bubbles: true
      })
    );
    await sleep(180);
    if (!findConfirmDialog()) {
      target.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Delete",
          code: "Delete",
          keyCode: 46,
          which: 46,
          bubbles: true,
          cancelable: true
        })
      );
    }
    return true;
  }

  function findConfirmDialog() {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"], div[aria-modal="true"]')).filter(
      (d) => isElementVisible(d) && !isInExtensionUi(d)
    );
    return dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
  }

  // 轮询等待确认弹窗并在 3 秒内自动确认
  async function waitForAndConfirmDialog() {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      if (state.stopRequested) return false;
      const dialog = findConfirmDialog();
      if (dialog) {
        // 先检查标准 MDC 确认按钮属性
        const mdcOk = dialog.querySelector('button[data-mdc-dialog-action="ok"], [data-mdc-dialog-action="accept"]');
        if (mdcOk && isElementVisible(mdcOk)) {
          triggerClick(mdcOk);
          return true;
        }

        const dialogBtns = Array.from(dialog.querySelectorAll("button, [role='button']")).filter((b) => isElementVisible(b));
        // 多语言确认文案匹配
        for (const btn of dialogBtns) {
          const txt = (
            (btn.textContent || "") +
            " " +
            (btn.getAttribute("aria-label") || "")
          )
            .toLowerCase()
            .trim();
          if (CONFIRM_KEYWORDS.some((kw) => txt.includes(kw))) {
            triggerClick(btn);
            return true;
          }
        }

        // 回退：点选对话框底部最后一个主按钮（Cancel 通常在左，Confirm 通常在右）
        if (dialogBtns.length > 0) {
          triggerClick(dialogBtns[dialogBtns.length - 1]);
          return true;
        }
      }
      await sleep(150);
    }
    return false;
  }

  // 查找当前主照片区域实际可滚动容器（排除左侧边栏/顶部栏窄容器）
  function findScrollableContainer() {
    const mainArea = document.querySelector("c-wiz[role='main'], [role='main'], main");
    const candidates = Array.from((mainArea || document.body).querySelectorAll("div, c-wiz"));
    const nested = candidates.find((node) => {
      if (isInExtensionUi(node) || node.closest("nav, header, [role='navigation'], [role='banner']")) {
        return false;
      }
      const st = window.getComputedStyle(node);
      return (
        (st.overflowY === "auto" || st.overflowY === "scroll") &&
        node.scrollHeight > node.clientHeight + 40 &&
        node.clientWidth > 300
      );
    });
    if (nested) return nested;

    // 向上查找主区域父级滚动容器
    let el = mainArea;
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      if (
        (style.overflowY === "auto" || style.overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight + 20 &&
        el.clientWidth > 300
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  }

  function getTimelineSliderValue() {
    const slider = document.querySelector('[role="slider"]');
    if (!slider) return null;
    const val = Number(slider.getAttribute("aria-valuenow"));
    return Number.isFinite(val) ? val : null;
  }

  async function smartScrollStep() {
    const container = findScrollableContainer();
    const delta = Math.round(window.innerHeight * 0.75);
    const beforeScroll = container === window ? window.scrollY : container.scrollTop;
    const beforeSlider = getTimelineSliderValue();
    const beforePhotos = new Set(
      Array.from(document.querySelectorAll('a[href*="/photo/"]')).map((a) => a.getAttribute("href"))
    );

    if (container === window) {
      window.scrollBy({ top: delta, behavior: "smooth" });
    } else {
      container.scrollBy({ top: delta, behavior: "smooth" });
    }

    // 同时将当前可见最后一张照片滚动到顶部，并派发 wheel 事件兼容虚拟列表驱动
    const photoNodes = getPhotoCheckboxes(false);
    if (photoNodes.length > 0) {
      photoNodes[photoNodes.length - 1].scrollIntoView({ block: "start", behavior: "smooth" });
    }
    const wheelTarget = container === window ? (document.querySelector("[role='main']") || document.body) : container;
    wheelTarget.dispatchEvent(new WheelEvent("wheel", { deltaY: delta, bubbles: true, cancelable: true }));

    // 等待虚拟列表挂载新节点
    await sleep(950);

    const afterScroll = container === window ? window.scrollY : container.scrollTop;
    const afterSlider = getTimelineSliderValue();
    const hasNewPhotos = Array.from(document.querySelectorAll('a[href*="/photo/"]')).some(
      (a) => !beforePhotos.has(a.getAttribute("href"))
    );

    if (afterScroll > beforeScroll + 5) return true;
    if (beforeSlider !== null && afterSlider !== null && afterSlider > beforeSlider + 0.001) return true;
    return hasNewPhotos;
  }

  // -------------------- 任务主循环 --------------------

  async function waitWhilePaused() {
    while (state.paused && !state.stopRequested) {
      await sleep(200);
    }
  }

  async function runAutomation() {
    if (state.running) return;
    const t = I18N[state.lang];

    // 检查免费额度
    if (getRemainingFreeQuota() <= 0) {
      appendLog(t.logQuotaReached, "warn");
      openProModal();
      return;
    }

    state.running = true;
    state.paused = false;
    state.stopRequested = false;
    state.sessionSelected = 0;
    state.sessionTrashed = 0;
    state.currentBatch = 0;
    updateControlButtons();

    const targetCap = state.targetCount === "unlimited" ? Infinity : Number(state.targetCount);
    let processedTotal = 0;
    let emptyScrollTries = 0;

    try {
      while (!state.stopRequested && processedTotal < targetCap) {
        await waitWhilePaused();
        if (state.stopRequested) break;

        if (getRemainingFreeQuota() <= 0) {
          appendLog(t.logQuotaReached, "warn");
          openProModal();
          break;
        }

        // 在安全预览模式下不按批次清空，直接选满目标上限；在移入回收站模式下按 batchSize 分批清理
        const effectiveBatchLimit =
          state.mode === "dry"
            ? Math.min(targetCap - processedTotal, getRemainingFreeQuota())
            : Math.min(state.batchSize, targetCap - processedTotal, getRemainingFreeQuota());

        if (effectiveBatchLimit <= 0) {
          appendLog(t.logQuotaReached, "warn");
          openProModal();
          break;
        }

        state.currentBatch += 1;
        updateStatsDisplay();

        let batchSelected = 0;
        let idlePasses = 0;

        // 1) 在当前视口勾选照片
        while (!state.stopRequested && batchSelected < effectiveBatchLimit) {
          await waitWhilePaused();
          if (state.stopRequested) break;

          const unchecked = getPhotoCheckboxes(true);
          const dateHeaders = state.cutoffYear !== "all" ? collectDateHeaders() : null;
          let pickedInThisScan = 0;

          for (const cb of unchecked) {
            if (state.stopRequested || batchSelected >= effectiveBatchLimit) break;
            await waitWhilePaused();
            if (state.stopRequested) break;

            if (state.cutoffYear !== "all") {
              const itemYear = getCheckboxYear(cb, dateHeaders);
              if (itemYear !== null && itemYear > Number(state.cutoffYear)) {
                continue;
              }
            }

            if (state.skipStarred && isTileStarred(cb)) {
              continue;
            }

            cb.scrollIntoView({ block: "nearest", behavior: "auto" });
            triggerClick(cb);
            cb.classList.add("ps-selected-highlight");

            batchSelected += 1;
            processedTotal += 1;
            state.sessionSelected += 1;
            pickedInThisScan += 1;

            if (state.mode === "dry") {
              await incrementDailyUsed(1);
            }

            updateStatsDisplay();
            if (batchSelected % 5 === 0 || batchSelected === effectiveBatchLimit) {
              appendLog(
                state.lang === "zh"
                  ? `已勾选第 ${state.sessionSelected} 项（本批 ${batchSelected}/${effectiveBatchLimit}）`
                  : `Selected item #${state.sessionSelected} (batch ${batchSelected}/${effectiveBatchLimit})`
              );
            }

            await sleep(state.delayMs);
          }

          if (batchSelected >= effectiveBatchLimit || state.stopRequested) break;

          if (pickedInThisScan === 0) {
            const didScroll = await smartScrollStep();
            idlePasses = didScroll ? 0 : idlePasses + 1;
            if (!didScroll && idlePasses >= 2) {
              break;
            }
          } else {
            idlePasses = 0;
          }
        }

        if (state.stopRequested) break;

        // 如果是安全预览模式，勾选完即结束或汇报
        if (state.mode === "dry") {
          if (batchSelected === 0) {
            appendLog(t.logNoMore, "warn");
          } else {
            appendLog(t.logDryDone(state.sessionSelected), "ok");
          }
          break;
        }

        // 2) 自动移入回收站模式：执行删除当前批次
        if (batchSelected > 0 || getSelectedCountInDom() > 0) {
          const countToTrash = Math.max(batchSelected, getSelectedCountInDom());
          appendLog(
            state.lang === "zh"
              ? `第 ${state.currentBatch} 批已选 ${countToTrash} 项，准备移入回收站...`
              : `Batch #${state.currentBatch} ready (${countToTrash} items). Triggering Trash...`,
            "warn"
          );

          await triggerTrashAction();
          const confirmed = await waitForAndConfirmDialog();
          if (confirmed) {
            state.sessionTrashed += batchSelected;
            await incrementDailyUsed(batchSelected);
            updateStatsDisplay();
            appendLog(
              state.lang === "zh"
                ? `第 ${state.currentBatch} 批已确认移入回收站（累计 ${state.sessionTrashed} 项）。`
                : `Batch #${state.currentBatch} moved to Trash (total ${state.sessionTrashed}).`,
              "ok"
            );
            // 等待 Google Photos 回收动画及 DOM 刷新
            await sleep(1600);
            emptyScrollTries = 0;
          } else {
            appendLog(
              state.lang === "zh"
                ? "未检测到删除确认弹窗，已暂停以便你手动确认或检查页面状态。"
                : "Confirmation dialog not detected. Pausing for safety.",
              "err"
            );
            state.paused = true;
            updateControlButtons();
            await waitWhilePaused();
          }
        } else {
          // 当前区域无新照片，尝试向下滚动一次看是否到达末尾
          const scrolled = await smartScrollStep();
          emptyScrollTries = scrolled ? 0 : emptyScrollTries + 1;
          if (!scrolled && emptyScrollTries >= 2) {
            appendLog(t.logNoMore, "ok");
            break;
          }
        }
      }
    } finally {
      state.running = false;
      state.paused = false;
      updateControlButtons();
    }
  }

  async function unselectAllVisible() {
    const t = I18N[state.lang];
    appendLog(t.logUnselecting);
    const checkedBefore = getPhotoCheckboxes(false).filter((cb) => cb.getAttribute("aria-checked") === "true");
    let count = checkedBefore.length;

    // 优先派发 Escape 键，秒级退出 Google 相册多选工具栏并清除全部已选项
    const target = document.activeElement || document.body;
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true, cancelable: true })
    );
    target.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true })
    );
    await sleep(180);

    document.querySelectorAll(".ps-selected-highlight").forEach((el) => {
      el.classList.remove("ps-selected-highlight");
    });

    // 若仍有残留未取消项，逐个补点取消
    const remaining = getPhotoCheckboxes(false).filter((cb) => cb.getAttribute("aria-checked") === "true");
    for (const cb of remaining) {
      triggerClick(cb);
      await sleep(35);
    }
    appendLog(t.logUnselected(count), "ok");
  }

  // -------------------- UI 构建与事件绑定 --------------------

  let panelEl = null;
  let modalEl = null;

  function appendLog(msg, level = "normal") {
    if (!panelEl) return;
    const box = panelEl.querySelector("#ps-log-box");
    if (!box) return;
    const line = document.createElement("div");
    const timeStr = new Date().toTimeString().slice(0, 8);
    line.textContent = `[${timeStr}] ${msg}`;
    if (level === "ok") line.className = "ps-log-line-ok";
    if (level === "warn") line.className = "ps-log-line-warn";
    if (level === "err") line.className = "ps-log-line-err";
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  function refreshQuotaBadge() {
    if (!panelEl) return;
    const badge = panelEl.querySelector("#ps-license-badge");
    const t = I18N[state.lang];
    if (!badge) return;
    if (state.isPro) {
      badge.textContent = t.proBadge;
      badge.className = "ps-badge ps-badge-pro";
    } else {
      badge.textContent = t.freeBadge(getRemainingFreeQuota());
      badge.className = "ps-badge ps-badge-free";
    }
  }

  function updateStatsDisplay() {
    if (!panelEl) return;
    const stats = panelEl.querySelector("#ps-stats-bar");
    if (!stats) return;
    stats.textContent = I18N[state.lang].stats(
      state.sessionSelected,
      state.sessionTrashed,
      state.currentBatch
    );
  }

  function updateControlButtons() {
    if (!panelEl) return;
    const t = I18N[state.lang];
    const startBtn = panelEl.querySelector("#ps-btn-start");
    const pauseBtn = panelEl.querySelector("#ps-btn-pause");
    const stopBtn = panelEl.querySelector("#ps-btn-stop");

    if (!state.running) {
      startBtn.disabled = false;
      startBtn.textContent = t.start;
      pauseBtn.disabled = true;
      pauseBtn.textContent = t.pause;
      stopBtn.disabled = true;
    } else {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      pauseBtn.textContent = state.paused ? t.resume : t.pause;
      stopBtn.disabled = false;
    }
    startBtn.className = state.mode === "trash" ? "ps-btn ps-btn-danger" : "ps-btn ps-btn-primary";
  }

  function openProModal() {
    if (!modalEl) return;
    modalEl.classList.remove("ps-hidden");
    const msgEl = modalEl.querySelector("#ps-modal-msg");
    if (msgEl) msgEl.textContent = "";
  }

  function closeProModal() {
    if (!modalEl) return;
    modalEl.classList.add("ps-hidden");
  }

  function makeDraggable(panel, handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.left = `${startLeft}px`;
      panel.style.top = `${startTop}px`;
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const nextLeft = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, startLeft + e.clientX - startX));
      const nextTop = Math.max(8, Math.min(window.innerHeight - 52, startTop + e.clientY - startY));
      panel.style.left = `${nextLeft}px`;
      panel.style.top = `${nextTop}px`;
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
    });
  }

  function renderPanelContent() {
    const t = I18N[state.lang];
    panelEl.innerHTML = `
      <div class="ps-header" id="ps-drag-handle">
        <div class="ps-title-wrap">
          <span class="ps-logo">P</span>
          <span class="ps-title">${t.title}</span>
        </div>
        <div class="ps-header-actions">
          <button class="ps-badge ps-badge-free" id="ps-license-badge" type="button"></button>
          <button class="ps-icon-btn" id="ps-btn-lang" type="button">${state.lang === "zh" ? "EN" : "中文"}</button>
          <button class="ps-icon-btn" id="ps-btn-min" type="button">${state.minimized ? "+" : "—"}</button>
        </div>
      </div>

      <div class="ps-body">
        <div>
          <div class="ps-section-label">${t.quickFilters}</div>
          <div class="ps-filter-grid">
            ${t.filters
              .map(
                (f, idx) =>
                  `<button class="ps-pill-btn" data-nav-idx="${idx}" type="button">${f.label}</button>`
              )
              .join("")}
          </div>
        </div>

        <div>
          <div class="ps-section-label">${t.modeLabel}</div>
          <div class="ps-mode-group">
            <button class="ps-mode-btn ${state.mode === "dry" ? "ps-active-safe" : ""}" id="ps-mode-dry" type="button">${t.modeDry}</button>
            <button class="ps-mode-btn ${state.mode === "trash" ? "ps-active-danger" : ""}" id="ps-mode-trash" type="button">${t.modeTrash}</button>
          </div>
        </div>

        <div class="ps-row" style="gap:6px;">
          <input class="ps-input" id="ps-search-jump-input" type="text" placeholder="${t.searchJumpPlaceholder}" style="padding:5px 8px;font-size:12px;" />
          <button class="ps-pill-btn" id="ps-btn-search-jump" type="button" style="padding:5px 10px;flex-shrink:0;">${t.searchJumpBtn}</button>
        </div>

        <div class="ps-row">
          <span>${t.yearFilterLabel}</span>
          <select class="ps-select" id="ps-select-year">
            <option value="all" ${state.cutoffYear === "all" ? "selected" : ""}>${t.yearAllOpt}</option>
            ${Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 1 - i)
              .map(
                (y) =>
                  `<option value="${y}" ${String(state.cutoffYear) === String(y) ? "selected" : ""}>${t.yearBeforeOpt(y)}</option>`
              )
              .join("")}
          </select>
        </div>

        <div class="ps-row">
          <span>${t.targetLabel}</span>
          <select class="ps-select" id="ps-select-target">
            <option value="10" ${state.targetCount === 10 ? "selected" : ""}>10</option>
            <option value="25" ${state.targetCount === 25 ? "selected" : ""}>25</option>
            <option value="50" ${state.targetCount === 50 ? "selected" : ""}>50</option>
            <option value="100" ${state.targetCount === 100 ? "selected" : ""}>100</option>
            <option value="500" ${state.targetCount === 500 ? "selected" : ""}>500</option>
            <option value="unlimited" ${state.targetCount === "unlimited" ? "selected" : ""}>${t.unlimitedOpt}</option>
          </select>
        </div>

        <div class="ps-row">
          <span>${t.batchLabel}</span>
          <select class="ps-select" id="ps-select-batch">
            <option value="25" ${state.batchSize === 25 ? "selected" : ""}>25</option>
            <option value="50" ${state.batchSize === 50 ? "selected" : ""}>50</option>
            <option value="100" ${state.batchSize === 100 ? "selected" : ""}>100</option>
          </select>
        </div>

        <div class="ps-row">
          <span>${t.delayLabel}: <strong id="ps-delay-val">${state.delayMs}ms</strong></span>
          <input class="ps-range" id="ps-range-delay" type="range" min="100" max="500" step="20" value="${state.delayMs}" />
        </div>

        <label class="ps-checkbox-row">
          <input type="checkbox" id="ps-chk-skip-starred" ${state.skipStarred ? "checked" : ""} />
          <span>${t.skipStarred}</span>
        </label>

        <div class="ps-stats-bar" id="ps-stats-bar"></div>
        <div class="ps-log-box" id="ps-log-box"></div>

        <div class="ps-action-row">
          <button class="ps-btn ps-btn-primary" id="ps-btn-start" type="button">${t.start}</button>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button class="ps-btn ps-btn-secondary" id="ps-btn-pause" type="button" disabled>${t.pause}</button>
            <button class="ps-btn ps-btn-secondary" id="ps-btn-stop" type="button" disabled>${t.stop}</button>
          </div>
          <button class="ps-btn ps-btn-secondary ps-btn-full" id="ps-btn-unselect" type="button">${t.unselectAll}</button>
        </div>
      </div>
    `;

    // 绑定面板事件
    makeDraggable(panelEl, panelEl.querySelector("#ps-drag-handle"));
    refreshQuotaBadge();
    updateStatsDisplay();
    updateControlButtons();
    appendLog(t.logReady);

    panelEl.querySelector("#ps-license-badge").addEventListener("click", openProModal);

    panelEl.querySelector("#ps-btn-lang").addEventListener("click", async () => {
      state.lang = state.lang === "zh" ? "en" : "zh";
      await chrome.storage.local.set({ ps_lang: state.lang }).catch(() => {});
      renderPanelContent();
      renderModalContent();
    });

    panelEl.querySelector("#ps-btn-min").addEventListener("click", () => {
      state.minimized = !state.minimized;
      panelEl.classList.toggle("ps-minimized", state.minimized);
      panelEl.querySelector("#ps-btn-min").textContent = state.minimized ? "+" : "—";
    });

    panelEl.querySelectorAll("[data-nav-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-nav-idx"));
        const filter = I18N[state.lang].filters[idx];
        if (!filter) return;
        if (filter.sidebarMatch) {
          const navLinks = Array.from(
            document.querySelectorAll("nav a, [role='navigation'] a, nav [role='tab'], [role='navigation'] [role='tab'], a[href]")
          ).filter((a) => !isInExtensionUi(a) && isElementVisible(a));
          const matched = navLinks.find((a) => {
            const txt = ((a.textContent || "") + " " + (a.getAttribute("aria-label") || "")).toLowerCase();
            return filter.sidebarMatch.some((kw) => txt.includes(kw));
          });
          if (matched) {
            triggerClick(matched);
            return;
          }
        }
        window.location.href = `https://photos.google.com${filter.path}`;
      });
    });

    panelEl.querySelector("#ps-mode-dry").addEventListener("click", () => {
      if (state.running) return;
      state.mode = "dry";
      renderPanelContent();
    });

    panelEl.querySelector("#ps-mode-trash").addEventListener("click", () => {
      if (state.running) return;
      state.mode = "trash";
      renderPanelContent();
    });

    panelEl.querySelector("#ps-btn-search-jump").addEventListener("click", () => {
      const val = panelEl.querySelector("#ps-search-jump-input").value;
      jumpToSearchQuery(val);
    });

    panelEl.querySelector("#ps-search-jump-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        jumpToSearchQuery(e.target.value);
      }
    });

    panelEl.querySelector("#ps-select-year").addEventListener("change", (e) => {
      state.cutoffYear = e.target.value;
    });

    panelEl.querySelector("#ps-select-target").addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "unlimited" && !FREE_LAUNCH_UNLIMITED && !state.isPro) {
        e.target.value = String(state.targetCount === "unlimited" ? 500 : state.targetCount);
        openProModal();
        return;
      }
      state.targetCount = val === "unlimited" ? "unlimited" : Number(val);
    });

    panelEl.querySelector("#ps-select-batch").addEventListener("change", (e) => {
      state.batchSize = Number(e.target.value);
    });

    panelEl.querySelector("#ps-range-delay").addEventListener("input", async (e) => {
      state.delayMs = Number(e.target.value);
      panelEl.querySelector("#ps-delay-val").textContent = `${state.delayMs}ms`;
      await chrome.storage.local.set({ ps_delay_ms: state.delayMs }).catch(() => {});
    });

    panelEl.querySelector("#ps-chk-skip-starred").addEventListener("change", (e) => {
      state.skipStarred = e.target.checked;
    });

    panelEl.querySelector("#ps-btn-start").addEventListener("click", runAutomation);

    panelEl.querySelector("#ps-btn-pause").addEventListener("click", () => {
      if (!state.running) return;
      state.paused = !state.paused;
      appendLog(state.paused ? I18N[state.lang].logPaused : "继续执行...", "warn");
      updateControlButtons();
    });

    panelEl.querySelector("#ps-btn-stop").addEventListener("click", () => {
      if (!state.running) return;
      state.stopRequested = true;
      state.paused = false;
      appendLog(I18N[state.lang].logStopped, "warn");
      updateControlButtons();
    });

    panelEl.querySelector("#ps-btn-unselect").addEventListener("click", unselectAllVisible);
  }

  function renderModalContent() {
    const t = I18N[state.lang];
    modalEl.innerHTML = `
      <div class="ps-modal-card">
        <div class="ps-modal-title">
          <span>${t.proTitle}</span>
          <button class="ps-icon-btn" id="ps-modal-x" type="button">✕</button>
        </div>
        <p class="ps-modal-desc">${t.proDesc}</p>
        <button class="ps-btn ps-btn-primary" id="ps-btn-checkout" type="button">${t.proCheckoutBtn}</button>
        <input class="ps-input" id="ps-input-key" type="text" placeholder="${t.proKeyPlaceholder}" />
        <div class="ps-action-row">
          <button class="ps-btn ps-btn-primary" id="ps-btn-activate" type="button">${t.proActivateBtn}</button>
          <button class="ps-btn ps-btn-secondary" id="ps-btn-modal-close" type="button">${t.proCloseBtn}</button>
        </div>
        <div class="ps-modal-msg" id="ps-modal-msg"></div>
      </div>
    `;

    modalEl.querySelector("#ps-modal-x").addEventListener("click", closeProModal);
    modalEl.querySelector("#ps-btn-modal-close").addEventListener("click", closeProModal);
    modalEl.querySelector("#ps-btn-checkout").addEventListener("click", () => {
      window.open(CHECKOUT_URL, "_blank", "noopener,noreferrer");
    });

    modalEl.querySelector("#ps-btn-activate").addEventListener("click", async () => {
      const input = modalEl.querySelector("#ps-input-key");
      const msg = modalEl.querySelector("#ps-modal-msg");
      const result = await validateLicenseKey(input.value);
      if (result.valid) {
        state.isPro = true;
        await chrome.storage.local.set({
          ps_is_pro: true,
          ps_license_key: input.value.trim(),
          ps_license_email: result.email || ""
        }).catch(() => {});
        msg.style.color = "#81c995";
        msg.textContent = I18N[state.lang].keySuccess;
        refreshQuotaBadge();
        appendLog(I18N[state.lang].keySuccess, "ok");
        setTimeout(closeProModal, 900);
      } else {
        msg.style.color = "#f28b82";
        msg.textContent =
          result.reason === "email_mismatch"
            ? I18N[state.lang].keyEmailMismatch(result.boundEmail)
            : I18N[state.lang].keyInvalid;
      }
    });
  }

  function mountUi() {
    if (!document.body) return;
    if (!document.getElementById("photosweep-panel")) {
      panelEl = document.createElement("div");
      panelEl.id = "photosweep-panel";
      document.body.appendChild(panelEl);
      renderPanelContent();
    }
    if (!document.getElementById("photosweep-pro-modal")) {
      modalEl = document.createElement("div");
      modalEl.id = "photosweep-pro-modal";
      modalEl.className = "ps-hidden";
      document.body.appendChild(modalEl);
      renderModalContent();
    }
  }

  // 接收来自扩展 popup 的唤醒与重置位置指令
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === "PHOTOSWEEP_SHOW_PANEL") {
      mountUi();
      panelEl.classList.remove("ps-hidden", "ps-minimized");
      state.minimized = false;
      if (msg.resetPosition) {
        panelEl.style.left = "auto";
        panelEl.style.top = "auto";
        panelEl.style.right = "20px";
        panelEl.style.bottom = "20px";
      }
      sendResponse({ ok: true });
    }
  });

  async function init() {
    await loadPersistedState();
    mountUi();
    // 防止 Google Photos SPA 切换路由时清空 body 节点
    setInterval(() => {
      if (document.body && !document.getElementById("photosweep-panel")) {
        mountUi();
      }
    }, 2000);
  }

  init();
})();
