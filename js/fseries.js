/* Chapter 2 — Fourier series widgets */
const K={y:'#ffd166',m:'#9aa6c7',g:'#06d6a0',o:'#ff7a59',b:'#4cc9f0',p:'#b388ff'};

/* periodic extension helper: f defined on [a,a+T) */
const per=(f,a,T)=>x=>f(((x-a)%T+T)%T+a);
/* numeric coefficients for period 2L on [a,a+2L] */
function coeffs(f,a,L,N){ const A=[],B=[]; const T=2*L;
  for(let n=0;n<=N;n++){ A[n]=simpson(x=>f(x)*Math.cos(n*PI*x/L),a,a+T,1600)/L; B[n]=n?simpson(x=>f(x)*Math.sin(n*PI*x/L),a,a+T,1600)/L:0; }
  return {A,B}; }
const partial=(c,L,N)=>x=>{ let s=c.A[0]/2; for(let n=1;n<=N;n++) s+=c.A[n]*Math.cos(n*PI*x/L)+c.B[n]*Math.sin(n*PI*x/L); return s; };

const PRESETS={
  square:{name:'Square wave sign(x) (Ex 2.15)',f:x=>x<0?-1:1,a:-PI,L:PI,y:[-1.6,1.6],tx:'\\(b_n=\\frac{4}{n\\pi}\\) for odd n, everything else 0'},
  x:{name:'x on (−π, π) (Ex 2.14 / 2.17)',f:x=>x,a:-PI,L:PI,y:[-4.2,4.2],tx:'\\(a_n=0,\\ b_n=\\frac{2(-1)^{n+1}}{n}\\)'},
  x02:{name:'x on (0, 2π) (Ex 2.11)',f:x=>x,a:0,L:PI,y:[-1,7.5],tx:'\\(a_0=2\\pi,\\ a_n=0,\\ b_n=-\\frac2n\\)'},
  xx2:{name:'x + x² (Ex 2.12)',f:x=>x+x*x,a:-PI,L:PI,y:[-2,14],tx:'\\(a_0=\\frac{2\\pi^2}3,\\ a_n=\\frac{4(-1)^n}{n^2},\\ b_n=\\frac{2(-1)^{n+1}}n\\)'},
  x2:{name:'x² (Ex 2.18)',f:x=>x*x,a:-PI,L:PI,y:[-1.5,11],tx:'\\(a_0=\\frac{2\\pi^2}3,\\ a_n=\\frac{4(-1)^n}{n^2},\\ b_n=0\\)'},
  zx:{name:'0 then x (Ex 2.16)',f:x=>x<0?0:x,a:-PI,L:PI,y:[-1,4],tx:'\\(a_0=\\frac\\pi2,\\ a_n=\\frac{(-1)^n-1}{\\pi n^2},\\ b_n=\\frac{(-1)^{n+1}}n\\)'},
  tri:{name:'Triangle 1 ∓ 2x/π (Ex 2.19)',f:x=>x<0?1+2*x/PI:1-2*x/PI,a:-PI,L:PI,y:[-1.5,1.5],tx:'\\(a_0=0,\\ a_n=\\frac{4(1-(-1)^n)}{\\pi^2n^2},\\ b_n=0\\)'},
  abs4:{name:'|x|, period 4 (Ex 2.24)',f:x=>Math.abs(x),a:-2,L:2,y:[-0.5,2.5],tx:'\\(a_0=2,\\ a_n=\\frac{4((-1)^n-1)}{n^2\\pi^2}\\)'},
  onepx:{name:'1 + x (2021 exam Q4)',f:x=>1+x,a:-PI,L:PI,y:[-3,5],tx:'\\(a_0=2,\\ a_n=0,\\ b_n=\\frac{2(-1)^{n+1}}n\\)'},
  ex25:{name:'−1 for |x|<1, 0 for 1≤|x|<2 (2025 exam Q2)',f:x=>Math.abs(x)<1?-1:0,a:-2,L:2,y:[-1.6,0.6],tx:'\\(a_0=-1,\\ a_n=-\\frac{2}{n\\pi}\\sin\\frac{n\\pi}2,\\ b_n=0\\)'},
  tut:{name:'π then x (Tutorial Q1)',f:x=>x<0?PI:x,a:-PI,L:PI,y:[-0.5,4],tx:'\\(a_0=\\frac{3\\pi}2,\\ a_n=\\frac{(-1)^n-1}{\\pi n^2},\\ b_n=-\\frac1n\\)'},
  xpx:{name:'x(π − |x|) odd',f:x=>x*(PI-Math.abs(x)),a:-PI,L:PI,y:[-3,3],tx:'Smooth function, so the coefficients shrink fast: \\(b_n=\\frac{4(1-(-1)^n)}{\\pi n^3}\\)'},
};
function fillSel(id,keys){ $('#'+id).innerHTML=keys.map(k=>`<option value="${k}">${PRESETS[k].name}</option>`).join(''); }

/* ---- even / odd ---- */
(function(){
  const P=new Plot('#eo',{xmin:-3,xmax:3,ymin:-5,ymax:6,xlabel:'x'});
  const F={ex:[Math.exp,'neither','\\(f_e=\\cosh x,\\ f_o=\\sinh x\\)'],x2:[x=>x*x-3,'even','\\(f(-x)=x^2-3=f(x)\\)'],x5:[x=>x+5,'neither','\\(f_e=5,\\ f_o=x\\)'],
           cub:[x=>2*x**3-x,'odd','\\(f(-x)=-2x^3+x=-f(x)\\)'],abs:[Math.abs,'even','\\(|-x|=|x|\\)'],cs:[x=>Math.cos(x)+Math.sin(x),'neither','\\(f_e=\\cos x,\\ f_o=\\sin x\\)']};
  function draw(){ const [f,t,r]=F[val('eoF')]; P.clear().axes(); P.fn(x=>f(-x),K.m,1.6,{dash:[5,4]});
    if($('#eoS').checked){ P.fn(x=>(f(x)+f(-x))/2,K.g,2); P.fn(x=>(f(x)-f(-x))/2,K.o,2); }
    P.fn(f,K.y,3);
    tex('#eoR',`This function is <b>${t.toUpperCase()}</b>. ${r}. `+(t==='even'?'The mirror lies exactly on top of f.':t==='odd'?'The mirror is f flipped upside down.':'The mirror is a different curve, but the green and orange parts still add up to f.'));
  }
  P.onresize=draw; bind(['eoF'],draw); $('#eoS').onchange=draw;
})();

/* ---- orthogonality ---- */
(function(){
  const P=new Plot('#orth',{xmin:-PI,xmax:PI,ymin:-1.3,ymax:1.3,xlabel:'x',piTicks:true,xticks:PI/2});
  function draw(){ const fa=Math[val('orA')], fb=Math[val('orB')], n=val('orn'), m=val('orm');
    const g=x=>fa(n*x)*fb(m*x); P.clear().axes(); P.fill(g,'rgba(255,209,102,.3)'); P.fn(x=>fa(n*x),K.b,1.6); P.fn(x=>fb(m*x),K.o,1.6); P.fn(g,K.y,2.6);
    const I=simpson(g,-PI,PI,2000);
    tex('#orR',`\\(\\int_{-\\pi}^{\\pi}\\${val('orA')}(${n}x)\\${val('orB')}(${m}x)\\,dx\\approx ${fmt(I,4)}\\). `+(Math.abs(I)<1e-6?'The positive and negative lobes cancel exactly, so the functions are <b>orthogonal</b>.':`It is not zero. That only happens for matching terms: \\(\\pi\\) for \\(\\sin^2\\) or \\(\\cos^2\\) over \\(2\\pi\\).`));
  }
  P.onresize=draw; bind(['orA','orB','orn','orm'],draw);
})();

/* ---- Fourier builder ---- */
(function(){
  fillSel('fbF',Object.keys(PRESETS));
  const P=new Plot('#fb',{xlabel:'x'}), Q=new Plot('#fbC',{xmin:-0.5,xmax:20.5,ymin:-2,ymax:2,xlabel:'n',xticks:1}); let cache={}, anim;
  function draw(){ const k=PRESETS[val('fbF')], N=val('fbN'); const L=k.L;
    if(!cache[val('fbF')]) cache[val('fbF')]=coeffs(k.f,k.a,L,60); const c=cache[val('fbF')];
    P.view(k.a-L*1.2, k.a+2*L+L*1.2, k.y[0], k.y[1]); P.piTicks=L===PI; P.xticks=L===PI?PI/2:null;
    const fx=per(k.f,k.a,2*L), S=partial(c,L,N);
    P.clear().axes(); P.fn(fx,K.m,1.8,{jump:0.3});
    if(N>0) P.fn(x=>c.A[N]*Math.cos(N*PI*x/L)+c.B[N]*Math.sin(N*PI*x/L),K.o,1.4,{alpha:.8});
    P.fn(S,K.y,2.8,{jump:2}); P.line(k.a,k.y[0],k.a,k.y[1],'rgba(255,255,255,.12)',1); P.line(k.a+2*L,k.y[0],k.a+2*L,k.y[1],'rgba(255,255,255,.12)',1);
    const M=Math.max(0.5,...c.A.slice(0,21).map(Math.abs),...c.B.slice(1,21).map(Math.abs))*1.1; Q.ymin=-M; Q.ymax=M; Q.yticks=null;
    Q.clear().axes(); const ns=[...Array(21).keys()];
    Q.bars(ns.map(n=>n-0.18),ns.map(n=>n===0?c.A[0]/2:c.A[n]),K.g,0.32); Q.bars(ns.slice(1).map(n=>n+0.18),ns.slice(1).map(n=>c.B[n]),K.p,0.32);
    if(N<=20) Q.vline(N+0.5,'rgba(255,209,102,.7)');
    const err=Math.sqrt(simpson(x=>(k.f(x)-S(x))**2,k.a,k.a+2*L,1200)/(2*L));
    tex('#fbR',`${k.tx}. Numerically \\(a_0/2=${fmt(c.A[0]/2)}\\), \\(a_1=${fmt(c.A[1])}\\), \\(b_1=${fmt(c.B[1])}\\), \\(a_2=${fmt(c.A[2])}\\), \\(b_2=${fmt(c.B[2])}\\). RMS error with ${N} terms: <b>${fmt(err,4)}</b>.`);
  }
  P.onresize=Q.onresize=draw; bind(['fbF','fbN'],draw);
  $('#fbPlay').onclick=()=>{ clearInterval(anim); const e=$('#fbN'); e.value=0; e.dispatchEvent(new Event('input')); anim=setInterval(()=>{ e.value=+e.value+1; e.dispatchEvent(new Event('input')); if(+e.value>=30) clearInterval(anim); },160); };
})();

/* ---- Dirichlet zoom ---- */
(function(){
  const P=new Plot('#dir',{xmin:PI-1.2,xmax:PI+1.2,ymin:-4.5,ymax:4.5,xlabel:'x'});
  function draw(){ const N=val('dirN'); const S=x=>{let s=0; for(let n=1;n<=N;n++) s+=2*(-1)**(n+1)/n*Math.sin(n*x); return s;};
    P.clear().axes(); P.fn(per(x=>x,-PI,2*PI),K.m,2,{jump:0.3}); P.fn(S,K.y,2.6); P.vline(PI,'rgba(255,255,255,.3)');
    P.dot(PI,PI,K.m,5,true); P.dot(PI,-PI,K.m,5,true); P.dot(PI,0,K.o,7); P.text('midpoint (π + (−π))/2 = 0',PI,0,K.o,{dx:10,dy:-8});
    tex('#dirR',`f = x extended with period \\(2\\pi\\). At \\(x=\\pi\\) it jumps from \\(\\pi\\) to \\(-\\pi\\). \\(S_{${N}}(\\pi)=${fmt(S(PI),6)}\\), which is exactly the midpoint. Just left of the jump, \\(S_N(\\pi-0.05)=${fmt(S(PI-0.05),3)}\\) while \\(f=${fmt(PI-0.05,3)}\\).`);
  }
  P.onresize=draw; bind(['dirN'],draw);
})();

/* ---- half range ---- */
(function(){
  const H={
    g21:{name:'2x − 1 on (0, 1) (2021 exam Q4c)',f:x=>2*x-1,L:1,y:[-1.6,1.6]},
    xpx:{name:'x(π − x) on (0, π) (2022 exam Q4a)',f:x=>x*(PI-x),L:PI,y:[-3,3]},
    sinx:{name:'sin x on (0, π) (Ex 2.23)',f:Math.sin,L:PI,y:[-1.4,1.4]},
    cosx:{name:'cos x on (0, π) (Tutorial Q2)',f:Math.cos,L:PI,y:[-1.4,1.4]},
    tx:{name:'2x on (0, 4) (Tutorial Q3)',f:x=>2*x,L:4,y:[-9,9]},
    e220:{name:'x then π/2 (Ex 2.20)',f:x=>x<PI/2?x:PI/2,L:PI,y:[-2,2]},
    e221:{name:'1 then −x (Ex 2.21)',f:x=>x<PI/2?1:-x,L:PI,y:[-3.5,3.5]},
    e222:{name:'¼ − x then x − ¾ (Ex 2.22)',f:x=>x<PI/2?0.25-x:x-0.75,L:PI,y:[-2.5,2.5]},
  };
  $('#hrF').innerHTML=Object.keys(H).map(k=>`<option value="${k}">${H[k].name}</option>`).join('');
  const P=new Plot('#hr',{xlabel:'x'});
  function draw(){ const k=H[val('hrF')], ty=val('hrT'), N=val('hrN'), L=k.L;
    const ext=x=>{ const T=2*L; let u=((x+L)%T+T)%T-L; return u>=0?k.f(u):(ty==='cos'?k.f(-u):-k.f(-u)); };
    const c=[]; for(let n=0;n<=N;n++) c[n]=2/L*simpson(x=>k.f(x)*(ty==='cos'?Math.cos(n*PI*x/L):Math.sin(n*PI*x/L)),0,L,1200);
    const S=x=>{ let s=ty==='cos'?c[0]/2:0; for(let n=1;n<=N;n++) s+=c[n]*(ty==='cos'?Math.cos(n*PI*x/L):Math.sin(n*PI*x/L)); return s; };
    P.view(-3*L,3*L,k.y[0],k.y[1]); P.piTicks=L===PI; P.xticks=L===PI?PI/2:null;
    P.clear().axes(); P.fill(x=>(x>0&&x<L)?k.f(x):0,'rgba(255,209,102,.13)'); P.fn(ext,K.m,1.6,{jump:0.3,dash:[5,4]}); P.fn(k.f,K.y,3.2,{a:0.0001,b:L}); P.fn(S,K.g,2.4);
    const lst=c.slice(ty==='cos'?0:1,ty==='cos'?6:7).map((v,i)=>`${ty==='cos'?'a':'b'}_{${i+(ty==='cos'?0:1)}}=${fmt(v,3)}`).join(',\\ ');
    tex('#hrR',`\\(${lst}\\). `+(ty==='cos'?'Even extension: the grey mirror image fills (−ℓ, 0).':'Odd extension: the grey curve is the piece flipped through the origin.'));
  }
  P.onresize=draw; bind(['hrF','hrT','hrN'],draw);
})();

/* ---- Parseval ---- */
(function(){
  const keys=['x2','x','square','onepx','ex25','tri','abs4']; fillSel('pvF',keys);
  const P=new Plot('#pv',{xmin:0,xmax:41,ymin:0,ymax:1,xlabel:'N (harmonics included)',xticks:5}); const cache={};
  const ex={x2:'\\(\\sum\\frac1{n^4}=\\frac{\\pi^4}{90}\\)',x:'\\(\\sum\\frac1{n^2}=\\frac{\\pi^2}{6}\\)',square:'\\(\\sum_{odd}\\frac1{n^2}=\\frac{\\pi^2}8\\)',onepx:'\\(2+4\\sum\\frac1{n^2}=2+\\frac{2\\pi^2}3\\Rightarrow\\sum\\frac1{n^2}=\\frac{\\pi^2}6\\) (2021 Q4b)',ex25:'\\(1=\\frac12+\\frac4{\\pi^2}\\sum_{odd}\\frac1{n^2}\\Rightarrow\\sum\\frac1{(2n+1)^2}=\\frac{\\pi^2}8\\) (2025 Q2a(iii))',tri:'\\(\\sum\\frac{1}{(2n-1)^4}=\\frac{\\pi^4}{96}\\)',abs4:'\\(\\sum\\frac{1}{(2n-1)^4}=\\frac{\\pi^4}{96}\\)'};
  function draw(){ const id=val('pvF'), k=PRESETS[id], N=val('pvN'); if(!cache[id]) cache[id]=coeffs(k.f,k.a,k.L,40); const c=cache[id];
    const tot=simpson(x=>k.f(x)**2,k.a,k.a+2*k.L,3000)/k.L; P.ymax=tot*1.12; P.yticks=null;
    const cum=[]; let s=c.A[0]**2/2; cum[0]=s; for(let n=1;n<=40;n++){ s+=c.A[n]**2+c.B[n]**2; cum[n]=s; }
    P.clear().axes(); P.bars([...Array(41).keys()],cum.map((v,i)=>i<=N?v:0),'rgba(255,209,102,.85)',0.7); P.bars([...Array(41).keys()],cum.map((v,i)=>i>N?v:0),'rgba(255,209,102,.18)',0.7);
    P.hline(tot,'#ff5d8f',[6,4]); P.text('(1/ℓ)∫f² = '+fmt(tot,4),1,tot,'#ff5d8f',{dy:-6});
    tex('#pvR',`With ${N} harmonics: \\(\\frac{a_0^2}2+\\sum^{${N}}(a_n^2+b_n^2)=${fmt(cum[N],4)}\\), which is <b>${fmt(100*cum[N]/tot,2)}%</b> of the total \\(${fmt(tot,4)}\\). Using exact coefficients gives ${ex[id]}.`);
  }
  P.onresize=draw; bind(['pvF','pvN'],draw);
})();

/* ---- Complex ---- */
(function(){
  const S=new Plot('#cxS',{xmin:-30.5,xmax:30.5,ymin:0,ymax:1,xlabel:'n',ylabel:'|cₙ|'}), F=new Plot('#cxF',{xlabel:'x'});
  const D={ex:{f:Math.exp,L:1,y:[-0.3,3.2],tx:'\\(c_n=\\dfrac{(-1)^n\\sinh 1}{1-in\\pi}\\)'},
           emx:{f:x=>Math.exp(-x),L:1,y:[-0.3,3.2],tx:'\\(c_n=\\dfrac{(-1)^n\\sinh 1}{1+in\\pi}\\)'},
           step:{f:x=>x<0?0:1,L:PI,y:[-0.4,1.4],tx:'\\(c_0=\\frac12,\\ c_n=\\dfrac{1-(-1)^n}{2\\pi i n}\\)'},
           e2x:{f:x=>Math.exp(2*x),L:PI,y:[-30,560],tx:'\\(c_n=\\dfrac{(-1)^n\\sinh 2\\pi}{\\pi(2-in)}\\)'}};
  function draw(){ const k=D[val('cxP')], N=val('cxN'), L=k.L;
    const cr=[],ci=[]; for(let n=-30;n<=30;n++){ cr[n+30]=simpson(x=>k.f(x)*Math.cos(n*PI*x/L),-L,L,1600)/(2*L); ci[n+30]=-simpson(x=>k.f(x)*Math.sin(n*PI*x/L),-L,L,1600)/(2*L); }
    const mag=cr.map((r,i)=>Math.hypot(r,ci[i])); S.ymax=Math.max(...mag)*1.1; S.yticks=null;
    S.clear().axes(); const ns=[...Array(61).keys()].map(i=>i-30);
    S.bars(ns,mag.map((m,i)=>Math.abs(ns[i])<=N?m:0),'#b388ff',0.5); S.bars(ns,mag.map((m,i)=>Math.abs(ns[i])>N?m:0),'rgba(179,136,255,.2)',0.5);
    F.view(-3*L,3*L,k.y[0],k.y[1]); F.piTicks=L===PI; F.xticks=L===PI?PI/2:null;
    const sum=x=>{let s=0; for(let n=-N;n<=N;n++){ const a=n*PI*x/L; s+=cr[n+30]*Math.cos(a)-ci[n+30]*Math.sin(a);} return s;};
    F.clear().axes(); F.fn(per(k.f,-L,2*L),K.m,1.8,{jump:0.3}); F.fn(sum,'#b388ff',2.6,{jump:2});
    tex('#cxR',`${k.tx}. Check: \\(c_0=${fmt(cr[30],4)}\\), \\(c_1=${fmt(cr[31],4)}${ci[31]<0?'-':'+'}${fmt(Math.abs(ci[31]),4)}i\\). The spectrum is symmetric because \\(c_{-n}=\\overline{c_n}\\) for a real f.`);
  }
  S.onresize=F.onresize=draw; bind(['cxP','cxN'],draw);
})();

quiz('#q2',[
 {q:'For an odd function on (−π, π), which coefficients vanish?',o:['\\(b_n\\) only','\\(a_0\\) and \\(a_n\\)','all of them','none'],a:1,why:'odd × cos = odd, so it integrates to 0. Only the sine terms survive.'},
 {q:'The Fourier series of a function with a jump converges at the jump to',o:['the left value','the right value','the average of the two','0'],a:2,why:'That is the Dirichlet theorem: \\((f(x^-)+f(x^+))/2\\).'},
 {q:'A half-range <b>cosine</b> series uses',o:['an odd extension','an even extension','no extension','a periodic extension with period ℓ'],a:1,why:'Cosines are even, so you mirror f into (−ℓ, 0).'},
 {q:'For period 2ℓ, \\(a_n=\\)',o:['\\(\\frac1\\pi\\int f\\cos nx\\)','\\(\\frac1\\ell\\int_{-\\ell}^{\\ell}f\\cos\\frac{n\\pi x}{\\ell}dx\\)','\\(\\frac2\\ell\\int_{-\\ell}^{\\ell}f\\cos\\frac{n\\pi x}{\\ell}dx\\)','\\(\\frac1{2\\ell}\\int f\\cos nx\\)'],a:1,why:'Replace π with ℓ and nx with nπx/ℓ.'},
 {q:'Parseval relates \\(\\frac1\\ell\\int f^2\\) to',o:['\\(a_0+\\sum(a_n+b_n)\\)','\\(\\frac{a_0^2}2+\\sum(a_n^2+b_n^2)\\)','\\(a_0^2+\\sum a_nb_n\\)','\\(\\sum n^2(a_n^2+b_n^2)\\)'],a:1,why:'Each harmonic contributes its squared amplitude.'},
 {q:'In complex form \\(c_n=\\)',o:['\\(\\frac{a_n+ib_n}2\\)','\\(\\frac{a_n-ib_n}2\\)','\\(a_n-ib_n\\)','\\(\\frac{b_n-ia_n}{2}\\)'],a:1,why:'This follows from \\(\\cos=\\frac{e^{i}+e^{-i}}2\\) and \\(\\sin=\\frac{e^{i}-e^{-i}}{2i}\\).'},
]);
