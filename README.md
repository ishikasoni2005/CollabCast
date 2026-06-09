# 🎙️ CollabCast — Real-Time Collaborative Platform

A **real-time collaboration platform** where developers and creators can find teammates, discuss ideas, and build projects together — powered by Django Channels, WebRTC, and Redis.

---

## ✨ Features

- JWT authentication with role-based access control
- Create and join collaboration rooms with real-time presence tracking
- Peer-to-peer audio and video communication via WebRTC
- Real-time messaging and live updates via WebSockets
- Multi-user collaboration with sub-100ms latency
- MySQL-backed session and room state persistence

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django, Django REST Framework |
| Real-Time | Django Channels, WebSockets, WebRTC |
| Channel Layer | Redis |
| Auth | JWT Authentication |
| Database | MySQL |

---

## 📂 Project Structure

```text
collabcast/
├── backend/
│   ├── collabcast/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── auth/          # JWT registration and login
│   │   ├── rooms/         # Room creation, join, state persistence
│   │   ├── slides/        # Slide management per room
│   │   └── messages/      # Real-time chat and message history
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Obtain JWT token |
| POST | `/api/rooms/create` | Create a new room |
| GET | `/api/rooms/{id}` | Get room details |
| GET | `/api/slides/{room_id}` | Get slides for room |
| GET | `/api/messages/{room_id}` | Get message history |

### WebSocket

```
ws://localhost:8000/ws/rooms/{room_id}/
```

Handles real-time room events: presence tracking, slide updates, live chat.

---

## ⚙️ Setup

```bash
cd collabcast/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

Start Redis (separate terminal):

```bash
redis-server
```

Start Django:

```bash
python manage.py runserver
```

Backend API: `http://localhost:8000`
WebSocket: `ws://localhost:8000`

---

## ✅ Verification

```bash
python manage.py check
python manage.py test
```
