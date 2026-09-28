const users=[
 {username:'admin',password:'admin123',name:'Nguyễn Quản Lý',role:'manager',label:'Quản lý'},
 {username:'reception',password:'le tan123',name:'Lê Thanh Hà',role:'reception',label:'Lễ tân'},
 {username:'trainer',password:'hlv123',name:'Trần Minh Quang',role:'trainer',label:'Huấn luyện viên'},
 {username:'member',password:'member123',name:'Nguyễn Minh Anh',role:'member',label:'Hội viên'}
];
const rolePermissions={
 manager:['dashboard','members','plans','schedule','attendance','payments','ai'],
 reception:['dashboard','members','plans','schedule','attendance','payments','ai'],
 trainer:['dashboard','members','schedule','attendance','ai'],
 member:['dashboard','schedule','attendance','payments','ai']
};

const state={
 currentUser:null,
 members:[
  {id:'HV001',name:'Nguyễn Minh Anh',phone:'0901234567',plan:'Premium 6 tháng',expiry:'2026-12-12',status:'Đang hoạt động'},
  {id:'HV002',name:'Trần Quốc Huy',phone:'0912345678',plan:'Standard 3 tháng',expiry:'2026-09-28',status:'Sắp hết hạn'},
  {id:'HV003',name:'Lê Ngọc Mai',phone:'0987654321',plan:'Premium 12 tháng',expiry:'2027-02-10',status:'Đang hoạt động'},
  {id:'HV004',name:'Phạm Đức Long',phone:'0971112233',plan:'Basic 1 tháng',expiry:'2026-09-16',status:'Sắp hết hạn'}
 ],
 plans:[
  {id:'GOI01',name:'Basic 1 tháng',duration:'1 tháng',price:350000,desc:'Khu tập cơ bản'},
  {id:'GOI02',name:'Standard 3 tháng',duration:'3 tháng',price:900000,desc:'Khu tập + lớp nhóm'},
  {id:'GOI03',name:'Premium 6 tháng',duration:'6 tháng',price:1600000,desc:'Tất cả tiện ích + ưu tiên lịch'},
  {id:'GOI04',name:'Premium 12 tháng',duration:'12 tháng',price:2800000,desc:'Tất cả tiện ích + ưu đãi dài hạn'}
 ],
 schedule:[
  {id:'LT001',date:'2026-09-15',time:'07:00',title:'Cardio & Core',trainer:'HLV Quang',type:'Nhóm',room:'Studio 1',capacity:20,booked:12,status:'Đã xác nhận',member:'All'},
  {id:'LT002',date:'2026-09-15',time:'09:00',title:'Strength Beginner',trainer:'HLV Lan',type:'Nhóm',room:'Khu A',capacity:15,booked:8,status:'Đã xác nhận',member:'All'},
  {id:'LT003',date:'2026-09-15',time:'17:30',title:'PT cá nhân — Minh Anh',trainer:'HLV Quang',type:'Cá nhân',room:'Khu B',capacity:1,booked:1,status:'Đã xác nhận',member:'Nguyễn Minh Anh'},
  {id:'LT004',date:'2026-09-15',time:'19:00',title:'Yoga Mobility',trainer:'HLV Mai',type:'Nhóm',room:'Studio 2',capacity:18,booked:14,status:'Đã xác nhận',member:'All'}
 ],
 attendance:[
  {id:'DD001',date:'14/09/2026',member:'Nguyễn Minh Anh',session:'PT cá nhân',trainer:'HLV Quang',status:'Có mặt',note:''},
  {id:'DD002',date:'14/09/2026',member:'Trần Quốc Huy',session:'Strength Beginner',trainer:'HLV Lan',status:'Có mặt',note:''},
  {id:'DD003',date:'13/09/2026',member:'Lê Ngọc Mai',session:'Yoga Mobility',trainer:'HLV Mai',status:'Có mặt',note:''},
  {id:'DD004',date:'12/09/2026',member:'Phạm Đức Long',session:'Cardio & Core',trainer:'HLV Quang',status:'Vắng',note:'Nghỉ do bận việc cá nhân'}
 ],
 payments:[
  {code:'HD26091401',member:'Nguyễn Minh Anh',type:'Gia hạn',amount:1600000,date:'14/09/2026',method:'Chuyển khoản',status:'Đã thanh toán',note:'Gia hạn gói Premium 6 tháng'},
  {code:'HD26091303',member:'Lê Ngọc Mai',type:'Gia hạn',amount:2800000,date:'13/09/2026',method:'MoMo',status:'Đã thanh toán',note:'Gia hạn gói Premium 12 tháng'},
  {code:'HD26091204',member:'Trần Quốc Huy',type:'Đăng ký mới',amount:900000,date:'12/09/2026',method:'Tiền mặt',status:'Đã thanh toán',note:'Đăng ký gói Standard 3 tháng'}
 ]
};

const titles={dashboard:'Tổng quan',members:'Hội viên',plans:'Gói tập',schedule:'Lịch tập',attendance:'Điểm danh',payments:'Thanh toán',ai:'Trợ lý AI'};
function money(n){return n.toLocaleString('vi-VN')+' ₫'}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function statusBadge(s){let c=s.includes('hết')||s==='Vắng'?'yellow':'green';return `<span class="badge ${c}">${s}</span>`}
function hasPermission(view){return !!state.currentUser && rolePermissions[state.currentUser.role].includes(view)}
function roleLabel(){return state.currentUser?.label||''}
function persistSession(){localStorage.setItem('gymai_session',JSON.stringify({username:state.currentUser.username}))}
function restoreSession(){try{const saved=JSON.parse(localStorage.getItem('gymai_session')||'null');if(saved?.username){const u=users.find(x=>x.username===saved.username);if(u)state.currentUser=u}}catch(_){localStorage.removeItem('gymai_session')}}
function logout(){
  if(!state.currentUser){renderLogin();return}
  const root=document.getElementById('modalRoot');
  if(!root){
    const ok=window.confirm('Bạn có chắc chắn muốn đăng xuất không?');
    if(ok){localStorage.removeItem('gymai_session');state.currentUser=null;renderLogin();}
    return;
  }
  root.innerHTML=modalBase('Xác nhận đăng xuất',`<p class=\"modal-text\">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>${state.currentUser.name}</strong> (${roleLabel()})?</p>`,`<button class=\"btn secondary\" id=\"cancelLogout\">Ở lại</button><button class=\"btn danger\" id=\"confirmLogout\">Đăng xuất</button>`);
  document.getElementById('cancelLogout')?.addEventListener('click',closeModal);
  document.getElementById('confirmLogout')?.addEventListener('click',()=>{
    localStorage.removeItem('gymai_session');
    state.currentUser=null;
    closeModal();
    renderLogin();
  });
}
function getLoginHistory(){try{return JSON.parse(localStorage.getItem('gymai_login_history')||'[]')}catch(_){return []}}
function saveLoginHistory(entry){const history=getLoginHistory();history.unshift({...entry,id:Date.now()+Math.random()});localStorage.setItem('gymai_login_history',JSON.stringify(history.slice(0,12)))}
function getSavedLogins(){
  try{return JSON.parse(localStorage.getItem('gymai_saved_logins')||'[]')}catch(_){return []}
}
function saveCredential(username,password){
  const saved=getSavedLogins().filter(x=>x.username!==username);
  const u=users.find(x=>x.username===username);
  saved.unshift({username,password,name:u?.name||username,label:u?.label||''});
  localStorage.setItem('gymai_saved_logins',JSON.stringify(saved.slice(0,6)));
}
function renderSavedLoginDropdown(){
  const box=document.getElementById('savedLoginDropdown');
  if(!box)return;
  const saved=getSavedLogins();
  box.innerHTML=saved.length?saved.map(x=>`<button type="button" class="saved-login-item" data-fill-login="${x.username}"><span class="saved-login-avatar">${(x.name||x.username).charAt(0)}</span><span class="saved-login-info"><strong>${x.username}</strong><small>${x.label||x.name}</small></span><span class="saved-login-pass">${x.password}</span></button>`).join(''):`<div class="saved-login-empty">Chưa có tài khoản nào từng đăng nhập trên trình duyệt này.</div>`;
  box.classList.add('show');
  box.querySelectorAll('[data-fill-login]').forEach(btn=>btn.addEventListener('click',()=>{
    const savedItem=saved.find(x=>x.username===btn.dataset.fillLogin);
    if(!savedItem)return;
    document.getElementById('loginUsername').value=savedItem.username;
    document.getElementById('loginPassword').value=savedItem.password;
    box.classList.remove('show');
    document.getElementById('loginPassword').focus();
  }));
}
function hideSavedLoginDropdown(){document.getElementById('savedLoginDropdown')?.classList.remove('show')}
function renderLogin(message=''){
 document.body.classList.add('login-mode');
 document.body.innerHTML=`<div class="login-shell"><div class="login-card"><div class="login-brand"><div class="brand-mark">G</div><div><strong>GymAI Manager</strong><span>Quản lý trung tâm thể hình</span></div></div><div class="login-copy"><div class="eyebrow">ĐĂNG NHẬP HỆ THỐNG</div><h1>Chào mừng trở lại</h1><p>Đăng nhập để sử dụng đúng chức năng theo vai trò được cấp.</p></div><form id="loginForm" autocomplete="off"><div class="field login-field-wrap"><label>Tài khoản</label><input id="loginUsername" required autocomplete="off" placeholder="admin"/><div id="savedLoginDropdown" class="saved-login-dropdown"></div></div><div class="field login-field-wrap"><label>Mật khẩu</label><input id="loginPassword" type="password" required autocomplete="new-password" placeholder="••••••••"/><div class="saved-login-hint">Bấm vào ô tài khoản hoặc mật khẩu để chọn tài khoản đã từng đăng nhập.</div></div>${message?`<div class="login-error">${message}</div>`:''}<button class="btn primary login-btn" type="submit">Đăng nhập</button></form><div class="demo-accounts"><strong>Tài khoản demo</strong><div>Quản lý: <code>admin / admin123</code></div><div>Lễ tân: <code>reception / le tan123</code></div><div>Huấn luyện viên: <code>trainer / hlv123</code></div><div>Hội viên: <code>member / member123</code></div></div><div class="login-note">Tài khoản bạn đăng nhập thành công sẽ được lưu trên trình duyệt này để lần sau chọn nhanh từ ô tài khoản. Đây chỉ là cơ chế demo local.</div></div></div>`;
 const usernameInput=document.getElementById('loginUsername');
 const passwordInput=document.getElementById('loginPassword');
 usernameInput.addEventListener('focus',renderSavedLoginDropdown);
 usernameInput.addEventListener('click',renderSavedLoginDropdown);
 passwordInput.addEventListener('focus',renderSavedLoginDropdown);
 passwordInput.addEventListener('click',renderSavedLoginDropdown);
 document.addEventListener('click',function outsideSavedLogin(e){
   const card=document.querySelector('.login-card');
   if(!card||!card.contains(e.target))return;
   if(!e.target.closest('.login-field-wrap'))hideSavedLoginDropdown();
 });
 const form=document.getElementById('loginForm');
 form.addEventListener('submit',e=>{e.preventDefault();const username=usernameInput.value.trim();const password=passwordInput.value;const u=users.find(x=>x.username===username&&x.password===password);if(!u){saveLoginHistory({username,name:username,role:'Đăng nhập thất bại',success:false,method:'Nhập tài khoản',time:new Date().toISOString()});renderLogin('Tài khoản hoặc mật khẩu không đúng.');return}saveCredential(u.username,u.password);state.currentUser=u;persistSession();saveLoginHistory({username:u.username,name:u.name,role:u.label,success:true,method:'Nhập tài khoản',time:new Date().toISOString()});document.body.classList.remove('login-mode');mountApp();render('dashboard');toast(`Xin chào ${u.name}`)});
}
function mountApp(){
 document.body.classList.remove('login-mode');
 document.body.innerHTML=`<div class="app"><aside class="sidebar"><div class="brand"><div class="brand-mark">G</div><div><strong>GymAI</strong><span>Manager</span></div></div><nav id="mainNav"></nav><div class="sidebar-foot">MVP Demo • 2026</div></aside><main class="main"><header class="topbar"><div><div class="eyebrow">HỆ THỐNG QUẢN LÝ TRUNG TÂM THỂ HÌNH</div><h1 id="pageTitle">Tổng quan</h1></div><div class="top-actions"><span class="status-dot"></span><span id="systemUser">${state.currentUser.name} • ${roleLabel()}</span><button class="profile" id="profileBtn" title="Đăng xuất">⇥</button></div></header><section id="content"></section></main></div><div id="toast" class="toast"></div><div id="modalRoot"></div>`;
 const navItems=[['dashboard','⌂','Tổng quan'],['members','👥','Hội viên'],['plans','▣','Gói tập'],['schedule','◷','Lịch tập'],['attendance','✓','Điểm danh'],['payments','₫','Thanh toán'],['ai','✦','Trợ lý AI']];
 document.getElementById('mainNav').innerHTML=navItems.filter(([v])=>hasPermission(v)).map(([v,icon,label])=>`<button class="nav-item" data-view="${v}">${icon} <span>${label}</span></button>`).join('');
 document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>render(b.dataset.view)));
 document.getElementById('profileBtn').addEventListener('click',logout);
}
function render(view='dashboard'){
 if(!state.currentUser){renderLogin();return}
 if(!hasPermission(view)){toast('Bạn không có quyền truy cập chức năng này.');view='dashboard'}
 document.getElementById('pageTitle').textContent=titles[view];
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 document.getElementById('content').innerHTML=views[view]();
 bind(view);
}


function scheduleCard(s){const canEdit=['manager','reception'].includes(state.currentUser.role);const cap=s.capacity||10,booked=s.booked||0;return `<div class="card schedule-item" data-schedule-card data-type="${s.type}"><div><div class="eyebrow">${s.date||'14/09/2026'} • ${s.time}</div><h3 style="margin:6px 0">${s.title}</h3><div class="small">${s.trainer} • ${s.room}</div><div class="small">${s.type} • ${booked}/${cap} người${s.member&&s.member!=='All'?` • ${s.member}`:''}</div></div><div style="text-align:right"><span class="badge ${s.status==='Đã huỷ'?'yellow':'green'}">${s.status||'Đã xác nhận'}</span><div class="row-actions" style="margin-top:12px"><button class="btn btn-sm" data-action="viewSchedule" data-id="${s.id}">Xem</button>${canEdit?`<button class="btn btn-sm" data-action="editSchedule" data-id="${s.id}">Sửa</button><button class="btn btn-sm danger" data-action="deleteSchedule" data-id="${s.id}">Xoá</button>`:''}</div></div></div>`}
function attendanceRow(a){const canEdit=['manager','reception'].includes(state.currentUser.role);return `<tr><td>${a.date}</td><td>${a.member}</td><td>${a.session}</td><td>${a.trainer}</td><td>${statusBadge(a.status)}</td><td><div class="table-actions"><button class="btn small" data-action="viewAttendance" data-id="${a.id}">Xem</button>${canEdit?`<button class="btn small" data-action="editAttendance" data-id="${a.id}">Sửa</button><button class="btn small danger-outline" data-action="deleteAttendance" data-id="${a.id}">Xoá</button>`:''}</div></td></tr>`}
function getSchedule(id){return state.schedule.find(s=>s.id===id)}
function nextScheduleId(){let max=state.schedule.reduce((n,s)=>Math.max(n,parseInt(String(s.id||'LT0').replace(/\D/g,''))||0),0);return 'LT'+String(max+1).padStart(3,'0')}
function getAttendance(id){return state.attendance.find(a=>a.id===id)}
function nextAttendanceId(){let max=state.attendance.reduce((n,a)=>Math.max(n,parseInt(String(a.id||'DD0').replace(/\D/g,''))||0),0);return 'DD'+String(max+1).padStart(3,'0')}
function openScheduleModal(mode,id=''){const s=id?getSchedule(id):null;if(mode!=='add'&&!s)return;const readOnly=mode==='view';const title=mode==='add'?'Thêm lịch tập':mode==='edit'?`Chỉnh sửa lịch — ${s.title}`:`Chi tiết lịch — ${s.title}`;const body=`<div class="member-detail-grid"><div class="field"><label>Mã lịch</label><input id="sId" value="${s?.id||nextScheduleId()}" ${mode!=='add'?'readonly':''}></div><div class="field"><label>Ngày</label><input id="sDate" type="date" value="${s?.date||'2026-09-15'}" ${readOnly?'readonly':''}></div><div class="field"><label>Giờ bắt đầu</label><input id="sTime" type="time" value="${s?.time||'18:00'}" ${readOnly?'readonly':''}></div><div class="field"><label>Tên buổi tập</label><input id="sTitle" value="${s?.title||''}" ${readOnly?'readonly':''} placeholder="Strength Beginner"></div><div class="field"><label>Huấn luyện viên</label><input id="sTrainer" value="${s?.trainer||''}" ${readOnly?'readonly':''} placeholder="HLV Quang"></div><div class="field"><label>Loại lịch</label><select id="sType" ${readOnly?'disabled':''}><option ${s?.type==='Nhóm'?'selected':''}>Nhóm</option><option ${s?.type==='Cá nhân'?'selected':''}>Cá nhân</option></select></div><div class="field"><label>Phòng</label><input id="sRoom" value="${s?.room||''}" ${readOnly?'readonly':''} placeholder="Studio 1"></div><div class="field"><label>Sức chứa</label><input id="sCapacity" type="number" min="1" value="${s?.capacity||10}" ${readOnly?'readonly':''}></div><div class="field"><label>Đã đăng ký</label><input id="sBooked" type="number" min="0" value="${s?.booked||0}" ${readOnly?'readonly':''}></div><div class="field"><label>Trạng thái</label><select id="sStatus" ${readOnly?'disabled':''}><option ${s?.status==='Đã xác nhận'?'selected':''}>Đã xác nhận</option><option ${s?.status==='Chờ xác nhận'?'selected':''}>Chờ xác nhận</option><option ${s?.status==='Đã huỷ'?'selected':''}>Đã huỷ</option></select></div><div class="field full"><label>Hội viên đăng ký (để trống nếu là lịch chung)</label><input id="sMember" value="${s?.member==='All'?'':(s?.member||'')}" ${readOnly?'readonly':''} placeholder="Nguyễn Minh Anh"></div></div>`;const buttons=readOnly?`<button class="btn secondary" data-action="closeModal">Đóng</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn primary" data-action="editScheduleFromModal" data-id="${s.id}">Chỉnh sửa</button>`:''}`:`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn primary" data-action="saveSchedule" data-mode="${mode}" data-id="${s?.id||''}">${mode==='add'?'Thêm lịch':'Lưu thay đổi'}</button>`;const root=document.getElementById('modalRoot');if(!root){toast('Không thể mở cửa sổ thao tác.');return}root.innerHTML=modalBase(title,body,buttons,'LỊCH TẬP');bindScheduleModal()}
function bindScheduleModal(){document.querySelectorAll('#modalRoot [data-action="closeModal"]').forEach(b=>b.onclick=closeModal);document.querySelectorAll('#modalRoot [data-action="editScheduleFromModal"]').forEach(b=>b.onclick=()=>openScheduleModal('edit',b.dataset.id));const save=document.querySelector('#modalRoot [data-action="saveSchedule"]');if(save)save.onclick=()=>{const mode=save.dataset.mode,id=save.dataset.id;const payload={id:document.getElementById('sId').value.trim(),date:document.getElementById('sDate').value,time:document.getElementById('sTime').value,title:document.getElementById('sTitle').value.trim(),trainer:document.getElementById('sTrainer').value.trim(),type:document.getElementById('sType').value,room:document.getElementById('sRoom').value.trim(),capacity:Number(document.getElementById('sCapacity').value),booked:Number(document.getElementById('sBooked').value),status:document.getElementById('sStatus').value,member:document.getElementById('sMember').value.trim()||'All'};if(!payload.date||!payload.time||!payload.title||!payload.trainer||!payload.room||payload.capacity<1||payload.booked<0||payload.booked>payload.capacity)return toast('Vui lòng nhập đúng thông tin lịch tập.');if(mode==='add'){if(state.schedule.some(x=>x.id===payload.id))return toast('Mã lịch đã tồn tại.');state.schedule.unshift(payload);toast('Đã thêm lịch tập')}else{const idx=state.schedule.findIndex(x=>x.id===id);if(idx>=0){state.schedule[idx]=payload;toast('Đã cập nhật lịch tập')}}closeModal();render('schedule')}}
function openAttendanceModal(mode,id=''){const a=id?getAttendance(id):null;if(mode!=='add'&&!a)return;const readOnly=mode==='view';const title=mode==='add'?'Ghi nhận điểm danh':mode==='edit'?`Chỉnh sửa điểm danh — ${a.member}`:`Chi tiết điểm danh — ${a.member}`;const body=`<div class="member-detail-grid"><div class="field"><label>Mã điểm danh</label><input id="aId" value="${a?.id||nextAttendanceId()}" ${mode!=='add'?'readonly':''}></div><div class="field"><label>Ngày</label><input id="aDate" value="${a?.date||new Date().toLocaleDateString('vi-VN')}" ${readOnly?'readonly':''}></div><div class="field"><label>Hội viên</label><select id="aMember" ${readOnly?'disabled':''}>${state.members.map(m=>`<option ${a?.member===m.name?'selected':''}>${m.name}</option>`).join('')}</select></div><div class="field"><label>Buổi tập</label><input id="aSession" value="${a?.session||'Tập tự do'}" ${readOnly?'readonly':''}></div><div class="field"><label>Huấn luyện viên</label><input id="aTrainer" value="${a?.trainer||state.currentUser.name}" ${readOnly?'readonly':''}></div><div class="field"><label>Trạng thái</label><select id="aStatus" ${readOnly?'disabled':''}><option ${a?.status==='Có mặt'?'selected':''}>Có mặt</option><option ${a?.status==='Vắng'?'selected':''}>Vắng</option><option ${a?.status==='Trễ'?'selected':''}>Trễ</option></select></div><div class="field full"><label>Ghi chú</label><textarea id="aNote" ${readOnly?'readonly':''}>${a?.note||''}</textarea></div></div>`;const buttons=readOnly?`<button class="btn secondary" data-action="closeModal">Đóng</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn primary" data-action="editAttendanceFromModal" data-id="${a.id}">Chỉnh sửa</button>`:''}`:`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn primary" data-action="saveAttendance" data-mode="${mode}" data-id="${a?.id||''}">${mode==='add'?'Ghi nhận':'Lưu thay đổi'}</button>`;const root=document.getElementById('modalRoot');if(!root){toast('Không thể mở cửa sổ thao tác.');return}root.innerHTML=modalBase(title,body,buttons,'ĐIỂM DANH');bindAttendanceModal()}
function bindAttendanceModal(){document.querySelectorAll('#modalRoot [data-action="closeModal"]').forEach(b=>b.onclick=closeModal);document.querySelectorAll('#modalRoot [data-action="editAttendanceFromModal"]').forEach(b=>b.onclick=()=>openAttendanceModal('edit',b.dataset.id));const save=document.querySelector('#modalRoot [data-action="saveAttendance"]');if(save)save.onclick=()=>{const mode=save.dataset.mode,id=save.dataset.id;const payload={id:document.getElementById('aId').value.trim(),date:document.getElementById('aDate').value.trim(),member:document.getElementById('aMember').value,session:document.getElementById('aSession').value.trim(),trainer:document.getElementById('aTrainer').value.trim(),status:document.getElementById('aStatus').value,note:document.getElementById('aNote').value.trim()};if(!payload.date||!payload.member||!payload.session)return toast('Vui lòng nhập đầy đủ thông tin điểm danh.');if(mode==='add'){if(state.attendance.some(x=>x.id===payload.id))return toast('Mã điểm danh đã tồn tại.');state.attendance.unshift(payload);toast('Đã ghi nhận điểm danh')}else{const idx=state.attendance.findIndex(x=>x.id===id);if(idx>=0){state.attendance[idx]=payload;toast('Đã cập nhật điểm danh')}}closeModal();render('attendance')}}
const views={
 dashboard:()=>`<div class="page"><div class="role-strip"><div><strong>${state.currentUser.name}</strong><span>${roleLabel()}</span></div><div class="small">Bạn đang nhìn thấy các module được cấp quyền cho vai trò này.</div></div><div class="hero"><div class="card hero-card"><div class="eyebrow">QUẢN LÝ THÔNG MINH + AI</div><h2>Phòng gym gọn hơn, dữ liệu rõ hơn.</h2><p>Quản lý hội viên, lịch tập, điểm danh và doanh thu trên một màn hình. Trợ lý AI giúp tạo gợi ý lịch tập tham khảo và tóm tắt tiến độ.</p><button class="btn primary" data-go="ai">Mở Trợ lý AI →</button></div><div class="ai-banner"><h3>✦ AI Insight hôm nay</h3><p>2 hội viên sắp hết hạn trong 7 ngày. Tỷ lệ điểm danh tuần này đang ổn định; nên gửi nhắc gia hạn sớm cho nhóm có mức sử dụng cao.</p></div></div><div class="grid stats" style="margin-top:18px"><div class="card stat"><div class="label">Hội viên</div><div class="value">${state.members.length}</div><div class="up">↑ 8.4% tháng này</div></div><div class="card stat"><div class="label">Sắp hết hạn</div><div class="value warn">2</div><div class="small">Trong 7 ngày</div></div><div class="card stat"><div class="label">Doanh thu tháng</div><div class="value">5,30M</div><div class="up">↑ 12.8%</div></div><div class="card stat"><div class="label">Tỷ lệ điểm danh</div><div class="value">87%</div><div class="up">↑ 3.2%</div></div></div><div class="section-title"><h2>Lịch hôm nay</h2><button class="btn secondary" data-go="schedule">Xem lịch →</button></div><div class="grid split"><div class="card"><div class="list">${state.schedule.slice(0,3).map(s=>`<div class="schedule-item"><div><strong>${s.time} — ${s.title}</strong><div class="small">${s.trainer} • ${s.room}</div></div><span class="badge green">${s.type}</span></div>`).join('')}</div></div><div class="card"><div class="section-title" style="margin:0 0 12px"><h2>Cảnh báo</h2></div><div class="list"><div class="schedule-item"><div><strong>Trần Quốc Huy</strong><div class="small">Gói còn 14 ngày</div></div>${statusBadge('Sắp hết hạn')}</div><div class="schedule-item"><div><strong>Phạm Đức Long</strong><div class="small">Gói còn 2 ngày</div></div>${statusBadge('Sắp hết hạn')}</div></div></div></div></div>`,
 members:()=>`<div class="page"><div class="toolbar"><input id="memberSearch" placeholder="Tìm theo tên, mã hội viên..."/>${['manager','reception'].includes(state.currentUser.role)?'<button class="btn primary" data-action="addMember">+ Thêm hội viên</button>':''}</div><div class="card table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Hội viên</th><th>Gói tập</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="memberRows">${memberRows(state.members)}</tbody></table></div></div>`,
  plans:()=>`<div class="page"><div class="section-title"><h2>Danh sách gói tập</h2>${['manager','reception'].includes(state.currentUser.role)?'<button class="btn primary" data-action="addPlan">+ Thêm gói</button>':''}</div><div class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${state.plans.map(p=>`<div class="card"><div class="eyebrow">${p.duration.toUpperCase()}</div><h3>${p.name}</h3><div class="value" style="font-size:24px;font-weight:800">${money(p.price)}</div><p class="small">${p.desc}</p><div class="row-actions"><button class="btn btn-sm" data-action="viewPlan" data-id="${p.id}">Xem</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn btn-sm" data-action="editPlan" data-id="${p.id}">Sửa</button><button class="btn btn-sm danger" data-action="deletePlan" data-id="${p.id}">Xoá</button>`:''}</div></div>`).join('')}</div></div>`,
 schedule:()=>{const mine=state.currentUser.role==='member'?state.schedule.filter(x=>x.member===state.currentUser.name||x.member==='All'):state.schedule;return `<div class="page"><div class="grid stats"><div class="card stat"><div class="label">Buổi tập</div><div class="value">${mine.length}</div></div><div class="card stat"><div class="label">Lịch nhóm</div><div class="value">${mine.filter(x=>x.type==='Nhóm').length}</div></div><div class="card stat"><div class="label">Cá nhân</div><div class="value">${mine.filter(x=>x.type==='Cá nhân').length}</div></div><div class="card stat"><div class="label">Còn chỗ</div><div class="value up">${mine.filter(x=>(x.capacity||0)>(x.booked||0)).length}</div></div></div><div class="toolbar"><input id="scheduleSearch" placeholder="Tìm lịch, HLV, phòng..."/><select id="scheduleFilter"><option value="all">Tất cả loại lịch</option><option value="Nhóm">Nhóm</option><option value="Cá nhân">Cá nhân</option></select>${state.currentUser.role!=='member'?'<button class="btn primary" data-action="addSchedule">+ Thêm lịch</button>':'<button class="btn primary" data-action="bookMemberSchedule">+ Đăng ký lịch</button>'}</div><div class="grid" id="scheduleGrid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${mine.map(scheduleCard).join('')}</div></div>`},
 attendance:()=>{const rows=state.currentUser.role==='member'?state.attendance.filter(a=>a.member===state.currentUser.name):state.attendance;const present=rows.filter(a=>a.status==='Có mặt').length;return `<div class="page"><div class="grid stats"><div class="card stat"><div class="label">Lượt điểm danh</div><div class="value">${rows.length}</div></div><div class="card stat"><div class="label">Có mặt</div><div class="value up">${present}</div></div><div class="card stat"><div class="label">Vắng</div><div class="value warn">${rows.filter(a=>a.status==='Vắng').length}</div></div><div class="card stat"><div class="label">Tỷ lệ</div><div class="value">${rows.length?Math.round(present/rows.length*100):0}%</div></div></div><div class="toolbar"><input id="attendanceMember" placeholder="Tìm hội viên..."/>${state.currentUser.role!=='member'?'<button class="btn primary" data-action="checkin">+ Điểm danh</button>':''}</div><div class="card table-wrap"><table class="table"><thead><tr><th>Ngày</th><th>Hội viên</th><th>Buổi</th><th>HLV</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="attendanceRows">${rows.map(attendanceRow).join('')}</tbody></table></div></div>`},
 payments:()=>{const rows=state.currentUser.role==='member'?state.payments.filter(p=>p.member===state.currentUser.name):state.payments;const total=rows.reduce((s,p)=>s+p.amount,0);const paid=rows.filter(p=>p.status==='Đã thanh toán').length;const pending=rows.filter(p=>p.status!=='Đã thanh toán').length;return `<div class="page"><div class="grid stats"><div class="card stat"><div class="label">Giao dịch</div><div class="value">${rows.length}</div></div><div class="card stat"><div class="label">Tổng tiền</div><div class="value">${money(total)}</div></div><div class="card stat"><div class="label">Đã thanh toán</div><div class="value up">${rows.length?Math.round(paid/rows.length*100):0}%</div></div><div class="card stat"><div class="label">Cần xử lý</div><div class="value">${pending}</div></div></div><div class="section-title"><div><h2>Quản lý thanh toán</h2><p class="muted">Theo dõi hóa đơn, phương thức thanh toán và trạng thái giao dịch.</p></div>${['manager','reception'].includes(state.currentUser.role)?'<button class="btn primary" data-action="addPayment">+ Ghi nhận thanh toán</button>':''}</div><div class="card table-wrap"><table class="table"><thead><tr><th>Mã HĐ</th><th>Hội viên</th><th>Loại</th><th>Số tiền</th><th>Phương thức</th><th>Ngày</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${p.code}</td><td>${p.member}</td><td>${p.type}</td><td>${money(p.amount)}</td><td>${p.method||'Tiền mặt'}</td><td>${p.date}</td><td>${statusBadge(p.status)}</td><td><div class="table-actions"><button class="btn small" data-action="viewPayment" data-id="${p.code}">Xem</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn small" data-action="editPayment" data-id="${p.code}">Sửa</button><button class="btn small danger-outline" data-action="deletePayment" data-id="${p.code}">Xoá</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></div>`},
 ai:()=>{
  const history=getAIHistory();
  return `<div class="page">
    <div class="ai-banner"><h3>✦ Trợ lý AI phòng gym</h3><p>AI hỗ trợ tham khảo: gợi ý lịch tập, tóm tắt tiến độ và sinh tin nhắn. Không chẩn đoán, không thay thế tư vấn y tế/thể chất chuyên môn.</p></div>
    <div class="grid stats">
      <div class="card stat"><div class="label">Tác vụ AI</div><div class="value">3</div></div>
      <div class="card stat"><div class="label">Kết quả đã lưu</div><div class="value">${history.length}</div></div>
      <div class="card stat"><div class="label">Dữ liệu đầu vào</div><div class="value">4 nguồn</div></div>
      <div class="card stat"><div class="label">Trạng thái</div><div class="value up">Sẵn sàng</div></div>
    </div>

    <div class="section-title">
      <div><h2>Chat với Trợ lý AI</h2><p class="muted">Chatbase — chatbot AI bên thứ ba được nhúng trực tiếp vào GymAI Manager.</p></div>
      <button class="btn secondary" data-action="openChatbaseSetup">Hướng dẫn kết nối</button>
    </div>
    <div class="card chatbase-card">
      <div id="chatbaseMount" class="chatbase-mount">
        <div class="chatbase-placeholder">
          <div class="chatbase-icon">✦</div>
          <h3>Trợ lý AI — Chatbase</h3>
          <p>Chat box sẽ xuất hiện tại đây sau khi bạn dán mã nhúng Chatbase vào <code>chatbase-config.js</code>.</p>
          <button class="btn primary" data-action="openChatbaseSetup">Xem cách kết nối</button>
        </div>
      </div>
      <div class="ai-disclaimer" style="margin-top:10px">⚠️ Chatbase là dịch vụ AI bên thứ ba. Không nhập thông tin nhạy cảm hoặc dữ liệu sức khỏe cá nhân không cần thiết.</div>
    </div>

    <div class="section-title"><div><h2>1. Gợi ý lịch tập tham khảo</h2><p class="muted">Dựa trên mục tiêu, mức độ, thời gian rảnh và lịch sử tập.</p></div><button class="btn secondary" data-action="fillAIFromSystem">Lấy dữ liệu hệ thống</button></div>
    <div class="card">
      <div class="form-grid">
        <div class="field"><label>Mục tiêu</label><input id="goal" value="Tăng sức mạnh và cải thiện thể lực"/></div>
        <div class="field"><label>Mức độ hiện tại</label><select id="level"><option>Cơ bản</option><option>Trung bình</option><option>Nâng cao</option></select></div>
        <div class="field"><label>Thời gian rảnh</label><input id="availability" value="Thứ 2, 4, 6 — sau 18:00"/></div>
        <div class="field"><label>Lịch sử tập</label><textarea id="history">3 buổi/tuần, điểm danh khá đều</textarea></div>
      </div>
      <div class="row-actions" style="margin-top:12px"><button class="btn primary" data-action="generatePlan">Sinh lịch tham khảo</button><button class="btn secondary" data-action="viewAIPlan">Xem chi tiết</button><button class="btn secondary" data-action="clearAIPlan">Xoá kết quả</button></div>
      <div id="aiPlan" class="ai-output" style="margin-top:14px;display:none"></div>
    </div>

    <div class="section-title"><div><h2>2. Tóm tắt tiến độ</h2><p class="muted">Tóm tắt từ điểm danh và ghi chú của huấn luyện viên.</p></div></div>
    <div class="card">
      <div class="field"><label>Ghi chú HLV</label><textarea id="coachNotes" style="width:100%;min-height:110px;background:#0d1424;border:1px solid var(--line);color:var(--text);padding:11px;border-radius:10px">Tập đều 3 buổi/tuần. Kỹ thuật squat tốt hơn. Cần duy trì lịch ngủ và khởi động.</textarea></div>
      <div class="row-actions" style="margin-top:12px"><button class="btn primary" data-action="summarize">Tóm tắt tiến độ</button><button class="btn secondary" data-action="viewAISummary">Xem chi tiết</button><button class="btn secondary" data-action="clearAISummary">Xoá kết quả</button></div>
      <div id="aiSummary" class="ai-output" style="margin-top:14px;display:none"></div>
    </div>

    <div class="section-title"><div><h2>3. Tin nhắn nhắc lịch / gia hạn</h2><p class="muted">Sinh nội dung để lễ tân hoặc HLV kiểm tra trước khi gửi.</p></div></div>
    <div class="card">
      <div class="form-grid"><div class="field"><label>Tên hội viên</label><input id="noticeName" value="Trần Quốc Huy"/></div><div class="field"><label>Loại nhắc</label><select id="noticeType"><option>nhắc lịch tập ngày mai</option><option>nhắc gia hạn gói sắp hết hạn</option></select></div></div>
      <div class="row-actions" style="margin-top:12px"><button class="btn primary" data-action="generateNotice">Tạo tin nhắn</button><button class="btn secondary" data-action="viewAINotice">Xem chi tiết</button><button class="btn secondary" data-action="clearAINotice">Xoá kết quả</button></div>
      <div id="aiNotice" class="ai-output" style="margin-top:14px;display:none"></div>
    </div>

    <div class="section-title"><div><h2>Lịch sử kết quả AI</h2><p class="muted">Các kết quả đã lưu để xem lại trong phiên demo này.</p></div><button class="btn danger" data-action="clearAIHistory">Xoá lịch sử</button></div>
    <div class="card table-wrap"><table class="table"><thead><tr><th>Thời gian</th><th>Loại</th><th>Tóm tắt</th><th>Thao tác</th></tr></thead><tbody>${history.length?history.map(h=>`<tr><td>${h.time}</td><td>${h.type}</td><td>${h.summary}</td><td><div class="table-actions"><button class="btn small" data-action="viewAIHistory" data-id="${h.id}">Xem</button><button class="btn small danger-outline" data-action="deleteAIHistory" data-id="${h.id}">Xoá</button></div></td></tr>`).join(''):`<tr><td colspan="4" class="muted">Chưa có kết quả nào được lưu.</td></tr>`}</tbody></table></div>
    <div class="ai-disclaimer">⚠️ Cảnh báo: Nội dung AI chỉ mang tính tham khảo, không thay thế tư vấn y tế hoặc tư vấn thể chất chuyên môn. Nếu dữ liệu sức khỏe thiếu hoặc có đau/chấn thương/bệnh nền, hãy hỏi HLV hoặc chuyên gia y tế.</div>
  </div>`
 },
};
function memberRows(arr){return arr.map(m=>`<tr><td>${m.id}</td><td><strong>${m.name}</strong><div class="small">${m.phone}</div></td><td>${m.plan}</td><td>${m.expiry}</td><td>${statusBadge(m.status)}</td><td><div class="row-actions"><button class="btn btn-sm" data-action="viewMember" data-id="${m.id}">Xem</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn btn-sm" data-action="editMember" data-id="${m.id}">Sửa</button><button class="btn btn-sm danger" data-action="deleteMember" data-id="${m.id}">Xoá</button>`:''}</div></td></tr>`).join('')}
function bind(view){
 if(view==='ai'){mountChatbase()}
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const target=b.dataset.go;if(hasPermission(target))render(target);else toast('Bạn không có quyền truy cập chức năng này.')});
 document.querySelectorAll('[data-action]').forEach(b=>{const fn=actions[b.dataset.action];if(fn)b.onclick=()=>fn(b)});
 const ms=document.getElementById('memberSearch');if(ms)ms.oninput=e=>{const el=document.getElementById('memberRows');if(el)el.innerHTML=memberRows(state.members.filter(m=>(m.name+' '+m.id+' '+m.phone).toLowerCase().includes(e.target.value.toLowerCase())))};
 const sf=document.getElementById('scheduleFilter');const ss=document.getElementById('scheduleSearch');const filterSchedules=()=>{const v=sf?.value||'all',q=(ss?.value||'').toLowerCase();document.querySelectorAll('[data-schedule-card]').forEach(el=>{const okType=v==='all'||el.dataset.type===v;const okText=!q||el.innerText.toLowerCase().includes(q);el.style.display=(okType&&okText)?'':'none'})};if(sf)sf.onchange=filterSchedules;if(ss)ss.oninput=filterSchedules;
 const as=document.getElementById('attendanceMember');if(as)as.oninput=e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('#attendanceRows tr').forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?'':'none')};
}
function getMember(id){return state.members.find(m=>m.id===id)}
function modalBase(title,body,actionsHtml='',eyebrow='GYMAI MANAGER'){return `<div class="modal-overlay" id="activeModal"><div class="modal-card"><div class="modal-head"><div><div class="eyebrow">${eyebrow}</div><h3>${title}</h3></div><button class="modal-close" data-action="closeModal">×</button></div><div class="modal-body">${body}</div>${actionsHtml?`<div class="modal-foot">${actionsHtml}</div>`:''}</div></div>`}
function openMemberModal(mode,id=''){
 const member=id?getMember(id):null;
 if(mode!=='add'&&!member)return;
 const readOnly=mode==='view';
 const title=mode==='add'?'Thêm hội viên mới':mode==='edit'?`Chỉnh sửa ${member.name}`:`Chi tiết hội viên — ${member.name}`;
 const body=`<div class="member-detail-grid">
  <div class="field"><label>Mã hội viên</label><input id="mId" value="${member?.id||nextMemberId()}" ${mode!=='add'?'readonly':''}></div>
  <div class="field"><label>Họ và tên</label><input id="mName" value="${member?.name||''}" ${readOnly?'readonly':''} placeholder="Nguyễn Văn A"></div>
  <div class="field"><label>Số điện thoại</label><input id="mPhone" value="${member?.phone||''}" ${readOnly?'readonly':''} placeholder="09xxxxxxxx"></div>
  <div class="field"><label>Gói tập</label><select id="mPlan" ${readOnly?'disabled':''}>${state.plans.map(p=>`<option ${member?.plan===p.name?'selected':''}>${p.name}</option>`).join('')}</select></div>
  <div class="field"><label>Ngày hết hạn</label><input id="mExpiry" type="date" value="${member?.expiry||'2026-10-14'}" ${readOnly?'readonly':''}></div>
  <div class="field"><label>Trạng thái</label><select id="mStatus" ${readOnly?'disabled':''}><option ${member?.status==='Đang hoạt động'?'selected':''}>Đang hoạt động</option><option ${member?.status==='Sắp hết hạn'?'selected':''}>Sắp hết hạn</option><option ${member?.status==='Đã hết hạn'?'selected':''}>Đã hết hạn</option></select></div>
  <div class="field full"><label>Email</label><input id="mEmail" value="${member?.email||''}" ${readOnly?'readonly':''} placeholder="hoivien@example.com"></div>
  <div class="field full"><label>Ghi chú</label><textarea id="mNote" ${readOnly?'readonly':''} placeholder="Mục tiêu, lưu ý khi tập...">${member?.note||''}</textarea></div>
 </div>`;
 const buttons=readOnly?`<button class="btn secondary" data-action="closeModal">Đóng</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn primary" data-action="editFromModal" data-id="${member.id}">Chỉnh sửa</button>`:''}`:`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn primary" data-action="saveMember" data-mode="${mode}" data-id="${member?.id||''}">${mode==='add'?'Thêm hội viên':'Lưu thay đổi'}</button>`;
 const root=document.getElementById('modalRoot'); if(!root){toast('Không thể mở cửa sổ thao tác. Vui lòng tải lại trang.');return} root.innerHTML=modalBase(title,body,buttons);bindModal();
}
function nextMemberId(){let max=state.members.reduce((n,m)=>Math.max(n,parseInt(m.id.replace(/\D/g,''))||0),0);return 'HV'+String(max+1).padStart(3,'0')}
function getPlan(id){return state.plans.find(p=>p.id===id)}
function nextPlanId(){let max=state.plans.reduce((n,p)=>Math.max(n,parseInt(p.id.replace(/\D/g,''))||0),0);return 'GOI'+String(max+1).padStart(2,'0')}
function openPlanModal(mode,id=''){
 const plan=id?getPlan(id):null;
 if(mode!=='add'&&!plan)return;
 const readOnly=mode==='view';
 const title=mode==='add'?'Thêm gói tập mới':mode==='edit'?`Chỉnh sửa ${plan.name}`:`Chi tiết gói tập — ${plan.name}`;
 const body=`<div class="member-detail-grid">
  <div class="field"><label>Mã gói</label><input id="pId" value="${plan?.id||nextPlanId()}" ${mode!=='add'?'readonly':''}></div>
  <div class="field"><label>Tên gói</label><input id="pName" value="${plan?.name||''}" ${readOnly?'readonly':''} placeholder="Ví dụ: Premium 6 tháng"></div>
  <div class="field"><label>Thời hạn</label><select id="pDuration" ${readOnly?'disabled':''}><option ${plan?.duration==='1 tháng'?'selected':''}>1 tháng</option><option ${plan?.duration==='3 tháng'?'selected':''}>3 tháng</option><option ${plan?.duration==='6 tháng'?'selected':''}>6 tháng</option><option ${plan?.duration==='12 tháng'?'selected':''}>12 tháng</option></select></div>
  <div class="field"><label>Giá gói (VNĐ)</label><input id="pPrice" type="number" min="0" step="10000" value="${plan?.price||''}" ${readOnly?'readonly':''} placeholder="350000"></div>
  <div class="field full"><label>Mô tả</label><textarea id="pDesc" ${readOnly?'readonly':''} placeholder="Quyền lợi và tiện ích của gói...">${plan?.desc||''}</textarea></div>
 </div>`;
 const buttons=readOnly?`<button class="btn secondary" data-action="closeModal">Đóng</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn primary" data-action="editPlanFromModal" data-id="${plan.id}">Chỉnh sửa</button>`:''}`:`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn primary" data-action="savePlan" data-mode="${mode}" data-id="${plan?.id||''}">${mode==='add'?'Thêm gói':'Lưu thay đổi'}</button>`;
 const root=document.getElementById('modalRoot'); if(!root){toast('Không thể mở cửa sổ thao tác. Vui lòng tải lại trang.');return} root.innerHTML=modalBase(title,body,buttons,'QUẢN LÝ GÓI TẬP'); bindPlanModal();
}
function bindPlanModal(){
 document.querySelectorAll('#modalRoot [data-action="closeModal"]').forEach(b=>b.onclick=closeModal);
 document.querySelectorAll('#modalRoot [data-action="editPlanFromModal"]').forEach(b=>b.onclick=()=>openPlanModal('edit',b.dataset.id));
 const save=document.querySelector('#modalRoot [data-action="savePlan"]');
 if(save)save.onclick=()=>{const mode=save.dataset.mode,id=save.dataset.id;const name=document.getElementById('pName').value.trim();const duration=document.getElementById('pDuration').value;const price=Number(document.getElementById('pPrice').value);const desc=document.getElementById('pDesc').value.trim();if(!name||!duration||!Number.isFinite(price)||price<0)return toast('Vui lòng nhập đầy đủ tên, thời hạn và giá gói.');const payload={id:document.getElementById('pId').value.trim(),name,duration,price,desc};if(mode==='add'){if(state.plans.some(p=>p.id===payload.id))return toast('Mã gói đã tồn tại.');state.plans.push(payload);toast(`Đã thêm ${name}`)}else{const idx=state.plans.findIndex(p=>p.id===id);if(idx>=0){state.plans[idx]=payload;toast(`Đã cập nhật ${name}`)}}closeModal();render('plans')};
}
function getPayment(code){return state.payments.find(p=>p.code===code)}
function nextPaymentCode(){let max=state.payments.reduce((n,p)=>Math.max(n,parseInt(p.code.replace(/\D/g,''))||0),0);return 'HD'+String(max+1).slice(-8).padStart(8,'0')}
function openPaymentModal(mode,id=''){
 const payment=id?getPayment(id):null;
 if(mode!=='add'&&!payment)return;
 const readOnly=mode==='view';
 const title=mode==='add'?'Ghi nhận thanh toán':mode==='edit'?`Chỉnh sửa ${payment.code}`:`Chi tiết giao dịch — ${payment.code}`;
 const body=`<div class="member-detail-grid">
  <div class="field"><label>Mã hóa đơn</label><input id="payCode" value="${payment?.code||nextPaymentCode()}" ${mode!=='add'?'readonly':''}></div>
  <div class="field"><label>Hội viên</label><select id="payMember" ${readOnly?'disabled':''}>${state.members.map(m=>`<option ${payment?.member===m.name?'selected':''}>${m.name}</option>`).join('')}</select></div>
  <div class="field"><label>Loại giao dịch</label><select id="payType" ${readOnly?'disabled':''}><option ${payment?.type==='Đăng ký mới'?'selected':''}>Đăng ký mới</option><option ${payment?.type==='Gia hạn'?'selected':''}>Gia hạn</option><option ${payment?.type==='Thanh toán khác'?'selected':''}>Thanh toán khác</option></select></div>
  <div class="field"><label>Số tiền (VNĐ)</label><input id="payAmount" type="number" min="0" step="10000" value="${payment?.amount||''}" ${readOnly?'readonly':''}></div>
  <div class="field"><label>Phương thức</label><select id="payMethod" ${readOnly?'disabled':''}><option ${payment?.method==='Tiền mặt'?'selected':''}>Tiền mặt</option><option ${payment?.method==='Chuyển khoản'?'selected':''}>Chuyển khoản</option><option ${payment?.method==='MoMo'?'selected':''}>MoMo</option><option ${payment?.method==='VNPay'?'selected':''}>VNPay</option></select></div>
  <div class="field"><label>Ngày thanh toán</label><input id="payDate" value="${payment?.date||new Date().toLocaleDateString('vi-VN')}" ${readOnly?'readonly':''}></div>
  <div class="field"><label>Trạng thái</label><select id="payStatus" ${readOnly?'disabled':''}><option ${payment?.status==='Đã thanh toán'?'selected':''}>Đã thanh toán</option><option ${payment?.status==='Chờ thanh toán'?'selected':''}>Chờ thanh toán</option><option ${payment?.status==='Đã huỷ'?'selected':''}>Đã huỷ</option></select></div>
  <div class="field full"><label>Ghi chú</label><textarea id="payNote" ${readOnly?'readonly':''} placeholder="Ghi chú giao dịch...">${payment?.note||''}</textarea></div>
 </div>`;
 const buttons=readOnly?`<button class="btn secondary" data-action="closeModal">Đóng</button>${['manager','reception'].includes(state.currentUser.role)?`<button class="btn primary" data-action="editPaymentFromModal" data-id="${payment.code}">Chỉnh sửa</button>`:''}`:`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn primary" data-action="savePayment" data-mode="${mode}" data-id="${payment?.code||''}">${mode==='add'?'Ghi nhận':'Lưu thay đổi'}</button>`;
 const root=document.getElementById('modalRoot');if(!root){toast('Không thể mở cửa sổ thao tác. Vui lòng tải lại trang.');return}root.innerHTML=modalBase(title,body,buttons,'THANH TOÁN');bindPaymentModal();
}
function bindPaymentModal(){
 document.querySelectorAll('#modalRoot [data-action="closeModal"]').forEach(b=>b.onclick=closeModal);
 document.querySelectorAll('#modalRoot [data-action="editPaymentFromModal"]').forEach(b=>b.onclick=()=>openPaymentModal('edit',b.dataset.id));
 const save=document.querySelector('#modalRoot [data-action="savePayment"]');
 if(save)save.onclick=()=>{const mode=save.dataset.mode,id=save.dataset.id;const payload={code:document.getElementById('payCode').value.trim(),member:document.getElementById('payMember').value,type:document.getElementById('payType').value,amount:Number(document.getElementById('payAmount').value),method:document.getElementById('payMethod').value,date:document.getElementById('payDate').value.trim(),status:document.getElementById('payStatus').value,note:document.getElementById('payNote').value.trim()};if(!payload.code||!payload.member||!Number.isFinite(payload.amount)||payload.amount<=0||!payload.date)return toast('Vui lòng nhập đầy đủ thông tin thanh toán.');if(mode==='add'){if(state.payments.some(p=>p.code===payload.code))return toast('Mã hóa đơn đã tồn tại.');state.payments.unshift(payload);toast('Đã ghi nhận thanh toán')}else{const idx=state.payments.findIndex(p=>p.code===id);if(idx>=0){state.payments[idx]=payload;toast('Đã cập nhật giao dịch')}}closeModal();render('payments')};
}
function openConfirmModal(title,text,onConfirm){const root=document.getElementById('modalRoot');if(!root){toast('Không thể mở cửa sổ xác nhận. Vui lòng tải lại trang.');return}root.innerHTML=modalBase(title,`<p class="modal-text">${text}</p>`,`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn danger" id="confirmAction">Xác nhận xoá</button>`);document.getElementById('confirmAction').onclick=onConfirm;document.querySelector('#modalRoot [data-action="closeModal"]').onclick=closeModal}
function closeModal(){const root=document.getElementById('modalRoot');if(root)root.innerHTML=''}
function bindModal(){document.querySelectorAll('#modalRoot [data-action="closeModal"]').forEach(b=>b.onclick=closeModal);document.querySelectorAll('#modalRoot [data-action="editFromModal"]').forEach(b=>b.onclick=()=>{openMemberModal('edit',b.dataset.id)});const save=document.querySelector('#modalRoot [data-action="saveMember"]');if(save)save.onclick=()=>{const mode=save.dataset.mode,id=save.dataset.id;const name=document.getElementById('mName').value.trim();const phone=document.getElementById('mPhone').value.trim();if(!name||!phone)return toast('Vui lòng nhập họ tên và số điện thoại.');const payload={id:document.getElementById('mId').value.trim(),name,phone,plan:document.getElementById('mPlan').value,expiry:document.getElementById('mExpiry').value,status:document.getElementById('mStatus').value,email:document.getElementById('mEmail').value.trim(),note:document.getElementById('mNote').value.trim()};if(mode==='add'){state.members.push(payload);toast(`Đã thêm ${name}`)}else{const idx=state.members.findIndex(m=>m.id===id);if(idx>=0){state.members[idx]=payload;toast(`Đã cập nhật ${name}`)}}closeModal();render('members')}}


function getAIHistory(){try{return JSON.parse(localStorage.getItem('gymai_ai_history')||'[]')}catch(_){return []}}
function setAIHistory(h){localStorage.setItem('gymai_ai_history',JSON.stringify(h.slice(0,30)))}
function saveAIResult(type,text,summary){const h=getAIHistory();h.unshift({id:'AI'+Date.now()+Math.random().toString(16).slice(2),type,time:new Date().toLocaleString('vi-VN'),summary,content:text});setAIHistory(h)}
function getAIResultText(id){const h=getAIHistory().find(x=>x.id===id);return h?.content||''}
function showAIResultModal(title,text){const root=document.getElementById('modalRoot');if(!root)return;root.innerHTML=modalBase(title,`<pre style="white-space:pre-wrap;color:var(--text);font-family:inherit;line-height:1.65;background:#0b1220;border:1px solid var(--line);padding:16px;border-radius:12px">${text}</pre>`,`<button class="btn secondary" data-action="closeModal">Đóng</button>`,'TRỢ LÝ AI');document.querySelector('#modalRoot [data-action="closeModal"]').onclick=closeModal}


function getAIChat(){
  try{return JSON.parse(sessionStorage.getItem('gymai_ai_chat')||'[]')}catch(_){return []}
}
function setAIChat(v){sessionStorage.setItem('gymai_ai_chat',JSON.stringify(v))}
function norm(value){return String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function currentUserRole(){
  return norm(window.currentUser?.role || window.currentUserRole || sessionStorage.getItem('gymai_role') || localStorage.getItem('gymai_role') || state.currentUser?.role || '');
}
function isMemberRole(){
  const r=currentUserRole();
  return /hội viên|hoi vien|member/.test(r);
}
function currentMemberRecord(){
  const candidates=[
    window.currentUser?.memberId, window.currentUser?.member_id, window.currentUser?.memberName,
    window.currentUser?.name, state.currentUser?.memberId, state.currentUser?.member_id,
    state.currentUser?.memberName, state.currentUser?.name,
    sessionStorage.getItem('gymai_member_id'), sessionStorage.getItem('gymai_member_name')
  ].filter(Boolean).map(String);
  for(const c of candidates){
    const m=(state.members||[]).find(v=>String(v.id||v.memberId||'')===c || norm(v.name)===norm(c));
    if(m)return m;
  }
  const email=window.currentUser?.email || state.currentUser?.email || sessionStorage.getItem('gymai_email');
  if(email){
    return (state.members||[]).find(v=>norm(v.email)===norm(email)) || null;
  }
  return null;
}

function aiChatReply(q){
  const x=q.toLowerCase().trim();
  const members=state.members||[];
  const plans=state.plans||[];
  const schedules=state.schedule||[];
  const attendance=state.attendance||[];
  const payments=state.payments||[];
  const trainers=state.trainers||[];
  const memberRole=isMemberRole();
  const me=currentMemberRecord();

  const moneyFmt=n=>{
    try{return new Intl.NumberFormat('vi-VN').format(Number(n)||0)+' đ'}catch(_){return `${Number(n)||0} đ`}
  };
  const names=(arr,key)=>arr.map(v=>v?.[key]||v?.name||v?.title).filter(Boolean);
  const findMember=q0=>{
    const qn=norm(q0);
    return members.find(m=>qn.includes(norm(m.name)) && m.name) || null;
  };

  // Chào hỏi / hội thoại chung
  if(/^(xin chào|chào|hello|hi|hey)\b/.test(x))
    return `Chào bạn 👋 Mình là Trợ lý AI của GymAI. Bạn có thể hỏi tự nhiên về quản lý phòng gym, lịch tập, hội viên, HLV, điểm danh, thanh toán, gói tập hoặc cách sử dụng hệ thống.`;
  if(/cảm ơn|thank/.test(x))
    return `Không có gì 😄 Bạn cứ hỏi tiếp nhé.`;
  if(/bạn làm được gì|có thể làm gì|hỗ trợ gì|giúp được gì/.test(x))
    return `Mình có thể hỗ trợ 4 nhóm chính: phân tích dữ liệu phòng gym, giải thích nghiệp vụ, gợi ý lịch tập tham khảo và hướng dẫn sử dụng hệ thống. Bạn không cần hỏi đúng mẫu câu; cứ hỏi bằng câu tự nhiên.`;

  // Trả lời theo vai trò Hội viên: ưu tiên thông tin cá nhân, không lộ dữ liệu quản trị.
  if(memberRole){
    if(/thông tin.*của tôi|thông tin.*tôi|tài khoản.*tôi|hồ sơ.*tôi/.test(x)){
      return me
        ? `Hồ sơ của bạn: ${me.name||'chưa cập nhật'}; gói ${me.plan||me.package||'chưa cập nhật'}; hạn ${me.expiry||'chưa cập nhật'}; trạng thái ${me.status||'chưa cập nhật'}.`
        : `Mình chưa xác định được hồ sơ hội viên đang đăng nhập. Bạn hãy kiểm tra lại thông tin tài khoản.`;
    }
    if(/lịch.*của tôi|lịch tập.*tôi|buổi tập.*tôi/.test(x)){
      if(!me)return `Mình chưa xác định được hồ sơ hội viên của bạn để tìm lịch tập.`;
      const mine=schedules.filter(s=>norm(s.member||s.memberName).includes(norm(me.name)));
      return mine.length
        ? `Lịch tập của bạn: ${mine.slice(0,10).map(s=>`${s.date||''} ${s.time||''} – ${s.title||'buổi tập'}${s.trainer?' – HLV '+s.trainer:''}`).join('; ')}.`
        : `Bạn chưa có lịch tập nào được ghi nhận.`;
    }
    if(/điểm danh.*của tôi|lịch sử.*điểm danh|tôi.*đã tập/.test(x)){
      if(!me)return `Mình chưa xác định được hồ sơ hội viên của bạn.`;
      const mine=attendance.filter(a=>norm(a.member||a.memberName).includes(norm(me.name)));
      return `Bạn có ${mine.length} bản ghi điểm danh trong dữ liệu hiện tại.`;
    }
    if(/thanh toán.*của tôi|tiền.*của tôi|tôi.*đã đóng|hóa đơn.*của tôi|hoá đơn.*của tôi/.test(x)){
      if(!me)return `Mình chưa xác định được hồ sơ hội viên của bạn.`;
      const mine=payments.filter(p=>norm(p.member||p.memberName).includes(norm(me.name)));
      const total=mine.reduce((s,p)=>s+(Number(p.amount)||0),0);
      return `Bạn có ${mine.length} giao dịch thanh toán, tổng giá trị khoảng ${moneyFmt(total)}.`;
    }
    if(/hết hạn|gia hạn|gói.*của tôi|thẻ.*của tôi/.test(x)){
      return me
        ? `Gói hiện tại của bạn là ${me.plan||me.package||'chưa cập nhật'}, hạn ${me.expiry||'chưa cập nhật'}. Khi gần hết hạn, bạn nên liên hệ lễ tân để được hỗ trợ gia hạn.`
        : `Mình chưa xác định được gói tập của tài khoản này.`;
    }
    if(/hôm nay.*tập|hôm nay.*lịch/.test(x)){
      if(!me)return `Mình chưa xác định được hồ sơ hội viên của bạn.`;
      const d=new Date();
      const ds=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      const mine=schedules.filter(s=>norm(s.member||s.memberName).includes(norm(me.name)) && String(s.date||'').includes(ds));
      return mine.length
        ? `Hôm nay bạn có: ${mine.map(s=>`${s.time||''} – ${s.title||'buổi tập'}${s.trainer?' với HLV '+s.trainer:''}`).join('; ')}.`
        : `Hôm nay mình chưa thấy lịch tập riêng của bạn trong hệ thống.`;
    }
    if(/nên tập|lịch tập|workout|tăng cơ|giảm cân|giảm mỡ|mới tập|ăn gì|dinh dưỡng|protein|cardio|sức bền|nghỉ/.test(x)){
      return `Mình có thể tư vấn ở mức tham khảo về mục tiêu tập luyện, cách sắp xếp buổi tập, cardio, phục hồi và dinh dưỡng cơ bản. Bạn cho mình biết mục tiêu, số buổi/tuần và trình độ để mình gợi ý phù hợp.`;
    }
    if(/cách.*đăng ký|đặt lịch|đặt.*buổi|đổi lịch|hủy lịch|huỷ lịch|liên hệ.*hlv|liên hệ.*lễ tân/.test(x)){
      return `Với các thao tác như đăng ký/đổi/hủy lịch hoặc xử lý tài khoản, bạn nên dùng các chức năng được cung cấp trong hệ thống hoặc liên hệ lễ tân/HLV của trung tâm để xác nhận.`;
    }
    if(/quyền|tôi được làm gì|chức năng.*của tôi|vai trò/.test(x)){
      return `Ở vai trò Hội viên, bạn chủ yếu xem thông tin cá nhân, gói tập, lịch tập, điểm danh và các thông tin liên quan đến quá trình tập luyện.`;
    }
  }

  // Thống kê hệ thống
  if(/bao nhiêu.*hội viên|tổng.*hội viên|số.*hội viên/.test(x))
    return `Hiện có ${members.length} hội viên trong dữ liệu.`;
  if(/bao nhiêu.*huấn luyện|bao nhiêu.*hlv|có.*hlv|danh sách.*hlv/.test(x))
    return `Hiện hệ thống có ${trainers.length} huấn luyện viên${trainers.length?`: ${names(trainers,'name').slice(0,8).join(', ')}`:''}.`;
  if(/bao nhiêu.*gói|gói tập.*nào|danh sách.*gói/.test(x))
    return `Hiện có ${plans.length} gói tập${plans.length?`: ${names(plans,'name').slice(0,8).join(', ')}`:''}.`;
  if(/bao nhiêu.*lịch|lịch tập.*nào|danh sách.*lịch/.test(x))
    return `Hiện có ${schedules.length} lịch tập trong hệ thống.`;
  if(/bao nhiêu.*điểm danh|điểm danh.*nào|danh sách.*điểm danh/.test(x))
    return `Hiện có ${attendance.length} bản ghi điểm danh.`;
  if(/bao nhiêu.*giao dịch|bao nhiêu.*thanh toán|giao dịch.*nào/.test(x))
    return `Hiện có ${payments.length} giao dịch thanh toán.`;

  // Phân tích thanh toán
  if(/doanh thu|thu nhập|tổng tiền|đã thu|đã thanh toán/.test(x)){
    const paid=payments.filter(p=>/đã thanh toán|paid|completed|success/i.test(String(p.status||'')))
      .reduce((s,p)=>s+(Number(p.amount)||0),0);
    const total=payments.reduce((s,p)=>s+(Number(p.amount)||0),0);
    return `Tổng giá trị giao dịch đang lưu là ${moneyFmt(total)}. Trong đó các giao dịch có trạng thái đã thanh toán khoảng ${moneyFmt(paid)}.`;
  }
  if(/chưa thanh toán|nợ|còn thiếu|đang chờ/.test(x)){
    const pending=payments.filter(p=>/chờ|pending|chưa|unpaid/i.test(String(p.status||''))).length;
    return `Hiện có khoảng ${pending} giao dịch đang ở trạng thái cần xử lý/chưa hoàn tất.`;
  }

  // Ngày và lịch
  if(/hôm nay|today/.test(x)){
    const d=new Date();
    const ds=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    const today=schedules.filter(s=>String(s.date||'').includes(ds));
    return today.length
      ? `Hôm nay (${ds}) có ${today.length} lịch tập. ${today.slice(0,8).map(s=>`${s.time||''} ${s.title||'buổi tập'}${s.trainer?' – HLV '+s.trainer:''}`).join('; ')}.`
      : `Mình chưa thấy lịch nào có ngày ${ds} trong dữ liệu hiện tại.`;
  }

  // Theo tên hội viên
  const member=findMember(x);
  if(member && !memberRole){
    if(/lịch|buổi tập|schedule/.test(x)){
      const mine=schedules.filter(s=>norm(s.member||s.memberName).includes(norm(member.name)));
      return mine.length
        ? `Lịch của ${member.name}: ${mine.slice(0,10).map(s=>`${s.date||''} ${s.time||''} – ${s.title||'buổi tập'}`).join('; ')}.`
        : `Mình chưa tìm thấy lịch tập riêng của ${member.name}.`;
    }
    if(/điểm danh|đi học|attendance/.test(x)){
      const mine=attendance.filter(a=>norm(a.member||a.memberName).includes(norm(member.name)));
      return `Có ${mine.length} bản ghi điểm danh của ${member.name}.`;
    }
    if(/gói|hạn|gia hạn|thẻ/.test(x))
      return `Thông tin mình tìm thấy về ${member.name}: gói ${member.plan||member.package||'chưa cập nhật'}, hạn ${member.expiry||'chưa cập nhật'}, trạng thái ${member.status||'chưa cập nhật'}.`;
    return `${member.name} đang có trạng thái ${member.status||'chưa cập nhật'}, gói ${member.plan||member.package||'chưa cập nhật'} và hạn ${member.expiry||'chưa cập nhật'}.`;
  }

  // Nghiệp vụ quản lý
  if(/hội viên.*mới|thêm hội viên|tạo hội viên|đăng ký hội viên/.test(x))
    return `Bạn có thể vào mục Hội viên → Thêm hội viên, sau đó nhập thông tin cá nhân, gói tập và thời hạn.`;
  if(/sửa hội viên|cập nhật hội viên|đổi thông tin hội viên/.test(x))
    return `Vào Hội viên, chọn hội viên cần sửa rồi dùng nút Chỉnh sửa. Kiểm tra lại gói tập và hạn trước khi lưu.`;
  if(/xoá hội viên|xóa hội viên|delete.*hội viên/.test(x))
    return `Bạn có thể xoá hội viên từ mục Hội viên. Nên kiểm tra lịch tập, điểm danh và thanh toán liên quan trước khi xoá dữ liệu.`;
  if(/thêm gói|tạo gói|sửa gói|xoá gói|xóa gói/.test(x))
    return `Quản lý gói tập nằm trong mục Gói tập. Bạn có thể thêm, xem, sửa hoặc xoá gói tùy quyền tài khoản.`;
  if(/điểm danh.*như thế nào|cách.*điểm danh|chấm công.*như thế nào/.test(x))
    return `Vào mục Điểm danh → Thêm điểm danh, chọn hội viên, ngày/giờ và trạng thái. Sau đó kiểm tra lại danh sách để tránh ghi trùng.`;
  if(/thanh toán.*như thế nào|cách.*thanh toán|tạo giao dịch/.test(x))
    return `Vào mục Thanh toán → Thêm giao dịch, chọn hội viên, số tiền, phương thức và trạng thái. Có thể ghi chú để dễ đối soát.`;

  // Gợi ý vận hành
  if(/làm sao.*giữ chân|giữ chân hội viên|tăng.*hội viên|tăng.*doanh thu/.test(x))
    return `Một số hướng phù hợp: nhắc gia hạn trước khi hết hạn, theo dõi tần suất tập, chủ động liên hệ hội viên nghỉ lâu và tạo gói phù hợp mục tiêu. Trợ lý AI có thể hỗ trợ soạn nội dung nhắc gia hạn.`;
  if(/hội viên.*nghỉ lâu|ít đi tập|vắng/.test(x))
    return `Bạn nên lọc dữ liệu điểm danh theo khoảng thời gian rồi xác định nhóm có tần suất thấp. Với nhóm này, có thể gửi tin nhắc hoặc hỏi lại mục tiêu tập luyện.`;
  if(/nên hỏi.*huấn luyện|hỏi.*hlv|trao đổi.*hlv/.test(x))
    return `Bạn có thể trao đổi với HLV về mục tiêu, mức độ phù hợp của bài tập, kỹ thuật và tiến độ. Các quyết định liên quan sức khoẻ nên được HLV/chuyên gia phù hợp đánh giá.`;

  // Fitness Q&A mang tính tham khảo
  if(/tăng cơ|xây cơ|muscle/.test(x))
    return `Để hỗ trợ mục tiêu tăng cơ, thường cần lịch tập sức mạnh đều đặn, kỹ thuật đúng, ngủ đủ và dinh dưỡng phù hợp. Mình chỉ đưa thông tin tham khảo, không thay thế tư vấn chuyên môn.`;
  if(/giảm cân|giảm mỡ|fat loss/.test(x))
    return `Mục tiêu giảm cân thường liên quan đến vận động đều, ăn uống phù hợp và theo dõi tiến độ lâu dài. Tránh áp dụng chế độ quá cực đoan; khi có vấn đề sức khỏe nên trao đổi với người có chuyên môn.`;
  if(/khởi đầu|mới tập|beginner/.test(x))
    return `Người mới nên bắt đầu với cường độ vừa phải, ưu tiên làm đúng kỹ thuật và tăng dần khối lượng. Bạn có thể dùng mục Gợi ý lịch tập để tạo lịch tham khảo theo số buổi muốn tập.`;
  if(/lịch tập|workout|tập.*mấy buổi/.test(x))
    return `Bạn có thể nhập mục tiêu, số buổi/tuần và trình độ trong phần Gợi ý lịch tập. Hệ thống sẽ tạo lịch tham khảo để bạn xem và điều chỉnh.`;

  // Trợ lý sử dụng hệ thống
  if(/đăng xuất|logout/.test(x))
    return `Để đăng xuất, dùng menu tài khoản ở góc trên của hệ thống và chọn Đăng xuất. Hệ thống sẽ hỏi xác nhận trước khi thoát.`;
  if(/quyền|vai trò|phân quyền|ai được/.test(x))
    return `Hệ thống có các vai trò như Quản lý, Lễ tân, Huấn luyện viên và Hội viên. Mỗi vai trò có nhóm thao tác khác nhau.`;
  if(/ai|trợ lý ai|hỏi đáp/.test(x))
    return `Bạn đang ở đúng khu vực Trợ lý AI. Bạn có thể hỏi theo cách tự nhiên, kể cả câu hỏi mở như “Nên làm gì khi hội viên ít đi tập?”, “Làm sao quản lý gia hạn?”, hoặc hỏi trực tiếp về một hội viên.`;

  // Câu hỏi mở / fallback
  return `Mình hiểu câu hỏi của bạn. Bạn cứ hỏi tự nhiên hơn, ví dụ:
“Làm sao giữ chân hội viên?”
“Hôm nay có gì cần xử lý?”
“Hội viên Nguyễn Văn A đang có thông tin gì?”
“Làm sao theo dõi người sắp hết hạn?”
“Mới tập gym nên bắt đầu thế nào?”
“Làm sao tăng doanh thu phòng gym?”
Mình sẽ cố gắng trả lời dựa trên dữ liệu hệ thống và kiến thức tham khảo.`;
}

function mountChatbase(){
  const mount=document.getElementById('chatbaseMount');
  if(!mount)return;
  const url=window.GYM_CHATBASE_IFRAME_URL||'';
  const embed=window.GYM_CHATBASE_EMBED_CODE||'';
  if(url){
    mount.innerHTML=`<iframe class="chatbase-iframe" src="${String(url).replace(/\"/g,'&quot;')}" title="GymAI Chatbase AI" allow="microphone" loading="lazy"></iframe>`;
    return;
  }
  if(embed){
    mount.innerHTML=`<div class="chatbase-live-note">Chatbase đã được kết nối. Chat bubble của Chatbase sẽ xuất hiện ở góc màn hình.</div>`;
    if(!document.getElementById('chatbase-embed-script')){
      const holder=document.createElement('div');
      holder.innerHTML=embed;
      const script=holder.querySelector('script');
      if(script){
        const liveScript=document.createElement('script');
        liveScript.id='chatbase-embed-script';
        liveScript.textContent=script.textContent;
        document.body.appendChild(liveScript);
      }
    }
    return;
  }
}

function openChatbaseSetup(){
  showAIResultModal('Kết nối Chatbase',`<div class="chatbase-setup">
    <p><strong>Bước 1:</strong> Tạo chatbot trên Chatbase và huấn luyện bằng dữ liệu bạn muốn AI biết.</p>
    <p><strong>Bước 2:</strong> Trong Chatbase, vào phần triển khai/Embed website và lấy mã <strong>iframe</strong> hoặc <strong>script</strong>.</p>
    <p><strong>Bước 3:</strong> Mở file <code>chatbase-config.js</code> trong project và dán URL iframe vào biến <code>GYM_CHATBASE_IFRAME_URL</code>.</p>
    <p><strong>Bước 4:</strong> Mở lại <code>index.html</code>. Chatbase sẽ hiển thị ngay trong mục <strong>Trợ lý AI</strong>.</p>
    <p class="muted">Nếu bạn gửi cho mình mã Embed của Chatbase, mình có thể đặt đúng mã đó vào project thay cho phần cấu hình mẫu.</p>
  </div>`);
}

function renderAIChat(){
  const box=document.getElementById('aiChatMessages');
  if(!box)return;
  const items=getAIChat();
  if(!items.length){
    box.innerHTML=`<div class="ai-chat-empty">👋 Xin chào! Hãy đặt câu hỏi để bắt đầu.</div>`;
    return;
  }
  box.innerHTML=items.map(m=>`<div class="chat-row ${m.role==='user'?'user':'assistant'}"><div class="chat-bubble">${String(m.text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div></div>`).join('');
  box.scrollTop=box.scrollHeight;
}
async function sendAIChatText(text){
  const q=(text||'').trim();
  if(!q)return toast('Hãy nhập câu hỏi trước.');
  const input=document.getElementById('aiChatInput');
  if(input){input.value='';input.disabled=true;}
  const chat=getAIChat();
  const now=()=>new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  chat.push({role:'user',text:q,time:now()});
  setAIChat(chat);
  renderAIChat();
  const loading={role:'assistant',text:'⏳ Đang suy nghĩ...',time:now(),loading:true};
  const withLoading=[...chat,loading];
  setAIChat(withLoading); renderAIChat();
  try{
    const role=state.currentUser?.role||'member';
    const me=currentMemberRecord();
    const context=role==='member'
      ? {my_member:me||null, my_schedule:(state.schedule||[]).filter(x=>!me || String(x.member||'').includes(String(me.name))), my_attendance:(state.attendance||[]).filter(x=>!me || String(x.member||'').includes(String(me.name))), my_payments:(state.payments||[]).filter(x=>!me || String(x.member||'').includes(String(me.name))), plans:state.plans||[]}
      : {members:state.members||[],plans:state.plans||[],schedule:state.schedule||[],attendance:state.attendance||[],payments:state.payments||[],trainers:state.trainers||[]};
    const history=chat.slice(-12).map(m=>({role:m.role,content:m.text}));
    const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,history,role,user_name:state.currentUser?.name||'',context})});
    const data=await res.json();
    const clean=getAIChat().filter(x=>!x.loading);
    const answer=data.ok?data.answer:(data.configured===false?aiChatReply(q):`⚠️ ${data.message||'Không nhận được câu trả lời từ AI.'}`);
    clean.push({role:'assistant',text:answer,time:now()});
    setAIChat(clean); renderAIChat();
  }catch(err){
    const clean=getAIChat().filter(x=>!x.loading);
    clean.push({role:'assistant',text:`⚠️ Không kết nối được backend AI. Nếu muốn hỏi câu hỏi mở rộng, hãy chạy FastAPI và cấu hình OPENAI_API_KEY.\n\n${aiChatReply(q)}`,time:now()});
    setAIChat(clean); renderAIChat();
  }finally{
    const el=document.getElementById('aiChatInput');
    if(el){el.disabled=false;el.focus();}
  }
}
function clearAIChat(){
  sessionStorage.removeItem('gymai_ai_chat');
  renderAIChat();
  toast('Đã xoá đoạn chat');
}

const actions={
 toast:b=>toast(b.dataset.msg),
 addMember:()=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openMemberModal('add')},
 viewMember:b=>openMemberModal('view',b.dataset.id),
 editMember:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openMemberModal('edit',b.dataset.id)},
 deleteMember:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');const m=state.members.find(x=>x.id===b.dataset.id);if(!m)return;openConfirmModal(`Xoá hội viên <strong>${m.name}</strong>?`,`Thao tác này sẽ xoá hồ sơ hội viên khỏi dữ liệu demo.`,()=>{state.members=state.members.filter(x=>x.id!==m.id);closeModal();toast(`Đã xoá ${m.name}`);render('members')})},
 addPlan:()=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openPlanModal('add')},
 viewPlan:b=>openPlanModal('view',b.dataset.id),
 editPlan:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openPlanModal('edit',b.dataset.id)},
 deletePlan:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');const p=getPlan(b.dataset.id);if(!p)return;openConfirmModal(`Xoá gói <strong>${p.name}</strong>?`,`Thao tác này sẽ xoá gói khỏi dữ liệu demo.`,()=>{state.plans=state.plans.filter(x=>x.id!==p.id);closeModal();toast(`Đã xoá ${p.name}`);render('plans')})},
 addSchedule:()=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openScheduleModal('add')},
 viewSchedule:b=>openScheduleModal('view',b.dataset.id),
 editSchedule:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openScheduleModal('edit',b.dataset.id)},
 deleteSchedule:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');const s=getSchedule(b.dataset.id);if(!s)return;openConfirmModal(`Xoá lịch <strong>${s.title}</strong>?`,`Lịch ${s.date||''} ${s.time||''} sẽ bị xoá khỏi dữ liệu demo.`,()=>{state.schedule=state.schedule.filter(x=>x.id!==s.id);closeModal();toast('Đã xoá lịch tập');render('schedule')})},
 bookMemberSchedule:()=>{const options=state.schedule.filter(s=>(s.capacity||0)>(s.booked||0)&&s.status!=='Đã huỷ');if(!options.length)return toast('Hiện không còn lịch trống.');const root=document.getElementById('modalRoot');const body=`<div class="field"><label>Chọn lịch</label><select id="bookSchedule">${options.map(s=>`<option value="${s.id}">${s.date||''} ${s.time} — ${s.title} — ${s.trainer}</option>`).join('')}</select></div>`;root.innerHTML=modalBase('Đăng ký lịch tập',body,`<button class="btn secondary" data-action="closeModal">Huỷ</button><button class="btn primary" id="confirmBookSchedule">Đăng ký</button>`,'LỊCH TẬP');document.getElementById('confirmBookSchedule').onclick=()=>{const id=document.getElementById('bookSchedule').value;const s=getSchedule(id);if(!s)return;s.booked=(s.booked||0)+1;s.member=state.currentUser.name;closeModal();toast(`Đã đăng ký ${s.title}`);render('schedule')};document.querySelector('#modalRoot [data-action="closeModal"]').onclick=closeModal},
 checkin:()=>{if(!['manager','reception','trainer'].includes(state.currentUser.role))return toast('Không có quyền.');openAttendanceModal('add')},
 viewAttendance:b=>openAttendanceModal('view',b.dataset.id),
 editAttendance:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openAttendanceModal('edit',b.dataset.id)},
 deleteAttendance:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');const a=getAttendance(b.dataset.id);if(!a)return;openConfirmModal(`Xoá điểm danh <strong>${a.member}</strong>?`,`Bản ghi ${a.date} — ${a.session} sẽ bị xoá khỏi dữ liệu demo.`,()=>{state.attendance=state.attendance.filter(x=>x.id!==a.id);closeModal();toast('Đã xoá bản ghi điểm danh');render('attendance')})},
 addPayment:()=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openPaymentModal('add')},
 viewPayment:b=>openPaymentModal('view',b.dataset.id),
 editPayment:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');openPaymentModal('edit',b.dataset.id)},
 deletePayment:b=>{if(!['manager','reception'].includes(state.currentUser.role))return toast('Không có quyền.');const p=getPayment(b.dataset.id);if(!p)return;openConfirmModal(`Xoá hoá đơn <strong>${p.code}</strong>?`,`Giao dịch ${p.code} sẽ bị xoá khỏi dữ liệu demo.`,()=>{state.payments=state.payments.filter(x=>x.code!==p.code);closeModal();toast(`Đã xoá ${p.code}`);render('payments')})},
 sendAIChat:()=>sendAIChatText(document.getElementById('aiChatInput')?.value||''),
 chatQuick:b=>sendAIChatText(b.dataset.question||''),
 clearAIChat:()=>clearAIChat(),
 generatePlan:()=>{const goal=document.getElementById('goal').value.trim(),level=document.getElementById('level').value.trim(),free=document.getElementById('availability').value.trim(),hist=document.getElementById('history').value.trim();if(!goal||!level||!free||!hist)return toast('Vui lòng nhập/chọn đầy đủ các ô trước khi sinh lịch.');const knownDays=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];const selectedDays=knownDays.filter(d=>free.toLowerCase().includes(d.toLowerCase()));const dayLines=selectedDays.length?selectedDays.map((d,i)=>`• ${d}: Buổi ${i+1} — bám mục tiêu “${goal}”, mức độ “${level}”, sắp xếp trong khung thời gian “${free}”.`).join('\n'):`• Thời gian rảnh bạn chọn: ${free}. Hãy bố trí số buổi phù hợp đúng theo khung thời gian này.`;const out=`GỢI Ý LỊCH TẬP THAM KHẢO\n\nMục tiêu: ${goal}\nMức độ hiện tại: ${level}\nThời gian rảnh: ${free}\nLịch sử tập: ${hist}\n\nLỊCH ĐỀ XUẤT\n${dayLines}\n\nLưu ý: Đây chỉ là gợi ý tham khảo, không thay thế tư vấn y tế hoặc tư vấn thể chất chuyên môn. Nếu dữ liệu sức khỏe chưa đầy đủ hoặc có vấn đề sức khỏe, hãy hỏi huấn luyện viên/chuyên gia.`;const box=document.getElementById('aiPlan');box.textContent=out;box.style.display='block';saveAIResult('Gợi ý lịch tập',out,`${goal} — ${level} — ${free}`);toast('Đã tạo lịch đúng theo dữ liệu đã chọn/nhập')},
 summarize:()=>{const n=document.getElementById('coachNotes').value.trim();if(!n)return toast('Vui lòng nhập ghi chú HLV.');const out=`TÓM TẮT TIẾN ĐỘ\n\n• Tần suất: duy trì tương đối đều, khoảng 3 buổi/tuần.\n• Điểm tích cực: kỹ thuật squat cải thiện và sức mạnh có xu hướng tăng.\n• Vấn đề cần chú ý: có một buổi nghỉ do lịch cá nhân.\n• Gợi ý theo dõi: tiếp tục duy trì lịch ổn định và ghi nhận mức tạ/độ khó mỗi tuần.\n\nNguồn ghi chú: ${n}`;const box=document.getElementById('aiSummary');box.textContent=out;box.style.display='block';saveAIResult('Tóm tắt tiến độ',out,'Tóm tắt từ ghi chú HLV');toast('Đã tạo và lưu tóm tắt tiến độ')},
 generateNotice:()=>{const name=document.getElementById('noticeName').value.trim(),type=document.getElementById('noticeType').value;if(!name)return toast('Vui lòng nhập tên hội viên.');const msg=type.includes('gia hạn')?`Chào ${name}, gói tập của bạn sắp hết hạn. Bạn có thể liên hệ lễ tân để được hỗ trợ gia hạn và nhận thông tin các gói phù hợp. Hẹn gặp bạn tại phòng gym!`: `Chào ${name}, đây là lời nhắc buổi tập của bạn vào ngày mai. Hãy chuẩn bị đầy đủ và đến sớm vài phút để khởi động nhé!`;const box=document.getElementById('aiNotice');box.textContent=msg;box.style.display='block';saveAIResult('Tin nhắn nhắc lịch/gia hạn',msg,`${name} — ${type}`);toast('Đã tạo và lưu tin nhắn')},
 fillAIFromSystem:()=>{const me=state.currentUser?.name||'';const mine=state.members.find(m=>m.name===me);document.getElementById('goal').value=mine?.note?.split('|')[0]||'Cải thiện thể lực và duy trì sức khỏe';document.getElementById('availability').value='Thứ 2, 4, 6 — sau 18:00';document.getElementById('history').value=`${state.attendance.filter(a=>a.member===me).length||3} lượt điểm danh gần đây`;document.getElementById('noticeName').value=me||'Trần Quốc Huy';toast('Đã nạp dữ liệu tham khảo từ hệ thống')},
 viewAIPlan:()=>{const t=document.getElementById('aiPlan')?.textContent;if(!t)return toast('Chưa có kết quả lịch tập.');showAIResultModal('Chi tiết gợi ý lịch tập',t)},
 clearAIPlan:()=>{const b=document.getElementById('aiPlan');if(b){b.textContent='';b.style.display='none'}toast('Đã xoá kết quả lịch tập')},
 viewAISummary:()=>{const t=document.getElementById('aiSummary')?.textContent;if(!t)return toast('Chưa có tóm tắt tiến độ.');showAIResultModal('Chi tiết tóm tắt tiến độ',t)},
 clearAISummary:()=>{const b=document.getElementById('aiSummary');if(b){b.textContent='';b.style.display='none'}toast('Đã xoá kết quả tóm tắt')},
 viewAINotice:()=>{const t=document.getElementById('aiNotice')?.textContent;if(!t)return toast('Chưa có tin nhắn.');showAIResultModal('Chi tiết tin nhắn AI',t)},
 clearAINotice:()=>{const b=document.getElementById('aiNotice');if(b){b.textContent='';b.style.display='none'}toast('Đã xoá kết quả tin nhắn')},
 viewAIHistory:b=>showAIResultModal('Kết quả AI đã lưu',getAIResultText(b.dataset.id)||'Không tìm thấy kết quả.'),
 deleteAIHistory:b=>{const h=getAIHistory().filter(x=>x.id!==b.dataset.id);setAIHistory(h);toast('Đã xoá kết quả AI');render('ai')},
 clearAIHistory:()=>{openConfirmModal('Xoá lịch sử AI?','Toàn bộ kết quả AI đã lưu trên trình duyệt này sẽ bị xoá.',()=>{setAIHistory([]);closeModal();toast('Đã xoá lịch sử AI');render('ai')})}
};

restoreSession();
if(state.currentUser){mountApp();render('dashboard')}else{renderLogin()}
