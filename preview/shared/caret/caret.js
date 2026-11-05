/* the iOS text caret's blink (look: caret.css). As iOS: steady while the keyboard comes up, then on / off with no fade: the first on lasts
   1040ms (480 lead + 560), then off 480ms / on 560ms, a 1040ms cycle; every duration a multiple of 8ms. Reduced motion: steady on.
   start(el): blink from now (a live screen, on its full-screen open). loop(t0,t1,T): the same blink as keyframes on a looping timeline of
   length T (a demo's clock), the caret appearing at t0 and leaving at t1 (on through t1, never cut mid off). */
window.FMSSCaret=(function(){
  const ON=560,OFF=480,CY=ON+OFF,LEAD=480,K=ON/CY,RM=matchMedia('(prefers-reduced-motion: reduce)');
  const html=(x,y)=>`<i class="ios-caret" style="left:${x}px;top:${y}px"></i>`;
  function start(el){if(el._ck)el._ck.cancel();el._ck=null;if(RM.matches)return;
    el._ck=el.animate([{opacity:1},{opacity:1,offset:K},{opacity:0,offset:K},{opacity:0}],{duration:CY,delay:LEAD,iterations:Infinity})}
  function loop(t0,t1,T){const k=[{offset:0,opacity:1}];
    for(let t=t0+LEAD+ON;t+OFF<=t1;t+=CY)k.push({offset:t/T,opacity:1},{offset:t/T,opacity:0},{offset:(t+OFF)/T,opacity:0},{offset:(t+OFF)/T,opacity:1});
    k.push({offset:1,opacity:1});return k}
  return {html,start,loop};
})();
