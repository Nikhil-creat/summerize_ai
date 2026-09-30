// OmniParse AI v2 extras — Designed and Developed by Nikhil Chary Sriramoju
const STY={exec:'',eli5:' Additionally explain in plain language for a beginner using short analogies, without dropping any technical constraint.',qa:' Format the output as interview-style Q&A pairs (bold question, concise answer).',cheat:' Format as a dense cheat-sheet: headings, formulas, one-line rules, complexity notes.',review:' For code, add a "Risks & improvements" section listing bugs, edge cases and optimisations grounded only in the source.'};
const _llm=llm;llm=(s,u)=>_llm(s+(STY[$('#style').value]||''),u);
const rt=t=>Math.max(1,Math.round(t.split(/\s+/).length/200));const _l2=llm;llm=(s,u)=>_l2(s+($('#lang').value?` Write the final answer in ${$('#lang').value}; keep code identifiers and technical terms in English.`:''),u);
$$('.chips button').forEach(b=>b.onclick=()=>{$('#pct').value=b.dataset.p;$('#pct').oninput()});
const cv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
// neural particle field
(()=>{const c=$('#fx'),x=c.getContext('2d');let w,h,P;const rs=()=>{w=c.width=innerWidth;h=c.height=innerHeight;P=Array.from({length:Math.min(70,w/14|0)},()=>({x:Math.random()*w,y:Math.random()*h,vx:Math.random()-.5,vy:Math.random()-.5}))};rs();addEventListener('resize',rs);
(function f(){x.clearRect(0,0,w,h);const col=cv('--c');P.forEach((p,i)=>{p.x=(p.x+p.vx+w)%w;p.y=(p.y+p.vy+h)%h;x.fillStyle=col;x.fillRect(p.x,p.y,2,2);for(let j=i+1;j<P.length;j++){const d=Math.hypot(p.x-P[j].x,p.y-P[j].y);if(d<110){x.strokeStyle=col;x.globalAlpha=.25*(1-d/110);x.beginPath();x.moveTo(p.x,p.y);x.lineTo(P[j].x,P[j].y);x.stroke();x.globalAlpha=1}}});requestAnimationFrame(f)})()})();
$('#theme').onchange=e=>{const[a,b]=e.target.value.split(',');document.documentElement.style.setProperty('--c',a);document.documentElement.style.setProperty('--m',b);if(S.sum)graph()};
// integrity guard: concept retention + unverified identifier check
function integrity(){const src=S.text.toLowerCase(),sm=S.sum.toLowerCase(),top=keywords(S.text,20),cov=top.filter(k=>sm.includes(k.toLowerCase())).length,ids=[...new Set((S.sum.match(/`([^`]+)`/g)||[]).map(t=>t.slice(1,-1).split(/[^\w$]+/)[0]).filter(t=>t.length>2))];
  return{score:Math.round(cov/Math.max(top.length,1)*100),bad:ids.filter(i=>!src.includes(i.toLowerCase()))}}
// concept graph
function graph(){const c=$('#graph'),x=c.getContext('2d'),W=c.width,H=c.height,ks=S.kw.slice(0,12),sn=S.text.slice(0,30000).toLowerCase().match(/[^.!?\n]+/g)||[],a0=cv('--c'),m0=cv('--m');x.clearRect(0,0,W,H);
  const P=ks.map((k,i)=>({k,x:W/2+Math.cos(i/ks.length*6.283)*(W/2-70),y:H/2+Math.sin(i/ks.length*6.283)*(H/2-30)}));
  P.forEach((a,i)=>P.forEach((b,j)=>{if(j>i){const n=sn.filter(s=>s.includes(a.k.toLowerCase())&&s.includes(b.k.toLowerCase())).length;if(n){x.strokeStyle=a0;x.globalAlpha=Math.min(.9,.15+n*.1);x.lineWidth=Math.min(4,1+n/3);x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}}));
  x.globalAlpha=1;P.forEach(p=>{x.fillStyle=m0;x.beginPath();x.arc(p.x,p.y,5,0,7);x.fill();x.fillStyle='#e6ecff';x.font='12px monospace';x.textAlign='center';x.fillText(p.k,p.x,p.y-10)})}
// flashcard quiz
let ci=0,cs=[];function drawFc(){const b=$('#fc');if(!cs.length){b.innerHTML='<i>No cards yet — try a longer input.</i>';return}const c=cs[ci];
  b.innerHTML=`<div class="flip" id="fl"><div>${esc(c[0])}</div><div>${esc(c[1])}</div></div><div class="fcn"><button id="pv">◀</button> ${ci+1}/${cs.length} <button id="nx">▶</button></div>`;
  $('#fl').onclick=e=>e.currentTarget.classList.toggle('on');$('#pv').onclick=()=>{ci=(ci+cs.length-1)%cs.length;drawFc()};$('#nx').onclick=()=>{ci=(ci+1)%cs.length;drawFc()}}
// history
let R=0;const HK='omni_h',H=()=>{try{return JSON.parse(localStorage.getItem(HK)||'[]')}catch(e){return[]}};
function hist(a,b){try{const h=H();h.unshift({t:new Date().toLocaleString(),n:a.slice(0,40).replace(/\s+/g,' '),a:a.slice(0,80000),b});localStorage.setItem(HK,JSON.stringify(h.slice(0,8)))}catch(e){}rh()}
function rh(){$('#hl').innerHTML=H().map((h,i)=>`<li data-i="${i}">${esc(h.t)} — ${esc(h.n)}…</li>`).join('')||'<li>No runs yet</li>';$$('#hl li[data-i]').forEach(l=>l.onclick=()=>{const h=H()[+l.dataset.i];S.text=h.a;S.sum=h.b;S.kw=keywords(h.a+' '+h.b);R=1;show(h.a,h.b)})}
rh();
const _show=show;show=(a,b)=>{_show(a,b);const g=integrity();$('#metrics').insertAdjacentHTML('beforeend',`<div><b>${rt(a)}→${rt(b)} min</b>reading time</div><div><b>${g.score}%</b>concept retention</div><div title="${g.bad.join(', ')}"><b>${g.bad.length?g.bad.length+' ⚠':'0 ✓'}</b>unverified identifiers</div>`);graph();cs=cards();ci=0;drawFc();$('#cp').classList.remove('hide');$('#copybox').value=plain(S.sum);if(R)R=0;else hist(a,b)};
// extra exports, demo, shortcuts, PWA
document.addEventListener('click',e=>{const x=e.target.dataset&&e.target.dataset.x;if(!S.sum)return;if(x==='speak'){speechSynthesis.speaking?speechSynthesis.cancel():speechSynthesis.speak(new SpeechSynthesisUtterance(S.sum.replace(/[#*`]/g,'')))}
  if(x==='json')dl('omniparse.json',JSON.stringify({keywords:S.kw,summary:S.sum,flashcards:cs,author:'Nikhil Chary Sriramoju'},null,2),'application/json')});
$('#demo').onclick=()=>{$('#paste').value='def binary_search(arr, target):\n    """Return index of target in sorted arr, else -1. Runs in O(log n)."""\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nclass LRUCache:\n    """LRU cache: O(1) get and put using a hash map plus a doubly linked list."""\n    def get(self, key): ...\n    def put(self, key, value): ...\n';$('[data-t=pa]').click()};
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')$('#run').click()});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
// ---- v2.1: focus-keyword guard, agentic pipeline, copy-ready box
function guard(out,text,foc){const miss=foc.filter(f=>!out.toLowerCase().includes(f.toLowerCase()));if(!miss.length)return out;const sn=text.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+/g)||[text],add=[];
  miss.forEach(f=>{const s=sn.find(x=>x.toLowerCase().includes(f.toLowerCase()));if(s&&!add.includes(s.trim()))add.push(s.trim())});return out+(add.length?'\n\n## Preserved reference lines\n'+add.map(s=>'- '+s).join('\n'):'')}
const tr=m=>{const t=$('#trace');t.classList.remove('hide');t.textContent+=m+'\n';t.scrollTop=1e6;tick(m)};
async function agentic(text,pct,code,foc,online){
  const words=text.split(/\s+/).length,N=Math.max(30,Math.round(words*pct/100)),kind=code?'CODE':'THEORY/TEXT',wc=s=>s.split(/\s+/).length,
  F=foc.length?`MUST-PRESERVE TERMS: ${foc.join(', ')}. Every idea/sentence containing them must survive, rewritten so it stays meaningful and self-contained.`:'';
  tr(`🧭 Planner — ${kind}, ${words} words, target ≈${N} words${foc.length?', '+foc.length+' focus terms':''}`);
  if(!online){tr('⚙ Offline agents: Extractor → Compressor');const o=localSum(text,pct,code,foc);tr('🔎 Verifier — checking focus coverage');const g=guard(o,text,foc);tr(g!==o?'✍ Editor — restored missing focus sentences':'✓ Verifier — all focus terms present');return g}
  const ch=chunk(text),facts=[],plan=await llm(RULES,`Source is ${kind}. Give a 5-bullet outline of the key sections and must-keep constraints.\n\n${text.slice(0,5000)}`);tr('🧭 Planner ✓ outline ready');
  for(let i=0;i<ch.length;i++){tr(`🧲 Extractor — chunk ${i+1}/${ch.length}`);facts.push(await llm(RULES,`Extract atomic facts, definitions, steps, constraints, formulas and complexity bounds as terse bullets. ${F}\n\nSOURCE:\n${ch[i]}`))}
  tr('🗜 Compressor — writing summary');let out=await llm(RULES,`Using PLAN and FACTS write the final ${kind} summary in AT MOST ${N} words (hard limit). Never invent facts. ${F}\n\nPLAN:\n${plan}\n\nFACTS:\n${facts.join('\n')}`);
  const miss=foc.filter(f=>!out.toLowerCase().includes(f.toLowerCase())),long=wc(out)>N*1.25;tr(`🔎 Verifier — ${wc(out)}/${N} words, ${miss.length} focus terms missing`);
  if(miss.length||long){tr('✍ Editor — fixing');out=await llm(RULES,`Revise this summary. Limit ${N} words${long?' (currently too long: cut redundancy, keep all logic)':''}. ${miss.length?'Add meaningful sentences for these missing terms using ONLY the facts: '+miss.join(', ')+'.':''}\n\nSUMMARY:\n${out}\n\nFACTS:\n${facts.join('\n')}`)}
  out=guard(out,text,foc);tr('✅ Done — verified');return out}
const plain=m=>m.replace(/^#+\s*/gm,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/`/g,'').replace(/^[-*]\s+/gm,'• ').replace(/\n{3,}/g,'\n\n');
$$('#cp [data-c]').forEach(b=>b.onclick=async()=>{const w=[...FOC(),...S.kw].join(', '),k=b.dataset.c,v=k==='kw'?w:k==='all'?$('#copybox').value+'\n\nKeywords: '+w:$('#copybox').value;
  try{await navigator.clipboard.writeText(v)}catch(e){$('#copybox').select();document.execCommand('copy')}const o=b.textContent;b.textContent='Copied ✓';setTimeout(()=>b.textContent=o,1200)});
$('#copybox').onfocus=e=>e.target.select();

// source trace: tap a summary bullet -> best-matching source sentence is highlighted
$('#summary').onclick=e=>{const li=e.target.closest('li');if(!li||!S.text)return;const tk=s=>(s.toLowerCase().match(/[a-z0-9_]{4,}/g)||[]).filter(x=>!STOP.has(x)),w=new Set(tk(li.textContent));let best='',bs=0;
  (S.text.match(/[^.!?\n]+[.!?]?/g)||[]).forEach(s=>{const sc=tk(s).filter(x=>w.has(x)).length/Math.sqrt(s.length+1);if(sc>bs){bs=sc;best=s.trim()}});
  if(!best)return;$$('#summary li').forEach(x=>x.classList.remove('sel'));li.classList.add('sel');
  $('#orig').innerHTML=hi(esc(S.text.slice(0,60000)).replace(esc(best),m=>`<span class="src">${m}</span>`),S.kw,FOC());const el=$('#orig .src');if(el)el.scrollIntoView({block:'center',behavior:'smooth'})};
