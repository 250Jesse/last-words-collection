// 引入Firebase（对接云数据库，不用改这行）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
// 存储数据的数组
let messages = [
    {
        id: 1,
        content: "生命中最珍贵的不是我们拥有的物质，而是我们爱过的人和经历过的时光。",
        age: 78,
        location: "北京",
        gender: "男",
        contact: "",
        time: "2023-05-10 14:30"
    },
    {
        id: 2,
        content: "给我的孩子们：勇敢去生活，去爱，去犯错，去成长。妈妈永远在你们心中。",
        age: 62,
        location: "上海",
        gender: "女",
        contact: "mother@example.com",
        time: "2023-05-12 09:15"
    },
    {
        id: 3,
        content: "这一生，我没有遗憾。感谢所有陪伴过我的人，再见了。",
        age: 85,
        location: "广州",
        gender: "男",
        contact: "",
        time: "2023-05-15 16:45"
    }
];
// 你的Firebase配置（下面5行要替换成你自己的！）
const firebaseConfig = {
  apiKey: "AIzaSyDI2kk0WVlBKTk363ULqhU1CbR6FP58Czk",
  authDomain: "lastwordcollection.firebaseapp.com",
  databaseURL: "https://lastwordcollection-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lastwordcollection",
  storageBucket: "lastwordcollection.firebasestorage.app",
  messagingSenderId: "664862882202",
  appId: "1:664862882202:web:450e638eda0fd72189a223"
};

// 初始化Firebase（不用改这2行）
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'lastWords'); // 留言存在lastWords节点下（重点！之前是messages，现在改lastWords）
// 管理员账号密码（默认账号：cc，密码：cc915504218）
let admin = {
    username: "cc",
    password: "cc915504218"
};

// DOM元素
const mainButton = document.getElementById('main-button');
const messageModal = document.getElementById('message-modal');
const closeModal = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const messageForm = document.getElementById('message-form');
const messageContainer = document.getElementById('message-container');
const adminEntrance = document.getElementById('admin-entrance');
const adminLoginModal = document.getElementById('admin-login-modal');
const closeLogin = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');
const adminPanel = document.getElementById('admin-panel');
const logoutBtn = document.getElementById('logout-btn');
const adminMessages = document.getElementById('admin-messages');
const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordModal = document.getElementById('change-password-modal');
const closeChangePassword = document.getElementById('close-change-password');
const changePasswordForm = document.getElementById('change-password-form');

// 打开留言表单
mainButton.addEventListener('click', () => {
    messageModal.classList.remove('hidden');
});

// 关闭留言表单
function closeMessageModal() {
    messageModal.classList.add('hidden');
}

closeModal.addEventListener('click', closeMessageModal);
cancelBtn.addEventListener('click', closeMessageModal);

// 保存草稿（本地存储）
saveBtn.addEventListener('click', () => {
    const message = document.getElementById('message').value;
    const age = document.getElementById('age').value;
    const location = document.getElementById('location').value;
    const gender = document.getElementById('gender').value;
    const contact = document.getElementById('contact').value;
    
    const draft = { message, age, location, gender, contact };
    localStorage.setItem('messageDraft', JSON.stringify(draft));
    
    alert('草稿已保存');
});

// 加载草稿
// 页面加载时读取草稿和云数据库留言（不用改）
window.addEventListener('load', () => {
    // 读取本地草稿（和之前一样，不用管）
    const draft = localStorage.getItem('messageDraft');
    if (draft) {
        const { message, age, location, gender, contact } = JSON.parse(draft);
        document.getElementById('message').value = message;
        document.getElementById('age').value = age;
        document.getElementById('location').value = location;
        document.getElementById('gender').value = gender;
        document.getElementById('contact').value = contact;
    }
    
    // 从云数据库获取留言（新功能，不用改）
    onValue(messagesRef, (snapshot) => {
        const data = snapshot.val() || {}; // 读取云端数据
        messages = Object.values(data).reverse(); // 转成数组，最新的留言在前面
        renderMessages(); // 刷新用户端留言列表
        renderAdminMessages(); // 刷新管理员端留言列表
    });
});

// 提交留言（保存到云数据库，新代码不用改）
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 阻止表单默认提交（不用改）
    
    // 收集表单数据（和之前一样，不用改）
    const message = document.getElementById('message').value;
    const age = document.getElementById('age').value;
    const location = document.getElementById('location').value;
    const gender = document.getElementById('gender').value;
    const contact = document.getElementById('contact').value;
    
    // 创建新留言对象（和之前一样，不用改）
    const newMessage = {
        id: Date.now(), // 用时间戳当唯一ID，避免重复（比之前更稳定）
        content: message,
        age: age || '',
        location: location || '',
        gender: gender || '',
        contact: contact || '',
        time: new Date().toLocaleString() // 当前时间
    };
    
    // 保存到云数据库（核心新功能，不用改）
    await push(messagesRef, newMessage); // 把留言推送到云端
    
    // 清空表单和草稿（和之前一样，不用改）
    messageForm.reset();
    localStorage.removeItem('messageDraft');
    
    // 关闭弹窗（和之前一样，不用改）
    closeMessageModal();
    
    // 提示提交成功（和之前一样，不用改）
    alert('感谢您的留言，我们会永远记得！');
});
// 渲染用户端留言列表
function renderMessages() {
    messageContainer.innerHTML = '';
    
    // 只显示最近5条
    const recentMessages = messages.slice(0, 5);
    
    recentMessages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'bg-white p-4 rounded-lg shadow-sm';
        
        let infoHtml = '';
        if (msg.age || msg.location || msg.gender) {
            infoHtml = `<div class="mt-2 text-xs text-gray-500">`;
            if (msg.age) infoHtml += `<span>年龄：${msg.age}</span> · `;
            if (msg.location) infoHtml += `<span>地域：${msg.location}</span> · `;
            if (msg.gender) infoHtml += `<span>性别：${msg.gender}</span>`;
            infoHtml += `</div>`;
        }
        
        messageElement.innerHTML = `
            <p class="text-gray-700 italic">"${msg.content}"</p>
            ${infoHtml}
        `;
        
        messageContainer.appendChild(messageElement);
    });
}

// 打开管理员登录
adminEntrance.addEventListener('click', () => {
    adminLoginModal.classList.remove('hidden');
});

// 关闭管理员登录
closeLogin.addEventListener('click', () => {
    adminLoginModal.classList.add('hidden');
});

// 管理员登录
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === admin.username && password === admin.password) {
        adminLoginModal.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loginForm.reset();
    } else {
        alert('账号或密码错误');
    }
});

// 退出登录
logoutBtn.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
});

// 渲染管理员端留言列表
function renderAdminMessages() {
    adminMessages.innerHTML = '';
    
    messages.forEach(msg => {
        const row = document.createElement('tr');
        row.className = msg.id % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        
        row.innerHTML = `
            <td class="py-3 px-4">${msg.id}</td>
            <td class="py-3 px-4 max-w-xs truncate">${msg.content}</td>
            <td class="py-3 px-4">${msg.age || '-'}</td>
            <td class="py-3 px-4">${msg.location || '-'}</td>
            <td class="py-3 px-4">${msg.gender || '-'}</td>
            <td class="py-3 px-4">${msg.contact || '-'}</td>
            <td class="py-3 px-4 text-sm text-gray-500">${msg.time}</td>
        `;
        
        adminMessages.appendChild(row);
    });
}

// 打开修改密码弹窗
changePasswordBtn.addEventListener('click', () => {
    changePasswordModal.classList.remove('hidden');
});

// 关闭修改密码弹窗
closeChangePassword.addEventListener('click', () => {
    changePasswordModal.classList.add('hidden');
});

// 修改密码
changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (oldPassword !== admin.password) {
        alert('原密码错误');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('两次输入的新密码不一致');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('密码长度不能少于6位');
        return;
    }
    
    admin.password = newPassword;
    changePasswordModal.classList.add('hidden');
    changePasswordForm.reset();
    alert('密码修改成功，请重新登录');
    adminPanel.classList.add('hidden');
});