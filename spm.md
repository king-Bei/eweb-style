# 鑫囍探索 (Jollify Travel) - 奢華行程生成系統：架構規格書

## 1. 專案概述 (Project Overview)
本系統旨在為旅行社顧問提供一個高效、高質感且模組化的行程編排工具。透過資料結構化技術，解決過往手動編排 HTML 效率低落、且無法與 Fillo CMS 系統解耦維護的問題。

## 2. 系統架構目標
* **模組化 (Modularity)**： 行程由 8 大功能區塊組成，顧問可依需求彈性開關。
* **多樣化佈局 (Layout Flexibility)**： 區塊支援多種樣板風格（如破格交疊風 vs. 經典格狀）。
* **資料持久化 (Data Persistence)**： 將行程資料由現行的「暫存文字」升級為「結構化資料庫」，支援多人共同編輯與歷史版本備份。
* **無縫整合 (Seamless Integration)**： 維持最終輸出 HTML 代碼的便利性，以確保與科威 (Fillo) 平台的兼容性。

## 3. 資料庫 Schema 設計 (Supabase / PostgreSQL)
這是轉向資料庫開發的核心，將行程拆解為可查詢的關聯式資料表：

### 3.1 itineraries (主表)
| 欄位名稱 | 型別 | 說明 |
| --- | --- | --- |
| id | UUID | 行程唯一識別碼 |
| title | TEXT | 行程標題 |
| hero_data | JSONB | 儲存主標題、副標題、Banner 圖網址 |
| config | JSONB | 儲存各模組開關狀態 (e.g., {"show_hero": true, "hotel_layout": "overlap"}) |
| updated_at | TIMESTAMP | 最後更新時間 |

### 3.2 itinerary_days (每日行程)
| 欄位名稱 | 型別 | 說明 |
| --- | --- | --- |
| id | UUID | 天數識別碼 |
| itinerary_id | UUID | 關聯主行程 |
| day_index | INT | 第幾天 (1, 2, 3...) |
| content | JSONB | 標題、描述、圖片、住宿、三餐內容 |

### 3.3 itinerary_flights (航班資訊)
| 欄位名稱 | 型別 | 說明 |
| --- | --- | --- |
| id | UUID | 航班識別碼 |
| itinerary_id | UUID | 關聯主行程 |
| flight_data | JSONB | 航點、時間、航班號、類型 (去/回) |

## 4. 前端應用架構 (Frontend Logic)
前端將從目前的「單一檔案」轉型為 MVC (Model-View-Controller) 邏輯：
* **View (畫面層)**： React 或 Vue.js 框架，提供輸入表單與即時渲染預覽。
* **Controller (邏輯層)**：
  * **CRUD 管理**： 處理行程的新增、讀取、修改、刪除。
  * **Data Mapper**： 將輸入框的資料轉譯為資料庫 Schema 的 JSON 結構。
  * **Export Engine**： 將結構化資料「組裝」回 Fillo 系統可識別的純 HTML/CSS/JS 代碼。

## 5. 開發工作流 (Workflow)
* **編輯階段**： 顧問於前端介面填寫資料 -> 自動觸發自動存檔 (Auto-save) 至 Supabase。
* **多人協作**： 利用 Supabase Realtime 功能，當顧問甲在修改 Day 3 時，顧問乙畫面即時同步，避免版本衝突。
* **發佈階段**： 點擊「一鍵產生代碼」 -> 前端渲染器 (Renderer) 執行 -> 產出代碼 -> 顧問複製並貼入 Fillo CMS。

## 6. CSS 與樣式維護策略
* **隔離樣式 (.jollify-luxury-theme)**： 所有自訂 CSS 必須包含此 Scope，確保不會被 CMS 系統樣式表覆蓋。
* **版本控制**： 透過 CSS 連結後綴參數 (e.g., `?v=20260520`)，強制使用者瀏覽器下載最新版樣式。