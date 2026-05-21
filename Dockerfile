# 第一階段：編譯 Vite 專案
FROM node:20-alpine AS builder

WORKDIR /app

# 複製 package.json 與 package-lock.json (若有的話)
COPY package*.json ./

# 安裝相依套件
RUN npm install

# 複製所有原始碼 (會忽略 .dockerignore 中的檔案)
COPY . .

# 執行生產環境編譯
RUN npm run build

# 第二階段：使用 Nginx 伺服器來提供靜態檔案
FROM nginx:alpine

# 移除預設的 Nginx 靜態檔案
RUN rm -rf /usr/share/nginx/html/*

# 複製編譯好的檔案至 Nginx 目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製自訂的 nginx.conf 以支援 React Router 的 History Mode
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 曝露 80 埠
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
