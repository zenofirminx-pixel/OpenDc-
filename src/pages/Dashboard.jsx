import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, PencilLine, ChartNoAxesColumnIncreasing, Sparkles, Code2, Search, Image, FileText, Mic, Plus, ShieldCheck, FolderOpen, Clock3, Crown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AssistantPanel from '../components/AssistantPanel';
export default function Dashboard() {
  const { profile, user } = useAuth();
  const name = profile?.firstName || user?.displayName?.split(' ')[0] || 'vous';
  return <div className="dashboard-grid">
    <section className="dashboard-main">
      <div className="pal-hero"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="pal-orb"><span>PAL</span><i/></div>
        <div className="hero-copy"><span className="eyebrow">VOTRE ESPACE INTELLIGENT</span><h1>Que souhaitez-vous accomplir <em>aujourd’hui</em> ?</h1><p>Bonjour {name}. Posez une question, explorez des idées, créez du contenu et bien plus encore…</p></div>
      </div>
      <div className="action-grid">
        <Link to="/assistant" className="action-card"><span className="action-icon"><PencilLine/></span><b>Écrire</b><p>Rédigez, améliorez ou trouvez l’inspiration.</p><span className="action-arrow"><ArrowRight/></span></Link>
        <Link to="/assistant" className="action-card"><span className="action-icon"><ChartNoAxesColumnIncreasing/></span><b>Analyser</b><p>Comprenez vos données et obtenez des insights.</p><span className="action-arrow"><ArrowRight/></span></Link>
        <Link to="/services" className="action-card"><span className="action-icon"><Sparkles/></span><b>Créer</b><p>Donnez vie à vos idées et à votre contenu.</p><span className="action-arrow"><ArrowRight/></span></Link>
        <Link to="/assistant" className="action-card"><span className="action-icon"><Code2/></span><b>Programmer</b><p>Développez, déboguez et innovez.</p><span className="action-arrow"><ArrowRight/></span></Link>
      </div>
      <section className="composer-wrap"><AssistantPanel compact/><div className="privacy-note"><ShieldCheck size={15}/> Vos données sont protégées et votre vie privée respectée.</div></section>
    </section>
    <aside className="workspace-rail">
      <section className="rail-card"><div className="rail-heading"><b><FolderOpen size={18}/> Espace de travail</b><span>«</span></div><div className="rail-subheading">Fichiers épinglés <button type="button">Tout voir ›</button></div>
        <div className="file-row"><span className="file-icon pdf"><FileText/></span><span><b>Vos documents</b><small>Accédez à vos fichiers</small></span></div>
        <div className="file-row"><span className="file-icon image"><Image/></span><span><b>Bibliothèque</b><small>Vos contenus enregistrés</small></span></div>
        <div className="rail-divider"/><div className="rail-subheading"><Clock3 size={15}/> Activité récente <button type="button">Tout voir ›</button></div>
        <div className="activity-row"><span className="activity-bubble"><MessageSquareIcon/></span><span><b>Votre espace Pal est prêt</b><small>Commencez une conversation</small></span></div>
        <div className="activity-row"><span className="activity-bubble green"><ShieldCheck/></span><span><b>Session sécurisée</b><small>Votre compte est protégé</small></span></div>
      </section>
      <section className="premium-card"><Crown size={27}/><Sparkles className="premium-spark"/><h3>Passez à Pal Premium</h3><p>Découvrez les fonctionnalités avancées et profitez de limites plus généreuses.</p><Link to="/services">Découvrir les avantages <ArrowRight size={15}/></Link></section>
    </aside>
  </div>;
}
function MessageSquareIcon(){return <Search size={17}/>;}
