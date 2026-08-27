# KL2StU

KL2StU là một ứng dụng quản lý tài liệu và cộng tác nội bộ được xây dựng bằng React, TypeScript và Vite. Dự án mô phỏng một cổng quản trị tập trung cho tài liệu, nhóm làm việc, cuộc họp, tài khoản người dùng và xác thực.

## 1. Mục Tiêu Dự Án

Ứng dụng hướng tới việc quản lý các nghiệp vụ chính trong một môi trường doanh nghiệp:

- Quản lý tài liệu theo nhiều định dạng như PDF, Word, Excel, ảnh, tệp nén, ghi chú và nhóm file khác.
- Quản lý người dùng, vai trò và quyền truy cập theo mô hình RBAC.
- Quản lý đội nhóm, thành viên nhóm và trưởng nhóm.
- Quản lý cuộc họp, người tham gia, trạng thái và hình thức họp.
- Cấu hình tài khoản cá nhân, thông báo và tuỳ chọn giao diện.
- Cung cấp các màn hình đăng nhập, đăng ký, quên mật khẩu và xác thực tài khoản.

## 2. Công Nghệ Sử Dụng

- Frontend: React 19, TypeScript, React Router DOM
- Build tool: Vite
- UI: Material UI, Emotion
- Style: SCSS
- Kiểm tra chất lượng mã: ESLint
- CSDL mục tiêu: PostgreSQL

## 3. Cấu Trúc Chức Năng

### 3.1 Khu Vực Người Dùng Đăng Nhập

Sau khi đăng nhập, người dùng làm việc trong `MainLayout`, gồm:

- Thanh đầu trang với logo, ô tìm kiếm và thông tin người dùng.
- Menu điều hướng bên trái.
- Khu nội dung chính hiển thị theo route.
- Khung bên phải hiển thị dữ liệu gần đây và chat.

### 3.2 Các Màn Hình Chính

- Trang tổng quan: hiển thị danh sách tài liệu, thống kê tải lên/tải xuống, dung lượng đã dùng và thao tác với file.
- Trang tài liệu theo loại: PDF, Word, Excel, Media, Zip, Note và nhóm khác.
- Trang đội nhóm: danh sách nhóm, thành viên, vai trò và thông tin liên quan.
- Trang cuộc họp: danh sách họp, trạng thái, lịch họp và người tham gia.
- Trang danh sách tài khoản: quản lý người dùng trong hệ thống.
- Trang cài đặt: thông tin cá nhân, thông báo, giao diện, sao lưu và ngôn ngữ.
- Trang trợ giúp: nội dung hướng dẫn sử dụng.

### 3.3 Khu Vực Xác Thực

`GuestLayout` dùng cho các màn hình:

- Đăng nhập
- Đăng ký
- Xác thực tài khoản
- Khôi phục mật khẩu

## 4. Sơ Đồ Điều Hướng

Các route chính hiện có:

- `/` - Home
- `/pdf` - Danh sách tài liệu PDF
- `/word` - Danh sách tài liệu Word
- `/excel` - Danh sách tài liệu Excel
- `/media` - Tài liệu media
- `/zip` - Tài liệu nén
- `/note` - Ghi chú
- `/different` - Tài liệu khác
- `/team` - Quản lý nhóm
- `/team-info` - Chi tiết nhóm
- `/meeting` - Danh sách cuộc họp
- `/meeting-info` - Chi tiết cuộc họp
- `/account` - Danh sách tài khoản
- `/setting` - Cài đặt cá nhân
- `/help` - Trợ giúp
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/verify` - Xác thực tài khoản
- `/recover` - Khôi phục mật khẩu

## 5. Kiến Trúc Dữ Liệu PostgreSQL

Schema SQL được thiết kế theo 4 khối chính:

### 5.1 RBAC và Quản Lý Người Dùng

- `users`: lưu hồ sơ người dùng, email, mật khẩu băm, phòng ban, trạng thái, ngày tham gia và thời điểm hoạt động gần nhất.
- `roles`: danh mục vai trò, hiện có `admin`, `manager`, `member`.
- `user_roles`: bảng liên kết nhiều-nhiều giữa người dùng và vai trò.
- `permissions`: danh mục quyền chi tiết như `user:create`, `document:read`, `meeting:update`.
- `role_permissions`: bảng liên kết nhiều-nhiều giữa vai trò và quyền.
- `user_settings`: cấu hình cá nhân 1-1 với người dùng, gồm số điện thoại, thông báo, giao diện, ngôn ngữ, múi giờ và sao lưu.

### 5.2 Nhóm Làm Việc

- `teams`: thông tin nhóm, mô tả, trưởng nhóm, trạng thái, màu nhận diện, số dự án và ngày tạo.
- `team_members`: bảng liên kết nhiều-nhiều giữa nhóm và người dùng.

### 5.3 Cuộc Họp

- `meetings`: lưu tiêu đề, mô tả, ngày giờ họp, thời lượng, người tổ chức, trạng thái và hình thức họp.
- `meeting_participants`: bảng liên kết người tham gia cuộc họp.

### 5.4 Tài Liệu và Metadata Chuyên Biệt

- `documents`: bảng gốc lưu thông tin chung của tài liệu như tên, loại, dung lượng, tác giả và thời điểm upload.
- `pdf_metadata`: metadata riêng cho PDF, số trang.
- `word_metadata`: metadata riêng cho Word, số từ.
- `excel_metadata`: metadata riêng cho Excel, số sheet và số dòng.
- `media_metadata`: metadata cho ảnh, video, audio, gồm loại media và độ phân giải.
- `zip_metadata`: metadata cho file nén, loại archive và số lượng file bên trong.
- `note_metadata`: metadata cho ghi chú, nội dung, màu nền và trạng thái ghim.
- `note_tags`: danh sách tag của từng ghi chú.
- `other_metadata`: metadata cho các loại file khác như `.pptx`, `.yaml`, `.md`.

## 6. Quan Hệ Giữa Các Bảng

- Một người dùng có thể có nhiều vai trò thông qua `user_roles`.
- Một vai trò có thể có nhiều quyền thông qua `role_permissions`.
- Một người dùng có một cấu hình cá nhân duy nhất thông qua `user_settings`.
- Một nhóm có một trưởng nhóm, nhưng trưởng nhóm vẫn là một bản ghi trong `users`.
- Một nhóm có nhiều thành viên và một người dùng có thể thuộc nhiều nhóm thông qua `team_members`.
- Một cuộc họp có nhiều người tham gia và một người dùng có thể tham gia nhiều cuộc họp.
- Một tài liệu có thể có một bản ghi metadata chuyên biệt tuỳ theo loại tài liệu.

## 7. Chỉ Mục, Trigger Và Seed Dữ Liệu

### 7.1 Indexes

Schema tạo sẵn các chỉ mục để tối ưu truy vấn:

- `users.email`
- `user_roles.user_id`
- `role_permissions.role_id`
- `documents.author_id`
- `documents.type`
- `team_members.user_id`
- `meeting_participants.user_id`

### 7.2 Trigger

Có trigger `update_updated_at_column()` để tự động cập nhật trường `updated_at` khi dữ liệu thay đổi ở các bảng:

- `users`
- `user_settings`
- `teams`
- `meetings`
- `documents`

### 7.3 Dữ Liệu Mẫu

Schema có seed dữ liệu mẫu cho:

- Vai trò và quyền
- Người dùng và gán vai trò
- Cài đặt người dùng
- Nhóm và thành viên nhóm
- Cuộc họp và người tham gia
- Tài liệu và metadata tương ứng

## 8. Mô Tả Cấu Trúc SQL Cho PostgreSQL

### 8.1 Mục Đích Thiết Kế

Mô hình này phù hợp với hệ thống quản lý nội bộ có nhiều phân hệ. PostgreSQL được dùng vì hỗ trợ tốt:

- Ràng buộc dữ liệu bằng `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`
- Quan hệ nhiều-nhiều
- Kiểu `UUID`
- Trigger và hàm `plpgsql`
- Mở rộng schema theo từng loại tài liệu

### 8.2 Cấu Trúc Khóa Chính Và Khóa Ngoại

- Hầu hết bảng chính dùng `UUID` làm khóa chính.
- Các bảng liên kết dùng khóa chính ghép để đảm bảo không trùng bản ghi.
- Các trường liên kết có `ON DELETE CASCADE` hoặc `ON DELETE SET NULL` tuỳ ý nghĩa nghiệp vụ.

### 8.3 Lưu Ý Khi Triển Khai Thực Tế

- `meeting_participants` nên dùng một khóa chính ghép duy nhất theo cặp `(meeting_id, user_id)`.
- Nếu muốn chuẩn hoá hơn, có thể bổ sung bảng lịch sử file, phiên bản tài liệu, log audit và bảng thông báo.
- Trường `type` trong `documents` đang là nhãn phân loại logic của ứng dụng, còn metadata chi tiết được tách sang bảng con.

## 9. Tóm Tắt Nghiệp Vụ

Ứng dụng hiện mô phỏng một cổng quản trị gồm 5 vùng nghiệp vụ chính:

1. Xác thực và quản lý tài khoản.
2. Quản lý tài liệu đa định dạng.
3. Quản lý nhóm làm việc.
4. Quản lý cuộc họp.
5. Cấu hình cá nhân và trợ giúp người dùng.

## 10. Chạy Dự Án

```bash
npm install
npm run dev
```

Các lệnh hữu ích khác:

- `npm run build` - build ứng dụng cho production
- `npm run lint` - kiểm tra code style và lỗi lint
- `npm run preview` - xem bản build trước khi triển khai

## 11. Ghi Chú

Dự án đang có sẵn dữ liệu mock ở cả frontend và SQL để phục vụ demo giao diện, điều hướng và cấu trúc CSDL. Khi nối backend thật, có thể thay các dữ liệu mock bằng API và đồng bộ lại schema theo nghiệp vụ triển khai.
