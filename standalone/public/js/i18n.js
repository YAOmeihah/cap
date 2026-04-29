(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const STORAGE_KEY = "cap_locale";
  const DEFAULT_LOCALE = "zh-CN";
  const SUPPORTED_LOCALES = new Set(["zh-CN", "en"]);
  const originalTextNodes = new WeakMap();
  const originalAttributePrefix = "capI18nOriginal";
  const translatedAttributes = ["placeholder", "title", "aria-label"];
  const excludedSelector = "script, style, pre, code, kbd, samp, textarea";
  let isApplying = false;

  const zhCN = {
    Language: "语言",
    "Search keys...": "搜索密钥...",
    "New key": "新建密钥",
    Settings: "设置",
    "Select or create a key to get started": "选择或创建密钥开始使用",
    "Error loading keys": "密钥加载失败",
    "No matching keys": "没有匹配的密钥",
    "No keys yet!": "暂无密钥",
    Copy: "复制",
    Copied: "已复制",
    "Copied!": "已复制",
    "Copy site key": "复制站点密钥",
    "Site Key": "站点密钥",
    "Site key": "站点密钥",
    "Secret key": "密钥",
    "New secret key": "新密钥",
    Activity: "活动",
    Integration: "集成",
    Configuration: "配置",
    Frontend: "前端",
    "Server verification": "服务端验证",
    Today: "今天",
    Yesterday: "昨天",
    "Last 7 days": "最近 7 天",
    "Last 30 days": "最近 30 天",
    "Last 3 months": "最近 3 个月",
    "All time": "全部时间",
    "Check our": "查看我们的",
    documentation: "文档",
    "for more frameworks and details.": "了解更多框架和细节。",
    Challenges: "挑战",
    Verified: "已验证",
    Failed: "失败",
    "Avg. duration": "平均耗时",
    Location: "位置",
    Networks: "网络",
    Platform: "平台",
    OS: "系统",
    "List view": "列表视图",
    "Map view": "地图视图",
    "Search networks": "搜索网络",
    "Filter networks...": "过滤网络...",
    "Filter networks…": "过滤网络...",
    Main: "主要设置",
    Name: "名称",
    Difficulty: "难度",
    "Challenge count": "挑战数量",
    Instrumentation: "环境检测",
    "Enable instrumentation challenges": "启用环境检测挑战",
    "Attempt to block headless browsers": "尝试拦截无头浏览器",
    "This may cause issues with testing or agent browsers and is not entirely foolproof.":
      "这可能影响测试或代理浏览器，且无法保证完全可靠。",
    "Obfuscation level": "混淆等级",
    "Higher obfuscation may result in higher CPU usage.": "更高混淆等级可能带来更高 CPU 占用。",
    Save: "保存",
    Security: "安全",
    "Rate limiting": "速率限制",
    "Override the global rate limit for this key. Leave empty to use the global defaults.":
      "覆盖此密钥的全局速率限制。留空则使用全局默认值。",
    "Max requests": "最大请求数",
    "Window (ms)": "窗口时间 (ms)",
    CORS: "CORS",
    "Restrict allowed origins": "限制允许的来源",
    "Only these origins will be able to request challenges for this key.":
      "只有这些来源可以为此密钥请求挑战。",
    "Add an origin...": "添加来源...",
    "Add an origin…": "添加来源...",
    Remove: "移除",
    "Request filtering": "请求过滤",
    "Override the global filtering for this key. Leave unchecked to use global defaults.":
      "覆盖此密钥的全局过滤设置。未勾选则使用全局默认值。",
    "Block non-browser user agents": "拦截非浏览器 User-Agent",
    "Blocks requests from bots, scripts, and other non-browser clients (e.g. python-requests, curl).":
      "拦截来自自动脚本和其他非浏览器客户端的请求（例如 python-requests、curl）。",
    "Require browser headers": "要求浏览器请求头",
    "Block requests missing common browser headers.": "拦截缺少常见浏览器请求头的请求。",
    "Block rules": "拦截规则",
    "Add rule": "添加规则",
    "Add block rule": "添加拦截规则",
    Block: "拦截",
    Type: "类型",
    Duration: "时长",
    Value: "值",
    "IP address": "IP 地址",
    "IP range (CIDR)": "IP 范围 (CIDR)",
    Range: "范围",
    Country: "国家",
    "Country code": "国家代码",
    "Select country...": "选择国家...",
    "ASN number or name": "ASN 编号或名称",
    Permanent: "永久",
    "1 hour": "1 小时",
    "24 hours": "24 小时",
    "7 days": "7 天",
    "30 days": "30 天",
    "No block rules yet": "暂无拦截规则",
    "Danger zone": "危险操作",
    "Rotate secret": "轮换密钥",
    "Reset site secret": "重置站点密钥",
    "Delete key": "删除密钥",
    Sessions: "会话",
    Current: "当前",
    "IP data": "IP 数据",
    "API keys": "API 密钥",
    "No API keys yet": "暂无 API 密钥",
    "API key": "API 密钥",
    About: "关于",
    "Global rate limit": "全局速率限制",
    "Default rate limit applied to all challenge endpoints. Individual keys can override these values in their configuration.":
      "应用到所有挑战端点的默认速率限制。单个密钥可在配置中覆盖这些值。",
    "Requests allowed per window": "每个窗口允许的请求数",
    "Time window in milliseconds (e.g. 5000 = 5s)": "时间窗口，单位毫秒（例如 5000 = 5 秒）",
    "Only these origins will be able to request challenges. Individual keys can override this.":
      "只有这些来源可以请求挑战。单个密钥可覆盖此设置。",
    "Block requests that don't look like they come from real browsers. Individual keys can override these defaults.":
      "拦截看起来不像真实浏览器发出的请求。单个密钥可覆盖这些默认值。",
    "IP header": "IP 请求头",
    "Set the header your reverse proxy uses to pass the client's real IP. Used for rate limiting, IP tracking, and geo lookups.":
      "设置反向代理传递客户端真实 IP 的请求头，用于速率限制、IP 跟踪和地理查询。",
    "Country & ASN data": "国家与 ASN 数据",
    "Choose how to resolve country and ASN for each IP. Use": "选择每个 IP 的国家和 ASN 解析方式。若反向代理提供",
    headers: "请求头",
    "if your reverse proxy provides them, or download an": "则使用它们，或下载",
    "IP database": "IP 数据库",
    "for automatic lookups.": "进行自动查询。",
    Presets: "预设",
    Clear: "清除",
    "IP Database": "IP 数据库",
    "Proxy headers": "代理请求头",
    "Country header": "国家请求头",
    "Header containing the 2-letter ISO country code": "包含 2 位 ISO 国家代码的请求头",
    "ASN / Network header": "ASN / 网络请求头",
    "Header containing the ASN or network name": "包含 ASN 或网络名称的请求头",
    "Star on GitHub": "在 GitHub 上点星",
    Create: "创建",
    "Create key": "创建密钥",
    "Create API Key": "创建 API 密钥",
    "Key created": "密钥已创建",
    "API key created": "API 密钥已创建",
    "Key name": "密钥名称",
    "Enable instrumentation (recommended)": "启用环境检测（推荐）",
    "Restrict this key to specific origins": "将此密钥限制到指定来源",
    Cancel: "取消",
    Close: "关闭",
    "Open key": "打开密钥",
    Done: "完成",
    Delete: "删除",
    Logout: "退出登录",
    Update: "更新",
    "Updating...": "正在更新...",
    "Download & activate": "下载并启用",
    Provider: "提供商",
    "DB-IP Lite (free, no key needed)": "DB-IP Lite（免费，无需密钥）",
    "MaxMind GeoLite2 (free, needs license key)": "MaxMind GeoLite2（免费，需要许可证密钥）",
    "IPInfo (API, needs token)": "IPInfo（API，需要令牌）",
    "MaxMind license key": "MaxMind 许可证密钥",
    "MaxMind license key:": "MaxMind 许可证密钥：",
    "Your GeoLite2 license key": "你的 GeoLite2 许可证密钥",
    "IPInfo token": "IPInfo 令牌",
    "IPInfo token:": "IPInfo 令牌：",
    "Your IPInfo API token": "你的 IPInfo API 令牌",
    "Starting download...": "正在开始下载...",
    "Downloading...": "正在下载...",
    "Download failed": "下载失败",
    "Admin key": "管理员密钥",
    "Continue to Cap": "继续进入 Cap",
    "Incorrect admin key": "管理员密钥不正确",
    "Report issues": "反馈问题",
    "Powered by Cap": "由 Cap 提供支持",
    "Show/hide password": "显示/隐藏密码",
    "The self-hosted CAPTCHA for the modern web.": "面向现代 Web 的自托管 CAPTCHA。",
    "Error": "错误",
    "Validation error": "校验错误",
    "Please check your input values.": "请检查输入值。",
    "Failed to create key.": "创建密钥失败。",
    "Failed to create API key.": "创建 API 密钥失败。",
    "Failed to save configuration.": "保存配置失败。",
    "Failed to save security settings.": "保存安全设置失败。",
    "Failed to rotate secret key.": "轮换密钥失败。",
    "Failed to delete key.": "删除密钥失败。",
    "MaxMind license key required": "需要 MaxMind 许可证密钥",
    "IPInfo token required": "需要 IPInfo 令牌",
    "Delete Key?": "删除密钥？",
    "Rotate Secret?": "轮换密钥？",
    "Rotated secret key": "密钥已轮换",
    "This will generate a new secret key. Your existing integrations will stop working until updated.":
      "这会生成新的密钥。在更新集成前，现有集成将停止工作。",
    Rotate: "轮换",
    "Make sure to copy this \u2014 it won\u2019t be shown again.":
      "请务必复制它，它不会再次显示。",
    "This will permanently delete this key and all associated data. This cannot be undone.":
      "这会永久删除此密钥及其所有相关数据，且无法撤销。",
    "Make sure to copy your secret key \u2014 it won\u2019t be shown again.":
      "请务必复制你的密钥，它不会再次显示。",
    "Make sure to copy your API key \u2014 it won\u2019t be shown again.":
      "请务必复制你的 API 密钥，它不会再次显示。",
    "Delete API key?": "删除 API 密钥？",
    "This will permanently delete this API key.": "这会永久删除此 API 密钥。",
    "Delete IP Database?": "删除 IP 数据库？",
    "This will remove the downloaded IP database files. Country and ASN lookups will stop working unless you have headers configured.":
      "这会删除已下载的 IP 数据库文件。除非配置了请求头，否则国家和 ASN 查询将停止工作。",
    "No network data yet.": "暂无网络数据。",
    "Configure a lookup source in IP data settings to store network data.":
      "请在 IP 数据设置中配置查询来源以存储网络数据。",
    "No platform data yet.": "暂无平台数据。",
    "No OS data yet.": "暂无系统数据。",
    "No location data yet.": "暂无位置数据。",
    "Configure a lookup source in IP data settings to store location data.":
      "请在 IP 数据设置中配置查询来源以存储位置数据。",
    "Failed to load map data": "地图数据加载失败",
    Desktop: "桌面端",
    Phone: "手机",
    Tablet: "平板",
    "just now": "刚刚",
    "in a moment": "马上",
    "Demo mode": "演示模式",
  };

  const patterns = [
    {
      match: /^(.+) recent solves$/,
      format: ([, count]) => `${count} 次近期验证`,
    },
    {
      match: /^Failed to load key: (.+)$/,
      format: ([, message]) => `密钥加载失败：${message}`,
    },
    {
      match: /^Downloading (.+)\.\.\. (.+)$/,
      format: ([, file, progress]) => `正在下载 ${file}... ${progress}`,
    },
    {
      match:
        /^Override the global rate limit for this key\. Leave empty to use the global defaults \((.+?) reqs \/ (.+?)s\)\.$/,
      format: ([, max, seconds]) =>
        `覆盖此密钥的全局速率限制。留空则使用全局默认值（${max} 次请求 / ${seconds} 秒）。`,
    },
    {
      match: /^(.+) challenges$/,
      format: ([, count]) => `${count} 次挑战`,
    },
    {
      match: /^Updated (.+)$/,
      format: ([, value]) => `更新于 ${t(value)}`,
    },
    {
      match: /^expires (.+)$/,
      format: ([, value]) => `到期 ${t(value)}`,
    },
    {
      match: /^\u2022\s*expires (.+)$/,
      format: ([, value]) => `\u2022 到期 ${t(value)}`,
    },
    {
      match: /^(.+) \u2022 created (.+)$/,
      format: ([, id, value]) => `${id} \u2022 创建于 ${t(value)}`,
    },
    {
      match: /^Expires (.+)$/,
      format: ([, value]) => `到期时间 ${t(value)}`,
    },
    {
      match: /^(Country|ASN): (.+?)( \(loaded\))?$/,
      format: ([, label, value, loaded]) =>
        `${label === "Country" ? "国家" : "ASN"}：${value}${loaded ? "（已加载）" : ""}`,
    },
    {
      match: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4})$/,
      format: ([, month, day, year]) => `${year}年${translateMonth(month)}月${day}日`,
    },
    {
      match: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (.+)$/,
      format: ([, month, day, time]) => `${translateMonth(month)}月${day}日 ${translateClock(time)}`,
    },
    {
      match: /^(\d+) (year|month|week|day|hour|minute)s? ago$/,
      format: ([, value, unit]) => `${value} ${translateTimeUnit(unit)}前`,
    },
    {
      match: /^in (\d+) (year|month|week|day|hour|minute)s?$/,
      format: ([, value, unit]) => `${value} ${translateTimeUnit(unit)}后`,
    },
  ];

  function translateMonth(month) {
    return {
      Jan: "1",
      Feb: "2",
      Mar: "3",
      Apr: "4",
      May: "5",
      Jun: "6",
      Jul: "7",
      Aug: "8",
      Sep: "9",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    }[month] || month;
  }

  function translateClock(time) {
    return time.replace(/^(\d{1,2}:\d{2}) (AM|PM)$/i, (_, value, period) =>
      `${period.toUpperCase() === "AM" ? "上午" : "下午"}${value}`,
    );
  }

  function translateTimeUnit(unit) {
    return {
      year: "年",
      month: "个月",
      week: "周",
      day: "天",
      hour: "小时",
      minute: "分钟",
    }[unit] || unit;
  }

  function normalizeLocale(value) {
    if (value === "zh" || value === "zh_CN" || value === "zh-CN") return "zh-CN";
    if (value === "en" || value === "en-US" || value === "en_GB") return "en";
    return DEFAULT_LOCALE;
  }

  function getLocale() {
    try {
      const savedLocale = normalizeLocale(localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCALE);
      return SUPPORTED_LOCALES.has(savedLocale) ? savedLocale : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  }

  function t(value, locale = getLocale()) {
    if (locale === "en" || !value) return value;
    if (zhCN[value]) return zhCN[value];

    for (const pattern of patterns) {
      const match = value.match(pattern.match);
      if (match) return pattern.format(match);
    }

    return value;
  }

  function renderText(original, locale) {
    const trimmed = original.trim();
    if (!trimmed) return original;
    return original.replace(trimmed, t(trimmed, locale));
  }

  function matchesRenderedText(original, value) {
    for (const locale of SUPPORTED_LOCALES) {
      if (value === renderText(original, locale)) return true;
    }
    return false;
  }

  function matchesRenderedAttribute(original, value) {
    for (const locale of SUPPORTED_LOCALES) {
      if (value === t(original, locale)) return true;
    }
    return false;
  }

  function datasetKeyForAttribute(attrName) {
    return `${originalAttributePrefix}${attrName.replace(/-([a-z])/g, (_, char) =>
      char.toUpperCase(),
    )}`;
  }

  function hasStoredOriginalAttribute(element, datasetKey) {
    return Object.prototype.hasOwnProperty.call(element.dataset, datasetKey);
  }

  function shouldSkipNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) return node.matches(excludedSelector);
    return Boolean(node.parentElement?.closest(excludedSelector));
  }

  function translateTextNode(node, locale) {
    if (shouldSkipNode(node)) return;

    const original = originalTextNodes.get(node) || node.textContent;
    originalTextNodes.set(node, original);

    const translated = renderText(original, locale);
    if (node.textContent !== translated) node.textContent = translated;
  }

  function translateElement(element, locale) {
    if (shouldSkipNode(element)) return;

    for (const attrName of translatedAttributes) {
      if (!element.hasAttribute(attrName)) continue;
      const datasetKey = datasetKeyForAttribute(attrName);
      const original = hasStoredOriginalAttribute(element, datasetKey)
        ? element.dataset[datasetKey]
        : element.getAttribute(attrName);
      const translated = t(original, locale);
      element.dataset[datasetKey] = original;
      if (element.getAttribute(attrName) !== translated) {
        element.setAttribute(attrName, translated);
      }
    }
  }

  function translateNode(node, locale) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node, locale);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      translateElement(node, locale);
    }
  }

  function updateSwitches(locale = getLocale()) {
    document.querySelectorAll("[data-cap-locale-option]").forEach((button) => {
      const active = normalizeLocale(button.dataset.capLocaleOption) === locale;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function bindSwitches() {
    document.querySelectorAll("[data-cap-locale-option]").forEach((button) => {
      if (button.dataset.capLocaleBound === "true") return;
      button.dataset.capLocaleBound = "true";
      button.addEventListener("click", () => setLocale(button.dataset.capLocaleOption));
    });
  }

  function apply(root = document.body) {
    if (!root || isApplying) return;
    isApplying = true;

    try {
      const locale = getLocale();
      translateNode(root, locale);

      if (
        root.nodeType === Node.ELEMENT_NODE ||
        root.nodeType === Node.DOCUMENT_NODE ||
        root.nodeType === Node.DOCUMENT_FRAGMENT_NODE
      ) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) translateNode(walker.currentNode, locale);
      }

      updateSwitches(locale);
      document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
    } finally {
      isApplying = false;
    }
  }

  function setLocale(nextLocale) {
    const normalizedLocale = normalizeLocale(nextLocale);
    try {
      localStorage.setItem(STORAGE_KEY, normalizedLocale);
    } catch {}
    apply(document.body);
  }

  function start() {
    if (!document.body) return;

    bindSwitches();
    apply(document.body);

    const observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      bindSwitches();
      const locale = getLocale();

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => apply(node));
          continue;
        }

        if (mutation.type === "attributes") {
          const attrName = mutation.attributeName;
          const datasetKey = datasetKeyForAttribute(attrName);
          const hasOriginal =
            mutation.target.dataset &&
            hasStoredOriginalAttribute(mutation.target, datasetKey);
          const original = hasOriginal ? mutation.target.dataset[datasetKey] : undefined;

          if (
            hasOriginal &&
            matchesRenderedAttribute(original, mutation.target.getAttribute(attrName))
          ) {
            continue;
          }

          if (mutation.target.dataset) delete mutation.target.dataset[datasetKey];
          apply(mutation.target);
          continue;
        }

        if (mutation.type === "characterData") {
          const hasOriginal = originalTextNodes.has(mutation.target);
          const original = originalTextNodes.get(mutation.target);

          if (hasOriginal && matchesRenderedText(original, mutation.target.textContent)) {
            continue;
          }

          originalTextNodes.set(mutation.target, mutation.target.textContent);
          apply(mutation.target);
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: translatedAttributes,
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  window.CapI18n = { apply, getLocale, setLocale, start, t };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
