/* FMSSReel: fills a host's Reels ad placeholders with the shared overlay (reel.css). One call per reel:
     FMSSReel.mount(root, {cap, capX, cta, color, counts})
       root   the element holding the placeholders: [data-reel=scrim] [data-reel=rail] [data-reel=details] [data-reel=cta] [data-reel=pill]
              (any may be left out; the host places them in its own z-order)
       cap    the collapsed caption as the design cuts it (an ellipsis is added), followed by "more ⌄"
       capX   optional: the expanded caption (4 lines at 303), cross-faded in by the host (returned .capX)
       cta    the CTA label; color its fill
       counts the ad's UFI counts {like, comment, share}, live text: the rail is the shared Reels UFI (preview/shared/ufi, ReelsUFI,
              loaded first) with FMSS's three items (no save), its icons the Figma paths and its counts the type the outlines had
     -> {rail, details, capC, capX, cta, rise}
   rise(t) the caption tap's motion, for the host's IAB onRender (t: 0 closed → 1 half sheet): the details rise from 570 to 266 with the
          half sheet and the collapsed caption cross-fades into capX (when there is one). The host's [data-reel=more] is the tap target
          (reel.css), and opens its IAB half sheet.
   The "more" arrow starts 5px after the ink of "more" (as Figma draws it, preview/fmss-cb caption 140796:6730). */
(function(){'use strict';
if(window.FMSSReel)return;
const V='356',base=new URL('.',document.currentScript.src).href,u=f=>base+f+'?v='+V;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const cx=document.createElement('canvas').getContext('2d');
function fitArrow(p){   // the arrow 5px after the ink of "more": its em box ends at the last glyph's advance plus the tracking
  const em=p.querySelector('em'),img=em&&em.querySelector('img');if(!img)return;
  const cs=getComputedStyle(em),ls=parseFloat(cs.letterSpacing)||0;cx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
  const m=cx.measureText('more'),rsb=m.width-m.actualBoundingBoxRight+ls;img.style.marginLeft=(5-2-rsb).toFixed(2)+'px'}
function mount(root,o){
  const q=k=>root.querySelector('[data-reel='+k+']'),out={};
  const rail=q('rail');
  if(rail){const n=o.counts||{},t=document.createElement('div');
    t.innerHTML=ReelsUFI.html([n.like,n.comment,n.share].map(v=>v==null?'':v),{keys:['like','comment','share']});
    const r=t.firstElementChild;r.dataset.reel='rail';rail.replaceWith(r);out.rail=r}
  const pill=q('pill');if(pill)pill.src=new URL('../sponsored/sponsored-chip.svg',base).href+'?v='+V;
  const d=q('details');
  if(d){
    d.innerHTML='<img class="rl-av" alt="" src="'+u('avatar.svg')+'">'+
      '<div class="rl-who"><p class="rl-t rl-name">Nike</p><i class="rl-ico" style="--m:url('+u('verified.png')+')"></i><i class="rl-ico" style="--m:url('+u('globe.png')+')"></i></div>'+
      '<p class="rl-t rl-cap"><span>'+esc(o.cap)+'…</span><em>more<img alt="" src="'+u('chevron.svg')+'"></em></p>'+
      (o.capX?'<p class="rl-t rl-capx">'+esc(o.capX)+'</p>':'');
    out.details=d;out.capC=d.querySelector('.rl-cap');out.capX=d.querySelector('.rl-capx');
    const fit=()=>fitArrow(out.capC);fit();document.fonts&&document.fonts.ready.then(fit);
    out.rise=t=>{
      d.style.transform=t>0?`translate(0,${(266*t-570*t).toFixed(2)}px)`:'';   // 570 → 266; 2D, painted: no layer of its own to resample
      if(!out.capX)return;
      const e=Math.min(1,Math.max(0,(t-.15)/.6));out.capC.style.opacity=(1-e).toFixed(3);out.capX.style.opacity=e.toFixed(3)};
  }
  const c=q('cta');
  if(c){c.classList.add('ad-cta');c.textContent=o.cta;if(o.color)c.style.setProperty('--rl-cta',o.color);out.cta=c}
  return out}
window.FMSSReel={mount};
})();
