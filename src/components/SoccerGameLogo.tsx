import React, { useState, useEffect } from "react";
import defaultLogo from "../assets/images/regenerated_image_1787797671871.png";

interface SoccerGameLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

export const SoccerGameLogo: React.FC<SoccerGameLogoProps> = ({
  className = "",
  size = "md",
  showSubtitle = false,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(defaultLogo);

  // Check if a custom uploaded logo exists in local storage
  useEffect(() => {
    try {
      const customLogo = localStorage.getItem("soccer_custom_logo_data");
      if (customLogo) {
        setLogoSrc(customLogo);
      }
    } catch {
      // ignore
    }
  }, []);

  // Responsive dimension presets
  const sizeStyles = {
    sm: "h-7 sm:h-8 max-w-[220px] sm:max-w-[260px]",
    md: "h-9 sm:h-11 max-w-[280px] sm:max-w-[360px]",
    lg: "h-12 sm:h-16 max-w-[380px] sm:max-w-[500px]",
    xl: "h-14 sm:h-20 max-w-[420px] sm:max-w-[620px]",
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`} id="soccer-game-logo-container">
      <div className="relative flex items-center justify-center">
        <img
          src={logoSrc}
          alt="Soccer Game 5 Logo"
          referrerPolicy="no-referrer"
          onError={() => {
            // Fallback to static public path or default import
            if (logoSrc !== defaultLogo) {
              setLogoSrc(defaultLogo);
            } else {
              setLogoSrc("/soccer_logo.png");
            }
          }}
          className={`w-auto ${sizeStyles[size]} object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:opacity-90`}
        />
      </div>

      {showSubtitle && (
        <span className="text-[10px] sm:text-[11px] font-chakra font-bold tracking-widest text-zinc-400 uppercase mt-1">
          League Performance & Ratings Hub
        </span>
      )}
    </div>
  );
};
