/* Client-side passcode gate (deterrent only; static files remain fetchable). Stores only a SHA-256 hash. */
(()=>{const me=document.currentScript,q=me&&me.src.indexOf("?")>0?me.src.slice(me.src.indexOf("?")):"",CUBE=new URL("hang-cube.js"+q,me?me.src:location.href).href;
const HASH="286464b18f355ac16657aefdbc999ffd6c26db7a07b10c9a8f90664d7c6b960b",KEY="dbh-unlocked";
if(sessionStorage.getItem(KEY)==="1")return;
document.documentElement.classList.add("gated");
const mount=()=>{const g=document.createElement("div");g.className="gate";g.setAttribute("role","dialog");g.setAttribute("aria-modal","true");g.setAttribute("aria-label","Design by Hang. Enter passcode");
g.innerHTML='<header class="gate-top"><span class="gate-brand">DESIGN BY HANG</span></header><div class="gate-in"><div class="gate-stage" role="img" aria-label="The letters H, A, N, G drawn and turning in a loop"></div><div class="gate-fit"><form class="gate-form" novalidate><label for="gate-pw" class="sr">Passcode</label><input id="gate-pw" type="password" placeholder="Enter passcode" autocomplete="current-password" required><button type="submit" aria-label="Continue"><svg viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M0 7H19M12.5 .5L19 7l-6.5 6.5"/></svg></button></form></div><p class="gate-err" role="alert" aria-live="assertive"></p><p class="gate-help">Don\'t have one? <a href="https://www.linkedin.com/in/thisishang/" target="_blank" rel="noopener">Reach out to Hang</a>.</p></div>';
document.body.appendChild(g);const i=g.querySelector("input");i.focus();
/* HANG letters (js/hang-cube.js, loaded here only while gated); stopped and removed on unlock */
let cube=null;const st=g.querySelector(".gate-stage"),go=()=>{if(g.isConnected&&window.HangCube)cube=window.HangCube.mount(st);};
if(window.HangCube)go();else{const s=document.createElement("script");s.src=CUBE;s.onload=go;document.head.appendChild(s);}
g.querySelector("form").addEventListener("submit",async e=>{e.preventDefault();
const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(i.value));
const hex=[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
if(hex===HASH){sessionStorage.setItem(KEY,"1");document.documentElement.classList.remove("gated");if(cube)cube.destroy();g.remove();dispatchEvent(new Event("gate:unlocked"));}
else{g.querySelector(".gate-err").textContent="Incorrect passcode. Try again.";i.select();}});};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",mount):mount();})();
