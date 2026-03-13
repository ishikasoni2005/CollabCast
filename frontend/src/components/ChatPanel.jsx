import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { getStoredAccessToken, useAuthStore, useRoomStore } from '../store';
import { wsManager } from '../websocket';

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const hasRenderedMessagesRef = useRef(false);
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const currentUser = useAuthStore((state) => state.user?.username);

  const formatMessage = (message) => ({
    id: message.id,
    user: message.user,
    content: message.content,
    timestamp: new Date(message.timestamp),
  });

  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      setMessages([]);
      setError('Login required to load messages.');
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await api.messages.get(currentRoom, token);
        if (!isCancelled) {
          setMessages(response.results.map(formatMessage));
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load messages.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [currentRoom]);

  useEffect(() => {
    const handler = (data) => {
      const incomingMessage = formatMessage(data.message);
      setMessages((previousMessages) => {
        if (previousMessages.some((message) => message.id === incomingMessage.id)) {
          return previousMessages;
        }

        return [...previousMessages, incomingMessage];
      });
    };
    wsManager.on('chat_message', handler);

    return () => {
      wsManager.off('chat_message', handler);
    };
  }, []);

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    messagesEndRef.current.scrollIntoView({
      behavior: hasRenderedMessagesRef.current ? 'smooth' : 'auto',
      block: 'end',
    });

    hasRenderedMessagesRef.current = true;
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    if (!currentRoom) {
      setError('Join a room to send messages.');
      return;
    }

    setError('');
    wsManager.send('chat_message', { content: newMessage.trim() });
    setNewMessage('');
  };

  const statusMessage = useMemo(() => {
    if (isLoading) {
      return 'Loading messages...';
    }

    if (error) {
      return error;
    }

    if (messages.length === 0) {
      return 'No messages yet. Say hi to get the conversation started.';
    }

    return null;
  }, [error, isLoading, messages.length]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {statusMessage ? <p className="text-sm text-gray-500">{statusMessage}</p> : null}
        {messages.map((msg) => (
          <div key={msg.id} className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-900">
                {msg.user === currentUser ? 'You' : msg.user}
              </span>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
