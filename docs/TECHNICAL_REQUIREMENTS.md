# Yêu cầu kỹ thuật – GymAI Manager

## Kiến trúc được chốt cho đồ án
- Frontend: HTML/CSS/JavaScript (MVP hiện tại).
- Backend: FastAPI (Python).
- CSDL: SQLite cho bản đồ án/MVP; có thể chuyển PostgreSQL khi triển khai thật.
- AI Engine: thiết kế điểm tích hợp cho OpenAI/Gemini/Claude/Hugging Face/Ollama.
- Xác thực: JWT ở backend; mật khẩu phải hash, không lưu plaintext trong production.

## Cảnh báo AI
Mọi màn hình/kết quả AI phải hiển thị:
> Nội dung AI chỉ mang tính tham khảo, không thay thế tư vấn y tế hoặc tư vấn thể chất chuyên môn. Khi có vấn đề sức khỏe, hãy trao đổi với chuyên gia/huấn luyện viên.

## Kiểm thử bắt buộc
- Gói tập: thêm/sửa/xóa, giá hợp lệ, thời hạn hợp lệ.
- Lịch tập: kiểm tra trùng lịch, sức chứa, đăng ký/hủy.
- Điểm danh: không điểm danh trùng cùng buổi; hội viên hết hạn không được điểm danh.
- AI: dữ liệu thiếu, mục tiêu mơ hồ, kết quả luôn có cảnh báo.

## Chạy backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# Linux/macOS
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API kiểm tra: `GET /api/health`

## Ghi chú bảo mật
MVP frontend vẫn có cơ chế localStorage để demo. Bản production phải xác thực và phân quyền phía server, dùng HTTPS, JWT/session, hash mật khẩu và CSDL thật.
