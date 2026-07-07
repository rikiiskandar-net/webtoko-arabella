export default function BackgroundPattern() {
  // SVG Pattern with culinary and leaf motifs
  const svgContent = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8">
        <!-- Leaf 1 -->
        <g transform="translate(30, 30) scale(1.2) rotate(15)">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </g>
        
        <!-- Sparkle/Star -->
        <g transform="translate(140, 40) scale(0.8) rotate(-10)">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
        </g>
        
        <!-- Chef Hat -->
        <g transform="translate(80, 120) scale(1) rotate(-5)">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
          <line x1="6" x2="18" y1="17" y2="17"/>
        </g>
        
        <!-- Leaf 2 -->
        <g transform="translate(160, 140) scale(1) rotate(-125)">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </g>
        
        <!-- Dots -->
        <circle cx="100" cy="50" r="1.5" fill="#3B82F6"/>
        <circle cx="40" cy="150" r="1" fill="#3B82F6"/>
        <circle cx="180" cy="90" r="2" fill="#3B82F6"/>
      </g>
    </svg>
  `.replace(/\s+/g, " ").trim();

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.06, // Dibuat lebih transparan sesuai permintaan (6%)
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svgContent)}")`,
        backgroundSize: "300px 300px",
      }}
    />
  );
}

