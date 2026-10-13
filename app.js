import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, WHATSAPP_NUMBER } from "./firebase-config.js";

const defaults = [
  {id:"web-dev",icon:"⌘",title:"Website & Web Development",category:"IT",description:"Website bisnis, landing page, katalog, dan solusi web responsif sesuai kebutuhan.",price:"Mulai konsultasi",active:true,order:1},
  {id:"it-support",icon:"⌁",title:"IT Support & Troubleshooting",category:"IT",description:"Bantuan analisis kendala perangkat lunak, setup dasar, dan konsultasi teknis.",price:"Mulai konsultasi",active:true,order:2},
  {id:"cyber-audit",icon:"⬡",title:"Security Review Berizin",category:"Cyber Security",description:"Pemeriksaan keamanan dasar pada aset milik Anda atau sistem dengan izin tertulis.",price:"Mulai konsultasi",active:true,order:3},
  {id:"learning",icon:"⌘",title:"Edukasi Cyber Security",category:"Cyber Security",description:"Pendampingan belajar keamanan digital, praktik lab legal, dan hardening dasar.",price:"Mulai konsultasi",active:true,order:4},
  {id:"social-media",icon:"↗",title:"Social Media Growth",category:"Social Media",description:"Konsultasi strategi konten, optimasi profil, dan dukungan pertumbuhan akun yang sesuai kebijakan platform.",price:"Mulai konsultasi",active:true,order:5},
  {id:"design",icon:"◈",title:"Desain Digital & Branding",category:"Creative",description:"Konsep visual, aset promosi, dan identitas digital untuk kebutuhan brand.",price:"Mulai konsultasi",active:true,order:6}
];

const $ = (selector) => document.querySelector(selector);
const toast = (message) => { const el=$("#toast"); if(!el) return; el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2800); };
let db = null, soundOn = localStorage.getItem("kendevsec-sound") !== "off", services = defaults;
let audioContext;
function playSound(kind="tap"){
  if(!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if(audioContext.state==="suspended") audioContext.resume();
    const osc=audioContext.createOscillator(), gain=audioContext.createGain();
    osc.type="sine"; osc.frequency.value=kind==="success"?740:kind==="open"?520:360;
    gain.gain.setValueAtTime(.0001,audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.035,audioContext.currentTime+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.12);
    osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime+.13);
  } catch (_) {}
}
document.addEventListener("click", e=>{ if(e.target.closest(".soundable, .order-trigger, .service-card a")) playSound(); });
function setupControls(){
  $("#year").textContent=new Date().getFullYear();
  $("#soundToggle")?.addEventListener("click",()=>{soundOn=!soundOn;localStorage.setItem("kendevsec-sound",soundOn?"on":"off");$("#soundState").textContent=soundOn?"Suara ON":"Suara OFF";if(soundOn)playSound("success");});
  $("#soundState").textContent=soundOn?"Suara ON":"Suara OFF";
  $("#menuToggle")?.addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
  $("#mainNav")?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
  $("#closeOrder")?.addEventListener("click",closeOrder);
  $("#orderModal")?.addEventListener("click",e=>{if(e.target.id==="orderModal")closeOrder();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeOrder();});
  $("#orderForm")?.addEventListener("submit",submitOrder);
}
function openOrder(service){
  $("#orderServiceId").value=service.id || "";
  $("#orderServiceName").value=service.title || "Konsultasi KENDEVSEC";
  $("#orderDetails").value="";
  $("#orderModal").classList.add("open");$("#orderModal").setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";setTimeout(()=>$("#customerName")?.focus(),100);playSound("open");
}
function closeOrder(){const modal=$("#orderModal");if(!modal)return;modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow=""; }
function submitOrder(e){
  e.preventDefault();
  const name=$("#customerName").value.trim(), phone=$("#customerPhone").value.trim(), service=$("#orderServiceName").value.trim(), details=$("#orderDetails").value.trim(), budget=$("#orderBudget").value.trim();
  if(!name||!phone||!details){toast("Lengkapi nama, nomor WhatsApp, dan detail kebutuhan.");return;}
  const message=["Halo KENDEVSEC, saya ingin melakukan order.","","Nama: "+name,"Nomor WhatsApp: "+phone,"Layanan: "+service,"Detail: "+details,"Budget: "+(budget||"Belum ditentukan"),"","Mohon informasi harga dan proses selanjutnya."].join("\n");
  const url="https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message);
  const win=window.open(url,"_blank","noopener,noreferrer");
  if(!win) window.location.href=url;
  closeOrder();toast("Rangkuman order disiapkan untuk WhatsApp.");playSound("success");
}
function renderServices(items){
  const grid=$("#serviceGrid");if(!grid)return;
  if(!items.length){grid.innerHTML='<div class="loading-card">Belum ada layanan aktif. Silakan hubungi kami melalui WhatsApp.</div>';return;}
  grid.innerHTML=items.map(s=>`<article class="service-card"><div class="service-icon">${escapeHtml(s.icon||"◈")}</div><div class="eyebrow" style="margin-top:17px">${escapeHtml(s.category||"Layanan")}</div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description||"Hubungi kami untuk detail layanan.")}</p><div class="service-foot"><span class="price">${escapeHtml(s.price||"Hubungi kami")}</span><button class="order-trigger soundable" type="button" data-order="${escapeHtml(s.id)}">Order layanan ↗</button></div></article>`).join("");
  grid.querySelectorAll("[data-order]").forEach(btn=>btn.addEventListener("click",()=>{const service=items.find(s=>s.id===btn.dataset.order);if(service)openOrder(service);}));
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function validFirebaseConfig(){return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("GANTI_") && firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("GANTI_");}
async function boot(){
  setupControls();renderServices(defaults);
  if(!validFirebaseConfig()){toast("Mode demo: isi konfigurasi Firebase untuk mengaktifkan data admin.");return;}
  try{
    const app=initializeApp(firebaseConfig);db=getFirestore(app);
    const settingsRef=doc(db,"siteSettings","main");
    onSnapshot(settingsRef,snap=>{const settings=snap.exists()?snap.data():{};const screen=$("#maintenanceScreen");if(settings.maintenance===true){screen.classList.remove("hidden");document.body.style.overflow="hidden";}else{screen.classList.add("hidden");document.body.style.overflow="";}if(settings.siteTitle)document.title=settings.siteTitle+" — Digital Services";const publicMessage=document.querySelector("#maintenancePublicMessage");if(publicMessage&&settings.maintenanceMessage)publicMessage.textContent=settings.maintenanceMessage;},()=>{});
    const snap=await getDocs(collection(db,"services"));
    if(!snap.empty){services=snap.docs.map(d=>({id:d.id,...d.data()})).filter(s=>s.active!==false).sort((a,b)=>(a.order||999)-(b.order||999));renderServices(services);}
  }catch(err){console.error("Firebase:",err);toast("Firebase belum siap. Layanan demo tetap ditampilkan.");}
}
boot();
