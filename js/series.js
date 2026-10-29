/* Chapter 4 — series solution engines (exact fractions) */
const Q4={b:'#4cc9f0',o:'#ff7a59',y:'#ffd166',g:'#06d6a0',m:'#9aa6c7',p:'#ff5d8f'};

/* ---------- Fractions ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
class Fr{
  constructor(n,d=1){ if(d<0){n=-n;d=-d;} const g=gcd(n,d); this.n=n/g; this.d=d/g; }
  static of(x){ return x instanceof Fr? x : new Fr(x,1); }
  add(o){o=Fr.of(o); return new Fr(this.n*o.d+o.n*this.d,this.d*o.d);}
  sub(o){o=Fr.of(o); return new Fr(this.n*o.d-o.n*this.d,this.d*o.d);}
  mul(o){o=Fr.of(o); return new Fr(this.n*o.n,this.d*o.d);}
  div(o){o=Fr.of(o); return new Fr(this.n*o.d,this.d*o.n);}
  neg(){return new Fr(-this.n,this.d);}
  z(){return this.n===0;} v(){return this.n/this.d;} eq(o){o=Fr.of(o);return this.n===o.n&&this.d===o.d;}
  tex(){ return this.d===1? `${this.n}` : `${this.n<0?'-':''}\\frac{${Math.abs(this.n)}}{${this.d}}`; }
}
const F0=new Fr(0), F1=new Fr(1);
const ff=(x,d)=>{ let r=F1; for(let i=0;i<d;i++) r=r.mul(Fr.of(x).sub(i)); return r; };   // falling factorial
function sqrtFr(f){ const a=Math.round(Math.sqrt(f.n)), b=Math.round(Math.sqrt(f.d)); return (a*a===f.n&&b*b===f.d)? new Fr(a,b): null; }

/* tex helpers */
function polyTerm(c,pow,v='x',first=false){ // c Fr
  if(c.z()) return ''; const s=c.n<0?'-':(first?'':'+'); const a=new Fr(Math.abs(c.n),c.d);
  const coef=(a.eq(1)&&pow!==0)?'':a.tex(); const vv=pow===0?'':pow===1?v:`${v}^{${pow}}`; return `${s}${coef}${vv}`; }
function seriesTex(coefs,v='x',m=null,maxTerms=4){ // coefs Fr[] ; returns "1 - x^2/4 + ..."
  let out='', cnt=0; for(let n=0;n<coefs.length&&cnt<maxTerms;n++){ if(coefs[n].z())continue; out+=polyTerm(coefs[n],n,v,cnt===0); cnt++; }
  if(!out) out='0'; else out+='+\\cdots';
  if(m===null||m.z()) return out; return `${v}^{${m.tex()}}\\left(${out}\\right)`; }
/* ODE term list → tex: terms [c,p,d] meaning c·v^p·y^(d) */
function odeTex(terms,v='x'){ const byd={}; terms.forEach(([c,p,d])=>{(byd[d]=byd[d]||[]).push([c,p]);});
  const ys={2:"y''",1:"y'",0:'y'}; let s=''; [2,1,0].forEach(d=>{ if(!byd[d])return; const poly=byd[d].sort((a,b)=>b[1]-a[1]).map(([c,p],i)=>polyTerm(Fr.of(c),p,v,i===0)).join('');
    const single=byd[d].length===1; let part; if(single){ const [c,p]=byd[d][0]; const pt=polyTerm(Fr.of(c),p,v,true); part=(pt==='1'?'':pt==='-1'?'-':pt)+ys[d]; } else part=`(${poly})${ys[d]}`;
    s+= (s&&!part.startsWith('-')?'+':'')+part; }); return s+'=0'; }
const evalP=(terms,d,x)=>terms.filter(t=>t[2]===d).reduce((s,[c,p])=>s+c*Math.pow(x,p),0);

/* ============ 4.1 singular point detective ============ */
(function(){
  const E={
    ex42:{n:'Ex 4.2: x²(x−2)²y″ + 2(x−2)y′ + (x+3)y = 0',P0:x=>x*x*(x-2)**2,P1:x=>2*(x-2),P2:x=>x+3,pts:{0:'irr',2:'reg'},
      why:{0:'\\(p=\\frac{2(x-2)\\,x}{x^2(x-2)^2}=\\frac{2}{x(x-2)}\\). An \\(x\\) is left in the denominator, so p blows up: <b>irregular</b>.',2:'\\(p=\\frac{2(x-2)^2}{x^2(x-2)^2}=\\frac2{x^2}\\to\\frac12\\) and \\(q=\\frac{(x+3)(x-2)^2}{x^2(x-2)^2}\\to\\frac54\\). Both finite: <b>regular</b>.'}},
    tut1:{n:'Tutorial Q1: (2x−3)(x+1)²x³y″ + 2x²y′ + (x−5)y = 0',P0:x=>(2*x-3)*(x+1)**2*x**3,P1:x=>2*x*x,P2:x=>x-5,pts:{0:'irr','-1':'irr',1.5:'reg'},
      why:{0:'\\(p=\\frac{2x^2\\cdot x}{(2x-3)(x+1)^2x^3}=\\frac{2}{(2x-3)(x+1)^2}\\) is fine, but \\(q=\\frac{x^2(x-5)}{(2x-3)(x+1)^2x^3}\\) still has \\(\\frac1x\\): <b>irregular</b>.','-1':'\\(p=\\frac{2x^2(x+1)}{(2x-3)(x+1)^2x^3}=\\frac{2}{(2x-3)(x+1)x}\\) has \\(\\frac1{x+1}\\) left: <b>irregular</b>.',1.5:'A simple factor \\((2x-3)\\) cancels completely in both: <b>regular</b>. Every other point is ordinary.'}},
    n610:{n:'Notes: 9x(1−x)y″ − 12y′ + 4y = 0 (Ex 4.10)',P0:x=>9*x*(1-x),P1:x=>-12,P2:x=>4,pts:{0:'reg',1:'reg'},why:{0:'\\(p=\\frac{-12}{9(1-x)}\\to-\\frac43\\), \\(q=\\frac{4x}{9(1-x)}\\to0\\): <b>regular</b>.',1:'\\(p=\\frac{-12(x-1)}{9x(1-x)}=\\frac{12}{9x}\\to\\frac43\\), \\(q\\to0\\): <b>regular</b>.'}},
    e21:{n:'2021 exam: x(1−x)y″ + (3x−1)y′ + y = 0',P0:x=>x*(1-x),P1:x=>3*x-1,P2:x=>1,pts:{0:'reg',1:'reg'},why:{0:'\\(p=\\frac{3x-1}{1-x}\\to-1\\), \\(q=\\frac{x}{1-x}\\to0\\): <b>regular</b>, so use Frobenius.',1:'\\(p=-\\frac{3x-1}{x}\\to-2\\), \\(q\\to0\\): <b>regular</b>.'}},
    bes:{n:'Bessel: x²y″ + xy′ + (x² − ν²)y = 0 (ν = 1)',P0:x=>x*x,P1:x=>x,P2:x=>x*x-1,pts:{0:'reg'},why:{0:'\\(p=1\\), \\(q=x^2-\\nu^2\\): polynomials, so <b>regular</b>.'}},
    leg:{n:'Legendre: (1−x²)y″ − 2xy′ + 6y = 0',P0:x=>1-x*x,P1:x=>-2*x,P2:x=>6,pts:{1:'reg','-1':'reg'},why:{1:'\\(p=\\frac{-2x(x-1)}{(1-x)(1+x)}=\\frac{2x}{1+x}\\to1\\), \\(q\\to0\\): <b>regular</b>.','-1':'By symmetry, <b>regular</b>. And x = 0 is ordinary, so expand about 0.'}},
    e21b:{n:'2021 exam: (x+1)y″ − (x+1)²y = 0',P0:x=>x+1,P1:x=>0,P2:x=>-((x+1)**2),pts:{'-1':'ord'},why:{'-1':'\\(P_0(-1)=0\\), but dividing gives \\(y\'\'-(x+1)y=0\\). The singularity is removable, so x = −1 behaves like an <b>ordinary</b> point. Treat it as Airy\'s equation in \\(t=x+1\\).'}},
    t3a:{n:'Tutorial 3(a): (x+2)²y″ + (x+2)y′ − y = 0',P0:x=>(x+2)**2,P1:x=>x+2,P2:x=>-1,pts:{'-2':'reg'},why:{'-2':'\\(p=1\\), \\(q=-1\\): <b>regular</b>. It is Euler–Cauchy, so \\(y=c_1(x+2)+c_2(x+2)^{-1}\\).'}},
  };
  const P=new Plot('#sp',{xlabel:'x',ymin:-8,ymax:8});
  $('#spE').innerHTML=Object.keys(E).map(k=>`<option value="${k}">${E[k].n}</option>`).join('');
  function pts(){ const k=E[val('spE')]; $('#spA').innerHTML=Object.keys(k.pts).map(a=>`<option value="${a}">x = ${a}</option>`).join(''); }
  function draw(){ const k=E[val('spE')], a=+val('spA'); const p=x=>(x-a)*k.P1(x)/k.P0(x), q=x=>(x-a)**2*k.P2(x)/k.P0(x);
    P.view(a-1.5,a+1.5,-8,8); P.clear().axes(); P.vline(a,'rgba(255,209,102,.6)'); P.fn(p,Q4.b,2.6,{jump:0.5}); P.fn(q,Q4.o,2.6,{jump:0.5});
    const lab={irr:['IRREGULAR singular','no'],reg:['REGULAR singular','ok'],ord:['ORDINARY (removable)','ok']}[k.pts[a]];
    tex('#spR',`<span class="pill ${lab[1]}">${lab[0]}</span> &nbsp; ${k.why[val('spA')]} Look at the yellow line: a curve shooting off to ±∞ there means "not analytic".`); }
  P.onresize=draw; $('#spE').onchange=()=>{pts(); draw();}; $('#spA').onchange=draw; pts(); draw();
})();

/* ============ 4.2 ordinary point engine ============ */
const ORD={
  notes:{n:'Notes: y″ + xy′ + y = 0',t:[[1,0,2],[1,1,1],[1,0,0]],a:0},
  e431:{n:'Ex 4.3(1): y″ + xy = 0',t:[[1,0,2],[1,1,0]],a:0},
  e441:{n:'Ex 4.4(1): y″ − y = 0',t:[[1,0,2],[-1,0,0]],a:0},
  e442:{n:'Ex 4.4(2): y″ + x²y = 0',t:[[1,0,2],[1,2,0]],a:0},
  e443:{n:'Ex 4.4(3) / Tut 2(c): (1−x²)y″ − 2xy′ + 2y = 0',t:[[1,0,2],[-1,2,2],[-2,1,1],[2,0,0]],a:0},
  t2a:{n:'Tut 2(a): y″ − y′ + xy = 0',t:[[1,0,2],[-1,0,1],[1,1,0]],a:0},
  t2b:{n:'Tut 2(b): y″ − y′ + x²y = 0',t:[[1,0,2],[-1,0,1],[1,2,0]],a:0},
  t2d:{n:'Tut 2(d): y″ + (1+x²)y = 0',t:[[1,0,2],[1,0,0],[1,2,0]],a:0},
  t2e:{n:'Tut 2(e): y″ − 4xy′ + (4x²−2)y = 0',t:[[1,0,2],[-4,1,1],[4,2,0],[-2,0,0]],a:0},
  t2f:{n:'Tut 2(f): y″ + (x−1)y = 0',t:[[1,0,2],[1,1,0],[-1,0,0]],a:0},
  x21:{n:'2021 Q2b(ii): (x+1)y″ − (x+1)²y = 0 about x = −1',t:[[1,0,2],[-1,1,0]],a:-1,note:'Divide by \\((x+1)\\) and let \\(t=x+1\\): \\(y\'\'-ty=0\\) (Airy).'},
  x22:{n:'2022 Q2b(i): y″ − xy = 0 about x = −2',t:[[1,0,2],[-1,1,0],[2,0,0]],a:-2,note:'\\(t=x+2\\Rightarrow x=t-2\\), so \\(y\'\'-(t-2)y=y\'\'-ty+2y=0\\).'},
  x25:{n:'2025 Q4(a): xy″ + y = 0 about x = 1',t:[[1,0,2],[1,1,2],[1,0,0]],a:1,note:'\\(t=x-1\\Rightarrow x=t+1\\), so \\((t+1)y\'\'+y=0\\).'},
  b417:{n:'Ex 4.17(b): x²y″ + xy′ + (x²−1)y = 0 about x = 1',t:[[1,0,2],[2,1,2],[1,2,2],[1,0,1],[1,1,1],[2,1,0],[1,2,0]],a:1,note:'\\(t=x-1\\): \\((t+1)^2y\'\'+(t+1)y\'+(t^2+2t)y=0\\).'},
};
function ordSolve(T,N){ // returns a[n] = [coef of a0, coef of a1]
  const lead=T.filter(([c,p,d])=>d===2&&p===0).reduce((s,t)=>s+t[0],0); const a=[[F1,F0],[F0,F1]];
  for(let k=0;k<=N-2;k++){ let s=[F0,F0];
    T.forEach(([c,p,d])=>{ if(d===2&&p===0)return; const i=k+d-p; if(i<0)return; const w=Fr.of(c).mul(ff(i,d)); s=[s[0].add(w.mul(a[i][0])),s[1].add(w.mul(a[i][1]))]; });
    const den=Fr.of(lead).mul((k+2)*(k+1)); a[k+2]=[s[0].neg().div(den),s[1].neg().div(den)]; }
  return a; }
function lin2tex(pr){ const [u,w]=pr; let s=''; if(!u.z()) s+=polyTerm(u,0,'',true)+'a_0'; if(!w.z()) s+=(s?(w.n<0?'':'+'):'')+polyTerm(w,0,'',true)+'a_1'; s=s.replace(/^1a_/,'a_').replace(/([+-])1a_/g,'$1a_'); return s||'0'; }
(function(){
  $('#osE').innerHTML=Object.keys(ORD).map(k=>`<option value="${k}">${ORD[k].n}</option>`).join('');
  const P=new Plot('#osP',{xlabel:'x'}); let selCol=0;
  function table(){ const k=ORD[val('osE')], T=k.t, v=k.a?'t':'x', K=6; const a=ordSolve(T,K+2);
    const ys={2:"y''",1:"y'",0:'y'};
    let h=`<tr><th class="lab">term</th>`+[...Array(K).keys()].map(c=>`<th class="col" data-c="${c}">\\(${v}^{${c}}\\)</th>`).join('')+'</tr>';
    T.forEach(([c,p,d])=>{ const name=polyTerm(Fr.of(c),p,v,true); h+=`<tr><td class="lab">\\(${(name==='1'?'':name==='-1'?'-':name)}${ys[d]}\\)</td>`;
      for(let col=0;col<K;col++){ const i=col+d-p; let cell=''; if(i>=0){ const w=Fr.of(c).mul(ff(i,d)); cell=w.z()?'0':`${polyTerm(w,0,'',true)}a_{${i}}`.replace(/^1a/,'a').replace(/^-1a/,'-a'); } h+=`<td class="col" data-c="${col}">${cell?`\\(${cell}\\)`:'·'}</td>`; }
      h+='</tr>'; });
    h+=`<tr><td class="lab"><b>sum = 0</b></td>`+[...Array(K).keys()].map(c=>`<td class="col" data-c="${c}">\\(a_{${c+2}}=\\)<br>\\(${lin2tex(a[c+2])}\\)</td>`).join('')+'</tr>';
    $('#osTab').innerHTML=h; M($('#osTab'));
    $$('#osTab .col').forEach(e=>e.onclick=()=>{selCol=+e.dataset.c; hl();}); hl();
    tex('#osEq',`\\(${odeTex(T,v)}\\)`+(k.a?` &nbsp; with \\(t=x-(${k.a})\\). ${k.note||''}`:` &nbsp; \\(x=0\\) is ordinary because \\(P_0(0)\\neq0\\).`));
    const y1=a.map(r=>r[0]), y2=a.map(r=>r[1]);
    tex('#osSol',`\\(y=a_0\\Big[${seriesTex(y1,v,null,4)}\\Big]+a_1\\Big[${seriesTex(y2,v,null,4)}\\Big]\\)`);
  }
  function hl(){ const k=ORD[val('osE')], T=k.t, v=k.a?'t':'x'; $$('#osTab .col').forEach(e=>e.classList.toggle('hl',+e.dataset.c===selCol));
    const parts=T.map(([c,p,d])=>{ const i=selCol+d-p; if(i<0)return null; const w=Fr.of(c).mul(ff(i,d)); return w.z()?null:`${polyTerm(w,0,'',true)}a_{${i}}`.replace(/^1a/,'a').replace(/^-1a/,'-a'); }).filter(Boolean);
    tex('#osCol',`Column \\(${v}^{${selCol}}\\): \\(${parts.join('+').replace(/\+-/g,'-')}=0\\). Every power must vanish separately, so this single equation fixes \\(a_{${selCol+2}}\\). Click another column.`); }
  function plot(){ const k=ORD[val('osE')], T=k.t, N=val('osN'); const a=ordSolve(T,32); const sh=k.a;
    const S=(j,n)=>x=>{ const t=x-sh; let s=0,pw=1; for(let i=0;i<=n;i++){ s+=a[i][j].v()*pw; pw*=t; } return s; };
    P.view(sh-3,sh+3,-3,3);
    const F=(x,[y,yp])=>{ const P0=evalP(T,2,x-sh); return [yp, -(evalP(T,1,x-sh)*yp+evalP(T,0,x-sh)*y)/P0]; };
    P.clear().axes();
    [[1,0],[0,1]].forEach(([u,w])=>{ ['f','b'].forEach(dir=>{ let ok=true; const tab=rk4((x,Y)=>{ const r=F(x,Y); if(!isFinite(r[1])||Math.abs(Y[0])>50) ok=false; return ok?r:[0,0]; },sh,[u,w],dir==='f'?sh+3:sh-3,600);
      const c=P.ctx; c.save(); c.strokeStyle=themed('#c9d2ee'); c.lineWidth=6; c.globalAlpha=.45; c.beginPath(); let started=false; tab.forEach(([x,[y]])=>{ if(!isFinite(y)||Math.abs(y)>20){started=false;return;} started?c.lineTo(P.X(x),P.Y(y)):c.moveTo(P.X(x),P.Y(y)); started=true; }); c.stroke(); c.restore(); }); });
    P.fn(S(0,N),Q4.y,2.4); P.fn(S(1,N),Q4.g,2.4); P.vline(sh,'rgba(255,255,255,.25)'); }
  P.onresize=plot; $('#osE').onchange=()=>{selCol=0; table(); plot();}; bind(['osN'],plot); table();
})();

/* ============ 4.3 Frobenius engine ============ */
const FROB={
  e410:{n:'Ex 4.10: 9x(1−x)y″ − 12y′ + 4y = 0',t:[[9,1,2],[-9,2,2],[-12,0,1],[4,0,0]]},
  e411:{n:'Ex 4.11 / 2022 Q2b(ii) / 2025 Q4(b): xy″ + y′ + xy = 0',t:[[1,1,2],[1,0,1],[1,1,0]],log:'\\(y_2=J_0(x)\\ln x+\\frac{x^2}{4}-\\frac{3x^4}{128}+\\frac{11x^6}{13824}-\\cdots\\). Get it by substituting \\(y_2=y_1\\ln x+\\sum b_nx^n\\) and matching powers.'},
  e412:{n:'Ex 4.12: x²y″ + xy′ + (x²−4)y = 0',t:[[1,2,2],[1,1,1],[1,2,0],[-4,0,0]],log:'Bessel of order 2. \\(y_1\\propto J_2\\). The second solution \\(Y_2\\) contains \\(J_2\\ln x\\).'},
  e413:{n:'Ex 4.13: x(1−x)y″ − (1+3x)y′ − y = 0',t:[[1,1,2],[-1,2,2],[-1,0,1],[-3,1,1],[-1,0,0]],log:'Roots 0 and 2 with a nonzero coefficient \\(C\\). Use \\(y_2=Cy_1\\ln x+\\sum b_nx^n\\).'},
  e414:{n:'Ex 4.14: x²y″ + 4xy′ + (x²+2)y = 0',t:[[1,2,2],[4,1,1],[1,2,0],[2,0,0]]},
  x21:{n:'2021 Q2b(i): x(1−x)y″ + (3x−1)y′ + y = 0',t:[[1,1,2],[-1,2,2],[3,1,1],[-1,0,1],[1,0,0]],log:'\\(y_2=-2y_1\\ln x+\\left(1+x-\\frac{40}{9}x^3+\\cdots\\right)\\) (with \\(b_2=0\\) chosen). The paper only needs the first three non-zero terms.'},
  t3b:{n:'Tut 3(b): xy″ + 2y′ + xy = 0',t:[[1,1,2],[2,0,1],[1,1,0]]},
  t3c:{n:'Tut 3(c): xy″ + y = 0',t:[[1,1,2],[1,0,0]],log:'Roots 1 and 0. The \\(m=0\\) series breaks at \\(k=1\\), so \\(y_2\\) contains \\(Cy_1\\ln x\\).'},
  t3d:{n:'Tut 3(d): xy″ + (2x+1)y′ + (x+1)y = 0',t:[[1,1,2],[2,1,1],[1,0,1],[1,1,0],[1,0,0]],log:'Here \\(y_1=e^{-x}\\) and \\(y_2=e^{-x}\\ln x\\). Try substituting them.'},
  t3e:{n:'Tut 3(e): xy″ + 2x³y′ + (x²−2)y = 0',t:[[1,1,2],[2,3,1],[1,2,0],[-2,0,0]],log:'Roots 1 and 0. The series for \\(m=0\\) breaks, so a log term is needed.'},
  t3f:{n:'Tut 3(f): xy″ + y′ − xy = 0',t:[[1,1,2],[1,0,1],[-1,1,0]],log:'Modified Bessel \\(I_0\\). \\(y_2=I_0\\ln x-\\frac{x^2}4-\\cdots\\)'},
  t3g:{n:'Tut 3(g): 2x(x−1)y″ − (x+1)y′ + y = 0 (about 0)',t:[[2,2,2],[-2,1,2],[-1,1,1],[-1,0,1],[1,0,0]]},
  t3h:{n:'Tut 3(h): xy″ + 2y′ + 4xy = 0',t:[[1,1,2],[2,0,1],[4,1,0]]},
  t3i:{n:'Tut 3(i): xy″ + (2−2x)y′ + (x−2)y = 0',t:[[1,1,2],[2,0,1],[-2,1,1],[1,1,0],[-2,0,0]]},
};
function frobSetup(T){ const s=Math.min(...T.map(([c,p,d])=>p-d)); const E=T.map(([c,p,d])=>[c,p,d,p-d-s]);
  const I=m=>E.filter(t=>t[3]===0).reduce((acc,[c,p,d])=>acc.add(Fr.of(c).mul(ff(m,d))),F0);
  const I0=I(F0),I1=I(F1),I2=I(new Fr(2)); const al=I2.sub(I1.mul(2)).add(I0).div(2), be=I1.sub(I0).sub(al), ga=I0;
  return {E,s,I,al,be,ga}; }
function frobSeries(S,m,N){ const a=[F1]; let brk=null;
  for(let k=1;k<=N;k++){ const D=S.I(m.add(k)); let R=F0;
    S.E.forEach(([c,p,d,e])=>{ if(e===0||k-e<0)return; R=R.sub(Fr.of(c).mul(ff(m.add(k-e),d)).mul(a[k-e])); });
    if(D.z()){ if(R.z()){ a[k]=F0; brk=brk||{k,free:true}; } else { brk={k,free:false}; return {a,brk}; } } else a[k]=R.div(D); }
  return {a,brk}; }
function polyK(S,m,e){ // g_e(k)=Σ_{terms with e} c·ff(m+k-e,d) as quadratic in k
  const g=k=>S.E.filter(t=>t[3]===e).reduce((acc,[c,p,d])=>acc.add(Fr.of(c).mul(ff(m.add(k-e),d))),F0);
  const g0=g(0),g1=g(1),g2=g(2); const A=g2.sub(g1.mul(2)).add(g0).div(2), B=g1.sub(g0).sub(A); return [A,B,g0]; }
function quadTex(q,v='k'){ const s=polyTerm(q[0],2,v,true)+polyTerm(q[1],1,v,q[0].z())+polyTerm(q[2],0,v,q[0].z()&&q[1].z()); return s||'0'; }
(function(){
  $('#frE').innerHTML=Object.keys(FROB).map(k=>`<option value="${k}">${FROB[k].n}</option>`).join('');
  const P=new Plot('#frP',{xmin:0,xmax:4,ymin:-2,ymax:2,xlabel:'x'}); let cur=null;
  function run(){ const k=FROB[val('frE')], T=k.t, S=frobSetup(T);
    tex('#frEq',`\\(${odeTex(T)}\\)`);
    const P0=x=>evalP(T,2,x), P1=x=>evalP(T,1,x), P2=x=>evalP(T,0,x);
    const pl=x=>x*P1(x)/P0(x), ql=x=>x*x*P2(x)/P0(x);
    tex('#fr1',`\\(P_0(0)=0\\), so x = 0 is singular. \\(\\lim_{x\\to0}\\frac{xP_1}{P_0}=${fmt(pl(1e-7),3)}\\) and \\(\\lim_{x\\to0}\\frac{x^2P_2}{P_0}=${fmt(ql(1e-7),3)}\\). Both are finite, so x = 0 is a <b>regular singular point</b> and Frobenius applies.`);
    const disc=S.be.mul(S.be).sub(S.al.mul(S.ga).mul(4)); const sq=sqrtFr(disc);
    const r1=S.be.neg().add(sq).div(S.al.mul(2)), r2=S.be.neg().sub(sq).div(S.al.mul(2)); const [m1,m2]=r1.v()>=r2.v()?[r1,r2]:[r2,r1];
    const indTex=quadTex([S.al,S.be,S.ga],'m');
    tex('#fr2',`Lowest power \\(x^{m${S.s<0?S.s:'+'+S.s}}\\): \\(a_0\\,(${indTex})=0\\). Since \\(a_0\\ne0\\), the roots are \\(m_1=${m1.tex()},\\ m_2=${m2.tex()}\\), and \\(m_1-m_2=${m1.sub(m2).tex()}\\).`);
    const diff=m1.sub(m2); const cs=diff.z()?2:(diff.d===1?3:1); $$('#cases .box').forEach((b,i)=>b.classList.toggle('hl',i===cs-1));
    const pill=$('#frCase'); pill.textContent=['','Case 1 · distinct, non-integer gap','Case 2 · equal roots','Case 3 · integer gap'][cs]; pill.className='pill '+(cs===1?'ok':cs===2?'hyp':'par');
    const es=[...new Set(S.E.map(t=>t[3]))].filter(e=>e>0).sort();
    const rec=m=>{ const den=quadTex(polyK(S,m,0)); const num=es.map(e=>{ const q=polyK(S,m,e); const qt=quadTex(q); return qt==='0'?null:`(${qt})a_{k-${e}}`; }).filter(Boolean).join('+');
      return `a_k=-\\dfrac{${num||'0'}}{${den}}`; };
    tex('#fr3',`For \\(m=${m1.tex()}\\): \\(${rec(m1)}\\)`+(diff.z()?'':`<br>For \\(m=${m2.tex()}\\): \\(${rec(m2)}\\)`));
    const s1=frobSeries(S,m1,40), s2=diff.z()?null:frobSeries(S,m2,40);
    tex('#fr4',`\\(y_1=${seriesTex(s1.a,'x',m1,4)}\\)`);
    let y2t;
    if(diff.z()) y2t=`Equal roots, so a log term is guaranteed. ${k.log||''}`;
    else if(s2.brk&&!s2.brk.free) y2t=`With \\(m_2=${m2.tex()}\\), at \\(k=${s2.brk.k}\\) the recurrence becomes \\(0\\cdot a_{${s2.brk.k}}=\\text{nonzero}\\), which is impossible. So \\(C\\ne0\\) and \\(y_2=Cy_1\\ln x+x^{${m2.tex()}}\\sum b_nx^n\\). ${k.log||''}`;
    else if(s2.brk&&s2.brk.free) y2t=`At \\(k=${s2.brk.k}\\) the recurrence reads \\(0=0\\), so \\(a_{${s2.brk.k}}\\) is free and there is <b>no log</b> (\\(C=0\\)). \\(y_2=${seriesTex(s2.a,'x',m2,4)}\\). The free coefficient just adds a multiple of \\(y_1\\).`;
    else y2t=`\\(y_2=${seriesTex(s2.a,'x',m2,4)}\\). General solution: \\(y=c_1y_1+c_2y_2\\).`;
    tex('#fr5',y2t);
    cur={m1,m2,s1,s2:(s2&&(!s2.brk||s2.brk.free))?s2:null}; plot();
  }
  function plot(){ if(!cur)return; const N=val('frN'); const ev=(ser,m,n)=>x=>{ let s=0; for(let i=0;i<=n&&i<ser.a.length;i++) s+=ser.a[i].v()*Math.pow(x,i); return Math.pow(x,m.v())*s; };
    const T=FROB[val('frE')].t; let R=4; let prev=evalP(T,2,0.02); for(let x=0.03;x<=4;x+=0.01){ const v=evalP(T,2,x); if(v*prev<=0){ R=x; break; } prev=v; }
    const X=R<4?R*0.97:4; let ym=1.5; for(let i=1;i<=8;i++){ const v=Math.abs(ev(cur.s1,cur.m1,40)(X*i/8)); if(isFinite(v)) ym=Math.max(ym,Math.min(v*1.2,30)); if(cur.s2){const w=Math.abs(ev(cur.s2,cur.m2,40)(X*i/8)); if(isFinite(w)) ym=Math.max(ym,Math.min(w*1.2,30));} }
    P.view(0,X,-ym,ym); P.clear().axes(); if(R<4) P.text(`series converges for 0 < x < ${fmt(R,2)} (next singular point)`,X*0.03,ym*0.88,'#9aa6c7');
    P.fn(ev(cur.s1,cur.m1,40),Q4.m,5,{alpha:.35,a:0.01}); P.fn(ev(cur.s1,cur.m1,N),Q4.y,2.4,{a:0.01});
    if(cur.s2){ P.fn(ev(cur.s2,cur.m2,40),Q4.m,5,{alpha:.35,a:0.01}); P.fn(ev(cur.s2,cur.m2,N),Q4.g,2.4,{a:0.01}); } }
  P.onresize=plot; $('#frE').onchange=run; bind(['frN'],plot); run();
})();

/* ============ 4.4 Bessel ============ */
const J=(n,x,R=40)=>{ let s=0; for(let r=0;r<R;r++) s+=(-1)**r/(fact(r)*fact(n+r))*Math.pow(x/2,2*r+n); return s; };
(function(){
  const P=new Plot('#bs',{xmin:0,xmax:20,ymin:-0.6,ymax:1.1,xlabel:'x'}); const cols=['#4cc9f0','#ff7a59','#ffd166','#06d6a0','#b388ff'];
  function draw(){ const n=val('bsn'), R=val('bsR'); P.clear().axes();
    if($('#bsAll').checked){ for(let k=0;k<5;k++){ P.fn(x=>J(k,x,60),cols[k],2.2); P.text('J'+k,[2.4,3.8,5.1,6.4,7.6][k],J(k,[2.4,3.8,5.1,6.4,7.6][k]-1.2,60)+0.08,cols[k]); } tex('#bsRd','Every \\(J_n\\) with \\(n\\ge1\\) starts at 0. Only \\(J_0(0)=1\\). They oscillate like decaying cosines with amplitude roughly \\(\\sqrt{2/\\pi x}\\).'); return; }
    P.fn(x=>J(n,x,60),Q4.b,3); P.fn(x=>J(n,x,R),Q4.y,2,{dash:[6,4]});
    const z=[]; let prev=J(n,0.01,60); for(let x=0.05;x<20;x+=0.01){ const v=J(n,x,60); if(v*prev<0&&x>0.2) z.push(x); prev=v; } z.forEach(x=>P.dot(x,0,Q4.p,5));
    const terms=[]; for(let r=0;r<3;r++){ const c=new Fr((-1)**r,fact(r)*fact(n+r)*2**(2*r+n)); terms.push(polyTerm(c,2*r+n,'x',r===0)); }
    tex('#bsRd',`\\(J_{${n}}(x)=${terms.join('')}+\\cdots\\). With R = ${R} terms, the partial sum follows the curve until about x ≈ ${fmt(Math.min(20,1.6*R+n/2),1)}. First zeros: ${z.slice(0,3).map(v=>v.toFixed(3)).join(', ')}.`);
  }
  P.onresize=draw; bind(['bsn','bsR'],draw); $('#bsAll').onchange=draw;
})();

/* ============ 4.5 Legendre ============ */
(function(){
  const A=new Plot('#lgA',{xmin:-1.1,xmax:1.1,ymin:-1.3,ymax:1.3,xlabel:'x'}), B=new Plot('#lgB',{xmin:-1.1,xmax:1.1,ymin:-1.3,ymax:1.3,xlabel:'x'});
  const Pn=(n,x)=>{ if(n===0)return 1; let p0=1,p1=x; for(let k=1;k<n;k++){ const p2=((2*k+1)*x*p1-k*p0)/(k+1); p0=p1; p1=p2; } return p1; };
  // polynomial (x^2-1)^n coefficients, then derivatives
  const binom=(n,k)=>fact(n)/(fact(k)*fact(n-k));
  function rodr(n,k){ let c=Array(2*n+1).fill(0); for(let j=0;j<=n;j++) c[2*j]=binom(n,j)*(-1)**(n-j);
    for(let i=0;i<k;i++){ c=c.slice(1).map((v,p)=>v*(p+1)); } return c; }
  const pev=(c,x)=>c.reduce((s,v,p)=>s+v*Math.pow(x,p),0);
  function draw(){ const n=val('lgn'), m=val('lgm'); let k=val('lgk'); if(k>n){k=n; $('#lgk').value=n; $('#lgk').parentElement.querySelector('output').textContent=n;}
    A.clear().axes(); for(let j=0;j<=7;j++) if(j!==n) A.fn(x=>Pn(j,x),'rgba(76,201,240,.15)',1.2); A.fn(x=>Pn(n,x),Q4.b,3); A.dot(1,1,Q4.y,5); A.text('Pₙ(1) = 1',0.55,1.15,Q4.y);
    const c=rodr(n,k); const sc=fact(n)*2**n; const ym=Math.max(1e-9,...[...Array(101).keys()].map(i=>Math.abs(pev(c,-1+i/50))))*1.15;
    B.view(-1.1,1.1,-ym,ym); B.clear().axes(); B.fn(x=>pev(c,x),Q4.m,2.6);
    if(k===n) B.fn(x=>Pn(n,x)*sc,Q4.b,1.6,{dash:[5,4]});
    const I=simpson(x=>Pn(n,x)*Pn(m,x),-1,1,800);
    tex('#lgR',`Right: \\(\\frac{d^{${k}}}{dx^{${k}}}(x^2-1)^{${n}}\\)`+(k===n?` equals \\(2^{${n}}${n}!\\,P_{${n}}(x)=${sc}\\,P_{${n}}(x)\\) ✔ (dashed).`:` (keep differentiating until k = n).`)+` Orthogonality: \\(\\int_{-1}^1P_{${n}}P_{${m}}dx=${fmt(I,4)}\\)`+(n===m?` \\(=\\frac{2}{2n+1}\\).`:'.'));
  }
  A.onresize=B.onresize=draw; bind(['lgn','lgk','lgm'],draw);
})();

quiz('#q4',[
 {q:'For \\(x^2(x-2)^2y\'\'+2(x-2)y\'+(x+3)y=0\\), x = 0 is',o:['ordinary','regular singular','irregular singular','not a point of the domain'],a:2,why:'\\(xP_1/P_0=2/(x(x-2))\\) still has x in the denominator.'},
 {q:'If the indicial roots are 0 and 7/3, the solutions are',o:['two Frobenius series','one series plus a log solution','polynomials','not defined'],a:0,why:'7/3 is not an integer, so this is Case 1.'},
 {q:'For \\(xy\'\'+y\'+xy=0\\) the indicial equation is',o:['\\(m^2=0\\)','\\(m^2-1=0\\)','\\(m(m-1)=0\\)','\\(m^2+m=0\\)'],a:0,why:'\\(m(m-1)+m=m^2\\), so there is a double root and a log appears.'},
 {q:'Writing \\(y\'=\\sum_{n\\ge1}na_nx^{n-1}\\) as a sum from \\(n=0\\) gives',o:['\\(\\sum na_nx^n\\)','\\(\\sum(n+1)a_{n+1}x^n\\)','\\(\\sum(n-1)a_{n-1}x^n\\)','\\(\\sum a_{n+1}x^{n+1}\\)'],a:1,why:'Replace n by n + 1.'},
 {q:'\\(P_2(x)=\\)',o:['\\(x^2\\)','\\(\\frac12(3x^2-1)\\)','\\(\\frac12(5x^3-3x)\\)','\\(3x^2-1\\)'],a:1,why:'Rodrigues: \\(\\frac18\\frac{d^2}{dx^2}(x^2-1)^2\\).'},
 {q:'"Solve about x = −2" for an ordinary point: first',o:['use Frobenius','substitute t = x + 2','set x = −2 in the coefficients and drop them','divide by x + 2'],a:1,why:'Expand around the point, so the series is in powers of (x + 2).'},
]);
