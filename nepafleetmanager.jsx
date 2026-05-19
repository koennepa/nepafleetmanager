import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DATA
// ─────────────────────────────────────────────────────────────────────────────
const VESSELS = [
  { id:1, name:"Grona Kestrel", imo:"9381811", mmsi:"538004897", dwt:7332, built:2005, geared:false, cranes:null,    holds:3, gt:4825 },
  { id:2, name:"Grona Hawk",    imo:"9522738", mmsi:"538007987", dwt:7533, built:2008, geared:true,  cranes:"2×25t", holds:3, gt:5087 },
  { id:3, name:"Grona Eagle",   imo:"9485186", mmsi:"538007990", dwt:7533, built:2008, geared:true,  cranes:"2×25t", holds:3, gt:5087 },
  { id:4, name:"Grona Falcon",  imo:"9492933", mmsi:"538007986", dwt:7533, built:2008, geared:true,  cranes:"2×25t", holds:3, gt:5087 },
  { id:5, name:"Grona Osprey",  imo:"9543316", mmsi:"538007991", dwt:7533, built:2009, geared:true,  cranes:"2×25t", holds:3, gt:5087 },
  { id:6, name:"Grona Harrier", imo:"9506409", mmsi:"538007989", dwt:7533, built:2008, geared:true,  cranes:"2×25t", holds:3, gt:5087 },
  { id:7, name:"Grona Vulture", imo:"9543328", mmsi:"538007988", dwt:7536, built:2009, geared:true,  cranes:"2×25t", holds:3, gt:5087 },
  { id:8, name:"Grona Raven",   imo:"9368649", mmsi:"538004933", dwt:7949, built:2005, geared:false, cranes:null,    holds:1, gt:4949 },
];
const VNAMES = VESSELS.map(v=>v.name);

// ── Companies ──
const COMPANIES = [
  { id:"nt",  name:"NEPA Transport",    short:"NT",  color:"#1a2b4a", desc:"NEPA Transport fleet" },
  { id:"oal", name:"Orient Asia Lines", short:"OAL", color:"#0e7490", desc:"Chartered tonnage — Asia Pacific" },
  { id:"mas", name:"Med Asia Shipping", short:"MAS", color:"#1e4d8c", desc:"Chartered tonnage — Mediterranean & Asia" },
  { id:"tss", name:"Three Seas Svcs.",  short:"TSS", color:"#065f46", desc:"Chartered tonnage — Black Sea & Med" },
  { id:"lnc", name:"Lineco Navigation", short:"LNC", color:"#6d28d9", desc:"Chartered tonnage — Global" },
];

// ── Users ──
const USERS = [
  { id:"u1", name:"Admin",          username:"admin", password:"nepa2024",  companies:["nt","oal","mas","tss","lnc"], role:"Administrator" },
  { id:"u2", name:"NT Manager",     username:"nt",    password:"nt2024",    companies:["nt"],                         role:"Fleet Manager" },
  { id:"u3", name:"OAL Manager",    username:"oal",   password:"oal2024",   companies:["oal"],                        role:"Fleet Manager" },
  { id:"u4", name:"MAS Manager",    username:"mas",   password:"mas2024",   companies:["mas"],                        role:"Fleet Manager" },
  { id:"u5", name:"TSS Manager",    username:"tss",   password:"tss2024",   companies:["tss"],                        role:"Fleet Manager" },
  { id:"u6", name:"Lineco Manager", username:"lnc",   password:"lnc2024",   companies:["lnc"],                        role:"Fleet Manager" },
  { id:"u7", name:"Commercial",     username:"comm",  password:"comm2024",  companies:["nt","oal","mas","tss","lnc"], role:"Commercial" },
];

const VSTATUS_CFG = {
  "TC-fixed":{ color:"#1e6fba", bg:"#dbeafe", label:"TC Fixed" },
  "Spot":    { color:"#8b5cf6", bg:"#ede9fe", label:"Spot" },
  "Laden":   { color:"#10b981", bg:"#d1fae5", label:"Laden" },
  "Ballast": { color:"#f59e0b", bg:"#fef3c7", label:"Ballast" },
  "Port":    { color:"#ef4444", bg:"#fee2e2", label:"In Port" },
  "Idle":    { color:"#6b7280", bg:"#f3f4f6", label:"Idle" },
};
const FIX_STAGES = [
  { key:"enquiry",     label:"Enquiry",     color:"#94a3b8", bg:"#f1f5f9" },
  { key:"negotiation", label:"Negotiation", color:"#f59e0b", bg:"#fef3c7" },
  { key:"on_subs",     label:"On Subs",     color:"#8b5cf6", bg:"#ede9fe" },
  { key:"fixed",       label:"Fixed",       color:"#10b981", bg:"#d1fae5" },
  { key:"failed",      label:"Failed",      color:"#ef4444", bg:"#fee2e2" },
];
const VOY_STATUSES = [
  { key:"planning",  label:"Planning",  color:"#94a3b8", bg:"#f1f5f9" },
  { key:"active",    label:"Active",    color:"#10b981", bg:"#d1fae5" },
  { key:"completed", label:"Completed", color:"#1e6fba", bg:"#dbeafe" },
  { key:"cancelled", label:"Cancelled", color:"#ef4444", bg:"#fee2e2" },
];
const CRM_TYPES = [
  { key:"charterer", label:"Charterer", color:"#1e6fba", bg:"#dbeafe", icon:"🏭" },
  { key:"broker",    label:"Broker",    color:"#8b5cf6", bg:"#ede9fe", icon:"🤝" },
  { key:"agent",     label:"Agent",     color:"#10b981", bg:"#d1fae5", icon:"⚓" },
  { key:"supplier",  label:"Supplier",  color:"#f59e0b", bg:"#fef3c7", icon:"⛽" },
  { key:"other",     label:"Other",     color:"#6b7280", bg:"#f3f4f6", icon:"👤" },
];
const CARGO_TYPES   = ["Grain","Coal","Scrap","Steel","Fertilizers","Cement","Salt","Sand","Timber","General cargo","Other"];
const FIX_TYPES     = ["Voyage","Time Charter","COA","Spot TC"];
const COST_CATS     = ["Port dues","Agency fees","Pilotage","Towage","Stevedoring","Bunkers (IFO)","Bunkers (MGO)","Canal dues","Surveys","Misc."];
const PORT_EVENTS   = ["Arrival","Berthing","Comm. loading","Compl. loading","Comm. discharging","Compl. discharging","Departure","Anchoring","Bunkering"];
const REGIONS       = ["Northwest Europe","Mediterranean","Baltic Sea","Black Sea","West Africa","East Africa","Middle East","South America","North America","Southeast Asia","Far East","Global"];

const DEF_OPS = Object.fromEntries(VESSELS.map(v=>[v.id,{status:"Idle",position:"",cargo:"",charterer:"",tcRate:null,eta:"",voyageNo:""}]));
const EMPTY_FIX = { vessel:"",stage:"enquiry",type:"Voyage",chartererContactId:null,brokerContactId:null,charterer:"",broker:"",cargo:"",quantity:"",loadport:"",dischport:"",laycan:"",freight:"",tcRate:"",duration:"",commission:"2.50",notes:"",addedDate:new Date().toISOString().split("T")[0],voyageId:null };
const EMPTY_VOY = { vesselName:"",voyageNo:"",status:"planning",chartererContactId:null,brokerContactId:null,agentContactId:null,charterer:"",broker:"",agent:"",cargoType:"",cargoQty:"",loadport:"",dischport:"",laycan:"",etd:"",eta:"",freightRate:"",freightLumpsum:"",freightType:"per_mt",commission:"2.50",demurrage:"",despatch:"",notes:"",portCalls:[],bunkers:[],costs:[],fixtureId:null };
const EMPTY_CON = { type:"charterer",company:"",contactName:"",email:"",phone:"",address:"",region:"",website:"",cargoTypes:[],vessels:[],rating:0,notes:"",tags:"",addedDate:new Date().toISOString().split("T")[0],interactions:[] };

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const genId  = ()=> Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const fmtDate= d=>{ if(!d) return "—"; try{ return new Date(d).toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}); }catch{ return d; }};
const fmtNum = (n,d=0)=> n==null||n===""?"—":Number(n).toLocaleString("nl-NL",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtUSD = n=> (!n&&n!==0)?"—":`$${Number(n).toLocaleString("nl-NL",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const FS = { width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,background:"#fff",boxSizing:"border-box" };
const LS = { display:"block",fontSize:11,fontWeight:600,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em" };

function Field({label,children,span2}){ return <div style={{marginBottom:12,gridColumn:span2?"span 2":"span 1"}}><label style={LS}>{label}</label>{children}</div>; }
function Inp({value,onChange,type="text",placeholder=""}){ return <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={FS}/>; }
function Sel({value,onChange,options}){ return <select value={value||""} onChange={e=>onChange(e.target.value)} style={FS}>{options.map(o=>typeof o==="string"?<option key={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}</select>; }

function Badge({label,color,bg,small}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:small?"1px 8px":"3px 11px",borderRadius:20,fontSize:small?10:11,fontWeight:700,color,background:bg,border:`1px solid ${color}33`}}>{label}</span>;
}
function StageBadge({stage,small}){ const c=FIX_STAGES.find(s=>s.key===stage)||FIX_STAGES[0]; return <Badge label={c.label} color={c.color} bg={c.bg} small={small}/>; }
function VStatBadge({status,small}){ const c=VSTATUS_CFG[status]||VSTATUS_CFG["Idle"]; return <Badge label={c.label} color={c.color} bg={c.bg} small={small}/>; }
function VoyBadge({status,small}){ const c=VOY_STATUSES.find(s=>s.key===status)||VOY_STATUSES[0]; return <Badge label={c.label} color={c.color} bg={c.bg} small={small}/>; }
function CrmBadge({type,small}){ const c=CRM_TYPES.find(t=>t.key===type)||CRM_TYPES[4]; return <Badge label={`${c.icon} ${c.label}`} color={c.color} bg={c.bg} small={small}/>; }

function Stars({rating,onChange}){
  return <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(r=>(
    <button key={r} onClick={()=>onChange&&onChange(r===rating?0:r)} style={{background:"none",border:"none",cursor:onChange?"pointer":"default",fontSize:16,color:r<=rating?"#f59e0b":"#e5e7eb",padding:0,lineHeight:1}}>★</button>
  ))}</div>;
}

function KPI({label,value,sub,accent}){
  return <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 18px",borderLeft:`4px solid ${accent}`}}>
    <div style={{fontSize:11,color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{label}</div>
    <div style={{fontSize:22,fontWeight:800,color:"#1a2b4a",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{sub}</div>}
  </div>;
}

// CRM contact picker dropdown
function ContactPicker({label,contactId,onChange,contacts,filterType}){
  const filtered = filterType ? contacts.filter(c=>c.type===filterType) : contacts;
  const selected = contacts.find(c=>c.id===contactId);
  const cfg = selected ? CRM_TYPES.find(t=>t.key===selected.type)||CRM_TYPES[4] : null;
  return (
    <div style={{marginBottom:12}}>
      <label style={LS}>{label}</label>
      <div style={{position:"relative"}}>
        <select value={contactId||""} onChange={e=>onChange(e.target.value||null)} style={FS}>
          <option value="">— selecteer uit CRM —</option>
          {filtered.map(c=><option key={c.id} value={c.id}>{CRM_TYPES.find(t=>t.key===c.type)?.icon||"👤"} {c.company}{c.contactName?` (${c.contactName})`:""}</option>)}
        </select>
        {selected && <div style={{marginTop:5,display:"flex",alignItems:"center",gap:6,fontSize:11}}>
          <CrmBadge type={selected.type} small/>
          {selected.email&&<span style={{color:"#1e6fba"}}>{selected.email}</span>}
          {selected.phone&&<span style={{color:"#6b7280"}}>{selected.phone}</span>}
        </div>}
        {filtered.length===0&&<div style={{fontSize:11,color:"#f59e0b",marginTop:4}}>⚠ Geen {label.toLowerCase()}s in CRM — voeg ze eerst toe via de CRM pagina</div>}
      </div>
    </div>
  );
}

// Linked contacts display (on cards / detail views)
function LinkedContacts({contacts,chartererContactId,brokerContactId,agentContactId,onNavigateCrm,small}){
  const ids = [chartererContactId,brokerContactId,agentContactId].filter(Boolean);
  if(!ids.length) return null;
  return <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
    {ids.map(id=>{
      const c = contacts.find(x=>x.id===id);
      if(!c) return null;
      const cfg = CRM_TYPES.find(t=>t.key===c.type)||CRM_TYPES[4];
      return <button key={id} onClick={e=>{e.stopPropagation();onNavigateCrm(c);}} style={{fontSize:small?10:11,padding:small?"2px 7px":"3px 10px",background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.color}33`,borderRadius:20,cursor:"pointer",fontWeight:600}}>
        {cfg.icon} {c.company}
      </button>;
    })}
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// VOYAGE SUB-TABS
// ─────────────────────────────────────────────────────────────────────────────
function PortCallsTab({portCalls,onChange}){
  const [f,setF]=useState({port:"",eventType:"Arrival",date:"",time:"",remarks:""});
  const add=()=>{ if(!f.port||!f.date) return; onChange([...portCalls,{id:genId(),...f}]); setF({port:"",eventType:"Arrival",date:"",time:"",remarks:""}); };
  const i2={padding:"7px 9px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"};
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      <input value={f.port} onChange={e=>setF(x=>({...x,port:e.target.value}))} placeholder="Haven" style={{...i2,flex:"1 1 80px"}}/>
      <select value={f.eventType} onChange={e=>setF(x=>({...x,eventType:e.target.value}))} style={{...i2,flex:"1 1 130px"}}>{PORT_EVENTS.map(t=><option key={t}>{t}</option>)}</select>
      <input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))} style={{...i2,flex:"0 0 120px"}}/>
      <input type="time" value={f.time} onChange={e=>setF(x=>({...x,time:e.target.value}))} style={{...i2,flex:"0 0 80px"}}/>
      <input value={f.remarks} onChange={e=>setF(x=>({...x,remarks:e.target.value}))} placeholder="Opmerking" style={{...i2,flex:"1 1 90px"}}/>
      <button onClick={add} style={{padding:"7px 12px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>+</button>
    </div>
    {portCalls.length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"12px 0"}}>Nog geen port calls</div>}
    {portCalls.sort((a,b)=>a.date>b.date?1:-1).map(p=>(
      <div key={p.id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",background:"#f4f7fb",borderRadius:7,marginBottom:5,fontSize:12}}>
        <span style={{fontWeight:600,minWidth:80}}>{p.port}</span>
        <span style={{color:"#6b7280",minWidth:120}}>{p.eventType}</span>
        <span style={{color:"#9ca3af"}}>{fmtDate(p.date)}{p.time?` ${p.time}`:""}</span>
        {p.remarks&&<span style={{color:"#374151",flex:1}}>{p.remarks}</span>}
        <button onClick={()=>onChange(portCalls.filter(x=>x.id!==p.id))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:13,marginLeft:"auto"}}>✕</button>
      </div>
    ))}
  </div>;
}

function BunkersTab({bunkers,onChange}){
  const [f,setF]=useState({port:"",date:"",fuelType:"IFO 380",qty:"",price:"",supplier:""});
  const add=()=>{ if(!f.qty) return; onChange([...bunkers,{id:genId(),...f}]); setF({port:"",date:"",fuelType:"IFO 380",qty:"",price:"",supplier:""}); };
  const i2={padding:"7px 9px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"};
  const total=bunkers.reduce((s,b)=>s+(b.qty&&b.price?Number(b.qty)*Number(b.price):0),0);
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      <input value={f.port} onChange={e=>setF(x=>({...x,port:e.target.value}))} placeholder="Haven" style={{...i2,flex:"1 1 80px"}}/>
      <input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))} style={{...i2,flex:"0 0 120px"}}/>
      <select value={f.fuelType} onChange={e=>setF(x=>({...x,fuelType:e.target.value}))} style={{...i2,flex:"0 0 90px"}}>{["IFO 380","VLSFO","MGO","LNG"].map(t=><option key={t}>{t}</option>)}</select>
      <input type="number" value={f.qty} onChange={e=>setF(x=>({...x,qty:e.target.value}))} placeholder="MT" style={{...i2,flex:"0 0 60px"}}/>
      <input type="number" value={f.price} onChange={e=>setF(x=>({...x,price:e.target.value}))} placeholder="$/MT" style={{...i2,flex:"0 0 65px"}}/>
      <input value={f.supplier} onChange={e=>setF(x=>({...x,supplier:e.target.value}))} placeholder="Supplier" style={{...i2,flex:"1 1 80px"}}/>
      <button onClick={add} style={{padding:"7px 12px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>+</button>
    </div>
    {bunkers.length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"12px 0"}}>Nog geen bunkers</div>}
    {bunkers.map(b=>(
      <div key={b.id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",background:"#f4f7fb",borderRadius:7,marginBottom:5,fontSize:12}}>
        <span style={{fontWeight:600,minWidth:75}}>{b.port}</span>
        <span style={{color:"#6b7280"}}>{b.fuelType}</span>
        <span>{fmtNum(b.qty)} mt @ ${b.price}/mt</span>
        <span style={{fontWeight:600}}>{b.qty&&b.price?fmtUSD(Number(b.qty)*Number(b.price)):"—"}</span>
        <button onClick={()=>onChange(bunkers.filter(x=>x.id!==b.id))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:13,marginLeft:"auto"}}>✕</button>
      </div>
    ))}
    {bunkers.length>0&&<div style={{textAlign:"right",fontWeight:700,fontSize:12,marginTop:6}}>Totaal: {fmtUSD(total)}</div>}
  </div>;
}

function CostsTab({costs,onChange}){
  const [f,setF]=useState({category:"Port dues",description:"",port:"",amount:"",currency:"USD",date:""});
  const add=()=>{ if(!f.amount) return; onChange([...costs,{id:genId(),...f}]); setF({category:"Port dues",description:"",port:"",amount:"",currency:"USD",date:""}); };
  const i2={padding:"7px 9px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"};
  const total=costs.reduce((s,c)=>s+Number(c.amount||0),0);
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      <select value={f.category} onChange={e=>setF(x=>({...x,category:e.target.value}))} style={{...i2,flex:"1 1 110px"}}>{COST_CATS.map(c=><option key={c}>{c}</option>)}</select>
      <input value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))} placeholder="Omschrijving" style={{...i2,flex:"1 1 100px"}}/>
      <input value={f.port} onChange={e=>setF(x=>({...x,port:e.target.value}))} placeholder="Haven" style={{...i2,flex:"0 0 80px"}}/>
      <input type="number" value={f.amount} onChange={e=>setF(x=>({...x,amount:e.target.value}))} placeholder="Bedrag" style={{...i2,flex:"0 0 80px"}}/>
      <select value={f.currency} onChange={e=>setF(x=>({...x,currency:e.target.value}))} style={{...i2,flex:"0 0 60px"}}>{["USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}</select>
      <input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))} style={{...i2,flex:"0 0 120px"}}/>
      <button onClick={add} style={{padding:"7px 12px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>+</button>
    </div>
    {costs.length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"12px 0"}}>Nog geen kosten</div>}
    {costs.map(c=>(
      <div key={c.id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",background:"#f4f7fb",borderRadius:7,marginBottom:5,fontSize:12}}>
        <span style={{fontWeight:600,minWidth:100}}>{c.category}</span>
        <span style={{color:"#6b7280",flex:1}}>{c.description}{c.port?` · ${c.port}`:""}</span>
        <span style={{fontWeight:600}}>{c.currency} {fmtNum(c.amount,2)}</span>
        <button onClick={()=>onChange(costs.filter(x=>x.id!==c.id))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:13}}>✕</button>
      </div>
    ))}
    {costs.length>0&&<div style={{textAlign:"right",fontWeight:700,fontSize:12,marginTop:6}}>Totaal (USD): {fmtUSD(total)}</div>}
  </div>;
}

function PnLPanel({v}){
  const costs=(v.costs||[]).reduce((s,c)=>s+Number(c.amount||0),0);
  const bunk=(v.bunkers||[]).reduce((s,b)=>s+(b.qty&&b.price?Number(b.qty)*Number(b.price):0),0);
  let gf=0; if(v.freightType==="per_mt"&&v.freightRate&&v.cargoQty) gf=Number(v.freightRate)*Number(v.cargoQty); else if(v.freightLumpsum) gf=Number(v.freightLumpsum);
  const comm=gf*(Number(v.commission||0)/100),net=gf-comm,dem=Number(v.demurrage||0),des=Number(v.despatch||0),rev=net+dem-des,result=rev-costs-bunk;
  const R=({label,value,bold,neg,sub})=>(
    <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:sub?"none":"1px solid #f3f4f6"}}>
      <span style={{fontSize:12,color:sub?"#9ca3af":"#374151",fontWeight:bold?700:400,paddingLeft:sub?10:0}}>{label}</span>
      <span style={{fontSize:12,fontWeight:bold?700:500,color:neg===true?"#ef4444":neg===false?"#10b981":"#1a2b4a"}}>{value===0?"—":fmtUSD(value)}</span>
    </div>
  );
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
    <div style={{background:"#f4f7fb",borderRadius:10,padding:14,border:"1px solid #e2e8f0"}}>
      <div style={{fontWeight:700,fontSize:11,color:"#374151",marginBottom:10,textTransform:"uppercase"}}>Opbrengsten</div>
      <R label="Bruto vracht" value={gf}/><R label={`Commissie ${v.commission||0}%`} value={comm} neg sub/><R label="Netto vracht" value={net} bold/>
      <R label="Demurrage" value={dem}/><R label="Despatch" value={des} neg sub/><R label="Totaal" value={rev} bold neg={rev<0}/>
    </div>
    <div style={{background:"#f4f7fb",borderRadius:10,padding:14,border:"1px solid #e2e8f0"}}>
      <div style={{fontWeight:700,fontSize:11,color:"#374151",marginBottom:10,textTransform:"uppercase"}}>Kosten</div>
      <R label="Voyage kosten" value={costs}/><R label="Bunkerkosten" value={bunk}/><R label="Totaal kosten" value={costs+bunk} bold neg/>
      <div style={{marginTop:14,padding:12,borderRadius:8,background:result>=0?"#d1fae5":"#fee2e2",border:`1px solid ${result>=0?"#6ee7b7":"#fca5a5"}`}}>
        <div style={{fontSize:10,color:result>=0?"#065f46":"#991b1b",fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Voyage resultaat</div>
        <div style={{fontSize:20,fontWeight:800,color:result>=0?"#059669":"#dc2626"}}>{result>=0?"+":""}{fmtUSD(result)}</div>
        {gf>0&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Marge: {((result/gf)*100).toFixed(1)}%</div>}
      </div>
    </div>
  </div>;
}

// AIS Panel
function AISPanel({vessel,onClose}){
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);const [showMap,setShowMap]=useState(false);const [ts,setTs]=useState(null);
  const fetch_=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search AIS for ${vessel.name.toUpperCase()} IMO ${vessel.imo}. Return ONLY raw JSON no markdown: {"vessel_name":"","lat":0,"lon":0,"speed":0,"course":0,"nav_status":"","last_port":"","destination":"","eta":"","area":"","source":""}`}]})});
      const d=await res.json();
      const txt=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const m=txt.match(/\{[\s\S]*?\}/); if(!m) throw new Error("Geen data");
      setData(JSON.parse(m[0]));setTs(new Date());
    }catch(e){setError(e.message);}finally{setLoading(false);}
  },[vessel]);
  useEffect(()=>{fetch_();},[fetch_]);
  const mapUrl=`https://www.marinetraffic.com/en/ais/embed/zoom:7/centery:${data?.lat?Number(data.lat).toFixed(3):52}/centerx:${data?.lon?Number(data.lon).toFixed(3):4}/maptype:0/shownames:true/mmsi:${vessel.mmsi}/showmenu:false/remember:false`;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:18,width:560,maxWidth:"95vw",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 70px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1a2b4a",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>🛰 {vessel.name}</div><div style={{fontSize:11,color:"#5a6a82"}}>IMO {vessel.imo} · {vessel.dwt.toLocaleString()} DWT</div></div>
          <div style={{display:"flex",gap:8}}><button onClick={fetch_} disabled={loading} style={{padding:"5px 12px",background:"#2d4a7a",color:"#94a3b8",border:"1px solid #334155",borderRadius:6,fontSize:11,cursor:"pointer",fontWeight:600}}>{loading?"⟳":"↻"}</button><button onClick={onClose} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:20}}>✕</button></div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14,padding:10,background:"#f4f7fb",borderRadius:8,border:"1px solid #e2e8f0"}}>
            {[["DWT",`${vessel.dwt.toLocaleString()} t`],["GT",vessel.gt.toLocaleString()],["Holds",vessel.holds],["Cranes",vessel.cranes||"Ungeared"]].map(([l,v])=>(
              <div key={l} style={{textAlign:"center"}}><div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase"}}>{l}</div><div style={{fontWeight:700,fontSize:12}}>{v}</div></div>
            ))}
          </div>
          {loading&&<div style={{textAlign:"center",padding:"28px 0",color:"#6b7280"}}><div style={{fontSize:24,marginBottom:6}}>⟳</div>Positie ophalen…</div>}
          {error&&!loading&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:12,marginBottom:12}}><div style={{color:"#dc2626",fontWeight:700,fontSize:12}}>⚠ {error}</div><div style={{marginTop:6,fontSize:11}}><a href={`https://www.vesselfinder.com/vessels/details/${vessel.imo}`} target="_blank" rel="noreferrer" style={{color:"#1e6fba"}}>VesselFinder</a> · <a href={`https://www.marinetraffic.com/en/ais/details/ships/imo:${vessel.imo}`} target="_blank" rel="noreferrer" style={{color:"#1e6fba"}}>MarineTraffic</a></div></div>}
          {data&&!loading&&<>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
              {[["📍 Lat",data.lat!=null?`${Number(data.lat).toFixed(5)}°`:"—"],["📍 Lon",data.lon!=null?`${Number(data.lon).toFixed(5)}°`:"—"],["💨 Snelheid",data.speed!=null?`${Number(data.speed).toFixed(1)} kn`:"—"],["🧭 Koers",data.course!=null?`${data.course}°`:"—"],["🔵 Status",data.nav_status||"—"],["🌊 Gebied",data.area||"—"]].map(([l,v])=>(
                <div key={l} style={{background:"#f4f7fb",border:"1px solid #e2e8f0",borderRadius:7,padding:"9px 11px"}}><div style={{fontSize:9,color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:"#1a2b4a"}}>{v}</div></div>
              ))}
            </div>
            <div style={{background:"#eff6ff",border:"1px solid #bae6fd",borderRadius:8,padding:11,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:11,color:"#1e4d8c",marginBottom:7}}>🚢 Voyage</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:11}}>
                <div><span style={{color:"#5a6a82"}}>Van: </span><strong>{data.last_port||"—"}</strong></div>
                <div><span style={{color:"#5a6a82"}}>Naar: </span><strong>{data.destination||"—"}</strong></div>
                <div><span style={{color:"#5a6a82"}}>ETA: </span><strong>{data.eta||"—"}</strong></div>
                <div><span style={{color:"#5a6a82"}}>Bron: </span><strong>{data.source||"AIS"}</strong></div>
              </div>
            </div>
            <button onClick={()=>setShowMap(m=>!m)} style={{width:"100%",padding:"8px 0",marginBottom:showMap?8:12,background:showMap?"#1a2b4a":"#f4f7fb",color:showMap?"#fff":"#374151",border:"1px solid #e2e8f0",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>{showMap?"▲ Kaart verbergen":"🗺 Toon live kaart"}</button>
            {showMap&&<div style={{borderRadius:8,overflow:"hidden",border:"1px solid #e2e8f0",height:220,marginBottom:12}}><iframe src={mapUrl} width="100%" height="220" frameBorder="0" title="kaart" style={{display:"block"}}/></div>}
            {ts&&<div style={{fontSize:10,color:"#9ca3af",textAlign:"center",marginBottom:6}}>Bijgewerkt: {ts.toLocaleTimeString("nl-NL")}</div>}
          </>}
          <div style={{display:"flex",gap:8}}>
            <a href={`https://www.vesselfinder.com/vessels/details/${vessel.imo}`} target="_blank" rel="noreferrer" style={{flex:1,textAlign:"center",padding:"7px 0",background:"#eff6ff",color:"#1e4d8c",borderRadius:7,fontSize:11,fontWeight:600,textDecoration:"none",border:"1px solid #bae6fd"}}>↗ VesselFinder</a>
            <a href={`https://www.marinetraffic.com/en/ais/details/ships/imo:${vessel.imo}`} target="_blank" rel="noreferrer" style={{flex:1,textAlign:"center",padding:"7px 0",background:"#f0fdf4",color:"#166534",borderRadius:7,fontSize:11,fontWeight:600,textDecoration:"none",border:"1px solid #bbf7d0"}}>↗ MarineTraffic</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError]       = useState("");
  const [showPw,setShowPw]     = useState(false);

  const attempt=()=>{
    const u=USERS.find(u=>u.username===username.trim().toLowerCase()&&u.password===password);
    if(u){ setError(""); onLogin(u); }
    else { setError("Invalid username or password."); }
  };

  const N2={
    navy:"#1a2b4a", blue:"#1e6fba", light:"#e8f0f8",
    white:"#fff", border:"#d0dae8", text:"#1a2b4a", muted:"#5a6a82",
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1a2b4a 0%,#2d4a7a 60%,#1e6fba 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      {/* Logo area */}
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:14,marginBottom:10}}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.12)"/>
            <path d="M12 32 L24 14 L36 32 Z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M17 32 L24 20 L31 32" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="12" y1="34" x2="36" y2="34" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:"0.2em",textTransform:"uppercase"}}>The NEPA Group</div>
            <div style={{fontSize:26,fontWeight:800,color:"#fff",letterSpacing:"-0.02em"}}>Fleet Manager</div>
          </div>
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Shipping Operations Platform</div>
      </div>

      {/* Login card */}
      <div style={{background:"#fff",borderRadius:18,padding:"36px 40px",width:380,maxWidth:"90vw",boxShadow:"0 32px 80px rgba(0,0,0,0.35)"}}>
        <div style={{fontSize:18,fontWeight:700,color:N2.navy,marginBottom:6}}>Sign in</div>
        <div style={{fontSize:13,color:N2.muted,marginBottom:28}}>Enter your credentials to access your fleet</div>

        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:N2.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Username</label>
          <input
            value={username}
            onChange={e=>setUsername(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&attempt()}
            placeholder="e.g. admin"
            autoFocus
            style={{width:"100%",padding:"10px 14px",border:"1.5px solid "+N2.border,borderRadius:9,fontSize:14,color:N2.navy,background:"#f7faff",boxSizing:"border-box",outline:"none"}}
          />
        </div>

        <div style={{marginBottom:24,position:"relative"}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:N2.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Password</label>
          <input
            type={showPw?"text":"password"}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&attempt()}
            placeholder="••••••••"
            style={{width:"100%",padding:"10px 40px 10px 14px",border:"1.5px solid "+N2.border,borderRadius:9,fontSize:14,color:N2.navy,background:"#f7faff",boxSizing:"border-box",outline:"none"}}
          />
          <button onClick={()=>setShowPw(x=>!x)} style={{position:"absolute",right:12,top:32,background:"none",border:"none",cursor:"pointer",color:N2.muted,fontSize:13}}>{showPw?"Hide":"Show"}</button>
        </div>

        {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"9px 13px",marginBottom:16,fontSize:12,color:"#dc2626",fontWeight:600}}>{error}</div>}

        <button
          onClick={attempt}
          style={{width:"100%",padding:"12px 0",background:"linear-gradient(135deg,#1a2b4a 0%,#1e6fba 100%)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",letterSpacing:"0.01em",boxShadow:"0 4px 18px rgba(30,111,186,0.35)"}}>
          Sign In
        </button>

        <div style={{marginTop:24,padding:"14px 16px",background:"#f4f7fb",borderRadius:10,border:"1px solid #dbeafe"}}>
          <div style={{fontSize:10,fontWeight:700,color:N2.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Demo accounts</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
            {USERS.map(u=>(
              <button key={u.id} onClick={()=>{setUsername(u.username);setPassword(u.password);}} style={{textAlign:"left",background:"none",border:"none",cursor:"pointer",padding:"2px 0",fontSize:11,color:N2.blue}}>
                <span style={{fontWeight:700}}>{u.username}</span><span style={{color:N2.muted}}> / {u.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{marginTop:24,fontSize:11,color:"rgba(255,255,255,0.35)"}}>© The NEPA Group · Fleet Operations Platform</div>
    </div>
  );
}

export default function App(){
  // ── Auth ──
  const [user,setUser] = useState(null);

  // ── Company ──
  const accessibleCos = user ? COMPANIES.filter(c=>user.companies.includes(c.id)) : [];
  const [coId,setCoId] = useState("nt");
  const co = COMPANIES.find(c=>c.id===coId)||COMPANIES[0];
  const pfx = "nfm_"+coId+"_";

  // ── State ──
  const [page,setPage]           = useState("dashboard");
  const [vesselOps,setVesselOps] = useState(DEF_OPS);
  const [fixtures,setFixtures]   = useState([]);
  const [voyages,setVoyages]     = useState([]);
  const [contacts,setContacts]   = useState([]);
  const [actLog,setActLog]       = useState([]);
  const [loaded,setLoaded]       = useState(false);
  const [saving,setSaving]       = useState(false);

  // UI state
  const [aisVessel,setAisVessel]     = useState(null);
  const [editVessel,setEditVessel]   = useState(null);
  const [fixForm,setFixForm]         = useState(null);
  const [fixDetail,setFixDetail]     = useState(null);
  const [voyForm,setVoyForm]         = useState(null);
  const [voyTab,setVoyTab]           = useState("general");
  const [crmForm,setCrmForm]         = useState(null);
  const [crmDetail,setCrmDetail]     = useState(null);
  const [crmTab,setCrmTab]           = useState("info");
  const [fSearch,setFSearch]         = useState("");
  const [fVessel,setFVessel]         = useState("All");
  const [vSearch,setVSearch]         = useState("");
  const [vVessel,setVVessel]         = useState("All");
  const [vStatus,setVStatus]         = useState("All");
  const [cSearch,setCSearch]         = useState("");
  const [cType,setCType]             = useState("All");

  // Finance state
  const [invoices,setInvoices]       = useState([]);
  const [settlements,setSettlements] = useState([]);
  const [finTab,setFinTab]           = useState("invoices");
  const [invForm,setInvForm]         = useState(null);

  // Charter vessels state
  const [charterVessels,setCharterVessels] = useState([]);
  const [cvForm,setCvForm]           = useState(null);

  // ── Load (reload when company changes) ──
  useEffect(()=>{
    if(!user) return;
    setLoaded(false);
    setVesselOps(DEF_OPS);
    setFixtures([]); setVoyages([]); setContacts([]); setActLog([]);
    setInvoices([]); setSettlements([]); setCharterVessels([]);
    setPage("dashboard");
    (async()=>{
      try{
        const ops=await window.storage.get(pfx+"ops"); if(ops) setVesselOps(JSON.parse(ops.value));
        const fix=await window.storage.get(pfx+"fix"); if(fix) setFixtures(JSON.parse(fix.value));
        const voy=await window.storage.get(pfx+"voy"); if(voy) setVoyages(JSON.parse(voy.value));
        const crm=await window.storage.get(pfx+"crm"); if(crm) setContacts(JSON.parse(crm.value));
        const log=await window.storage.get(pfx+"log"); if(log) setActLog(JSON.parse(log.value));
        const inv=await window.storage.get(pfx+"inv"); if(inv) setInvoices(JSON.parse(inv.value));
        const set2=await window.storage.get(pfx+"set"); if(set2) setSettlements(JSON.parse(set2.value));
        const cvs=await window.storage.get(pfx+"cvs");
        if(cvs) {
          const parsed=JSON.parse(cvs.value);
          if(parsed.length>0) {
            setCharterVessels(parsed);
          } else if(coId==="nt") {
            const seed=VESSELS.map(v=>({...v,id:String(v.id),hireRate:"",hireUnit:"day",ownerName:"NEPA Group",notes:"Owned vessel"}));
            setCharterVessels(seed);
            await window.storage.set(pfx+"cvs",JSON.stringify(seed));
          }
        } else if(coId==="nt") {
          const seed=VESSELS.map(v=>({...v,id:String(v.id),hireRate:"",hireUnit:"day",ownerName:"NEPA Group",notes:"Owned vessel"}));
          setCharterVessels(seed);
          await window.storage.set(pfx+"cvs",JSON.stringify(seed));
        }
      }catch(_){}
      setLoaded(true);
    })();
  },[coId, user]);

  // ── Login gate (all hooks above this line) ──
  if(!user) return <LoginScreen onLogin={u=>{setUser(u);setCoId(u.companies[0]||"nt");}} />;

  const persist=async(ops,fix,voy,crm,log,inv,set2,cvs)=>{
    setSaving(true);
    try{
      if(ops!==undefined) await window.storage.set(pfx+"ops",JSON.stringify(ops));
      if(fix!==undefined) await window.storage.set(pfx+"fix",JSON.stringify(fix));
      if(voy!==undefined) await window.storage.set(pfx+"voy",JSON.stringify(voy));
      if(crm!==undefined) await window.storage.set(pfx+"crm",JSON.stringify(crm));
      if(log!==undefined) await window.storage.set(pfx+"log",JSON.stringify(log));
      if(inv!==undefined) await window.storage.set(pfx+"inv",JSON.stringify(inv));
      if(set2!==undefined) await window.storage.set(pfx+"set",JSON.stringify(set2));
      if(cvs!==undefined) await window.storage.set(pfx+"cvs",JSON.stringify(cvs));
    }catch(_){}
    setTimeout(()=>setSaving(false),700);
  };

  const addLog=(msg,curLog)=>{ const e={msg,time:new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}; return [...(curLog||actLog),e].slice(-60); };

  // ── Vessel ops ──
  const saveVesselOp=(id,form)=>{
    const updated={...vesselOps,[id]:{...form,tcRate:form.tcRate?Number(form.tcRate):null}};
    const v=VESSELS.find(x=>x.id===id);
    const newLog=addLog(`${v.name} → ${form.status}, ${form.position||"—"}`);
    setVesselOps(updated);setActLog(newLog);
    persist(updated,undefined,undefined,undefined,newLog);
    setEditVessel(null);
  };

  // ── Contacts ──
  const saveContact=(c)=>{
    const exists=contacts.find(x=>x.id===c.id);
    const updated=exists?contacts.map(x=>x.id===c.id?c:x):[...contacts,c];
    setContacts(updated);persist(undefined,undefined,undefined,updated,undefined);
    setCrmForm(null);if(crmDetail?.id===c.id) setCrmDetail(c);
  };
  const deleteContact=(id)=>{
    const updated=contacts.filter(c=>c.id!==id);
    setContacts(updated);persist(undefined,undefined,undefined,updated,undefined);
    setCrmDetail(null);
  };

  // ── Fixtures ──
  const saveFix=(fix)=>{
    let newVoy=voyages;let f2={...fix};
    // resolve contact names from CRM
    if(fix.chartererContactId){ const c=contacts.find(x=>x.id===fix.chartererContactId); if(c) f2.charterer=c.company; }
    if(fix.brokerContactId){ const c=contacts.find(x=>x.id===fix.brokerContactId); if(c) f2.broker=c.company; }

    if(fix.stage==="fixed"&&!fix.voyageId){
      const voyNo=`${fix.vessel.split(" ")[1]?.toUpperCase().slice(0,3)||"VOY"}-${new Date().getFullYear().toString().slice(2)}${String(voyages.length+1).padStart(2,"0")}`;
      const newV={...EMPTY_VOY,id:genId(),fixtureId:f2.id||genId(),vesselName:fix.vessel,voyageNo:voyNo,status:"planning",chartererContactId:fix.chartererContactId,brokerContactId:fix.brokerContactId,charterer:f2.charterer,broker:f2.broker,cargoType:fix.cargo,cargoQty:fix.quantity,loadport:fix.loadport,dischport:fix.dischport,laycan:fix.laycan,freightRate:fix.freight,freightType:"per_mt",commission:fix.commission,notes:`Van fixture: ${f2.charterer||""} · ${fix.cargo||""} · ${fix.laycan||""}`};
      newVoy=[...voyages,newV];f2.voyageId=newV.id;if(!f2.id) f2.id=newV.fixtureId;
      // sync vessel ops
      const vid=VESSELS.find(v=>v.name===fix.vessel)?.id;
      if(vid){ const updOps={...vesselOps,[vid]:{...vesselOps[vid],status:fix.type.includes("Time Charter")?"TC-fixed":"Spot",charterer:f2.charterer,voyageNo:voyNo,cargo:fix.cargo||vesselOps[vid].cargo}}; setVesselOps(updOps); persist(updOps,undefined,undefined,undefined,undefined); }
      setVoyages(newVoy);
    }
    const exists=fixtures.find(x=>x.id===f2.id);
    const newFix=exists?fixtures.map(x=>x.id===f2.id?f2:x):[...fixtures,{...f2,id:f2.id||genId()}];
    const newLog=addLog(`Fixture ${f2.stage}: ${f2.vessel} · ${f2.charterer||"—"}`);
    setFixtures(newFix);setActLog(newLog);
    persist(undefined,newFix,newVoy!==voyages?newVoy:undefined,undefined,newLog);
    setFixForm(null);setFixDetail(null);
  };
  const updateFixStage=(id,stage)=>{ const f=fixtures.find(x=>x.id===id); if(f) saveFix({...f,stage}); };
  const deleteFix=(id)=>{ if(!window.confirm("Fixture verwijderen?")) return; const nf=fixtures.filter(f=>f.id!==id); setFixtures(nf); persist(undefined,nf,undefined,undefined,undefined); setFixDetail(null); };

  // ── Voyages ──
  const saveVoyage=(v)=>{
    // resolve contact names
    let v2={...v};
    if(v.chartererContactId){ const c=contacts.find(x=>x.id===v.chartererContactId); if(c) v2.charterer=c.company; }
    if(v.brokerContactId){ const c=contacts.find(x=>x.id===v.brokerContactId); if(c) v2.broker=c.company; }
    if(v.agentContactId){ const c=contacts.find(x=>x.id===v.agentContactId); if(c) v2.agent=c.company; }
    const exists=voyages.find(x=>x.id===v2.id);
    const newVoy=exists?voyages.map(x=>x.id===v2.id?v2:x):[...voyages,{...v2,id:v2.id||genId()}];
    // sync vessel ops
    const vid=VESSELS.find(x=>x.name===v2.vesselName)?.id;
    if(vid){ const sm={planning:"Idle",active:"Laden",completed:"Idle",cancelled:"Idle"}; const updOps={...vesselOps,[vid]:{...vesselOps[vid],voyageNo:v2.voyageNo,charterer:v2.charterer,cargo:v2.cargoType,position:v2.loadport||vesselOps[vid].position,eta:v2.eta,status:sm[v2.status]||vesselOps[vid].status}}; setVesselOps(updOps); persist(updOps,undefined,undefined,undefined,undefined); }
    const newLog=addLog(`Voyage ${v2.voyageNo||""}: ${v2.vesselName} · ${v2.status}`);
    setVoyages(newVoy);setActLog(newLog);
    persist(undefined,undefined,newVoy,undefined,newLog);
    setVoyForm(null);
  };
  const deleteVoyage=(id)=>{ if(!window.confirm("Voyage verwijderen?")) return; const nv=voyages.filter(v=>v.id!==id); setVoyages(nv); persist(undefined,undefined,nv,undefined,undefined); setVoyForm(null); };

  // navigate to CRM contact from anywhere
  const navToCrm=(c)=>{ setCrmDetail(c); setCrmTab("info"); setPage("crm"); };

  if(!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#9ca3af",fontFamily:"system-ui",fontSize:14}}>NEPA Fleet Manager loading…</div>;

  // ── Computed ──
  const activeVessels  = charterVessels;
  const activeVNames   = activeVessels.map(v=>v.name);
  const activeVoyages  = voyages.filter(v=>v.status==="active").length;
  const fixedFixtures  = fixtures.filter(f=>f.stage==="fixed").length;
  const inNego         = fixtures.filter(f=>["negotiation","on_subs"].includes(f.stage)).length;
  const vStatCounts    = Object.values(vesselOps).reduce((a,d)=>{ a[d.status]=(a[d.status]||0)+1; return a; },{});
  const filteredFix    = fixtures.filter(f=>(fVessel==="All"||f.vessel===fVessel)&&(!fSearch||`${f.vessel} ${f.charterer} ${f.cargo} ${f.broker}`.toLowerCase().includes(fSearch.toLowerCase())));
  const filteredVoy    = voyages.filter(v=>(vVessel==="All"||v.vesselName===vVessel)&&(vStatus==="All"||v.status===vStatus)&&(!vSearch||`${v.vesselName} ${v.voyageNo} ${v.charterer}`.toLowerCase().includes(vSearch.toLowerCase())));
  const filteredCrm    = contacts.filter(c=>(cType==="All"||c.type===cType)&&(!cSearch||`${c.company} ${c.contactName} ${c.email} ${c.tags}`.toLowerCase().includes(cSearch.toLowerCase())));
  const cTypeCounts    = contacts.reduce((a,c)=>{ a[c.type]=(a[c.type]||0)+1; return a; },{});
  const followUps      = contacts.flatMap(c=>(c.interactions||[]).filter(i=>i.followUp&&new Date(i.followUp)>=new Date()).map(i=>({...i,company:c.company,contactId:c.id})));

  // ── Fixture Form ──
  const FixFormModal=()=>{
    const [f,setF]=useState(fixForm||EMPTY_FIX);
    if(!fixForm) return null;
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const isTC=f.type==="Time Charter"||f.type==="Spot TC";
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setFixForm(null)}>
        <div style={{background:"#fff",borderRadius:18,width:620,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 70px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"#1a2b4a",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{f.id?"Fixture bewerken":"Nieuwe fixture"}</div>
            <button onClick={()=>setFixForm(null)} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:20}}>✕</button>
          </div>
          <div style={{padding:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <Field label="Schip"><Sel value={f.vessel} onChange={v=>s("vessel",v)} options={["",...VNAMES]}/></Field>
              <Field label="Type"><Sel value={f.type} onChange={v=>s("type",v)} options={FIX_TYPES}/></Field>
              <Field label="Stage"><Sel value={f.stage} onChange={v=>s("stage",v)} options={FIX_STAGES.map(x=>({v:x.key,l:x.label}))}/></Field>
              <Field label="Datum"><Inp type="date" value={f.addedDate} onChange={v=>s("addedDate",v)}/></Field>
            </div>
            {/* CRM pickers */}
            <div style={{background:"#eff6ff",border:"1px solid #bae6fd",borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:12,color:"#1e4d8c",marginBottom:10}}>🔗 Koppel aan CRM contacten</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                <ContactPicker label="Charterer (CRM)" contactId={f.chartererContactId} onChange={v=>s("chartererContactId",v)} contacts={contacts} filterType="charterer"/>
                <ContactPicker label="Broker (CRM)" contactId={f.brokerContactId} onChange={v=>s("brokerContactId",v)} contacts={contacts} filterType="broker"/>
              </div>
              <div style={{fontSize:11,color:"#5a6a82",marginTop:4}}>Of vul vrij in als het contact nog niet in de CRM staat:</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px",marginTop:8}}>
                <Field label="Charterer (vrij)"><Inp value={f.charterer} onChange={v=>s("charterer",v)} placeholder="bijv. Cargill"/></Field>
                <Field label="Broker (vrij)"><Inp value={f.broker} onChange={v=>s("broker",v)} placeholder="bijv. Braemar"/></Field>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <Field label="Cargo"><Sel value={f.cargo} onChange={v=>s("cargo",v)} options={["",...CARGO_TYPES]}/></Field>
              <Field label="Hoeveelheid (mt)"><Inp type="number" value={f.quantity} onChange={v=>s("quantity",v)}/></Field>
              {!isTC&&<><Field label="Laadplaats"><Inp value={f.loadport} onChange={v=>s("loadport",v)}/></Field><Field label="Losplaats"><Inp value={f.dischport} onChange={v=>s("dischport",v)}/></Field><Field label="Laycan"><Inp value={f.laycan} onChange={v=>s("laycan",v)} placeholder="bijv. 01-10 Jun"/></Field><Field label="Vracht (USD/mt)"><Inp type="number" value={f.freight} onChange={v=>s("freight",v)}/></Field></>}
              {isTC&&<><Field label="TC Rate (USD/day)"><Inp type="number" value={f.tcRate} onChange={v=>s("tcRate",v)}/></Field><Field label="Duur"><Inp value={f.duration} onChange={v=>s("duration",v)}/></Field><Field label="Laycan / Delivery" span2><Inp value={f.laycan} onChange={v=>s("laycan",v)}/></Field></>}
              <Field label="Commissie (%)"><Inp type="number" value={f.commission} onChange={v=>s("commission",v)}/></Field>
              <Field label="Notities" span2><textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} rows={2} style={{...FS,resize:"vertical",fontFamily:"inherit"}}/></Field>
            </div>
            {f.stage!=="fixed"&&<div style={{fontSize:11,color:"#1e6fba",background:"#dbeafe",padding:"6px 10px",borderRadius:6,marginTop:4}}>💡 Zet op "Fixed" om automatisch een voyage aan te maken</div>}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>{if(!f.vessel||(!f.charterer&&!f.chartererContactId)) return alert("Vul schip en charterer in."); saveFix({...f,id:f.id||genId()});}} style={{flex:1,padding:"9px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Opslaan</button>
              <button onClick={()=>setFixForm(null)} style={{flex:1,padding:"9px 0",background:"#f3f4f6",color:"#374151",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Voyage Form ──
  const VoyageModal=()=>{
    const [v,setV]=useState(voyForm||EMPTY_VOY);
    if(!voyForm) return null;
    const s=(k,val)=>setV(x=>({...x,[k]:val}));
    const tabs=[{key:"general",label:"Algemeen"},{key:"portcalls",label:`Port calls (${(v.portCalls||[]).length})`},{key:"bunkers",label:`Bunkers (${(v.bunkers||[]).length})`},{key:"costs",label:`Kosten (${(v.costs||[]).length})`},{key:"pnl",label:"P&L"}];
    const linkedFix=v.fixtureId?fixtures.find(f=>f.id===v.fixtureId):null;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setVoyForm(null)}>
        <div style={{background:"#fff",borderRadius:18,width:720,maxWidth:"96vw",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 70px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"#1a2b4a",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{v.id?"Voyage bewerken":"Nieuwe voyage"}</div>{linkedFix&&<div style={{fontSize:11,color:"#5a6a82",marginTop:1}}>📋 Vanuit fixture: {linkedFix.charterer||"—"} · {linkedFix.cargo||""}</div>}</div>
            <div style={{display:"flex",gap:8}}>{v.id&&<button onClick={()=>deleteVoyage(v.id)} style={{padding:"4px 10px",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Verwijderen</button>}<button onClick={()=>setVoyForm(null)} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:20}}>✕</button></div>
          </div>
          <div style={{display:"flex",gap:2,padding:"8px 20px 0",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
            {tabs.map(t=><button key={t.key} onClick={()=>setVoyTab(t.key)} style={{padding:"5px 12px",border:"none",borderRadius:"7px 7px 0 0",fontSize:11,fontWeight:600,cursor:"pointer",background:voyTab===t.key?"#fff":"transparent",color:voyTab===t.key?"#1a2b4a":"#9ca3af",borderBottom:voyTab===t.key?"2px solid #0ea5e9":"2px solid transparent"}}>{t.label}</button>)}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
            {voyTab==="general"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                <Field label="Schip"><Sel value={v.vesselName} onChange={val=>s("vesselName",val)} options={["",...VNAMES]}/></Field>
                <Field label="Voyage nr."><Inp value={v.voyageNo} onChange={val=>s("voyageNo",val)} placeholder="bijv. KES-2501"/></Field>
                <Field label="Status"><Sel value={v.status} onChange={val=>s("status",val)} options={VOY_STATUSES.map(x=>({v:x.key,l:x.label}))}/></Field>
                {/* CRM pickers */}
                <div style={{gridColumn:"span 2",background:"#eff6ff",border:"1px solid #bae6fd",borderRadius:10,padding:14,marginBottom:4}}>
                  <div style={{fontWeight:700,fontSize:12,color:"#1e4d8c",marginBottom:10}}>🔗 Koppel aan CRM contacten</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}>
                    <ContactPicker label="Charterer (CRM)" contactId={v.chartererContactId} onChange={val=>s("chartererContactId",val)} contacts={contacts} filterType="charterer"/>
                    <ContactPicker label="Broker (CRM)" contactId={v.brokerContactId} onChange={val=>s("brokerContactId",val)} contacts={contacts} filterType="broker"/>
                    <ContactPicker label="Agent (CRM)" contactId={v.agentContactId} onChange={val=>s("agentContactId",val)} contacts={contacts} filterType="agent"/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",marginTop:4}}>
                    <Field label="Charterer (vrij)"><Inp value={v.charterer} onChange={val=>s("charterer",val)}/></Field>
                    <Field label="Broker (vrij)"><Inp value={v.broker} onChange={val=>s("broker",val)}/></Field>
                    <Field label="Agent (vrij)"><Inp value={v.agent} onChange={val=>s("agent",val)}/></Field>
                  </div>
                </div>
                <Field label="Cargo"><Sel value={v.cargoType} onChange={val=>s("cargoType",val)} options={["",...CARGO_TYPES]}/></Field>
                <Field label="Hoeveelheid (mt)"><Inp type="number" value={v.cargoQty} onChange={val=>s("cargoQty",val)}/></Field>
                <Field label="Laadplaats"><Inp value={v.loadport} onChange={val=>s("loadport",val)}/></Field>
                <Field label="Losplaats"><Inp value={v.dischport} onChange={val=>s("dischport",val)}/></Field>
                <Field label="ETD"><Inp type="date" value={v.etd} onChange={val=>s("etd",val)}/></Field>
                <Field label="ETA"><Inp type="date" value={v.eta} onChange={val=>s("eta",val)}/></Field>
                <Field label="Vracht type"><Sel value={v.freightType} onChange={val=>s("freightType",val)} options={[{v:"per_mt",l:"Per MT"},{v:"lumpsum",l:"Lumpsum"}]}/></Field>
                {v.freightType==="per_mt"?<Field label="Rate (USD/mt)"><Inp type="number" value={v.freightRate} onChange={val=>s("freightRate",val)}/></Field>:<Field label="Lumpsum (USD)"><Inp type="number" value={v.freightLumpsum} onChange={val=>s("freightLumpsum",val)}/></Field>}
                <Field label="Commissie (%)"><Inp type="number" value={v.commission} onChange={val=>s("commission",val)}/></Field>
                <Field label="Demurrage (USD)"><Inp type="number" value={v.demurrage} onChange={val=>s("demurrage",val)}/></Field>
                <Field label="Notities" span2><textarea value={v.notes||""} onChange={e=>s("notes",e.target.value)} rows={2} style={{...FS,resize:"vertical",fontFamily:"inherit"}}/></Field>
              </div>
            )}
            {voyTab==="portcalls"&&<PortCallsTab portCalls={v.portCalls||[]} onChange={val=>s("portCalls",val)}/>}
            {voyTab==="bunkers"&&<BunkersTab bunkers={v.bunkers||[]} onChange={val=>s("bunkers",val)}/>}
            {voyTab==="costs"&&<CostsTab costs={v.costs||[]} onChange={val=>s("costs",val)}/>}
            {voyTab==="pnl"&&<PnLPanel v={v}/>}
          </div>
          <div style={{padding:"12px 20px",borderTop:"1px solid #e5e7eb",display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>{if(!v.vesselName) return alert("Selecteer een schip."); saveVoyage({...v,id:v.id||genId()});}} style={{flex:1,padding:"9px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Opslaan</button>
            <button onClick={()=>setVoyForm(null)} style={{flex:1,padding:"9px 0",background:"#f3f4f6",color:"#374151",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
          </div>
        </div>
      </div>
    );
  };

  // ── CRM Form ──
  const CrmFormModal=()=>{
    const [f,setF]=useState(crmForm||EMPTY_CON);
    if(!crmForm) return null;
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const toggle=(key,val)=>{ const arr=f[key]||[]; s(key,arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]); };
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setCrmForm(null)}>
        <div style={{background:"#fff",borderRadius:18,width:640,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 70px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"#1a2b4a",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{f.id?"Contact bewerken":"Nieuw contact"}</div>
            <button onClick={()=>setCrmForm(null)} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:20}}>✕</button>
          </div>
          <div style={{padding:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <Field label="Type"><Sel value={f.type} onChange={v=>s("type",v)} options={CRM_TYPES.map(t=>({v:t.key,l:`${t.icon} ${t.label}`}))}/></Field>
              <Field label="Bedrijfsnaam"><Inp value={f.company} onChange={v=>s("company",v)} placeholder="bijv. Cargill BV"/></Field>
              <Field label="Contactpersoon"><Inp value={f.contactName} onChange={v=>s("contactName",v)}/></Field>
              <Field label="E-mail"><Inp type="email" value={f.email} onChange={v=>s("email",v)}/></Field>
              <Field label="Telefoon"><Inp value={f.phone} onChange={v=>s("phone",v)}/></Field>
              <Field label="Website"><Inp value={f.website} onChange={v=>s("website",v)}/></Field>
              <Field label="Regio"><Sel value={f.region} onChange={v=>s("region",v)} options={["",...REGIONS]}/></Field>
              <Field label="Rating"><div style={{paddingTop:6}}><Stars rating={f.rating} onChange={v=>s("rating",v)}/></div></Field>
              <Field label="Adres" span2><Inp value={f.address} onChange={v=>s("address",v)}/></Field>
              <Field label="Cargo types" span2>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:2}}>
                  {CARGO_TYPES.map(c=><button key={c} onClick={()=>toggle("cargoTypes",c)} style={{padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:(f.cargoTypes||[]).includes(c)?"#1e6fba":"#f3f4f6",color:(f.cargoTypes||[]).includes(c)?"#fff":"#6b7280",border:(f.cargoTypes||[]).includes(c)?"1px solid #0ea5e9":"1px solid #e5e7eb"}}>{c}</button>)}
                </div>
              </Field>
              <Field label="Gekoppelde schepen" span2>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:2}}>
                  {activeVNames.map(v=><button key={v} onClick={()=>toggle("vessels",v)} style={{padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:(f.vessels||[]).includes(v)?"#10b981":"#f3f4f6",color:(f.vessels||[]).includes(v)?"#fff":"#6b7280",border:(f.vessels||[]).includes(v)?"1px solid #10b981":"1px solid #e5e7eb"}}>{v.replace("Grona ","")}</button>)}
                </div>
              </Field>
              <Field label="Tags" span2><Inp value={f.tags} onChange={v=>s("tags",v)} placeholder="bijv. preferred, spot, grain-specialist"/></Field>
              <Field label="Notities" span2><textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} rows={3} style={{...FS,resize:"vertical",fontFamily:"inherit"}}/></Field>
            </div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>{if(!f.company) return alert("Vul bedrijfsnaam in."); saveContact({...f,id:f.id||genId()});}} style={{flex:1,padding:"9px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Opslaan</button>
              <button onClick={()=>setCrmForm(null)} style={{flex:1,padding:"9px 0",background:"#f3f4f6",color:"#374151",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── CRM Detail ──
  const CrmDetailModal=()=>{
    const [tab,setTab]=useState(crmTab||"info");
    const [intForm,setIntForm]=useState({date:new Date().toISOString().split("T")[0],type:"Email",subject:"",notes:"",vessel:"",followUp:""});
    if(!crmDetail) return null;
    const c=crmDetail;
    const cfg=CRM_TYPES.find(t=>t.key===c.type)||CRM_TYPES[4];
    const tags=c.tags?c.tags.split(",").map(t=>t.trim()).filter(Boolean):[];
    const linkedFix=fixtures.filter(f=>f.chartererContactId===c.id||f.brokerContactId===c.id);
    const linkedVoy=voyages.filter(v=>v.chartererContactId===c.id||v.brokerContactId===c.id||v.agentContactId===c.id);
    const addInteraction=()=>{
      if(!intForm.subject) return;
      const updated={...c,interactions:[{id:genId(),...intForm},...(c.interactions||[])]};
      saveContact(updated);setCrmDetail(updated);
      setIntForm({date:new Date().toISOString().split("T")[0],type:"Email",subject:"",notes:"",vessel:"",followUp:""});
    };
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setCrmDetail(null)}>
        <div style={{background:"#fff",borderRadius:20,width:660,maxWidth:"96vw",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"#1a2b4a",borderRadius:"20px 20px 0 0",padding:"16px 22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:9,background:cfg.bg,border:`2px solid ${cfg.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{cfg.icon}</div>
                <div><div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{c.company}</div><div style={{fontSize:11,color:"#5a6a82",marginTop:1}}>{c.contactName||""}{c.region?` · ${c.region}`:""}</div></div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><CrmBadge type={c.type}/><button onClick={()=>setCrmDetail(null)} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:22,lineHeight:1}}>✕</button></div>
            </div>
            {c.rating>0&&<div style={{marginTop:8}}><Stars rating={c.rating}/></div>}
          </div>
          <div style={{display:"flex",gap:2,padding:"8px 22px 0",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
            {[["info","Info"],["interactions",`Interacties (${(c.interactions||[]).length})`],["fixtures",`Fixtures (${linkedFix.length})`],["voyages",`Voyages (${linkedVoy.length})`]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{padding:"6px 13px",border:"none",borderRadius:"7px 7px 0 0",fontSize:11,fontWeight:600,cursor:"pointer",background:tab===k?"#fff":"transparent",color:tab===k?"#1a2b4a":"#9ca3af",borderBottom:tab===k?"2px solid #0ea5e9":"2px solid transparent"}}>{l}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:20}}>
            {tab==="info"&&<>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
                {[["✉ E-mail",c.email?<a href={`mailto:${c.email}`} style={{color:"#1e6fba",textDecoration:"none"}}>{c.email}</a>:"—"],["📞 Telefoon",c.phone?<a href={`tel:${c.phone}`} style={{color:"#1e6fba",textDecoration:"none"}}>{c.phone}</a>:"—"],["🌍 Regio",c.region||"—"],["🌐 Website",c.website?<a href={`https://${c.website.replace("https://","")}`} target="_blank" rel="noreferrer" style={{color:"#1e6fba",textDecoration:"none"}}>{c.website}</a>:"—"],["📍 Adres",c.address||"—",true]].map(([l,v,span])=>(
                  <div key={l} style={{background:"#f4f7fb",borderRadius:9,padding:"9px 12px",border:"1px solid #e2e8f0",gridColumn:span?"span 2":"span 1"}}>
                    <div style={{fontSize:10,color:"#94a3b8",marginBottom:2,fontWeight:600}}>{l}</div>
                    <div style={{fontSize:12,color:"#1a2b4a",fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>
              {(c.cargoTypes||[]).length>0&&<div style={{marginBottom:12}}><div style={LS}>Cargo types</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{c.cargoTypes.map(x=><span key={x} style={{fontSize:11,padding:"2px 9px",background:"#dbeafe",color:"#1e4d8c",borderRadius:20,fontWeight:600}}>{x}</span>)}</div></div>}
              {(c.vessels||[]).length>0&&<div style={{marginBottom:12}}><div style={LS}>Gekoppelde schepen</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{c.vessels.map(v=><span key={v} style={{fontSize:11,padding:"2px 9px",background:"#d1fae5",color:"#065f46",borderRadius:20,fontWeight:600}}>🚢 {v.replace("Grona ","")}</span>)}</div></div>}
              {tags.length>0&&<div style={{marginBottom:12}}><div style={LS}>Tags</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{tags.map(t=><span key={t} style={{fontSize:11,padding:"2px 9px",background:"#f3f4f6",color:"#374151",borderRadius:20}}>#{t}</span>)}</div></div>}
              {c.notes&&<div style={{background:"#fefce8",border:"1px solid #fde68a",borderRadius:9,padding:12,marginBottom:12}}><div style={{fontSize:10,color:"#92400e",fontWeight:600,marginBottom:4,textTransform:"uppercase"}}>Notities</div><div style={{fontSize:12,color:"#78350f",lineHeight:1.6}}>{c.notes}</div></div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setCrmForm(c);setCrmDetail(null);}} style={{flex:2,padding:"8px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>✏ Bewerken</button>
                <button onClick={()=>deleteContact(c.id)} style={{flex:1,padding:"8px 0",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Verwijderen</button>
              </div>
            </>}

            {tab==="interactions"&&<>
              <div style={{background:"#f4f7fb",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #e2e8f0"}}>
                <div style={{fontWeight:700,fontSize:12,color:"#374151",marginBottom:10}}>+ Nieuwe interactie</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                  <div><label style={LS}>Type</label><select value={intForm.type} onChange={e=>setIntForm(f=>({...f,type:e.target.value}))} style={{...FS,fontSize:12,padding:"7px 9px"}}>  {["Email","Call","Meeting","Visit","Other"].map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label style={LS}>Datum</label><input type="date" value={intForm.date} onChange={e=>setIntForm(f=>({...f,date:e.target.value}))} style={{...FS,fontSize:12,padding:"7px 9px"}}/></div>
                  <div><label style={LS}>Schip</label><select value={intForm.vessel} onChange={e=>setIntForm(f=>({...f,vessel:e.target.value}))} style={{...FS,fontSize:12,padding:"7px 9px"}}><option value="">— optioneel —</option>{activeVNames.map(v=><option key={v}>{v}</option>)}</select></div>
                </div>
                <div style={{marginBottom:8}}><label style={LS}>Onderwerp</label><input value={intForm.subject} onChange={e=>setIntForm(f=>({...f,subject:e.target.value}))} placeholder="bijv. Offer grain cargo Rotterdam" style={{...FS,fontSize:12}}/></div>
                <div style={{marginBottom:8}}><label style={LS}>Notities</label><textarea value={intForm.notes} onChange={e=>setIntForm(f=>({...f,notes:e.target.value}))} rows={2} style={{...FS,fontSize:12,resize:"vertical",fontFamily:"inherit"}}/></div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  <div style={{flex:1}}><label style={LS}>Follow-up datum</label><input type="date" value={intForm.followUp} onChange={e=>setIntForm(f=>({...f,followUp:e.target.value}))} style={{...FS,fontSize:12}}/></div>
                  <button onClick={addInteraction} style={{padding:"8px 20px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12,whiteSpace:"nowrap"}}>Opslaan</button>
                </div>
              </div>
              {(c.interactions||[]).length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"14px 0"}}>Nog geen interacties</div>}
              {(c.interactions||[]).map((item,i)=>(
                <div key={item.id||i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:"1px solid #f3f4f6"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                    {{"Email":"✉","Call":"📞","Meeting":"🤝","Visit":"🏢","Other":"📝"}[item.type]||"📝"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontWeight:600,fontSize:12,color:"#1a2b4a"}}>{item.subject}</div><div style={{fontSize:10,color:"#9ca3af"}}>{fmtDate(item.date)}</div></div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>{item.type}{item.vessel?` · ${item.vessel}`:""}</div>
                    {item.notes&&<div style={{fontSize:11,color:"#374151",marginTop:3,lineHeight:1.5}}>{item.notes}</div>}
                    {item.followUp&&<div style={{fontSize:10,background:"#fef3c7",color:"#92400e",padding:"2px 7px",borderRadius:5,display:"inline-block",marginTop:3,fontWeight:600}}>📅 Follow-up: {fmtDate(item.followUp)}</div>}
                  </div>
                  <button onClick={()=>{ const updated={...c,interactions:(c.interactions||[]).filter(x=>x.id!==item.id)}; saveContact(updated); setCrmDetail(updated); }} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:12,alignSelf:"flex-start"}}>✕</button>
                </div>
              ))}
            </>}

            {tab==="fixtures"&&<>
              {linkedFix.length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"20px 0"}}>Geen gekoppelde fixtures</div>}
              {linkedFix.map(f=>(
                <div key={f.id} onClick={()=>{setCrmDetail(null);setFixDetail(f);setPage("fixtures");}} style={{background:"#f4f7fb",borderRadius:9,padding:"11px 14px",marginBottom:8,cursor:"pointer",border:"1px solid #e2e8f0",transition:"all 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#dbeafe"}
                  onMouseLeave={e=>e.currentTarget.style.background="#f4f7fb"}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>{f.vessel}</div><StageBadge stage={f.stage} small/></div>
                  <div style={{fontSize:11,color:"#6b7280"}}>{f.type} · {f.cargo||"—"}{f.quantity?` · ${fmtNum(f.quantity)} mt`:""} · {f.laycan||"—"}</div>
                  <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{fmtDate(f.addedDate)}</div>
                </div>
              ))}
            </>}

            {tab==="voyages"&&<>
              {linkedVoy.length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"20px 0"}}>Geen gekoppelde voyages</div>}
              {linkedVoy.map(v=>(
                <div key={v.id} onClick={()=>{setCrmDetail(null);setVoyForm(v);setVoyTab("general");setPage("voyages");}} style={{background:"#f4f7fb",borderRadius:9,padding:"11px 14px",marginBottom:8,cursor:"pointer",border:"1px solid #e2e8f0",transition:"all 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#d1fae5"}
                  onMouseLeave={e=>e.currentTarget.style.background="#f4f7fb"}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>{v.vesselName} · {v.voyageNo||"—"}</div><VoyBadge status={v.status} small/></div>
                  <div style={{fontSize:11,color:"#6b7280"}}>{v.cargoType||"—"}{v.cargoQty?` · ${fmtNum(v.cargoQty)} mt`:""} · {v.loadport||"?"} → {v.dischport||"?"}</div>
                  <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>ETA: {fmtDate(v.eta)}</div>
                </div>
              ))}
            </>}
          </div>
        </div>
      </div>
    );
  };

  // ── PAGES ──────────────────────────────────────────────────────────────────

  const DashboardPage=()=>(
    <div style={{padding:"18px 22px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:18}}>
        <KPI label="Fleet" value={activeVessels.length} sub={co.name} accent={co.color}/>
        <KPI label="Active voyages" value={activeVoyages} sub="voyages underway" accent="#10b981"/>
        <KPI label="Pipeline" value={fixtures.length} sub={inNego+" nego · "+fixedFixtures+" fixed"} accent="#f59e0b"/>
        <KPI label="CRM contacts" value={contacts.length} sub={(cTypeCounts["charterer"]||0)+" charterers · "+(cTypeCounts["broker"]||0)+" brokers"} accent="#8b5cf6"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
        <div>
          {activeVessels.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:"#9ca3af"}}><div style={{fontSize:36,marginBottom:10}}>⚓</div><div style={{fontSize:14,fontWeight:600,color:"#374151",marginBottom:5}}>No vessels in fleet yet</div><div style={{fontSize:12}}>Add vessels via the Fleet tab</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11}}>
            {activeVessels.map(vessel=>{
              const ops=vesselOps[vessel.id]||{};
              const cfg=VSTATUS_CFG[ops.status]||VSTATUS_CFG["Idle"];
              const activeVoy=voyages.find(v=>v.vesselName===vessel.name&&v.status==="active");
              const activeFix=fixtures.find(f=>f.vessel===vessel.name&&!["fixed","failed"].includes(f.stage));
              const chartCon=ops.chartererContactId?contacts.find(c=>c.id===ops.chartererContactId):null;
              return(
                <div key={vessel.id} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"13px 15px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:cfg.color,borderRadius:"12px 12px 0 0"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                    <div><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>{vessel.name}</div><div style={{fontSize:10,color:"#9ca3af"}}>IMO {vessel.imo} · {vessel.dwt.toLocaleString()} DWT</div></div>
                    <VStatBadge status={ops.status||"Idle"} small/>
                  </div>
                  <div style={{display:"flex",gap:4,marginBottom:7}}>
                    <span style={{fontSize:10,padding:"2px 6px",background:"#f3f4f6",borderRadius:4,color:"#374151",fontWeight:500}}>{vessel.dwt.toLocaleString()} DWT</span>
                    <span style={{fontSize:10,padding:"2px 6px",background:vessel.geared?"#ecfdf5":"#f4f7fb",borderRadius:4,color:vessel.geared?"#059669":"#6b7280",fontWeight:500}}>{vessel.geared?"⚙ "+vessel.cranes:"Ungeared"}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 0",fontSize:11,marginBottom:7}}>
                    <div><span style={{color:"#9ca3af"}}>Position: </span><span style={{fontWeight:500}}>{ops.position||"—"}</span></div>
                    <div><span style={{color:"#9ca3af"}}>Cargo: </span><span style={{fontWeight:500}}>{ops.cargo||"—"}</span></div>
                    <div><span style={{color:"#9ca3af"}}>Charterer: </span><span style={{fontWeight:500}}>{ops.charterer||"—"}</span></div>
                    <div><span style={{color:"#9ca3af"}}>ETA: </span><span style={{fontWeight:500}}>{ops.eta||"—"}</span></div>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>
                    {activeVoy&&<button onClick={()=>{setVoyForm(activeVoy);setVoyTab("general");setPage("voyages");}} style={{fontSize:10,padding:"2px 7px",background:"#d1fae5",color:"#065f46",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>🚢 {activeVoy.voyageNo}</button>}
                    {activeFix&&<button onClick={()=>{setFixDetail(activeFix);setPage("fixtures");}} style={{fontSize:10,padding:"2px 7px",background:"#ede9fe",color:"#6d28d9",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>📋 {activeFix.stage}</button>}
                    {chartCon&&<button onClick={()=>navToCrm(chartCon)} style={{fontSize:10,padding:"2px 7px",background:"#dbeafe",color:"#1e4d8c",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>🏭 {chartCon.company}</button>}
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>setEditVessel(vessel)} style={{flex:1,padding:"5px 0",background:"#f4f7fb",color:"#374151",border:"1px solid #e5e7eb",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer"}}>✏ Edit</button>
                    <button onClick={()=>setAisVessel(vessel)} style={{flex:1,padding:"5px 0",background:"#1a2b4a",color:"#93c5fd",border:"none",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer"}}>🛰 AIS</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1a2b4a",marginBottom:11}}>Fleet status</div>
            {Object.entries(VSTATUS_CFG).map(([key,cfg])=>(
              <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:cfg.color}}/><span style={{fontSize:12,color:"#374151"}}>{cfg.label}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:48,height:3,background:"#f3f4f6",borderRadius:2,overflow:"hidden"}}><div style={{width:((vStatCounts[key]||0)/Math.max(activeVessels.length,1))*100+"%",height:"100%",background:cfg.color,borderRadius:2}}/></div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1a2b4a",minWidth:14,textAlign:"right"}}>{vStatCounts[key]||0}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>Pipeline</div><button onClick={()=>setPage("fixtures")} style={{fontSize:11,color:"#1e6fba",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>All →</button></div>
            {FIX_STAGES.map(s=>{ const cnt=fixtures.filter(f=>f.stage===s.key).length; return <div key={s.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:s.color}}/><span style={{fontSize:12,color:"#374151"}}>{s.label}</span></div><span style={{fontSize:12,fontWeight:700,color:cnt>0?s.color:"#d1d5db"}}>{cnt}</span></div>; })}
          </div>
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>Recent voyages</div><button onClick={()=>setPage("voyages")} style={{fontSize:11,color:"#1e6fba",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>All →</button></div>
            {voyages.slice(-4).reverse().map(v=>{ const cfg2=VOY_STATUSES.find(s=>s.key===v.status)||VOY_STATUSES[0]; return <div key={v.id} onClick={()=>{setVoyForm(v);setVoyTab("general");setPage("voyages");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f3f4f6",cursor:"pointer",fontSize:12}}><div><div style={{fontWeight:600,color:"#1a2b4a"}}>{v.vesselName.replace("Grona ","")}</div><div style={{fontSize:10,color:"#9ca3af"}}>{v.voyageNo} · {v.charterer||"—"}</div></div><VoyBadge status={v.status} small/></div>; })}
            {voyages.length===0&&<div style={{color:"#9ca3af",fontSize:12,textAlign:"center",padding:"8px 0"}}>No voyages</div>}
          </div>
          {followUps.length>0&&<div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#92400e",marginBottom:8}}>📅 Follow-ups ({followUps.length})</div>
            {followUps.slice(0,4).map((f,i)=><div key={i} onClick={()=>{const c=contacts.find(x=>x.id===f.contactId); if(c){navToCrm(c);}}} style={{fontSize:11,padding:"4px 0",borderBottom:"1px solid #fde68a",cursor:"pointer"}}><span style={{fontWeight:600,color:"#78350f"}}>{f.company}</span><span style={{color:"#92400e"}}> · {f.subject}</span><div style={{fontSize:10,color:"#b45309"}}>{fmtDate(f.followUp)}</div></div>)}
          </div>}
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",flex:1}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1a2b4a",marginBottom:11}}>Activity</div>
            {actLog.length===0&&<div style={{color:"#9ca3af",fontSize:12}}>No activity yet</div>}
            {actLog.slice().reverse().slice(0,7).map((e,i)=>(
              <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:6,fontSize:11}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#1e6fba",marginTop:4,flexShrink:0}}/>
                <div><span style={{color:"#374151"}}>{e.msg}</span><span style={{color:"#9ca3af",marginLeft:5,fontSize:10}}>{e.time}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const FixturePage=()=>(
    <div style={{padding:"18px 22px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
        <KPI label="Totaal pipeline" value={fixtures.length} sub="alle fixtures" accent="#1a2b4a"/>
        <KPI label="In onderhandeling" value={inNego} sub="negotiation + on subs" accent="#f59e0b"/>
        <KPI label="Gefixed" value={fixedFixtures} sub="bevestigde fixtures" accent="#10b981"/>
        <KPI label="Voyages aangemaakt" value={voyages.filter(v=>v.fixtureId).length} sub="vanuit fixture pipeline" accent="#8b5cf6"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={fSearch} onChange={e=>setFSearch(e.target.value)} placeholder="Zoek op schip, charterer, cargo..." style={{padding:"7px 11px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,width:230}}/>
        <select value={fVessel} onChange={e=>setFVessel(e.target.value)} style={{padding:"7px 10px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"}}><option value="All">All vessels</option>{activeVNames.map(v=><option key={v}>{v}</option>)}</select>
      </div>
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12}}>
        {FIX_STAGES.map(stage=>{
          const cards=filteredFix.filter(f=>f.stage===stage.key);
          return(
            <div key={stage.key} style={{flex:"0 0 250px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,padding:"7px 11px",background:stage.bg,borderRadius:8,border:`1px solid ${stage.color}33`}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:stage.color}}/><span style={{fontWeight:700,fontSize:12,color:stage.color}}>{stage.label}</span><span style={{fontSize:10,background:stage.color,color:"#fff",borderRadius:20,padding:"1px 6px",fontWeight:600}}>{cards.length}</span></div>
                {stage.key!=="failed"&&<button onClick={()=>setFixForm({...EMPTY_FIX,stage:stage.key})} style={{background:stage.color,color:"#fff",border:"none",borderRadius:5,width:19,height:19,fontSize:13,cursor:"pointer",lineHeight:1}}>+</button>}
              </div>
              {cards.length===0&&<div style={{color:"#d1d5db",fontSize:11,textAlign:"center",padding:"12px 0"}}>Geen fixtures</div>}
              {cards.map(f=>{
                const linkedVoy=f.voyageId?voyages.find(v=>v.id===f.voyageId):null;
                const charCon=f.chartererContactId?contacts.find(c=>c.id===f.chartererContactId):null;
                const brkCon=f.brokerContactId?contacts.find(c=>c.id===f.brokerContactId):null;
                return(
                  <div key={f.id} onClick={()=>setFixDetail(f)} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"11px 13px",cursor:"pointer",borderLeft:`4px solid ${stage.color}`,marginBottom:8,transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 3px 10px ${stage.color}22`;}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div><div style={{fontWeight:700,fontSize:12,color:"#1a2b4a"}}>{f.vessel}</div><div style={{fontSize:10,color:"#9ca3af"}}>{f.type} · {f.charterer||"—"}</div></div><StageBadge stage={f.stage} small/></div>
                    <div style={{fontSize:11,color:"#374151",marginBottom:5}}>{f.cargo&&<span>{f.cargo}{f.quantity?` · ${fmtNum(f.quantity)} mt`:""}</span>}{f.laycan&&<span style={{color:"#9ca3af"}}> · {f.laycan}</span>}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {charCon&&<button onClick={e=>{e.stopPropagation();navToCrm(charCon);}} style={{fontSize:9,padding:"1px 6px",background:"#dbeafe",color:"#1e4d8c",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}}>🏭 {charCon.company}</button>}
                      {brkCon&&<button onClick={e=>{e.stopPropagation();navToCrm(brkCon);}} style={{fontSize:9,padding:"1px 6px",background:"#ede9fe",color:"#6d28d9",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}}>🤝 {brkCon.company}</button>}
                      {linkedVoy&&<span style={{fontSize:9,padding:"1px 6px",background:"#d1fae5",color:"#065f46",borderRadius:4,fontWeight:600}}>🚢 {linkedVoy.voyageNo}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  const VoyagePage=()=>(
    <div style={{padding:"18px 22px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
        <KPI label="Totaal voyages" value={voyages.length} sub="in het systeem" accent="#1a2b4a"/>
        <KPI label="Actief" value={activeVoyages} sub="voyages onderweg" accent="#10b981"/>
        <KPI label="Afgerond" value={voyages.filter(v=>v.status==="completed").length} sub="completed" accent="#1e6fba"/>
        <KPI label="Vanuit fixture" value={voyages.filter(v=>v.fixtureId).length} sub="automatisch aangemaakt" accent="#8b5cf6"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={vSearch} onChange={e=>setVSearch(e.target.value)} placeholder="Zoek op schip, voyage nr, charterer..." style={{padding:"7px 11px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,width:250}}/>
        <select value={vVessel} onChange={e=>setVVessel(e.target.value)} style={{padding:"7px 10px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"}}><option value="All">All vessels</option>{activeVNames.map(v=><option key={v}>{v}</option>)}</select>
        <select value={vStatus} onChange={e=>setVStatus(e.target.value)} style={{padding:"7px 10px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"}}><option value="All">Alle statussen</option>{VOY_STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select>
      </div>
      {filteredVoy.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#9ca3af"}}><div style={{fontSize:32,marginBottom:8}}>🚢</div><div style={{fontSize:14,fontWeight:600,color:"#374151",marginBottom:5}}>Nog geen voyages</div><div style={{fontSize:12,marginBottom:14}}>Zet een fixture op "Fixed" of maak er handmatig een aan.</div></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:13}}>
        {filteredVoy.map(v=>{
          const costs=(v.costs||[]).reduce((s,c)=>s+Number(c.amount||0),0);
          const bunk=(v.bunkers||[]).reduce((s,b)=>s+(b.qty&&b.price?Number(b.qty)*Number(b.price):0),0);
          let gf=0; if(v.freightType==="per_mt"&&v.freightRate&&v.cargoQty) gf=Number(v.freightRate)*Number(v.cargoQty); else if(v.freightLumpsum) gf=Number(v.freightLumpsum);
          const result=gf-costs-bunk;
          const cfg2=VOY_STATUSES.find(s=>s.key===v.status)||VOY_STATUSES[0];
          const linkedFix=v.fixtureId?fixtures.find(f=>f.id===v.fixtureId):null;
          const charCon=v.chartererContactId?contacts.find(c=>c.id===v.chartererContactId):null;
          const brkCon=v.brokerContactId?contacts.find(c=>c.id===v.brokerContactId):null;
          const ageCon=v.agentContactId?contacts.find(c=>c.id===v.agentContactId):null;
          return(
            <div key={v.id} onClick={()=>{setVoyForm(v);setVoyTab("general");}} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"13px 15px",cursor:"pointer",borderLeft:`4px solid ${cfg2.color}`,transition:"all 0.12s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 4px 14px ${cfg2.color}22`;e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>{v.vesselName}</div><div style={{fontSize:10,color:"#9ca3af"}}>{v.voyageNo||"—"} · {v.charterer||"—"}</div></div><VoyBadge status={v.status} small/></div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                {linkedFix&&<span style={{fontSize:9,padding:"1px 6px",background:"#ede9fe",color:"#6d28d9",borderRadius:4,fontWeight:600}}>📋 {linkedFix.charterer||"fixture"}</span>}
                {charCon&&<button onClick={e=>{e.stopPropagation();navToCrm(charCon);}} style={{fontSize:9,padding:"1px 6px",background:"#dbeafe",color:"#1e4d8c",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}}>🏭 {charCon.company}</button>}
                {brkCon&&<button onClick={e=>{e.stopPropagation();navToCrm(brkCon);}} style={{fontSize:9,padding:"1px 6px",background:"#ede9fe",color:"#6d28d9",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}}>🤝 {brkCon.company}</button>}
                {ageCon&&<button onClick={e=>{e.stopPropagation();navToCrm(ageCon);}} style={{fontSize:9,padding:"1px 6px",background:"#d1fae5",color:"#065f46",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}}>⚓ {ageCon.company}</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 0",fontSize:11,marginBottom:8}}>
                <div><span style={{color:"#9ca3af"}}>Cargo: </span><span style={{fontWeight:500}}>{v.cargoType||"—"}{v.cargoQty?` · ${fmtNum(v.cargoQty)} mt`:""}</span></div>
                <div><span style={{color:"#9ca3af"}}>Route: </span><span style={{fontWeight:500}}>{v.loadport||"?"} → {v.dischport||"?"}</span></div>
                <div><span style={{color:"#9ca3af"}}>ETA: </span><span>{fmtDate(v.eta)}</span></div>
                <div><span style={{color:"#9ca3af"}}>Port calls: </span><span style={{fontWeight:500}}>{(v.portCalls||[]).length}</span></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1,background:"#f4f7fb",borderRadius:6,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase"}}>Kosten</div><div style={{fontWeight:700,fontSize:12}}>${fmtNum(costs+bunk)}</div></div>
                <div style={{flex:1,background:result>=0&&gf>0?"#d1fae5":gf===0?"#f4f7fb":"#fee2e2",borderRadius:6,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase"}}>Resultaat</div><div style={{fontWeight:700,fontSize:12,color:gf===0?"#9ca3af":result>=0?"#059669":"#dc2626"}}>{gf>0?(result>=0?"+":"")+"$"+fmtNum(result):"—"}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CrmPage=()=>(
    <div style={{padding:"18px 22px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11,marginBottom:16}}>
        <KPI label="Totaal contacten" value={contacts.length} sub="in CRM" accent="#1a2b4a"/>
        {CRM_TYPES.slice(0,4).map(t=><KPI key={t.key} label={t.label+"s"} value={cTypeCounts[t.key]||0} sub={t.icon} accent={t.color}/>)}
      </div>
      {followUps.length>0&&<div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>📅</span>
        <div><div style={{fontWeight:700,fontSize:12,color:"#92400e"}}>Open follow-ups ({followUps.length})</div><div style={{fontSize:11,color:"#78350f",marginTop:1}}>{followUps.slice(0,3).map(f=>`${f.company}: ${f.subject} (${fmtDate(f.followUp)})`).join(" · ")}{followUps.length>3&&` · +${followUps.length-3} meer`}</div></div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16}}>
        <div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <input value={cSearch} onChange={e=>setCSearch(e.target.value)} placeholder="Zoek op naam, email, cargo, tag..." style={{padding:"7px 11px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,width:220}}/>
            <select value={cType} onChange={e=>setCType(e.target.value)} style={{padding:"7px 10px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,background:"#fff"}}><option value="All">Alle types</option>{CRM_TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}</select>
          </div>
          {contacts.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:"#9ca3af"}}><div style={{fontSize:36,marginBottom:10}}>👥</div><div style={{fontSize:14,fontWeight:600,color:"#374151",marginBottom:5}}>Nog geen contacten</div><div style={{fontSize:12,marginBottom:14}}>Voeg charterers, brokers en agents toe</div><button onClick={()=>setCrmForm({...EMPTY_CON})} style={{padding:"8px 20px",background:"#1e6fba",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>+ Eerste contact toevoegen</button></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:13}}>
            {filteredCrm.map(c=>{
              const cfg2=CRM_TYPES.find(t=>t.key===c.type)||CRM_TYPES[4];
              const lastInt=(c.interactions||[]).length>0?c.interactions[0]:null;
              const fu=(c.interactions||[]).filter(i=>i.followUp&&new Date(i.followUp)>=new Date());
              const linkedFix=fixtures.filter(f=>f.chartererContactId===c.id||f.brokerContactId===c.id).length;
              const linkedVoy=voyages.filter(v=>v.chartererContactId===c.id||v.brokerContactId===c.id||v.agentContactId===c.id).length;
              return(
                <div key={c.id} onClick={()=>{setCrmDetail(c);setCrmTab("info");}} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all 0.15s",position:"relative",overflow:"hidden"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=cfg2.color;e.currentTarget.style.boxShadow=`0 4px 14px ${cfg2.color}18`;e.currentTarget.style.transform="translateY(-1px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:cfg2.color,borderRadius:"12px 12px 0 0"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                    <div style={{display:"flex",gap:9,alignItems:"center"}}>
                      <div style={{width:34,height:34,borderRadius:7,background:cfg2.bg,border:`1.5px solid ${cfg2.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{cfg2.icon}</div>
                      <div><div style={{fontWeight:700,fontSize:13,color:"#1a2b4a"}}>{c.company}</div>{c.contactName&&<div style={{fontSize:10,color:"#9ca3af"}}>{c.contactName}</div>}</div>
                    </div>
                    <CrmBadge type={c.type} small/>
                  </div>
                  {c.rating>0&&<div style={{marginBottom:7}}><Stars rating={c.rating}/></div>}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 0",fontSize:11,marginBottom:8}}>
                    {c.region&&<div><span style={{color:"#9ca3af"}}>Regio: </span><span style={{fontWeight:500}}>{c.region}</span></div>}
                    {c.email&&<div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><span style={{color:"#9ca3af"}}>✉ </span><span style={{color:"#1e6fba",fontSize:10}}>{c.email}</span></div>}
                  </div>
                  {(c.cargoTypes||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>{c.cargoTypes.slice(0,3).map(x=><span key={x} style={{fontSize:9,padding:"2px 6px",background:"#dbeafe",color:"#1e4d8c",borderRadius:20,fontWeight:600}}>{x}</span>)}{c.cargoTypes.length>3&&<span style={{fontSize:9,color:"#9ca3af"}}>+{c.cargoTypes.length-3}</span>}</div>}
                  <div style={{borderTop:"1px solid #f3f4f6",paddingTop:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:10,color:"#9ca3af"}}>
                      {(c.interactions||[]).length} int.
                      {linkedFix>0&&<span style={{marginLeft:5,color:"#8b5cf6"}}>📋{linkedFix}</span>}
                      {linkedVoy>0&&<span style={{marginLeft:5,color:"#10b981"}}>🚢{linkedVoy}</span>}
                    </div>
                    {fu.length>0&&<span style={{fontSize:9,background:"#fef3c7",color:"#92400e",padding:"2px 6px",borderRadius:20,fontWeight:600}}>📅 {fu.length}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1a2b4a",marginBottom:11}}>Per type</div>
            {CRM_TYPES.map(t=>(
              <div key={t.key} onClick={()=>setCType(cType===t.key?"All":t.key)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,cursor:"pointer",padding:"3px 6px",borderRadius:5,background:cType===t.key?t.bg:"transparent"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{t.icon}</span><span style={{fontSize:12,color:"#374151"}}>{t.label}s</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:44,height:3,background:"#f3f4f6",borderRadius:2,overflow:"hidden"}}><div style={{width:contacts.length?`${((cTypeCounts[t.key]||0)/contacts.length)*100}%`:"0%",height:"100%",background:t.color,borderRadius:2}}/></div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1a2b4a",minWidth:14,textAlign:"right"}}>{cTypeCounts[t.key]||0}</span>
                </div>
              </div>
            ))}
          </div>
          {contacts.filter(c=>c.rating>=4).length>0&&<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1a2b4a",marginBottom:11}}>⭐ Top relaties</div>
            {contacts.filter(c=>c.rating>=4).sort((a,b)=>b.rating-a.rating).slice(0,5).map(c=>(
              <div key={c.id} onClick={()=>{setCrmDetail(c);setCrmTab("info");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f9fafb",cursor:"pointer",fontSize:12}}>
                <div><div style={{fontWeight:600,color:"#1a2b4a"}}>{c.company}</div><div style={{fontSize:10,color:"#9ca3af"}}>{CRM_TYPES.find(t=>t.key===c.type)?.label}</div></div>
                <Stars rating={c.rating}/>
              </div>
            ))}
          </div>}
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",flex:1}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1a2b4a",marginBottom:11}}>📅 Follow-ups</div>
            {followUps.length===0&&<div style={{color:"#9ca3af",fontSize:12}}>Geen open follow-ups</div>}
            {followUps.slice(0,5).map((f,i)=>(
              <div key={i} onClick={()=>{const c=contacts.find(x=>x.id===f.contactId); if(c){setCrmDetail(c);setCrmTab("interactions");}}} style={{padding:"6px 0",borderBottom:"1px solid #f3f4f6",fontSize:11,cursor:"pointer"}}>
                <div style={{fontWeight:600,color:"#1a2b4a"}}>{f.company}</div>
                <div style={{color:"#6b7280",fontSize:10,marginTop:1}}>{f.subject}</div>
                <div style={{fontSize:10,color:"#f59e0b",fontWeight:600,marginTop:1}}>📅 {fmtDate(f.followUp)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Vessel edit modal
  const VesselEditModal=()=>{
    const [form,setForm]=useState(editVessel?{...vesselOps[editVessel.id]}:{});
    if(!editVessel) return null;
    const s=(k,v)=>setForm(f=>({...f,[k]:v}));
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setEditVessel(null)}>
        <div style={{background:"#fff",borderRadius:18,width:520,maxWidth:"95vw",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 70px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"#1a2b4a",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{editVessel.name}</div><div style={{fontSize:11,color:"#5a6a82"}}>IMO {editVessel.imo} · {editVessel.dwt.toLocaleString()} DWT</div></div>
            <button onClick={()=>setEditVessel(null)} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:20}}>✕</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:18}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
              <Field label="Status"><Sel value={form.status} onChange={v=>s("status",v)} options={Object.keys(VSTATUS_CFG)}/></Field>
              <Field label="Positie / port"><Inp value={form.position} onChange={v=>s("position",v)} placeholder="bijv. Rotterdam"/></Field>
              <Field label="Voyage nr."><Inp value={form.voyageNo} onChange={v=>s("voyageNo",v)}/></Field>
              <Field label="Cargo"><Inp value={form.cargo} onChange={v=>s("cargo",v)}/></Field>
              <Field label="Charterer"><Inp value={form.charterer} onChange={v=>s("charterer",v)}/></Field>
              <Field label="TC Rate (USD/day)"><Inp type="number" value={form.tcRate} onChange={v=>s("tcRate",v)}/></Field>
              <Field label="ETA" span2><Inp type="date" value={form.eta} onChange={v=>s("eta",v)}/></Field>
            </div>
          </div>
          <div style={{padding:"12px 18px",borderTop:"1px solid #e5e7eb",display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>saveVesselOp(editVessel.id,form)} style={{flex:1,padding:"9px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Opslaan</button>
            <button onClick={()=>setEditVessel(null)} style={{flex:1,padding:"9px 0",background:"#f3f4f6",color:"#374151",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Charter vessel helpers ──
  const saveCharterVessel=(v)=>{
    const exists=charterVessels.find(x=>x.id===v.id);
    const updated=exists?charterVessels.map(x=>x.id===v.id?v:x):[...charterVessels,v];
    setCharterVessels(updated);
    persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,updated);
  };
  const deleteCharterVessel=(id)=>{
    const updated=charterVessels.filter(x=>x.id!==id);
    setCharterVessels(updated);
    persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,updated);
  };

  const EMPTY_CV={name:"",imo:"",mmsi:"",dwt:"",built:"",geared:false,cranes:"",holds:"",gt:"",flag:"Marshall Islands",hireRate:"",hireUnit:"day",ownerName:"",notes:""};

  function CharterVesselModal(){
    const [f,setF]=useState(cvForm||EMPTY_CV);
    if(!cvForm) return null;
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setCvForm(null)}>
      <div style={{background:"#fff",borderRadius:14,width:560,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1a2b4a",borderRadius:"14px 14px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{f.id?"Edit Vessel":"Add Charter Vessel"}</div>
          <button onClick={()=>setCvForm(null)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Vessel Name" span2><Inp value={f.name} onChange={v=>s("name",v)} placeholder="e.g. MV Pacific Star"/></Field>
            <Field label="IMO Number"><Inp value={f.imo} onChange={v=>s("imo",v)} placeholder="9123456"/></Field>
            <Field label="MMSI"><Inp value={f.mmsi} onChange={v=>s("mmsi",v)} placeholder="123456789"/></Field>
            <Field label="DWT (tonnes)"><Inp value={f.dwt} onChange={v=>s("dwt",v)} type="number"/></Field>
            <Field label="Year Built"><Inp value={f.built} onChange={v=>s("built",v)} type="number" placeholder="2010"/></Field>
            <Field label="No. of Holds"><Inp value={f.holds} onChange={v=>s("holds",v)} type="number"/></Field>
            <Field label="Gross Tonnage"><Inp value={f.gt} onChange={v=>s("gt",v)} type="number"/></Field>
            <Field label="Flag State"><Inp value={f.flag} onChange={v=>s("flag",v)} placeholder="Marshall Islands"/></Field>
            <Field label="Daily Hire Rate (USD)"><Inp value={f.hireRate} onChange={v=>s("hireRate",v)} type="number" placeholder="14500"/></Field>
            <Field label="Owner / Disponent Owner"><Inp value={f.ownerName} onChange={v=>s("ownerName",v)} placeholder="Shipowner name"/></Field>
            <Field label="Notes" span2>
              <textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} rows={3} style={{...FS,resize:"vertical",fontFamily:"inherit"}} placeholder="Charter party terms, remarks…"/>
            </Field>
            <div style={{gridColumn:"span 2",display:"flex",gap:10,alignItems:"center",padding:"10px 12px",background:"#f4f7fb",borderRadius:8,border:"1px solid #e5e7eb"}}>
              <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:12,fontWeight:600,color:"#374151"}}>
                <input type="checkbox" checked={f.geared||false} onChange={e=>s("geared",e.target.checked)} style={{width:16,height:16}}/>
                Vessel is geared (has own cranes)
              </label>
              {f.geared&&<div style={{flex:1}}><Inp value={f.cranes} onChange={v=>s("cranes",v)} placeholder="e.g. 2×25t"/></div>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>{if(!f.name)return alert("Vessel name required.");saveCharterVessel({...f,id:f.id||genId(),dwt:Number(f.dwt)||0,built:Number(f.built)||0,holds:Number(f.holds)||0,gt:Number(f.gt)||0});setCvForm(null);}} style={{flex:1,padding:"9px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Save Vessel</button>
            <button onClick={()=>setCvForm(null)} style={{flex:1,padding:"9px 0",background:"#f1f5f9",color:"#5a6a82",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>;
  }

  const FleetPage=()=>{
    const resetNTFleet=async()=>{
      const seed=VESSELS.map(v=>({...v,id:String(v.id),hireRate:"",hireUnit:"day",ownerName:"NEPA Group",notes:"Owned vessel"}));
      setCharterVessels(seed);
      try{ await window.storage.set(pfx+"cvs",JSON.stringify(seed)); }catch(_){}
    };
    return(
    <div style={{padding:"18px 22px"}}>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:14}}>
        {coId==="nt"&&<button onClick={resetNTFleet} style={{padding:"7px 14px",background:"#eff6ff",color:"#1e4d8c",border:"1px solid #bae6fd",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>↺ Reset Grona fleet</button>}
        <button onClick={()=>setCvForm({...EMPTY_CV})} style={{padding:"7px 16px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>+ Add Vessel</button>
      </div>
      {activeVessels.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#9ca3af"}}>
        <div style={{fontSize:40,marginBottom:12}}>⚓</div>
        <div style={{fontSize:15,fontWeight:700,color:"#374151",marginBottom:6}}>No vessels in fleet yet</div>
        <div style={{fontSize:12,marginBottom:16}}>Add vessels to start managing operations</div>
        <button onClick={()=>setCvForm({...EMPTY_CV})} style={{padding:"9px 22px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer"}}>+ Add First Vessel</button>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {activeVessels.map(v=>{
          const ops=vesselOps[v.id]||{};
          const cfg=VSTATUS_CFG[ops.status]||VSTATUS_CFG["Idle"];
          return <div key={v.id} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:cfg.color}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"#1a2b4a"}}>{v.name}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>IMO {v.imo||"—"} · {v.dwt?Number(v.dwt).toLocaleString():"—"} DWT · Built {v.built||"—"}</div>
              </div>
              <VStatBadge status={ops.status||"Idle"} small/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
              {[["Holds",v.holds||"—"],["GT",v.gt?Number(v.gt).toLocaleString():"—"],["Geared",v.geared?v.cranes||"Yes":"No"],["Flag",v.flag||"—"],["Hire",v.hireRate?"$"+Number(v.hireRate).toLocaleString()+"/day":"—"],["Owner",v.ownerName||"—"]].map(([l,val])=>(
                <div key={l} style={{background:"#f4f7fb",borderRadius:7,padding:"5px 8px",border:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:11,fontWeight:600,color:"#374151"}}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setEditVessel(v)} style={{flex:1,padding:"5px 0",background:"#f4f7fb",color:"#374151",border:"1px solid #e5e7eb",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>✏ Ops</button>
              <button onClick={()=>setCvForm(v)} style={{flex:1,padding:"5px 0",background:"#dbeafe",color:"#1e4d8c",border:"1px solid #bae6fd",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>⚙ Edit</button>
              <button onClick={()=>setAisVessel(v)} style={{flex:1,padding:"5px 0",background:"#1a2b4a",color:"#93c5fd",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>🛰 AIS</button>
              <button onClick={()=>{if(window.confirm("Delete "+v.name+"?"))deleteCharterVessel(v.id);}} style={{padding:"5px 10px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>✕</button>
            </div>
          </div>;
        })}
      </div>
    </div>
  );};

  // ── Finance helpers ──
  const saveInvoice=(inv)=>{
    const exists=invoices.find(x=>x.id===inv.id);
    const updated=exists?invoices.map(x=>x.id===inv.id?inv:x):[...invoices,inv];
    setInvoices(updated);persist(undefined,undefined,undefined,undefined,undefined,updated,undefined);
    setInvForm(null);
  };
  const deleteInvoice=(id)=>{
    const updated=invoices.filter(x=>x.id!==id);
    setInvoices(updated);persist(undefined,undefined,undefined,undefined,undefined,updated,undefined);
  };
  const updateInvStatus=(id,status)=>{
    const updated=invoices.map(x=>x.id===id?{...x,status}:x);
    setInvoices(updated);persist(undefined,undefined,undefined,undefined,undefined,updated,undefined);
  };
  const saveSettlement=(s)=>{
    const exists=settlements.find(x=>x.id===s.id);
    const updated=exists?settlements.map(x=>x.id===s.id?s:x):[...settlements,s];
    setSettlements(updated);persist(undefined,undefined,undefined,undefined,undefined,undefined,updated);
  };
  const updateSetStatus=(id,status)=>{
    const updated=settlements.map(x=>x.id===id?{...x,status}:x);
    setSettlements(updated);persist(undefined,undefined,undefined,undefined,undefined,undefined,updated);
  };

  const INV_TYPES_IN  = ["Freight","Demurrage","Other Income"];
  const INV_TYPES_OUT = ["DA Load Port","DA Discharge Port","Bunkers","Vessel Hire","Commission","Other Expense"];
  const SET_STATUSES  = [{k:"draft",l:"Draft",c:"#6b7280",bg:"#f3f4f6"},{k:"sent",l:"Sent",c:"#1e4d8c",bg:"#dbeafe"},{k:"approved",l:"Approved",c:"#065f46",bg:"#d1fae5"},{k:"transferred",l:"Transferred",c:"#7c3aed",bg:"#ede9fe"}];
  const fmtMoney=(n)=>n?("$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})):"—";
  const isOverdue=(d)=>d&&new Date(d)<new Date();
  const VN2=["All",...activeVNames];

  const EMPTY_INV={type:"Freight",direction:"in",vessel:"",voyageRef:"",counterparty:"",amount:"",currency:"USD",issueDate:new Date().toISOString().split("T")[0],dueDate:"",status:"draft",notes:""};
  const EMPTY_SET={vessel:"",voyageRef:"",voyageId:"",grossFreight:"",commission:"2.50",netFreight:"",demurrage:"",despatch:"",portCostsLoad:"",portCostsDisch:"",bunkerCosts:"",miscCosts:"",notes:"",status:"draft",date:new Date().toISOString().split("T")[0]};

  function InvCard({inv}){
    const od=inv.status!=="paid"&&isOverdue(inv.dueDate);
    const bg=inv.direction==="in"?"#f0fdf4":"#fff7ed";
    const bc=inv.direction==="in"?"#bbf7d0":"#fed7aa";
    const amtColor=inv.direction==="in"?"#065f46":"#9a3412";
    return <div style={{background:bg,border:"1px solid "+bc,borderRadius:10,padding:"11px 13px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#1a2b4a"}}>{inv.type} {inv.direction==="in"?"↓ IN":"↑ OUT"}</div>
          <div style={{fontSize:11,color:"#5a6a82"}}>{inv.vessel||"—"} {inv.voyageRef?"· "+inv.voyageRef:""}</div>
          <div style={{fontSize:11,color:"#5a6a82"}}>{inv.counterparty||"—"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:15,fontWeight:800,color:amtColor}}>{inv.currency} {inv.amount?Number(inv.amount).toLocaleString("en-US"):"—"}</div>
          {od&&<div style={{fontSize:10,color:"#dc2626",fontWeight:700}}>⚠ OVERDUE</div>}
          <div style={{fontSize:10,color:"#94a3b8"}}>Due: {inv.dueDate||"—"}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
        {["draft","sent","paid"].map(s=><button key={s} onClick={()=>updateInvStatus(inv.id,s)} style={{padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,cursor:"pointer",border:"none",background:inv.status===s?"#1a2b4a":"#e2e8f0",color:inv.status===s?"#fff":"#5a6a82"}}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
        <button onClick={()=>setInvForm(inv)} style={{padding:"2px 9px",borderRadius:20,fontSize:10,cursor:"pointer",border:"1px solid #cbd5e1",background:"#fff",color:"#374151",marginLeft:"auto"}}>Edit</button>
        <button onClick={()=>deleteInvoice(inv.id)} style={{padding:"2px 9px",borderRadius:20,fontSize:10,cursor:"pointer",border:"none",background:"#fee2e2",color:"#dc2626"}}>Del</button>
      </div>
    </div>;
  }

  function SetCard({s}){
    const cfg=SET_STATUSES.find(x=>x.k===s.status)||SET_STATUSES[0];
    const gf=Number(s.grossFreight||0);
    const comm=gf*(Number(s.commission||0)/100);
    const net=gf-comm;
    const dem=Number(s.demurrage||0);
    const desp=Number(s.despatch||0);
    const revenue=net+dem-desp;
    const costs=Number(s.portCostsLoad||0)+Number(s.portCostsDisch||0)+Number(s.bunkerCosts||0)+Number(s.miscCosts||0);
    const result=revenue-costs;
    return <div style={{background:"#f4f7fb",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 13px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#1a2b4a"}}>{s.vessel||"—"} {s.voyageRef?"· "+s.voyageRef:""}</div>
          <div style={{fontSize:11,color:"#5a6a82"}}>{s.date||"—"}</div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:700,color:cfg.c,background:cfg.bg,padding:"2px 8px",borderRadius:20}}>{cfg.l}</span>
          <span style={{fontSize:14,fontWeight:800,color:result>=0?"#065f46":"#dc2626"}}>{fmtMoney(result)}</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:8}}>
        {[["Gross Freight",fmtMoney(gf)],["Commission",fmtMoney(comm)],["Net Freight",fmtMoney(net)],["Revenue",fmtMoney(revenue)],["Port Costs",fmtMoney(Number(s.portCostsLoad||0)+Number(s.portCostsDisch||0))],["Bunkers",fmtMoney(s.bunkerCosts)],["Misc",fmtMoney(s.miscCosts)],["Total Costs",fmtMoney(costs)]].map(([l,v])=>(
          <div key={l} style={{background:"#fff",borderRadius:6,padding:"5px 8px",border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase"}}>{l}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#1a2b4a"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {SET_STATUSES.map(st=><button key={st.k} onClick={()=>updateSetStatus(s.id,st.k)} style={{padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,cursor:"pointer",border:"none",background:s.status===st.k?st.c:"#e2e8f0",color:s.status===st.k?"#fff":"#5a6a82"}}>{st.l}</button>)}
        <button onClick={()=>saveSettlement({...s,id:s.id})} style={{padding:"2px 9px",borderRadius:20,fontSize:10,cursor:"pointer",border:"1px solid #cbd5e1",background:"#fff",color:"#374151",marginLeft:"auto"}}>Edit</button>
      </div>
    </div>;
  }

  function InvModal(){
    const [f,setF]=useState(invForm||EMPTY_INV);
    if(!invForm) return null;
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setInvForm(null)}>
      <div style={{background:"#fff",borderRadius:14,width:500,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#1a2b4a",borderRadius:"14px 14px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{f.id?"Edit Invoice":"New Invoice"}</div>
          <button onClick={()=>setInvForm(null)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Direction">
              <Sel value={f.direction} onChange={v=>s("direction",v)} options={[{v:"in",l:"Receivable (IN)"},{v:"out",l:"Payable (OUT)"}]}/>
            </Field>
            <Field label="Type">
              <Sel value={f.type} onChange={v=>s("type",v)} options={f.direction==="in"?INV_TYPES_IN:INV_TYPES_OUT}/>
            </Field>
            <Field label="Vessel">
              <Sel value={f.vessel} onChange={v=>s("vessel",v)} options={["","Grona Kestrel","Grona Hawk","Grona Eagle","Grona Falcon","Grona Osprey","Grona Harrier","Grona Vulture","Grona Raven"]}/>
            </Field>
            <Field label="Voyage Ref">
              <Inp value={f.voyageRef} onChange={v=>s("voyageRef",v)} placeholder="e.g. KES-2501"/>
            </Field>
            <Field label="Counterparty">
              <Inp value={f.counterparty} onChange={v=>s("counterparty",v)} placeholder="Company name"/>
            </Field>
            <Field label="Currency">
              <Sel value={f.currency} onChange={v=>s("currency",v)} options={["USD","EUR","GBP"]}/>
            </Field>
            <Field label="Amount">
              <Inp value={f.amount} onChange={v=>s("amount",v)} type="number" placeholder="0"/>
            </Field>
            <Field label="Status">
              <Sel value={f.status} onChange={v=>s("status",v)} options={[{v:"draft",l:"Draft"},{v:"sent",l:"Sent"},{v:"paid",l:"Paid"}]}/>
            </Field>
            <Field label="Issue Date">
              <Inp value={f.issueDate} onChange={v=>s("issueDate",v)} type="date"/>
            </Field>
            <Field label="Due Date">
              <Inp value={f.dueDate} onChange={v=>s("dueDate",v)} type="date"/>
            </Field>
            <Field label="Notes" span2>
              <textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} rows={3} style={{...FS,resize:"vertical",fontFamily:"inherit"}} placeholder="Optional notes…"/>
            </Field>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>saveInvoice({...f,id:f.id||genId()})} style={{flex:1,padding:"9px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Save Invoice</button>
            <button onClick={()=>setInvForm(null)} style={{flex:1,padding:"9px 0",background:"#f1f5f9",color:"#5a6a82",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>;
  }

  function FinancePage(){
    const totalIn=invoices.filter(i=>i.direction==="in"&&i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
    const totalOut=invoices.filter(i=>i.direction==="out"&&i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
    const outstanding=invoices.filter(i=>i.direction==="in"&&i.status!=="paid").reduce((s,i)=>s+Number(i.amount||0),0);
    const overdueCnt=invoices.filter(i=>i.status!=="paid"&&isOverdue(i.dueDate)).length;
    const pendingTrans=settlements.filter(s=>s.status!=="transferred").length;
    return <div style={{padding:"18px 22px",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
        {[["Paid In",fmtMoney(totalIn),"#065f46"],["Paid Out",fmtMoney(totalOut),"#9a3412"],["Outstanding",fmtMoney(outstanding),"#1e4d8c"],["Overdue",overdueCnt+" invoices","#dc2626"],["Pending Transfer",pendingTrans+" settlements","#6b7280"]].map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",marginBottom:4}}>{l}</div>
            <div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:3,marginBottom:14,background:"#f1f5f9",borderRadius:8,padding:3}}>
        {[["invoices","🧾 Invoices"],["settlements","📊 Settlements"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFinTab(k)} style={{flex:1,padding:"6px 0",borderRadius:6,border:"none",fontWeight:600,fontSize:12,cursor:"pointer",background:finTab===k?"#fff":"transparent",color:finTab===k?"#1a2b4a":"#5a6a82"}}>{l}</button>
        ))}
      </div>
      {finTab==="invoices"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#065f46",marginBottom:8}}>↓ Receivables (IN)</div>
            {invoices.filter(i=>i.direction==="in").length===0&&<div style={{color:"#94a3b8",fontSize:12,padding:"20px 0",textAlign:"center"}}>No receivables</div>}
            {invoices.filter(i=>i.direction==="in").sort((a,b)=>a.status==="paid"?1:-1).map(i=><InvCard key={i.id} inv={i}/>)}
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#9a3412",marginBottom:8}}>↑ Payables (OUT)</div>
            {invoices.filter(i=>i.direction==="out").length===0&&<div style={{color:"#94a3b8",fontSize:12,padding:"20px 0",textAlign:"center"}}>No payables</div>}
            {invoices.filter(i=>i.direction==="out").sort((a,b)=>a.status==="paid"?1:-1).map(i=><InvCard key={i.id} inv={i}/>)}
          </div>
        </div>
      </div>}
      {finTab==="settlements"&&<div>
        {settlements.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:"#94a3b8"}}>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <div style={{fontSize:14,fontWeight:600,color:"#374151",marginBottom:5}}>No voyage settlements yet</div>
          <div style={{fontSize:12,marginBottom:14}}>Create a settlement per completed voyage</div>
          <button onClick={()=>{saveSettlement({...EMPTY_SET,id:genId()});}} style={{padding:"8px 20px",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>+ New Settlement</button>
        </div>}
        {settlements.map(s=><SetCard key={s.id} s={s}/>)}
      </div>}
    </div>;
  }



  // ── RENDER ──
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#f4f7fb",minHeight:"100vh",paddingBottom:40}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1a2b4a 0%,#2d4a7a 100%)",padding:"10px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,boxShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.1)"/>
              <path d="M12 32 L24 14 L36 32 Z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M17 32 L24 20 L31 32" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <line x1="12" y1="34" x2="36" y2="34" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:"0.18em",textTransform:"uppercase"}}>The NEPA Group</div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-0.01em"}}>Fleet Manager</div>
            </div>
          </div>
          <div style={{width:1,height:32,background:"rgba(255,255,255,0.15)"}}/>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {accessibleCos.map(c=>(
              <button key={c.id} onClick={()=>setCoId(c.id)} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:coId===c.id?c.color:"rgba(255,255,255,0.1)",color:"#fff",transition:"all 0.15s",opacity:coId===c.id?1:0.7}}>
                {c.short}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontWeight:600,background:"rgba(255,255,255,0.12)",padding:"4px 12px",borderRadius:20,border:"1px solid rgba(255,255,255,0.15)"}}>{co.name}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {saving&&<span style={{fontSize:11,color:"#86efac"}}>✓ Saved</span>}
          <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px 4px 8px",border:"1px solid rgba(255,255,255,0.15)"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:"#1e6fba",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{user.name.charAt(0)}</div>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:600}}>{user.name}</span>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>· {user.role}</span>
          </div>
          <button onClick={()=>setUser(null)} style={{padding:"5px 12px",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer"}}>Sign out</button>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:"#1a2b4a",padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex"}}>
          {[["dashboard","🏠 Dashboard"],["fleet","⚓ Fleet"],["fixtures","📋 Fixtures"],["voyages","🚢 Voyages"],["crm","👥 CRM"],["finance","💰 Finance"]].map(([k,l])=>(
            <button key={k} onClick={()=>setPage(k)} style={{padding:"11px 16px",border:"none",background:"none",cursor:"pointer",color:page===k?"#fff":"rgba(255,255,255,0.45)",fontWeight:page===k?700:400,fontSize:12,borderBottom:page===k?"2px solid "+co.color:"2px solid transparent",transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:7}}>
          {page==="fixtures"&&<button onClick={()=>setFixForm({...EMPTY_FIX})} style={{padding:"6px 13px",background:"#1e6fba",color:"#fff",border:"none",borderRadius:7,fontWeight:600,fontSize:11,cursor:"pointer"}}>+ Fixture</button>}
          {page==="voyages"&&<button onClick={()=>{setVoyForm({...EMPTY_VOY,id:null});setVoyTab("general");}} style={{padding:"6px 13px",background:"#1e6fba",color:"#fff",border:"none",borderRadius:7,fontWeight:600,fontSize:11,cursor:"pointer"}}>+ Voyage</button>}
          {page==="crm"&&<button onClick={()=>setCrmForm({...EMPTY_CON})} style={{padding:"6px 13px",background:"#1e6fba",color:"#fff",border:"none",borderRadius:7,fontWeight:600,fontSize:11,cursor:"pointer"}}>+ Contact</button>}
          {page==="finance"&&<button onClick={()=>setInvForm({...EMPTY_INV})} style={{padding:"6px 13px",background:"#1e6fba",color:"#fff",border:"none",borderRadius:7,fontWeight:600,fontSize:11,cursor:"pointer"}}>+ Invoice</button>}
        </div>
      </div>

      {page==="dashboard"&&<DashboardPage/>}
      {page==="fleet"    &&<FleetPage/>}
      {page==="fixtures" &&<FixturePage/>}
      {page==="voyages"  &&<VoyagePage/>}
      {page==="crm"      &&<CrmPage/>}
      {page==="finance"  &&<FinancePage/>}

      {/* Modals */}
      {aisVessel  &&<AISPanel vessel={aisVessel} onClose={()=>setAisVessel(null)}/>}
      <VesselEditModal/>
      <FixFormModal/>
      <VoyageModal/>
      <CrmFormModal/>
      <CrmDetailModal/>
      <InvModal/>
      <CharterVesselModal/>

      {/* Fixture detail */}
      {fixDetail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setFixDetail(null)}>
          <div style={{background:"#fff",borderRadius:18,width:500,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 70px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:"#1a2b4a",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{fixDetail.vessel}</div><div style={{fontSize:11,color:"#5a6a82"}}>{fixDetail.type} · {fixDetail.charterer||"—"}{fixDetail.broker?` · via ${fixDetail.broker}`:""}</div></div>
              <div style={{display:"flex",gap:8}}><StageBadge stage={fixDetail.stage}/><button onClick={()=>setFixDetail(null)} style={{background:"none",border:"none",color:"#5a6a82",cursor:"pointer",fontSize:20}}>✕</button></div>
            </div>
            <div style={{padding:18}}>
              {/* CRM contacts */}
              {(fixDetail.chartererContactId||fixDetail.brokerContactId)&&(
                <div style={{background:"#eff6ff",border:"1px solid #bae6fd",borderRadius:9,padding:11,marginBottom:13}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#1e4d8c",marginBottom:7}}>🔗 Gekoppelde CRM contacten</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[fixDetail.chartererContactId,fixDetail.brokerContactId].filter(Boolean).map(id=>{ const c=contacts.find(x=>x.id===id); if(!c) return null; const cfg2=CRM_TYPES.find(t=>t.key===c.type)||CRM_TYPES[4]; return <button key={id} onClick={()=>{setFixDetail(null);navToCrm(c);}} style={{fontSize:11,padding:"3px 10px",background:cfg2.bg,color:cfg2.color,border:`1px solid ${cfg2.color}33`,borderRadius:20,cursor:"pointer",fontWeight:600}}>{cfg2.icon} {c.company} →</button>; })}
                  </div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:13}}>
                {[["Cargo",`${fixDetail.cargo||"—"}${fixDetail.quantity?` · ${fmtNum(fixDetail.quantity)} mt`:""}`],["Laycan",fixDetail.laycan||"—"],["Commissie",fixDetail.commission?`${fixDetail.commission}%`:"—"],["Vracht",fixDetail.freight?`$${fixDetail.freight}/mt`:fixDetail.tcRate?`$${fixDetail.tcRate}/day`:"—"],["Loadport",fixDetail.loadport||"—"],["Dischport",fixDetail.dischport||"—"]].map(([l,v])=>(
                  <div key={l} style={{background:"#f4f7fb",borderRadius:8,padding:"8px 10px",border:"1px solid #e2e8f0"}}><div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase",marginBottom:2}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:"#1a2b4a"}}>{v}</div></div>
                ))}
              </div>
              {fixDetail.notes&&<div style={{background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,padding:10,marginBottom:12,fontSize:12,color:"#78350f"}}>📝 {fixDetail.notes}</div>}
              <div style={{marginBottom:13}}>
                <div style={{fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",marginBottom:7}}>Stage bijwerken</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {FIX_STAGES.map(s=><button key={s.key} onClick={()=>{updateFixStage(fixDetail.id,s.key);setFixDetail(f=>({...f,stage:s.key}));}} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:fixDetail.stage===s.key?s.color:s.bg,color:fixDetail.stage===s.key?"#fff":s.color,border:`1px solid ${s.color}55`}}>{s.label}</button>)}
                </div>
                {fixDetail.stage!=="fixed"&&<div style={{marginTop:7,fontSize:11,color:"#1e6fba",background:"#dbeafe",padding:"5px 9px",borderRadius:6}}>💡 Zet op "Fixed" om automatisch een voyage aan te maken</div>}
              </div>
              {fixDetail.voyageId&&(
                <div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:10,marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#065f46",marginBottom:3}}>🚢 Gekoppelde voyage</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:"#065f46"}}>
                    <span>{voyages.find(v=>v.id===fixDetail.voyageId)?.voyageNo||"Voyage aangemaakt"}</span>
                    <button onClick={()=>{const voy=voyages.find(v=>v.id===fixDetail.voyageId);setFixDetail(null);setVoyForm(voy);setVoyTab("general");setPage("voyages");}} style={{fontSize:11,background:"#065f46",color:"#fff",border:"none",borderRadius:5,padding:"2px 8px",cursor:"pointer"}}>Openen →</button>
                  </div>
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setFixForm(fixDetail);setFixDetail(null);}} style={{flex:2,padding:"8px 0",background:"#1a2b4a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}}>✏ Bewerken</button>
                <button onClick={()=>deleteFix(fixDetail.id)} style={{flex:1,padding:"8px 0",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}}>Verwijderen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}