const $=id=>document.getElementById(id);let last="NOVA is ready. Tell me what you need.";let rec;
function add(t,c){let e=document.createElement("div");e.className="msg "+c;e.textContent=t;$("#chat").appendChild(e);$("#chat").scrollTop=$("#chat").scrollHeight}
function speak(t){if(!speechSynthesis)return;speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.rate=.98;u.pitch=.92;speechSynthesis.speak(u)}
function say(t){last=t;$("#reply").textContent=t;add(t,"nova");speak(t)}
function device(){let a=[`Online: ${navigator.onLine?"yes":"no"}`,`Screen: ${screen.width}Ã—${screen.height}`];if(navigator.getBattery)navigator.getBattery().then(b=>$("#device").innerHTML=a.join("<br>")+`<br>Battery: ${Math.round(b.level*100)}%<br>Charging: ${b.charging?"yes":"no"}`);else $("#device").innerHTML=a.join("<br>")}
function locate(){if(!navigator.geolocation){$("#location").textContent="GPS unavailable.";return}$("#location").textContent="Requesting GPSâ€¦";navigator.geolocation.getCurrentPosition(p=>{let lat=p.coords.latitude.toFixed(6),lon=p.coords.longitude.toFixed(6);$("#location").innerHTML=`Latitude: ${lat}<br>Longitude: ${lon}<br>Accuracy: Â±${Math.round(p.coords.accuracy)}m`;localStorage.novaLocation=JSON.stringify({lat,lon,time:Date.now()})},e=>$("#location").textContent=e.message,{enableHighAccuracy:true,timeout:12000})}
async function backend(q){let ep=localStorage.novaEndpoint;if(!ep)return null;try{let r=await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:localStorage.novaModel||"nova-local",prompt:q})});let d=await r.json();return d.response||d.text||d.content||null}catch(e){return"Your private AI backend could not be reached."}}
async function ask(q){if(!q.trim())return;add(q,"user");$("#cmd").value="";let t=q.toLowerCase(),r=null;
if(t.includes("what can you do")||t.includes("who are you"))r="I'm NOVA, your personal AI assistant. I can converse, use voice, read basic browser device context, use GPS with permission, and connect to your private AI backend.";
else if(t.includes("battery")||t.includes("device status")){device();r="I'm checking the device information available to me."}
else if(t.includes("where am i")||t.includes("location")){locate();r="I'm requesting your current GPS location."}
else if(t.includes("time"))r="It is "+new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})+".";
else if(t.includes("hello")||t==="hi")r="Hello. I'm online and listening.";
if(r)say(r);let a=await backend(q);if(a)say(a);else if(!r)say("I can handle that once you connect a private AI backend.")}
$("#send").onclick=()=>ask($("#cmd").value);$("#cmd").onkeydown=e=>{if(e.key==="Enter")ask($("#cmd").value)};$("#speak").onclick=()=>speak(last);$("#locate").onclick=locate;
document.querySelectorAll("[data-cmd]").forEach(b=>b.onclick=()=>ask(b.dataset.cmd));
$("#mic").onclick=()=>{
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ say("Voice recognition is unavailable in this browser. Try Chrome on Android."); return; }
  rec = rec || new SpeechRecognition();
  rec.lang = navigator.language || "en-US";
  rec.interimResults = false;
  rec.onresult = e => { $("#cmd").value = e.results[0][0].transcript; ask($("#cmd").value); };
  rec.onerror = e => say("Voice input error: " + (e.error || "microphone unavailable"));
  try { rec.start(); } catch(e) {}
};
$("#save").onclick=()=>{localStorage.novaEndpoint=$("#endpoint").value.trim();localStorage.novaModel=$("#model").value.trim()||"nova-local";$("#saved").textContent="Backend saved locally on this device."};
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
if(localStorage.novaEndpoint) $("#endpoint").value=localStorage.novaEndpoint;
if(localStorage.novaModel) $("#model").value=localStorage.novaModel;
device(); add(last,"nova");
