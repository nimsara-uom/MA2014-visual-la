/* Chapter 5 — Fourier transform widgets */
const Q5={p:'#b388ff',g:'#06d6a0',o:'#ff7a59',y:'#ffd166',m:'#9aa6c7',b:'#4cc9f0'};
const erf=x=>{ const s=Math.sign(x); x=Math.abs(x); const t=1/(1+0.3275911*x); const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return s*y; };
const sinc2=(a,w)=>Math.abs(w)<1e-9?2*a:2*Math.sin(a*w)/w;

/* ---- series → transform bridge ---- */
(function(){
  const A=new Plot('#brA',{xmin:-20,xmax:20,ymin:-0.3,ymax:1.4,xlabel:'t'}), B=new Plot('#brB',{xmin:-15,xmax:15,ymin:-0.6,ymax:2.3,xlabel:'ω'});
  function draw(){ const T=val('brT'); const box=t=>{ const u=((t+T/2)%T+T)%T-T/2; return Math.abs(u)<=1?1:0; };
    A.clear().axes(); A.fill(box,'rgba(179,136,255,.25)'); A.fn(box,Q5.p,2.2,{jump:0.3});
    B.clear().axes(); B.fn(w=>sinc2(1,w),Q5.g,1.8,{alpha:.7});
    const c=B.ctx; c.save(); c.strokeStyle=Q5.y; c.fillStyle=Q5.y; c.lineWidth=2;
    for(let n=-200;n<=200;n++){ const w=2*PI*n/T; if(w<B.xmin||w>B.xmax)continue; const h=sinc2(1,w); c.beginPath(); c.moveTo(B.X(w),B.Y(0)); c.lineTo(B.X(w),B.Y(h)); c.stroke(); c.beginPath(); c.arc(B.X(w),B.Y(h),3,0,7); c.fill(); }
    c.restore();
    tex('#brR',`Line spacing \\(\\Delta\\omega=\\frac{2\\pi}{T}=${fmt(2*PI/T,3)}\\). As \\(T\\to\\infty\\) the lines merge, and \\(Tc_n\\to F(\\omega)=\\frac{2\\sin\\omega}{\\omega}\\), the transform of a single pulse.`); }
  A.onresize=B.onresize=draw; bind(['brT'],draw);
})();

/* ---- transform viewer ---- */
(function(){
  const A=new Plot('#tvA',{xmin:-5,xmax:5,ymin:-1.3,ymax:1.4,xlabel:'t'}), B=new Plot('#tvB',{xmin:-12,xmax:12,ymin:-2,ymax:2,xlabel:'ω'});
  const D={
    rect:{f:(t,a)=>Math.abs(t)<=a?1:0,F:(w,a)=>[sinc2(a,w),0],tx:a=>`\\(F=\\frac{2\\sin(${a}\\omega)}{\\omega}\\). Real and even, because f is real and even.`},
    gauss:{f:(t,a)=>Math.exp(-a*t*t),F:(w,a)=>[Math.sqrt(PI/a)*Math.exp(-w*w/(4*a)),0],tx:a=>`\\(F=\\sqrt{\\pi/${a}}\\,e^{-\\omega^2/${fmt(4*a,2)}}\\). A Gaussian transforms into a Gaussian.`},
    two:{f:(t,a)=>Math.exp(-a*Math.abs(t)),F:(w,a)=>[2*a/(a*a+w*w),0],tx:a=>`\\(F=\\frac{2(${a})}{${fmt(a*a,2)}+\\omega^2}\\). The sharp corner at t = 0 makes the tail decay slowly, like \\(1/\\omega^2\\).`},
    one:{f:(t,a)=>t>=0?Math.exp(-a*t):0,F:(w,a)=>[a/(a*a+w*w),-w/(a*a+w*w)],tx:a=>`\\(F=\\frac1{${a}+i\\omega}\\). This is complex because f is not even. \\(|F|=1/\\sqrt{${fmt(a*a,2)}+\\omega^2}\\).`},
    odd:{f:(t,a)=>t>0?Math.exp(-a*t):t<0?-Math.exp(a*t):0,F:(w,a)=>[0,-2*w/(a*a+w*w)],tx:a=>`\\(F=\\frac{1}{${a}+i\\omega}-\\frac1{${a}-i\\omega}=\\frac{-2i\\omega}{${fmt(a*a,2)}+\\omega^2}\\). Purely imaginary and odd, because f is real and odd.`},
    tri:{f:(t,a)=>Math.abs(t)<a?1-(t/a)**2:0,F:(w,a)=>{const x=a*w; return [Math.abs(x)<1e-4?4*a/3:4*a*(Math.sin(x)-x*Math.cos(x))/x**3,0];},tx:a=>`Tutorial 1(i) with a = 1: \\(F=\\frac{4(\\sin\\omega-\\omega\\cos\\omega)}{\\omega^3}\\). Here the width is scaled by α.`}};
  function draw(){ const k=D[val('tvF')], a=val('tva'); const f=t=>k.f(t,a);
    A.clear().axes(); A.fill(f,'rgba(179,136,255,.25)'); A.fn(f,Q5.p,2.6,{jump:0.3});
    const ys=[...Array(121).keys()].map(i=>{const w=-12+i/5; const [r,im]=k.F(w,a); return Math.max(Math.abs(r),Math.abs(im));}); const M=Math.max(...ys)*1.15; B.ymin=-M; B.ymax=M;
    B.clear().axes(); B.fn(w=>Math.hypot(...k.F(w,a)),Q5.y,1.8,{dash:[5,4]}); B.fn(w=>k.F(w,a)[0],Q5.g,2.6); B.fn(w=>k.F(w,a)[1],Q5.o,2.2);
    const num=[simpson(t=>f(t)*Math.cos(t),-12,12,4000),-simpson(t=>f(t)*Math.sin(t),-12,12,4000)], ex=k.F(1,a);
    tex('#tvR',k.tx(a)+` Check at ω = 1: the numerical integral gives \\(${fmt(num[0],4)}${num[1]<0?'-':'+'}${fmt(Math.abs(num[1]),4)}i\\) and the formula gives \\(${fmt(ex[0],4)}${ex[1]<0?'-':'+'}${fmt(Math.abs(ex[1]),4)}i\\) ✔`); }
  A.onresize=B.onresize=draw; bind(['tvF','tva'],draw);
})();

/* ---- property explorer ---- */
(function(){
  const A=new Plot('#prA',{xmin:-5,xmax:5,ymin:-1.2,ymax:1.2,xlabel:'t'}), B=new Plot('#prB',{xmin:-10,xmax:10,ymin:-2,ymax:2,xlabel:'ω'});
  const g=t=>Math.exp(-t*t), G=w=>Math.sqrt(PI)*Math.exp(-w*w/4);
  function draw(){ const o=val('prO'); let k=val('prK'); let fr, fi=null, F, msg;
    if(o==='shift'){ fr=t=>g(t-k); F=w=>[Math.cos(w*k)*G(w),-Math.sin(w*k)*G(w)]; msg=`\\(\\mathcal F\\{f(t-${k})\\}=e^{-i${k}\\omega}F(\\omega)\\). The magnitude (yellow) does not change at all. Only the phase rotates, so Re and Im oscillate.`; }
    else if(o==='mod'){ fr=t=>Math.cos(k*t)*g(t); fi=t=>Math.sin(k*t)*g(t); F=w=>[G(w-k),0]; msg=`\\(\\mathcal F\\{e^{i${k}t}f\\}=F(\\omega-${k})\\). Multiplying by a complex exponential slides the whole spectrum to \\(\\omega=${k}\\). That is how AM radio works.`; }
    else if(o==='scale'){ const a=Math.max(0.25,Math.abs(k)); fr=t=>g(a*t); F=w=>[G(w/a)/a,0]; msg=`\\(\\mathcal F\\{f(${fmt(a,2)}t)\\}=\\frac{1}{${fmt(a,2)}}F\\left(\\frac{\\omega}{${fmt(a,2)}}\\right)\\). Squeezing in t stretches in ω (Remark 5.20).`; }
    else { fr=t=>-2*t*g(t); F=w=>[0,w*G(w)]; msg='\\(\\mathcal F\\{f\'\\}=i\\omega F\\). Differentiating multiplies by \\(i\\omega\\), which boosts high frequencies and kills ω = 0. The slider is not used here.'; }
    A.clear().axes(); A.fn(g,Q5.m,1.4,{dash:[5,4]}); A.fn(fr,Q5.p,2.6); if(fi) A.fn(fi,Q5.p,1.6,{dash:[3,3]});
    const M=Math.max(2,...[...Array(81).keys()].map(i=>Math.hypot(...F(-10+i/4))))*1.1; B.ymin=-M; B.ymax=M;
    B.clear().axes(); B.fn(w=>Math.hypot(...F(w)),Q5.y,1.8,{dash:[5,4]}); B.fn(w=>F(w)[0],Q5.g,2.4); B.fn(w=>F(w)[1],Q5.o,2.2); tex('#prR',msg); }
  A.onresize=B.onresize=draw; bind(['prO','prK'],draw);
})();

/* ---- PDE applications ---- */
(function(){
  const P=new Plot('#ap',{xmin:-6,xmax:6,ymin:-0.1,ymax:1.15,xlabel:'x'}); let t=0, run=false;
  function draw(){ const pb=val('apP'), a=val('apa'); $('#apT').textContent=t.toFixed(2);
    if(pb==='heat'){ P.view(-6,6,-0.05,1.1); P.clear().axes(); const th=(x,tt)=>Math.exp(-a*x*x/(1+4*a*tt))/Math.sqrt(1+4*a*tt);
      P.fn(x=>th(x,0),Q5.m,1.4,{dash:[5,4]}); P.fill(x=>th(x,t),'rgba(255,122,89,.25)'); P.fn(x=>th(x,t),Q5.o,3);
      tex('#apR',`\\(\\theta=\\frac{1}{\\sqrt{1+4akt}}e^{-ax^2/(1+4akt)}\\) with k = 1. Area \\(\\int\\theta\\,dx=\\sqrt{\\pi/a}=${fmt(Math.sqrt(PI/a),3)}\\) stays fixed, because heat is conserved. Peak now: ${fmt(th(0,t),3)}.`); }
    else if(pb==='wave'){ const c=a; P.view(-6,6,-0.05,Math.max(0.6,1/(2*c)*1.4)); P.clear().axes(); P.fill(x=>Math.abs(x)<c*t?1/(2*c):0,'rgba(76,201,240,.3)'); P.fn(x=>Math.abs(x)<c*t?1/(2*c):0,Q5.b,3,{jump:0.01}); P.arrow(0,0,Math.max(0.6,1/(2*c)*1.4)*0.9,'#ff5d8f'); P.text('kick δ(x) at t = 0',0,Math.max(0.6,1/(2*c)*1.4)*0.92,'#ff5d8f',{dx:8});
      tex('#apR',`\\(Y=\\mathcal F\\{\\delta\\}\\frac{\\sin c\\omega t}{c\\omega}=\\frac{\\sin c\\omega t}{c\\omega}\\), which is a box transform with half-width \\(ct\\). So \\(y=\\frac1{2c}\\) for \\(|x|&lt;ct\\) and 0 elsewhere: a plateau whose edges move outward at speed c = ${c}.`); }
    else { P.view(0,4,-0.05,1.15); P.clear().axes(); const tt=Math.max(t,1e-4)*0.3; const u=x=>0.5*(2*erf(x/(2*Math.sqrt(tt)))-erf((x-1)/(2*Math.sqrt(tt)))-erf((x+1)/(2*Math.sqrt(tt))));
      P.fn(x=>x<1?1:0,Q5.m,1.4,{dash:[5,4],jump:0.3}); P.fill(u,'rgba(179,136,255,.25)'); P.fn(u,Q5.p,3);
      tex('#apR',`\\(u=\\frac2\\pi\\int_0^\\infty\\frac{1-\\cos\\omega}{\\omega}e^{-\\omega^2t}\\sin\\omega x\\,d\\omega\\), since \\(F_s\\{u(x,0)\\}=\\int_0^1\\sin\\omega x\\,dx=\\frac{1-\\cos\\omega}{\\omega}\\). It is plotted in closed form with erf. The end x = 0 stays at 0. Time shown: ${fmt(tt,3)}.`); }
  }
  function loop(){ if(!run)return; t+=0.01; if(t>4){t=4; run=false; $('#apPlay').textContent='▶ replay';} draw(); requestAnimationFrame(loop); }
  $('#apPlay').onclick=()=>{ if(run){run=false; $('#apPlay').textContent='▶ play'; return;} if(t>=4)t=0; run=true; $('#apPlay').textContent='⏸ pause'; loop(); };
  P.onresize=draw; bind(['apa'],draw); bind(['apP'],()=>{t=0.3; draw();});
})();

/* ---- strip heatmap (2025 Q3b) ---- */
(function(){
  const P=new Plot('#strip',{xmin:-4,xmax:4,ymin:0,ymax:1,xlabel:'x',ylabel:'y'});
  const NX=160, NY=40, grid=[]; const sr=(w,y)=>w<1e-6?y:(Math.exp(w*(y-1))-Math.exp(-w*(y+1)))/(1-Math.exp(-2*w));
  for(let j=0;j<=NY;j++){ const y=j/NY; grid[j]=[]; for(let i=0;i<=NX;i++){ const x=-4+8*i/NX; grid[j][i]=simpson(w=>Math.exp(-w*w/4)*sr(w,y)*Math.cos(w*x),0,14,280)/Math.sqrt(PI); } }
  const U=(x,y)=>{ const i=Math.round((x+4)/8*NX), j=Math.round(y*NY); return (grid[j]&&grid[j][i])||0; };
  function draw(){ P.clear(); P.heat((x,y)=>U(x,y),inferno,3); P.axes(); P.text('U(x,1) = e^{−x²}',0,0.96,'#fff',{align:'center',dy:6}); P.text('U = 0',0,0.04,'#9aa6c7',{align:'center',dy:-4}); }
  P.onresize=draw; draw();
})();

quiz('#q5',[
 {q:'\\(\\mathcal F\\{f(t-3)\\}=\\)',o:['\\(F(\\omega-3)\\)','\\(e^{-3i\\omega}F(\\omega)\\)','\\(e^{3i\\omega}F\\)','\\(3F(3\\omega)\\)'],a:1,why:'A time shift multiplies by a phase factor.'},
 {q:'\\(\\mathcal F\\{e^{-2|t|}\\}=\\)',o:['\\(\\frac{2}{4+\\omega^2}\\)','\\(\\frac{4}{4+\\omega^2}\\)','\\(\\frac{1}{2+i\\omega}\\)','\\(\\sqrt{\\pi/2}e^{-\\omega^2/8}\\)'],a:1,why:'\\(2\\alpha/(\\alpha^2+\\omega^2)\\) with α = 2.'},
 {q:'If f is real and odd, F is',o:['real and even','real and odd','imaginary and odd','imaginary and even'],a:2,why:'Remark 5.47.'},
 {q:'\\(\\mathcal F\\{f\'\\}=\\)',o:['\\(-i\\omega F\\)','\\(i\\omega F\\)','\\(iF\'(\\omega)\\)','\\(F/(i\\omega)\\)'],a:1,why:'Integrate by parts, and the boundary terms vanish since f → 0.'},
 {q:'\\(\\mathcal F^{-1}\\{2\\pi\\delta(\\omega)\\}=\\)',o:['\\(\\delta(t)\\)','1','\\(2\\pi\\)','\\(u(t)\\)'],a:1,why:'A constant signal has frequency content only at ω = 0.'},
 {q:'Transforming \\(u_t=ku_{xx}\\) in x gives',o:['\\(\\hat u_t=k\\omega^2\\hat u\\)','\\(\\hat u_t=-k\\omega^2\\hat u\\)','\\(\\hat u_t=ik\\omega\\hat u\\)','\\(\\hat u_{tt}=-k\\omega^2\\hat u\\)'],a:1,why:'\\((i\\omega)^2=-\\omega^2\\)'},
]);
