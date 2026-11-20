import AssistantPanel from '../components/AssistantPanel';
import { Sparkles } from 'lucide-react';
export default function AssistantPage(){return <div className="chat-page"><div className="chat-page-heading"><span className="assistant-badge"><Sparkles size={17}/></span><div><h1>Discussion avec Pal</h1><p>Votre espace pour réfléchir, créer et résoudre des problèmes.</p></div></div><AssistantPanel fullscreen/></div>}
