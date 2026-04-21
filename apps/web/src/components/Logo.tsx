import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'lg', showText = true }: LogoProps) {
  const sizes = {
    sm: { container: 40, symbol: 24 },
    md: { container: 56, symbol: 32 },
    lg: { container: 72, symbol: 40 }
  };
  
  const s = sizes[size];
  
  return (
    <Link href="/" className="logo-link">
      <div className="logo-container" style={{ width: s.container, height: s.container }}>
        <svg 
          viewBox="0 0 100 100" 
          className="logo-symbol"
          style={{ width: s.symbol, height: s.symbol }}
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          
          {/* Left F - Yang (Gold) */}
          <path 
            d="M15 15 L45 15 L45 30 L30 30 L30 40 L40 40 L40 55 L30 55 L30 85 L15 85 Z" 
            fill="url(#goldGrad)"
            opacity="0.9"
          />
          
          {/* Right F - Yin (Purple) */}
          <path 
            d="M55 15 L85 15 L85 30 L70 30 L70 40 L60 40 L60 55 L70 55 L70 85 L55 85 Z" 
            fill="url(#purpleGrad)"
            opacity="0.9"
          />
          
          {/* Center divider - subtle line */}
          <rect x="48" y="15" width="4" height="70" fill="#030014" opacity="0.3" />
        </svg>
      </div>
      
      {showText && (
        <span className="logo-text">FATEFUL</span>
      )}
      
      <style jsx>{`
        .logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .logo-symbol {
          display: block;
          animation: cosmicFloat 4s ease-in-out infinite;
        }
        
        @keyframes cosmicFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        .logo-text {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.15rem;
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </Link>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <div className="logo-icon" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" style={{ width: size * 0.7, height: size * 0.7 }}>
        <defs>
          <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="purpleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        
        <path 
          d="M15 15 L45 15 L45 30 L30 30 L30 40 L40 40 L40 55 L30 55 L30 85 L15 85 Z" 
          fill="url(#goldGrad2)"
          opacity="0.9"
        />
        
        <path 
          d="M55 15 L85 15 L85 30 L70 30 L70 40 L60 40 L60 55 L70 55 L70 85 L55 85 Z" 
          fill="url(#purpleGrad2)"
          opacity="0.9"
        />
        
        <rect x="48" y="15" width="4" height="70" fill="#030014" opacity="0.3" />
      </svg>
      
      <style jsx>{`
        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default Logo;