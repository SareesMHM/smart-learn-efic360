// src/pages/chat/ChatPage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from '../../api/axios';
import { makeChatSocket } from '../../socket';

export default function ChatPage({ role /* 'Admin'|'Student'|'Teacher'|'Parent' */ }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUserIds, setTypingUserIds] = useState(new Set());
  const [onlineIds, setOnlineIds] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState({}); // { [conversationId]: count }
  const [newDmUserId, setNewDmUserId] = useState('');

  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const bottomRef = useRef(null);

  const me = useMemo(
    () => ({
      id: localStorage.getItem('userId'),
      role: localStorage.getItem('role') || role,
      name: localStorage.getItem('name') || 'Me',
    }),
    [role]
  );

  const authHeader = useCallback(
    () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    []
  );

  const scrollToBottom = useCallback(() => {
    // scroll after next paint
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      setError('');
      const { data } = await axios.get('/chat/conversations', authHeader());
      const list = data.conversations || [];
      setConversations(list);
      if (!activeId && list.length) setActiveId(list[0]._id);
    } catch (e) {
      console.error(e);
      setError('Failed to load conversations.');
    } finally {
      setLoadingConvs(false);
    }
  }, [activeId, authHeader]);

  const loadMessages = useCallback(
    async (conversationId) => {
      try {
        setLoadingMsgs(true);
        setError('');
        const { data } = await axios.get(`/chat/messages/${conversationId}`, authHeader());
        setMessages(data.messages || []);
        // mark read in UI and server
        setUnread((u) => ({ ...u, [conversationId]: 0 }));
        socketRef.current?.emit('chat:read', { conversationId });
        scrollToBottom();
      } catch (e) {
        console.error(e);
        setError('Failed to load messages.');
      } finally {
        setLoadingMsgs(false);
      }
    },
    [authHeader, scrollToBottom]
  );

  // initial conv load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // (re)load messages when active changes
  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    // also join this room (server usually auto-joins, but safe)
    socketRef.current?.emit('chat:join', { conversationId: activeId });
  }, [activeId, loadMessages]);

  // socket lifecycle
  useEffect(() => {
    const s = makeChatSocket();
    socketRef.current = s;

    s.on('connect_error', (err) => {
      console.warn('socket connect_error', err?.message);
    });

    s.on('presence:update', (userIds) => setOnlineIds(userIds || []));

    s.on('chat:message', (msg) => {
      // if current room, append; otherwise bump unread count
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else {
        setUnread((curr) => ({ ...curr, [msg.conversationId]: (curr[msg.conversationId] || 0) + 1 }));
      }
    });

    s.on('chat:typing', ({ conversationId, userId }) => {
      if (conversationId !== activeId || String(userId) === String(me.id)) return;
      setTypingUserIds((prev) => new Set(prev).add(String(userId)));
    });

    s.on('chat:stop_typing', ({ conversationId, userId }) => {
      if (conversationId !== activeId || String(userId) === String(me.id)) return;
      setTypingUserIds((prev) => {
        const n = new Set(prev);
        n.delete(String(userId));
        return n;
      });
    });

    return () => {
      try {
        s.removeAllListeners();
        s.disconnect();
      } catch {}
    };
  }, [activeId, me.id, scrollToBottom]);

  // typing indicator emit (debounced)
  const onInputChange = (v) => {
    setInput(v);
    if (!activeId) return;
    socketRef.current?.emit('chat:typing', { conversationId: activeId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('chat:stop_typing', { conversationId: activeId });
    }, 1000);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !activeId) return;
    // optimistic local echo (optional)
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      conversationId: activeId,
      text,
      attachments: [],
      createdAt: new Date().toISOString(),
      sender: { id: me.id, name: me.name, role: me.role },
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    socketRef.current?.emit('chat:message', { conversationId: activeId, text });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOnline = (userId) => onlineIds.includes(String(userId));

  const startNewDM = async () => {
    const target = newDmUserId.trim();
    if (!target) return;
    try {
      setError('');
      const body = { participantIds: [target], type: 'dm' }; // server adds me
      const { data } = await axios.post('/chat/conversations', body, authHeader());
      // refresh and jump in
      await loadConversations();
      setActiveId(data?.conversation?._id);
      setNewDmUserId('');
    } catch (e) {
      console.error(e);
      setError('Could not start DM. Check userId and permissions.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4 p-4">
      {/* Sidebar */}
      <aside className="col-span-4 border rounded p-3 overflow-auto h-[75vh]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{role} Chat</h3>
          <div className="flex items-center gap-2">
            <button onClick={loadConversations} className="text-sm underline">Refresh</button>
          </div>
        </div>

        {/* New DM */}
        <div className="flex gap-2 mb-3">
          <input
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="Start DM by userId..."
            value={newDmUserId}
            onChange={(e) => setNewDmUserId(e.target.value)}
          />
          <button className="px-2 py-1 border rounded text-sm" onClick={startNewDM}>
            New DM
          </button>
        </div>

        {loadingConvs ? (
          <p className="text-sm text-gray-500">Loading conversations…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <ul>
            {conversations.map((c) => {
              const count = unread[c._id] || 0;
              return (
                <li
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`p-2 rounded mb-2 cursor-pointer ${activeId === c._id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {c.title}
                      {count > 0 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-black text-white">
                          {count}
                        </span>
                      )}
                    </span>
                    <span className="text-xs">{c.type}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.participants.slice(0, 3).map((p) => (
                      <span key={p.userId} className="mr-2">
                        • {p.role}{' '}
                        <span title="online dot">{isOnline(p.userId) ? '🟢' : '⚪'}</span>
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
            {conversations.length === 0 && (
              <p className="text-sm text-gray-500">No conversations yet.</p>
            )}
          </ul>
        )}
      </aside>

      {/* Chat window */}
      <section className="col-span-8 border rounded flex flex-col h-[75vh]">
        {/* Messages */}
        <div className="flex-1 p-3 overflow-auto">
          {loadingMsgs && <p className="text-sm text-gray-500">Loading messages…</p>}
          {!loadingMsgs &&
            messages.map((m) => {
              const mine = String(m.sender?.id || m.senderId) === String(me.id);
              return (
                <div key={m._id} className={`mb-2 ${mine ? 'text-right' : ''}`}>
                  <div className="inline-block px-3 py-2 rounded-lg bg-gray-100 max-w-[80%]">
                    {!mine && (
                      <div className="text-[10px] text-gray-500 mb-0.5">
                        {m.sender?.name || 'User'} ({m.sender?.role || '—'})
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          {typingUserIds.size > 0 && (
            <div className="text-xs text-gray-500">Someone is typing…</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <textarea
            rows={1}
            className="flex-1 border rounded px-3 py-2 resize-none"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeId ? 'Type a message' : 'Select or create a conversation'}
            disabled={!activeId}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={!activeId || !input.trim()}
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
