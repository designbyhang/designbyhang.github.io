(()=>{const rail=document.getElementById('work'),cur=document.querySelector('.ticks-cur'),track=document.querySelector('.ticks-in');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
// vertical wheel -> horizontal scroll (desktop), like rauno.me
rail.addEventListener('wheel',e=>{if(innerWidth>640&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&!e.ctrlKey){const max=rail.scrollWidth-rail.clientWidth;if(max<=0)return;
  const atEnd=(e.deltaY>0&&rail.scrollLeft>=max-1)||(e.deltaY<0&&rail.scrollLeft<=0);if(atEnd)return;e.preventDefault();rail.scrollLeft+=e.deltaY;}},{passive:false});
addEventListener('wheel',e=>{if(e.target.closest&&!e.target.closest('.rail')&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&innerWidth>640){rail.scrollLeft+=e.deltaY;}},{passive:true});
// keyboard: arrows/page jump card to card
const cards=[...rail.querySelectorAll('.card')];
function go(d){const c=rail.scrollLeft+rail.clientWidth/2;let i=cards.findIndex(k=>k.offsetLeft+k.offsetWidth/2>c-4);if(i<0)i=cards.length-1;
  const t=cards[Math.max(0,Math.min(cards.length-1,i+d))];rail.scrollTo({left:t.offsetLeft+t.offsetWidth/2-rail.clientWidth/2,behavior:rm?'auto':'smooth'});}
addEventListener('keydown',e=>{if(innerWidth<=640||e.target.closest('input,textarea'))return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(1);}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(-1);}});
function ind(){const max=rail.scrollWidth-rail.clientWidth;const p=max>0?rail.scrollLeft/max:0;if(cur&&track)cur.style.transform=`translateX(${p*(track.offsetWidth-18)}px)`;}
rail.addEventListener('scroll',()=>requestAnimationFrame(ind),{passive:true});addEventListener('resize',ind);ind();})();
