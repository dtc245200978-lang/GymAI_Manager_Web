# GymAI Manager — Web Deployment

Bản này đã được chuẩn bị để deploy thành website có URL công khai.

## Cách nhanh nhất: Render

1. Tạo repository GitHub và upload toàn bộ thư mục dự án này.
2. Vào Render và chọn **New + → Web Service**.
3. Kết nối repository.
4. Render có thể đọc `render.yaml`; nếu nhập thủ công:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `OPENAI_API_KEY` = API key của bạn
   - `OPENAI_MODEL` = `gpt-5.6-luna`
   - `AI_WEB_SEARCH` = `true`
6. Deploy.
7. Render sẽ cấp URL dạng `https://ten-app.onrender.com`.

## Lưu ý

- Không đưa `OPENAI_API_KEY` vào GitHub.
- SQLite trong bản MVP phù hợp demo; khi chạy production lâu dài nên chuyển DB sang PostgreSQL.
- Frontend và API dùng cùng domain nên không còn `127.0.0.1:8000` trong trình duyệt.
- `/api/health` kiểm tra backend.
