
import { useState } from 'react';
import { Maximize2, Send, Bot, UserRound, LoaderCircle } from 'lucide-react';
import { assistantApi } from '../services/api';
import StatusNotice from './StatusNotice';
export default function AssistantPanel({ fullscreen = false }) {
  const [input, setInput] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Bonjour ! Je suis l’assistant d’OpenDC. Je peux vous présenter notre vision, notre mission et nos projets. Comment puis-je vous aider ?' }]);
  async function send(e) {
    e.preventDefault(); const text = input.trim(); if (!text || busy) return;
    const history = messages.slice(-12); setMessages([...messages, { role: 'user', content: text }]); setInput(''); setBusy(true); setError('');
    try { const data = await assistantApi.send(text, history); setMessages(m => [...m, { role: 'assistant', content: data.reply || data.message || 'Je n’ai pas reçu de réponse exploitable.' }]); }
    catch (err) { setError(err.message); setMessages(m => [...m, { role: 'assistant', content: 'Je ne peux pas joindre le service de conversation pour le moment. Vous pouvez réessayer lorsque le backend sera disponible.' }]); }
    finally { setBusy(false); }
  }
  return <section className={`assistant-card ${fullscreen ? 'assistant-full' : ''}`}><div className="assistant-head"><div className="assistant-title"><span className="bot-icon"><Bot/></span><div><b>L’assistant d’OpenDC</b><small>Assistant officiel · Informations générales</small></div></div>{!fullscreen && <a className="icon-button" href="/assistant" title="Plein écran"><Maximize2 size={17}/></a>}</div>{error && <StatusNotice>{error}</StatusNotice>}<div className="chat-messages">{messages.map((m, i) => <div key={i} className={`chat-row ${m.role}`}><span className="chat-avatar">{m.role === 'assistant' ? <Bot size={16}/> : <UserRound size={16}/>}</span><p>{m.content}</p></div>)}{busy && <div className="chat-row"><span className="chat-avatar"><Bot size={16}/></span><p className="typing"><LoaderCircle size={15}/> L’assistant réfléchit…</p></div>}</div><form className="chat-form" onSubmit={send}><input value={input} onChange={e => setInput(e.target.value)} maxLength={2000} placeholder="Écrivez votre message…" aria-label="Votre message"/><button disabled={!input.trim() || busy} aria-label="Envoyer"><Send size={18}/></button></form></section>;
}
