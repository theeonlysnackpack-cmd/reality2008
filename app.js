/**
 * REALITY (2008) - Core Platform Engine
 */

class RealityApp {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('reality_user')) || null;
        this.posts = JSON.parse(localStorage.getItem('reality_posts')) || this.getDefaultPosts();
        this.communities = JSON.parse(localStorage.getItem('reality_communities')) || this.getDefaultCommunities();
        this.settings = JSON.parse(localStorage.getItem('reality_settings')) || {
            darkMode: false,
            primaryColor: '#00ff00',
            realityName: 'My Reality'
        };

        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.checkLogin();
        this.updateTheme();
        this.startClock();
    }

    setupDOM() {
        this.splash = document.getElementById('splash-screen');
        this.appShell = document.getElementById('app-shell');
        this.startBtn = document.getElementById('start-btn');
        this.usernameInput = document.getElementById('username-input');
        this.navItems = document.querySelectorAll('.nav-item');
        this.viewContainer = document.getElementById('view-container');
        this.spotlight = document.getElementById('spotlight-overlay');
        this.logoutBtn = document.getElementById('logout-btn');
        this.userDisplay = document.getElementById('current-user-display');
        
        // Modals
        this.passwordModal = document.getElementById('password-modal');
        this.adminPassInput = document.getElementById('admin-pass-input');
        this.modalSubmit = document.getElementById('modal-submit');
        this.modalCancel = document.getElementById('modal-cancel');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.login());
        this.logoutBtn.addEventListener('click', () => this.logout());

        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
                
                this.navItems.forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Spotlight movement
        window.addEventListener('mousemove', (e) => {
            if (this.settings.darkMode) {
                this.spotlight.style.background = `radial-gradient(circle 180px at ${e.clientX}px ${e.clientY}px, transparent 0%, rgba(0,0,0,0.98) 100%)`;
            }
        });

        // Password Modal
        this.modalSubmit.addEventListener('click', () => this.checkAdminPass());
        this.modalCancel.addEventListener('click', () => this.passwordModal.classList.add('hidden'));
    }

    checkLogin() {
        if (this.currentUser) {
            this.showApp();
            this.userDisplay.textContent = this.currentUser.name;
            this.switchView('feed');
        }
    }

    login() {
        const name = this.usernameInput.value.trim();
        if (!name) return alert('Enter a username');

        this.currentUser = {
            name: name,
            code: Math.floor(Math.random() * 900000 + 100000),
            joined: new Date().toISOString(),
            id: 'U-' + Date.now()
        };

        localStorage.setItem('reality_user', JSON.stringify(this.currentUser));
        this.userDisplay.textContent = name;
        this.showApp();
        this.switchView('feed');
    }

    logout() {
        localStorage.removeItem('reality_user');
        location.reload();
    }

    showApp() {
        this.splash.classList.add('hidden');
        this.appShell.classList.remove('hidden');
    }

    updateTheme() {
        document.body.className = this.settings.darkMode ? 'dark-mode' : 'light-mode';
        if (this.settings.darkMode) {
            this.spotlight.style.display = 'block';
        } else {
            this.spotlight.style.display = 'none';
        }
        
        // Apply primary color to accent
        document.documentElement.style.setProperty('--accent-color', this.settings.primaryColor);
    }

    switchView(view) {
        if (view === 'snackpack') {
            this.passwordModal.classList.remove('hidden');
            return;
        }

        this.renderView(view);
    }

    checkAdminPass() {
        if (this.adminPassInput.value === 'packers') {
            this.passwordModal.classList.add('hidden');
            this.adminPassInput.value = '';
            this.renderView('snackpack');
            // Update active nav
            this.navItems.forEach(i => {
                i.classList.toggle('active', i.dataset.view === 'snackpack');
            });
        } else {
            alert('WRONG PASSWORD');
            this.adminPassInput.value = '';
        }
    }

    renderView(view) {
        this.viewContainer.innerHTML = '';
        
        switch(view) {
            case 'feed': this.renderFeed(); break;
            case 'communities': this.renderCommunities(); break;
            case 'apps': this.renderAppsGrid(); break;
            case 'tv': this.renderTV(); break;
            case 'snackpack': this.renderSnackPack(); break;
            case 'profile': this.renderProfile(); break;
            case 'settings': this.renderSettings(); break;
        }
    }

    // --- VIEW RENDERERS ---

    renderFeed() {
        const container = document.createElement('div');
        container.className = 'feed-container';
        
        // Composer
        const composer = document.createElement('div');
        composer.className = 'post-composer';
        composer.innerHTML = `
            <textarea id="post-text" placeholder="Share your reality..."></textarea>
            <div class="composer-tools">
                <input type="text" id="post-music-url" placeholder="Music URL (Optional)">
                <input type="text" id="post-media-url" placeholder="Image/Video URL (Optional)">
                <button id="post-btn">POST</button>
            </div>
        `;
        container.appendChild(composer);

        // Posts
        const postsList = document.createElement('div');
        this.posts.slice().reverse().forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-header">
                    <span class="post-user-id">${post.author}</span>
                    <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div class="post-body">${post.content}</div>
                ${post.media ? `<div class="post-media">${post.media.endsWith('.mp4') ? `<video src="${post.media}" controls></video>` : `<img src="${post.media}">`}</div>` : ''}
                ${post.music ? `<div class="post-music">♫ ${post.music}</div>` : ''}
                <div class="comments-section">
                    ${post.comments.map(c => `<div class="comment-bubble">${c}</div>`).join('')}
                    <div class="add-comment">
                        <input type="text" class="comment-input" placeholder="Say something..." data-id="${post.id}">
                    </div>
                </div>
            `;
            postsList.appendChild(card);
        });
        container.appendChild(postsList);
        
        this.viewContainer.appendChild(container);

        // Events
        container.querySelector('#post-btn').onclick = () => this.addPost();
        container.querySelectorAll('.comment-input').forEach(input => {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') this.addComment(e.target.dataset.id, e.target.value);
            };
        });
    }

    renderAppsGrid() {
        const grid = document.createElement('div');
        grid.className = 'apps-grid';
        
        // Generate 50+ apps
        const appTypes = [
            {n: 'Snake', g: '🐍', fn: () => this.launchGame('snake')},
            {n: 'Tetris', g: '▦', fn: () => this.launchGame('tetris')},
            {n: 'Paint', g: '🖌', fn: () => this.launchGame('paint')},
            {n: 'Music Box', g: '📻', fn: () => this.launchGame('music')},
            {n: 'Calculator', g: '＝', fn: () => this.launchGame('calc')},
            {n: 'Calendar', g: '📅', fn: () => this.launchGame('cal')},
            {n: 'Text Edit', g: '📝', fn: () => this.launchGame('edit')},
            {n: 'Pong', g: '🏓', fn: () => this.launchGame('pong')},
            {n: 'Reality Draw', g: '✎', fn: () => this.launchGame('draw')},
            {n: 'Chat Room', g: '⌨', fn: () => this.launchGame('chat')},
        ];

        for(let i=0; i<60; i++) {
            const type = appTypes[i % appTypes.length];
            const app = document.createElement('div');
            app.className = 'app-icon';
            app.innerHTML = `<div class="app-icon-glyph">${type.g}</div><div class="app-icon-label">${type.n} ${i+1}</div>`;
            app.onclick = type.fn;
            grid.appendChild(app);
        }

        this.viewContainer.innerHTML = '<h1>REALITY APP STORE</h1><br>';
        this.viewContainer.appendChild(grid);
    }

    renderTV() {
        this.viewContainer.innerHTML = `
            <h1 class="glitch">TEMPLE TV</h1>
            <div class="tv-outer" style="border: 20px solid #222; border-radius: 40px; background: #111; padding: 20px; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
                <div class="tv-screen-container" style="position: relative; aspect-ratio: 16/9; background: #000; overflow: hidden; border-radius: 10px;">
                    <video id="tv-screen" style="width: 100%; height: 100%;" autoplay loop muted></video>
                    <div style="position: absolute; top: 10px; right: 20px; color: #0f0; font-family: monospace;">CH <span id="ch-num">01</span></div>
                </div>
                <div class="tv-controls" style="margin-top: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <button class="tv-btn" onclick="document.getElementById('tv-screen').src='https://www.w3schools.com/html/mov_bbb.mp4'; document.getElementById('ch-num').innerText='01'">01</button>
                    <button class="tv-btn" onclick="document.getElementById('tv-screen').src='https://www.w3schools.com/html/movie.mp4'; document.getElementById('ch-num').innerText='02'">02</button>
                    <button class="tv-btn" onclick="const url = prompt('Enter Video URL:'); if(url) { document.getElementById('tv-screen').src=url; document.getElementById('ch-num').innerText='USR'; }">UPLOAD</button>
                    <button class="tv-btn" onclick="document.getElementById('tv-screen').pause()">OFF</button>
                </div>
            </div>
            <style>
                .tv-btn { background: #333; color: #fff; border: none; padding: 10px; font-weight: bold; cursor: pointer; }
                .tv-btn:hover { background: #444; color: var(--accent-color); }
            </style>
        `;
    }

    renderProfile() {
        const u = this.currentUser;
        this.viewContainer.innerHTML = `
            <div class="profile-card" style="border: 2px solid var(--text-color); padding: 2rem; max-width: 400px; background: var(--bubble-bg);">
                <div class="profile-photo" style="width: 150px; height: 150px; background: #ddd; margin-bottom: 1rem; border: 1px solid var(--text-color);">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}" style="width: 100%">
                </div>
                <h2>${u.name}</h2>
                <p>USER CODE: #${u.code}</p>
                <p>JOINED: ${new Date(u.joined).toLocaleString()}</p>
                <hr style="margin: 1rem 0">
                <div class="stats">
                    <p>POSTS: ${this.posts.filter(p => p.author === u.name).length}</p>
                    <p>REALITY RANK: ROOKIE</p>
                </div>
            </div>
        `;
    }

    renderSettings() {
        this.viewContainer.innerHTML = `
            <h1>SETTINGS</h1>
            <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                <label>
                    <input type="checkbox" id="dark-mode-toggle" ${this.settings.darkMode ? 'checked' : ''}> DARK MODE (SPOTLIGHT)
                </label>
                <label>
                    PRIMARY COLOR: <input type="color" id="color-picker" value="${this.settings.primaryColor}">
                </label>
                <label>
                    REALITY NAME: <input type="text" id="reality-name" value="${this.settings.realityName}">
                </label>
                <button id="save-settings">SAVE CHANGES</button>
            </div>
        `;
        
        document.getElementById('save-settings').onclick = () => {
            this.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
            this.settings.primaryColor = document.getElementById('color-picker').value;
            this.settings.realityName = document.getElementById('reality-name').value;
            localStorage.setItem('reality_settings', JSON.stringify(this.settings));
            this.updateTheme();
            alert('Settings saved!');
        };
    }

    renderSnackPack() {
        this.viewContainer.innerHTML = `
            <h1 style="color: var(--y2k-pink)">ONLYSNACKPACK (ADMIN ONLY)</h1>
            <p>Welcome back, pack member.</p>
            <div class="admin-feed" style="margin-top: 2rem;">
                <div class="admin-post" style="border: 5px solid var(--y2k-pink); padding: 1rem; margin-bottom: 2rem;">
                    <h3>TOP SECRET VIDEO</h3>
                    <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls style="width: 100%"></video>
                </div>
            </div>
        `;
    }

    renderCommunities() {
        this.viewContainer.innerHTML = `
            <h1>COMMUNITIES</h1>
            <div class="community-actions" style="margin-bottom: 2rem;">
                <button id="create-comm-btn">CREATE NEW COMMUNITY</button>
            </div>
            <div class="communities-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                ${this.communities.map(c => `
                    <div class="comm-card" style="border: 2px solid ${c.color}; padding: 1rem; background: var(--bubble-bg);">
                        <h3>${c.name}</h3>
                        <p>${c.desc}</p>
                        <button style="background: ${c.color}">JOIN</button>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('create-comm-btn').onclick = () => {
            const name = prompt("Community Name?");
            if (name) {
                this.communities.push({
                    name: name,
                    desc: "A new reality pocket.",
                    color: "#" + Math.floor(Math.random()*16777215).toString(16),
                    members: 1
                });
                localStorage.setItem('reality_communities', JSON.stringify(this.communities));
                this.renderCommunities();
            }
        };
    }

    // --- LOGIC HELPERS ---

    addPost() {
        const textInput = document.getElementById('post-text');
        const text = textInput.value;
        const media = document.getElementById('post-media-url').value;
        const music = document.getElementById('post-music-url').value;
        
        // Emoji check
        const emojiRegex = /\p{Extended_Pictographic}/u;
        if (emojiRegex.test(text)) {
            alert("EMOJIS ARE FORBIDDEN IN THIS REALITY.");
            return;
        }

        if (!text) return;

        const newPost = {
            id: Date.now(),
            author: this.currentUser.name,
            content: text,
            media: media || null,
            music: music || null,
            date: new Date().toISOString(),
            comments: []
        };

        this.posts.push(newPost);
        localStorage.setItem('reality_posts', JSON.stringify(this.posts));
        this.renderFeed();
    }

    addComment(postId, comment) {
        const post = this.posts.find(p => p.id == postId);
        if (post) {
            post.comments.push(`${this.currentUser.name}: ${comment}`);
            localStorage.setItem('reality_posts', JSON.stringify(this.posts));
            this.renderFeed();
        }
    }

    launchGame(gameId) {
        const overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.innerHTML = `
            <div id="game-header">
                <span>REALITY OS / APPS / ${gameId.toUpperCase()}</span>
                <button onclick="this.parentElement.parentElement.remove()">CLOSE [X]</button>
            </div>
            <div id="game-canvas-container">
                <div id="game-content-wrapper" style="color: #0f0; font-family: monospace; text-align: center;">
                    <div id="game-canvas-target"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const target = overlay.querySelector('#game-canvas-target');

        if (gameId === 'snake') {
            this.startSnake(target);
        } else if (gameId === 'pong') {
            this.startPong(target);
        } else if (gameId === 'draw') {
            this.startDraw(target);
        } else {
            target.innerHTML = `
                <div style="padding: 20px; border: 2px solid #0f0;">
                    APP: ${gameId}<br>
                    STATUS: RUNNING<br>
                    MEMORY: STABLE<br><br>
                    [SYSTEM PLACEHOLDER]<br>
                    <button onclick="alert('Module loading...')">ACTIVATE MODULE</button>
                </div>
            `;
        }
    }

    startPong(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        canvas.style.border = '2px solid #fff';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let ball = { x: 300, y: 200, dx: 4, dy: 4, r: 10 };
        let p1 = { y: 150, h: 100, w: 10, score: 0 };
        let p2 = { y: 150, h: 100, w: 10, score: 0 };

        const loop = setInterval(() => {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall bounce
            if (ball.y <= 0 || ball.y >= 400) ball.dy *= -1;

            // Paddle bounce
            if (ball.x <= 20 && ball.y >= p1.y && ball.y <= p1.y + p1.h) ball.dx *= -1;
            if (ball.x >= 580 && ball.y >= p2.y && ball.y <= p2.y + p2.h) ball.dx *= -1;

            // AI for P2
            p2.y += (ball.y - (p2.y + 50)) * 0.1;

            // Scoring
            if (ball.x < 0) { p2.score++; ball.x = 300; ball.dx = 4; }
            if (ball.x > 600) { p1.score++; ball.x = 300; ball.dx = -4; }

            ctx.fillStyle = '#000';
            ctx.fillRect(0,0,600,400);
            ctx.fillStyle = '#fff';
            ctx.fillRect(10, p1.y, p1.w, p1.h);
            ctx.fillRect(580, p2.y, p2.w, p2.h);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
            ctx.fill();
            ctx.font = '20px monospace';
            ctx.fillText(`${p1.score} | ${p2.score}`, 280, 30);
        }, 1000/60);

        window.onmousemove = (e) => {
            p1.y = e.clientY - 200;
        };

        const cleanup = () => clearInterval(loop);
        container.closest('#game-overlay').querySelector('button').addEventListener('click', cleanup);
    }

    startDraw(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.background = '#fff';
        canvas.style.cursor = 'crosshair';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let drawing = false;

        canvas.onmousedown = () => drawing = true;
        canvas.onmouseup = () => { drawing = false; ctx.beginPath(); };
        canvas.onmousemove = (e) => {
            if (!drawing) return;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        };
    }

    startSnake(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.border = '2px solid #0f0';
        container.innerHTML = '';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        
        let snake = [{x: 200, y: 200}];
        let food = {x: 0, y: 0};
        let dx = 20;
        let dy = 0;
        
        const resetFood = () => {
            food.x = Math.floor(Math.random() * 20) * 20;
            food.y = Math.floor(Math.random() * 20) * 20;
        };
        resetFood();

        const loop = setInterval(() => {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                resetFood();
            } else {
                snake.pop();
            }

            // Boundaries
            if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
                clearInterval(loop);
                alert('GAME OVER');
                container.parentElement.parentElement.parentElement.remove();
            }

            ctx.fillStyle = '#000';
            ctx.fillRect(0,0,400,400);
            ctx.fillStyle = '#0f0';
            snake.forEach(p => ctx.fillRect(p.x, p.y, 18, 18));
            ctx.fillStyle = '#f00';
            ctx.fillRect(food.x, food.y, 18, 18);
        }, 100);

        window.onkeydown = (e) => {
            if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -20; }
            if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 20; }
            if (e.key === 'ArrowLeft' && dx === 0) { dx = -20; dy = 0; }
            if (e.key === 'ArrowRight' && dx === 0) { dx = 20; dy = 0; }
        };
    }

    getDefaultPosts() {
        return [
            {
                id: 1,
                author: 'RealityAdmin',
                content: 'Welcome to Reality(2008). No emojis allowed here.',
                date: new Date('2008-01-01').toISOString(),
                comments: ['Cool!', 'Finally a place without fake people.'],
                media: null,
                music: 'Vaporwave Dreams'
            }
        ];
    }

    getDefaultCommunities() {
        return [
            { name: 'Gamerz', desc: 'Old school play.', color: '#007bff' },
            { name: 'Music Makers', desc: 'Upload your own beats.', color: '#ff00ff' },
            { name: 'Void', desc: 'Minimalist thoughts.', color: '#ffffff' }
        ];
    }

    startClock() {
        setInterval(() => {
            // Can be used for UI updates
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Reality = new RealityApp();
});
