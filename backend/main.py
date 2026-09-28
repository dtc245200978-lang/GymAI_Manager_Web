from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pathlib import Path
import sqlite3
from datetime import datetime, timedelta, timezone, date
import hashlib
import hmac
import base64
import json
import os

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'gym.db'
JWT_SECRET = os.getenv('GYMAI_JWT_SECRET', 'change-me-in-production')
CHATBASE_ACTION_KEY = os.getenv('GYMAI_CHATBASE_ACTION_KEY', 'gym-ai-demo-action-key-change-me')

app = FastAPI(title='GymAI Manager API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

class LoginRequest(BaseModel):
    username: str
    password: str

class AIChatMessage(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: list[AIChatMessage] = []
    role: str = 'member'
    user_name: str = ''
    context: dict = {}

class Package(BaseModel):
    id: str
    name: str
    duration: str
    price: float = Field(ge=0)
    description: str = ''


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db()
    conn.executescript('''
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('manager','reception','trainer','member'))
    );
    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      description TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_name TEXT NOT NULL,
      session TEXT NOT NULL,
      date TEXT NOT NULL,
      trainer TEXT DEFAULT '',
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      plan TEXT DEFAULT '',
      expiry TEXT DEFAULT '',
      status TEXT DEFAULT 'Đang hoạt động',
      email TEXT DEFAULT '',
      note TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      title TEXT NOT NULL,
      trainer TEXT DEFAULT '',
      type TEXT DEFAULT 'Nhóm',
      room TEXT DEFAULT '',
      capacity INTEGER DEFAULT 10,
      booked INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Đã xác nhận',
      member TEXT DEFAULT 'All'
    );
    ''')
    seed = [
        ('admin', 'admin123', 'manager'),
        ('reception', 'le tan123', 'reception'),
        ('trainer', 'hlv123', 'trainer'),
        ('member', 'member123', 'member'),
    ]
    for username, password, role in seed:
        conn.execute('INSERT OR IGNORE INTO users VALUES (?,?,?)', (username, hash_password(password), role))
    if conn.execute('SELECT COUNT(*) FROM packages').fetchone()[0] == 0:
        conn.executemany('INSERT INTO packages VALUES (?,?,?,?,?)', [
            ('GYM01','Gym Basic','1 tháng',300000,'Tự tập cơ bản'),
            ('GYM03','Gym Standard','3 tháng',750000,'Tự tập + khu cardio'),
            ('PT01','PT Premium','12 buổi',1800000,'Huấn luyện cá nhân'),
            ('CLUB01','Club Pro','12 tháng',2800000,'Toàn quyền + ưu đãi'),
        ])
    if conn.execute('SELECT COUNT(*) FROM members').fetchone()[0] == 0:
        conn.executemany('INSERT INTO members VALUES (?,?,?,?,?,?,?,?)', [
            ('HV001','Nguyễn Minh Anh','0900000001','Premium 6 tháng','2027-03-14','Đang hoạt động','minhanh@example.com','Cải thiện thể lực'),
            ('HV002','Trần Quốc Huy','0900000002','Standard 3 tháng','2026-12-12','Đang hoạt động','quochuy@example.com',''),
            ('HV003','Lê Ngọc Mai','0900000003','Premium 12 tháng','2027-09-13','Đang hoạt động','ngocmai@example.com','Yoga'),
            ('HV004','Phạm Đức Long','0900000004','Basic 1 tháng','2026-10-05','Đang hoạt động','duclong@example.com',''),
        ])
    if conn.execute('SELECT COUNT(*) FROM schedules').fetchone()[0] == 0:
        today = date.today().isoformat()
        conn.executemany('INSERT INTO schedules VALUES (?,?,?,?,?,?,?,?,?,?,?)', [
            ('LT001',today,'07:00','Cardio & Core','HLV Quang','Nhóm','Studio 1',20,12,'Đã xác nhận','All'),
            ('LT002',today,'09:00','Strength Beginner','HLV Lan','Nhóm','Khu A',15,8,'Đã xác nhận','All'),
            ('LT003',today,'17:30','PT cá nhân — Minh Anh','HLV Quang','Cá nhân','Khu B',1,1,'Đã xác nhận','Nguyễn Minh Anh'),
            ('LT004',today,'19:00','Yoga Mobility','HLV Mai','Nhóm','Studio 2',18,14,'Đã xác nhận','All'),
        ])
    if conn.execute('SELECT COUNT(*) FROM attendance WHERE date=?', (date.today().isoformat(),)).fetchone()[0] == 0:
        today = date.today().isoformat()
        conn.executemany('INSERT INTO attendance(member_name,session,date,trainer,status) VALUES (?,?,?,?,?)', [
            ('Nguyễn Minh Anh','PT cá nhân',today,'HLV Quang','Có mặt'),
            ('Trần Quốc Huy','Strength Beginner',today,'HLV Lan','Có mặt'),
            ('Lê Ngọc Mai','Yoga Mobility',today,'HLV Mai','Có mặt'),
        ])
    conn.commit(); conn.close()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def make_token(username: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {'sub': username, 'role': role, 'exp': int((now + timedelta(hours=8)).timestamp())}
    raw = json.dumps(payload, separators=(',', ':'), ensure_ascii=False).encode()
    body = base64.urlsafe_b64encode(raw).decode().rstrip('=')
    sig = hmac.new(JWT_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f'{body}.{sig}'


WEB_DIR = BASE_DIR.parent / 'web'

@app.on_event('startup')
def startup():
    init_db()

@app.get('/api/health')
def health():
    return {'status':'ok','service':'GymAI Manager API','ai_configured':bool(os.getenv('OPENAI_API_KEY'))}


def build_ai_instructions(req: AIChatRequest) -> str:
    role = req.role or 'member'
    scope = 'hội viên' if role == 'member' else 'nhân sự quản lý phòng gym'
    context_json = json.dumps(req.context or {}, ensure_ascii=False, separators=(',', ':'))
    return f"""Bạn là Trợ lý AI đa năng của hệ thống GymAI Manager.

Bạn có thể trả lời câu hỏi tự nhiên trên nhiều chủ đề, không giới hạn trong nghiệp vụ phòng gym. Hãy trả lời bằng tiếng Việt nếu người dùng hỏi bằng tiếng Việt; nếu họ dùng ngôn ngữ khác, có thể trả lời bằng ngôn ngữ đó. Giải thích rõ ràng, thực tế, có cấu trúc; nếu câu hỏi chưa đủ dữ kiện thì nói rõ giả định hoặc hỏi lại ngắn gọn. Không bịa dữ liệu hệ thống.

Ngữ cảnh người dùng hiện tại: vai trò={role}, tên={req.user_name or 'chưa xác định'}. Người dùng thuộc phạm vi {scope}.
Dữ liệu hệ thống được phép sử dụng cho câu hỏi hiện tại (chỉ coi đây là dữ liệu demo):
{context_json}

Quy tắc dữ liệu: nếu vai trò là member, chỉ được tiết lộ dữ liệu cá nhân của chính hội viên và thông tin công khai/chung; không tiết lộ dữ liệu riêng của hội viên khác, doanh thu nội bộ, tài khoản, mật khẩu hoặc thông tin quản trị không dành cho hội viên. Nếu vai trò khác member, có thể phân tích dữ liệu quản lý được cung cấp trong context.

Đối với câu hỏi sức khỏe/thể chất: cung cấp thông tin giáo dục ở mức an toàn, không chẩn đoán hoặc thay thế bác sĩ/HLV. Nếu có dấu hiệu khẩn cấp hoặc triệu chứng nghiêm trọng, khuyên người dùng tìm người lớn đáng tin cậy/chuyên gia phù hợp.

Không được nói rằng bạn chỉ trả lời được các câu hỏi về gym. Nếu câu hỏi ngoài phạm vi gym, hãy trả lời như một trợ lý AI tổng quát. Nếu cần dữ liệu thời gian thực mà context không có, nói rõ dữ liệu hiện tại chưa được kết nối thay vì bịa.
"""

@app.post('/api/ai/chat')
def ai_chat(req: AIChatRequest):
    message = (req.message or '').strip()
    if not message:
        return {'ok': False, 'message': 'Vui lòng nhập câu hỏi.'}
    api_key = os.getenv('OPENAI_API_KEY', '').strip()
    if not api_key or OpenAI is None:
        return {'ok': False, 'configured': False, 'message': 'Chưa cấu hình OPENAI_API_KEY hoặc chưa cài thư viện OpenAI.'}
    try:
        client = OpenAI(api_key=api_key)
        history = []
        for item in (req.history or [])[-12:]:
            if item.role in ('user', 'assistant') and item.content:
                history.append({'role': item.role, 'content': item.content[:6000]})
        history.append({'role': 'user', 'content': message[:12000]})
        kwargs = {
            'model': os.getenv('OPENAI_MODEL', 'gpt-5.6-luna'),
            'instructions': build_ai_instructions(req),
            'input': history,
            'store': False,
        }
        if os.getenv('AI_WEB_SEARCH', 'false').lower() == 'true':
            kwargs['tools'] = [{'type': 'web_search'}]
        response = client.responses.create(**kwargs)
        answer = (getattr(response, 'output_text', '') or '').strip()
        if not answer:
            return {'ok': False, 'message': 'AI không trả về nội dung.'}
        return {'ok': True, 'answer': answer, 'model': os.getenv('OPENAI_MODEL', 'gpt-5.6-luna')}
    except Exception as exc:
        return {'ok': False, 'message': f'Không gọi được AI: {str(exc)[:500]}'}

@app.post('/api/auth/login')
def login(req: LoginRequest):
    conn = db(); user = conn.execute('SELECT * FROM users WHERE username=?', (req.username,)).fetchone(); conn.close()
    if not user or not hmac.compare_digest(user['password_hash'], hash_password(req.password)):
        return {'ok': False, 'message': 'Tài khoản hoặc mật khẩu không đúng.'}
    return {'ok': True, 'access_token': make_token(user['username'], user['role']), 'role': user['role'], 'username': user['username']}


def require_chatbase_key(x_gymai_action_key: str | None):
    if not x_gymai_action_key or not hmac.compare_digest(x_gymai_action_key, CHATBASE_ACTION_KEY):
        raise HTTPException(status_code=401, detail='Chatbase action key không hợp lệ.')

@app.get('/api/chatbase/health')
def chatbase_health(x_gymai_action_key: str | None = Header(default=None)):
    require_chatbase_key(x_gymai_action_key)
    return {'ok': True, 'service': 'GymAI Chatbase API', 'date': date.today().isoformat()}

@app.get('/api/chatbase/attendance/today')
def chatbase_attendance_today(
    member_name: str = Query(default=''),
    x_gymai_action_key: str | None = Header(default=None),
):
    require_chatbase_key(x_gymai_action_key)
    conn = db()
    today = date.today().isoformat()
    sql = 'SELECT id, member_name, session, date, trainer, status FROM attendance WHERE date=?'
    params = [today]
    if member_name.strip():
        sql += ' AND member_name LIKE ?'
        params.append(f'%{member_name.strip()}%')
    sql += ' ORDER BY id DESC'
    rows = [dict(r) for r in conn.execute(sql, params)]
    conn.close()
    return {
        'ok': True,
        'date': today,
        'count': len(rows),
        'attendance': rows,
        'message': f'Hôm nay có {len(rows)} lượt điểm danh.' if not member_name.strip() else (
            f'{member_name.strip()} có {len(rows)} lượt điểm danh hôm nay.' if rows else
            f'Không tìm thấy lượt điểm danh hôm nay của {member_name.strip()}.'
        )
    }

@app.get('/api/chatbase/schedules/today')
def chatbase_schedules_today(
    member_name: str = Query(default=''),
    x_gymai_action_key: str | None = Header(default=None),
):
    require_chatbase_key(x_gymai_action_key)
    conn = db()
    today = date.today().isoformat()
    sql = "SELECT * FROM schedules WHERE date=? AND status!='Đã huỷ'"
    params = [today]
    if member_name.strip():
        sql += " AND (member='All' OR member LIKE ?)"
        params.append(f'%{member_name.strip()}%')
    sql += ' ORDER BY time'
    rows = [dict(r) for r in conn.execute(sql, params)]
    conn.close()
    return {'ok': True, 'date': today, 'count': len(rows), 'schedules': rows}

@app.get('/api/chatbase/members/search')
def chatbase_members_search(
    name: str = Query(default=''),
    x_gymai_action_key: str | None = Header(default=None),
):
    require_chatbase_key(x_gymai_action_key)
    conn = db()
    if name.strip():
        rows = [dict(r) for r in conn.execute('SELECT id,name,phone,plan,expiry,status,email,note FROM members WHERE name LIKE ? ORDER BY name', (f'%{name.strip()}%',))]
    else:
        rows = [dict(r) for r in conn.execute('SELECT id,name,phone,plan,expiry,status,email,note FROM members ORDER BY name')]
    conn.close()
    return {'ok': True, 'count': len(rows), 'members': rows}

@app.get('/api/chatbase/member/attendance')
def chatbase_member_attendance(
    member_name: str,
    limit: int = Query(default=20, ge=1, le=100),
    x_gymai_action_key: str | None = Header(default=None),
):
    require_chatbase_key(x_gymai_action_key)
    conn = db()
    rows = [dict(r) for r in conn.execute('SELECT id,member_name,session,date,trainer,status FROM attendance WHERE member_name LIKE ? ORDER BY date DESC,id DESC LIMIT ?', (f'%{member_name.strip()}%', limit))]
    conn.close()
    return {'ok': True, 'member_name': member_name, 'count': len(rows), 'attendance': rows}

@app.get('/api/packages')
def list_packages():
    conn = db(); rows = [dict(r) for r in conn.execute('SELECT * FROM packages ORDER BY id')]; conn.close(); return rows

@app.post('/api/packages')
def create_package(item: Package):
    conn = db(); conn.execute('INSERT INTO packages VALUES (?,?,?,?,?)', (item.id,item.name,item.duration,item.price,item.description)); conn.commit(); conn.close(); return {'ok':True,'item':item}

@app.put('/api/packages/{package_id}')
def update_package(package_id: str, item: Package):
    conn = db(); cur = conn.execute('UPDATE packages SET name=?,duration=?,price=?,description=? WHERE id=?', (item.name,item.duration,item.price,item.description,package_id)); conn.commit(); conn.close()
    return {'ok': cur.rowcount > 0}

@app.delete('/api/packages/{package_id}')
def delete_package(package_id: str):
    conn = db(); cur = conn.execute('DELETE FROM packages WHERE id=?', (package_id,)); conn.commit(); conn.close(); return {'ok':cur.rowcount > 0}


# Serve the GymAI web interface from the same domain as the API.
# API routes above take precedence over this catch-all static mount.
if WEB_DIR.exists():
    app.mount('/', StaticFiles(directory=WEB_DIR, html=True), name='web')
