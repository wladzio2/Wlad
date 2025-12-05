Telegram Shooter - HTML5 Mini Game
==================================

Что внутри:
- index.html — игра (HTML5)
- style.css — стили
- game.js — игровая логика
- server_example.js — (опционально) пример серверного обработчика для приёма очков и вызова Bot API
- README.md — это

Как разместить игру и подключить к боту:

1) Хостинг
   - Размести файлы на HTTPS-хостинге (GitHub Pages, Netlify, Vercel, любой HTTPS сервер).
   - URL должен быть доступен по HTTPS, например https://yourdomain.com/telegram_shooter/

2) Настройка бота (BotFather)
   - Создай бота через @BotFather и сохрани токен.
   - В BotFather используй команду /setdomain? (old) OR /setgame? 
     (В большинстве случаев для Web Apps: отправь пользователям кнопку с type 'web_app' или используйте InlineKeyboardButton с web_app)

3) Открытие игры из бота
   - Самый простой способ — отправить пользователю клавиатуру с кнопкой Web App:
     In your bot code, send a message with reply_markup:
     {
       "inline_keyboard":[[
         {"text":"Play Shooter","web_app":{"url":"https://yourdomain.com/telegram_shooter/"}}
       ]]
     }

   - Когда пользователь откроет веб-приложение, Telegram предоставит объект window.TelegramWebApp в JS.

4) Отправка очков боту
   - Клиент (game.js) использует TelegramWebApp.sendData(JSON) чтобы отправить данные боту.
   - Бот получит эти данные в поле update.web_app_data.data. Боту необходимо вызвать методы Bot API (например, setGameScore) с токеном и user_id.
   - В реальном проекте безопаснее: клиент отправляет score на твой сервер, сервер вызывает Bot API setGameScore/sendMessage и т.д.

5) Пример серверного обработчика (Node.js) — server_example.js

   (см файл server_example.js в архиве)

Примечание:
- Если ты не хочешь заводить сервер/бота, игра отлично работает автономно и хранит локальный рекорд в localStorage.
- Для официальной "Game" интеграции (leaderboards) потребуется использование методов Bot API и game_short_name (BotFather) — это более сложный путь, но возможен.

Если хочешь, я:
- помогу развернуть игру на GitHub Pages (подготовлю репозиторий),
- подготовлю пример бота на Node.js, который принимает web_app_data и вызывает setGameScore,
- добавлю таблицу рекордов (через софтверный сервер) — скажи, что предпочтёшь.
