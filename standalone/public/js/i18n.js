(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const STORAGE_KEY = "cap_locale";
  const DEFAULT_LOCALE = "zh-CN";
  const SUPPORTED_LOCALES = new Set(["zh-CN", "en"]);
  const originalTextNodes = new WeakMap();
  const originalAttributePrefix = "capI18nOriginal";
  const translatedAttributes = ["placeholder", "title", "aria-label"];
  let isApplying = false;

  const zhCN = {
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
    "Obfuscation level": "混淆等级",
    Save: "保存",
    Security: "安全",
    "Rate limiting": "速率限制",
    "Max requests": "最大请求数",
    "Window (ms)": "窗口时间 (ms)",
    CORS: "CORS",
    "Restrict allowed origins": "限制允许的来源",
    "Add an origin...": "添加来源...",
    "Add an origin…": "添加来源...",
    Remove: "移除",
    "Request filtering": "请求过滤",
    "Block rules": "拦截规则",
    Block: "拦截",
    Duration: "时长",
    Value: "值",
    "IP address": "IP 地址",
    "IP range (CIDR)": "IP 范围 (CIDR)",
    "ASN number or name": "ASN 编号或名称",
    "Danger zone": "危险操作",
    "Rotate secret": "轮换密钥",
    "Delete key": "删除密钥",
    Sessions: "会话",
    "IP data": "IP 数据",
    "API keys": "API 密钥",
    "API key": "API 密钥",
    About: "关于",
    "Global rate limit": "全局速率限制",
    "IP header": "IP 请求头",
    "Country & ASN data": "国家与 ASN 数据",
    Presets: "预设",
    Clear: "清除",
    "IP Database": "IP 数据库",
    "Proxy headers": "代理请求头",
    "Country header": "国家请求头",
    "ASN / Network header": "ASN / 网络请求头",
    Create: "创建",
    "Create key": "创建密钥",
    "Create API Key": "创建 API 密钥",
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
    "Download & activate": "下载并启用",
    Provider: "提供商",
    "MaxMind license key": "MaxMind 许可证密钥",
    "IPInfo token": "IPInfo 令牌",
    "Starting download...": "正在开始下载...",
    "Downloading...": "正在下载...",
    "Admin key": "管理员密钥",
    "Continue to Cap": "继续进入 Cap",
    "Incorrect admin key": "管理员密钥不正确",
    "Report issues": "反馈问题",
    "Powered by Cap": "由 Cap 提供支持",
    "Show/hide password": "显示/隐藏密码",
    "The self-hosted CAPTCHA for the modern web.": "面向现代 Web 的自托管 CAPTCHA。",
    "Error": "错误",
    "Failed to create key.": "创建密钥失败。",
    "Failed to create API key.": "创建 API 密钥失败。",
    "Failed to save configuration.": "保存配置失败。",
    "Failed to save security settings.": "保存安全设置失败。",
    "Failed to rotate secret key.": "轮换密钥失败。",
    "Failed to delete key.": "删除密钥失败。",
    "Delete Key?": "删除密钥？",
    "Delete API key?": "删除 API 密钥？",
    "Delete IP Database?": "删除 IP 数据库？",
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
      match: /^(\d+) (year|month|week|day|hour|minute)s? ago$/,
      format: ([, value, unit]) => `${value} ${translateTimeUnit(unit)}前`,
    },
    {
      match: /^in (\d+) (year|month|week|day|hour|minute)s?$/,
      format: ([, value, unit]) => `${value} ${translateTimeUnit(unit)}后`,
    },
  ];

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

  function datasetKeyForAttribute(attrName) {
    return `${originalAttributePrefix}${attrName.replace(/-([a-z])/g, (_, char) =>
      char.toUpperCase(),
    )}`;
  }

  function translateTextNode(node, locale) {
    const original = originalTextNodes.get(node) || node.textContent;
    originalTextNodes.set(node, original);

    const trimmed = original.trim();
    if (!trimmed) return;

    const translated = t(trimmed, locale);
    node.textContent = original.replace(trimmed, translated);
  }

  function translateElement(element, locale) {
    if (element.matches("script, style, pre, code, kbd, samp, textarea")) return;

    for (const attrName of translatedAttributes) {
      if (!element.hasAttribute(attrName)) continue;
      const datasetKey = datasetKeyForAttribute(attrName);
      const original = element.dataset[datasetKey] || element.getAttribute(attrName);
      element.dataset[datasetKey] = original;
      element.setAttribute(attrName, t(original, locale));
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

      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => apply(node));
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.CapI18n = { apply, getLocale, setLocale, start, t };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
