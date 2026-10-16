/* Client-side passcode gate (deterrent only; static files remain fetchable). Stores only a SHA-256 hash. */
(()=>{const HASH="286464b18f355ac16657aefdbc999ffd6c26db7a07b10c9a8f90664d7c6b960b",KEY="dbh-unlocked";
if(sessionStorage.getItem(KEY)==="1")return;
document.documentElement.classList.add("gated");
const mount=()=>{const g=document.createElement("div");g.className="gate";g.setAttribute("role","dialog");g.setAttribute("aria-modal","true");g.setAttribute("aria-labelledby","gate-h");
g.innerHTML='<div class="gate-in"><p class="gate-logo">DESIGN BY HANG</p><h1 id="gate-h">Thanks for stopping by</h1><p class="gate-sub">This work is private. Enter passcode to continue.</p><form class="gate-form" novalidate><label for="gate-pw" class="sr">Passcode</label><input id="gate-pw" type="password" placeholder="Passcode" autocomplete="current-password" required><button type="submit" aria-label="Continue"><svg viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M0 7H19M12.5 .5L19 7l-6.5 6.5"/></svg></button></form><p class="gate-err" role="alert" aria-live="assertive"></p><p class="gate-help">Don\'t have one? <a href="https://www.linkedin.com/in/thisishang/" target="_blank" rel="noopener">Reach out to Hang</a>.</p></div>';
document.body.appendChild(g);const i=g.querySelector("input");i.focus();
g.querySelector("form").addEventListener("submit",async e=>{e.preventDefault();
const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(i.value));
const hex=[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
if(hex===HASH){sessionStorage.setItem(KEY,"1");document.documentElement.classList.remove("gated");g.remove();}
else{g.querySelector(".gate-err").textContent="Incorrect passcode. Try again.";i.select();}});};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",mount):mount();})();
