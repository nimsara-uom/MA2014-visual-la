/* =========================================================
   MA2014 Visual Lab — shared toolkit
   nav · toc/progress · KaTeX · Plot · steps · flips · quiz · numerics
   ========================================================= */
const PAGES = [
  {id:'home', href:'index.html', name:'Home', col:'#4cc9f0'},
  {id:'laplace', href:'laplace.html', name:'1 · Laplace', col:'#ff7a59'},
  {id:'fseries', href:'fourier-series.html', name:'2 · Fourier Series', col:'#ffd166'},
  {id:'pde', href:'pde.html', name:'3 · PDEs', col:'#06d6a0'},
  {id:'series', href:'series.html', name:'4 · Series & Frobenius', col:'#4cc9f0'},
  {id:'ftrans', href:'fourier-transform.html', name:'5 · Fourier Transform', col:'#b388ff'},
  {id:'exams', href:'exams.html', name:'🎯 Past Papers', col:'#ff5d8f'},
  {id:'sheet', href:'formulas.html', name:'📋 Formula Sheet', col:'#9aa6c7'},
];
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const PAGE = document.body.dataset.page || 'home';

/* ---------- THEME ---------- */
const LIGHT_MAP={'#ffd166':'#d19000','#06d6a0':'#00a27a','#4cc9f0':'#0e95c9','#ff7a59':'#e24b22','#b388ff':'#7c4de0','#ff5d8f':'#d42a66','#9aa6c7':'#667291','#2ee59d':'#10a96b','#fff':'#1b2340','#ffffff':'#1b2340','#c9d2ee':'#5b6788','#ff5d6c':'#d6303f'};
const LIGHT_RGBA=[['255,209,102','217,144,0'],['76,201,240','14,149,201'],['6,214,160','0,162,122'],['255,122,89','226,75,34'],['179,136,255','124,77,224'],['255,93,143','212,42,102'],['255,255,255','20,30,70'],['154,166,199','102,114,145']];
const isLight=()=>document.documentElement.dataset.theme==='light';
function themed(c){ if(!isLight()||typeof c!=='string') return c; const k=c.toLowerCase().replace(/\s/g,''); if(LIGHT_MAP[k]) return LIGHT_MAP[k];
  if(k.startsWith('rgba(')) for(const [a,b] of LIGHT_RGBA) if(k.startsWith('rgba('+a+',')) return 'rgba('+b+k.slice(5+a.length); return c; }
const plotBg=()=>isLight()?'#f4f6fd':'#0a0f20';
(function initTheme(){
  const t=localStorage.getItem('ma2014:theme')||'dark'; document.documentElement.dataset.theme=t;
  const l=document.createElement('link'); l.rel='stylesheet'; l.href='css/theme.css'; document.head.appendChild(l);
})();
function setTheme(t){ document.documentElement.dataset.theme=t; localStorage.setItem('ma2014:theme',t);
  const b=$('#themeBtn'); if(b) b.textContent=t==='light'?'🌙 Dark':'☀️ Light';
  Plot.all.forEach(p=>{ try{p.fit(); p.onresize&&p.onresize();}catch(e){} }); }

/* ---------- NAV ---------- */
(function nav(){
  const n = document.createElement('nav'); n.className='top';
  n.innerHTML = `<a class="brand" href="index.html">MA2014 <span>Visual Lab</span></a>` +
    PAGES.filter(p=>p.id!=='home').map(p=>`<a class="tab ${p.id===PAGE?'active':''}" href="${p.href}"><span class="dot" style="background:${p.col}"></span>${p.name}</a>`).join('');
  const tb=document.createElement('button'); tb.id='themeBtn'; tb.className='themeBtn'; tb.title='Switch light / dark theme';
  tb.textContent=isLight()?'🌙 Dark':'☀️ Light'; tb.onclick=()=>setTheme(isLight()?'dark':'light'); n.appendChild(tb);
  document.body.prepend(n);
})();

/* ---------- TOC + PROGRESS ---------- */
function progKey(id){return 'ma2014:'+PAGE+':'+id}
function pageProgress(page){
  let tot=0, done=0;
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); if(k.startsWith('ma2014:'+page+':')){ if(localStorage.getItem(k)==='1') done++; }}
  const t = localStorage.getItem('ma2014tot:'+page); tot = t? +t : 0;
  return {done, tot};
}
function buildTOC(){
  const toc = $('.toc'); const secs = $$('section.card[id]');
  if(!secs.length) return;
  localStorage.setItem('ma2014tot:'+PAGE, secs.length);
  secs.forEach(s=>{
    const lab = document.createElement('label'); lab.className='mark';
    const done = localStorage.getItem(progKey(s.id))==='1';
    lab.innerHTML = `<input type="checkbox" ${done?'checked':''}> I understand this topic`;
    lab.querySelector('input').onchange = e=>{localStorage.setItem(progKey(s.id), e.target.checked?'1':'0'); upd();};
    s.appendChild(lab);
  });
  if(!toc) return;
  toc.innerHTML = `<h4>On this page</h4>` + secs.map(s=>`<a href="#${s.id}" data-id="${s.id}">${s.querySelector('h2').textContent.replace(/^\s*[\d.]+\s*/,'')}</a>`).join('') +
    `<div class="prog"><i></i></div><small class="ptxt"></small>`;
  function upd(){
    let d=0; secs.forEach(s=>{const ok=localStorage.getItem(progKey(s.id))==='1'; if(ok)d++; const a=toc.querySelector(`a[data-id="${s.id}"]`); a && a.classList.toggle('seen',ok);});
    toc.querySelector('.prog i').style.width = (100*d/secs.length)+'%';
    toc.querySelector('.ptxt').textContent = `${d} / ${secs.length} topics understood`;
  }
  upd();
  const obs = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ $$('.toc a').forEach(a=>a.classList.toggle('here',a.dataset.id===e.target.id)); }}),{rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s=>obs.observe(s));
}

/* ---------- MATH ---------- */
function M(el){
  if(window.renderMathInElement) renderMathInElement(el||document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false});
}
/* write TeX into an element and render it */
function tex(el, s){ if(typeof el==='string') el=$(el); el.innerHTML=s; M(el); }

/* ---------- PLOT ---------- */
class Plot{
  constructor(cv, o={}){
    this.cv = typeof cv==='string'? $(cv): cv; this.ctx=this.cv.getContext('2d');
    Object.assign(this,{xmin:-5,xmax:5,ymin:-2,ymax:2,pad:34,xlabel:'',ylabel:'',grid:true,xticks:null,yticks:null},o);
    this.fit(); new ResizeObserver(()=>{this.fit(); this.onresize&&this.onresize();}).observe(this.cv); Plot.all.push(this);
  }
  bg(){ return plotBg(); }
  fit(){ const r=this.cv.getBoundingClientRect(), d=window.devicePixelRatio||1; this.W=r.width; this.H=r.height; this.cv.width=r.width*d; this.cv.height=r.height*d; this.ctx.setTransform(d,0,0,d,0,0); }
  view(xmin,xmax,ymin,ymax){Object.assign(this,{xmin,xmax,ymin,ymax}); return this;}
  X(x){return this.pad+(x-this.xmin)/(this.xmax-this.xmin)*(this.W-this.pad-10)}
  Y(y){return 10+(this.ymax-y)/(this.ymax-this.ymin)*(this.H-this.pad-10)}
  clear(){ const c=this.ctx; c.clearRect(0,0,this.W,this.H); c.fillStyle=plotBg(); c.fillRect(0,0,this.W,this.H); return this;}
  nice(span){const r=span/8, p=Math.pow(10,Math.floor(Math.log10(r))), m=r/p; return (m<1.5?1:m<3.5?2:m<7.5?5:10)*p;}
  axes(){
    const c=this.ctx; c.save(); c.font='11px Segoe UI'; c.lineWidth=1; const L=isLight(), tick=L?'#5b6788':'#7d89ad', gr=themed('rgba(255,255,255,.06)').replace('.06',L?'.09':'.06');
    const sx=this.xticks||this.nice(this.xmax-this.xmin), sy=this.yticks||this.nice(this.ymax-this.ymin);
    for(let x=Math.ceil(this.xmin/sx)*sx; x<=this.xmax+1e-9; x+=sx){ const X=this.X(x);
      if(this.grid){c.strokeStyle=gr; c.beginPath(); c.moveTo(X,10); c.lineTo(X,this.H-this.pad); c.stroke();}
      c.fillStyle=tick; c.textAlign='center'; c.fillText(this.fmtTick(x,sx), X, this.H-this.pad+14); }
    for(let y=Math.ceil(this.ymin/sy)*sy; y<=this.ymax+1e-9; y+=sy){ const Y=this.Y(y);
      if(this.grid){c.strokeStyle=gr; c.beginPath(); c.moveTo(this.pad,Y); c.lineTo(this.W-10,Y); c.stroke();}
      c.fillStyle=tick; c.textAlign='right'; c.fillText(this.fmtTick(y,sy), this.pad-4, Y+4); }
    c.strokeStyle=themed('rgba(255,255,255,.45)'); c.lineWidth=1.3;
    if(this.ymin<=0&&this.ymax>=0){c.beginPath(); c.moveTo(this.pad,this.Y(0)); c.lineTo(this.W-10,this.Y(0)); c.stroke();}
    if(this.xmin<=0&&this.xmax>=0){c.beginPath(); c.moveTo(this.X(0),10); c.lineTo(this.X(0),this.H-this.pad); c.stroke();}
    c.fillStyle=L?'#3b4668':'#b9c3e6'; c.font='italic 12px Segoe UI'; c.textAlign='right';
    if(this.xlabel) c.fillText(this.xlabel, this.W-12, this.H-this.pad-6);
    c.textAlign='left'; if(this.ylabel) c.fillText(this.ylabel, this.pad+6, 22);
    c.restore(); return this;
  }
  fmtTick(v,s){ if(this.piTicks){ const k=Math.round(v/Math.PI*2); if(Math.abs(v-k*Math.PI/2)<1e-6){ if(k===0)return '0'; const f={1:'π/2',2:'π','-1':'-π/2','-2':'-π'}; if(f[k])return f[k]; return (k%2===0? (k/2)+'π' : k+'π/2'); } }
    return Math.abs(v)<1e-10?'0': (+v.toFixed(Math.max(0,-Math.floor(Math.log10(s))+ (s<1?0:0)))).toString(); }
  fn(f,col='#4cc9f0',w=2.4,o={}){
    const c=this.ctx; c.save(); c.strokeStyle=themed(col); c.lineWidth=w; if(o.dash)c.setLineDash(o.dash); c.globalAlpha=o.alpha??1;
    const a=o.a??this.xmin, b=o.b??this.xmax, N=o.n||Math.max(400,Math.floor(this.W*1.5)); let pen=false, last=null;
    c.beginPath();
    for(let i=0;i<=N;i++){ const x=a+(b-a)*i/N, y=f(x);
      if(!isFinite(y)||(last!==null&&Math.abs(y-last)>(this.ymax-this.ymin)*(o.jump??0.9))){pen=false; last=isFinite(y)?y:null; if(!isFinite(y))continue;}
      const Y=Math.max(-1e4,Math.min(1e4,this.Y(y)));
      if(!pen){c.moveTo(this.X(x),Y); pen=true;} else c.lineTo(this.X(x),Y); last=y; }
    c.stroke(); c.restore(); return this;
  }
  fill(f,col='rgba(76,201,240,.25)',o={}){
    const c=this.ctx, a=o.a??this.xmin, b=o.b??this.xmax, N=400, base=o.base??0; c.save(); c.fillStyle=themed(col); c.beginPath(); c.moveTo(this.X(a),this.Y(base));
    for(let i=0;i<=N;i++){const x=a+(b-a)*i/N, y=f(x); c.lineTo(this.X(x),this.Y(isFinite(y)?Math.max(this.ymin-1,Math.min(this.ymax+1,y)):base));}
    c.lineTo(this.X(b),this.Y(base)); c.closePath(); c.fill(); c.restore(); return this;
  }
  line(x1,y1,x2,y2,col='#fff',w=1.5,dash){const c=this.ctx;c.save();c.strokeStyle=themed(col);c.lineWidth=w;if(dash)c.setLineDash(dash);c.beginPath();c.moveTo(this.X(x1),this.Y(y1));c.lineTo(this.X(x2),this.Y(y2));c.stroke();c.restore();return this;}
  vline(x,col='rgba(255,255,255,.4)',dash=[5,5]){return this.line(x,this.ymin,x,this.ymax,col,1.2,dash);}
  hline(y,col='rgba(255,255,255,.4)',dash=[5,5]){return this.line(this.xmin,y,this.xmax,y,col,1.2,dash);}
  dot(x,y,col='#fff',r=4.5,hollow=false){const c=this.ctx;c.save();c.beginPath();c.arc(this.X(x),this.Y(y),r,0,7);if(hollow){c.fillStyle=plotBg();c.fill();c.strokeStyle=themed(col);c.lineWidth=2;c.stroke();}else{c.fillStyle=themed(col);c.fill();}c.restore();return this;}
  arrow(x,y0,y1,col='#ff5d8f',w=3){const c=this.ctx;this.line(x,y0,x,y1,col,w);c.save();c.fillStyle=themed(col);const X=this.X(x),Y=this.Y(y1),d=y1>y0?1:-1;c.beginPath();c.moveTo(X,Y);c.lineTo(X-7,Y+12*d);c.lineTo(X+7,Y+12*d);c.fill();c.restore();return this;}
  text(s,x,y,col='#fff',o={}){const c=this.ctx;c.save();c.fillStyle=themed(col);c.font=(o.font||'bold 13px Segoe UI');c.textAlign=o.align||'left';c.fillText(s,this.X(x)+(o.dx||0),this.Y(y)+(o.dy||0));c.restore();return this;}
  bars(xs,ys,col='#4cc9f0',w=0.6){const c=this.ctx;c.save();c.fillStyle=themed(col);xs.forEach((x,i)=>{const y=ys[i];const X0=this.X(x-w/2),X1=this.X(x+w/2),Y0=this.Y(0),Y1=this.Y(y);c.fillRect(X0,Math.min(Y0,Y1),X1-X0,Math.abs(Y1-Y0));});c.restore();return this;}
  heat(F,cmap=inferno,res=3){ // F(x,y)->0..1 over current view
    const c=this.ctx; const x0=this.X(this.xmin),x1=this.X(this.xmax),y0=this.Y(this.ymax),y1=this.Y(this.ymin);
    for(let px=x0;px<x1;px+=res)for(let py=y0;py<y1;py+=res){const x=this.xmin+(px-x0)/(x1-x0)*(this.xmax-this.xmin), y=this.ymax-(py-y0)/(y1-y0)*(this.ymax-this.ymin); c.fillStyle=cmap(F(x,y)); c.fillRect(px,py,res+.5,res+.5);} return this;}
}
Plot.all=[];
function inferno(t){t=Math.max(0,Math.min(1,t||0)); const s=[[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,255,164]]; const k=t*(s.length-1),i=Math.min(s.length-2,Math.floor(k)),f=k-i; const a=s[i],b=s[i+1]; return `rgb(${a[0]+(b[0]-a[0])*f|0},${a[1]+(b[1]-a[1])*f|0},${a[2]+(b[2]-a[2])*f|0})`;}
function coolwarm(t){t=Math.max(0,Math.min(1,t)); const a=[59,76,192],m=[221,221,221],b=[180,4,38]; const [p,q,f]=t<.5?[a,m,t*2]:[m,b,(t-.5)*2]; return `rgb(${p[0]+(q[0]-p[0])*f|0},${p[1]+(q[1]-p[1])*f|0},${p[2]+(q[2]-p[2])*f|0})`;}

/* ---------- CONTROLS ---------- */
function val(id){const e=document.getElementById(id); return e.type==='range'||e.type==='number'? +e.value : e.value;}
/* bind sliders/selects: shows value in sibling <output>, calls fn on input */
function bind(ids, fn){ ids.forEach(id=>{const e=document.getElementById(id); const o=e.parentElement.querySelector('output');
  const show=()=>{ if(o) o.textContent = e.dataset.fmt==='pi'? (e.value/Math.PI).toFixed(2)+'π' : e.value; };
  e.addEventListener('input',()=>{show(); fn();}); show(); }); fn(); }

/* ---------- STEPS ---------- */
function initSteps(){
  $$('.steps').forEach(st=>{
    const steps=$$(':scope > .step',st); let k=st.dataset.start? +st.dataset.start : 1;
    steps.forEach((s,i)=>{ const b=document.createElement('span'); b.className='sn'; b.textContent=s.dataset.t? s.dataset.t : 'Step '+(i+1); s.prepend(b); });
    const bar=document.createElement('div'); bar.className='bar';
    bar.innerHTML=`<button class="pri nx">Next step ▶</button><button class="al">Show all</button><button class="rs">Reset</button><small></small>`;
    st.appendChild(bar);
    const draw=()=>{steps.forEach((s,i)=>s.classList.toggle('on',i<k)); bar.querySelector('small').textContent=`${k} / ${steps.length}`; st.dispatchEvent(new CustomEvent('step',{detail:k}));};
    bar.querySelector('.nx').onclick=()=>{if(k<steps.length)k++; draw();};
    bar.querySelector('.al').onclick=()=>{k=steps.length; draw();};
    bar.querySelector('.rs').onclick=()=>{k=1; draw();};
    draw();
  });
}
/* ---------- FLIPS ---------- */
function initFlips(){ $$('.flip').forEach(f=>{
  $$('.f,.b',f).forEach(face=>{ const sp=document.createElement('span'); [...face.childNodes].forEach(n=>{ if(!(n.nodeType===1&&n.tagName==='SMALL')) sp.appendChild(n); }); face.prepend(sp); });
  f.addEventListener('click',()=>f.classList.toggle('on')); }); }

/* ---------- QUIZ ---------- */
function quiz(el, items){
  el=typeof el==='string'?$(el):el; el.classList.add('quiz'); let score=0, ans=0;
  el.innerHTML = `<div class="qhead"><b>Quick check</b><span>Score: <span class="score">0 / ${items.length}</span></span></div>` +
    items.map((it,i)=>`<div class="q" data-i="${i}"><p>${i+1}. ${it.q}</p><div class="opts">${it.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join('')}</div><div class="why">💡 ${it.why||''}</div></div>`).join('');
  $$('.q',el).forEach(q=>{ const it=items[+q.dataset.i];
    $$('.opt',q).forEach(b=>b.onclick=()=>{ if(q.classList.contains('done'))return; q.classList.add('done'); ans++;
      const j=+b.dataset.j; if(j===it.a){b.classList.add('right'); score++;} else {b.classList.add('wrong'); $$('.opt',q)[it.a].classList.add('right');}
      $('.score',el).textContent=`${score} / ${items.length}`; });
  });
  M(el);
}

/* ---------- NUMERICS ---------- */
function simpson(f,a,b,n=400){ if(n%2)n++; const h=(b-a)/n; let s=f(a)+f(b); for(let i=1;i<n;i++) s+=f(a+i*h)*(i%2?4:2); return s*h/3; }
/* RK4 for system y' = F(x, y[]) */
function rk4(F, x0, y0, x1, n=800){ const h=(x1-x0)/n, out=[[x0,y0.slice()]]; let x=x0, y=y0.slice();
  const add=(a,b,k)=>a.map((v,i)=>v+b[i]*k);
  for(let i=0;i<n;i++){ const k1=F(x,y), k2=F(x+h/2,add(y,k1,h/2)), k3=F(x+h/2,add(y,k2,h/2)), k4=F(x+h,add(y,k3,h));
    y=y.map((v,j)=>v+h/6*(k1[j]+2*k2[j]+2*k3[j]+k4[j])); x+=h; out.push([x,y.slice()]); } return out; }
function interp(tab,x){ if(x<=tab[0][0])return tab[0][1][0]; for(let i=1;i<tab.length;i++) if(tab[i][0]>=x){const [a,ya]=tab[i-1],[b,yb]=tab[i]; return ya[0]+(yb[0]-ya[0])*(x-a)/(b-a);} return tab[tab.length-1][1][0]; }
const fact=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;};
const sinh=Math.sinh, cosh=Math.cosh, PI=Math.PI;
const fmt=(v,d=3)=>(Math.abs(v)<1e-12?0:v).toFixed(d);

/* ---------- HERO ANIMATION ---------- */
function heroWaves(){
  const h=$('.hero'); if(!h)return; const cv=document.createElement('canvas'); h.prepend(cv); const c=cv.getContext('2d'); let t=0;
  const col=getComputedStyle(document.body).getPropertyValue('--acc').trim()||'#4cc9f0';
  function fr(){ const r=h.getBoundingClientRect(); if(cv.width!==r.width){cv.width=r.width;cv.height=r.height;}
    c.clearRect(0,0,cv.width,cv.height);
    for(let k=1;k<=4;k++){ c.beginPath(); c.strokeStyle=col; c.globalAlpha=.18+.12*k/4; c.lineWidth=1.5;
      for(let x=0;x<=cv.width;x+=4){ const y=cv.height*.55+Math.sin(x*0.012*k+t*(0.6+k*.2))*18*k/1.5*Math.sin(t*.3+k); x?c.lineTo(x,y):c.moveTo(x,y);} c.stroke(); }
    t+=0.02; requestAnimationFrame(fr);} fr();
}

/* ---------- BOOT ---------- */
window.addEventListener('DOMContentLoaded',()=>{
  initSteps(); initFlips(); buildTOC(); heroWaves();
  const go=()=>M(document.body);
  if(window.renderMathInElement) go(); else { const k=document.querySelector('script[src*="auto-render"]'); k&&k.addEventListener('load',go); }
});
