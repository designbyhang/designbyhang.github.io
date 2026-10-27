/* FMSS shared edge swipe back (the interactive pop), moved out of Profile & Browse so every FMSS prototype pops the same way.
   Numbers are Profile & Browse's, in its 402pt screen, and scale with the host's width W (P&B: W 402, exactly as before):
   a press within 24pt of the left edge arms it; it takes the gesture once the drag is > 8pt right and more horizontal than vertical;
   the finger drives p = dx / W 1:1 (100ms velocity samples, 80ms freshness); on release it finishes when p > .33 or flicked right
   > 500pt/s (spring ω20 to 1), else snaps back (ω18 to 0): the shared FMSS spring (FMSSIAB.makeSpring, critically damped), with the
   release velocity. The host owns the event routing and what p moves:
     const eb=FMSSEdgeBack.create({width, onMove(p), onEnd(done)});   width in the host's units (number or function)
     eb.zone(x) · eb.claims(dx, dy) · eb.begin(tDown) · eb.move(dx) · eb.end(dx) · eb.settling   (x, dx, dy in the host's units)
   Load after ../iab/iab.js. */
(function(){
'use strict';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const PT=1/402,ZONE=24*PT,SLOP=8*PT,DONE=.33,FLICK=500*PT,W_DONE=20,W_BACK=18;
function create(o){
  const W=typeof o.width==='function'?o.width:()=>o.width;
  let g=null,sp=null;
  return {
    zone:x=>x<ZONE*W(),
    claims:(dx,dy)=>dx>SLOP*W()&&Math.abs(dx)>Math.abs(dy),
    get active(){return !!g},
    get settling(){return !!(sp&&sp.busy)},
    begin(t0){g={s:[[t0!=null?t0:performance.now(),0]]}},
    move(dx){if(!g)return;const now=performance.now();g.s.push([now,dx]);while(g.s.length>2&&now-g.s[0][0]>100)g.s.shift();o.onMove(clamp(dx/W()))},
    end(dx){
      const d=g;g=null;if(!d)return;
      const s=d.s,a=s[0],b=s[s.length-1],dt=(b[0]-a[0])/1000,v=dt>0&&performance.now()-b[0]<80?(b[1]-a[1])/dt:0,w=W();
      let p=clamp(dx/w);const done=p>DONE||v>FLICK*w;
      sp=FMSSIAB.makeSpring(()=>p,q=>{p=q;o.onMove(q)});
      sp.to(done?1:0,{v:v/w,w:done?W_DONE:W_BACK,onDone:()=>o.onEnd(done)});
    }
  };
}
window.FMSSEdgeBack={create};
})();
