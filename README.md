# CollabCast
A real-time collaborative presentation platform built with React, Django, and WebRTC.

## Features

- User authentication with JWT
- Create and join presentation rooms
- Real-time collaborative slide editing
- Live chat in rooms
- WebRTC video/audio communication
- Presentation mode

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Zustand for state management
- WebRTC for peer-to-peer communication
- WebSockets for real-time updates

### Backend
- Django with Django REST Framework
- Django Channels for WebSockets
- PostgreSQL database
- Redis for WebSocket message broker
- JWT authentication

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Redis

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd collabcast/backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up PostgreSQL database:
   - Create database named 'collabcast'
   - Update database credentials in `collabcast/settings.py`

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start Redis server (in another terminal):
   ```bash
   redis-server
   ```

7. Start Django server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd collabcast/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Usage

1. Open browser to `http://localhost:5173` (frontend)
2. Register a new account or login
3. Create a new room or join existing one
4. Start collaborating on slides and communicating via chat/video

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/rooms/create` - Create room
- `GET /api/rooms/{id}` - Get room details
- `GET /api/slides/{room_id}` - Get slides for room
- `GET /api/messages/{room_id}` - Get messages for room

## WebSocket Routes

- `ws://localhost:8000/ws/rooms/{room_id}/` - Room WebSocket for real-time updates

## Development

- Frontend runs on `http://localhost:5173`
- Backend API on `http://localhost:8000`
- WebSocket on `ws://localhost:8000`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request
