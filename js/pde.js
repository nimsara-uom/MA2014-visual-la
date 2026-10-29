/* Chapter 3 — PDE widgets */
const Q3={g:'#06d6a0',b:'#4cc9f0',o:'#ff7a59',y:'#ffd166',m:'#9aa6c7'};

/* draw implicit curve F(x,y)=0 by sign changes */
function contour(P,F,col,res=2){ const c=P.ctx; c.fillStyle=col; const W=P.W,H=P.H;
  const inv=(px,py)=>[P.xmin+(px-P.pad)/(W-P.pad-10)*(P.xmax-P.xmin), P.ymax-(py-10)/(H-P.pad-10)*(P.ymax-P.ymin)];
  for(let px=P.pad;px<W-10;px+=res)for(let py=10;py<H-P.pad;py+=res){ const [x,y]=inv(px,py),[x2,y2]=inv(px+res,py+res);
    const s=Math.sign(F(x,y)); if(s!==Math.sign(F(x2,y))||s!==Math.sign(F(x,y2))) c.fillRect(px,py,res,res); } }

/* ---- classifier ---- */
function conic(A,B,C){ let s=''; [[A,'x^2'],[B,'xy'],[C,'y^2']].forEach(([c,v])=>{ if(!c)return; const a=Math.abs(c); s+=(c<0?'-':(s?'+':''))+(a===1?'':a)+v; }); return s||'0'; }
(function(){
  const P=new Plot('#clC',{xmin:-3,xmax:3,ymin:-2.2,ymax:2.2,xlabel:'x',ylabel:'y'});
  const names={ell:['ELLIPTIC','ell','closed curve (ellipse). Typical: Laplace equation, steady states.'],par:['PARABOLIC','par','degenerate case (parallel lines or parabola). Typical: heat equation, diffusion.'],hyp:['HYPERBOLIC','hyp','open curve (hyperbola). Typical: wave equation, signals travel at finite speed.']};
  function draw(){ const A=val('clA'),B=val('clB'),C=val('clCc'); const D=B*B-4*A*C; const t=Math.abs(D)<1e-9?'par':D<0?'ell':'hyp';
    P.clear().axes(); if(A||B||C){ contour(P,(x,y)=>A*x*x+B*x*y+C*y*y-1,'#06d6a0',2); }
    const e=$('#clType'); e.textContent=names[t][0]; e.className='pill '+names[t][1];
    tex('#clR',`\\(B^2-4AC=(${B})^2-4(${A})(${C})=${fmt(D,2)}\\)`+` ⇒ <b>${names[t][0]}</b>. The conic \\(${conic(A,B,C)}=1\\) is a ${names[t][2]}`+(A===0&&B===0&&C===0?' (all zero: not second order).':''));
  }
  P.onresize=draw; bind(['clA','clB','clCc'],draw);
  $('#clP').onchange=e=>{ if(!e.target.value)return; const [a,b,c]=e.target.value.split(',').map(Number); ['clA','clB','clCc'].forEach((id,i)=>{const el=$('#'+id); el.value=[a,b,c][i]; el.dispatchEvent(new Event('input'));}); };
})();

/* ---- type map ---- */
(function(){
  const P=new Plot('#map',{xmin:-2.5,xmax:2.5,ymin:-1.8,ymax:1.8,xlabel:'x',ylabel:'y'});
  const E={tri:{D:(x,y)=>-4*x,r:'\\(A=1,B=0,C=x\\Rightarrow B^2-4AC=-4x\\). Hyperbolic for \\(x&lt;0\\), parabolic on \\(x=0\\), elliptic for \\(x>0\\).'},
           tut:{D:(x,y)=>4*y*y+4*(x*x-1),r:'\\(A=x^2-1,\\ B=2y,\\ C=-1\\Rightarrow B^2-4AC=4y^2+4(x^2-1)=4(x^2+y^2-1)\\). <b>Elliptic</b> inside the unit circle, <b>parabolic</b> on \\(x^2+y^2=1\\), <b>hyperbolic</b> outside.'}};
  function draw(){ const k=E[val('mapE')]; P.clear(); P.heat((x,y)=>k.D(x,y)<0?0:1,t=>t<.5?(isLight()?'rgb(196,226,242)':'rgb(28,62,84)'):(isLight()?'rgb(248,208,196)':'rgb(84,44,40)'),4); P.axes(); contour(P,k.D,'#06d6a0',2);
    P.text('elliptic',val('mapE')==='tri'?1.2:-0.3,0.2,'#4cc9f0'); P.text('hyperbolic',val('mapE')==='tri'?-2:1.4,val('mapE')==='tri'?0.2:1.4,'#ff7a59'); tex('#mapR',k.r); }
  P.onresize=draw; bind(['mapE'],draw);
})();

/* ---- separation cases ---- */
(function(){
  const P=new Plot('#sv',{xmin:-0.2,xmax:PI+0.4,ymin:-1.4,ymax:1.4,xlabel:'x',piTicks:true,xticks:PI/2});
  function draw(){ const c=val('svC'), p=val('svp'), L=PI; let X, msg;
    if(c==='neg'){ X=x=>Math.sin(p*x); const end=Math.sin(p*L); const n=Math.round(p);
      msg=`\\(X=A\\cos px+B\\sin px\\). \\(X(0)=0\\Rightarrow A=0\\). Then \\(X(\\pi)=B\\sin(${p}\\pi)=${fmt(end,3)}\\). `+(Math.abs(end)<0.02?`<b>Hit!</b> \\(p\\approx${n}\\) is an eigenvalue, so \\(X_${n}=\\sin ${n}x\\).`:'Not zero. Slide p to a whole number to find the allowed modes \\(p=n\\pi/L\\).');}
    else if(c==='zero'){ X=x=>x/L; msg='\\(X=Ax+B\\). \\(X(0)=0\\Rightarrow B=0\\). \\(X(\\pi)=A\\pi=0\\Rightarrow A=0\\). Only the trivial solution survives ✘.'; }
    else { X=x=>Math.sinh(p*x)/Math.sinh(p*L); msg='\\(X=Ae^{px}+Be^{-px}\\). \\(X(0)=0\\Rightarrow B=-A\\), so \\(X=2A\\sinh px\\). Since \\(\\sinh(p\\pi)\\neq0\\), we need \\(A=0\\). Trivial again ✘.'; }
    P.clear().axes(); P.fn(X,Q3.g,3,{a:0,b:L}); P.dot(0,0,Q3.y,6); P.dot(L,X(L),Math.abs(X(L))<0.02?Q3.g:'#ff5d6c',7); P.vline(L,'rgba(255,255,255,.25)'); P.text('x = L',L,1.25,Q3.m,{dx:4}); tex('#svR',msg); }
  P.onresize=draw; bind(['svC','svp'],draw);
})();

/* ---- Laplace plate ---- */
(function(){
  const P=new Plot('#lp',{xlabel:'x',ylabel:'y'});
  const odd=(N,f)=>{let s=0; for(let k=0;k<N;k++){const n=2*k+1; s+=f(n);} return s;};
  const sratio=(n,num,den)=>{ // sinh(num)/sinh(den) stable, num<=den
    return (Math.exp(num-den)-Math.exp(-num-den))/(1-Math.exp(-2*den)); };
  const Pb={
    notes:{a:2,b:1,max:100,T:(x,y,N)=>odd(N,n=>400/(n*PI)*Math.sin(n*PI*x/2)*sratio(n,n*PI*y/2,n*PI*1/2)),r:'θ = 0 on three edges and 100 °C on the top edge y = b (here a = 2, b = 1). Near the hot corners the series shows Gibbs ripples.'},
    e25:{a:1,b:1,max:Math.sinh(PI),T:(x,y)=>Math.sin(PI*x)*Math.sinh(PI*(1-y)),r:'\\(U=\\sin(\\pi x)\\sinh\\pi(1-y)\\). It is a single term, so N does not matter. Hottest point: middle of the bottom edge, \\(\\sinh\\pi\\approx11.55\\).'},
    t5:{a:4,b:2,max:4,T:(x,y,N)=>odd(N,n=>128/(n**3*PI**3)*Math.sin(n*PI*x/4)*sratio(n,n*PI*(2-y)/4,n*PI/2)),r:'\\(u=\\sum_{odd}\\frac{128}{n^3\\pi^3}\\sin\\frac{n\\pi x}4\\frac{\\sinh\\frac{n\\pi(2-y)}4}{\\sinh\\frac{n\\pi}2}\\). The \\(1/n^3\\) coefficients converge very fast.'},
    e312:{a:8,b:16,max:100,T:(x,y)=>100*Math.sin(PI*x/8)*Math.exp(-PI*y/8),r:'Semi-infinite plate: use \\(e^{-ky}\\) instead of sinh so that \\(u\\to0\\) as \\(y\\to\\infty\\). \\(u=100\\sin\\frac{\\pi x}8e^{-\\pi y/8}\\).'},
    t4:{a:50,b:60,max:80,T:(x,y,N)=>odd(N,n=>320/(n*PI)*Math.sin(n*PI*x/50)*Math.exp(-n*PI*y/50)),r:'\\(u=\\sum_{odd}\\frac{320}{n\\pi}\\sin\\frac{n\\pi x}{50}e^{-n\\pi y/50}\\), from the sine series of the constant 80.'}};
  let cur;
  function draw(){ const k=Pb[val('lpP')], N=val('lpN'); cur=k; P.view(0,k.a,0,k.b);
    P.clear(); P.heat((x,y)=>k.T(x,y,N)/k.max,inferno,4); P.axes(); tex('#lpR',k.r+' Hover over the plate to read values.'); }
  P.onresize=draw; bind(['lpP','lpN'],draw);
  P.cv.addEventListener('mousemove',e=>{ const r=P.cv.getBoundingClientRect(); const px=e.clientX-r.left, py=e.clientY-r.top;
    const x=P.xmin+(px-P.pad)/(P.W-P.pad-10)*(P.xmax-P.xmin), y=P.ymax-(py-10)/(P.H-P.pad-10)*(P.ymax-P.ymin);
    if(x<0||x>cur.a||y<0||y>cur.b)return; draw(); P.dot(x,y,'#4cc9f0',5); P.text(`(${fmt(x,2)}, ${fmt(y,2)}) → ${fmt(cur.T(x,y,val('lpN')),2)}`,x,y,'#fff',{dx:8,dy:-8,align:x>cur.a*0.6?'right':'left'}); });
})();

/* ---- polar ---- */
(function(){
  const P=new Plot('#pol',{grid:false});
  function draw(){ const pb=val('polP'), N=val('polN'); const asp=(P.W-P.pad-10)/(P.H-P.pad-10);
    if(pb==='semi'){ const h=1.15; P.view(-h*asp/2*1.0,h*asp/2,-0.05,1.1);
      P.clear(); P.heat((x,y)=>{ const r=Math.hypot(x,y), th=Math.atan2(y,x); if(r>1||y<0) return NaN; let s=0; for(let m=0;m<N;m++){const n=2*m+1; s+=Math.pow(r,n)*Math.sin(n*th)/n;} return 4/PI*s; },t=>isNaN(t)?P.bg():inferno(t),3);
      P.axes(); tex('#polR','Rim at \\(T_0\\) (bright), diameter at 0 (dark). Along the vertical radius \\(\\theta=\\pi/2\\), the temperature rises smoothly from the cold edge to the hot rim.'); }
    else { const h=1.15; P.view(-h*asp,h*asp,-h,h);
      P.clear(); P.heat((x,y)=>{ const r=Math.hypot(x,y); if(r>1) return NaN; const th=Math.atan2(y,x); return (r*r*Math.sin(2*th)-4*r*Math.cos(th)+5)/10; },t=>isNaN(t)?P.bg():coolwarm(t),3);
      P.axes(); tex('#polR','Periodic in θ and finite at r = 0, so \\(T=a_0+\\sum r^n(a_n\\cos n\\theta+b_n\\sin n\\theta)\\). Matching \\(T(1,\\theta)\\) gives \\(\\boxed{T=r^2\\sin2\\theta-4r\\cos\\theta}\\). Blue is cold and red is hot.'); }
  }
  P.onresize=draw; bind(['polP','polN'],draw);
})();

/* ---- 1D heat ---- */
(function(){
  const bar=new Plot('#htBar',{xmin:0,xmax:1,ymin:0,ymax:1,grid:false,pad:10}), P=new Plot('#htP',{xlabel:'x',ylabel:'u'});
  const C={
    e21:{L:PI,lo:0,hi:100,tmax:3,u:(x,t)=>{let s=0; for(let n=1;n<120;n+=2) s+=400/(n*PI)*Math.sin(n*x)*Math.exp(-n*n*t); return s;},ss:x=>0,f:x=>100,r:'Bar at 100 °C dropped into ice at both ends. The flat top rounds off immediately (high harmonics die first), then the n = 1 hump decays like \\(e^{-t}\\).'},
    t7:{L:10,lo:0,hi:25,tmax:4,u:(x,t)=>{let s=0; for(let n=1;n<40;n+=2) s+=800/(n**3*PI**3)*Math.sin(n*PI*x/10)*Math.exp(-4*n*n*PI*PI*t/100); return s;},ss:x=>0,f:x=>x*(10-x),r:'\\(u=\\sum_{odd}\\frac{800}{n^3\\pi^3}\\sin\\frac{n\\pi x}{10}e^{-4n^2\\pi^2t/100}\\). The parabola is almost pure mode 1, so its shape barely changes while it decays.'},
    e316:{L:1,lo:10,hi:50,tmax:0.25,u:(x,t)=>{let s=50-40*x; for(let n=2;n<200;n+=2) s-=120/(n*PI)*Math.sin(n*PI*x)*Math.exp(-n*n*PI*PI*t); return s;},ss:x=>50-40*x,f:x=>20+20*x,r:'Starts on the old straight line 20 → 40 and relaxes to the new straight line 50 → 10. Only even modes appear in \\(u-u_s\\).'}};
  let t=0, run=false, last=0;
  function draw(){ const k=C[val('htC')]; const L=k.L, sp=k.hi-k.lo;
    bar.clear(); bar.heat((x,y)=>(k.u(x*L,t)-k.lo)/sp,inferno,3);
    P.view(0,L,k.lo-sp*0.1,k.hi+sp*0.15); P.piTicks=L===PI; P.xticks=L===PI?PI/4:null;
    P.clear().axes(); P.fn(k.f,Q3.m,1.4,{dash:[5,4],a:0.001,b:L-0.001}); P.fn(k.ss,Q3.b,1.4,{dash:[2,4]}); P.fn(x=>k.u(x,t),Q3.o,3,{n:300});
    $('#htT').textContent=t.toFixed(3); tex('#htR',k.r);
  }
  function loop(ts){ if(!run)return; const k=C[val('htC')]; const dt=Math.min(0.05,(ts-last)/1000); last=ts; t+=dt*k.tmax/8*val('htS'); if(t>k.tmax){t=k.tmax; run=false; $('#htPlay').textContent='▶ replay';} draw(); requestAnimationFrame(loop); }
  $('#htPlay').onclick=()=>{ if(run){run=false; $('#htPlay').textContent='▶ play'; return;} if(t>=C[val('htC')].tmax) t=0; run=true; $('#htPlay').textContent='⏸ pause'; last=performance.now(); requestAnimationFrame(loop); };
  bar.onresize=P.onresize=draw; bind(['htS'],()=>{}); bind(['htC'],()=>{t=0; draw();});
})();

/* ---- wave ---- */
(function(){
  const P=new Plot('#wv',{xlabel:'x'}); let t=0, trail=[];
  const W={
    q3b:{L:1,A:220,y:(x,t,c)=>200*Math.sin(4*PI*x)*Math.cos(4*PI*c*t),r:'Mode 4 only: four loops, three nodes in between that never move. Period \\(T=\\frac{2l}{4c}\\).'},
    q3c:{L:1,A:c=>110/(PI*c),y:(x,t,c)=>100/(PI*c)*Math.sin(PI*x)*Math.sin(PI*c*t),r:'It starts flat and is pushed upward. The amplitude \\(\\frac{100l}{\\pi c}\\) shrinks for a faster string. Move c and watch it change.'},
    pluck:{L:10,A:2.6,y:(x,t,c)=>{let s=0; for(let n=1;n<60;n+=2) s+=16/(n*n*PI*PI)*Math.sin(n*PI/2)*Math.sin(n*PI*x/10)*Math.cos(n*PI*c*t/10); return s;},f:x=>x<5?0.4*x:0.4*(10-x),r:'\\(u=\\sum\\frac{16}{n^2\\pi^2}\\sin\\frac{n\\pi}2\\sin\\frac{n\\pi x}{10}\\cos\\frac{n\\pi t}{10}\\). The triangle splits into two kinks that travel and reflect. That is d\'Alembert\'s picture.'},
    mode:{L:1,A:1.3,y:(x,t,c,n)=>Math.sin(n*PI*x)*Math.cos(n*PI*c*t),r:'Mode n has n loops and n − 1 interior nodes. Its frequency is \\(\\frac{nc}{2L}\\), so higher modes vibrate faster.'}};
  function frame(){ const k=W[val('wvP')], c=val('wvc'), n=val('wvn'); const A=typeof k.A==='function'?k.A(c):k.A;
    P.view(0,k.L,-A,A); P.clear().axes(); const f=x=>k.y(x,t,c,n);
    if($('#wvG').checked){ trail.forEach((g,i)=>P.fn(g,'rgba(6,214,160,1)',1.2,{alpha:0.05+0.25*i/trail.length,n:200})); }
    if(k.f) P.fn(k.f,Q3.m,1,{dash:[4,4]});
    P.fn(f,Q3.g,3.2,{n:400}); P.dot(0,0,Q3.y,6); P.dot(k.L,0,Q3.y,6);
    const tt=t; trail.push(x=>k.y(x,tt,c,n)); if(trail.length>14) trail.shift();
    t+=0.004*(k.L===10?10:1); $('#wvT').textContent=t.toFixed(2); requestAnimationFrame(frame); }
  bind(['wvP','wvn','wvc'],()=>{ trail=[]; t=0; tex('#wvR',W[val('wvP')].r); }); frame();
})();

quiz('#q3',[
 {q:'\\(u_{xx}-7u_{xy}+6u_{yy}=0\\) is',o:['elliptic','parabolic','hyperbolic','not second order'],a:2,why:'\\(49-24=25>0\\)'},
 {q:'\\(4u_{xx}-4u_{xy}+u_{yy}=0\\) is',o:['elliptic','parabolic','hyperbolic','mixed'],a:1,why:'\\(16-16=0\\)'},
 {q:'In separation of variables for the heat equation with zero end temperatures, the separation constant must be',o:['positive','zero','negative','any value'],a:2,why:'Only \\(-p^2\\) gives sines that vanish at both ends, plus decay in time.'},
 {q:'The heat-equation mode \\(\\sin\\frac{3\\pi x}{L}\\) decays like',o:['\\(e^{-3kt}\\)','\\(e^{-9\\pi^2kt/L^2}\\)','\\(\\cos\\frac{3\\pi ct}{L}\\)','it does not decay'],a:1,why:'The rate is \\(kn^2\\pi^2/L^2\\) with n = 3.'},
 {q:'For a semi-infinite plate with \\(u\\to0\\) as \\(y\\to\\infty\\), the y-part is',o:['\\(\\sinh ky\\)','\\(\\cosh ky\\)','\\(e^{-ky}\\)','\\(\\sin ky\\)'],a:2,why:'sinh and cosh blow up. Only the decaying exponential satisfies the condition.'},
 {q:'A string released from rest has a solution containing',o:['only sin(nπct/L)','only cos(nπct/L)','both','neither'],a:1,why:'Zero initial velocity kills the \\(D_n\\) sine-in-time terms.'},
]);
