/* light/dark toggle (initial theme is set by the inline head script before first paint) */
(()=>{const de=document.documentElement;
const svg='<svg class="i-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z"/></svg><svg class="i-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.8"/><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M3.05 12.95l1.13-1.13M11.82 4.18l1.13-1.13"/></svg>';
const host=document.querySelector('.top nav')||document.querySelector('.bar-right');if(!host)return;
const b=document.createElement('button');b.type='button';b.className='theme-btn';b.innerHTML=svg;
const lab=()=>b.setAttribute('aria-label',de.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');lab();host.prepend(b);
b.addEventListener('click',()=>{const t=de.dataset.theme==='dark'?'light':'dark';de.classList.add('theme-anim');de.dataset.theme=t;try{localStorage.setItem('dbh-theme',t);}catch(e){}lab();
  window.dbhSfx&&window.dbhSfx.tap();setTimeout(()=>de.classList.remove('theme-anim'),350);dispatchEvent(new Event('resize'));});
})();
