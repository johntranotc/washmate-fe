# WashMate — Danh sách việc Backend cần xử lý (bàn giao)

> Tổng hợp từ quá trình hoàn thiện **Customer Portal** (frontend). Toàn bộ frontend đã dùng
> **100% API thật**, không mock/fake. Các mục dưới đây là **bug/thiếu sót phía backend**
> khiến một số hành động bị chặn — frontend đã xử lý an toàn (disable / thông báo rõ / không fake).
>
> Quy ước ưu tiên: 🔴 chặn tính năng · 🟠 ảnh hưởng trải nghiệm · 🟡 thiếu, nên bổ sung.

---

## 🔴 1. `getByEmail` (GET `/api/v1/vehicles/my-vehicles`) — thiếu field + không lọc xe đã xóa

**File:** `service/VehicleServiceImpl.java` → `getByEmail(...)`

**Vấn đề:**
- Dùng `vehicleRepository.findVehicleByUserId(userId)` — **KHÔNG lọc `deletedAt`** → trả về cả xe đã xóa mềm.
- Builder response **thiếu `.model()` và `.status()`** (chỉ set vehicleId/licensePlate/brand/color).

**Hệ quả trên UI:**
- Mọi xe hiển thị "Dòng xe: Chưa cập nhật" và luôn "Đang sử dụng" (vì `status`=null).
- Xóa xe xong xe **không biến mất** (danh sách vẫn trả về), bấm xóa lại → **500**.

**Cách sửa (2 chỗ):**
```java
// (1) Lọc xe đã xóa:
List<Vehicle> vehicles = vehicleRepository.findByUser_IdAndDeletedAtIsNull(user.getId());

// (2) Trả đủ field trong builder:
VehicleResponse.builder()
    .vehicleId(v.getId()).licensePlate(v.getLicensePlate())
    .brand(v.getBrand()).model(v.getModel())            // + model
    .color(v.getColor()).status(v.getStatus().name())   // + status
    .build();
```

---

## 🔴 2. Xóa xe ném `RuntimeException` → HTTP 500

**File:** `service/VehicleServiceImpl.java` → `findVehicleById(...)`

**Vấn đề:** `findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new RuntimeException("không tìm thấy..."))`
→ `RuntimeException` được map thành **500 Internal Server Error** thay vì 404/409.

**Cách sửa:** ném exception có mã HTTP hợp lệ (vd. `ApiException(HttpStatus.NOT_FOUND, ...)` hoặc
`HttpStatus.CONFLICT` nếu xe còn ràng buộc booking) kèm message tiếng Việt.

---

## 🔴 3. "Tạm ẩn xe" (PUT `/vehicles/{id}`) — 400 do thiếu `model`

**File:** `dto/request/vehicles/UpdateVehicleRequest.java`

**Vấn đề:** DTO bắt `@NotBlank` cả `model` và `color`, nhưng endpoint danh sách (mục 1) **không trả `model`**
→ frontend không có `model` thật để gửi kèm khi chỉ đổi `status` → **400 "Dữ liệu không hợp lệ"**.
Ngoài ra **không có** `GET /vehicles/{id}` cho customer để lấy lại full thông tin xe.

**Cách sửa:** làm mục 1 (trả đủ `model`/`status`) là đủ; hoặc thêm `GET /vehicles/{id}` (customer)
trả full data qua `mapToResponse` (đã có sẵn model/status).

---

## 🔴 10. `GET /api/v1/customer/loyalty` — 500 khi khách có nhiều tài khoản loyalty

**File:** `service/CustomerLoyaltyServiceImpl.java` → `getMyLoyalty(userId)` +
`repository/LoyaltyAccountRepository.java` → `Optional<LoyaltyAccount> findByUserId(Integer userId)`

**Vấn đề:** khách có tài khoản tích điểm ở **nhiều gara** (mỗi gara 1 account, sinh khi hoàn tất
rửa/đổi quà). `findByUserId` trả `Optional` (1 kết quả) → gặp ≥2 account ném
`IncorrectResultSizeDataAccessException` → 500. Trang "Điểm thành viên" của khách hỏng ngay sau khi
phát sinh account thứ 2.

**Cách sửa:** trả về theo gara cụ thể (`findByUserIdAndGarageId`) hoặc danh sách như
`LoyaltyService.getMyAccounts` (`findByUserIdOrderByGarageNameAsc`).

**FE tạm thời:** `loyaltyApi.getMyLoyalty` dùng `/api/loyalty/me` (trả danh sách, chọn tài khoản chính).

---

## 🟠 9. `RewardResponse` (ưu đãi đổi điểm) — thiếu mức giảm & tên gara

**File:** `dto/response/Reward/RewardResponse.java`

**Vấn đề:** chỉ trả `{ rewardId, garageId, name, description, pointsRequired, stock, status }`.
Không có `discountType`/`discountValue`/`maxDiscount`/`minOrderValue` (đang nằm ở `Reward.promotion`)
và không có `garageName`. → Khách không biết ưu đãi **giảm bao nhiêu %/tiền** khi đổi, trừ khi
admin ghi vào `description`.

**Cách sửa:** thêm các field lấy từ `reward.getPromotion()` (discountType, discountValue, maxDiscount,
minOrderValue) và `reward.getGarage().getName()` vào `RewardResponse.from(...)`.

**FE tạm thời:** form tạo tự sinh `description` nêu mức giảm khi admin bỏ trống; hộp đổi quà hiển thị
tên gara của tài khoản (mọi ưu đãi đều thuộc gara của khách).

---

## 🔴 8. Lịch sử điểm (GET `/api/v1/customer/loyalty/transactions`) — lọc sai, bỏ sót giao dịch

**File:** `service/CustomerLoyaltyServiceImpl.java` → `getTransactions(Integer userId)`

**Vấn đề:** lấy `account = findByUserId(userId)` rồi gọi
`findByAccountUserIdOrderByCreatedAtDesc(account.getId())` — truyền **id tài khoản** vào query
đang lọc theo **id người dùng** (`account.user.id`). Kết quả trả về giao dịch của **sai người dùng**
(hoặc rỗng), khách không thấy đủ lịch sử tích điểm của mình.

**Cách sửa:** truyền `userId` (không phải `account.getId()`):
`findByAccountUserIdOrderByCreatedAtDesc(userId)` — giống `LoyaltyService.getMyTransactions` (đang đúng).

**FE tạm thời:** `loyaltyApi.getLoyaltyTransactions` dùng endpoint cũ `/api/loyalty/transactions`
(lọc đúng theo userId) cho tới khi endpoint mới được sửa.

---

## 🔴 4. Đổi quà (POST `/api/v1/rewards/{rewardId}/redeem`) — sai chữ ký, không gọi được

**File:** `controller/RewardController.java` → `redeemReward(...)`

**Vấn đề:** method khai báo `@PathVariable Integer garageId` nhưng path chỉ là `/{rewardId}/redeem`
(**không có** biến `{garageId}` trong URL) → Spring ném `MissingPathVariableException` khi gọi.

**Cách sửa:** bỏ `@PathVariable garageId`, lấy `garageId` từ tài khoản loyalty/principal;
hoặc thêm `{garageId}` vào đường dẫn mapping cho khớp.

---

## 🟠 5. Loyalty đa chi nhánh — thiếu endpoint tổng hợp

`GET /api/loyalty/me` trả **danh sách** tài khoản loyalty (mỗi gara một cái). Frontend đang tạm lấy
tài khoản nhiều điểm nhất làm chính. Nếu nghiệp vụ cần gộp điểm/hạng toàn hệ thống → cần endpoint tổng hợp.

---

## 🟡 6. Các field/endpoint còn thiếu (frontend đang hiển thị "Sắp có"/"—")

- **Xe mặc định:** entity `Vehicle` không có `isDefault` → KPI/menu "Đặt xe mặc định" để "Sắp có".
- **Hóa đơn PDF:** không có file/`downloadUrl` thật → nút tải chỉ tạo `.txt` phía trình duyệt.
- **Ưu đãi (Promotion):** entity chỉ có `promoCode` (không có `name`/`description`) và **không có tier eligibility**
  → tiêu đề ưu đãi suy từ giá trị giảm; đã bỏ tab/KPI "dành cho thành viên".
- **Thông báo:** không có API đánh dấu **chưa đọc** / **ẩn** / **xóa**, và **không có field `link`**
  → frontend chỉ có "Đánh dấu đã đọc"; CTA suy từ `type` + `bookingId`.
  Nếu backend chưa gửi `type` chứa "PAY" thì tab "Thanh toán" sẽ trống.

---

## 🟡 7. Dữ liệu seed/test trong DB

Các entity (booking, tier, reward, promotion, notification) **không có cờ** `isSeed/isDemo/isTest`
để frontend lọc. Nếu DB còn dữ liệu mẫu/test, cần **dọn ở phía DB/backend** (frontend không tự bịa thay thế).

---

## ✅ Đã xử lý xong (tham khảo)

- **Đăng nhập Google:** cần biến môi trường `GOOGLE_CLIENT_ID` (trước đây trống → báo
  "Google login is not configured"). Đã thêm vào `.env` backend và khởi động lại → chạy được.
  Lưu ý: Client ID phải khai báo `http://localhost:3000` trong **Authorized JavaScript origins**
  (Google Cloud Console).
