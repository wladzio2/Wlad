/**
 * Пример простого сервера для приёма очков от клиента и отправки их в Bot API.
 * Нужно:
 * - Node.js
 * - npm i express node-fetch
 *
 * Запуск: node server_example.js
 *
 * Конфигурация: установи переменные окружения BOT_TOKEN
 */
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json({limit: '50mb'}));

const BOT_TOKEN = process.env.BOT_TOKEN || '<PUT_YOUR_BOT_TOKEN>';
// helper to call Bot API
async function api(method, body){
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  return res.json();
}

// client posts { user_id, score }
app.post('/submit-score', async (req, res) => {
  const { user_id, score } = req.body;
  if (!user_id || typeof score !== 'number') return res.status(400).json({error:'missing'});
  try {
    // setGameScore requires chat_id? For inline games it requires user_id and score and force=true
    const r = await api('setGameScore', { user_id: user_id, score: score, force: true });
    res.json(r);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server on', PORT));
