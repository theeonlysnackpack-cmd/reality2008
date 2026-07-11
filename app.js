
class RealityKernel {
    constructor() {
        this.session = JSON.parse(localStorage.getItem('R_SYS_SESSION')) || null;
        this.db = {
            posts: JSON.parse(localStorage.getItem('R_SYS_POSTS')) || this.loadSeedData(),
            windows: new Map(),
            following: new Set(JSON.parse(localStorage.getItem('R_SYS_FOLLOW')) || [])
        };
        
        this.config = {
            accent: '#00d2ff',
            darkMode: true,
            storageLimit: 1024 * 1024 * 5
        };

        this.pendingData = null;
        this.boot();
    }

    async boot() {
        const log = document.getElementById('boot-log');
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        await delay(600); log.innerText = "LOADING SECURITY PROTOCOLS...";
        await delay(500); log.innerText = "MOUNTING VIRTUAL DISK...";
        await delay(700); log.innerText = "ESTABLISHING REALITY-LINK...";
        
        document.getElementById('kernel-loader').classList.add('hidden');
        this.initDOM();
        this.attachListeners();
        
        if (this.session) {
            this.unlockInterface();
        }
    }

    initDOM() {
        this.workspace = document.getElementById('view-layer');
        this.windowLayer = document.getElementById('window-layer');
        this.userDisplay = document.getElementById('display-name');
        this.clock = document.getElementById('os-clock');
        
        setInterval(() => {
            const now = new Date();
            this.clock.innerText = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
        }, 1000);
    }

    attachListeners() {
        document.getElementById('start-btn').onclick = () => this.authenticate();
        document.getElementById('shutdown-btn').onclick = () => this.shutdown();
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                const view = btn.dataset.view;
                this.navigate(view);
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });

        // Admin Auth
        document.getElementById('admin-unlock').onclick = () => {
            if (document.getElementById('admin-pass').value === 'packers') {
                document.getElementById('admin-gate').classList.add('hidden');
                document.getElementById('admin-pass').value = '';
                this.renderSnackPack();
            } else alert("INVALID CREDENTIALS");
        };
        
        document.getElementById('admin-cancel').onclick = () => {
            document.getElementById('admin-gate').classList.add('hidden');
        };

        // File Mounting Logic
        document.addEventListener('change', (e) => {
            if (e.target.id === 'f-up') {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.pendingData = event.target.result;
                    document.getElementById('f-name').innerText = `[ ${file.name} MOUNTED ]`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    authenticate() {
        const name = document.getElementById('username-input').value.trim();
        if (!name) return;
        
        this.session = {
            user: this.sanitize(name),
            uid: 'R-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            joined: new Date().toISOString()
        };
        
        localStorage.setItem('R_SYS_SESSION', JSON.stringify(this.session));
        this.unlockInterface();
    }

    unlockInterface() {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('os-interface').classList.remove('hidden');
        this.userDisplay.innerText = this.session.user;
        this.navigate('feed');
    }

    shutdown() {
        localStorage.clear();
        location.reload();
    }

    navigate(view) {
        if (view === 'snackpack') {
            document.getElementById('admin-gate').classList.remove('hidden');
            return;
        }
        
        this.workspace.innerHTML = '';
        switch(view) {
            case 'feed': this.renderFeed(); break;
            case 'apps': this.renderAppStation(); break;
            case 'profile': this.renderProfile(); break;
            case 'tv': this.renderTV(); break;
            case 'settings': this.renderSettings(); break;
            case 'communities': this.renderCommunities(); break;
        }
    }

    // --- CORE RENDERERS ---

    renderFeed() {
        this.workspace.innerHTML = `
            <div class="feed-container">
                <div class="composer-aero glass-morph" style="padding:25px; margin-bottom:30px;">
                    <textarea id="p-content" placeholder="Broadcast a thought... (No emojis allowed)" style="width:100%; height:80px; background:rgba(0,0,0,0.3); border:1px solid var(--accent); color:#fff; padding:15px; border-radius:10px; resize:none;"></textarea>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                        <div class="upload-zone">
                            <label for="f-up" class="aero-btn" style="background:#333; font-size:0.7rem;">MOUNT DATA</label>
                            <input type="file" id="f-up" style="display:none">
                            <span id="f-name" style="font-size:10px; margin-left:10px; color:var(--accent)"></span>
                        </div>
                        <button class="aero-btn" onclick="Reality.broadcast()">BROADCAST</button>
                    </div>
                </div>
                <div id="os-feed-list"></div>
            </div>
        `;
        this.updateFeedList();
    }

    updateFeedList() {
        const list = document.getElementById('os-feed-list');
        list.innerHTML = '';
        this.db.posts.slice().reverse().forEach(post => {
            const div = document.createElement('div');
            div.className = 'feed-post glass-morph';
            div.innerHTML = `
                <div class="post-meta" style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span style="font-weight:bold; color:var(--accent)">${this.sanitize(post.author)}</span>
                    <span style="font-size:10px; opacity:0.6">${new Date(post.date).toLocaleString()}</span>
                </div>
                <div class="post-body" style="font-size:1rem; line-height:1.6;">${this.sanitize(post.content)}</div>
                ${post.data ? `<div class="post-attachment" style="margin-top:15px;"><img src="${post.data}" style="max-width:100%; border:2px solid var(--accent); border-radius:8px;"></div>` : ''}
                <div class="comment-layer" style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.05); padding-top:15px;">
                    ${post.comments.map(c => `<div class="bubble-comment">${this.sanitize(c)}</div>`).join('')}
                    <input type="text" placeholder="Add reply..." style="width:100%; margin-top:12px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px; border-radius:5px;" onkeypress="if(event.key==='Enter') Reality.addComment(${post.id}, this.value)">
                </div>
            `;
            list.appendChild(div);
        });
    }

    broadcast() {
        const content = document.getElementById('p-content').value;
        if (!content) return;
        
        // Anti-Emoji Security
        if (/\p{Extended_Pictographic}/u.test(content)) {
            alert("SECURITY ALERT: UNKNOWN CHARACTER SET DETECTED. BROADCAST ABORTED.");
            return;
        }

        const post = {
            id: Date.now(),
            author: this.session.user,
            content: content,
            date: new Date().toISOString(),
            data: this.pendingData || null,
            comments: []
        };

        this.db.posts.push(post);
        this.saveDB();
        this.pendingData = null;
        this.renderFeed();
    }

    addComment(id, val) {
        if (!val) return;
        const p = this.db.posts.find(x => x.id === id);
        p.comments.push(`${this.session.user}: ${val}`);
        this.saveDB();
        this.updateFeedList();
    }

    // --- 3D GAME ENGINE ---

    launchGame() {
        this.openWindow('VOID RUNNER 3D', '<canvas id="game-canvas"></canvas><div id="score-ui">VELOCITY: 0 KM/H</div>', 800);
        this.init3DGame();
    }

    init3DGame() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let speed = 2;
        let pos = 0;
        
        const loop = () => {
            if (!document.getElementById('game-canvas')) return;
            speed += 0.005;
            pos += speed;
            
            ctx.fillStyle = '#000';
            ctx.fillRect(0,0, canvas.width, canvas.height);
            
            ctx.strokeStyle = this.config.accent;
            ctx.lineWidth = 2;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            
            for (let i = 0; i < 15; i++) {
                let z = ((i * 100 - pos) % 1500 + 1500) % 1500;
                let scale = 600 / (z + 1);
                if (scale < 0) continue;
                
                let size = 150 * scale;
                ctx.globalAlpha = 1 - (z / 1500);
                ctx.strokeRect(cx - size/2, cy - size/2, size, size);
                
                // Draw connecting lines
                ctx.beginPath();
                ctx.moveTo(cx - size/2, cy - size/2);
                ctx.lineTo(cx, cy);
                ctx.stroke();
            }
            
            document.getElementById('score-ui').innerText = `VELOCITY: ${Math.floor(speed * 20)} KM/H`;
            requestAnimationFrame(loop);
        };
        loop();
    }

    // --- UI HELPERS ---

    openWindow(title, html, width = 500) {
        const id = 'win_' + Date.now();
        const win = document.createElement('div');
        win.className = 'window-3d glass-morph';
        win.id = id;
        win.style.width = width + 'px';
        win.style.left = '100px';
        win.style.top = '100px';
        win.style.zIndex = 2000;
        
        win.innerHTML = `
            <div class="window-header">
                <span>${title}</span>
                <button onclick="document.getElementById('${id}').remove()" style="background:var(--y2k-pink); border:none; color:white; width:22px; height:22px; cursor:pointer; font-weight:bold;">X</button>
            </div>
            <div class="window-content">${html}</div>
        `;
        
        this.windowLayer.appendChild(win);
        this.makeDraggable(win);
    }

    makeDraggable(el) {
        let p1=0, p2=0, p3=0, p4=0;
        const header = el.querySelector('.window-header');
        header.onmousedown = (e) => {
            p3 = e.clientX; p4 = e.clientY;
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                el.style.transform = `rotateY(0deg) rotateX(0deg)`;
            };
            document.onmousemove = (e) => {
                p1 = p3 - e.clientX; p2 = p4 - e.clientY;
                p3 = e.clientX; p4 = e.clientY;
                el.style.top = (el.offsetTop - p2) + "px";
                el.style.left = (el.offsetLeft - p1) + "px";
                // 3D Tilt Effect
                el.style.transform = `rotateY(${p1 * 0.8}deg) rotateX(${p2 * -0.8}deg)`;
            };
        };
    }

    renderAppStation() {
        this.workspace.innerHTML = `
            <h1 class="aero-text">SYSTEM_APPS</h1>
            <div class="apps-grid" id="agrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap:25px; margin-top:30px;"></div>
        `;
        const apps = [
            {n:'VOID_RUNNER', i:'🚀', fn:()=>this.launchGame()},
            {n:'TERMINAL', i:'⌨', fn:()=>this.openWindow('CMD_ROOT', '<div style="background:#000; color:#0f0; padding:15px; font-family:monospace; height:200px;">SYSTEM_ACCESS_GRANTED...<br>ROOT@REALITY:~#</div>')},
            {n:'PLAYER', i:'📻', fn:()=>this.openWindow('REALITY_FM', '<audio controls src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" style="width:100%"></audio>')},
            {n:'VAULT', i:'💎', fn:()=>this.openWindow('SECURE_VAULT', '<p style="padding:20px;">All sensitive data encrypted.</p>')},
            {n:'SKETCH', i:'🎨', fn:()=>this.openWindow('AERO_PAINT', '<canvas style="background:#fff; width:100%; height:300px;"></canvas>')},
        ];
        
        const grid = document.getElementById('agrid');
        for(let i=0; i<60; i++){
            const a = apps[i % apps.length];
            const d = document.createElement('div');
            d.className = 'glass-morph';
            d.style.padding = '20px';
            d.style.textAlign = 'center';
            d.style.cursor = 'pointer';
            d.innerHTML = `<div style="font-size:2.2rem;">${a.i}</div><div style="font-size:0.65rem; font-weight:bold; margin-top:8px;">${a.n}</div>`;
            d.onclick = a.fn;
            grid.appendChild(d);
        }
    }

    renderTV() {
        this.workspace.innerHTML = `
            <h1 class="aero-text">REALITY_TV</h1>
            <div class="glass-morph" style="padding:20px; margin-top:30px;">
                <video id="tv-v" style="width:100%; border:1px solid var(--accent);" autoplay loop src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button class="aero-btn" onclick="document.getElementById('tv-v').src='https://www.w3schools.com/html/mov_bbb.mp4'">CH 01</button>
                    <button class="aero-btn" onclick="document.getElementById('tv-v').src='https://www.w3schools.com/html/movie.mp4'">CH 02</button>
                </div>
            </div>
        `;
    }

    renderProfile() {
        const u = this.session;
        this.workspace.innerHTML = `
            <div class="glass-morph" style="padding:40px; max-width:400px; text-align:center;">
                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.user}" style="width:120px; border:3px solid var(--accent); margin-bottom:20px;">
                <h2 class="aero-text">${u.user}</h2>
                <p style="opacity:0.6; font-size:0.8rem;">ID: ${u.uid}</p>
                <p style="margin-top:20px;">JOINED: ${new Date(u.joined).toLocaleDateString()}</p>
            </div>
        `;
    }

    renderSnackPack() {
        this.workspace.innerHTML = `
            <div class="glass-morph" style="padding:40px; border:2px solid var(--y2k-pink);">
                <h1 style="color:var(--y2k-pink)" class="aero-text">ONLYSNACKPACK</h1>
                <p>Welcome back, Admin. System is stable.</p>
                <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6bnFqdGZqZndqZndqZndqZndqZndqZndqZndqZndqZndqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKDkDbIDJieKbVm/giphy.gif" style="width:100%; margin-top:20px; border-radius:10px;">
            </div>
        `;
    }

    renderSettings() {
        this.workspace.innerHTML = `
            <div class="glass-morph" style="padding:30px;">
                <h1 class="aero-text">SYSTEM_CONFIG</h1>
                <div style="margin-top:30px; display:flex; flex-direction:column; gap:20px;">
                    <label><input type="checkbox" checked> DARK_MODE SPOTLIGHT ACTIVE</label>
                    <label>THEME_ACCENT: <input type="color" value="${this.config.accent}"></label>
                    <button class="aero-btn" onclick="alert('Kernel Config Updated')">COMMIT CHANGES</button>
                </div>
            </div>
        `;
    }

    renderCommunities() {
        this.workspace.innerHTML = `
            <h1 class="aero-text">REALITY_POCKETS</h1>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-top:30px;">
                <div class="glass-morph" style="padding:20px; border-top:5px solid var(--accent)"><h3>VOID</h3><p>Minimalist thoughts.</p></div>
                <div class="glass-morph" style="padding:20px; border-top:5px solid var(--y2k-pink)"><h3>NEON</h3><p>High velocity chat.</p></div>
                <div class="glass-morph" style="padding:20px; border-top:5px solid #fff; border-style:dashed;"><h3>+ NEW</h3></div>
            </div>
        `;
    }

    // --- SECURITY ---

    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    saveDB() {
        localStorage.setItem('R_SYS_POSTS', JSON.stringify(this.db.posts));
    }

    loadSeedData() {
        return [{ id: 1, author: 'REALITY_KERNEL', content: 'SYSTEM ONLINE. Welcome to Reality OS v4.0.0.', date: new Date().toISOString(), comments: ["STABLE BUILD."] }];
    }
}

window.Reality = new RealityKernel();
