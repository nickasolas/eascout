export default function Logo({ size = 40 }) {
  const s = size / 120
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="58" fill="#1e3a5f"/>
      <rect x="21" y="37" width="78" height="46" rx="3.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6"/>
      <line x1="60" y1="37" x2="60" y2="83" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
      <circle cx="60" cy="60" r="11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
      <circle cx="60" cy="60" r="2.5" fill="white" opacity="0.9"/>
      <rect x="21" y="49" width="16" height="22" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1"/>
      <rect x="83" y="49" width="16" height="22" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1"/>
      <circle cx="60" cy="60" r="32" stroke="#22d3ee" strokeWidth="1.8" opacity="0.85"/>
      <line x1="60" y1="24" x2="60" y2="32" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="60" y1="88" x2="60" y2="96" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="24" y1="60" x2="32" y2="60" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="88" y1="60" x2="96" y2="60" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}
