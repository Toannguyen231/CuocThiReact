# Prompt Phase 1.5 App Experience cho Claude — Dự án Chiếu Nẫu

> Copy toàn bộ khối bên dưới dán cho Claude / Claude Code. Nối tiếp Phase 1 (PWA installable đã xong).

---

## PROMPT COPY-PASTE CHO CLAUDE:

```
Bạn là Senior Frontend Dev chuyên về PWA + React + Mobile UX.

CONTEXT DỰ ÁN (nối tiếp Phase 1 — PWA đã xong):
- Dự án: "Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế" tại D:\test-demo-react\duAnCuocThiMoi
- Stack: Vite 6 + React 19 + react-router-dom 7 + Express backend (server/index.js, proxy /api -> localhost:3001)
- Phase 1 ĐÃ CÓ: vite-plugin-pwa (generateSW, registerType prompt), manifest theme #2d5a2d / background #faf7f2,
  src/hooks/usePWAInstall.js (canInstall, promptInstall, isInstalled),
  src/components/ui/PWAInstallBanner.jsx, src/components/ui/PWAUpdateToast.jsx,
  src/pages/OfflinePage.jsx + route /offline, npm script "pwa:icons", navigateFallbackDenylist [/^\/api/, /^\/admin/]
- App.jsx hiện tại: Navbar + CartDrawer + Routes (public + /admin) + Footer + SupportHub + BackToTop + PWAInstallBanner + PWAUpdateToast, phân biệt isAdmin bằng location.pathname.startsWith('/admin')
- Navbar.jsx: navItems 6 mục (Trang chủ, Câu chuyện, Sản phẩm, Quà doanh nghiệp, Tác động xã hội, Cẩm nang) + nút tài khoản + nút giỏ (cartCount badge)
- CartContext.jsx: localStorage key 'chieunau_cart', expose cart, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, drawerOpen/openDrawer/closeDrawer
- CheckoutPage.jsx: form customerName/phone/email/address/note + shippingMethod (standard free / express 30k) + paymentMethod (cod/bank), POST /api/orders { form..., items, subtotal, shippingFee, total }, redirect /dat-hang-thanh-cong/:id
- products.js: 4 sản phẩm (id, slug, name, price, ...), giftSets, categories
- Design tokens trong src/styles/index.css: --primary #2d5a2d, --primary-dark #1a2e1a, --cream #f5f0e8, --cream-light #faf7f2, --accent-warm #d4a574, --font-heading Playfair Display, --font-body Inter, --navbar-height 80px

MỤC TIÊU PHASE 1.5:
Biến bản PWA đã cài (display-mode: standalone) thành trải nghiệm "như app thật": bottom tab, voucher độc quyền app, splash khi mở app, trang xác thực sản phẩm (khung QR). Web mở bằng browser GIỮ NGUYÊN 100% — mọi khác biệt chỉ bật khi chạy trong app đã cài. KHÔNG phá vỡ Phase 1, routes, checkout, deploy.

YÊU CẦU KỸ THUẬT (làm đầy đủ theo thứ tự):

0. FIX ENCODING vite.config.js (làm trước):
   - File vite.config.js hiện bị lỗi encoding tiếng Việt (manifest name/description + comment dính ký tự "Chi���u N���u", "Hi���n toast...").
   - Viết lại toàn bộ string tiếng Việt trong manifest + comment sang UTF-8 chuẩn: name 'Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế', description 'Chiếu truyền thống Việt — sản phẩm thủ công, quà tặng doanh nghiệp, tác động xã hội.', comment tiếng Việt không dấu lỗi.
   - Không đổi logic config, chỉ fix chữ.

1. HOOK useAppMode (src/hooks/useAppMode.js):
   - Detect app đã cài: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true. Lắng nghe thay đổi matchMedia.
   - Reuse logic isInstalled từ usePWAInstall (được phép refactor nhẹ: tách hàm checkStandalone dùng chung, không xóa API cũ canInstall/promptInstall/isInstalled).
   - Expose { isApp }. Thêm body class 'app-mode' khi isApp=true (để CSS hook), cleanup khi unmount.
   - File riêng src/utils/appPromo.js: export const APP_PROMO = { code: 'APP10', percent: 10, label: 'Ưu đãi app: giảm 10% đơn đầu' }.

2. BOTTOM TAB BAR (src/components/app/BottomTabBar.jsx):
   - 5 tab: Trang chủ (/) — Sản phẩm (/san-pham) — Câu chuyện (/cau-chuyen) — Giỏ (/gio-hang, hiện badge cartCount từ useCart) — Tài khoản (/tai-khoan).
   - Active state theo useLocation, màu active var(--primary), icon SVG inline stroke hiện tại (đừng cài lib icon mới).
   - Chỉ render khi isApp && !isAdmin. fixed bottom, hỗ trợ safe-area: padding-bottom: env(safe-area-inset-bottom).
   - Khi isApp: Navbar thu gọn (ẩn .nav-links vì tab đã lo điều hướng — làm bằng CSS class body.app-mode, KHÔNG sửa JSX Navbar trừ khi bắt buộc), body padding-bottom chừa chỗ cho tab để Footer/SupportHub/BackToTop không bị che.
   - Không hiện ở /admin, /offline vẫn hiện (để điều hướng khi mất mạng).

3. VOUCHER ĐỘC QUYỀN APP (AppPromoBanner + voucher checkout):
   - Tạo src/components/app/AppPromoBanner.jsx: banner "Mở bằng App Chiếu Nẫu — nhập APP10 giảm 10% đơn đầu" + nút Copy mã (navigator.clipboard, fallback prompt). Chỉ render khi isApp && !isAdmin. Đặt trong App.jsx cạnh PWAInstallBanner.
   - Web browser thường KHÔNG thấy banner này, KHÔNG được xài mã.
   - CheckoutPage.jsx: thêm ô "Mã ưu đãi" — nếu nhập APP10 && isApp thì giảm 10% subtotal, hiện dòng "Ưu đãi app APP10 (−10%)", grandTotal = cartTotal − discount + shippingFee.
   - Trước khi code: ĐỌC server/index.js endpoint POST /api/orders xem backend có validate total/voucher không. Nếu backend tính lại total thì gửi thêm voucherCode + discount để backend trừ; nếu backend chỉ lưu total thì gửi total đã trừ. Không được để đơn app bị backend từ chối. Ghi chú rõ trong code chỗ nào frontend trừ / backend trừ.

4. APP SPLASH (src/components/app/AppSplash.jsx):
   - Overlay logo /logo.png trên nền var(--cream-light), tên "Chiếu Nẫu" + tagline "Gìn Nghề — Giữ Sinh Kế", màu var(--primary).
   - Chỉ hiện khi isApp, tự fade-out sau ~900ms hoặc khi window load (lấy điều kiện nào tới trước), animation CSS thuần, z-index cao nhất, không chặn click sau khi ẩn.
   - Mount trong App.jsx đầu tiên (trước PageLoader).

5. TRANG XÁC THỰC / QUÉT MÃ (src/pages/VerifyPage.jsx + route /quet-ma):
   - Route public /quet-ma (+ /quet-ma.html cho đồng bộ pattern static hiện tại).
   - UI: ô nhập mã sản phẩm (nhận id hoặc slug trong products.js) + nút "Kiểm tra" → hiện card sản phẩm (ảnh, tên, categoryName, specs, shortDesc) + tick "Hàng thật từ Chiếu Nẫu"; mã sai → thông báo thân thiện + link /san-pham.
   - Hỗ trợ query ?code=xxx để prefill (VD /quet-ma?code=tui-xach-coi).
   - Khung camera quét QR THẬT để Phase 2 (ghi TODO rõ trong code: cần lib quét + quyền camera + HTTPS). Phase này chỉ làm nhập mã tay + giao diện sẵn sàng.
   - ProductDetailPage: thêm link nhỏ "Kiểm tra hàng thật →" dẫn tới /quet-ma?code=<slug>.

6. CSS APP MODE (src/styles/app-mode.css, import trong App.jsx hoặc main.jsx):
   - Toàn bộ style BottomTabBar, AppPromoBanner, AppSplash, body.app-mode .navbar thu gọn, body.app-mode padding-bottom cho tab, safe-area.
   - Chỉ dùng biến CSS có sẵn trong index.css, không hardcode màu mới (trừ rgba từ palette cũ). Không sửa index.css hiện tại trừ import 1 dòng.

7. MOUNT TRONG App.jsx:
   - Thêm: <AppSplash /> đầu tiên, <BottomTabBar /> + <AppPromoBanner /> cạnh PWAInstallBanner (điều kiện isApp && !isAdmin nằm trong component, App.jsx chỉ mount).
   - Thêm route /quet-ma + /quet-ma.html.
   - Không đụng logic isAdmin, ProtectedRoute, PWAInstallBanner/PWAUpdateToast hiện tại.

8. VERIFY:
   - npm run build thành công, preview, DevTools Application > Manifest + Service Workers vẫn xanh như Phase 1.
   - Test 2 chế độ: (a) browser thường: không tab bar, không banner APP10, nhập APP10 ở checkout bị từ chối; (b) giả lập app: DevTools > Rendering > Emulate CSS media feature display-mode: standalone → tab bar hiện, banner hiện, APP10 trừ 10% đúng, splash chạy 1 lần.
   - Test mobile width 360px: tab không che nút thanh toán, giỏ badge nhảy số đúng.
   - Liệt kê file tạo/sửa + lệnh test.

RÀNG BUỘC:
- Web browser giữ nguyên 100% trải nghiệm cũ. Mọi thứ app-only phải nằm sau isApp.
- Không cài thêm dependency (SVG inline, CSS thuần, clipboard API native). Ngoại lệ duy nhất: nếu checkout cần lib gì thì hỏi trước.
- Không xóa/sửa logic Phase 1 (usePWAInstall API, SW, workbox, manifest). Được refactor nhẹ để dùng chung hàm checkStandalone.
- Không hardcode màu/font mới — bám design tokens index.css.
- Comment tiếng Việt chỗ app-only.
- Cuối cùng output: (a) diff file list, (b) cách test 2 chế độ browser vs standalone, (c) danh sách việc dồn sang Phase 2 (camera QR, push, background sync).

BẮT ĐẦU ĐI. Đọc vite.config.js, src/App.jsx, src/main.jsx, src/hooks/usePWAInstall.js, src/components/layout/Navbar.jsx, src/contexts/CartContext.jsx, src/pages/CheckoutPage.jsx, src/pages/ProductDetailPage.jsx, src/data/products.js, server/index.js (endpoint orders) trước rồi làm.
```

---

## GHI CHÚ CHO TOÀN (không cần gửi Claude):
- Phase 1 Claude làm xong ~90%: PWA plugin + banner + toast + offline page đã có, chỉ dính lỗi encoding trong vite.config.js (chữ Việt thành "Chi���u") → prompt trên bắt fix ở Step 0.
- Voucher APP10 trừ frontend hay backend tùy server/index.js validate kiểu gì — prompt đã dặn Claude đọc backend trước, không lo bể đơn.
- Camera quét QR thật dồn Phase 2 (cần HTTPS + lib), phase này chỉ nhập mã tay cho có khung demo thi.
- Test chế độ app không cần build ra điện thoại: Chrome DevTools > Rendering > emulate display-mode standalone là thấy tab bar ngay.
```

Path: D:\test-demo-react\duAnCuocThiMoi\prompt-pwa-phase15-app-cho-claude.md
