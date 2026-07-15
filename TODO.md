# TODO - UI đồng bộ phong cách Header (Tailwind)

- [ ] Chuẩn hoá layout để tránh bị Header fixed che nội dung (DashboardLayout.css)
- [ ] Tạo bộ class “theme” dùng chung (App.css hoặc index.css) theo tone Header (glass, gradient, chữ white/gray)
- [x] Thiết kế lại phần layout spacing cho nội dung tránh header fixed
- [ ] Thiết kế lại các trang dashboard: Dashboard, Templates, LandingPages, Profile (thay h1 bằng layout có card/button/table placeholder)
- [ ] Thiết kế lại các trang Auth (Login/Register) theo tone Header
- [ ] Build/run kiểm tra (npm run dev trong frontend) và rà responsive cơ bản

# TODO - Fix backend duplicate key khi seed/template scan

- [x] Đổi validation unique key theo template_id trong StoreTemplateFieldRequest.php
- [ ] Tạo migration mới: đổi unique constraint ở template_fields.key thành composite (template_id, key)
- [ ] Chạy `php artisan migrate` để cập nhật constraint

