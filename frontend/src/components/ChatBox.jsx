import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

const SUGGESTIONS = [
  '¿Cuántas incidencias hay pendientes?',
  '¿Qué aula tiene más incidencias?',
  '¿Cuántos dispositivos están averiados?',
  '¿Qué tickets llevan más de 3 días sin resolver?',
  'Lista los proyectores en reparación',
];

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente TIC. Puedo consultarte datos de incidencias, dispositivos y aulas en tiempo real. ¿En qué te ayudo?' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const data = await api.post('/chat', {
        message: msg,
        history: messages, // historial previo para contexto multi-turno
      });
      setMessages([...history, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages([...history, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="chatbox">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-avatar">🤖</span>
          <div>
            <div className="chat-title">Asistente TIC</div>
            <div className="chat-subtitle">Gemini AI · Conectado a la BD</div>
          </div>
        </div>
        <button className="btn-ghost chat-close" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === 'assistant' && <span className="msg-avatar">🤖</span>}
            <div className="msg-bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <span className="msg-avatar">🤖</span>
            <div className="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugerencias rápidas */}
      {messages.length <= 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-wrap">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Pregunta sobre incidencias, dispositivos o aulas..."
          rows={1}
          disabled={loading}
        />
        <button
          className="chat-send"
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
