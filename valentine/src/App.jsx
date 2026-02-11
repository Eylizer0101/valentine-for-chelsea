import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 💗 Chelsea Valentine App (React + Vite)
 * ✅ Single file: src/App.jsx
 * ✅ Frontend only
 * ✅ Taglish / Pinoy-friendly
 * ✅ May intro + music + confetti + runaway NO + growing YES
 *
 * ASSETS in /public:
 * - /music.mp3
 * - /chelsea.jpg   (rename your photo to chelsea.jpg and put in public)
 */

// ========================
// CONFIG (pwede mong edit)
// ========================
const PERSON_NAME = "Chelsea";
const YOUR_NAME = "Eylizer";
const VALENTINE_DATE = "Feb 14";

// MUSIC
const ENABLE_MUSIC = true;
const MUSIC_SRC = "/music.mp3";

// PHOTO (put in public)
const PERSON_PHOTO = "/chelsea.jpg";

// Effects
const ENABLE_CONFETTI = true;
const ENABLE_FLOATING_HEARTS = true;

// ========================
// Helpers
// ========================
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(!!mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}
function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// ========================
// Typewriter
// ========================
function Typewriter({
  text,
  speed = 20,
  startDelay = 0,
  cursor = true,
  className = "",
  style = {},
  onDone,
}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    let t1 = null;
    let t2 = null;
    setOut("");
    setDone(false);

    t1 = setTimeout(() => {
      let i = 0;
      const tick = () => {
        if (!alive) return;
        i++;
        setOut(text.slice(0, i));
        if (i < text.length) {
          t2 = setTimeout(tick, speed);
        } else {
          setDone(true);
          onDone?.();
        }
      };
      tick();
    }, startDelay);

    return () => {
      alive = false;
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [text, speed, startDelay, onDone]);

  return (
    <span className={className} style={style}>
      {out}
      {cursor && <span className={`tw-cursor ${done ? "tw-cursor-done" : ""}`}>▍</span>}
    </span>
  );
}

// ========================
// Confetti Canvas
// ========================
function Confetti({ active, duration = 2300 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const { w, h } = useWindowSize();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pieces = [];
    const colors = ["#ff5aa7", "#ffb3d5", "#ffd1e6", "#7a1f4e", "#2ecc71", "#f1c40f", "#3498db"];

    for (let i = 0; i < 240; i++) {
      pieces.push({
        x: rand(0, w),
        y: rand(-h, 0),
        r: rand(2, 6),
        vx: rand(-2.2, 2.2),
        vy: rand(2, 5.2),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.18, 0.18),
        color: pick(colors),
        shape: Math.random() < 0.2 ? "heart" : "rect",
      });
    }

    const drawHeart = (x, y, size) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 12, size / 12);
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(0, -3, -6, -3, -6, 2);
      ctx.bezierCurveTo(-6, 6, 0, 9, 0, 12);
      ctx.bezierCurveTo(0, 9, 6, 6, 6, 2);
      ctx.bezierCurveTo(6, -3, 0, -3, 0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const animate = (ts) => {
      if (!active) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.y > h + 20) {
          p.y = rand(-120, -20);
          p.x = rand(0, w);
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
          ctx.restore();
        } else {
          ctx.restore();
          ctx.fillStyle = p.color;
          drawHeart(p.x, p.y, p.r * 3.2);
        }
      }

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    if (active) {
      startRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, w, h, duration]);

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}

// ========================
// Floating Hearts Background
// ========================
function FloatingHearts({ active }) {
  const prefersReduced = usePrefersReducedMotion();

  const hearts = useMemo(() => {
    const count = 16;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: rand(0, 100),
      delay: rand(0, 6),
      dur: rand(6, 11),
      size: rand(14, 32),
      opacity: rand(0.18, 0.48),
    }));
  }, []);

  if (!active || prefersReduced) return null;

  return (
    <div className="hearts-layer" aria-hidden="true">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="float-heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
          }}
        >
          💗
        </div>
      ))}
    </div>
  );
}

// ========================
// APP
// ========================
export default function App() {
  const prefersReduced = usePrefersReducedMotion();

  /**
   * step:
   * 0 = splash
   * 1 = intro story
   * 2 = main question
   * 3 = accepted
   */
  const [step, setStep] = useState(0);

  // No interactions
  const [noClicks, setNoClicks] = useState(0);

  // No button position
  const cardRef = useRef(null);
  const [cardBox, setCardBox] = useState({ w: 0, h: 0 });
  const [noPos, setNoPos] = useState({ x: 260, y: 290 });

  // confetti
  const [confettiOn, setConfettiOn] = useState(false);

  // music
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(false);

  // intro index
  const [introIndex, setIntroIndex] = useState(0);

  // read card size
  useEffect(() => {
    const update = () => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCardBox({ w: r.width, h: r.height });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Top banner text
  const topBannerText = useMemo(() => {
    return `Sa tingin mo… mag-YES ka kaya ${PERSON_NAME}? 🥺💗`;
  }, []);

  // Intro cards (kilig + taglish)
  const introCards = useMemo(() => {
    return [
      {
        title: `Hi ${PERSON_NAME}…`,
        lines: [
          "Wag ka kikiligin ha HAHAHAHA😳",
          "I love you Baby",
          "Tskk baka kinikilig kana 💌",
          "Para sayo lang to ha naks"
        ],
        btn: "Sige nga ➜",
      },
      {
        title: "Quick lang…",
        lines: [
          "Alam mo yung feeling na…",
          "bigla kang napapangiti",
          "kahit wala namang reason? 😭",
        ],
        btn: "Hala… 😅",
      },
      {
        title: "Kasi…",
        lines: [
          `Ikaw yun, ${PERSON_NAME}.`,
          "Ang simple mo lang pero…",
          "ang lakas ng tama mo sakin. 🥺💗",
        ],
        btn: "Ano ba yan 😳",
      },
      {
        title: "Promise…",
        lines: [
          "Walang pressure.",
          "Walang pilitan.",
          "Pero sana basahin mo hanggang dulo…",
        ],
        btn: "Okay, go 😤",
      },
      {
        title: "So eto na…",
        lines: [
          "Ready ka na ba?",
          "Kasi once makita mo ‘to…",
          "baka kiligin ka rin. 😭💗",
        ],
        btn: "Show mo na 😭",
      },
    ];
  }, []);

  // No button lines
  const noLines = useMemo(() => {
    return [
      "No 😅",
      "Sure ka? 🥺",
      "Wait lang… 😳",
      "Isip ka muna pls 😭",
      "Halaaa, wag naman 😔",
      "Final answer na ba yan?",
      `${PERSON_NAME} pls 🥺💗`,
      "Sige na oh… 🥲",
      "Di ako papayag 😤",
      "One more chance? 😭",
      "Ang sakit ha… 🥹",
      "Uy uy, think again 😵‍💫",
      "Baka nagbibiro ka lang 😭",
      "Okay, last na… sure?",
      "Pag nag-No ka, iiyak ako 😭",
      "Sige naaaa… 😔💗",
      "Please? please? 🥺",
      "Gusto mo talaga No? 🥲",
      "Pindutin mo na YES dali 😤💗",
      "Okay… pero YES bagay sayo 😭💗",
    ];
  }, []);

  const noText = noLines[Math.min(noClicks, noLines.length - 1)];

  // YES grows per NO click
  const yesScale = clamp(1 + noClicks * 0.12, 1, 4.1);

  const yesLabel = useMemo(() => {
    if (noClicks >= 12) return "YES 😭💗";
    if (noClicks >= 7) return "Yes 🥺";
    if (noClicks >= 3) return "Yes 💘";
    return "Yes";
  }, [noClicks]);

  const moveNo = () => {
    const btnW = 190;
    const btnH = 46;
    const pad = 16;

    const maxX = Math.max(pad, cardBox.w - btnW - pad);
    const maxY = Math.max(pad, cardBox.h - btnH - pad);

    const x = rand(pad, maxX);
    const y = rand(cardBox.h * 0.56, maxY);

    setNoPos({ x, y });
  };

  const handleNo = () => {
    setNoClicks((c) => c + 1);
    if (!prefersReduced) moveNo();
  };

  const handleYes = () => {
    setStep(3);
    if (ENABLE_CONFETTI) {
      setConfettiOn(true);
      setTimeout(() => setConfettiOn(false), 2400);
    }
  };

  const toggleMusic = async () => {
    if (!ENABLE_MUSIC) return;
    try {
      const el = audioRef.current;
      if (!el) return;
      if (!musicOn) {
        await el.play();
        setMusicOn(true);
      } else {
        el.pause();
        setMusicOn(false);
      }
    } catch (e) {
      console.log("Music blocked:", e);
    }
  };

  const safeAutoPlayMusic = async () => {
    if (!ENABLE_MUSIC) return;
    try {
      const el = audioRef.current;
      if (!el) return;
      await el.play();
      setMusicOn(true);
    } catch (e) {
      console.log("Autoplay blocked. User can press 🎵.", e);
    }
  };

  const goNextIntro = async () => {
    if (step === 0) {
      setStep(1);
      await safeAutoPlayMusic();
      return;
    }
  };

  const nextIntroCard = () => {
    if (introIndex < introCards.length - 1) setIntroIndex((i) => i + 1);
    else setStep(2);
  };

  const resetAll = () => {
    setNoClicks(0);
    setNoPos({ x: 260, y: 290 });
    setIntroIndex(0);
    setStep(0);
    setConfettiOn(false);
  };

  return (
    <div className="page">
      <style>{css}</style>

      {/* audio */}
      {ENABLE_MUSIC && <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />}

      {/* background hearts */}
      <FloatingHearts active={ENABLE_FLOATING_HEARTS && step !== 3} />

      {/* confetti */}
      {ENABLE_CONFETTI && <Confetti active={confettiOn} />}

      <div className="shell">
        <div className="card" ref={cardRef}>
          <div className="topBanner">{topBannerText}</div>

          {/* toolbar (tinanggal na yung "simple lang (frontend)") */}
          <div className="toolbar">
            <div className="toolbarLeft">
              <span className="pill">{PERSON_NAME} 💗</span>
            </div>

            <div className="toolbarRight">
              {ENABLE_MUSIC && (
                <button className="iconBtn" onClick={toggleMusic} type="button" title="Music">
                  {musicOn ? "🔊" : "🎵"}
                </button>
              )}
              <button className="iconBtn" onClick={resetAll} type="button" title="Restart">
                ↺
              </button>
            </div>
          </div>

          {/* CONTENT */}
          {step === 0 && (
            <div className="center">
              {/* PHOTO */}
              <div className="heroPhotoWrap">
                <img className="heroPhoto" src={PERSON_PHOTO} alt={`${PERSON_NAME} photo`} />
                <div className="photoGlow" aria-hidden="true" />
              </div>

              <div className="titleXL">
                <Typewriter text={`${PERSON_NAME}…`} speed={32} startDelay={250} />
              </div>

              <div className="sub">
                <Typewriter
                  text="Hi baby may tanong ako… pero wag ka kabahan, pero kabahan ka baka bigla akong mag will you marry me eh I click mo muna ung open😭💗"
                  speed={18}
                  startDelay={850}
                />
              </div>

              <button className="primaryBtn" onClick={goNextIntro} type="button">
                Open 💌
              </button>

            </div>
          )}

          {step === 1 && (
            <div className="center">
              <div className="heroRow">
                <div className="heroMiniPhoto">
                  <img className="miniPhoto" src={PERSON_PHOTO} alt={`${PERSON_NAME} mini`} />
                </div>

                <div className="bearMini" aria-hidden="true">
                  🧸💗
                </div>
              </div>

              <div className="storyTitle">{introCards[introIndex].title}</div>

              <div className="storyBox">
                {introCards[introIndex].lines.map((line, i) => (
                  <p className="storyLine" key={i}>
                    <Typewriter
                      text={line}
                      speed={18}
                      startDelay={i * 420}
                      cursor={i === introCards[introIndex].lines.length - 1}
                    />
                  </p>
                ))}
              </div>

              <button className="primaryBtn" onClick={nextIntroCard} type="button">
                {introCards[introIndex].btn}
              </button>

              <div className="progress">
                <div
                  className="progressBar"
                  style={{ width: `${((introIndex + 1) / introCards.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="center">
              <div className="photoBadgeWrap">
                <div className="photoBadge">
                  <img className="badgePhoto" src={PERSON_PHOTO} alt={`${PERSON_NAME} badge`} />
                </div>
                <div className="badgeText">
             
              
                </div>
              </div>

              <div className="question">{PERSON_NAME}, will you be my Valentine? 💘</div>

              <div className="buttonsArea">
                <button
                  className="yesBtn"
                  onClick={handleYes}
                  type="button"
                  style={{ transform: `scale(${yesScale})` }}
                >
                  {yesLabel}
                </button>

                <button
                  className="noBtn"
                  onClick={handleNo}
                  type="button"
                  style={{ left: `${noPos.x}px`, top: `${noPos.y}px` }}
                >
                  {noText}
                </button>
              </div>

             

              <div className="tiny">
                From: <b>{YOUR_NAME}</b> • Date: <b>{VALENTINE_DATE}</b>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="center">
              <div className="spark">✨💖✨</div>

              <div className="titleXL">YAYYYYY 😭💗</div>

              <div className="sub">
                <b>{PERSON_NAME}</b>, grabe… kinilig ako legit. 🥺
              </div>

              <div className="finalHero">
                <img className="finalPhoto" src={PERSON_PHOTO} alt={`${PERSON_NAME} final`} />
                <div className="finalOverlay">Valentine ✅</div>
              </div>

              <div className="finalBox">
                <div className="finalLine">
                  <span className="label">Status:</span>
                  <span className="value">Official Valentine ✅</span>
                </div>
                <div className="finalLine">
                  <span className="label">Date:</span>
                  <span className="value">{VALENTINE_DATE}</span>
                </div>
                <div className="finalLine">
                  <span className="label">Deal:</span>
                  <span className="value">Libre hug + libre kilig 💗</span>
                </div>
                <div className="finalLine">
                  <span className="label">Promise:</span>
                  <span className="value">Mahal na mahal kita baby Kahit makulit ka🧸</span>
                </div>
              </div>

              <div className="finalNote">
                Baby, thank you… made my heart happy ayuneh hyss. 🥺💗
              </div>

              <div className="row">
               
                <button className="secondaryBtn" onClick={resetAll} type="button">
                 baka gusto mo ulitin love para kiligin kapa  ↺
                </button>
              </div>
            </div>
          )}
        </div>

        {/* tinanggal na yung footer tip */}
      </div>
    </div>
  );
}

// ========================
// CSS (responsive)
// ========================
const css = `
:root{
  --pink:#ff5aa7;
  --pink2:#ffb3d5;
  --bg1:#ffd1e6;
  --ink:#2b2b2b;
  --card:#ffffff;
  --shadow:0 18px 60px rgba(0,0,0,.12);
  --stroke:#ffb3d5;
  --green:#2ecc71;
  --red:#c0392b;
}

*{ box-sizing:border-box; }

.page{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px;
  background:
    radial-gradient(circle at 20% 20%, var(--bg1) 0%, #ffe9f4 45%, #ffffff 100%);
  font-family: Arial, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, sans-serif;
  overflow:hidden;
}

.shell{ width:min(780px, 96vw); }

.card{
  position:relative;
  background:var(--card);
  border-radius:22px;
  padding:18px;
  box-shadow: var(--shadow);
  overflow:hidden;
}

.topBanner{
  text-align:center;
  font-weight:900;
  font-size:46px;
  color:var(--pink);
  -webkit-text-stroke: 3px var(--stroke);
  text-shadow:0 2px 0 rgba(0,0,0,.06);
  margin:10px 8px 14px;
  line-height:1.05;
}

.toolbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin:0 8px 12px;
}
.toolbarLeft, .toolbarRight{
  display:flex;
  align-items:center;
  gap:10px;
}

.pill{
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  font-weight:800;
  color:#7a1f4e;
  background:rgba(255,90,167,.14);
  border:1px solid rgba(255,90,167,.22);
}

.iconBtn{
  height:34px;
  width:34px;
  border-radius:10px;
  border:1px solid rgba(0,0,0,.10);
  background:#fff;
  cursor:pointer;
  font-weight:900;
}
.iconBtn:hover{ transform: translateY(-1px); }

.center{
  text-align:center;
  padding:12px 10px 16px;
}

/* HERO PHOTO (splash) */
.heroPhotoWrap{
  position:relative;
  width:min(260px, 70vw);
  margin:6px auto 12px;
  border-radius:22px;
  overflow:hidden;
  box-shadow:0 16px 36px rgba(0,0,0,.18);
  border:2px solid rgba(255,90,167,.18);
  background:#fff;
}
.heroPhoto{
  width:100%;
  height:auto;
  display:block;
}
.photoGlow{
  position:absolute;
  inset:-30px;
  background: radial-gradient(circle at 30% 30%, rgba(255,90,167,.30), transparent 60%);
  pointer-events:none;
}

.titleXL{
  font-size:44px;
  font-weight:900;
  color:#5a1b3a;
  letter-spacing:-1px;
  margin:6px 0 8px;
}

.sub{
  color:rgba(0,0,0,.65);
  font-size:16px;
  font-weight:700;
  margin:0 0 16px;
}

.primaryBtn{
  height:46px;
  padding:0 20px;
  border-radius:999px;
  border:none;
  background:var(--pink);
  color:white;
  font-weight:900;
  cursor:pointer;
  box-shadow:0 10px 20px rgba(255,90,167,.32);
}
.primaryBtn:hover{ transform: translateY(-1px); }

.secondaryBtn{
  height:42px;
  padding:0 16px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.12);
  background:#fff;
  cursor:pointer;
  font-weight:800;
  color:rgba(0,0,0,.75);
}
.secondaryBtn:hover{ transform: translateY(-1px); }

.row{
  display:flex;
  justify-content:center;
  gap:10px;
  flex-wrap:wrap;
}

.hint{
  margin-top:12px;
  color:rgba(0,0,0,.55);
  font-size:13px;
  font-weight:700;
}

/* intro */
.heroRow{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  margin:8px 0 10px;
  flex-wrap:wrap;
}
.heroMiniPhoto{
  width:86px;
  height:86px;
  border-radius:18px;
  overflow:hidden;
  border:2px solid rgba(255,90,167,.20);
  box-shadow:0 12px 26px rgba(0,0,0,.14);
}
.miniPhoto{ width:100%; height:100%; object-fit:cover; display:block; }
.bearMini{ font-size:30px; opacity:.9; }

.storyTitle{
  font-size:34px;
  font-weight:900;
  color:#5a1b3a;
  letter-spacing:-.8px;
  margin-bottom:12px;
}
.storyBox{
  max-width:560px;
  margin:0 auto 14px;
  padding:16px 16px 10px;
  border-radius:18px;
  background:rgba(255,90,167,.10);
  border:1px solid rgba(255,90,167,.18);
}
.storyLine{
  margin:10px 0;
  font-size:18px;
  color:#5a1b3a;
  font-weight:800;
}
.progress{
  height:10px;
  width:min(520px, 90%);
  margin:14px auto 0;
  border-radius:999px;
  background:rgba(0,0,0,.06);
  overflow:hidden;
  border:1px solid rgba(0,0,0,.06);
}
.progressBar{
  height:100%;
  background:linear-gradient(90deg, var(--pink), #ff8fc4);
  border-radius:999px;
}

/* question area photo badge */
.photoBadgeWrap{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  margin:4px 0 10px;
  flex-wrap:wrap;
}
.photoBadge{
  width:70px;
  height:70px;
  border-radius:18px;
  overflow:hidden;
  border:2px solid rgba(255,90,167,.22);
  box-shadow:0 12px 26px rgba(0,0,0,.14);
}
.badgePhoto{ width:100%; height:100%; object-fit:cover; display:block; }
.badgeText{ text-align:left; }
.badgeName{ font-weight:900; color:#5a1b3a; font-size:18px; line-height:1.1; }
.badgeSub{ font-weight:800; color:rgba(0,0,0,.55); font-size:12px; }

.question{
  font-size:28px;
  font-weight:800;
  margin:0 0 10px;
  color:#333;
}

.buttonsArea{
  position:relative;
  height:320px;
  margin-top:8px;
}

/* yes big */
.yesBtn{
  width:220px;
  height:220px;
  border:none;
  background:var(--green);
  color:white;
  font-size:64px;
  font-weight:900;
  cursor:pointer;
  box-shadow:0 14px 28px rgba(46,204,113,.35);
  transform-origin:center;
  transition: transform 120ms ease;
  display:inline-flex;
  align-items:center;
  justify-content:center;
}

/* no moves */
.noBtn{
  position:absolute;
  height:46px;
  padding:0 14px;
  border:none;
  background:var(--red);
  color:white;
  font-weight:900;
  cursor:pointer;
  border-radius:3px;
  box-shadow:0 12px 22px rgba(192,57,43,.25);
  transition:left 140ms ease, top 140ms ease;
  white-space:nowrap;
}

.microHint{
  margin-top:10px;
  color:rgba(0,0,0,.55);
  font-size:13px;
  font-weight:700;
}
.tiny{
  margin-top:8px;
  color:rgba(0,0,0,.55);
  font-size:12px;
  font-weight:700;
}

.spark{ font-size:26px; margin-bottom:6px; }

.finalHero{
  width:min(360px, 86vw);
  margin:12px auto 0;
  border-radius:22px;
  overflow:hidden;
  box-shadow:0 18px 40px rgba(0,0,0,.18);
  border:2px solid rgba(255,90,167,.20);
  position:relative;
}
.finalPhoto{ width:100%; height:auto; display:block; }
.finalOverlay{
  position:absolute;
  bottom:10px;
  right:10px;
  background:rgba(255,255,255,.90);
  border:1px solid rgba(0,0,0,.10);
  padding:8px 10px;
  border-radius:999px;
  font-weight:900;
  color:#5a1b3a;
}

.finalBox{
  width:min(560px, 94%);
  margin:12px auto 0;
  padding:14px 16px;
  border-radius:18px;
  background:rgba(255,90,167,.10);
  border:1px solid rgba(255,90,167,.18);
  text-align:left;
}
.finalLine{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:8px 0;
  border-bottom:1px dashed rgba(0,0,0,.12);
}
.finalLine:last-child{ border-bottom:none; }
.label{ color:rgba(0,0,0,.55); font-weight:800; }
.value{ color:#5a1b3a; font-weight:900; }

.finalNote{
  margin-top:12px;
  color:rgba(0,0,0,.55);
  font-weight:800;
}

.tw-cursor{
  display:inline-block;
  margin-left:2px;
  animation: blink 0.9s steps(1) infinite;
  opacity:0.9;
}
.tw-cursor-done{
  opacity:0.35;
  animation:none;
}
@keyframes blink{
  50%{ opacity:0; }
}

.confetti{
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:50;
}

.hearts-layer{
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:1;
  overflow:hidden;
}
.float-heart{
  position:absolute;
  bottom:-40px;
  animation-name: floatUp;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,.10));
}
@keyframes floatUp{
  0%{ transform: translateY(0) rotate(0deg); }
  50%{ transform: translateY(-60vh) rotate(10deg); }
  100%{ transform: translateY(-110vh) rotate(-10deg); }
}

/* Responsive */
@media (max-width: 560px){
  .topBanner{ font-size:32px; -webkit-text-stroke: 2px var(--stroke); }
  .titleXL{ font-size:34px; }
  .storyTitle{ font-size:26px; }
  .storyLine{ font-size:16px; }
  .question{ font-size:22px; }
  .yesBtn{ width:185px; height:185px; font-size:52px; }
  .buttonsArea{ height:300px; }
  .badgeText{ text-align:center; }
}

/* super small phones */
@media (max-width: 380px){
  .topBanner{ font-size:28px; }
  .yesBtn{ width:170px; height:170px; font-size:48px; }
  .noBtn{ height:44px; }
}
`;
