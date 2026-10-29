/* Chapter 1 — Laplace widgets */
const C = {a:'#ff7a59', b:'#4cc9f0', y:'#ffd166', g:'#06d6a0', p:'#ff5d8f', m:'#9aa6c7'};

/* ---- 1. Laplace machine ---- */
(function(){
  const A=new Plot('#lapA',{xmin:0,xmax:6,ymin:-1.2,ymax:3,xlabel:'t'}), B=new Plot('#lapB',{xmin:0,xmax:6,ymin:-0.2,ymax:3,xlabel:'s',ylabel:'F(s)'});
  const fs={
    one:{f:(t,a)=>1, F:(s,a)=>1/s, c:a=>0, tx:'1', Ft:'1/s'},
    t:{f:(t,a)=>t, F:(s,a)=>1/(s*s), c:a=>0, tx:'t', Ft:'1/s²'},
    t2:{f:(t,a)=>t*t, F:(s,a)=>2/(s**3), c:a=>0, tx:'t²', Ft:'2/s³'},
    exp:{f:(t,a)=>Math.exp(a*t), F:(s,a)=>1/(s-a), c:a=>a, tx:'e^{at}', Ft:'1/(s−a)'},
    sin:{f:(t,a)=>Math.sin(a*t), F:(s,a)=>a/(s*s+a*a), c:a=>0, tx:'sin(at)', Ft:'a/(s²+a²)'},
    cos:{f:(t,a)=>Math.cos(a*t), F:(s,a)=>s/(s*s+a*a), c:a=>0, tx:'cos(at)', Ft:'s/(s²+a²)'},
    sinh:{f:(t,a)=>Math.sinh(a*t), F:(s,a)=>a/(s*s-a*a), c:a=>a, tx:'sinh(at)', Ft:'a/(s²−a²)'},
  };
  function draw(){
    const k=fs[val('lapF')], a=val('lapa'), s=val('laps'); const f=t=>k.f(t,a), w=t=>Math.exp(-s*t), p=t=>f(t)*w(t);
    A.clear().axes(); A.fill(p,'rgba(255,209,102,.3)'); A.fn(w,C.m,1.6,{dash:[5,4]}); A.fn(f,C.a,2.2); A.fn(p,C.y,2.8);
    const conv = s>k.c(a);
    const area = simpson(p,0,40,4000);
    B.clear().axes(); B.fn(x=>x>k.c(a)+0.01?k.F(x,a):NaN,C.b,2.6,{a:0.05});
    if(k.c(a)>0) B.vline(k.c(a),'rgba(255,93,108,.8)');
    if(conv){ B.dot(s,k.F(s,a),C.y,6); B.line(s,0,s,k.F(s,a),C.y,1,[3,3]); }
    tex('#lapR', conv
      ? `Area under the yellow curve ≈ <b>${fmt(area,4)}</b>. Formula \\(F(s)=${k.Ft.replaceAll('²','^2').replaceAll('³','^3').replaceAll('−','-')}\\) = <b>${fmt(k.F(s,a),4)}</b> ✔ They match, and that number is the yellow dot on the right.`
      : `⚠ With s = ${s} ≤ ${fmt(k.c(a),2)} the product does not decay, so the integral <b>diverges</b>. F(s) only exists for s > ${fmt(k.c(a),2)} (red dashed line).`);
  }
  A.onresize=B.onresize=draw; bind(['lapF','lapa','laps'],draw);
})();

/* ---- 2. s-shift ---- */
(function(){
  const A=new Plot('#shA',{xmin:0,xmax:8,ymin:-2,ymax:2,xlabel:'t'}), B=new Plot('#shB',{xmin:-2,xmax:5,ymin:-0.3,ymax:2,xlabel:'s'});
  function draw(){ const a=val('sha'), b=val('shb');
    A.clear().axes(); A.fn(t=>Math.exp(a*t),'rgba(255,122,89,.45)',1.2,{dash:[4,4]}); A.fn(t=>-Math.exp(a*t),'rgba(255,122,89,.45)',1.2,{dash:[4,4]});
    A.fn(t=>Math.sin(b*t),C.m,1.5); A.fn(t=>Math.exp(a*t)*Math.sin(b*t),C.a,2.6);
    B.ymax=1.25/b; B.ymin=-0.15/b; B.clear().axes(); const F=s=>b/(s*s+b*b);
    B.fn(s=>s>0?F(s):NaN,C.m,2); B.fn(s=>s>a?F(s-a):NaN,C.a,2.8); B.vline(a,'rgba(255,122,89,.6)');
    B.text('shift by a →',Math.min(a,0),1.7,C.a,{dx:4});
    tex('#shR',`\\(\\mathcal{L}\\{e^{${a}t}\\sin ${b}t\\}=\\dfrac{${b}}{(s-(${a}))^2+${fmt(b*b,2)}}\\). The orange curve on the right is the grey one slid by \\(a=${a}\\). Negative \\(a\\) makes a decaying envelope in time and a left shift in \\(s\\).`);
  }
  A.onresize=B.onresize=draw; bind(['sha','shb'],draw);
})();

/* ---- 3. unit step ---- */
(function(){
  const P=new Plot('#stp',{xmin:-0.5,xmax:10,ymin:-1.5,ymax:4,xlabel:'t'});
  const fs={sin:[Math.sin,'\\sin t','\\frac{1}{s^2+1}'],t2:[t=>t*t/10,'t^2/10','\\frac{2}{10s^3}'],t:[t=>t/3,'t/3','\\frac{1}{3s^2}'],exp:[t=>Math.exp(-t)*2,'2e^{-t}','\\frac{2}{s+1}']};
  function draw(){ const [f,ft,Ft]=fs[val('stpF')], a=val('stpa'), u=t=>t>=a?1:0;
    P.clear().axes(); P.fn(t=>t>=0?f(t):NaN,C.m,1.4,{dash:[4,4]});
    if($('#stpW').checked) P.fn(t=>u(t)*f(t),C.y,2,{jump:0.2});
    P.fn(t=>u(t)*f(t-a),C.a,3,{jump:0.2}); P.vline(a,'rgba(255,122,89,.6)'); P.text('switch on at t = a',a,3.6,C.a,{dx:5});
    tex('#stpR',`\\(\\mathcal{L}\\{u(t-${a})\\,f(t-${a})\\}=e^{-${a}s}\\,${Ft}\\). The orange curve is an exact copy of \\(${ft}\\) moved right by ${a}. The yellow curve is <b>not</b> shifted, so the formula does not apply to it directly.`);
  }
  P.onresize=draw; bind(['stpF','stpa'],draw); $('#stpW').onchange=draw;
})();

/* ---- 4. delta ---- */
(function(){
  const P=new Plot('#dlt',{xmin:0,xmax:6,ymin:-0.5,ymax:12,xlabel:'t'});
  const f=t=>1.5+Math.sin(1.3*t)+0.3*t;
  function draw(){ const n=val('dltn'), a=val('dlta'), l=a-1/(2*n), r=a+1/(2*n);
    const top=Math.min(n,11.5); P.ymax=Math.max(4,Math.min(12,n+1));
    P.clear().axes(); P.fill(t=>(t>=l&&t<=r)?f(t)*n:0,'rgba(255,209,102,.25)');
    P.fill(t=>(t>=l&&t<=r)?n:0,'rgba(255,93,143,.22)');
    P.fn(t=>(t>=l&&t<=r)?n:0,C.p,2.6,{jump:0.05}); P.fn(f,C.b,2.2); P.dot(a,f(a),C.y,6);
    const I=simpson(t=>f(t),Math.max(0,l),r,200)*n;
    tex('#dltR',`Width \\(=1/n=${fmt(1/n,3)}\\), height \\(=n=${n}\\), area \\(=1\\) always. \\(\\int f\\,\\delta_n\\,dt=${fmt(I,4)}\\) compared with \\(f(a)=${fmt(f(a),4)}\\). Push n up and the gap closes.`);
  }
  P.onresize=draw; bind(['dltn','dlta'],draw);
})();

/* ---- 5. periodic ---- */
(function(){
  const P=new Plot('#per',{xmin:0,xmax:12,ymin:-0.4,ymax:2.4,xlabel:'t'});
  const F={
    abs:{f:t=>Math.abs(Math.sin(t)),T:PI,r:'\\(\\int_0^\\pi e^{-st}\\sin t\\,dt=\\frac{1+e^{-\\pi s}}{s^2+1}\\), so \\(\\mathcal{L}\\{|\\sin t|\\}=\\frac{1+e^{-\\pi s}}{(s^2+1)(1-e^{-\\pi s})}=\\frac{1}{s^2+1}\\coth\\frac{\\pi s}{2}\\)'},
    tut:{f:t=>{const m=((t%4)+4)%4; return m<1?2:m<3?1:0},T:4,r:'One period: 2 on [0,1), 1 on [1,3), 0 on [3,4). \\(\\int_0^4=\\frac{2(1-e^{-s})+(e^{-s}-e^{-3s})}{s}\\), so \\(Y(s)=\\dfrac{2-e^{-s}-e^{-3s}}{s(1-e^{-4s})}\\)'},
    saw:{f:t=>t-Math.floor(t),T:1,r:'\\(\\int_0^1te^{-st}dt=\\frac{1-(1+s)e^{-s}}{s^2}\\), so \\(\\mathcal{L}=\\frac{1-(1+s)e^{-s}}{s^2(1-e^{-s})}\\)'}};
  function draw(){ const k=F[val('perF')]; P.clear().axes(); P.fill(t=>t<=k.T?k.f(t):0,'rgba(255,122,89,.3)',{a:0,b:k.T}); P.fn(k.f,C.a,2.4,{jump:0.3}); P.vline(k.T,'rgba(255,209,102,.7)'); P.text('one period T',k.T/2,2.15,C.y,{align:'center'}); tex('#perR',k.r); }
  P.onresize=draw; bind(['perF'],draw);
})();

/* ---- 6. convolution ---- */
(function(){
  const A=new Plot('#cvA',{xmin:-1,xmax:4.5,ymin:-0.5,ymax:12,xlabel:'τ'}), B=new Plot('#cvB',{xmin:0,xmax:4,ymin:-0.5,ymax:60,xlabel:'t',ylabel:'(f*g)(t)'});
  const P={ ex:{f:t=>t*t,g:t=>2*t+3,ym:12,yb:60,exact:t=>t**4/6+t**3},
            rect:{f:t=>(t>=0&&t<=1)?1:0,g:t=>(t>=0&&t<=1.5)?1:0,ym:1.5,yb:1.5},
            expsin:{f:t=>Math.exp(-t),g:t=>Math.sin(t),ym:1.5,yb:0.8}};
  let playing=false;
  function draw(){ const k=P[val('cvP')], t=val('cvt'); A.ymax=k.ym; B.ymax=k.yb; B.ymin=-k.yb*0.08; A.ymin=-k.ym*0.08;
    const f=x=>x>=0?k.f(x):0, g=x=>x>=0?k.g(x):0, h=tau=>f(tau)*g(t-tau);
    A.clear().axes(); A.fill(tau=>(tau>=0&&tau<=t)?h(tau):0,'rgba(255,209,102,.35)'); A.fn(f,C.b,2.4,{jump:0.3}); A.fn(tau=>g(t-tau),C.a,2.4,{jump:0.3}); A.vline(t,'rgba(255,122,89,.5)'); A.text('t',t,k.ym*0.92,C.a,{dx:4});
    const conv=T=>simpson(tau=>f(tau)*g(T-tau),0,T,200);
    B.clear().axes(); B.fn(T=>T<=t?conv(T):NaN,C.g,2.8,{n:200}); B.fn(T=>conv(T),'rgba(6,214,160,.25)',1.2,{n:200,dash:[4,4]}); B.dot(t,conv(t),C.y,6);
    tex('#cvR',`\\((f*g)(${t})=\\int_0^{${t}} f(\\tau)g(${t}-\\tau)\\,d\\tau\\approx ${fmt(conv(t),4)}\\)`+(k.exact?`. Exact answer for Example 1.42: \\(\\frac{t^4}{6}+t^3=${fmt(k.exact(t),4)}\\). By the theorem, \\(\\frac{2}{s^3}\\left(\\frac{2}{s^2}+\\frac3s\\right)=\\frac{4}{s^5}+\\frac{6}{s^4}\\).`:''));
  }
  A.onresize=B.onresize=draw; bind(['cvP','cvt'],draw);
  $('#cvPlay').onclick=()=>{ if(playing){playing=false;return;} playing=true; const e=$('#cvt'); e.value=0;
    (function st(){ if(!playing)return; e.value=+e.value+0.02; e.dispatchEvent(new Event('input')); if(+e.value<4) requestAnimationFrame(st); else playing=false; })(); };
})();

/* ---- 7. pipeline highlight ---- */
(function(){ const nodes=$$('#pipe .node'); $('#pipeSteps').addEventListener('step',e=>{nodes.forEach((n,i)=>n.classList.toggle('hl',i===e.detail-1));}); })();

/* ---- 8. hammer ---- */
(function(){
  const P=new Plot('#hammer',{xmin:0,xmax:14,ymin:-1.4,ymax:1.6,xlabel:'t'}); let T=14, anim=null;
  const y=t=>t>=3?Math.sin(t-3):0;
  function draw(){ P.clear().axes(); P.arrow(3,0,1.4,C.p); P.text('δ(t−3)',3,1.45,C.p,{dx:8}); P.fn(t=>t<=T?y(t):NaN,C.a,2.8); P.dot(T,y(T),C.y,6); $('#hamT').textContent=T.toFixed(1); }
  P.onresize=draw; draw();
  $('#hamPlay').onclick=()=>{ cancelAnimationFrame(anim); T=0; (function st(){ T+=0.05; draw(); if(T<14) anim=requestAnimationFrame(st); })(); };
})();

/* ---- 9. RLC ---- */
(function(){
  const P=new Plot('#rlc',{xmin:0,xmax:10,ymin:-1.2,ymax:1.2,xlabel:'t',ylabel:'i(t)'});
  function draw(){ const R=val('rlcR'), L=val('rlcL'), Cc=val('rlcC');
    // L q'' + R q' + q/C = δ(t)  → q(0+)=0, i(0+)=1/L
    const tab=rk4((t,[q,i])=>[i,(-R*i-q/Cc)/L],0,[0,1/L],10,1500);
    const im=Math.max(...tab.map(r=>Math.abs(r[1][1])))*1.15; P.ymax=im; P.ymin=-im;
    P.clear().axes(); const c=P.ctx; c.save(); c.strokeStyle=themed(C.a); c.lineWidth=2.8; c.beginPath(); tab.forEach(([t,[q,i]],k)=>k?c.lineTo(P.X(t),P.Y(i)):c.moveTo(P.X(t),P.Y(i))); c.stroke(); c.restore();
    const disc=R*R-4*L/Cc; const typ=disc>1e-9?['Overdamped','hyp']:Math.abs(disc)<=1e-9?['Critically damped','par']:['Underdamped (oscillates)','ell'];
    const e=$('#rlcType'); e.textContent=typ[0]; e.className='pill '+typ[1];
    const r1=(-R+Math.sqrt(Math.max(0,disc)))/(2*L), r2=(-R-Math.sqrt(Math.max(0,disc)))/(2*L);
    tex('#rlcRd',`\\(I(s)=\\dfrac{s}{${L}s^2+${R}s+${fmt(1/Cc,2)}}\\). Poles: `+(disc>=0?`\\(s=${fmt(r1,2)},\\ ${fmt(r2,2)}\\) (real, so pure decay).`:`\\(s=${fmt(-R/(2*L),2)}\\pm ${fmt(Math.sqrt(-disc)/(2*L),2)}i\\) (complex, so a decaying oscillation).`)+` Set R = 4, L = 1, C = 0.33 to recover the notes' example.`);
  }
  P.onresize=draw; bind(['rlcR','rlcL','rlcC'],draw);
})();

/* ---- 10. two masses ---- */
(function(){
  const A=new Plot('#msAnim',{xmin:0,xmax:10,ymin:-1,ymax:1,grid:false}), B=new Plot('#msPlot',{xmin:0,xmax:12,ymin:-1.2,ymax:1.2,xlabel:'t'});
  const w1=Math.SQRT2, w2=Math.sqrt(6); let t0=performance.now();
  const sol=(t,v1,v2)=>{ const Aa=(v1+v2)/2, Bb=(v1-v2)/2; return [Aa*Math.sin(w1*t)/w1+Bb*Math.sin(w2*t)/w2, Aa*Math.sin(w1*t)/w1-Bb*Math.sin(w2*t)/w2]; };
  function spring(c,x1,x2,y){ c.beginPath(); c.moveTo(x1,y); const n=14; for(let i=1;i<n;i++){ c.lineTo(x1+(x2-x1)*i/n, y+(i%2?-9:9)); } c.lineTo(x2,y); c.stroke(); }
  function frame(){ const v1=val('msv1'), v2=val('msv2'); const t=(performance.now()-t0)/1000 % 12; const [y1,y2]=sol(t,v1,v2);
    A.clear(); const c=A.ctx, W=A.W, H=A.H, my=H/2; c.fillStyle='#3a4466'; c.fillRect(8,my-40,14,80); c.fillRect(W-22,my-40,14,80);
    const s=W/10, x1=22+(W-44)/3+y1*s, x2=22+2*(W-44)/3+y2*s;
    c.strokeStyle='#9aa6c7'; c.lineWidth=2; spring(c,22,x1-16,my); spring(c,x1+16,x2-16,my); spring(c,x2+16,W-22,my);
    [[x1,C.a,'m₁'],[x2,C.b,'m₂']].forEach(([x,col,l])=>{ c.fillStyle=col; c.beginPath(); c.arc(x,my,16,0,7); c.fill(); c.fillStyle='#0b1020'; c.font='bold 12px Segoe UI'; c.textAlign='center'; c.fillText(l,x,my+4); });
    B.clear().axes(); B.fn(x=>sol(x,v1,v2)[0],C.a,2.4); B.fn(x=>sol(x,v1,v2)[1],C.b,2,{dash:[6,4]}); B.vline(t,'rgba(255,209,102,.6)');
    requestAnimationFrame(frame); }
  frame();
  bind(['msv1','msv2'],()=>{ const v1=val('msv1'), v2=val('msv2'), Aa=(v1+v2)/2, Bb=(v1-v2)/2;
    tex('#msR',`\\(y_1=${fmt(Aa/w1,3)}\\sin\\sqrt2t+${fmt(Bb/w2,3)}\\sin\\sqrt6t\\), \\(y_2=${fmt(Aa/w1,3)}\\sin\\sqrt2t-${fmt(Bb/w2,3)}\\sin\\sqrt6t\\). Equal velocities excite only the in-phase mode \\(\\omega=\\sqrt2\\). Opposite velocities excite only the fast mode \\(\\omega=\\sqrt6\\).`); });
})();

/* ---- quiz ---- */
quiz('#q1',[
 {q:'\\(\\mathcal{L}\\{e^{-2t}\\cos3t\\}=\\)',o:['\\(\\frac{s+2}{(s+2)^2+9}\\)','\\(\\frac{s-2}{(s-2)^2+9}\\)','\\(\\frac{3}{(s+2)^2+9}\\)','\\(\\frac{s}{s^2+9}e^{-2s}\\)'],a:0,why:'First shift: replace s with s − (−2) = s + 2 in s/(s²+9).'},
 {q:'\\(\\mathcal{L}^{-1}\\left\\{\\frac{e^{-7s}s}{s^2+4}\\right\\}=\\)',o:['\\(\\cos 2t\\,u(t-7)\\)','\\(\\cos(2(t-7))u(t-7)\\)','\\(e^{-7t}\\cos2t\\)','\\(\\cos(2t-7)\\)'],a:1,why:'\\(e^{-as}\\) means replace t by t − a everywhere, then multiply by u(t − a). This is Example 1.36.'},
 {q:'\\(\\mathcal{L}\\{y\'\'\\}\\) equals',o:['\\(s^2Y-sy(0)-y\'(0)\\)','\\(s^2Y-y(0)-sy\'(0)\\)','\\(s^2Y+sy(0)+y\'(0)\\)','\\(sY-y\'(0)\\)'],a:0,why:'The powers of s drop while the derivative order rises.'},
 {q:'\\(\\mathcal{L}\\{t\\sin t\\}=\\)',o:['\\(\\frac{2s}{(s^2+1)^2}\\)','\\(\\frac{1}{s^2(s^2+1)}\\)','\\(\\frac{-2s}{(s^2+1)^2}\\)','\\(\\frac{s^2-1}{(s^2+1)^2}\\)'],a:0,why:'\\(-\\frac{d}{ds}\\frac1{s^2+1}=\\frac{2s}{(s^2+1)^2}\\)'},
 {q:'The convolution theorem says',o:['\\(\\mathcal{L}\\{fg\\}=FG\\)','\\(\\mathcal{L}\\{f*g\\}=FG\\)','\\(\\mathcal{L}\\{f*g\\}=F+G\\)','\\(\\mathcal{L}\\{f*g\\}=F/G\\)'],a:1,why:'A product in s corresponds to convolution in t, not to an ordinary product.'},
 {q:'\\(\\int_0^\\infty \\cos(t)\\,\\delta(t-\\pi)\\,dt=\\)',o:['0','1','−1','π'],a:2,why:'The sampling property gives cos(π) = −1.'},
]);
