# Prompt PWA Phase 1.6 Hotfix — Fix bug chặn APP10 khi đặt hàng thật

Copy toàn bộ khối bên dưới vào Claude Code (mở tại thư mục `D:\test-demo-react\duAnCuocThiMoi`).

---

## PROMPT COPY-PASTE CHO CLAUDE

```
Root dự án: D:\test-demo-react\duAnCuocThiMoi
Stack: Vite 6 + React 19 + react-router-dom 7 + Express (server/index.js, port 3001, serve dist/ + API cùng origin).

### BUG CHẶN: thiếu isApp khi POST /api/orders → APP10 check qua nhưng đặt hàng rớt 400

Hiện trạng:
- src/pages/CheckoutPage.jsx: const { isApp } = useAppMode() đã có.
- handleApplyVoucher POST /api/vouchers/check body { code, subtotal, isApp, phone, email } → qua được vì có isApp.
- handleSubmit POST /api/orders body hiện tại:
  { ...form, note: finalNote, voucherCode, discount, items, subtotal, shippingFee, total }
  → THIẾU isApp.
- server/index.js POST /api/orders destructure { ..., isApp = false } và check:
  if (matchedVoucher.appOnly && !isApp) return 400 `Mã APP10 chỉ áp dụng độc quyền trên App`
  → Trong PWA standalone thật: bấm Áp dụng qua, bấm Đặt hàng rớt.

### FIX BẮT BUỘC (1 dòng)

File: src/pages/CheckoutPage.jsx, trong handleSubmit → fetch(getApiUrl('/api/orders'), ... body: JSON.stringify(...))

Sửa thành:
body: JSON.stringify({
  ...form,
  isApp, // <-- THÊM DÒNG NÀY, lấy từ useAppMode() đã có ở đầu file
  note: finalNote,
  voucherCode: appliedVoucher ? appliedVoucher.code : null,
  discount: discountAmount,
  items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
  subtotal: cartTotal,
  shippingFee,
  total: grandTotal
})

Yêu cầu:
- KHÔNG đổi logic khác. Web browser giữ nguyên 100%.
- KHÔNG thêm dependency mới.
- Giữ nguyên format tiếng Việt UTF-8, không BOM.

### VERIFY SAU FIX

1. npm run build → phải pass, không lỗi.
2. npm run server (port 3001) → mở http://localhost:3001
3. Test web (browser thường, isApp=false):
   - Nhập APP10 ở /thanh-toan → phải báo `chỉ áp dụng độc quyền trên App`.
   - Đặt hàng không voucher → 201, total = subtotal + shippingFee.
4. Test app (DevTools > Rendering > Emulate display-mode: standalone, hoặc cài PWA):
   - Nhập APP10 → /api/vouchers/check trả valid:true, discountAmount = min(round(subtotal*10/100), 100000).
   - Bấm Đặt hàng → POST /api/orders phải 201 (không còn 400), order trả về có voucher_code='APP10', discount_amount>0, total = subtotal - discount + ship.
   - Fake POST bằng curl không có isApp + voucherCode APP10 → phải 400.
5. Vào /admin/vouchers kiểm tra usedCount của APP10 tăng lên 1 sau đơn thành công.

Báo lại: file đã sửa + kết quả 5 bước verify trên.
```

---

## Ghi chú cho Toàn (không copy vào Claude)

- File cần sửa duy nhất: `src/pages/CheckoutPage.jsx` (~1 dòng).
- Sau khi Claude báo xong: `npm run build` lại để `dist/` mới nhất (dist hiện tại build 13:03 ngày 05/09, chưa có fix).
- Muốn dùng thật: nhớ đổi `admin/admin123` + `JWT_SECRET` + giới hạn CORS + chạy HTTPS thì PWA mới cài được lên điện thoại.
