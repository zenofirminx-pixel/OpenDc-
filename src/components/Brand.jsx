export default function Brand({ small = false }) {
  return <div className={`brand ${small ? 'brand-small' : ''}`} aria-label="Pal">
    <span className="brand-word">PAL</span><span className="brand-smile" />
  </div>;
}
