# Prompt Phase 1.6 Fix App vs Web — Dự án Chiếu Nẫu (copy cho Claude Code)

> Copy toàn bộ khối bên dưới dán cho Claude / Claude Code. Nối tiếp Phase 1.5 (PWA + App-mode đã xong).

---

## PROMPT COPY-PASTE CHO CLAUDE:

```
Bạn là Senior Frontend + Backend Dev chuyên PWA + React + Vite + Express.

CONTEXT DỰ ÁN (Phase 1 + 1.5 ĐÃ XONG):
- Dự án: "Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế" tại D:\test-demo-react\duAnCuocThiMoi
- Stack: Vite 6 + React 19 + react-router-dom 7 + Express backend (server/index.js, proxy /api -> localhost:3001) + sql.js/json store
- PWA: vite-plugin-pwa generateSW, registerType prompt, manifest name 'Chiếu Nẫu - Gìn Nghề, Giữ Sinh Kế', theme #2d5a2d / background #faf7f2, display standalone, lang vi, icons 192 + 512 + maskable, workbox NetworkFirst /api 5 phút, CacheFirst ảnh 30 ngày, navigateFallbackDenylist [/^\/api/, /^\/admin/]
- App-mode: src/hooks/useAppMode.js detect display-mode standalone -> body.app-mode, src/utils/standalone.js checkStandalone(), src/utils/appPromo.js export APP_PROMO { code: 'APP10', percent: 10, label: 'Ưu đãi app: giảm 10% đơn đầu' }
- Hiện tại: src/components/app/BottomTabBar.jsx 5 tab (Trang chủ / - Sản phẩm /san-pham - Quét QR /quet-ma nút giữa nổi - Giỏ /gio-hang badge cartCount - Tài khoản /tai-khoan), chỉ render khi isApp && !isAdmin, fixed bottom + safe-area
- src/components/app/AppPromoBanner.jsx banner APP10 + nút copy clipboard, chỉ isApp && !isAdmin
- src/components/app/AppSplash.jsx overlay /logo.png + tên + tagline, tắt sau ~900ms
- src/pages/CheckoutPage.jsx có ô voucher: nếu APP10 && isApp thì discount = 10% subtotal, grandTotal = cartTotal - discount + ship, gửi voucherCode + discount + total lên backend
- src/pages/VerifyPage.jsx /quet-ma đã có camera thật html5-qrcode
- Navbar.jsx web có 6 mục: Trang chủ, Câu chuyện, Sản phẩm, Quà doanh nghiệp, Tác động xã hội, Cẩm nang + nút QR + tài khoản + giỏ
- src/styles/app-mode.css: body.app-mode padding-bottom 72px, ẩn .nav-links + .nav-hamburger, đẩy SupportHub/BackToTop lên, tab bar 62px + blur, splash z-index cao
- index.html UTF-8 chuẩn, theme-color, apple-touch-icon, OG đầy đủ

BUG ĐÃ PHÁT HIỆN (bạn phải fix hết):
BUG-0 (nghiêm trọng nhất): Backend server/index.js POST /api/orders hiện tại DESTRUCTURE { customerName, phone, email, address, note, paymentMethod, shippingMethod, items } rồi TỰ TÍNH LẠI subtotal + shippingFee + total = subtotal + shippingFee, BỎ QUA HOÀN TOÀN voucherCode/discount/total frontend gửi lên. Hậu quả: khách app nhập APP10 thấy trừ 10% ở UI nhưng backend vẫn lưu/chARGE giá gốc. Phải fix backend + frontend đồng bộ.
BUG-1: App ẩn hết nav-links + hamburger (đúng) nhưng tab chỉ giữ Trang chủ + Sản phẩm, làm 4 trang content (Câu chuyện /cau-chuyen, Quà DN /qua-tang-doanh-nghiep, Tác động /tac-dong-xa-hoi, Cẩm nang /cam-nang) trong app chỉ vào được qua footer/home. Giám khảo bấm app sẽ hỏi "mất đâu rồi?".
BUG-2: AppPromoBanner fixed top dưới navbar, hiện mọi trang kể cả /thanh-toan + /gio-hang, state dismissed reset khi chuyển trang (quay lại là hiện lại), che hero trên máy 360px.
BUG-3: Voucher tin frontend quá: isApp check ở client, ai fake request POST /api/orders kèm voucherCode là lách được. Thi thì OK nhưng phải có validate tối thiểu server-side + ghi chú giới hạn.
BUG-4 lặt vặt: (a) manifest orientation portrait-primary khóa dọc, tablet ngang coi cực; (b) splash dùng /logo.png 447KB nặng, 4G load chậm; (c) checkout offline là fetch fail chung chung, chưa disable nút + báo rõ; (d) AppSplash startExit có thể chạy 2 lần (timer 900ms + window load), thiếu guard.

MỤC TIÊU PHASE 1.6:
Fix 5 nhóm trên, web browser GIỮ NGUYÊN 100%, mọi thay đổi app-only nằm sau isApp. Không phá routes/checkout/PWA hiện tại. Không cài lib mới trừ khi bắt buộc (đã có html5-qrcode, không cần thêm icon lib — dùng SVG inline).

YÊU CẦU KỸ THUẬT (làm theo thứ tự):

1. FIX BACKEND VOUCHER (server/index.js) — LÀM TRƯỚC:
   - Đọc kỹ endpoint POST /api/orders hiện tại trước khi sửa.
   - Cho phép body nhận thêm: voucherCode (string|null), discount (number, >=0).
   - Validate: chỉ chấp nhận voucherCode === 'APP10' (lấy từ hằng số, comment rõ để sau đổi sang DB). Nếu mã khác → 400 { message: 'Mã giảm giá không hợp lệ' }.
   - Tính: subtotal từ giá DB như cũ, discountAmount = voucherCode==='APP10' ? Math.round(subtotal*10/100) : 0. Chặn discount gửi lên > discount server tính (lấy min). total = max(0, subtotal - discountAmount + shippingFee).
   - Lưu vào order: voucher_code, discount_amount, subtotal, shipping_fee, total. Giữ note hiện tại (frontend đã append "[App Promo: APP10 - Giảm X₫]") — backend không cần append thêm, chỉ đảm bảo không mất note cũ.
   - GET /api/orders/:id và GET admin orders phải trả về 2 trường mới để admin thấy đơn nào xài APP10.
   - Admin dashboard tính totalRevenue theo total đã trừ (tự đúng nếu dùng order.total).
   - Comment tiếng Việt chỗ voucher: "Phase 1.6: validate server-side tối thiểu, Phase 2 chuyển sang bảng vouchers + giới hạn 1 lần/user".
   - KHÔNG đổi logic sản phẩm/shipping/status hiện tại.

2. FIX FRONTEND CHECKOUT ĐỒNG BỘ (src/pages/CheckoutPage.jsx):
   - Giữ UI ô voucher hiện tại, nhưng sau khi POST phải dùng order.total backend trả về để hiển thị ở trang success (đừng hiển thị grandTotal frontend tự tính như đã chắc chắn đúng).
   - Nếu backend 400 mã giảm giá → hiện voucherError đúng message backend, không redirect.
   - Thêm try/catch offline: nếu !navigator.onLine hoặc fetch TypeError Failed to fetch → setError('Bạn đang ngoại tuyến. Vui lòng kết nối mạng để đặt hàng.') + disable nút Đặt hàng khi offline (lắng nghe online/offline events). TODO comment rõ: Phase 2 làm background-sync queue đơn.
   - Giữ isApp gate: web nhập APP10 vẫn bị từ chối như cũ.

3. TAB KHÁM PHÁ CHO APP (BottomTabBar.jsx + CSS):
   - Đổi cấu trúc 5 tab thành: Trang chủ (/) — Sản phẩm (/san-pham) — Quét QR (/quet-ma, giữ nút giữa nổi) — Khám phá (mở bottom-sheet, không phải route) — Tài khoản (/tai-khoan).
   - Chuyển Giỏ /gio-hang RA KHỎI tab (vì đã có nút giỏ trên Navbar + CartDrawer, badge vẫn giữ trên Navbar). Lý do: trong app 4 trang content đang mồ côi, cần 1 tab dẫn tới chúng hơn là trùng giỏ.
   - Tab Khám phá: bấm mở bottom-sheet (component mới src/components/app/ExploreSheet.jsx) liệt kê 4 mục: Câu chuyện /cau-chuyen, Quà doanh nghiệp /qua-tang-doanh-nghiep, Tác động xã hội /tac-dong-xa-hoi, Cẩm nang /cam-nang — mỗi mục icon SVG inline + label + desc 1 dòng, bấm vào navigate + đóng sheet. Hỗ trợ đóng bằng nút X + bấm backdrop + phím Escape. Active state khi pathname nằm trong 4 trang đó.
   - Chỉ render BottomTabBar khi isApp && !isAdmin như cũ. Sheet cũng chỉ trong app.
   - CSS trong app-mode.css: .app-explore-sheet-backdrop fixed inset 0 rgba(0,0,0,.4), .app-explore-sheet fixed bottom, border-radius 18px 18px 0 0, background cream-light, animation slideUp .25s, safe-area padding, z-index trên tab bar (9950) dưới splash. Dùng biến CSS có sẵn, không hardcode màu mới.
   - Mobile 360px: tab không che nút thanh toán, sheet full-width.
   - Nếu muốn giữ Giỏ trong tab thì đề xuất alternative: 6 tab là quá chật — KHÔNG làm 6 tab, chốt 5 tab như trên.

4. FIX BANNER APP10 (AppPromoBanner.jsx):
   - Thêm localStorage key 'cn_app_promo_dismissed' lưu timestamp khi user bấm X, ẩn 7 ngày (reuse pattern PWAInstallBanner đang dùng). Quay lại trang không hiện lại trong 7 ngày.
   - Không render ở /thanh-toan, /gio-hang, /dat-hang-thanh-cong/:id (để không che CTA thanh toán). Chỉ hiện ở trang content/sản phẩm.
   - Giữ điều kiện isApp && !isAdmin.
   - CSS: trên màn <=380px thu gọn padding + font-size để không che hero.

5. FIX LẶT VẶT:
   - (a) vite.config.js manifest orientation: đổi 'portrait-primary' thành 'portrait' (hoặc bỏ hẳn để tablet xoay được). Giữ display standalone.
   - (b) Splash logo nhẹ: tạo public/logo-splash.webp (~96-128px, <40KB) từ logo.png bằng sharp (reuse scripts/generate-pwa-icons.mjs hoặc viết script nhỏ), AppSplash.jsx dùng ảnh này thay /logo.png, giữ alt. Nếu gen ảnh thất bại thì giữ logo.png + ghi chú rõ.
   - (c) AppSplash guard: thêm ref/flag faded để startExit chỉ chạy 1 lần (timer 900ms vs window load đua nhau). Cleanup timer như cũ.
   - (d) Checkout offline như mục 2 đã nêu (làm chung 1 lần).

6. MOUNT + ROUTES (App.jsx):
   - Mount <ExploreSheet /> cạnh <BottomTabBar /> (state mở/đóng nằm trong BottomTabBar hoặc context nhẹ, App.jsx chỉ mount, không đụng isAdmin logic).
   - Không đụng PWAInstallBanner/PWAUpdateToast/SupportHub/BackToTop hiện tại.
   - Không thêm route mới (Khám phá là sheet, không phải page).

RÀNG BUỘC:
- Web browser giữ nguyên 100%. Mọi UI app-only sau isApp.
- Không cài dependency mới. SVG inline, CSS thuần, clipboard/native API.
- Không hardcode màu/font mới — bám design tokens src/styles/index.css (--primary #2d5a2d, --cream-light #faf7f2...).
- Không xóa/sửa logic Phase 1 (SW, workbox, manifest trừ orientation, usePWAInstall API).
- Comment tiếng Việt chỗ app-only + voucher.
- Cuối cùng output: (a) list file tạo/sửa, (b) cách test browser vs standalone (DevTools Rendering > emulate display-mode standalone), (c) cách test voucher đúng (app trừ 10% + backend lưu total đã trừ + admin thấy, web bị từ chối, fake POST mã sai bị 400), (d) việc dồn Phase 2 (bảng vouchers DB, giới hạn 1 lần/user, push, background-sync).

BẮT ĐẦU ĐI. Đọc server/index.js (POST /api/orders), src/App.jsx, src/components/app/BottomTabBar.jsx, src/components/app/AppPromoBanner.jsx, src/components/app/AppSplash.jsx, src/pages/CheckoutPage.jsx, src/hooks/useAppMode.js, src/utils/appPromo.js, src/styles/app-mode.css, vite.config.js trước rồi làm.
```

---

## GHI CHÚ CHO TOÀN (không cần gửi Claude):
- BUG-0 là nặng nhất: backend hiện bỏ qua voucher nên APP10 chỉ trừ ảo ở UI, đơn thật vẫn giá gốc → Claude phải fix backend trước, frontend sau.
- Đổi tab Giỏ → Khám phá là quyết định UX: Navbar đã có giỏ + badge rồi, tab nên cứu 4 trang mồ côi. Nếu Chiếu không chịu thì bảo Claude giữ Giỏ + nhét Khám phá vào hamburger riêng cho app (fallback).
- Test voucher: DevTools Rendering emulate standalone → nhập APP10 → check Network POST /api/orders payload + response order.total, vào admin orders coi discount_amount.
- Ảnh splash webp gen bằng sharp cho nhẹ, không là mở app 4G chờ logo 447KB rất quê.
- Prompt này nối Phase 1.5, không cần giải thích lại PWA là gì.
