type ObjectIconName = "house" | "apartment" | "commercial" | "custom";
type ProductionIconName = "draft" | "profile" | "quality" | "install";

type ArchitecturalIconProps = {
  kind: ObjectIconName | ProductionIconName;
  className?: string;
};

function GlassPlane({ x, y, width, height, skew = 0 }: { x: number; y: number; width: number; height: number; skew?: number }) {
  return <path d={`M${x} ${y}h${width}l${skew} ${height}H${x + skew}z`} fill="url(#glass)" stroke="url(#bronze)" strokeWidth="1.25" />;
}

export function ArchitecturalIcon({ kind, className }: ArchitecturalIconProps) {
  const isProduction = ["draft", "profile", "quality", "install"].includes(kind);

  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="glass" x1="10" y1="8" x2="82" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9F8FF" stopOpacity=".88" />
          <stop offset=".34" stopColor="#78A9C0" stopOpacity=".36" />
          <stop offset="1" stopColor="#16242B" stopOpacity=".16" />
        </linearGradient>
        <linearGradient id="bronze" x1="12" y1="12" x2="82" y2="83" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9C7A6" />
          <stop offset=".56" stopColor="#B88763" />
          <stop offset="1" stopColor="#6F4D39" />
        </linearGradient>
        <linearGradient id="metal" x1="18" y1="14" x2="79" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6EEF0" />
          <stop offset=".22" stopColor="#62747A" />
          <stop offset=".55" stopColor="#1A282E" />
          <stop offset="1" stopColor="#9E6D4E" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="145%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity=".4" />
        </filter>
      </defs>

      {kind === "house" ? <g filter="url(#shadow)">
        <path d="M13 45 47 18l36 27v35H13V45Z" fill="#17252B" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="m10 45 37-30 39 30" stroke="url(#metal)" strokeWidth="3" strokeLinejoin="round" />
        <GlassPlane x={27} y={44} width={35} height={32} />
        <path d="M39 44v32M51 44v32M27 57h35" stroke="#D9F4FF" strokeOpacity=".52" />
        <path d="M65 48h11v28H65z" fill="url(#glass)" stroke="url(#bronze)" strokeWidth="1.25" />
        <path d="M20 80h67" stroke="url(#metal)" strokeWidth="2" />
        <path d="m67 20 5 5" stroke="#F4D9B7" strokeWidth="1.5" strokeLinecap="round" />
      </g> : null}

      {kind === "apartment" ? <g filter="url(#shadow)">
        <path d="M17 16h47v64H17z" fill="#18262B" stroke="url(#bronze)" strokeWidth="1.5" />
        <GlassPlane x={23} y={25} width={33} height={44} />
        <path d="M34 25v44M45 25v44M23 40h33M23 54h33" stroke="#D9F4FF" strokeOpacity=".52" />
        <path d="m64 34 17 7v30l-17-5V34Z" fill="url(#glass)" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="m64 45 17 5M64 56l17 5" stroke="#D9F4FF" strokeOpacity=".48" />
        <path d="M14 80h71" stroke="url(#metal)" strokeWidth="2" />
        <circle cx="73" cy="23" r="3" stroke="#F4D9B7" strokeWidth="1.25" />
      </g> : null}

      {kind === "commercial" ? <g filter="url(#shadow)">
        <path d="M10 26h76v54H10z" fill="#152329" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="M14 31h68v43H14z" fill="url(#glass)" />
        <path d="M25 31v43M39 31v43M54 31v43M69 31v43M14 47h68" stroke="url(#metal)" strokeWidth="2" />
        <path d="M42 47h16v27H42z" fill="#101A1E" stroke="#D4B08B" strokeWidth="1.25" />
        <path d="M53 50v21" stroke="#E1F5FF" strokeOpacity=".7" />
        <path d="M7 80h82" stroke="url(#metal)" strokeWidth="2" />
        <path d="M18 18h60" stroke="#C89874" strokeWidth="1.5" />
      </g> : null}

      {kind === "custom" ? <g filter="url(#shadow)">
        <path d="m17 72 20-45 42 11-18 41-44-7Z" fill="#17272E" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="m37 27 8 45M56 32l5 47M17 72l62-34" stroke="url(#metal)" strokeWidth="2" />
        <path d="m25 66 15-33 30 8-15 31-30-6Z" fill="url(#glass)" stroke="#DDF5FF" strokeOpacity=".62" />
        <path d="m15 80 65 0" stroke="url(#metal)" strokeWidth="2" />
        <path d="m72 18 7 7m0-7-7 7" stroke="#F4D9B7" strokeWidth="1.35" strokeLinecap="round" />
      </g> : null}

      {kind === "draft" ? <g filter="url(#shadow)">
        <path d="M18 15h47v61H18z" fill="#17252B" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="M26 28h31M26 39h31M26 50h18" stroke="#D8F2FF" strokeOpacity=".68" strokeWidth="1.5" />
        <path d="m31 67 24-24" stroke="url(#bronze)" strokeWidth="2" />
        <path d="m53 39 5 5-8 8-5-5 8-8Z" fill="url(#metal)" />
        <path d="m63 73 17-27 5 3-17 28z" fill="url(#metal)" stroke="url(#bronze)" />
        <path d="m68 72 12 7" stroke="#D9F6FF" strokeOpacity=".6" />
      </g> : null}

      {kind === "profile" ? <g filter="url(#shadow)">
        <path d="M17 25h55v45H17z" fill="#1A292F" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="M25 33h38v29H25z" stroke="url(#metal)" strokeWidth="5" />
        <path d="M32 40h24v15H32z" fill="url(#glass)" />
        <path d="M42 33v29M25 48h38" stroke="#D7F2FC" strokeOpacity=".55" />
        <path d="m69 18 11 11" stroke="url(#bronze)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="78" cy="19" r="8" stroke="url(#metal)" strokeWidth="2" />
        <path d="M16 77h63" stroke="url(#metal)" strokeWidth="2" />
      </g> : null}

      {kind === "quality" ? <g filter="url(#shadow)">
        <path d="M18 25h48v47H18z" fill="#17262D" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="M24 31h36v35H24z" fill="url(#glass)" />
        <path d="M24 48h36M42 31v35" stroke="#D9F5FF" strokeOpacity=".48" />
        <circle cx="66" cy="58" r="15" fill="#142126" stroke="url(#bronze)" strokeWidth="2" />
        <circle cx="66" cy="58" r="8" fill="url(#glass)" stroke="#E5F8FF" strokeOpacity=".75" />
        <path d="m76 69 9 9" stroke="url(#metal)" strokeWidth="4" strokeLinecap="round" />
        <path d="m30 40 6 6 13-14" stroke="#E7C39B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g> : null}

      {kind === "install" ? <g filter="url(#shadow)">
        <path d="M16 17h49v62H16z" fill="#18272D" stroke="url(#bronze)" strokeWidth="1.5" />
        <path d="M22 23h37v50H22z" fill="url(#glass)" />
        <path d="M40 23v50M22 48h37" stroke="#D9F5FF" strokeOpacity=".5" />
        <path d="m66 43 10 4 5 17-12 5-8-15 5-11Z" fill="url(#metal)" stroke="url(#bronze)" strokeWidth="1.25" />
        <path d="M69 57 54 64" stroke="#EAC7A1" strokeWidth="2" strokeLinecap="round" />
        <path d="m13 81 72 0" stroke="url(#metal)" strokeWidth="2" />
      </g> : null}

      {isProduction ? <path d="M12 86h72" stroke="#C49570" strokeOpacity=".52" /> : null}
    </svg>
  );
}
