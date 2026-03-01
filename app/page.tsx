"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef } from "react"
import { getWeatherData } from "./actions"
import { WeatherData } from "@/types/weather"

const windOpposite: Record<string, string> = {
  N:"S", NNE:"SSW", NE:"SW", ENE:"WSW", E:"W", ESE:"WNW", SE:"NW",
  SSE:"NNW", S:"N", SSW:"NNE", SW:"NE", WSW:"ENE", W:"E", WNW:"ESE",
  NW:"SE", NNW:"SSE",
}

{/* helper functions fam */}

function uvLabel(uv: number) {
  if (uv <= 2) return { label: "LOW", color: "#00ff88" }
  if (uv <= 5) return { label: "MED", color: "#ffee00" }
  if (uv <= 7) return { label: "HIGH", color: "#ff8800" }
  if (uv <= 10) return { label: "V.HIGH", color: "#ff2266" }
  return { label: "EXTREME", color: "#cc00ff" }
}

function getTheme(weather: WeatherData) {
  const code = weather.current.condition.code
  const isDay = weather.current.is_day === 1
  if (!isDay) return { bg: "#0a0033", panel: "#110044", accent: "#cc00ff", accent2: "#6600cc", text: "#e0ccff", star: true }
  if (code === 1000) return { bg: "#0066cc", panel: "#003399", accent: "#ffee00", accent2: "#ff8800", text: "#ffffff", star: false }
  if (code >= 1003 && code <= 1009) return { bg: "#556677", panel: "#334455", accent: "#aaddff", accent2: "#5599cc", text: "#ffffff", star: false }
  if (code >= 1063 && code < 1200) return { bg: "#0033aa", panel: "#001f77", accent: "#00eeff", accent2: "#0088cc", text: "#cceeff", star: false }
  if (code >= 1200) return { bg: "#220044", panel: "#440066", accent: "#ff00cc", accent2: "#aa0088", text: "#ffccff", star: true }
  return { bg: "#0055cc", panel: "#003399", accent: "#ffee00", accent2: "#ff8800", text: "#ffffff", star: false }
}

function WindCompass({ degree, accent }: { degree: number; accent: string }) {
  return (
    <div style={{ width: 80, height: 80 }}>
      <svg viewBox="0 0 90 90" width={80} height={80}>
        <circle cx={45} cy={45} r={42} stroke={accent} strokeWidth={2} fill="none" opacity={0.3} strokeDasharray="4 4"/>
        <circle cx={45} cy={45} r={30} stroke={accent} strokeWidth={1} fill="none" opacity={0.2}/>
        {["N","E","S","W"].map((d, i) => {
          const rad = (i * 90 - 90) * Math.PI / 180
          const x = 45 + 37 * Math.cos(rad)
          const y = 45 + 37 * Math.sin(rad)
          return (
            <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill={accent} fontSize={8} fontFamily="'VT323', monospace" fontWeight={700} opacity={0.8}>
              {d}
            </text>
          )
        })}
        <motion.g
          style={{ originX: "45px", originY: "45px" }}
          animate={{ rotate: degree }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <polygon points="45,8 49,45 45,40 41,45" fill={accent} opacity={0.95}/>
          <polygon points="45,82 49,45 45,50 41,45" fill="rgba(255,255,255,0.2)"/>
        </motion.g>
        <circle cx={45} cy={45} r={4} fill={accent} opacity={0.8}/>
        <circle cx={45} cy={45} r={2} fill="white"/>
      </svg>
    </div>
  )
}

{/* stat card */}
function StatCard({ label, value, unit, sub, subLabel, bar, accent, panel, text, delay = 0 }: {
  label: string; value: string | number; unit?: string;
  sub?: string | number; subLabel?: string;
  bar?: { max: number; current: number };
  accent: string; panel: string; text: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: panel, border: `3px solid ${accent}`,
        padding: "14px 16px", boxShadow: `4px 4px 0px ${accent}`,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: accent, opacity: 0.5 }} />
      <p style={{ fontSize: 9, letterSpacing: "0.2em", color: accent, fontFamily: "'VT323', monospace", marginBottom: 6 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 34, fontFamily: "'VT323', monospace", color: text, lineHeight: 1, textShadow: `0 0 10px ${accent}88` }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: accent, fontFamily: "'VT323', monospace" }}>{unit}</span>}
      </div>
      {subLabel && sub !== undefined && (
        <p style={{ fontSize: 11, color: accent, fontFamily: "'VT323', monospace", marginTop: 4, opacity: 0.7 }}>
          {subLabel}: <span style={{ color: text }}>{sub}</span>
        </p>
      )}
      {bar && (
        <div style={{ marginTop: 8, height: 6, background: "rgba(0,0,0,0.4)", border: `1px solid ${accent}44` }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((bar.current / bar.max) * 100, 100)}%` }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%", background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
        </div>
      )}
    </motion.div>
  )
}

function Stars({ accent }: { accent: string }) {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: (i * 37 + 13) % 100, y: (i * 53 + 7) % 100,
    size: (i % 3) + 1, delay: (i * 0.3) % 3,
  }))
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map(s => (
        <motion.div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, background: accent, borderRadius: "50%",
        }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + s.delay, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async (city: string) => {
    setLoading(true)
    const { data } = await getWeatherData(city)
    if (data) setWeather(data)
    setLoading(false)
  }

  useEffect(() => { load("Manila") }, [])

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const city = inputRef.current?.value.trim()
    if (city) load(city)
  }

  const theme = weather?.current
    ? getTheme(weather)
    : { bg: "#0a0033", panel: "#110044", accent: "#cc00ff", accent2: "#6600cc", text: "#e0ccff", star: true }
  const uv = weather?.current ? uvLabel(weather.current.uv) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { min-height: 100vh; font-family: 'VT323', monospace; overflow-x: hidden; }
        input::placeholder { color: ${theme.accent}88; }
        input:focus { outline: none; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes glitch {
          0%,90%,100%{transform:translate(0)}
          92%{transform:translate(-2px,1px)}
          94%{transform:translate(2px,-1px)}
          96%{transform:translate(-1px,0)}
        }

        .blink { animation: blink 1s step-end infinite; }
        .marquee-track { overflow: hidden; }
        .marquee-inner {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 18s linear infinite;
        }
        .glitch { animation: glitch 5s infinite; }
        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 50;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
        }

        /* Stats grid: 2 cols on mobile, 3 on tablet, 5 on desktop */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        /* Compass spans full width on mobile so it doesn't look orphaned */
        .compass-card { grid-column: span 2; }

        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .compass-card { grid-column: span 1; }
        }
        @media (min-width: 900px) {
          .stats-grid { grid-template-columns: repeat(5, 1fr); }
          .compass-card { grid-column: span 1; }
        }

        /* Hero: stack on mobile, side-by-side on tablet+ */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 580px) {
          .hero-grid {
            grid-template-columns: 1fr auto;
            gap: 32px;
          }
        }

        /* Header: stack on mobile */
        .header-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 20px;
          padding-bottom: 16px;
        }
        @media (min-width: 640px) {
          .header-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding-top: 28px;
            padding-bottom: 20px;
          }
        }

        /* Search: full width on mobile */
        .search-form { display: flex; width: 100%; }
        .search-input { flex: 1; min-width: 0; }
        @media (min-width: 640px) {
          .search-form { width: auto; }
          .search-input { width: 180px; flex: none; }
        }

        /* Logo size */
        .logo-text {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(11px, 3vw, 18px);
          line-height: 1.4;
        }
      `}</style>

      <div className="scanlines" />
      {theme.star && <Stars accent={theme.accent} />}

      <div style={{ minHeight: "100vh", background: theme.bg, transition: "background 1.5s ease", position: "relative", zIndex: 1 }}>

        {/* marquee thingy on top */}
        <div className="marquee-track" style={{ background: theme.accent, padding: "4px 0", borderBottom: `3px solid ${theme.accent2}` }}>
          <div className="marquee-inner" style={{ fontSize: 13, color: "#000", fontFamily: "'VT323', monospace", letterSpacing: "0.15em" }}>
            ★ SELRVK.DEV | WEATHER APP ★ REAL-TIME ATMOSPHERIC DATA ★ POWERED BY WEATHERAPI ★ STAY CONNECTED ★&nbsp;
            ★ SELRVK.DEV | WEATHER APP ★ REAL-TIME ATMOSPHERIC DATA ★ POWERED BY WEATHERAPI ★ STAY CONNECTED ★&nbsp;
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }} className="main-container">

          {/* head hehe */}
          <div className="header-row">
            <div>
              <div className="glitch logo-text" style={{
                color: theme.accent,
                textShadow: `0 0 20px ${theme.accent}, 2px 2px 0 ${theme.accent2}`,
              }}>
                ☁ SELRVK.DEV | WEATHER APP
              </div>
              <div style={{ fontSize: 11, color: theme.accent, opacity: 0.6, marginTop: 6, fontFamily: "'VT323', monospace", letterSpacing: "0.1em" }}>
                BUILD 2000 // https://selrvk.dev <span className="blink">_</span>
              </div>
            </div>

            <form onSubmit={handleSearch} className="search-form" style={{ gap: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                border: `3px solid ${theme.accent}`, padding: "8px 12px",
                background: "rgba(0,0,0,0.5)",
                boxShadow: inputFocused ? `0 0 12px ${theme.accent}` : "none",
                transition: "box-shadow 0.2s",
                flex: 1,
              }}>
                <span style={{ color: theme.accent, fontSize: 14 }}>▶</span>
                <input
                  ref={inputRef} type="text" placeholder="ENTER CITY..."
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="search-input"
                  style={{
                    background: "transparent", border: "none", color: theme.text,
                    fontFamily: "'VT323', monospace", fontSize: 16, letterSpacing: "0.08em",
                    width: "100%",
                  }}
                />
              </div>
              <button type="submit" style={{
                background: theme.accent, border: `3px solid ${theme.accent2}`, borderLeft: "none",
                padding: "8px 16px", color: "#000", fontFamily: "'Press Start 2P', monospace",
                fontSize: 9, cursor: "pointer", boxShadow: `3px 3px 0 ${theme.accent2}`,
                flexShrink: 0,
              }}>GO</button>
            </form>
          </div>

          {/* content */}
          <AnimatePresence mode="wait">
            {weather && !loading && (
              <motion.div
                key={weather.location.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* hero panel */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    border: `3px solid ${theme.accent}`,
                    background: theme.panel,
                    boxShadow: `6px 6px 0 ${theme.accent2}, 0 0 40px ${theme.accent}33`,
                    padding: "20px", marginBottom: 12,
                    position: "relative",
                  }}
                >
                  {/* chrome dots */}
                  <div style={{ position: "absolute", top: 10, right: 14, display: "flex", gap: 6 }}>
                    {[theme.accent, "#ffee00", "#00ff88"].map((c, i) => (
                      <div key={i} style={{ width: 10, height: 10, background: c, borderRadius: "50%", opacity: 0.8 }} />
                    ))}
                  </div>

                  <div className="hero-grid">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 14 }}>📍</span>
                        <span style={{ fontSize: 13, color: theme.accent, fontFamily: "'VT323', monospace", letterSpacing: "0.12em" }}>
                          {weather.location.name}, {weather.location.country}
                        </span>
                      </div>

                      <h1 style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "clamp(16px, 4vw, 36px)",
                        color: theme.text, lineHeight: 1.4,
                        textShadow: `0 0 20px ${theme.accent}88`, marginBottom: 16,
                      }}>
                        {weather.location.region || weather.location.name}
                      </h1>

                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        border: `2px solid ${theme.accent}`, padding: "5px 12px",
                        background: "rgba(0,0,0,0.3)", marginBottom: 14,
                      }}>
                        <span style={{ fontSize: 14 }}>{weather.current.is_day === 1 ? "☀️" : "🌙"}</span>
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: theme.accent, letterSpacing: "0.08em" }}>
                          {weather.current.condition.text.toUpperCase()}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: theme.accent, opacity: 0.7, fontFamily: "'VT323', monospace", letterSpacing: "0.1em" }}>
                        FEELS LIKE {weather.current.feelslike_c}°C
                      </p>
                    </div>

                    {/* big temp */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "clamp(44px, 10vw, 84px)",
                        color: theme.accent,
                        textShadow: `0 0 30px ${theme.accent}, 4px 4px 0 ${theme.accent2}`,
                        lineHeight: 1,
                      }}>
                        {Math.round(weather.current.temp_c)}°
                      </div>
                      <div style={{ fontFamily: "'VT323', monospace", fontSize: 17, color: theme.accent, opacity: 0.5, marginTop: 6 }}>
                        {Math.round(weather.current.temp_f)}°F
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* stats grid */}
                <div className="stats-grid">
                  <StatCard label=":: WIND ::" value={weather.current.wind_kph} unit="KPH" sub={weather.current.wind_dir} subLabel="DIR" accent={theme.accent} panel={theme.panel} text={theme.text} delay={0.05} />
                  <StatCard label=":: HUMID ::" value={weather.current.humidity} unit="%" sub={`${weather.current.dewpoint_c}°C`} subLabel="DEW" bar={{ max: 100, current: weather.current.humidity }} accent={theme.accent} panel={theme.panel} text={theme.text} delay={0.1} />
                  <StatCard label=":: PRESS ::" value={weather.current.pressure_mb} unit="MB" accent={theme.accent} panel={theme.panel} text={theme.text} delay={0.15} />
                  <StatCard label=":: UV IDX ::" value={weather.current.uv} sub={uv!.label} subLabel="RISK" bar={{ max: 11, current: weather.current.uv }} accent={uv!.color} panel={theme.panel} text={theme.text} delay={0.2} />

                  {/* compass card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="compass-card"
                    style={{
                      background: theme.panel, border: `3px solid ${theme.accent}`,
                      boxShadow: `4px 4px 0 ${theme.accent}`, padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 16, position: "relative",
                    }}
                  >
                    <div style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: theme.accent, opacity: 0.5 }} />
                    <WindCompass degree={weather.current.wind_degree} accent={theme.accent} />
                    <div>
                      <p style={{ fontSize: 9, letterSpacing: "0.2em", color: theme.accent, fontFamily: "'VT323', monospace", marginBottom: 4 }}>:: COMPASS ::</p>
                      <p style={{ fontSize: 14, color: theme.accent, fontFamily: "'VT323', monospace", opacity: 0.7 }}>
                        DIR: <span style={{ color: theme.text }}>{weather.current.wind_dir}</span>
                      </p>
                      <p style={{ fontSize: 14, color: theme.accent, fontFamily: "'VT323', monospace", opacity: 0.7 }}>
                        FROM: <span style={{ color: theme.text }}>{windOpposite[weather.current.wind_dir] || "—"}</span>
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* feet hehe */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  style={{
                    border: `2px solid ${theme.accent}44`, padding: "10px 14px",
                    display: "flex", flexWrap: "wrap", gap: 8,
                    justifyContent: "space-between", alignItems: "center",
                    marginBottom: 32, background: "rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontSize: 11, color: theme.accent, opacity: 0.5, fontFamily: "'VT323', monospace", letterSpacing: "0.08em" }}>
                    SYS: NOMINAL // DATA: LIVE // {weather.current.is_day === 1 ? "DAYTIME" : "NIGHTTIME"}<span className="blink">_</span>
                  </span>
                  <span style={{ fontSize: 11, color: theme.accent, opacity: 0.4, fontFamily: "'VT323', monospace" }}>
                    © SELRVK.DEV | WEATHER APP 2000
                  </span>
                </motion.div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 20 }}
              >
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: theme.accent, textShadow: `0 0 10px ${theme.accent}`, textAlign: "center" }}>
                  LOADING
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[0,1,2,3,4].map(i => (
                    <motion.div key={i} style={{ width: 10, height: 10, background: theme.accent }}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: theme.accent, opacity: 0.5, fontFamily: "'VT323', monospace", letterSpacing: "0.1em", textAlign: "center" }}>
                  FETCHING ATMOSPHERIC DATA<span className="blink">...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}