// OmniParse AI — Designed and Developed by Nikhil Chary Sriramoju
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={files:[],text:'',sum:'',kw:[]};
const esc=t=>t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
const FOC=()=>($('#fk').value||'').split(/[,\n;]+/).map(x=>x.trim()).filter(Boolean).slice(0,30);
const tok=t=>Math.ceil(t.length/4), tick=m=>$('#ticker').textContent='● '+m;
const STOP=new Set('the and for with that this from are was were not but then else return const let var def function class import self true false null new have has had will can into your their there which when what also than such each other more most some over only'.split(' '));
const DEF={openai:['https://api.openai.com/v1','gpt-4o-mini'],groq:['https://api.groq.com/openai/v1','openai/gpt-oss-20b'],openrouter:['https://openrouter.ai/api/v1','openai/gpt-4o-mini'],gemini:['','gemini-2.0-flash'],custom:['','']};
const RULES=`You are OmniParse, a semantic compression engine. RULES: 1) Never invent facts, APIs, numbers or behaviours absent from the source. 2) Preserve every constraint, formula, complexity bound, edge case, definition and named entity. 3) Remove redundancy, filler and repeated examples before removing any logic. 4) For code: explain control flow, algorithm, inputs/outputs, side effects and time/space complexity; keep exact identifiers in backticks; output an "Architecture overview" then per-function/class bullets. 5) For theory: keep definitions, steps, and distinctions as terse bullets. 6) Output Markdown only, no preamble.`;

// ---- tabs / settings
$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button,.pane').forEach(e=>e.classList.remove('on'));b.classList.add('on');$('#'+b.dataset.t).classList.add('on')});
const cfgKeys=['prov','key','model','base'];
try{const s=JSON.parse(localStorage.getItem('omni')||'null');if(s){cfgKeys.forEach(k=>$('#'+k).value=s[k]||$('#'+k).value);$('#rem').checked=true}}catch(e){}
function cfg(){const p=$('#prov').value,d=DEF[p]||['',''];return{p,key:$('#key').value.trim(),model:$('#model').value.trim()||d[1],base:($('#base').value.trim()||d[0]).replace(/\/$/,'')}}
function saveCfg(){try{$('#rem').checked?localStorage.setItem('omni',JSON.stringify(Object.fromEntries(cfgKeys.map(k=>[k,$('#'+k).value])))):localStorage.removeItem('omni')}catch(e){}}
$('#pct').oninput=()=>{const v=+$('#pct').value;$('#pval').textContent=v;$('#plab').textContent=v<=20?'Ultra-Concise Elevator Pitch':v<=60?'Balanced Executive Summary':'Detailed Technical Breakdown'};

// ---- ingestion
const drop=$('#drop');
['dragover','dragenter'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>addFiles(e.dataTransfer.files));$('#file').onchange=e=>addFiles(e.target.files);
async function pdfText(f){if(!window.pdfjsLib){await new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=r;s.onerror=j;document.head.append(s)});pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'}
  const d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let o='';for(let i=1;i<=d.numPages;i++)o+=(await(await d.getPage(i)).getTextContent()).items.map(x=>x.str).join(' ')+'\n\n';return o}
async function addFiles(fl){for(const f of fl){tick('Reading '+f.name);try{S.files.push({name:f.name,text:/\.pdf$/i.test(f.name)?await pdfText(f):await f.text()})}catch(e){alert('Could not read '+f.name)}}renderFiles();tick('Idle — ready')}
function renderFiles(){$('#files').innerHTML=S.files.map((f,i)=>`<li>${esc(f.name)} · ${tok(f.text)} tok <span data-i="${i}">✕</span></li>`).join('');$$('#files span').forEach(s=>s.onclick=()=>{S.files.splice(+s.dataset.i,1);renderFiles()})}
const getText=()=>[...S.files.map(f=>`// FILE: ${f.name}\n${f.text}`),$('#paste').value].filter(x=>x.trim()).join('\n\n');
function isCode(t){if($('#mode').value!=='auto')return $('#mode').value==='code';if(S.files.some(f=>/\.(py|js|ts|cpp|c|java)$/i.test(f.name)))return true;return (t.match(/[{};()=<>]/g)||[]).length/t.length>.06||/\b(def|function|class|#include|public static)\b/.test(t)}

// ---- chunking (structure-aware)
function chunk(t,max=6000){const parts=t.split(/\n(?=\s*(?:def |class |function |public |private |static |async |export |#include|\/\/ FILE))|\n\n+/),out=[];let c='';
  for(const p of parts){if(c&&(c+p).length>max){out.push(c);c=''}c+=p+'\n\n'}if(c.trim())out.push(c);return out.flatMap(x=>x.length>max*1.5?x.match(new RegExp('[\\s\\S]{1,'+max+'}','g')):[x])}

// ---- LLM
async function llm(sys,usr){const c=cfg();if(!c.key)throw Error('No API key');
  if(c.p==='gemini'){const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${c.model}:generateContent?key=${c.key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[{parts:[{text:usr}]}],generationConfig:{temperature:.2}})});if(!r.ok)throw Error(r.status+' '+(await r.text()).slice(0,160));return(await r.json()).candidates[0].content.parts[0].text}
  const r=await fetch(c.base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify({model:c.model,temperature:.2,...(c.p==='groq'&&/gpt-oss/.test(c.model)?{reasoning_effort:'low'}:{}),messages:[{role:'system',content:sys},{role:'user',content:usr}]})});
  if(!r.ok)throw Error(r.status+' '+(await r.text()).slice(0,160));return(await r.json()).choices[0].message.content}

// ---- offline extractive engine
function localSum(t,pct,code,foc=[]){
  if(code){const L=t.split('\n'),sig=/^\s*(?:export\s+)?(?:async\s+)?(?:def|class|function|interface|struct|enum|public|private|protected|static|void|int|double|bool|String)\b[^;]*[({:]\s*$|^\s*(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?(?:function|\(.*\)\s*=>)/,doc=/^\s*(?:\/\/|#|\*|\/\*\*|""")\s*\S/;
    const sigs=L.filter(l=>sig.test(l)).map(l=>'- `'+l.trim().replace(/[{:]\s*$/,'')+'`'),docs=L.filter(l=>doc.test(l)&&!/FILE:/.test(l)).map(l=>'- '+l.replace(/^\s*(\/\/|#|\*|\/\*\*|""")\s*/,'')),ctl=(k)=>(t.match(new RegExp('\\b'+k+'\\b','g'))||[]).length;
    const nd=Math.ceil(docs.length*pct/100);return `## Architecture overview\n- Lines: ${L.length} · loops: ${ctl('for')+ctl('while')} · branches: ${ctl('if')} · returns: ${ctl('return')}\n\n## Structure\n${sigs.slice(0,Math.max(5,Math.ceil(sigs.length*(0.3+pct/100*.7)))).join('\n')||'- (no declarations detected)'}\n\n## Documented intent\n${docs.slice(0,nd).join('\n')||'- (no comments found)'}`}
  const sents=t.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+/g)||[t],f=Object.create(null);
  sents.forEach(s=>(s.toLowerCase().match(/[a-z]{4,}/g)||[]).forEach(w=>STOP.has(w)||(f[w]=(f[w]||0)+1)));
  const sc=sents.map((s,i)=>({i,s:s.trim(),v:((s.toLowerCase().match(/[a-z]{4,}/g)||[]).reduce((a,w)=>a+(f[w]||0),0)/Math.sqrt(s.length))*(i<2?1.4:1)*(/\b(is|are|defined|means|must|shall|always|never|=)\b/i.test(s)?1.25:1)*(foc.length&&foc.some(f=>s.toLowerCase().includes(f.toLowerCase()))?4:1)}));
  let budget=tok(t)*pct/100,pick=[];for(const x of sc.sort((a,b)=>b.v-a.v)){if(budget<=0)break;pick.push(x);budget-=tok(x.s)}
  return '## Summary\n'+pick.sort((a,b)=>a.i-b.i).map(x=>'- '+x.s).join('\n')}

// ---- keywords + rendering
function keywords(t,n=14){const f=Object.create(null);(t.match(/[A-Za-z_][A-Za-z0-9_]{3,}/g)||[]).forEach(w=>{const k=w.toLowerCase();if(!STOP.has(k)){const key=f[k]?k:w;f[key]=(f[key]||0)+1+(/[a-z][A-Z]|_/.test(w)?1.5:0)}});return Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0])}
function md(t){return esc(t).replace(/^### (.*)$/gm,'<h4>$1</h4>').replace(/^## (.*)$/gm,'<h3>$1</h3>').replace(/^# (.*)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/^[-*] (.*)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>').replace(/\n{2,}/g,'<br>')}
function hi(html,kws,foc=[]){const fl=new Set(foc.map(f=>f.toLowerCase())),all=[...foc,...kws.filter(k=>!fl.has(k.toLowerCase()))];if(!all.length)return html;const re=new RegExp('\\b('+all.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');return html.split(/(<[^>]+>)/).map(p=>p[0]==='<'?p:p.replace(re,m=>`<mark${fl.has(m.toLowerCase())?' class="f"':''}>${m}</mark>`)).join('')}

// ---- main pipeline
$('#run').onclick=async()=>{const text=getText();if(!text.trim())return alert('Add a file or paste some content first.');saveCfg();
  const pct=+$('#pct').value,code=isCode(text),c=cfg(),btn=$('#run');btn.disabled=true;let out;
  try{$('#trace').textContent='';const foc=FOC();
    if($('#agentic').checked){out=await agentic(text,pct,code,foc,c.p!=='local'&&!!c.key)}
    else if(c.p==='local'||!c.key){tick('Running offline extractive engine…');out=localSum(text,pct,code,foc)}
    else{const ch=chunk(text),parts=[],hint=(code?'The source is CODE. Analyse its AST-level structure and control flow.':'The source is THEORY/TEXT.')+(foc.length?' MUST-PRESERVE TERMS: '+foc.join(', ')+'. Keep every idea/sentence containing these terms, rewritten so it stays meaningful and self-contained.':'');
      for(let i=0;i<ch.length;i++){tick(`Semantic compression — chunk ${i+1}/${ch.length}`);parts.push(await llm(RULES,`${hint}\nTarget length ≈ ${pct}% of the source (~${Math.round(tok(ch[i])*pct/100)} tokens).\n\nSOURCE:\n${ch[i]}`))}
      if(parts.length>1){tick('Merging partial summaries…');out=await llm(RULES,`Merge these partial summaries into ONE coherent, deduplicated summary. Keep all technical constraints. ${hint} Target ≈ ${pct}% of the original (~${Math.round(tok(text)*pct/100)} tokens).\n\n`+parts.join('\n\n---\n\n'))}else out=parts[0]}
  }catch(e){alert('AI call failed ('+e.message+'). Falling back to offline engine.');out=localSum(text,pct,code)}
  btn.disabled=false;out=guard(out,text,FOC());S.text=text;S.sum=out;S.kw=keywords(text+' '+out);show(text,out);tick('Done — semantic integrity preserved')};
function show(a,b){$('#res').classList.remove('hide');const ta=tok(a),tb=tok(b),red=Math.max(0,Math.round((1-tb/ta)*100));
  $('#metrics').innerHTML=`<div><b>${ta}</b>original tokens</div><div><b>${tb}</b>summary tokens</div><div><b>${red}%</b>reduction</div><div><b>${(ta/Math.max(tb,1)).toFixed(1)}:1</b>compression</div>`;
  $('#kw').innerHTML=FOC().map(k=>`<span class="pill f">🎯 ${esc(k)}</span>`).join('')+S.kw.map(k=>`<span class="pill">${esc(k)}</span>`).join('');
  $('#orig').innerHTML=hi(esc(a.slice(0,60000)),S.kw,FOC());$('#summary').innerHTML=hi(md(b),S.kw,FOC());$('#res').scrollIntoView({behavior:'smooth'})}

// ---- export hub
function dl(name,data,type){const u=URL.createObjectURL(new Blob([data],{type}));const a=Object.assign(document.createElement('a'),{href:u,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function cards(){const lines=S.sum.split('\n').filter(l=>/^[-*] /.test(l)).map(l=>l.replace(/^[-*] /,'').replace(/[`*]/g,''));return S.kw.map(k=>{const l=lines.find(x=>new RegExp('\\b'+k+'\\b','i').test(x));return l&&[`Explain: ${k}`,l]}).filter(Boolean)}
$$('.exp button').forEach(b=>b.onclick=async()=>{if(!S.sum)return;const x=b.dataset.x;
  if(x==='copy'){await navigator.clipboard.writeText(S.sum);b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1200)}
  if(x==='md')dl('omniparse-summary.md',`# OmniParse AI Summary\n\n**Keywords:** ${S.kw.join(', ')}\n\n${S.sum}\n\n---\n*Designed and Developed by Nikhil Chary Sriramoju*\n`,'text/markdown');
  if(x==='txt')dl('omniparse-summary.txt',S.sum.replace(/[#*`]/g,''),'text/plain');
  if(x==='pdf')window.print();
  if(x==='anki'){const q=s=>'"'+s.replace(/"/g,'""')+'"';dl('omniparse-flashcards.csv',cards().map(c=>c.map(q).join(',')).join('\n'),'text/csv')}});
