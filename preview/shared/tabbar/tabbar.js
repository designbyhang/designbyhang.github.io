/* FMSS shared bottom tab bar (see tabbar.css).
   const tb=FMSSTabBar.mount(el,{theme:'light'|'dark'})   el: the host's .tb element (any classes/position; its content is replaced)
     tb.setTheme('light'|'dark')   flip the variant at once (both are preloaded)
     tb.setExit(k)                 0 shown … 1 gone: translateY(80px·k) + opacity 1−k, driven by the caller's spring each frame
     tb.theme, tb.el */
(function(){
'use strict';
const BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^/]*$/,'');
const VER=((document.currentScript&&document.currentScript.src||'').match(/\?v=\d+/)||[''])[0];
const EXIT=80;   // slide distance, about the bar's height (79), on the even scale
function mount(el,o){
  o=o||{};el.classList.add('tb');el.textContent='';el.setAttribute('aria-hidden','true');
  ['light','dark'].forEach(t=>{const i=document.createElement('img');i.className='tb-'+t;i.alt='';i.decoding='sync';i.src=BASE+'tabbar-'+t+'.svg'+VER;el.append(i)});
  let theme=o.theme==='dark'?'dark':'light',k=-1;el.dataset.tb=theme;
  return {el,get theme(){return theme},
    setTheme(t){t=t==='dark'?'dark':'light';if(t===theme)return;theme=t;el.dataset.tb=t},
    setExit(v){v=Math.min(1,Math.max(0,+v||0));if(v===k)return;k=v;
      el.style.transform=v?`translate3d(0,${(EXIT*v).toFixed(2)}px,0)`:'';el.style.opacity=v?(1-v).toFixed(3):'';
      el.style.visibility=v>=1?'hidden':''}};
}
window.FMSSTabBar={mount,EXIT};
})();
