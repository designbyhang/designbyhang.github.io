(()=>{const els=document.querySelectorAll('.reveal');
if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('in'));}else{
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px'});
els.forEach(e=>io.observe(e));}
const nav=document.querySelector('.nav');addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>8),{passive:true});
document.getElementById('y').textContent=new Date().getFullYear();})();
