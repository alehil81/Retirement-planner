(()=>{
const PLAN_KEY="retirement-planner-standalone-v1";
const DEFAULT_KEY="retirement-planner-personal-defaults-v2";
const GENERIC={
 currentAge:45,spouseAge:43,retirementAge:65,targetPortfolio:5000000,inflationPct:2.5,realReturnPct:5,
 vooBalance:500000,k401Balance:500000,voo1:50000,k1:30000,vooIncreasePct:0,kIncreasePct:0,changeAge:55,voo2:30000,k2:30000,
 high3:200000,divYield:1.3,expenses:150000,ordinaryTaxPct:20,dividendTaxPct:15,
 moonlightIncome:0,moonlightThroughAge:70,
 fixedPct:3.5,userClaim:70,spouseClaim:70,mode:"need",startDate:"2018-12-01"
};
const LIMITS={
 currentAge:[18,90],spouseAge:[18,100],retirementAge:[19,100],targetPortfolio:[0,1e11],inflationPct:[0,20],realReturnPct:[-10,20],
 vooBalance:[0,1e11],k401Balance:[0,1e11],voo1:[0,1e9],k1:[0,1e9],vooIncreasePct:[-100,50],kIncreasePct:[-100,50],changeAge:[18,100],
 voo2:[0,1e9],k2:[0,1e9],high3:[0,1e7],divYield:[0,15],expenses:[0,1e8],ordinaryTaxPct:[0,60],dividendTaxPct:[0,40],
 moonlightIncome:[0,1e8],moonlightThroughAge:[18,100],fixedPct:[0,20]
};
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const commas=n=>new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const compact=n=>Math.abs(n)>=1e9?"$"+(n/1e9).toFixed(1)+"B":Math.abs(n)>=1e6?"$"+(n/1e6).toFixed(1)+"M":Math.abs(n)>=1e3?"$"+Math.round(n/1e3)+"K":"$"+Math.round(n);
const parseNum=v=>{const n=Number(String(v).replaceAll(",","").trim());return Number.isFinite(n)?n:null};
let s=loadInitial(),chartMode="accumulation";

function loadInitial(){
 try{const old=localStorage.getItem(PLAN_KEY);if(old)return {...GENERIC,...JSON.parse(old)}}catch(e){}
 try{const d=localStorage.getItem(DEFAULT_KEY);if(d)return {...GENERIC,...JSON.parse(d)}}catch(e){}
 return {...GENERIC};
}
function savePlan(){try{localStorage.setItem(PLAN_KEY,JSON.stringify(s));$("saved").textContent="Saved locally"}catch(e){$("saved").textContent="Local save unavailable"}}
function showWarning(msg){const el=$("warning");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),4000)}
function showInput(el){const k=el.dataset.key;el.value=el.dataset.money?commas(s[k]):String(s[k])}
function valid(k,n){const l=LIMITS[k];return !l||(n>=l[0]&&n<=l[1])}

function bindInputs(){
 document.querySelectorAll("[data-key]").forEach(el=>{
  showInput(el);
  el.addEventListener("focus",()=>{el.dataset.prev=String(s[el.dataset.key]);el.value=String(s[el.dataset.key])});
  el.addEventListener("input",()=>{if(el.value.trim()==="")return;const n=parseNum(el.value);if(n!==null){s[el.dataset.key]=n;render()}});
  el.addEventListener("blur",()=>{
   const k=el.dataset.key,n=parseNum(el.value),prev=Number(el.dataset.prev);
   if(n===null||!valid(k,n)){s[k]=Number.isFinite(prev)?prev:GENERIC[k];showWarning("That value is outside the allowed range, so the previous value was restored.")}
   else{s[k]=n;savePlan()}
   showInput(el);render();
  });
  el.addEventListener("keydown",e=>{if(e.key==="Enter")el.blur()});
 });
}

bindInputs();
$("startDate").value=s.startDate;
$("startDate").addEventListener("change",e=>{s.startDate=e.target.value||GENERIC.startDate;savePlan();render()});
$("userSS").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.userClaim=+b.dataset.age;savePlan();render()});
$("spouseSS").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.spouseClaim=+b.dataset.age;savePlan();render()});
$("mode").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.mode=b.dataset.mode;savePlan();render()});
$("tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{chartMode=b.dataset.chart;$("tabs").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));draw()});

$("saveDefaults").onclick=()=>{try{localStorage.setItem(DEFAULT_KEY,JSON.stringify(s));savePlan();$("saved").textContent="Saved as your local defaults"}catch(e){showWarning("Could not save local defaults in this browser.")}};
$("reset").onclick=()=>{let base={...GENERIC};try{const d=localStorage.getItem(DEFAULT_KEY);if(d)base={...GENERIC,...JSON.parse(d)}}catch(e){}s=base;syncInputs();savePlan();render()};
$("clearLocal").onclick=()=>{if(!confirm("Clear the saved plan and your personal defaults from this browser?"))return;localStorage.removeItem(PLAN_KEY);localStorage.removeItem(DEFAULT_KEY);s={...GENERIC};syncInputs();render();$("saved").textContent="Local data cleared"};
$("exportPlan").onclick=()=>{const payload={app:"Retirement Planner",version:3,exportedAt:new Date().toISOString(),plan:s};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="retirement-plan.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("importPlan").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());const plan=obj.plan||obj;s={...GENERIC,...plan};syncInputs();savePlan();render();$("saved").textContent="Imported and saved locally"}catch(err){showWarning("Could not import that JSON plan file.")}e.target.value=""};

function syncInputs(){$("startDate").value=s.startDate;document.querySelectorAll("[data-key]").forEach(showInput)}
function contribAt(age,kind){
 const phase1=age<s.changeAge;
 const base=kind==="voo"?(phase1?s.voo1:s.voo2):(phase1?s.k1:s.k2);
 const inc=(kind==="voo"?s.vooIncreasePct:s.kIncreasePct)/100;
 const n=phase1?Math.max(0,Math.floor(age-s.currentAge)):Math.max(0,Math.floor(age-s.changeAge));
 return Math.max(0,base*Math.pow(1+inc,n));
}
function project(rate=s.realReturnPct){
 const years=Math.max(0,Math.round(s.retirementAge-s.currentAge));
 let v=s.vooBalance,k=s.k401Balance,a=s.currentAge,vc=0,kc=0;
 const rows=[{age:a,v,k,t:v+k,vcum:0,kcum:0}];
 for(let i=0;i<years;i++){
  const cv=contribAt(a,"voo"),ck=contribAt(a,"k");
  v=v*(1+rate/100)+cv;k=k*(1+rate/100)+ck;vc+=cv;kc+=ck;a++;
  rows.push({age:a,v,k,t:v+k,vcum:vc,kcum:kc});
 }
 return{years,v,k,t:v+k,rows,vc,kc,vg:v-s.vooBalance-vc,kg:k-s.k401Balance-kc};
}
function fers(){
 const start=new Date((s.startDate||GENERIC.startDate)+"T00:00:00Z"),now=new Date(),yrs=s.retirementAge-s.currentAge,end=new Date(now.getTime()+yrs*365.2425*86400000);
 const svc=Math.max(0,(end-start)/(365.2425*86400000)),m=s.retirementAge>=62&&svc>=20?.011:.01,annual=s.high3*svc*m;
 return{svc,m,annual};
}
const ssAnnual=a=>a===62?35628:62172;
function taxesFor(div,fersIncome,ss,moonlight,wd){
 const ord=s.ordinaryTaxPct/100,divTax=s.dividendTaxPct/100;
 return div*divTax+(fersIncome+moonlight+ss*.85+wd)*ord;
}
function retirement(p,f){
 const r=s.realReturnPct/100,start=Math.ceil(s.retirementAge);
 let voo=p.v,k=p.k;const rows=[];
 for(let age=start;age<=95;age++){
  const spa=s.spouseAge+(age-s.currentAge);
  const u=age>=s.userClaim?ssAnnual(s.userClaim):0;
  const sp=spa>=s.spouseClaim?ssAnnual(s.spouseClaim):0;
  const ss=u+sp;
  const moonlight=s.moonlightIncome>0&&age<=s.moonlightThroughAge?s.moonlightIncome:0;
  const div=voo*s.divYield/100;
  const taxesBase=taxesFor(div,f.annual,ss,moonlight,0);
  const afterTaxBase=div+f.annual+ss+moonlight-taxesBase;
  const ordNet=Math.max(.01,1-s.ordinaryTaxPct/100);
  let required=s.mode==="fixed"?k*s.fixedPct/100:Math.max(0,(s.expenses-afterTaxBase)/ordNet);
  const availableK=Math.max(0,k*(1+r));
  const wd=Math.min(required,availableK);
  const taxes=taxesFor(div,f.annual,ss,moonlight,wd);
  const gross=div+f.annual+ss+moonlight+wd;
  const afterTax=gross-taxes,surplus=afterTax-s.expenses;
  const endV=Math.max(0,voo*(1+r)-div),endK=Math.max(0,availableK-wd);
  rows.push({age,spa,vooStart:voo,kStart:k,div,fers:f.annual,u,sp,ss,moonlight,wd,gross,taxes,afterTax,expenses:s.expenses,surplus,baseAfterTax:afterTaxBase,endV,endK,endTotal:endV+endK,required});
  voo=endV;k=endK;
 }
 return{rows};
}
function groupStages(rows){
 const stages=[];
 for(const row of rows){
  const key=[row.u>0?1:0,row.sp>0?1:0,row.moonlight>0?1:0].join("-");
  const prev=stages.at(-1);
  if(!prev||prev.key!==key)stages.push({key,start:row.age,end:row.age,startRow:row,endRow:row});
  else{prev.end=row.age;prev.endRow=row}
 }
 return stages;
}
function stageTitle(row){
 const ssCount=(row.u>0?1:0)+(row.sp>0?1:0);
 let t=ssCount===0?"Retirement bridge · no Social Security":ssCount===2?"Both Social Security benefits active":row.u>0?"Your Social Security active":"Spouse Social Security active";
 if(row.moonlight>0)t+=" · moonlighting";
 return t;
}
function calc(){
 if(s.retirementAge<=s.currentAge)return null;
 const p=project(),f=fers(),ret=retirement(p,f),target=p.rows.find(x=>x.t>=s.targetPortfolio);
 const both=ret.rows.find(x=>x.u>0&&x.sp>0)||ret.rows.at(-1);
 const stages=groupStages(ret.rows);
 return{p,f,ret,target:target?target.age:null,both,stages};
}

function render(){
 const c=calc();if(!c){showWarning("Retirement age must be greater than your current age.");return}
 const p=c.p,f=c.f,b=c.both,age95=c.ret.rows.at(-1);
 $("combined").textContent=money(p.t);$("nominal").textContent=money(p.t*Math.pow(1+s.inflationPct/100,p.years))+" nominal equivalent";
 $("vooOut").textContent=money(p.v);$("vooSub").textContent="Growth "+money(p.vg)+" · contributions "+money(p.vc);
 $("kOut").textContent=money(p.k);$("kSub").textContent="Growth "+money(p.kg)+" · contributions "+money(p.kc);
 $("age95Out").textContent=money(age95.endTotal);$("age95Sub").textContent="VOO "+money(age95.endV)+" · 401(k) "+money(age95.endK);
 $("targetOut").textContent=c.target?"Age "+Math.round(c.target):"Not reached";
 $("service").textContent=f.svc.toFixed(1)+" years";$("fers").textContent=money(f.annual)+"/yr · "+money(f.annual/12)+"/mo";$("fersTop").textContent=money(f.annual/12)+"/mo";
 $("userSS").querySelectorAll("button").forEach(x=>x.classList.toggle("active",+x.dataset.age===s.userClaim));
 $("spouseSS").querySelectorAll("button").forEach(x=>x.classList.toggle("active",+x.dataset.age===s.spouseClaim));
 $("userBenefit").textContent=money(ssAnnual(s.userClaim)/12)+"/mo · "+money(ssAnnual(s.userClaim))+"/yr";
 $("spouseBenefit").textContent=money(ssAnnual(s.spouseClaim)/12)+"/mo · "+money(ssAnnual(s.spouseClaim))+"/yr";
 $("mode").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x.dataset.mode===s.mode));$("fixedWrap").style.display=s.mode==="fixed"?"block":"none";
 $("income").textContent=money(b.afterTax)+"/yr";$("incomeMo").textContent=money(b.afterTax/12)+"/mo after estimated tax";$("expenseOut").textContent=money(s.expenses)+"/yr";
 $("surplus").textContent=(b.surplus>=0?"+":"−")+money(Math.abs(b.surplus))+"/yr";$("surplus").className="metric-sm "+(b.surplus>=0?"green":"red");
 $("pre401").textContent=money(b.baseAfterTax)+"/yr";
 $("preDetail").textContent="After-tax VOO dividends + FERS + Social Security"+(b.moonlight>0?" + moonlighting":"")+", before 401(k)";
 const cov=s.expenses?b.baseAfterTax/s.expenses*100:100;$("coverage").style.width=Math.min(100,Math.max(0,cov))+"%";$("coverageText").textContent=cov.toFixed(1)+"% of after-tax expenses covered before 401(k)";
 $("withdrawal").textContent=money(b.wd)+"/yr";$("withdrawalSub").textContent=money(b.wd/12)+"/mo gross · "+(b.kStart?b.wd/b.kStart*100:0).toFixed(2)+"% of that year’s starting 401(k)";
 $("taxesOut").textContent=money(b.taxes)+"/yr";$("grossIncomeOut").textContent=money(b.gross)+"/yr gross income";
 const ages=[70,80,90,95];$("milestones").innerHTML=ages.map(a=>{const z=c.ret.rows.find(x=>x.age>=a)||c.ret.rows.at(-1);return `<div class="milestone"><div class="tiny">AGE ${a}</div><div class="metric-sm">${money(z.endTotal)}</div><div class="tiny">VOO ${compact(z.endV)} · 401(k) ${compact(z.endK)}</div></div>`}).join("");
 const stagesEl=$("incomeStages");
 if(stagesEl){stagesEl.innerHTML=c.stages.map(st=>{
   const r=st.startRow,range=st.start===st.end?`Age ${st.start}`:`Ages ${st.start}–${st.end}`;
   const spouseEnd=st.endRow.spa;
   const spouseRange=Math.abs(r.spa-spouseEnd)<.01?`spouse ${r.spa.toFixed(1)}`:`spouse ${r.spa.toFixed(1)}–${spouseEnd.toFixed(1)}`;
   return `<div class="stage"><div class="row"><div><div style="font-size:13px;font-weight:700">${stageTitle(r)}</div><div class="tiny">${range} · ${spouseRange}</div></div><div style="text-align:right"><div style="font-size:13px;font-weight:700">${money(r.afterTax)}/yr</div><div class="tiny">${money(r.afterTax/12)}/mo after tax</div></div></div><div class="tiny" style="margin-top:6px">VOO dividends ${money(r.div)} · FERS ${money(r.fers)} · Moonlighting ${money(r.moonlight)} · SS ${money(r.ss)} · 401(k) ${money(r.wd)}</div></div>`;
  }).join("")}
 draw(c);
}

function axes(max,min,maxx){
 const W=760,H=330,L=68,R=18,T=18,B=44,pw=W-L-R,ph=H-T-B,x=v=>L+(v-min)/Math.max(1,maxx-min)*pw,y=v=>T+ph-v/max*ph;let g="";
 for(let i=0;i<=4;i++){const v=max*i/4,yy=y(v);g+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="var(--border)"/><text x="${L-8}" y="${yy+4}" text-anchor="end" font-size="11" fill="var(--muted)">${compact(v)}</text>`}
 return{W,H,L,R,T,B,pw,ph,x,y,g};
}
function poly(d,a,key,color,width=2.5,dash=""){return `<polyline points="${d.map(x=>a.x(x.age)+","+a.y(x[key])).join(" ")}" fill="none" stroke="var(${color})" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:""}/>`}
function ticks(d,a){let h="";for(let i=0;i<=6;i++){const ag=d[0].age+(d.at(-1).age-d[0].age)*i/6;h+=`<text x="${a.x(ag)}" y="${a.H-14}" text-anchor="middle" font-size="11" fill="var(--muted)">${Math.round(ag)}</text>`}return h}
function draw(existing){
 const c=existing||calc();if(!c)return;
 if(chartMode==="accumulation"){
  const d=c.p.rows,max=Math.max(s.targetPortfolio,...d.map(x=>x.t),1)*1.08,a=axes(max,d[0].age,d.at(-1).age);let h=a.g+ticks(d,a);
  h+=poly(d,a,"t","--s2",4)+poly(d,a,"v","--s3",2.5)+poly(d,a,"k","--s4",2.5);
  const ty=a.y(s.targetPortfolio);h+=`<line x1="${a.L}" y1="${ty}" x2="${a.W-a.R}" y2="${ty}" stroke="var(--text)" stroke-dasharray="6 5" opacity=".7"/>`;
  $("chart").innerHTML=h;$("chartSub").textContent="Accumulation through retirement in today’s dollars.";
 }else if(chartMode==="decumulation"){
  const d=c.ret.rows,max=Math.max(...d.map(x=>x.endTotal),1)*1.08,a=axes(max,d[0].age,d.at(-1).age);let h=a.g+ticks(d,a);
  h+=poly(d,a,"endTotal","--s2",4)+poly(d,a,"endV","--s3",2.5)+poly(d,a,"endK","--s4",2.5);
  $("chart").innerHTML=h;$("chartSub").textContent="Year-end retirement balances after dividends and 401(k) withdrawals.";
 }else if(chartMode==="income"){
  const d=c.ret.rows,max=Math.max(s.expenses,...d.map(x=>x.afterTax),...d.map(x=>x.baseAfterTax),1)*1.1,a=axes(max,d[0].age,d.at(-1).age);let h=a.g+ticks(d,a);
  h+=poly(d,a,"afterTax","--s2",4)+poly(d,a,"baseAfterTax","--s3",2.5);
  const expRows=d.map(x=>({...x,expenseLine:s.expenses}));h+=poly(expRows,a,"expenseLine","--s5",2.5,"7 5");
  $("chart").innerHTML=h;$("chartSub").textContent="After-tax income, income before 401(k), and expenses by age; SS and moonlighting transitions are reflected automatically.";
 }else{
  const rates=[4,5,6,7,8],vals=rates.map(x=>project(x).t),max=Math.max(...vals,s.targetPortfolio,1)*1.1,a=axes(max,0,6);let h=a.g;
  rates.forEach((x,i)=>{const xx=a.L+34+i*124,yy=a.y(vals[i]),bh=a.T+a.ph-yy;h+=`<rect x="${xx}" y="${yy}" width="88" height="${bh}" rx="8" fill="var(--s${2+i%5})"/><text x="${xx+44}" y="${a.H-14}" text-anchor="middle" font-size="12" fill="var(--muted)">${x}%</text><text x="${xx+44}" y="${Math.max(14,yy-7)}" text-anchor="middle" font-size="11" fill="var(--text)">${compact(vals[i])}</text>`});
  $("chart").innerHTML=h;$("chartSub").textContent="Combined portfolio at retirement under 4%–8% real-return assumptions.";
 }
}

render();savePlan();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
})();
