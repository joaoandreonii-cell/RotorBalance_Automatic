import { useState, useMemo } from "react";

/* ─── Math ──────────────────────────────────────────────────────────────────── */
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
const VBOX  = 400;
const C     = VBOX / 2;

function mToS(mx, my, s) { return [C + mx * s, C - my * s]; }
function parseVal(s) {
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) || n <= 0 ? null : n;
}
function computeResult(Vo, V1, V2, V3, Mt) {
  const Px = (V3*V3 - V2*V2) / (2*Math.sqrt(3)*Vo);
  const Py = (V2*V2 + V3*V3 - 2*V1*V1) / (6*Vo);
  const OP = Math.sqrt(Px*Px + Py*Py);
  if (OP < 0.0001) return null;
  let angle = toDeg(Math.atan2(Px, Py));
  if (angle < 0) angle += 360;
  return { Px, Py, OP, angle, Mc: (Mt*Vo)/OP };
}
function niceTick(v) {
  const raw = v/3, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw/mag;
  if (n < 1.5) return mag; if (n < 3.5) return 2*mag;
  if (n < 7.5) return 5*mag; return 10*mag;
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const INPUTS = [
  { key:"Vo", sym:"V₀", label:"Vibração original",    sub:"sem massa de teste", color:"#e2e8f0" },
  { key:"V1", sym:"V₁", label:"Massa em 0°",           sub:"vibração com teste", color:"#38bdf8" },
  { key:"V2", sym:"V₂", label:"Massa em 120°",         sub:"vibração com teste", color:"#4ade80" },
  { key:"V3", sym:"V₃", label:"Massa em 240°",         sub:"vibração com teste", color:"#f472b6" },
  { key:"Mt", sym:"Mₜ", label:"Massa de teste",        sub:"valor em gramas",    color:"#fbbf24" },
];
const EMPTY = { Vo:"", V1:"", V2:"", V3:"", Mt:"" };
const ARC_C = ["#38bdf8","#4ade80","#f472b6"];

const STEPS = [
  { num:"01", color:"#38bdf8",  title:"Divida o rotor em 3 posições",
    body:"Marque três posições igualmente espaçadas no rotor: Posição 1 em 0°, Posição 2 em 120° e Posição 3 em 240°. Use uma referência fixa (ex.: marca de fita) para garantir a repetibilidade das medições." },
  { num:"02", color:"#e2e8f0", title:"Medição sem massa — V₀",
    body:"Com o rotor na rotação de trabalho, meça a vibração sem nenhuma massa adicional. Este é o valor V₀, a vibração original. Registre a amplitude (mm/s ou µm)." },
  { num:"03", color:"#38bdf8",  title:"Medição com massa em 0° — V₁",
    body:"Fixe a massa de teste Mₜ na Posição 1 (0°) e meça a vibração. A massa deve ser conhecida e fixada sempre no mesmo raio." },
  { num:"04", color:"#4ade80", title:"Medição com massa em 120° — V₂",
    body:"Mova Mₜ para a Posição 2 (120°) e meça novamente. Garanta condições operacionais idênticas entre todas as medições." },
  { num:"05", color:"#f472b6", title:"Medição com massa em 240° — V₃",
    body:"Mova Mₜ para a Posição 3 (240°) e meça. Ao final você terá as 4 medições necessárias: V₀, V₁, V₂ e V₃." },
  { num:"06", color:"#fbbf24", title:"Insira os dados e leia o resultado",
    body:"Digite todos os valores nos campos. O diagrama polar e a massa de correção Mc serão calculados automaticamente em tempo real." },
];

/* ─── Help Modal ────────────────────────────────────────────────────────────── */
function HelpModal({ onClose }) {
  const [tab, setTab] = useState("proc");
  return (
    <div onClick={onClose} className="overlay">
      <div onClick={e => e.stopPropagation()} className="modal">
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">Ajuda &amp; Documentação</p>
            <h2 className="modal-h">Balanceamento de Três Pontos</h2>
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="tab-bar">
          {[{id:"proc",label:"Procedimento"},{id:"calc",label:"Cálculo"}].map(({id,label}) => (
            <button key={id} onClick={() => setTab(id)}
              className={`tab-btn ${tab===id?"tab-btn--on":""}`}>{label}</button>
          ))}
        </div>
        <div className="modal-body">
          {tab === "proc" && <>
            <p className="prose">São necessárias <strong>4 medições de vibração</strong> e uma massa de teste conhecida para determinar a massa e ângulo de correção sem instrumentação de fase.</p>
            {STEPS.map(({num,title,color,body}) => (
              <div key={num} className="step">
                <div className="step-num" style={{color,borderColor:color+"40",background:color+"12"}}>{num}</div>
                <div>
                  <p className="step-title" style={{color}}>{title}</p>
                  <p className="step-body">{body}</p>
                </div>
              </div>
            ))}
            <div className="tip">
              <span className="tip-label">Boas práticas —</span> Mantenha temperatura, carga e rotação idênticas entre medições. Repita cada medição 3× e use a média para maior precisão.
            </div>
          </>}
          {tab === "calc" && <>
            <p className="prose">Esta ferramenta resolve analiticamente a interseção dos três arcos, encontrando o ponto P de forma exata — o equivalente matemático do método gráfico com compasso.</p>
            {[
              { color:"#a78bfa", title:"Coordenadas do ponto P", code:["Px = (V₃² − V₂²) / (2·√3·V₀)","Py = (V₂² + V₃² − 2·V₁²) / (6·V₀)"],
                note:"P₁, P₂, P₃ ficam sobre o círculo de raio V₀. Cada arco tem raio igual à vibração medida naquela posição. Os três arcos se encontram em P." },
              { color:"#fbbf24", title:"Distância OP e ângulo", code:["OP = √(Px² + Py²)","θ  = atan2(Px, Py)  →  0° a 360°"],
                note:"O ângulo θ indica onde posicionar a massa de correção, em graus no sentido horário a partir de 0°." },
              { color:"#4ade80", title:"Massa de correção", code:["Mc = Mₜ × V₀ / OP"],
                note:"Se OP < V₀ então Mc > Mₜ. Se OP > V₀ então Mc < Mₜ. Fixe Mc no ângulo θ para corrigir o desbalanceamento." },
            ].map(({color,title,code,note}) => (
              <div key={title} className="calc-card">
                <div className="calc-accent" style={{background:color}}/>
                <div>
                  <p className="calc-title">{title}</p>
                  <div className="code-box">{code.map(l=><div key={l}>{l}</div>)}</div>
                  <p className="calc-note">{note}</p>
                </div>
              </div>
            ))}
            <div className="example-card">
              <p className="ex-label">Exemplo do PDF</p>
              <div className="ex-grid">
                {[["V₀","8,00"],["V₁","11,05"],["V₂","3,82"],["V₃","15,09"],["Mₜ","4,5 g"]].map(([k,v])=>(
                  <div key={k} className="ex-cell"><span className="ex-k">{k}</span><span className="ex-v">{v}</span></div>
                ))}
              </div>
              <div className="code-box" style={{marginTop:10}}>
                <div>OP ≈ <span style={{color:"#fbbf24"}}>7,69</span></div>
                <div>θ  ≈ <span style={{color:"#fbbf24"}}>90,3°</span></div>
                <div>Mc ≈ <span style={{color:"#4ade80",fontWeight:700}}>4,68 g</span></div>
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

/* ─── Polar Diagram ─────────────────────────────────────────────────────────── */
function Diagram({ pv, result }) {
  const { Vo, V1, V2, V3 } = pv;
  const scale = useMemo(() => {
    if (!Vo) return null;
    const ext = Math.max(V1||0, V2||0, V3||0, Vo*0.6);
    return (VBOX/2*0.76) / (Vo+ext);
  }, [pv]);
  const pts = useMemo(() => {
    if (!Vo||!scale) return null;
    return [
      mToS(0, Vo, scale),
      mToS(Vo*Math.sin(toRad(120)), Vo*Math.cos(toRad(120)), scale),
      mToS(Vo*Math.sin(toRad(240)), Vo*Math.cos(toRad(240)), scale),
    ];
  }, [Vo, scale]);
  const pPt = useMemo(() => (!result||!scale) ? null : mToS(result.Px, result.Py, scale), [result, scale]);
  const rings = useMemo(() => {
    if (!Vo||!scale) return [];
    const step = niceTick(Vo);
    const ext  = Vo + Math.max(V1||0, V2||0, V3||0, Vo*0.6);
    const r = [];
    for (let v = step; v <= ext*1.1; v += step) r.push({ v, sr: v*scale, major: v%(step*2)===0 });
    return r;
  }, [pv, scale]);
  const aaPath = useMemo(() => {
    if (!result||!scale||!Vo) return null;
    const ar = Vo*scale*0.32, a = result.angle;
    return `M ${C+ar*Math.sin(0)} ${C-ar*Math.cos(0)} A ${ar} ${ar} 0 ${a>180?1:0} 1 ${C+ar*Math.sin(toRad(a))} ${C-ar*Math.cos(toRad(a))}`;
  }, [result, scale, Vo]);

  return (
    <svg viewBox={`0 0 ${VBOX} ${VBOX}`} style={{display:"block",width:"100%",height:"auto"}} aria-label="Diagrama polar">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0d1520" />
          <stop offset="100%" stopColor="#060911" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowSm" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={VBOX} height={VBOX} fill="url(#bgGrad)" rx={10}/>

      {/* Subtle inner vignette */}
      <radialGradient id="vig" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stopColor="transparent"/>
        <stop offset="100%" stopColor="rgba(0,0,0,0.35)"/>
      </radialGradient>
      <rect width={VBOX} height={VBOX} fill="url(#vig)" rx={10}/>

      {/* Grid rings */}
      {rings.map(({v, sr, major}, i) => (
        <g key={i}>
          <circle cx={C} cy={C} r={sr} fill="none"
            stroke={major?"#1e2d40":"#131e2c"} strokeWidth={major?0.8:0.5}/>
          {major && Vo && <text x={C+4} y={C-sr-3} fill="#253346" fontSize="6.5" fontFamily="monospace">
            {v.toFixed(v<1?2:v<10?1:0)}
          </text>}
        </g>
      ))}

      {/* Radial spokes */}
      {Array.from({length:12},(_,i) => {
        const a = i*30, r = VBOX/2*0.86;
        return <line key={a} x1={C} y1={C}
          x2={C+r*Math.sin(toRad(a))} y2={C-r*Math.cos(toRad(a))}
          stroke={a%90===0?"#1e2d40":"#131e2c"} strokeWidth={a%90===0?0.8:0.5}/>;
      })}

      {/* Angle labels */}
      {Array.from({length:12},(_,i) => {
        const a = i*30, lr = VBOX/2*0.92, key = a%120===0;
        return <text key={a} x={C+lr*Math.sin(toRad(a))} y={C-lr*Math.cos(toRad(a))}
          textAnchor="middle" dominantBaseline="middle"
          fill={key?"#2e4a66":"#1a2b3c"} fontSize={key?9:7}
          fontFamily="monospace" fontWeight={key?600:400}>{a}°</text>;
      })}

      {/* Vo circle — glowing ring */}
      {Vo && scale && <>
        <circle cx={C} cy={C} r={Vo*scale} fill="none" stroke="#38bdf820" strokeWidth={8}/>
        <circle cx={C} cy={C} r={Vo*scale} fill="none" stroke="#38bdf840" strokeWidth={2.5}/>
        <circle cx={C} cy={C} r={Vo*scale} fill="none" stroke="#5eead480" strokeWidth={1} filter="url(#glowSm)"/>
      </>}

      {/* V1 V2 V3 arcs */}
      {pts && [{v:V1,i:0},{v:V2,i:1},{v:V3,i:2}].map(({v,i}) =>
        v && scale ? <>
          <circle key={"bg"+i} cx={pts[i][0]} cy={pts[i][1]} r={v*scale}
            fill="none" stroke={ARC_C[i]+"20"} strokeWidth={4}/>
          <circle key={"fg"+i} cx={pts[i][0]} cy={pts[i][1]} r={v*scale}
            fill="none" stroke={ARC_C[i]} strokeWidth={1.2}
            strokeDasharray="6 3.5" opacity={0.75}/>
        </> : null
      )}

      {/* Angle arc */}
      {aaPath && <>
        <path d={aaPath} fill="none" stroke="#fbbf2460" strokeWidth={8} strokeLinecap="round"/>
        <path d={aaPath} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round"/>
        <line x1={C} y1={C} x2={C} y2={C - Vo*scale*0.32}
          stroke="#fbbf2450" strokeWidth={1} strokeDasharray="3 3"/>
      </>}

      {/* O→P vector */}
      {pPt && <>
        <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]}
          stroke="#f59e0b40" strokeWidth={6}/>
        <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]}
          stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
      </>}

      {/* Position points 1 2 3 */}
      {pts && pts.map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={11} fill={ARC_C[i]+"18"}/>
          <circle cx={x} cy={y} r={6}  fill={ARC_C[i]+"30"} filter="url(#glowSm)"/>
          <circle cx={x} cy={y} r={4}  fill={ARC_C[i]} opacity={0.95}/>
          <text x={x+(i===2?-13:13)} y={y+(i===0?-13:5)}
            fill={ARC_C[i]} fontSize={9} fontFamily="monospace" fontWeight={600}
            textAnchor={i===2?"end":"start"} opacity={0.9}>
            {["1·0°","2·120°","3·240°"][i]}
          </text>
        </g>
      ))}

      {/* Origin */}
      <circle cx={C} cy={C} r={5} fill="#0d1520" stroke="#38bdf450" strokeWidth={1.5}/>
      <circle cx={C} cy={C} r={2} fill="#4b6a8a"/>

      {/* Point P */}
      {pPt && <>
        <circle cx={pPt[0]} cy={pPt[1]} r={16} fill="#f59e0b08"/>
        <circle cx={pPt[0]} cy={pPt[1]} r={9}  fill="#f59e0b18" filter="url(#glow)"/>
        <circle cx={pPt[0]} cy={pPt[1]} r={5}  fill="#f59e0b" filter="url(#glowSm)"/>
        <line x1={pPt[0]-8} y1={pPt[1]}   x2={pPt[0]+8} y2={pPt[1]}   stroke="#f59e0b90" strokeWidth={1.5}/>
        <line x1={pPt[0]}   y1={pPt[1]-8} x2={pPt[0]}   y2={pPt[1]+8} stroke="#f59e0b90" strokeWidth={1.5}/>
        <text x={pPt[0]+11} y={pPt[1]-9} fill="#f59e0b" fontSize={10}
          fontFamily="monospace" fontWeight={700} filter="url(#glowSm)">P</text>
      </>}

      {!Vo && <text x={C} y={C} textAnchor="middle" dominantBaseline="middle"
        fill="#1e3048" fontSize={12} fontFamily="monospace">
        Insira os valores para visualizar
      </text>}
    </svg>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const [raw, setRaw]   = useState(EMPTY);
  const [help, setHelp] = useState(false);

  const pv = useMemo(() => {
    const r = {};
    for (const k in raw) r[k] = parseVal(raw[k]);
    return r;
  }, [raw]);

  const { Vo, V1, V2, V3, Mt } = pv;
  const allFilled = Vo && V1 && V2 && V3 && Mt;
  const result    = useMemo(() => allFilled ? computeResult(Vo,V1,V2,V3,Mt) : null, [pv]);

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        :root {
          --bg:      #060911;
          --bg1:     #0b0f1a;
          --bg2:     #0f1520;
          --bg3:     #141d2e;
          --border:  rgba(255,255,255,0.06);
          --border2: rgba(255,255,255,0.09);
          --text:    #8da5bf;
          --text-hi: #dde8f4;
          --dim:     #3a5068;
          --amber:   #f59e0b;
          --cyan:    #38bdf8;
          --green:   #4ade80;
          --pink:    #f472b6;
          --mono:    'JetBrains Mono', monospace;
          --sans:    'Outfit', sans-serif;
          --r:       12px;
          --r-sm:    8px;
        }

        .app {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: clamp(16px,3vw,28px) clamp(12px,3vw,24px) 48px;
          gap: clamp(16px,2.5vw,24px);
        }

        /* ── Atmospheric background glow ── */
        .app::before {
          content:'';
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background:
            radial-gradient(ellipse 70% 50% at 65% 50%, rgba(56,189,248,0.03) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(245,158,11,0.025) 0%, transparent 60%);
        }
        .app > * { position:relative; z-index:1; }

        /* ── Header ── */
        .hdr {
          position:relative; text-align:center;
          width:100%; max-width:960px;
          padding: 0 clamp(36px,5vw,48px);
        }
        .hdr-eyebrow {
          font-family: var(--mono); font-size:clamp(8px,1.2vw,10px);
          letter-spacing:0.35em; color:var(--cyan); text-transform:uppercase;
          opacity:0.7; margin-bottom:8px;
        }
        .hdr-title {
          font-size:clamp(18px,3.5vw,26px); font-weight:700;
          color:var(--text-hi); letter-spacing:-0.03em;
          line-height:1.1;
        }
        .hdr-sub {
          font-family: var(--mono); font-size:clamp(8px,1vw,9px);
          color:var(--dim); margin-top:6px; letter-spacing:0.2em; text-transform:uppercase;
        }

        /* ── Help button ── */
        .help-btn {
          position:absolute; right:0; top:50%; transform:translateY(-50%);
          width:clamp(32px,4vw,36px); height:clamp(32px,4vw,36px); border-radius:50%;
          background:var(--bg2);
          border:1px solid var(--border2);
          color:var(--dim); font-size:15px; font-weight:600; font-family:Georgia,serif;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all .2s; box-shadow:0 2px 8px rgba(0,0,0,0.4);
        }
        .help-btn:hover { background:var(--bg3); border-color:var(--cyan); color:var(--cyan); box-shadow:0 0 12px rgba(56,189,248,0.2); }

        /* ── Main grid ── */
        .grid {
          display:grid;
          grid-template-columns: clamp(200px,24%,256px) 1fr;
          gap: clamp(12px,2vw,16px);
          width:100%; max-width:960px;
          align-items:start;
        }
        .left { display:flex; flex-direction:column; gap:clamp(10px,1.5vw,14px); }

        /* ── Cards ── */
        .card {
          background:var(--bg1);
          border:1px solid var(--border);
          border-radius:var(--r);
          padding:clamp(14px,2vw,20px);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.04) inset,
            0 8px 32px rgba(0,0,0,0.35);
          position:relative; overflow:hidden;
        }
        .card::before {
          content:''; position:absolute; top:0; left:16px; right:16px; height:1px;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }
        .card-label {
          font-family:var(--mono); font-size:9px; letter-spacing:0.25em;
          color:var(--dim); text-transform:uppercase; margin-bottom:clamp(12px,2vw,16px);
        }

        /* ── Inputs ── */
        .irow { margin-bottom:clamp(9px,1.4vw,12px); }
        .ilabel {
          display:flex; justify-content:space-between; align-items:baseline;
          margin-bottom:5px; gap:6px;
        }
        .isym  { font-family:var(--mono); font-size:11px; font-weight:600; flex-shrink:0; }
        .idesc { font-size:10px; color:var(--dim); text-align:right; line-height:1.35; }
        .ifield {
          width:100%; background:var(--bg2);
          border-radius:var(--r-sm); padding:clamp(8px,1.2vw,10px) 12px;
          font-size:clamp(14px,1.8vw,16px); font-family:var(--mono);
          transition:border-color .2s, box-shadow .2s, background .2s;
        }
        .ifield:focus { outline:none; background:var(--bg3); box-shadow:0 0 0 2px rgba(56,189,248,0.2); }
        .ifield::placeholder { color:var(--dim); opacity:0.5; }

        /* ── Divider ── */
        .sep { height:1px; background:var(--border); margin:clamp(12px,2vw,16px) 0; }

        /* ── Result empty ── */
        .res-empty { font-size:11px; color:var(--dim); line-height:1.75; }

        /* ── Result grid ── */
        .res-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
        .res-mini {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:var(--r-sm); padding:10px;
        }
        .res-mini-l { font-family:var(--mono); font-size:8px; color:var(--dim); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:4px; }
        .res-mini-v { font-family:var(--mono); font-size:clamp(14px,2vw,16px); color:#94a3b8; font-weight:500; }

        /* ── Result main ── */
        .res-main {
          background:linear-gradient(135deg, rgba(74,222,128,0.07), rgba(74,222,128,0.03));
          border:1px solid rgba(74,222,128,0.2);
          border-radius:var(--r);
          padding:clamp(12px,2vw,16px);
          position:relative; overflow:hidden;
        }
        .res-main::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent);
        }
        .res-main-kicker { font-family:var(--mono); font-size:8px; color:rgba(74,222,128,0.5); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:6px; }
        .res-mc   { font-family:var(--mono); font-size:clamp(28px,4vw,36px); color:var(--green); font-weight:700; line-height:1; letter-spacing:-0.02em; }
        .res-unit { font-size:clamp(13px,1.8vw,15px); font-weight:400; margin-left:3px; opacity:0.7; }
        .res-angle-lbl { font-size:11px; color:var(--dim); margin-top:10px; margin-bottom:2px; }
        .res-angle { font-family:var(--mono); font-size:clamp(20px,3vw,24px); color:#fbbf24; font-weight:700; letter-spacing:-0.02em; }
        .res-formula {
          font-family:var(--mono); font-size:9px; color:var(--dim); margin-top:10px;
          line-height:1.7; border-top:1px solid rgba(74,222,128,0.15); padding-top:10px;
        }

        /* ── Diagram card ── */
        .diag-card {
          background: linear-gradient(145deg, #0b0f1a, #080c14);
          border:1px solid var(--border);
          border-radius:var(--r);
          padding:clamp(12px,2vw,18px);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.04) inset,
            0 8px 48px rgba(0,0,0,0.5),
            0 0 80px rgba(56,189,248,0.03);
        }
        .diag-card::before {
          display:none; /* override */
        }

        /* ── Legend ── */
        .legend { display:flex; gap:clamp(8px,1.5vw,14px); margin-top:clamp(8px,1.5vw,12px); flex-wrap:wrap; }
        .leg-i  { display:flex; align-items:center; gap:5px; }
        .leg-line { width:16px; height:1.5px; border-radius:2px; opacity:0.7; }
        .leg-lbl { font-family:var(--mono); font-size:8.5px; color:var(--dim); }

        /* ── Footer ── */
        .footer { font-family:var(--mono); font-size:9px; color:#1e3048; letter-spacing:0.2em; }

        /* ═══════════════ MODAL ═══════════════ */
        .overlay {
          position:fixed; inset:0; z-index:300;
          background:rgba(4,6,14,0.82); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center; padding:16px;
        }
        .modal {
          background:var(--bg1); border:1px solid var(--border2);
          border-radius:14px; width:100%; max-width:560px;
          max-height:88vh; display:flex; flex-direction:column;
          overflow:hidden;
          box-shadow:0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .modal-head {
          display:flex; justify-content:space-between; align-items:flex-start;
          padding:20px 20px 0; flex-shrink:0;
        }
        .modal-eyebrow { font-family:var(--mono); font-size:9px; letter-spacing:0.3em; color:var(--amber); text-transform:uppercase; margin-bottom:5px; opacity:0.8; }
        .modal-h { font-size:17px; font-weight:700; color:var(--text-hi); letter-spacing:-0.02em; }
        .close-btn {
          background:var(--bg2); border:1px solid var(--border2); color:var(--dim);
          border-radius:7px; width:30px; height:30px; cursor:pointer; font-size:11px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          font-family:var(--sans); transition:all .15s;
        }
        .close-btn:hover { background:var(--bg3); color:var(--text-hi); }
        .tab-bar {
          display:flex; gap:2px; padding:12px 20px 0; flex-shrink:0;
          border-bottom:1px solid var(--border);
        }
        .tab-btn {
          background:none; border:1px solid transparent; border-bottom:none;
          color:var(--dim); border-radius:7px 7px 0 0;
          padding:7px 16px; font-size:11px; font-family:var(--sans); font-weight:500;
          cursor:pointer; margin-bottom:-1px; position:relative;
          transition:color .15s, background .15s;
        }
        .tab-btn--on { background:var(--bg2); border-color:var(--border); border-bottom-color:var(--bg2); color:var(--text-hi); }
        .tab-btn:not(.tab-btn--on):hover { color:var(--text); }
        .modal-body { overflow-y:auto; padding:20px; flex:1; }
        .prose { font-size:12px; color:var(--text); line-height:1.8; margin-bottom:20px; }
        .prose strong { color:var(--text-hi); }
        .step { display:flex; gap:12px; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid var(--border); }
        .step-num {
          flex-shrink:0; width:30px; height:30px; border-radius:7px;
          display:flex; align-items:center; justify-content:center;
          font-family:var(--mono); font-size:9px; font-weight:600; letter-spacing:0.1em; border:1px solid;
        }
        .step-title { font-size:12px; font-weight:600; color:var(--text-hi); margin-bottom:5px; }
        .step-body  { font-size:11px; color:var(--dim); line-height:1.7; }
        .tip {
          background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.15);
          border-radius:var(--r-sm); padding:12px 14px;
          font-size:11px; color:rgba(74,222,128,0.6); line-height:1.75; margin-top:4px;
        }
        .tip-label { color:var(--green); font-weight:600; }
        .calc-card { display:flex; gap:12px; margin-bottom:18px; padding-bottom:18px; border-bottom:1px solid var(--border); }
        .calc-accent { width:3px; min-height:100%; border-radius:2px; flex-shrink:0; margin-top:3px; }
        .calc-title { font-size:12px; font-weight:600; color:var(--text-hi); margin-bottom:8px; }
        .calc-note  { font-size:11px; color:var(--dim); line-height:1.7; margin-top:8px; }
        .code-box {
          background:var(--bg); border:1px solid var(--border); border-radius:7px;
          padding:10px 14px; font-family:var(--mono); font-size:12px;
          line-height:2; color:#6b8ba8;
        }
        .example-card { background:rgba(56,189,248,0.04); border:1px solid rgba(56,189,248,0.12); border-radius:var(--r); padding:14px; }
        .ex-label { font-family:var(--mono); font-size:9px; letter-spacing:0.2em; color:var(--cyan); text-transform:uppercase; margin-bottom:10px; opacity:0.7; }
        .ex-grid  { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:2px; }
        .ex-cell  { background:var(--bg2); border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; }
        .ex-k     { font-family:var(--mono); font-size:10px; color:var(--dim); }
        .ex-v     { font-family:var(--mono); font-size:11px; color:#7a9ab8; font-weight:500; }

        /* ═══════════════ BREAKPOINTS ═══════════════ */

        @media (max-width:800px) {
          .grid { grid-template-columns:1fr; }
          .left { flex-direction:row; align-items:flex-start; }
          .left > .card { flex:1; min-width:0; }
          .diag-card { order:-1; }
        }
        @media (max-width:560px) {
          .left { flex-direction:column; }
          .left > .card { width:100%; }
          .res-mc { font-size:30px; }
          .modal { max-height:92vh; border-radius:12px; }
          .modal-head { padding:16px 16px 0; }
          .modal-body { padding:16px; }
          .tab-bar { padding:10px 16px 0; }
        }
        @media (hover:none) {
          .ifield { padding:11px 12px; font-size:16px; }
          .help-btn { width:40px; height:40px; }
        }
      `}</style>

      {/* Header */}
      <header className="hdr">
        <p className="hdr-eyebrow">Manutenção Preditiva · Análise de Vibração</p>
        <h1 className="hdr-title">Balanceamento de Três Pontos</h1>
        <p className="hdr-sub">Método Gráfico-Analítico</p>
        <button className="help-btn" onClick={() => setHelp(true)} title="Tutorial e documentação">?</button>
      </header>

      {/* Grid */}
      <main className="grid">
        <div className="left">

          {/* Inputs */}
          <div className="card">
            <p className="card-label">Medições</p>
            {INPUTS.map(({ key, sym, label, sub, color }) => (
              <div key={key} className="irow">
                <div className="ilabel">
                  <span className="isym" style={{color}}>{sym}</span>
                  <span className="idesc">{label}<br/><span style={{color:"var(--dim)",opacity:.6}}>{sub}</span></span>
                </div>
                <input
                  className="ifield"
                  value={raw[key]}
                  onChange={e => setRaw(p => ({...p,[key]:e.target.value}))}
                  placeholder="0.00"
                  inputMode="decimal"
                  style={{
                    border:`1px solid ${pv[key] ? color+"30" : "var(--border)"}`,
                    color: pv[key] ? color : "var(--dim)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="card">
            <p className="card-label">Resultado</p>
            {!allFilled ? (
              <p className="res-empty">Preencha todos os campos para calcular a massa de correção.</p>
            ) : !result ? (
              <p style={{fontSize:11,color:"#ef4444"}}>Verifique os valores inseridos.</p>
            ) : (<>
              <div className="res-grid">
                {[["Dist. OP", result.OP.toFixed(3),""],["Ângulo",result.angle.toFixed(1),"°"]].map(([l,v,u]) => (
                  <div key={l} className="res-mini">
                    <p className="res-mini-l">{l}</p>
                    <p className="res-mini-v">{v}<span style={{fontSize:10,opacity:.6}}>{u}</span></p>
                  </div>
                ))}
              </div>
              <div className="res-main">
                <p className="res-main-kicker">Massa de Correção</p>
                <p className="res-mc">{result.Mc.toFixed(2)}<span className="res-unit">g</span></p>
                <p className="res-angle-lbl">Posicionar em</p>
                <p className="res-angle">{result.angle.toFixed(1)}°</p>
                <p className="res-formula">
                  Mc = Mₜ × V₀ / OP<br/>
                  {Mt} × {Vo} / {result.OP.toFixed(3)} = {result.Mc.toFixed(2)} g
                </p>
              </div>
            </>)}
          </div>
        </div>

        {/* Diagram */}
        <div className="diag-card card">
          <p className="card-label">Diagrama Polar</p>
          <Diagram pv={pv} result={result} />
          <div className="legend">
            {[
              {c:"#5eead4", l:"Círculo V₀"},
              {c:"#38bdf8", l:"Arco V₁ (0°)"},
              {c:"#4ade80", l:"Arco V₂ (120°)"},
              {c:"#f472b6", l:"Arco V₃ (240°)"},
              {c:"#f59e0b", l:"Vetor OP → Mc"},
            ].map(({c,l}) => (
              <div key={l} className="leg-i">
                <div className="leg-line" style={{background:c}}/>
                <span className="leg-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">Mc = Mₜ × V₀ / OP · Posições: 0° · 120° · 240°</footer>

      {help && <HelpModal onClose={() => setHelp(false)} />}
    </div>
  );
}
