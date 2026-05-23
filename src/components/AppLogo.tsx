import React from "react";

interface AppLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  textColor?: string;
}

export function AppLogo({ className = "", size = 120, withText = false, textColor = "text-slate-900" }: AppLogoProps) {
  // SVG Aspect ratio 400x400
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-full drop-shadow-sm select-none"
      >
        {/* Background Subtle Map of India in warm green */}
        <path
          d="M200 80 Q215 95 210 110 Q215 115 220 110 T230 115 Q245 120 250 140 T260 160 T275 165 T280 180 T295 195 T275 220 Q260 215 255 225 T240 230 Q225 240 220 260 T210 280 T200 300 Q195 285 190 270 T180 250 Q165 245 160 230 T170 200 T150 180 T165 140 T180 110 Z"
          fill="#138808"
          fillOpacity="0.12"
          stroke="#138808"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Outer Elegant Blue Circle Path wrapping around */}
        <circle
          cx="200"
          cy="185"
          r="135"
          stroke="url(#blueGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="750"
          strokeDashoffset="30"
          className="animate-[spin_120s_linear_infinite]"
        />

        {/* Indian Flag Tri-color bird swooshing from coordinates */}
        {/* Saffron wing upper plume */}
        <path
          d="M154 110 C160 140 185 180 215 190 C185 175 170 145 162 118 Z"
          fill="#FF9933"
        />
        <path
          d="M154 110 C180 125 215 155 225 185 C205 165 180 145 158 122 Z"
          fill="#FF9933"
        />
        {/* Elegant Tri-color phoenix body curves sweeping up */}
        <path
          d="M154 260 C150 200 185 140 232 132 C210 160 178 210 174 262 Z"
          fill="#1c3d75"
        />
        {/* Saffron sweep */}
        <path
          d="M156 240 Q150 160 210 120 Q175 162 172 235 Z"
          fill="#FF9933"
        />
        {/* White sweep */}
        <path
          d="M165 245 Q160 175 220 128 Q185 176 181 240 Z"
          fill="#F5F5F7"
          stroke="#E2E8F0"
          strokeWidth="0.5"
        />
        {/* Green sweep */}
        <path
          d="M174 250 Q170 190 230 135 Q195 188 190 245 Z"
          fill="#138808"
        />

        {/* Bird Head with eye towards the right */}
        <path
          d="M230 135 C232 133 238 131 242 133 C238 135 236 139 232 141 Z"
          fill="#FF9933"
        />
        <path
          d="M232 132 C236 130 240 132 244 135 C238 138 235 137 232 132 Z"
          fill="#138808"
        />
        <circle cx="235" cy="134" r="1.5" fill="#1c3d75" />

        {/* Symmetrical Radiant Lotus Flower at Bottom representing bloom & wisdom */}
        {/* Lotus Center Petal */}
        <path
          d="M200 220 C208 245 208 275 200 285 C192 275 192 245 200 220 Z"
          fill="url(#lotusSaffron)"
          stroke="#E05A00"
          strokeWidth="1"
        />
        {/* Left inner petal */}
        <path
          d="M198 225 C185 245 175 270 190 285 C175 265 185 245 198 225 Z"
          fill="url(#lotusSaffron)"
          stroke="#E05A00"
          strokeWidth="1"
        />
        {/* Right inner petal */}
        <path
          d="M202 225 C215 245 225 270 210 285 C225 265 215 245 202 225 Z"
          fill="url(#lotusSaffron)"
          stroke="#E05A00"
          strokeWidth="1"
        />
        {/* Left outer petal */}
        <path
          d="M195 235 C170 250 155 275 178 285 C155 270 170 250 195 235 Z"
          fill="url(#lotusSaffron)"
          stroke="#E05A00"
          strokeWidth="1"
        />
        {/* Right outer petal */}
        <path
          d="M205 235 C230 250 245 275 222 285 C245 270 230 250 205 235 Z"
          fill="url(#lotusSaffron)"
          stroke="#E05A00"
          strokeWidth="1"
        />
        
        {/* Bottom Lotus leaves (Green Base) */}
        <path
          d="M170 282 Q185 275 200 285 Q215 275 230 282 Q200 305 170 282 Z"
          fill="url(#lotusGreen)"
          stroke="#0F6606"
          strokeWidth="1"
        />
        <path
          d="M185 285 Q200 280 215 285 Q200 298 185 285 Z"
          fill="#138808"
        />

        {/* Ashoka Chakra Center Hub Detail behind bird */}
        <circle cx="200" cy="185" r="16" stroke="#1c3d75" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />

        {/* Re-usable Gradient Definitions */}
        <defs>
          <linearGradient id="blueGradient" x1="65" y1="50" x2="335" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E3A8A" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="lotusSaffron" x1="200" y1="210" x2="200" y2="290" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFAE5D" />
            <stop offset="0.6" stopColor="#FF7700" />
            <stop offset="1" stopColor="#D84F00" />
          </linearGradient>

          <linearGradient id="lotusGreen" x1="200" y1="270" x2="200" y2="305" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22C55E" />
            <stop offset="1" stopColor="#15803D" />
          </linearGradient>
        </defs>
      </svg>
      
      {withText && (
        <div className="mt-3 text-center space-y-1 font-sans">
          <h2 className={`text-2xl font-black uppercase tracking-[0.18em] ${textColor} font-display leading-none select-none`}>
            BHARAT JOBS
          </h2>
          {/* Saffron, White, Green Tri-color elegant underline */}
          <div className="flex h-[4px] w-28 rounded-full overflow-hidden mx-auto">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white border-y border-gray-150" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
        </div>
      )}
    </div>
  );
}
