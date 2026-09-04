# Prompt PWA cho Claude — Dự án Chiếu Nẫu (D:\test-demo-react\duAnCuocThiMoi)

> Copy toàn bộ khối bên dưới dán cho Claude / Claude Code. Đã tối ưu theo đúng cấu trúc hiện tại của dự án.

---

## PROMPT COPY-PASTE CHO CLAUDE:

```
Bạn là Senior Frontend Dev chuyên về PWA + React + Vite.

CONTEXT DỰ ÁN:
- Dự án: "Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế" (web bán chiếu truyền thống + tác động xã hội)
- Stack: Vite 6 + React 19 + react-router-dom 7 + Express backend (server/index.js, proxy /api -> localhost:3001) + sql.js
- Entry: index.html (root) -> /src/main.jsx -> BrowserRouter -> App.jsx
- Routes public: /, /cau-chuyen, /san-pham, /san-pham/:slug, /qua-tang-doanh-nghiep, /tac-dong-xa-hoi, /cam-nang, /gio-hang, /thanh-toan, /dat-hang-thanh-cong/:id, /dang-nhap, /dang-ky, /tai-khoan (+ bản .html tương ứng cho SEO/static)
- Routes admin: /admin/login, /admin (dashboard, orders, orders/:id, products, chat, users) — bọc ProtectedRoute + AdminLayout
- Layout: Navbar + Footer + CartDrawer + SupportHub + BackToTop + PageLoader (chỉ render public, không render admin trừ BackToTop)
- State: CartContext, AuthContext, CustomerAuthContext
- Styles: src/styles/*.css (index, cart, admin, auth, map-picker, support-hub)
- Static: public/logo.png (447KB, dùng làm icon gốc), public/*.html (bản static cũ), public/assets, public/css, public/js
- Deploy: vercel.json rewrite /(.*) -> /index.html (SPA fallback), render.yaml, DEPLOY.md
- LƯU Ý QUAN TRỌNG: index.html hiện tại bị lỗi encoding tiếng Việt ở <meta description> và <title> ("Chi���u N���u - GA�n Ngh��?"). Hãy fix thành UTF-8 chuẩn: description="Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế. Từ chiếc chiếu truyền thống, chúng tôi tạo nên những sản phẩm mang giá trị mới." + title="Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế".

MỤC TIÊU:
Biến web hiện tại thành PWA installable, đạt Lighthouse PWA 90+, hoạt động offline cơ bản, KHÔNG phá vỡ code/routes/deploy hiện tại.

YÊU CẦU KỸ THUẬT (làm đầy đủ theo thứ tự):

1. CÀI ĐẶT:
   - Cài `vite-plugin-pwa` (tương thích Vite 6 + React 19).
   - Không nâng/hạ React, react-router, vite trừ khi bắt buộc.

2. CẤU HÌNH vite.config.js:
   - Giữ nguyên plugins react() + server.port 5173 + proxy /api.
   - Thêm VitePWA() với:
     - strategies: 'generateSW', registerType: 'prompt' (để hiện toast update, không autoUpdate lén)
     - includeAssets: ['logo.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png']
     - manifest: {
         name: 'Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế',
         short_name: 'Chiếu Nẫu',
         description: 'Chiếu truyền thống Việt — sản phẩm thủ công, quà tặng doanh nghiệp, tác động xã hội.',
         id: '/', start_url: '/', scope: '/',
         display: 'standalone', orientation: 'portrait-primary',
         lang: 'vi', dir: 'ltr',
         theme_color: '#2d5a2d' (= --primary trong src/styles/index.css),
         background_color: '#faf7f2' (= --cream-light / màu nền body),
         categories: ['shopping', 'lifestyle'],
         icons: [
           { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
           { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
           { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
         ]
       }
     - workbox: {
         globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
         navigateFallback: '/index.html',
         navigateFallbackDenylist: [/^\/api/],
         runtimeCaching: [
           { urlPattern: ({url}) => url.pathname.startsWith('/api'), handler: 'NetworkFirst', options: { cacheName: 'api-cache', networkTimeoutSeconds: 3, expiration: { maxEntries: 100, maxAgeSeconds: 300 } } },
           { urlPattern: ({request}) => request.destination === 'image', handler: 'CacheFirst', options: { cacheName: 'images', expiration: { maxEntries: 150, maxAgeSeconds: 2592000 } } },
           { urlPattern: ({request}) => ['style','script','font'].includes(request.destination), handler: 'StaleWhileRevalidate', options: { cacheName: 'static-assets' } }
         ]
       }
     - devOptions: { enabled: false } (không bật SW ở dev để tránh cache bẩn)

3. ICONS + ASSETS (thư mục public/):
   - Từ public/logo.png gốc, tạo: pwa-192x192.png, pwa-512x512.png (có padding an toàn cho maskable), apple-touch-icon.png (180x180), favicon.ico (giữ tương thích cũ).
   - Nếu logo vuông không đẹp khi maskable, tự thêm nền background_color cho icon.
   - Viết script node scripts/generate-pwa-icons.mjs dùng sharp để gen từ logo.png, thêm npm script "pwa:icons".

4. index.html (root):
   - Fix encoding UTF-8 như trên.
   - Thêm: <meta name="theme-color" content="#2d5a2d">, <meta name="mobile-web-app-capable" content="yes">, <meta name="apple-mobile-web-app-capable" content="yes">, <meta name="apple-mobile-web-app-status-bar-style" content="default">, <meta name="apple-mobile-web-app-title" content="Chiếu Nẫu">, <link rel="apple-touch-icon" href="/apple-touch-icon.png">, <meta name="description" chuẩn>, <meta property="og:*" cơ bản>.
   - KHÔNG đổi <script src="/src/main.jsx"> và <div id="root">.

5. ĐĂNG KÝ + UI PWA (src/):
   - Tạo src/hooks/usePWAInstall.js: lắng nghe beforeinstallprompt, lưu deferredPrompt, expose { canInstall, promptInstall() } + lắng nghe appinstalled.
   - Tạo src/components/ui/PWAInstallBanner.jsx: banner "Cài app Chiếu Nẫu" chỉ hiện khi canInstall=true, không hiện ở /admin, có nút Cài đặt / Để sau (lưu localStorage ẩn 7 ngày), style theo index.css hiện tại.
   - Tạo src/components/ui/PWAUpdateToast.jsx: dùng `virtual:pwa-register/react` (useRegisterSW) để hiện toast "Có bản mới — Cập nhật" khi needRefresh, nút Reload.
   - Mount 2 component này trong App.jsx (chỗ cạnh <BackToTop />, chỉ khi !isAdmin).
   - Đăng ký SW trong main.jsx (qua virtual:pwa-register, không tự viết navigator.serviceWorker thủ công).
   - Tạo trang offline fallback: src/pages/OfflinePage.jsx + route /offline (nội dung tiếng Việt: mất mạng, nút thử lại + về trang chủ). Cấu hình để SW fallback về /offline khi mất mạng hoàn toàn (nếu generateSW không hỗ trợ thì dùng navigateFallback /index.html vẫn OK, nhưng ưu tiên /offline).

6. ADMIN + GIỎ HÀNG:
   - Không cache trang /admin (thêm vào navigateFallbackDenylist nếu cần) để dữ liệu đơn hàng/user luôn tươi.
   - Giỏ hàng (CartContext dùng localStorage) phải hoạt động offline bình thường.

7. DEPLOY:
   - Giữ nguyên vercel.json rewrites. Kiểm tra SW (sw.js/workbox-*.js) + manifest.webmanifest được serve đúng MIME, không bị rewrite nuốt.
   - Nếu cần thêm headers cho SW (Service-Worker-Allowed), hướng dẫn thêm trong vercel.json.
   - Build thử `npm run build && npm run preview`, chụp log manifest + SW sinh ra ở dist/.

8. VERIFY:
   - Chạy Lighthouse (mobile) kiểm tra: Installable, PWA optimized, Works offline.
   - Test: Chrome Android install, iOS Add to Home Screen, tắt mạng load lại trang chủ/sản phẩm vẫn lên (từ cache), bật mạng lại update toast hiện.
   - Liệt kê file đã tạo/sửa + lệnh test.

RÀNG BUỘC:
- Không xóa route, component, CSS hiện tại. Chỉ thêm/sửa tối thiểu để gắn PWA.
- Code tiếng Việt comment rõ ràng chỗ PWA.
- Cuối cùng output: (a) diff file list, (b) cách chạy test PWA local, (c) lưu ý deploy Vercel/Render.

BẮT ĐẦU ĐI. Đọc vite.config.js, index.html, src/App.jsx, src/main.jsx, src/styles/index.css trước rồi làm.
```

---

## GHI CHÚ CHO TOÀN (không cần gửi Claude):
- Claude Code chạy prompt trên sẽ tự đọc 5 file kể trên để lấy màu primary/background chuẩn.
- Nếu muốn push notification sau này thì làm phase 2 (cần VAPID + backend), phase 1 chỉ cần installable + offline là đủ điểm thi.
- File icons gen bằng `npm run pwa:icons` sau khi cài sharp: `npm i -D sharp`.
- Test nhanh: `npm run build && npx vite preview --port 4173` rồi mở DevTools > Application > Manifest + Service Workers.
```

Path: D:\test-demo-react\duAnCuocThiMoi\prompt-pwa-cho-claude.md
