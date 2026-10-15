/* light/dark toggle (initial theme is set by the inline head script before first paint) */
(()=>{const de=document.documentElement;
const svg='<svg class="i-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M14.2 10.1A6.6 6.6 0 0 1 5.9 1.8 6.6 6.6 0 1 0 14.2 10.1z"/></svg><svg class="i-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.3"/><line x1="8.00" y1="2.40" x2="8.00" y2="1.30"/><line x1="12.85" y1="5.20" x2="13.80" y2="4.65"/><line x1="12.85" y1="10.80" x2="13.80" y2="11.35"/><line x1="8.00" y1="13.60" x2="8.00" y2="14.70"/><line x1="3.15" y1="10.80" x2="2.20" y2="11.35"/><line x1="3.15" y1="5.20" x2="2.20" y2="4.65"/></svg>';
const foot=document.querySelector('footer.bot');
const b=document.createElement('button');b.type='button';b.className='theme-btn';b.innerHTML=svg;
const lab=()=>b.setAttribute('aria-label',de.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');lab();if(foot){foot.prepend(b);}else{b.classList.add('theme-float');document.body.appendChild(b);} /* home: footer left corner; project pages: fixed bottom-left */
b.addEventListener('click',()=>{const t=de.dataset.theme==='dark'?'light':'dark';de.classList.add('theme-anim');de.dataset.theme=t;try{localStorage.setItem('dbh-theme',t);}catch(e){}lab();
  window.dbhSfx&&window.dbhSfx.tap();setTimeout(()=>de.classList.remove('theme-anim'),350);dispatchEvent(new Event('resize'));});
})();
