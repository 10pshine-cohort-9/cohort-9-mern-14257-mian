import { useState } from "react";

export default function VaultGraphic() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const toggleVault = () => setIsUnlocked(!isUnlocked);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 320"
      className="w-full h-auto drop-shadow-2xl"
    >
      <defs>
        <filter id="blur-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        <style>
          {`
            .vault-text { font-family: system-ui, -apple-system, sans-serif; }
            .interactive-area { cursor: pointer; user-select: none; }
            
            @keyframes hop {
              0%, 100% { transform: translateY(0); }
              4% { transform: translateY(-4px); }
              8% { transform: translateY(0); }
              12% { transform: translateY(-2px); }
              16% { transform: translateY(0); }
            }
            
            .animated-text {
              animation: hop 5s infinite ease-in-out;
            }

            .blur-lines { transition: all 0.5s ease; fill: #463929; }
            .secret-text { transition: opacity 0.5s ease; fill: #463929; }
            
            .is-locked .blur-lines { opacity: 0.6; filter: url(#blur-filter); }
            .is-locked .secret-text { opacity: 0; }
            
            .is-unlocked .blur-lines { opacity: 0; }
            .is-unlocked .secret-text { opacity: 1; }
          `}
        </style>
      </defs>

      <g className={isUnlocked ? "is-unlocked" : "is-locked"}>
        <rect
          x="20"
          y="20"
          width="360"
          height="280"
          rx="12"
          fill="#f8faf9"
          stroke="#7e766d"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />

        <g transform="translate(40, 45)">
          <g className="interactive-area" onClick={toggleVault}>
            <rect
              x="0"
              y="0"
              width="40"
              height="40"
              rx="8"
              fill="rgba(70, 57, 41, 0.05)"
            />

            <g
              transform="translate(8, 8)"
              stroke="#463929"
              style={{ transition: "stroke 0.3s ease" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                {isUnlocked ? (
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                ) : (
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                )}
              </svg>
            </g>

            <g className="animated-text">
              <text
                x="56"
                y="25"
                fill="#904952"
                fontSize="14"
                fontWeight="600"
                className="vault-text"
              >
                {isUnlocked
                  ? "Click lock to hide note"
                  : "Click lock to reveal note"}
              </text>
            </g>
          </g>

          <line
            x1="0"
            y1="55"
            x2="320"
            y2="55"
            stroke="#7e766d"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        </g>

        <g transform="translate(40, 125)">
          <g className="blur-lines">
            <rect x="0" y="0" width="280" height="14" rx="4" />
            <rect x="0" y="30" width="240" height="14" rx="4" />
            <rect x="0" y="60" width="300" height="14" rx="4" />
            <rect x="0" y="100" width="260" height="14" rx="4" />
            <rect x="0" y="130" width="200" height="14" rx="4" />
          </g>

          <g className="secret-text vault-text">
            <text x="0" y="16" fontSize="16">
              Just like that, your notes are completely
            </text>
            <text x="0" y="46" fontSize="16">
              protected from any unwanted person
            </text>
            <text x="0" y="76" fontSize="16">
              if they are looking at your screen.
            </text>
            <text x="0" y="116" fontSize="16" fontWeight="700">
              We knew you wanted that😉
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
