src/
├── apis/ <-- TẦNG MẠNG (NETWORK LAYER)
│ ├── clients/
│ │ └── axiosClient.ts <-- Cấu hình Header, Interceptor (Bắt 401, 403, 500)
│ ├── authApi.ts <-- API Core (Đăng nhập, Đăng ký, Refresh Token)
│ └── userApi.ts <-- API Core (Lấy thông tin cá nhân, Đổi mật khẩu)
│
├── components/ <-- TẦNG UI HỆ THỐNG (DESIGN SYSTEM LAYER)
│ ├── common/ <-- Các nguyên tử UI cơ bản thuần túy (Atom Components - Không dính Store)
│ │ ├── Button/
│ │ │ ├── Button.tsx
│ │ │ └── index.ts
│ │ ├── Input.tsx
│ │ └── Select.tsx
│ ├── feedback/ <-- Trạng thái ứng dụng (Loading, Modal, Toast)
│ │ ├── GlobalSpinner/
│ │ └── Dialog/
│ └── layout/ <-- Các khung giao diện chung của hệ thống
│ ├── AuthLayout/ <-- Dùng cho nhóm các trang Login/Register
│ └── DashboardLayout/ <-- Dùng cho nhóm các trang có Sidebar/Header nội bộ
│
├── constants/ <-- TẦNG ĐỊNH DANH & CẤU HÌNH (CONFIGURATION LAYER)
│ ├── index.ts <-- Cổng đóng gói tập trung toàn bộ Constants
│ ├── api.constant.ts <-- Base URL, Endpoints, HTTP Status Codes
│ ├── storage.constant.ts <-- LocalStorage Keys (Token, Theme)
│ └── queryKey.constant.ts <-- Các key quản lý cache độc bản của TanStack Query
│
├── features/ <-- TẦNG TÍNH NĂNG (DOMAIN LAYER) - Nơi phát triển nghiệp vụ riêng lẻ
│ ├── auth/ <-- Module Core bắt buộc phải có
│ │ ├── components/ <-- LoginForm.tsx, RegisterForm.tsx
│ │ ├── hooks/ <-- useAuthQueries.ts (TanStack Query xử lý Login/Logout API)
│ │ ├── store/ <-- useAuthStore.ts (Zustand lưu User Info, IsAuthenticated tạm thời)
│ │ └── index.ts <-- Cổng đóng gói Public API (Chỉ export những gì cho bên ngoài xài)
│ │
│ ├── profile/ <-- Module Core thứ hai (Quản lý tài khoản cá nhân)
│ │ ├── components/ <-- ProfileCard.tsx, SecuritySettings.tsx
│ │ ├── hooks/ <-- useProfileQueries.ts
│ │ └── index.ts
│ │
│ └── [feature-name]/ <-- KHI CÓ NGHIỆP VỤ MỚI (SaaS, CRM...), CLONE LÀM THEO KHUÔN NÀY
│ ├── components/ <-- UI riêng của tính năng này
│ ├── hooks/ <-- Chứa Server State (Mọi logic fetch/mutation bằng TanStack Query)
│ ├── store/ <-- Chứa Client State (Zustand xử lý UI nội bộ) nếu cần
│ └── index.ts <-- Cổng đóng gói Public API
│
├── routes/ <-- TẦNG ĐIỀU HƯỚNG (NAVIGATION LAYER - TanStack Router)
│ ├── \_\_root.tsx <-- Layout gốc, nơi bọc React Query DevTools và Router DevTools
│ ├── index.tsx <-- Trang chủ công khai (Landing Page / Home)
│ ├── login.tsx <-- Trang Login
│ └── \_authenticated/ <-- ROUTE GROUP: Bắt buộc đăng nhập mới được đi vào
│ ├── route.tsx <-- File Guard (Check Zustand `isAuthenticated`, nếu chưa thì đá ra ngoài)
│ ├── dashboard.tsx <-- Trang Dashboard tổng quan hệ thống
│ └── profile.tsx <-- Trang cá nhân người dùng
│
├── services/ <-- TẦNG HẠ TẦNG & THỨ BA (INFRASTRUCTURE SERVICES - Có Side-effects)
│ ├── storageService.ts <-- Đọc/Ghi LocalStorage, SessionStorage an toàn (có thể mã hóa)
│ ├── loggerService.ts <-- Cấu hình SDK bên thứ ba để log lỗi (Sentry, LogRocket)
│ └── dateService.ts <-- Cấu hình định dạng ngày tháng toàn cục (date-fns hoặc dayjs)
│
├── utils/ <-- TẦNG TIỆN ÍCH THUẦN TÚY (UTILITIES LAYER - Pure Functions - Không Side-effects)
│ ├── index.ts <-- Cổng đóng gói Public API cho tầng utils
│ ├── common.util.ts <-- Hàm chung cơ bản (uuid, sleep, deepClone)
│ ├── format.util.ts <-- Định dạng hiển thị (formatCurrencyVND, truncateText, formatNumber)
│ └── validate.util.ts <-- Logic kiểm tra dữ liệu thô (isValidEmail, isStrongPassword)
│
├── workflows/ <-- TẦNG QUY TRÌNH (BUSINESS LOGIC ORCHESTRATOR - Nhạc trưởng điều phối)
│ ├── README.md <-- Viết các hàm phối hợp liên module khi phát sinh nghiệp vụ chéo phức tạp
│ └── authWorkflow.ts <-- Ví dụ: Login thành công -> Fetch Profile -> Đồng bộ Giỏ hàng/Cài đặt
│
├── main.tsx <-- Điểm khởi chạy (Bọc QueryClientProvider, RouterProvider...)
└── routeTree.gen.ts <-- File quản lý cây định tuyến tự động sinh ra bởi TanStack Router

## 1. Tầng APIs (Network Layer)

Đây là nơi chứa logic giao tiếp với Backend (API).

clients/axiosClient.ts:
Cấu hình Axios (Headers, Timeout, Interceptor xử lý lỗi).
authApi.ts:
Các hàm gọi API liên quan đến Auth (login, register, logout, refresh token).
userApi.ts:
Các hàm gọi API liên quan đến User (get profile, update profile, change password). 2. Tầng Components (UI Layer)
Thư mục này chứa các thành phần giao diện của hệ thống.

common/: Các component UI cơ bản, có thể tái sử dụng, không phụ thuộc vào logic nghiệp vụ cụ thể.
Button/: Button component có thể nhận prop để thay đổi trạng thái disabled, loading, variant...
Input/: Input component với các validation logic đơn giản.
feedback/: Các component hiển thị trạng thái (LoadingSpinner, ErrorModal, ToastMessage).
layout/: Các component cấu trúc trang (Header, Sidebar, Footer, AuthLayout, DashboardLayout). 3. Tầng Constants (Configuration Layer)
Thư mục này chứa các hằng số của toàn hệ thống.

index.ts: Cổng xuất tất cả các hằng số.
api.constant.ts: Định nghĩa các API endpoint, HTTP status codes, API version.
storage.constant.ts: Các key dùng cho LocalStorage, SessionStorage, Cookies.
queryKey.constant.ts: Các key độc lập cho TanStack Query để quản lý cache. 4. Tầng Features (Domain Layer)
Đây là trái tim của ứng dụng, nơi chứa logic nghiệp vụ.
Mỗi thư mục con trong features là một module độc lập.

auth/: Module quản lý Authentication.
components/: Các UI components của module auth (LoginForm, RegisterForm).
hooks/: Các custom hooks sử dụng TanStack Query để fetch/mutate data từ API (useAuthQueries).
store/: Các store sử dụng Zustand để quản lý local state của module (useAuthStore).
index.ts: Export các hooks và components public của module.
profile/: Module quản lý profile người dùng.
[feature-name]/: Các module nghiệp vụ mới khi phát triển (Ví dụ: product-catalog, order-management).
Cấu trúc chuẩn của mỗi feature:

components/: Các component UI riêng của tính năng.
hooks/: Các custom hooks sử dụng TanStack Query (Server State).
store/: Các store dùng Zustand để quản lý state nội bộ nếu cần (Client State).
index.ts: Export tất cả những gì bên ngoài cần truy cập. 5. Tầng Routes (Navigation Layer)
Thư mục này chứa cấu hình route của ứng dụng, được quản lý bởi TanStack Router.

\_\_root.tsx: Layout gốc, wrap toàn bộ ứng dụng (thường chứa QueryClientProvider, AuthProvider).
index.tsx: Route mặc định (landing page).
login.tsx: Route cho trang đăng nhập.
\_authenticated/: Route group yêu cầu đăng nhập.
route.tsx: File "route guard", kiểm tra trạng thái đăng nhập (sử dụng Zustand) và điều hướng nếu cần.
[feature-name].tsx: Các route cụ thể của từng feature. 6. Tầng Services (Infrastructure Layer)
Các services có side-effects, là cầu nối giữa ứng dụng và thế giới bên ngoài.

storageService.ts: Các hàm đọc/ghi LocalStorage, SessionStorage an toàn (có thể mã hóa).
loggerService.ts: Cấu hình và sử dụng các logging tools (Sentry, LogRocket).
dateService.ts: Định dạng ngày tháng toàn cục (sử dụng date-fns hoặc dayjs). 7. Tầng Utils (Utilities Layer)
Các hàm thuần túy (pure functions), không có side-effects.

index.ts: Export tất cả các utils.
common.util.ts: Các hàm tiện ích chung (uuid, sleep, deepClone).
format.util.ts: Các hàm format (formatCurrencyVND, truncateText).
validate.util.ts: Các hàm validate (isValidEmail, isStrongPassword). 8. Tầng Workflows (Orchestration Layer)
Thư mục này chứa logic điều phối các quy trình kinh doanh phức tạp, nơi phối hợp nhiều module với nhau.

README.md: Tài liệu mô tả các workflow.
authWorkflow.ts: Ví dụ: sau khi login thành công thì fetch profile, đồng bộ giỏ hàng, cài đặt... 9. Các file gốc
main.tsx: Điểm khởi chạy ứng dụng (bọc QueryClientProvider, RouterProvider).
routeTree.gen.ts: File tự động sinh bởi TanStack Router.

## Công nghệ sử dụng

1. zustant, tanstackRouter, tanstack react-query, dayjs, axios
