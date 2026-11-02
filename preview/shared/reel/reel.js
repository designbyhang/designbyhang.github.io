/* FMSSReel: fills a host's Reels ad placeholders with the shared overlay (reel.css). One call per reel:
     FMSSReel.mount(root, {cap, capX, cta, color})
       root   the element holding the placeholders: [data-reel=scrim] [data-reel=rail] [data-reel=details] [data-reel=cta] [data-reel=pill]
              (any may be left out; the host places them in its own z-order)
       cap    the collapsed caption as the design cuts it (an ellipsis is added), followed by "more ⌄"
       capX   optional: the expanded caption (4 lines at 303), cross-faded in by the host (returned .capX)
       cta    the CTA label; color its fill
     -> {details, capC, capX, cta}
   The "more" arrow starts 5px after the ink of "more" (as Figma draws it, preview/fmss-cb caption 140796:6730). */
(function(){'use strict';
if(window.FMSSReel)return;
const V='351',base=new URL('.',document.currentScript.src).href,u=f=>base+f+'?v='+V;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const cx=document.createElement('canvas').getContext('2d');
function fitArrow(p){   // the arrow 5px after the ink of "more": its em box ends at the last glyph's advance plus the tracking
  const em=p.querySelector('em'),img=em&&em.querySelector('img');if(!img)return;
  const cs=getComputedStyle(em),ls=parseFloat(cs.letterSpacing)||0;cx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
  const m=cx.measureText('more'),rsb=m.width-m.actualBoundingBoxRight+ls;img.style.marginLeft=(5-2-rsb).toFixed(2)+'px'}
function mount(root,o){
  const q=k=>root.querySelector('[data-reel='+k+']'),out={};
  const rail=q('rail');if(rail)rail.src=u('ufi-rail.svg');
  const pill=q('pill');if(pill)pill.src=new URL('../sponsored/sponsored-chip.svg',base).href+'?v='+V;
  const d=q('details');
  if(d){
    d.innerHTML='<img class="rl-av" alt="" src="'+u('avatar.svg')+'">'+
      '<div class="rl-who"><p class="rl-t rl-name">Nike</p><i class="rl-ico" style="--m:url('+u('verified.png')+')"></i><i class="rl-ico" style="--m:url('+u('globe.png')+')"></i></div>'+
      '<p class="rl-t rl-cap"><span>'+esc(o.cap)+'…</span><em>more<img alt="" src="'+u('chevron.svg')+'"></em></p>'+
      (o.capX?'<p class="rl-t rl-capx">'+esc(o.capX)+'</p>':'');
    out.details=d;out.capC=d.querySelector('.rl-cap');out.capX=d.querySelector('.rl-capx');
    const fit=()=>fitArrow(out.capC);fit();document.fonts&&document.fonts.ready.then(fit);
  }
  const c=q('cta');
  if(c){c.classList.add('ad-cta');c.textContent=o.cta;if(o.color)c.style.setProperty('--rl-cta',o.color);out.cta=c}
  return out}
window.FMSSReel={mount};
})();
