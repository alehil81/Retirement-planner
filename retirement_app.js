(()=>{
const PLAN_KEY="retirement-planner-standalone-v1";
const DEFAULT_KEY="retirement-planner-personal-defaults-v2";
const GENERIC={
 currentAge:45,birthYear:1981,spouseAge:43,retirementAge:65,targetPortfolio:5000000,inflationPct:2.5,realReturnPct:5,
 vooBalance:500000,k401Balance:500000,rothBalance:0,rothContribution:0,roth2:0,roth3:0,voo1:50000,k1:30000,vooIncreasePct:0,kIncreasePct:0,rothIncreasePct:2.5,changeAge:50,voo2:30000,k2:30000,changeAge3:60,voo3:30000,k3:30000,
 high3:200000,fersFullSurvivor:false,divYield:1.3,useVooDividends:true,vooDividendUsePct:100,expenses:150000,stepDownSpending:false,expenses80:300000,expenses90:275000,ordinaryTaxPct:20,dividendTaxPct:15,vooSaleTaxPct:10,
 moonlightIncome:0,moonlightThroughAge:70,
 fixedPct:3.5,userClaim:70,spouseClaim:70,userFraMonthly:4152,spouseFraMonthly:4152,mode:"need",monteCarlo:false,startDate:"2018-12-01"
};
const LIMITS={
 currentAge:[18,90],birthYear:[1900,2100],spouseAge:[18,100],retirementAge:[19,95],targetPortfolio:[0,1e11],inflationPct:[0,20],realReturnPct:[-10,20],
 vooBalance:[0,1e11],k401Balance:[0,1e11],rothBalance:[0,1e11],rothContribution:[0,1e9],roth2:[0,1e9],roth3:[0,1e9],voo1:[0,1e9],k1:[0,1e9],vooIncreasePct:[-100,50],kIncreasePct:[-100,50],rothIncreasePct:[-100,50],changeAge:[18,100],
 voo2:[0,1e9],k2:[0,1e9],changeAge3:[18,100],voo3:[0,1e9],k3:[0,1e9],high3:[0,1e7],divYield:[0,15],vooDividendUsePct:[0,100],expenses:[0,1e8],expenses80:[0,1e8],expenses90:[0,1e8],ordinaryTaxPct:[0,60],dividendTaxPct:[0,40],vooSaleTaxPct:[0,40],
 moonlightIncome:[0,1e8],moonlightThroughAge:[18,100],fixedPct:[0,20],userFraMonthly:[0,50000],spouseFraMonthly:[0,50000]
};
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const commas=n=>new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const compact=n=>Math.abs(n)>=1e9?"$"+(n/1e9).toFixed(1)+"B":Math.abs(n)>=1e6?"$"+(n/1e6).toFixed(1)+"M":Math.abs(n)>=1e3?"$"+Math.round(n/1e3)+"K":"$"+Math.round(n);
const parseNum=v=>{const n=Number(String(v).replaceAll(",","").trim());return Number.isFinite(n)?n:null};
let s=loadInitial(),chartMode="accumulation";

function migratePlan(raw){
 const p={...GENERIC,...(raw||{})};
 p.retirementAge=Math.min(95,Math.max(19,Number(p.retirementAge)||GENERIC.retirementAge));
 if(raw&&raw.birthYear==null){
  p.birthYear=new Date().getFullYear()-Math.floor(Number(p.currentAge)||GENERIC.currentAge);
 }

 // Preserve the old single Roth contribution as all three phase amounts
 // unless the newer phase-specific values already exist.
 if(raw){
  if(raw.roth2==null)p.roth2=Math.max(0,Number(raw.rothContribution??p.rothContribution)||0);
  if(raw.roth3==null)p.roth3=Math.max(0,Number(raw.rothContribution??p.rothContribution)||0);
  if(raw.rothIncreasePct==null)p.rothIncreasePct=Number(raw.inflationPct??p.inflationPct)||0;

  // New Phase 3 defaults to age 60. For an older saved 2-phase plan,
  // derive the new Phase 3 VOO/401(k) base from what the old schedule
  // would have contributed at age 60. This keeps old projections nearly
  // unchanged until the user edits the new Phase 3 values.
  if(raw.changeAge3==null)p.changeAge3=60;

  const oldPhase2Age=Number(raw.changeAge??p.changeAge);
  const phase3Age=Number(p.changeAge3);
  const inflation=Number(raw.inflationPct??p.inflationPct)/100;

  const derive=(base,nominalPct)=>{
   const b=Math.max(0,Number(base)||0);
   const nominal=Number(nominalPct||0)/100;
   const realInc=(1+nominal)/(1+inflation)-1;
   const n=Math.max(0,Math.floor(phase3Age-oldPhase2Age));
   return Math.max(0,b*Math.pow(1+realInc,n));
  };

  if(raw.voo3==null)p.voo3=derive(raw.voo2??p.voo2,raw.vooIncreasePct??p.vooIncreasePct);
  if(raw.k3==null)p.k3=derive(raw.k2??p.k2,raw.kIncreasePct??p.kIncreasePct);
 }
 return p;
}
function loadInitial(){
 try{const old=localStorage.getItem(PLAN_KEY);if(old)return migratePlan(JSON.parse(old))}catch(e){}
 try{const d=localStorage.getItem(DEFAULT_KEY);if(d)return migratePlan(JSON.parse(d))}catch(e){}
 return migratePlan(null);
}
function savePlan(){try{localStorage.setItem(PLAN_KEY,JSON.stringify(s));$("saved").textContent="Saved locally"}catch(e){$("saved").textContent="Local save unavailable"}}
function showWarning(msg){const el=$("warning");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),4000)}
function showInput(el){const k=el.dataset.key;el.value=el.dataset.money?commas(s[k]):String(s[k])}
function valid(k,n){
 const l=LIMITS[k];
 if(l&&!(n>=l[0]&&n<=l[1]))return false;
 if((k==="changeAge"||k==="changeAge3")&&!Number.isInteger(n))return false;
 if(k==="birthYear"&&(!Number.isInteger(n)||n>new Date().getFullYear()))return false;
 if(k==="changeAge"&&Number.isFinite(s.changeAge3)&&n>=s.changeAge3)return false;
 if(k==="changeAge3"&&Number.isFinite(s.changeAge)&&n<=s.changeAge)return false;
 return true;
}

function bindInputs(){
 document.querySelectorAll("[data-key]").forEach(el=>{
  showInput(el);
  el.addEventListener("focus",()=>{el.dataset.prev=String(s[el.dataset.key]);el.value=String(s[el.dataset.key])});
  el.addEventListener("input",()=>{if(el.value.trim()==="")return;const n=parseNum(el.value);if(n!==null){s[el.dataset.key]=n;render()}});
  el.addEventListener("blur",()=>{
   const k=el.dataset.key,n=parseNum(el.value),prev=Number(el.dataset.prev);
   if(n===null||!valid(k,n)){
    s[k]=Number.isFinite(prev)?prev:GENERIC[k];
    if(k==="changeAge"||k==="changeAge3")showWarning("Phase start ages must be whole numbers, and Phase 3 must start after Phase 2. The previous value was restored.");
    else if(k==="retirementAge"&&n!==null&&n>95)showWarning("Retirement age must be 95 or younger because projections currently run through age 95.");
    else if(k==="birthYear")showWarning("Birth year must be a valid whole year no later than the current year. The previous value was restored.");
    else showWarning("That value is outside the allowed range, so the previous value was restored.");
   }
   else{s[k]=n;savePlan()}
   showInput(el);render();
  });
  el.addEventListener("keydown",e=>{if(e.key==="Enter")el.blur()});
 });
}

function syncDividendControls(){
 const mode=$("divUseMode");
 if(!mode)return;
 mode.querySelectorAll("button").forEach(b=>b.classList.toggle("active",(b.dataset.divUse==="on")===!!s.useVooDividends));
 const pctInput=document.querySelector('[data-key="vooDividendUsePct"]');
 if(pctInput)pctInput.disabled=!s.useVooDividends;
 const field=$("divPctField");
 if(field)field.style.opacity=s.useVooDividends?"1":".5";
}

bindInputs();
$("startDate").value=s.startDate;
$("startDate").addEventListener("change",e=>{s.startDate=e.target.value||GENERIC.startDate;savePlan();render()});
function setSSClaim(who,age){
 age=Math.round(Number(age));
 if(!Number.isFinite(age)||age<62||age>70){showWarning("Social Security claim age must be a whole number from 62 through 70.");return false}
 if(who==="user")s.userClaim=age;else s.spouseClaim=age;
 savePlan();render();return true;
}
$("userSS").querySelectorAll("button").forEach(b=>b.onclick=()=>setSSClaim("user",+b.dataset.age));
$("spouseSS").querySelectorAll("button").forEach(b=>b.onclick=()=>setSSClaim("spouse",+b.dataset.age));
function bindSSCustom(id,who){
 const el=$(id);
 el.addEventListener("focus",()=>{const a=who==="user"?s.userClaim:s.spouseClaim;el.value=(a===62||a===70)?"":String(a)});
 el.addEventListener("input",()=>{const t=el.value.trim();if(t==="")return;const n=Number(t);if(Number.isInteger(n)&&n>=62&&n<=70){if(who==="user")s.userClaim=n;else s.spouseClaim=n;render()}});
 el.addEventListener("blur",()=>{const t=el.value.trim();if(t===""){render();return}const n=Number(t);if(!Number.isInteger(n)||n<62||n>70){showWarning("Social Security claim age must be a whole number from 62 through 70.");render();return}if(who==="user")s.userClaim=n;else s.spouseClaim=n;savePlan();render()});
 el.addEventListener("keydown",e=>{if(e.key==="Enter")el.blur()});
}
bindSSCustom("userClaimCustom","user");
bindSSCustom("spouseClaimCustom","spouse");
$("resetSSBenchmark").onclick=()=>{s.userFraMonthly=4152;s.spouseFraMonthly=4152;syncInputs();savePlan();render()};
$("mode").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.mode=b.dataset.mode;savePlan();render()});
$("fersSurvivor").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.fersFullSurvivor=b.dataset.fersSurvivor==="on";savePlan();render()});
$("divUseMode").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.useVooDividends=b.dataset.divUse==="on";savePlan();syncDividendControls();render()});
$("tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{chartMode=b.dataset.chart;$("tabs").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));draw()});

$("saveDefaults").onclick=()=>{try{localStorage.setItem(DEFAULT_KEY,JSON.stringify(s));savePlan();$("saved").textContent="Saved as your local defaults"}catch(e){showWarning("Could not save local defaults in this browser.")}};
$("printPlan").onclick=()=>window.print();
const SPENDING_PRESETS={
 luxury:{expenses:400000,expenses80:350000,expenses90:250000},
 controlled:{expenses:300000,expenses80:250000,expenses90:200000},
 fallback:{expenses:225000,expenses80:200000,expenses90:175000}
};
const SCENARIOS={
 base:{realReturnPct:4.5,inflationPct:2.5},
 conservative:{realReturnPct:4.0,inflationPct:3.0},
 stress:{realReturnPct:3.0,inflationPct:3.5},
 strong:{realReturnPct:5.5,inflationPct:2.5}
};
$("scenarioPresets").querySelectorAll("button").forEach(b=>b.onclick=()=>{
 const p=SCENARIOS[b.dataset.scenario];s.realReturnPct=p.realReturnPct;s.inflationPct=p.inflationPct;syncInputs();savePlan();render();
});
$("spendingPresets").querySelectorAll("button").forEach(b=>b.onclick=()=>{
 const p=SPENDING_PRESETS[b.dataset.spendingPreset];
 s.expenses=p.expenses;s.expenses80=p.expenses80;s.expenses90=p.expenses90;s.stepDownSpending=true;
 syncInputs();savePlan();render();
});
$("stepDownSpending").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.stepDownSpending=b.dataset.stepdown==="on";savePlan();render()});
$("monteCarloMode").querySelectorAll("button").forEach(b=>b.onclick=()=>{s.monteCarlo=b.dataset.mc==="on";savePlan();render()});
$("reset").onclick=()=>{let base={...GENERIC};try{const d=localStorage.getItem(DEFAULT_KEY);if(d)base=migratePlan(JSON.parse(d))}catch(e){}s=base;syncInputs();syncDividendControls();savePlan();render()};
$("clearLocal").onclick=()=>{if(!confirm("Clear the saved plan and your personal defaults from this browser?"))return;localStorage.removeItem(PLAN_KEY);localStorage.removeItem(DEFAULT_KEY);s={...GENERIC};syncInputs();syncDividendControls();render();$("saved").textContent="Local data cleared"};
$("exportPlan").onclick=()=>{const payload={app:"Retirement Planner",version:31,exportedAt:new Date().toISOString(),plan:s};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="retirement-plan.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("importPlan").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());const plan=obj.plan||obj;s=migratePlan(plan);syncInputs();syncDividendControls();savePlan();render();$("saved").textContent="Imported and saved locally"}catch(err){showWarning("Could not import that JSON plan file.")}e.target.value=""};

function syncInputs(){$("startDate").value=s.startDate;document.querySelectorAll("[data-key]").forEach(showInput)}
function realContributionIncrease(nominalPct){
 const nominal=nominalPct/100,inflation=s.inflationPct/100;
 return (1+nominal)/(1+inflation)-1;
}
function contribAt(age,kind){
 let phase,startAge,base;
 if(age<s.changeAge){phase=1;startAge=s.currentAge}
 else if(age<s.changeAge3){phase=2;startAge=s.changeAge}
 else{phase=3;startAge=s.changeAge3}

 if(kind==="voo")base=phase===1?s.voo1:phase===2?s.voo2:s.voo3;
 else if(kind==="k")base=phase===1?s.k1:phase===2?s.k2:s.k3;
 else base=phase===1?s.rothContribution:phase===2?s.roth2:s.roth3;

 const nominalPct=kind==="voo"?s.vooIncreasePct:kind==="k"?s.kIncreasePct:s.rothIncreasePct;
 const inc=realContributionIncrease(nominalPct);
 const n=Math.max(0,Math.floor(age-startAge));
 return Math.max(0,base*Math.pow(1+inc,n));
}
function project(rate=s.realReturnPct){
 const years=Math.max(0,Math.round(s.retirementAge-s.currentAge));
 let v=s.vooBalance,k=s.k401Balance,roth=s.rothBalance,a=s.currentAge,vc=0,kc=0,rc=0;
 const rows=[{age:a,v,k,roth,t:v+k+roth,vcum:0,kcum:0,rcum:0}];
 for(let i=0;i<years;i++){
  const cv=contribAt(a,"voo"),ck=contribAt(a,"k"),cr=contribAt(a,"roth");
  v=v*(1+rate/100)+cv;k=k*(1+rate/100)+ck;roth=roth*(1+rate/100)+cr;vc+=cv;kc+=ck;rc+=cr;a++;
  rows.push({age:a,v,k,roth,t:v+k+roth,vcum:vc,kcum:kc,rcum:rc});
 }
 return{years,v,k,roth,t:v+k+roth,rows,vc,kc,rc,vg:v-s.vooBalance-vc,kg:k-s.k401Balance-kc,rg:roth-s.rothBalance-rc};
}
function fers(){
 const start=new Date((s.startDate||GENERIC.startDate)+"T00:00:00Z"),now=new Date(),yrs=s.retirementAge-s.currentAge,end=new Date(now.getTime()+yrs*365.2425*86400000);
 const svc=Math.max(0,(end-start)/(365.2425*86400000)),m=s.retirementAge>=62&&svc>=20?.011:.01,unreducedAnnual=s.high3*svc*m;
 const survivorReduction=s.fersFullSurvivor?.10:0,annual=unreducedAnnual*(1-survivorReduction),survivorAnnual=unreducedAnnual*.50;
 return{svc,m,unreducedAnnual,survivorReduction,survivorAnnual,annual};
}
function ssFactor(a){
 a=Math.max(62,Math.min(70,Math.round(Number(a)||62)));
 if(a<67){
  const monthsEarly=(67-a)*12;
  const first=Math.min(36,monthsEarly),extra=Math.max(0,monthsEarly-36);
  return 1-first*(5/9)/100-extra*(5/12)/100;
 }
 if(a>67)return 1+(a-67)*.08;
 return 1;
}
function ssMonthly(a,fraMonthly){
 const fra=Math.max(0,Number(fraMonthly)||0);
 return Math.floor(fra*ssFactor(a));
}
const ssAnnual=(a,fraMonthly)=>ssMonthly(a,fraMonthly)*12;

const RMD_DIVISORS={
 70:29.2,71:28.3,72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,81:19.4,82:18.5,83:17.7,84:16.8,
 85:16.0,86:15.2,87:14.4,88:13.7,89:12.9,90:12.2,91:11.5,92:10.8,93:10.1,94:9.5,95:8.9
};
function rmdStartAgeForBirthYear(y){
 y=Math.round(Number(y)||GENERIC.birthYear);
 if(y>=1960)return 75;
 if(y>=1951)return 73;
 if(y>=1949)return 72;
 return 70.5;
}
function rmdStartAge(){return rmdStartAgeForBirthYear(s.birthYear)}
function formatRmdAge(a){return a===70.5?"70½":String(a)}
function rmdForAge(age,priorYearEnd401k){
 if(age<Math.ceil(rmdStartAge()))return 0;
 const divisor=RMD_DIVISORS[Math.round(age)];
 return divisor?Math.max(0,priorYearEnd401k)/divisor:0;
}
function taxesFor(totalDiv,fersIncome,ss,moonlight,wd){
 const ord=s.ordinaryTaxPct/100,divTax=s.dividendTaxPct/100;
 return totalDiv*divTax+(fersIncome+moonlight+ss*.85+wd)*ord;
}
function spendingForAge(age){
 if(!s.stepDownSpending)return s.expenses;
 if(age>=90)return s.expenses90;
 if(age>=80)return s.expenses80;
 return s.expenses;
}
function projectWithReturns(returns){
 const years=Math.max(0,Math.round(s.retirementAge-s.currentAge));
 let v=s.vooBalance,k=s.k401Balance,roth=s.rothBalance,a=s.currentAge,vc=0,kc=0,rc=0;
 const rows=[{age:a,v,k,roth,t:v+k+roth,vcum:0,kcum:0,rcum:0}];
 for(let i=0;i<years;i++){
  const r=returns[i]??s.realReturnPct/100;
  const cv=contribAt(a,"voo"),ck=contribAt(a,"k"),cr=contribAt(a,"roth");
  v=Math.max(0,v*(1+r)+cv);k=Math.max(0,k*(1+r)+ck);roth=Math.max(0,roth*(1+r)+cr);vc+=cv;kc+=ck;rc+=cr;a++;
  rows.push({age:a,v,k,roth,t:v+k+roth,vcum:vc,kcum:kc,rcum:rc});
 }
 return{years,v,k,roth,t:v+k+roth,rows,vc,kc,rc,vg:v-s.vooBalance-vc,kg:k-s.k401Balance-kc,rg:roth-s.rothBalance-rc};
}
function retirementWithReturns(p,f,returns){
 const start=Math.ceil(s.retirementAge);
 let voo=p.v,k=p.k,roth=p.roth;const rows=[];
 for(let age=start,i=0;age<=95;age++,i++){
  const r=returns?.[i]??s.realReturnPct/100;
  const expenseTarget=spendingForAge(age);
  const spa=s.spouseAge+(age-s.currentAge);
  const u=age>=s.userClaim?ssAnnual(s.userClaim,s.userFraMonthly):0;
  const sp=spa>=s.spouseClaim?ssAnnual(s.spouseClaim,s.spouseFraMonthly):0;
  const ss=u+sp;
  const moonlight=s.moonlightIncome>0&&age<=s.moonlightThroughAge?s.moonlightIncome:0;
  const div=voo*s.divYield/100;
  const usePct=s.useVooDividends?Math.max(0,Math.min(100,s.vooDividendUsePct))/100:0;
  const divUsed=div*usePct;
  const divReinvested=div-divUsed;
  const taxesBase=taxesFor(div,f.annual,ss,moonlight,0);
  const afterTaxBase=divUsed+f.annual+ss+moonlight-taxesBase;
  const ordNet=Math.max(.01,1-s.ordinaryTaxPct/100);
  const planned401k=s.mode==="fixed"?k*s.fixedPct/100:Math.max(0,(expenseTarget-afterTaxBase)/ordNet);
  const rmd=rmdForAge(age,k);
  const target401k=Math.max(planned401k,rmd);
  const availableK=Math.max(0,k*(1+r));
  const wd401k=Math.min(target401k,availableK);
  const taxes=taxesFor(div,f.annual,ss,moonlight,wd401k);
  const cashAfter401k=divUsed+f.annual+ss+moonlight+wd401k-taxes;
  const forcedRmdGross=rmd>planned401k?Math.max(0,wd401k-planned401k):0;
  const forcedRmdNet=forcedRmdGross*ordNet;
  const rmdReinvested=Math.max(0,Math.min(forcedRmdNet,cashAfter401k-expenseTarget));
  let spendable=cashAfter401k-rmdReinvested;
  const availableRoth=Math.max(0,roth*(1+r));
  const rothNeeded=Math.max(0,expenseTarget-spendable);
  const rothWd=Math.min(rothNeeded,availableRoth);spendable+=rothWd;
  const availableVooBeforeSale=Math.max(0,voo*(1+r)-divUsed+rmdReinvested);
  const vooSaleNetNeeded=Math.max(0,expenseTarget-spendable);
  const vooSaleTaxRate=Math.max(0,Math.min(.40,s.vooSaleTaxPct/100));
  const vooSaleNetFactor=Math.max(.01,1-vooSaleTaxRate);
  const vooSaleGrossNeeded=vooSaleNetNeeded/vooSaleNetFactor;
  const vooSale=Math.min(vooSaleGrossNeeded,availableVooBeforeSale);
  const vooSaleTax=vooSale*vooSaleTaxRate;
  const vooSaleNet=vooSale-vooSaleTax;
  spendable+=vooSaleNet;
  const totalTaxes=taxes+vooSaleTax;
  const afterTax=spendable,surplus=afterTax-expenseTarget;
  const endV=Math.max(0,availableVooBeforeSale-vooSale),endK=Math.max(0,availableK-wd401k),endRoth=Math.max(0,availableRoth-rothWd);
  rows.push({age,spa,vooStart:voo,kStart:k,rothStart:roth,div,divUsed,divReinvested,fers:f.annual,u,sp,ss,moonlight,plannedWd:planned401k,rmd,wd:wd401k,wd401k,rothWd,vooSale,vooSaleTax,vooSaleNet,rmdReinvested,gross:div+f.annual+ss+moonlight+wd401k+vooSale,cashGross:divUsed+f.annual+ss+moonlight+wd401k+rothWd+vooSale,taxes:totalTaxes,afterTax,expenses:expenseTarget,surplus,baseAfterTax:afterTaxBase,endV,endK,endRoth,endTotal:endV+endK+endRoth,required:target401k});
  voo=endV;k=endK;roth=endRoth;
 }
 return{rows};
}
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function normal01(rng){let u=0,v=0;while(u===0)u=rng();while(v===0)v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function monteReturn(rng){
 const sigma=.16;
 const center=Math.max(-.95,s.realReturnPct/100);
 return Math.exp(Math.log1p(center)+sigma*normal01(rng))-1;
}
function percentile(sorted,q){if(!sorted.length)return 0;const x=(sorted.length-1)*q,i=Math.floor(x),f=x-i;return sorted[i]+(sorted[Math.min(i+1,sorted.length-1)]-sorted[i])*f}
function runMonteCarlo(f){
 const trials=2000,preYears=Math.max(0,Math.round(s.retirementAge-s.currentAge)),retYears=Math.max(0,96-Math.ceil(s.retirementAge));
 const rng=mulberry32(0x5EED1234),retireVals=[],age95Vals=[];let successes=0;
 for(let n=0;n<trials;n++){
  const pre=Array.from({length:preYears},()=>monteReturn(rng));
  const post=Array.from({length:retYears},()=>monteReturn(rng));
  const p=projectWithReturns(pre),ret=retirementWithReturns(p,f,post);
  retireVals.push(p.t);
  const at95=ret.rows.find(x=>x.age>=94)||ret.rows.at(-1);
  age95Vals.push(at95?at95.endTotal:p.t);
  if(ret.rows.every(x=>x.afterTax+1>=x.expenses))successes++;
 }
 retireVals.sort((a,b)=>a-b);age95Vals.sort((a,b)=>a-b);
 return{trials,success:successes/trials,retP10:percentile(retireVals,.10),retP50:percentile(retireVals,.50),retP90:percentile(retireVals,.90),p10:percentile(age95Vals,.10),p50:percentile(age95Vals,.50),p90:percentile(age95Vals,.90)};
}
function retirement(p,f){
 return retirementWithReturns(p,f,null);
}
function groupStages(rows){
 const stages=[];
 for(const row of rows){
  const key=[row.u>0?1:0,row.sp>0?1:0,row.moonlight>0?1:0,row.rmd>0?1:0,row.rothWd>0?1:0,row.vooSale>0?1:0,Math.round(row.expenses)].join("-");
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
 if(row.rmd>0)t+=" · RMD";
 if(row.rothWd>0)t+=" · Roth";
 if(row.vooSale>0)t+=" · VOO sales";
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
 const p=c.p,f=c.f,b=c.both;

 const growthNote=$("contributionGrowthNote");
 if(growthNote){
  const vr=realContributionIncrease(s.vooIncreasePct)*100,kr=realContributionIncrease(s.kIncreasePct)*100,rr=realContributionIncrease(s.rothIncreasePct)*100;
  growthNote.textContent=`To keep a contribution approximately flat in today's dollars, set its nominal increase about equal to inflation; with ${s.inflationPct.toFixed(2)}% inflation, use about ${s.inflationPct.toFixed(2)}%. Current real contribution growth: VOO ${vr.toFixed(2)}%/yr · 401(k) ${kr.toFixed(2)}%/yr · Roth ${rr.toFixed(2)}%/yr.`;
 }

 syncDividendControls();

 $("service").textContent=f.svc.toFixed(1)+" years";$("fers").textContent=money(f.annual)+"/yr · "+money(f.annual/12)+"/mo";$("fersTop").textContent=money(f.annual/12)+"/mo";
 $("userSS").querySelectorAll("button").forEach(x=>{x.classList.toggle("active",+x.dataset.age===s.userClaim);const span=x.querySelector("span");if(span)span.textContent=money(ssMonthly(+x.dataset.age,s.userFraMonthly))+"/mo"});
 $("spouseSS").querySelectorAll("button").forEach(x=>{x.classList.toggle("active",+x.dataset.age===s.spouseClaim);const span=x.querySelector("span");if(span)span.textContent=money(ssMonthly(+x.dataset.age,s.spouseFraMonthly))+"/mo"});
 const rmdLabel=$("rmdStartLabel");if(rmdLabel)rmdLabel.textContent=`Automatic from age ${formatRmdAge(rmdStartAge())}`;
 $("userClaimCustom").value=(s.userClaim===62||s.userClaim===70)?"":String(s.userClaim);
 $("spouseClaimCustom").value=(s.spouseClaim===62||s.spouseClaim===70)?"":String(s.spouseClaim);
 $("fersSurvivor").querySelectorAll("button").forEach(x=>x.classList.toggle("active",(x.dataset.fersSurvivor==="on")===!!s.fersFullSurvivor));
 $("stepDownSpending").querySelectorAll("button").forEach(x=>x.classList.toggle("active",(x.dataset.stepdown==="on")===!!s.stepDownSpending));
 const stepFields=$("stepDownFields");if(stepFields){stepFields.style.opacity=s.stepDownSpending?"1":".45";stepFields.querySelectorAll("input").forEach(x=>x.disabled=!s.stepDownSpending)}
 $("scenarioPresets").querySelectorAll("button").forEach(x=>{const p=SCENARIOS[x.dataset.scenario];x.classList.toggle("active",Math.abs(s.realReturnPct-p.realReturnPct)<.001&&Math.abs(s.inflationPct-p.inflationPct)<.001)});
 $("spendingPresets").querySelectorAll("button").forEach(x=>{const p=SPENDING_PRESETS[x.dataset.spendingPreset];const match=!!s.stepDownSpending&&Math.round(s.expenses)===p.expenses&&Math.round(s.expenses80)===p.expenses80&&Math.round(s.expenses90)===p.expenses90;x.classList.toggle("active",match)});
 $("monteCarloMode").querySelectorAll("button").forEach(x=>x.classList.toggle("active",(x.dataset.mc==="on")===!!s.monteCarlo));
 const mcBox=$("mcResults");
 if(s.monteCarlo){
  const mc=runMonteCarlo(f);mcBox.style.display="block";
  $("mcAssumption").textContent=`${mc.trials.toLocaleString()} trials · 16% volatility`;
  $("mcSuccess").textContent=(mc.success*100).toFixed(1)+"%";
  $("mcRetMedian").textContent=money(mc.retP50);$("mcRetRange").textContent=`10th–90th: ${money(mc.retP10)} – ${money(mc.retP90)}`;
  $("mc95Median").textContent=money(mc.p50);$("mc95Range").textContent=`10th–90th: ${money(mc.p10)} – ${money(mc.p90)}`;
  $("mc95P10").textContent=money(mc.p10);
 }else mcBox.style.display="none";
 $("userBenefit").textContent="Claim "+s.userClaim+" · "+money(ssAnnual(s.userClaim,s.userFraMonthly)/12)+"/mo · "+money(ssAnnual(s.userClaim,s.userFraMonthly))+"/yr";
 $("spouseBenefit").textContent="Claim "+s.spouseClaim+" · "+money(ssAnnual(s.spouseClaim,s.spouseFraMonthly)/12)+"/mo · "+money(ssAnnual(s.spouseClaim,s.spouseFraMonthly))+"/yr";
 $("mode").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x.dataset.mode===s.mode));$("fixedWrap").style.display=s.mode==="fixed"?"block":"none";

 $("income").textContent=money(b.afterTax)+"/yr";$("incomeMo").textContent=`Age ${b.age} · ${money(b.afterTax/12)}/mo after estimated tax`;$("expenseOut").textContent=money(b.expenses)+"/yr";
 $("surplus").textContent=(b.surplus>=0?"+":"−")+money(Math.abs(b.surplus))+"/yr";$("surplus").className="metric-sm "+(b.surplus>=0?"green":"red");

 $("pre401").textContent=money(b.baseAfterTax)+"/yr";
 const divPhrase=b.divUsed>0
  ?`used VOO dividends (${money(b.divUsed)})`
  :`no VOO dividends used`;
 $("preDetail").textContent=`After-tax cash from ${divPhrase} + FERS + Social Security${b.moonlight>0?" + moonlighting":""}, before 401(k); tax includes all VOO dividends`;

 const cov=b.expenses?b.baseAfterTax/b.expenses*100:100;$("coverage").style.width=Math.min(100,Math.max(0,cov))+"%";$("coverageText").textContent=cov.toFixed(1)+"% of after-tax expenses covered before 401(k)";
 
 $("taxesOut").textContent=money(b.taxes)+"/yr";$("grossIncomeOut").textContent=money(b.gross)+"/yr gross modeled income (includes reinvested dividends)";

 const targetRow=c.target==null?null:p.rows.find(x=>x.age===c.target);
 const retirementCard=`<div class="milestone milestone-summary-card"><div class="tiny">AT RETIREMENT · AGE ${Math.round(s.retirementAge)}</div><div class="metric-sm">${money(p.t)}</div><div class="tiny">VOO ${compact(p.v)} · 401(k) ${compact(p.k)} · Roth ${compact(p.roth)}</div></div>`;
 const targetCard=targetRow
  ?`<div class="milestone milestone-summary-card"><div class="tiny">GOAL PORTFOLIO ACHIEVED</div><div class="metric-sm">Age ${Math.round(c.target)}</div><div class="tiny">Portfolio ${compact(targetRow.t)} · target ${compact(s.targetPortfolio)}</div><div class="tiny">VOO ${compact(targetRow.v)} · 401(k) ${compact(targetRow.k)} · Roth ${compact(targetRow.roth)}</div></div>`
  :`<div class="milestone milestone-summary-card"><div class="tiny">GOAL PORTFOLIO ACHIEVED</div><div class="metric-sm">Not reached</div><div class="tiny">Target ${compact(s.targetPortfolio)} before retirement</div></div>`;
 const ages=[70,75,80,85,90,95];
 const ageCards=ages.map(a=>{const z=c.ret.rows.find(x=>x.age>=a-1)||c.ret.rows.at(-1);return `<div class="milestone"><div class="tiny">UPON REACHING AGE ${a}</div><div class="metric-sm">${money(z.endTotal)}</div><div class="tiny">VOO ${compact(z.endV)} · 401(k) ${compact(z.endK)} · Roth ${compact(z.endRoth)}</div></div>`}).join("");
 $("milestones").innerHTML=retirementCard+targetCard+ageCards;

 const stagesEl=$("incomeStages");
 if(stagesEl){stagesEl.innerHTML=c.stages.map(st=>{
   const r=st.startRow,range=st.start===st.end?`Age ${st.start}`:`Ages ${st.start}–${st.end}`;
   const spouseEnd=st.endRow.spa;
   const spouseRange=Math.abs(r.spa-spouseEnd)<.01?`spouse ${r.spa.toFixed(1)}`:`spouse ${r.spa.toFixed(1)}–${spouseEnd.toFixed(1)}`;
   const divText=r.divUsed>0
    ?`VOO div used ${money(r.divUsed)} · reinvested ${money(r.divReinvested)}`
    :`VOO div used ${money(0)} · reinvested ${money(r.div)}`;
   const rmdText=r.rmd>0?` · RMD minimum ${money(r.rmd)}${r.rmdReinvested>0?` · excess RMD→VOO ${money(r.rmdReinvested)}`:""}`:"";
   const rothText=r.rothWd>0?` · Roth ${money(r.rothWd)}`:"";
   const vooSaleText=r.vooSale>0?` · VOO sold ${money(r.vooSale)} · est. VOO sale tax ${money(r.vooSaleTax||0)}`:"";
   return `<div class="stage"><div class="row"><div><div style="font-size:13px;font-weight:700">${stageTitle(r)}</div><div class="tiny">${range} · ${spouseRange}</div></div><div style="text-align:right"><div style="font-size:13px;font-weight:700">${money(r.afterTax)}/yr</div><div class="tiny">${money(r.afterTax/12)}/mo after tax</div></div></div><div class="tiny" style="margin-top:6px">${divText} · FERS ${money(r.fers)} · Moonlighting ${money(r.moonlight)} · SS ${money(r.ss)} · 401(k) ${money(r.wd)}${rothText}${vooSaleText}${rmdText}</div></div>`;
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
  $("chart").innerHTML=h;$("chartSub").textContent="Year-end retirement balances after the spending waterfall: 401(k), then Roth IRA, then VOO sales, with cohort-based RMD rules.";
 }else if(chartMode==="income"){
  const d=c.ret.rows,max=Math.max(s.expenses,...d.map(x=>x.afterTax),...d.map(x=>x.baseAfterTax),1)*1.1,a=axes(max,d[0].age,d.at(-1).age);let h=a.g+ticks(d,a);
  h+=poly(d,a,"afterTax","--s2",4)+poly(d,a,"baseAfterTax","--s3",2.5);
  const expRows=d.map(x=>({...x,expenseLine:s.expenses}));h+=poly(expRows,a,"expenseLine","--s5",2.5,"7 5");
  $("chart").innerHTML=h;$("chartSub").textContent="After-tax spendable income, income before 401(k), and expenses by age; reinvested VOO dividends are not counted as spendable cash.";
 }else{
  const rates=[4,5,6,7,8],vals=rates.map(x=>project(x).t),max=Math.max(...vals,s.targetPortfolio,1)*1.1,a=axes(max,0,6);let h=a.g;
  rates.forEach((x,i)=>{const xx=a.L+34+i*124,yy=a.y(vals[i]),bh=a.T+a.ph-yy;h+=`<rect x="${xx}" y="${yy}" width="88" height="${bh}" rx="8" fill="var(--s${2+i%5})"/><text x="${xx+44}" y="${a.H-14}" text-anchor="middle" font-size="12" fill="var(--muted)">${x}%</text><text x="${xx+44}" y="${Math.max(14,yy-7)}" text-anchor="middle" font-size="11" fill="var(--text)">${compact(vals[i])}</text>`});
  $("chart").innerHTML=h;$("chartSub").textContent="Combined portfolio at retirement under 4%–8% real-return assumptions.";
 }
}

syncDividendControls();
render();savePlan();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
})();