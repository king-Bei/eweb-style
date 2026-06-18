/**
 * 鑫囍探索旅行 (JOLLIFY TRAVEL) — 共用 Header & Footer 動態注入模組
 * 所有子網頁只要載入此 JS 檔案，並在 HTML 中加入以下容器即可自動渲染 Header 與 Footer：
 * <div id="jollify-header"></div>
 * <div id="jollify-footer"></div>
 */

document.addEventListener('DOMContentLoaded', () => {
  // 動態引入 Header & Footer 的專用 CSS 樣式表 (確保樣式套用)
  if (!document.querySelector('link[href*="header-footer.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // 判斷當前頁面是在根目錄還是在子資料夾 pages/ 底下
    const isSubpage = window.location.pathname.includes('/pages/');
    link.href = isSubpage ? '../assets/css/header-footer.css' : './assets/css/header-footer.css';
    document.head.appendChild(link);
  }

  // 初始化網頁平滑淡入效果
  document.body.classList.add('is-loaded');

  initHeader();
  initFooter();
  initMenuDrawer();
});

// 定義資源路徑輔助函式
function getRootPath() {
  return window.location.pathname.includes('/pages/') ? '../' : './';
}

/**
 * 1. 注入並初始化置頂 Header
 */
function initHeader() {
  const headerContainer = document.getElementById('jollify-header');
  if (!headerContainer) return;

  const rootPath = getRootPath();
  
  headerContainer.innerHTML = `
    <header class="j-header">
      <div class="j-header-container">
        <!-- 左側：MENU 漢堡選單按鈕 -->
        <button class="j-menu-trigger" aria-label="開啟選單" id="menuBtn">
          <span class="j-menu-burger">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="j-menu-text">MENU</span>
        </button>

        <!-- 中間：LOGO 與品牌名稱 -->
        <a href="${rootPath}index.html" class="j-header-logo">
          <!-- 四葉草鑰匙 Logo SVG -->
          <svg class="j-logo-icon" viewBox="0 0 100 100" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15C38.95 15 30 23.95 30 35C30 38.3 30.8 41.4 32.2 44.1C30.2 42.8 27.7 42 25 42C13.95 42 5 50.95 5 62C5 73.05 13.95 82 25 82C29.15 82 32.95 80.75 36.1 78.6C34.8 80.6 34 83.1 34 86C34 91.5 38.5 96 44 96C49.5 96 54 91.5 54 86C54 83.1 53.2 80.6 51.9 78.6C55.05 80.75 58.85 82 63 82C74.05 82 83 73.05 83 62C83 50.95 74.05 42 63 42C60.3 42 57.8 42.8 55.8 44.1C57.2 41.4 58 38.3 58 35C58 23.95 49.05 15 38 15Z" stroke="#FFFFFF" stroke-width="4" stroke-miterlimit="10"/>
            <circle cx="50" cy="50" r="8" fill="#92D2EC" />
            <path d="M50 50V75" stroke="#92D2EC" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <div class="j-logo-text-group">
            <span class="j-logo-zh">鑫囍探索旅行</span>
            <span class="j-logo-en">JOLLIFY TRAVEL</span>
          </div>
        </a>

        <!-- 右側：會員與語系 -->
        <div class="j-header-actions">
          <a href="#" class="j-lang-switch">ZH | EN</a>
          <a href="#" class="j-member-icon" aria-label="會員專區">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- 全螢幕漢堡導覽選單抽屜 (Drawer) -->
    <div class="j-menu-drawer" id="menuDrawer">
      <button class="j-menu-close" aria-label="關閉選單" id="menuCloseBtn">×</button>
      <nav class="j-drawer-nav">
        <ul class="j-drawer-menu">
          <li><a href="${rootPath}index.html" class="j-drawer-link">設計規範手冊 <small>Style Guide</small></a></li>
          <li><a href="${rootPath}index.html" class="j-drawer-link">主題旅遊首頁 <small>Themed Travel</small></a></li>
          <li><a href="${rootPath}pages/honeymoon-wedding.html" class="j-drawer-link">蜜月婚禮 <small>Honeymoon Wedding</small></a></li>
          <li><a href="${rootPath}pages/island-vacation.html" class="j-drawer-link">海島自由行 <small>Island Vacation</small></a></li>
          <li><a href="${rootPath}pages/private-charter.html" class="j-drawer-link">私人包機 <small>Private Charter</small></a></li>
          <li><a href="${rootPath}pages/custom-tour.html" class="j-drawer-link">客製化小包團 <small>Custom Tour</small></a></li>
        </ul>
      </nav>
      <div class="j-drawer-footer">
        <p>探索極致之旅 ‧ 鑫囍隨行</p>
      </div>
    </div>
  `;

  // 監聽滾動事件，為 Header 添加陰影與背景模糊變化
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.j-header');
    if (window.scrollY > 30) {
      header.classList.add('j-header-scrolled');
    } else {
      header.classList.remove('j-header-scrolled');
    }
  });
}

/**
 * 2. 注入不對稱雙色 Footer
 */
function initFooter() {
  const footerContainer = document.getElementById('jollify-footer');
  if (!footerContainer) return;

  const rootPath = getRootPath();

  footerContainer.innerHTML = `
    <footer class="j-footer">
      <div class="j-footer-wrapper">
        <!-- 左半部：湖水粉藍背景 (佔寬 35%) -->
        <div class="j-footer-left">
          <div class="j-footer-left-content">
            <h3 class="j-footer-company-title">鑫囍探索旅行社股份有限公司</h3>
            
            <div class="j-footer-license-info">
              <p>交觀綜字第 223700 號</p>
              <p>品保北 2741 號</p>
            </div>
            
            <div class="j-footer-contact-details">
              <p class="j-footer-phone">
                <strong>TEL:</strong> 
                <a href="tel:+886225093589">+886-2-2509-3589</a>
              </p>
              <p class="j-footer-address">台北市中山區南京東路二段 100 號 10 樓</p>
            </div>

            <div class="j-footer-copyright">
              © JOLLIFY TRAVEL SERVICE 2026. All rights reserved.
            </div>
          </div>
        </div>

        <!-- 右半部：皇家深紫背景 (佔寬 65%) -->
        <div class="j-footer-right">
          <div class="j-footer-right-content">
            <!-- 品牌 LOGO & 名稱 -->
            <div class="j-footer-brand">
              <svg class="j-footer-logo-icon" viewBox="0 0 100 100" width="70" height="70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15C38.95 15 30 23.95 30 35C30 38.3 30.8 41.4 32.2 44.1C30.2 42.8 27.7 42 25 42C13.95 42 5 50.95 5 62C5 73.05 13.95 82 25 82C29.15 82 32.95 80.75 36.1 78.6C34.8 80.6 34 83.1 34 86C34 91.5 38.5 96 44 96C49.5 96 54 91.5 54 86C54 83.1 53.2 80.6 51.9 78.6C55.05 80.75 58.85 82 63 82C74.05 82 83 73.05 83 62C83 50.95 74.05 42 63 42C60.3 42 57.8 42.8 55.8 44.1C57.2 41.4 58 38.3 58 35C58 23.95 49.05 15 38 15Z" stroke="#FFFFFF" stroke-width="3"/>
                <circle cx="50" cy="50" r="8" fill="#92D2EC" />
                <path d="M50 50V75" stroke="#92D2EC" stroke-width="3"/>
              </svg>
              <h2 class="j-footer-brand-title">鑫囍探索旅行</h2>
              <p class="j-footer-brand-subtitle">JOLLIFY TRAVEL</p>
            </div>

            <!-- 垂直快捷導覽列 -->
            <div class="j-footer-nav-links">
              <a href="${rootPath}index.html" class="j-footer-nav-link">About Us</a>
              <a href="${rootPath}index.html" class="j-footer-nav-link">What We Offer</a>
              <a href="${rootPath}index.html" class="j-footer-nav-link">Our Journeys</a>
              <a href="${rootPath}index.html" class="j-footer-nav-link">Contact</a>
            </div>

            <!-- 社群媒體圖示連結 -->
            <div class="j-footer-socials">
              <!-- FB -->
              <a href="#" class="j-social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <!-- IG -->
              <a href="#" class="j-social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <!-- Line -->
              <a href="#" class="j-social-icon" aria-label="Line">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
              <!-- Email -->
              <a href="#" class="j-social-icon" aria-label="Email">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * 3. 處理漢堡導覽選單抽屜 (Drawer) 開合效果
 */
function initMenuDrawer() {
  const menuBtn = document.getElementById('menuBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const menuDrawer = document.getElementById('menuDrawer');

  if (!menuBtn || !menuDrawer) return;

  // 開啟選單
  menuBtn.addEventListener('click', () => {
    menuDrawer.classList.add('j-drawer-open');
    document.body.style.overflow = 'hidden'; // 鎖定頁面滾動
  });

  // 關閉選單
  const closeDrawer = () => {
    menuDrawer.classList.remove('j-drawer-open');
    document.body.style.overflow = ''; // 恢復頁面滾動
  };

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeDrawer);
  }

  // 點擊選單外部也可關閉
  menuDrawer.addEventListener('click', (e) => {
    if (e.target === menuDrawer) {
      closeDrawer();
    }
  });
}
