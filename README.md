# GymAI Manager MVP v12 — Lịch tập, Điểm danh & Trợ lý AI

Bản này kế thừa MVP v11 và nâng cấp khu Trợ lý AI.

## Trợ lý AI
- Gợi ý lịch tập tham khảo dựa trên mục tiêu, mức độ, thời gian rảnh, lịch sử tập.
- Nút lấy dữ liệu tham khảo từ hệ thống.
- Xem chi tiết / xoá kết quả từng tác vụ.
- Tóm tắt tiến độ từ ghi chú HLV.
- Sinh tin nhắn nhắc lịch / gia hạn.
- Lưu lịch sử kết quả AI trên trình duyệt.
- Xem lại hoặc xoá từng kết quả, hoặc xoá toàn bộ lịch sử.
- Luôn hiển thị cảnh báo AI chỉ mang tính tham khảo, không thay thế tư vấn y tế/thể chất chuyên môn.

## Chạy demo
Mở `index.html` bằng Chrome/Edge.

## Tài khoản demo
- admin / admin123
- reception / le tan123
- trainer / hlv123
- member / member123


## Trợ lý AI – Hỏi đáp
Bản này bổ sung khung chat hỏi đáp trực tiếp trong mục Trợ lý AI. Chat chạy ngay trên trình duyệt, không cần FastAPI hay API key; dữ liệu hỏi đáp lấy từ dữ liệu demo đang có trong hệ thống.

## Chat hỏi đáp mở rộng
Trợ lý AI chấp nhận câu hỏi tự nhiên hơn, gồm quản lý hội viên, gói tập, lịch, HLV, điểm danh, thanh toán, vận hành phòng gym và một số kiến thức tập luyện tham khảo.

## Hỏi đáp cho Hội viên
Khi đăng nhập bằng vai trò Hội viên, Trợ lý AI ưu tiên trả lời thông tin cá nhân như gói tập, hạn, lịch tập, điểm danh, thanh toán và câu hỏi tập luyện; không hiển thị dữ liệu quản trị của các hội viên khác.


## AI Chat đa năng
- Chat với AI backend qua FastAPI.
- Có thể hỏi tự nhiên về nhiều chủ đề, không giới hạn trong phòng gym.
- AI nhận ngữ cảnh hệ thống theo vai trò; Hội viên chỉ gửi dữ liệu của chính mình.
- API key chỉ nằm ở backend qua biến môi trường `OPENAI_API_KEY`, không đặt trong `app.js`.

### Cấu hình
Windows PowerShell:
```powershell
$env:OPENAI_API_KEY="YOUR_API_KEY"
$env:OPENAI_MODEL="gpt-5.6-luna"
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Sau đó mở `index.html`.

## Chatbase — Chat box AI bên thứ ba
Mục Trợ lý AI có sẵn vùng nhúng Chatbase. Sau khi tạo chatbot trên Chatbase, lấy mã Embed/iframe và đặt URL iframe vào `chatbase-config.js`:

```js
window.GYM_CHATBASE_IFRAME_URL = "URL_IFRAME_CHATBASE_CUA_BAN";
```

Không đặt API key bí mật vào file frontend. Chatbase hỗ trợ triển khai chatbot trên website bằng iframe hoặc script/widget; mã nhúng được lấy từ phần triển khai của chatbot. Xem hướng dẫn chính thức tại Chatbase.

## Chatbase + dữ liệu thật của GymAI

Bản này đã bổ sung các API để Chatbase Custom Actions lấy dữ liệu từ SQLite của GymAI:

- `GET /api/chatbase/attendance/today`
- `GET /api/chatbase/schedules/today`
- `GET /api/chatbase/members/search`
- `GET /api/chatbase/member/attendance`
- `GET /api/chatbase/health`

Chi tiết action nằm trong `chatbase-actions.json`.

### Quan trọng: Chatbase phải gọi được backend qua Internet

Chatbase chạy trên máy chủ của Chatbase nên **không thể gọi `127.0.0.1:8000` trên máy bạn**. Backend GymAI cần được triển khai tại một URL HTTPS công khai, ví dụ:

`https://api.ten-mien-cua-ban.com`

Sau đó trong Chatbase tạo **Custom Action** và đặt URL tương ứng:

`https://api.ten-mien-cua-ban.com/api/chatbase/attendance/today`

Authentication/header:

`X-GymAI-Action-Key: <cùng giá trị với GYMAI_CHATBASE_ACTION_KEY>`

Không đặt action key vào JavaScript frontend.

### Instructions cho Chatbase

Khi người dùng hỏi dữ liệu thời gian thực của GymAI, phải gọi Custom Action tương ứng thay vì suy đoán từ knowledge base. Ví dụ:

- “Xem lịch điểm danh hôm nay” → `Xem điểm danh hôm nay`
- “Hôm nay tôi có lịch tập gì?” → `Xem lịch tập hôm nay` với `member_name` của hội viên đã xác thực
- “Tìm hội viên Nguyễn Minh Anh” → `Tìm hội viên`
- “Lịch sử điểm danh của Nguyễn Minh Anh” → `Lịch sử điểm danh hội viên`

Nếu Action trả về 0 bản ghi, nói rõ không có dữ liệu; không tự tạo dữ liệu.
