/* USPS case study: studio display video (menu preview). Plays once, muted, the first time the frame scrolls into view and
   stops on its last frame; the replay button restarts it from 0. prefers-reduced-motion: no autoplay (poster shows), replay still plays on request. */
(function(){
var host=document.querySelector('[data-usps-studio]');if(!host)return;
var v=host.querySelector('video'),btn=host.querySelector('.sd-replay'),io=null,started=false;
var rm=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
v.muted=true;v.loop=false;
function play(){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
function start(){if(started)return;started=true;if(io)io.disconnect();if(!rm.matches)play()}
if('IntersectionObserver' in window){io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=.35)start()})},{threshold:[0,.35]});io.observe(host)}else start();
if(btn)btn.addEventListener('click',function(){started=true;if(io)io.disconnect();try{v.currentTime=0}catch(e){}play()});
})();
