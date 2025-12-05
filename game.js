// Simple 2D shooter optimized for Telegram Web App embedding.
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width, H = canvas.height;

// game state
let player = { x: W/2 - 20, y: H - 80, w: 40, h: 40, speed: 6 };
let bullets = [];
let enemies = [];
let lastSpawn = 0;
let score = 0;
let lives = 3;
let running = true;

// UI
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const fireBtn = document.getElementById('fireBtn');
const restartBtn = document.getElementById('restartBtn');
const shareBtn = document.getElementById('shareBtn');

function updateUI(){
  scoreEl.textContent = 'Score: ' + score;
  livesEl.textContent = 'Lives: ' + lives;
}

// Controls
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' '){ e.preventDefault(); shoot(); }});
window.addEventListener('keyup', e => { keys[e.key] = false; });

fireBtn.addEventListener('click', shoot);
restartBtn.addEventListener('click', restart);

// Telegram WebApp integration (if available)
let tg = null;
if (window.TelegramWebApp) {
  tg = window.TelegramWebApp;
  tg.expand(); // request more space in webview
  // optionally change back button, mainButton etc.
}

shareBtn.addEventListener('click', () => {
  const payload = { score, timestamp: Date.now() };
  // 1) If Telegram WebApp exists, sendData to bot (bot must handle it)
  if (tg && tg.sendData) {
    try {
      tg.sendData(JSON.stringify({type:'score', payload}));
      alert('Score sent to bot (bot must handle web_app_data).');
    } catch (e) {
      console.warn('sendData failed', e);
      fallbackShare(payload);
    }
  } else {
    // 2) Fallback: open a new window with prefilled message (user can copy-paste)
    fallbackShare(payload);
  }
});

function fallbackShare(payload) {
  const text = encodeURIComponent('My score: ' + payload.score + ' (Telegram Shooter)');
  const url = 'https://t.me/share/url?url=&text=' + text;
  window.open(url, '_blank');
}

function shoot(){
  bullets.push({ x: player.x + player.w/2 - 4, y: player.y, w: 8, h: 12, speed: 10 });
}

function spawnEnemy(){
  const size = 30 + Math.random()*30;
  enemies.push({
    x: Math.random() * (W - size),
    y: -size,
    w: size,
    h: size,
    speed: 1.5 + Math.random() * 2.5
  });
}

function rectIntersect(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update(dt){
  if (!running) return;

  // movement
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  // bullets
  for (let i = bullets.length -1; i >=0; i--){
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -20) bullets.splice(i,1);
  }

  // enemies
  for (let i = enemies.length -1; i >=0; i--){
    enemies[i].y += enemies[i].speed;
    if (enemies[i].y > H + 50) {
      enemies.splice(i,1);
      // optionally penalize
      lives -= 1;
      if (lives <= 0) gameOver();
    }
  }

  // collisions
  for (let i = enemies.length -1; i >=0; i--){
    let e = enemies[i];
    // player collide
    if (rectIntersect(e, player)){
      enemies.splice(i,1);
      lives -= 1;
      if (lives <= 0) gameOver();
      continue;
    }
    // bullets collide
    for (let j = bullets.length -1; j >=0; j--){
      if (rectIntersect(bullets[j], e)){
        bullets.splice(j,1);
        enemies.splice(i,1);
        score += 10;
        break;
      }
    }
  }

  // spawn logic
  lastSpawn += dt;
  if (lastSpawn > 700) {
    lastSpawn = 0;
    spawnEnemy();
  }

  updateUI();
}

function draw(){
  // background
  ctx.fillStyle = '#001';
  ctx.fillRect(0,0,W,H);

  // player
  ctx.fillStyle = '#36f';
  roundRect(ctx, player.x, player.y, player.w, player.h, 6, true, false);

  // bullets
  ctx.fillStyle = '#ff0';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  // enemies
  ctx.fillStyle = '#f33';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));

  // simple HUD (also in DOM)
}

function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if (typeof stroke === 'undefined'){ stroke = true; }
  if (typeof r === 'undefined'){ r = 5; }
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

let last = performance.now();
function loop(time){
  const dt = time - last;
  last = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function gameOver(){
  running = false;
  alert('Game Over. Score: ' + score);
  // save top score locally
  const best = Number(localStorage.getItem('tg_shooter_best') || 0);
  if (score > best) {
    localStorage.setItem('tg_shooter_best', score);
    alert('New personal best: ' + score);
  }
}

function restart(){
  bullets = [];
  enemies = [];
  score = 0;
  lives = 3;
  running = true;
  lastSpawn = 0;
  updateUI();
}

// start
updateUI();
requestAnimationFrame(loop);
