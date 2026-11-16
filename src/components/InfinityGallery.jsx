import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Photographies de personnes réelles — images gratuites publiées sur Unsplash.
const slides = [
  {
    src: 'https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?auto=format&fit=crop&w=1600&q=85',
    alt: 'Équipe diverse échangeant autour d’une table dans un bureau',
  },
  {
    src: 'https://images.unsplash.com/photo-1758691736975-9f7f643d178e?auto=format&fit=crop&w=1600&q=85',
    alt: 'Groupe de professionnels réunis dans un espace de travail',
  },
  {
    src: 'https://images.unsplash.com/photo-1758873269811-4e62e346b4b7?auto=format&fit=crop&w=1600&q=85',
    alt: 'Collègues collaborant sur un projet au bureau',
  },
  {
    src: 'https://images.unsplash.com/photo-1758873268663-5a362616b5a7?auto=format&fit=crop&w=1600&q=85',
    alt: 'Quatre collègues souriants dans un bureau moderne',
  },
];

export default function InfinityGallery() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(value => (value + 1) % slides.length), 4200);
    return () => clearInterval(id);
  }, []);
  const move = direction => setActive(value => (value + direction + slides.length) % slides.length);

  return (
    <div className="gallery">
      <div className="gallery-image" key={active}>
        <img src={slides[active].src} alt={slides[active].alt} loading={active === 0 ? 'eager' : 'lazy'} />
        <span className="gallery-caption">OpenDC · Des personnes réelles, des idées qui avancent</span>
      </div>
      <button className="gallery-arrow left" onClick={() => move(-1)} aria-label="Photo précédente"><ChevronLeft /></button>
      <button className="gallery-arrow right" onClick={() => move(1)} aria-label="Photo suivante"><ChevronRight /></button>
      <div className="gallery-dots">
        {slides.map((slide, index) => (
          <button key={slide.src} aria-label={`Photo ${index + 1}`} className={index === active ? 'active' : ''} onClick={() => setActive(index)} />
        ))}
      </div>
    </div>
  );
}
