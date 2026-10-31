/* FMSS shared app bar (see appbar.css). FMSSAppBar.create(cfg) → {set(scroll), filled}
   cfg: host (the screen layer; gets data-ab), before (the node the bar's layers go under, e.g. the status bar), height (bar bottom,
   screen px), scrim (scrim bottom), titleY (title centre), title, verified (bool), threshold (scroll px at which the cover's bottom
   edge reaches the bar bottom), z (z-index of the layers), onChange(filled). */
(function(){
'use strict';
const BADGE='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#0866ff"/><path d="M4.6 8.2l2.3 2.3 4.5-4.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function create(cfg){
  const host=cfg.host,z=String(cfg.z!=null?cfg.z:5);
  const mk=(cls,css)=>{const e=document.createElement('div');e.className=cls;e.setAttribute('aria-hidden','true');Object.assign(e.style,css,{zIndex:z});return e};
  const scrim=mk('ab-scrim',{height:cfg.scrim+'px'}),fill=mk('ab-fill',{height:cfg.height+'px'}),title=mk('ab-title',{top:(cfg.titleY-12)+'px',height:'24px'});
  const t=document.createElement('span');t.textContent=cfg.title||'';title.append(t);if(cfg.verified)title.insertAdjacentHTML('beforeend',BADGE);
  const ref=cfg.before||host.firstChild;[scrim,fill,title].forEach(e=>host.insertBefore(e,ref));
  let filled=false;
  function set(scroll){const f=scroll>=cfg.threshold;if(f===filled)return;filled=f;if(f)host.dataset.ab='filled';else delete host.dataset.ab;cfg.onChange&&cfg.onChange(f)}
  return {set,get filled(){return filled},scrim,fill,title};
}
window.FMSSAppBar={create};
})();
