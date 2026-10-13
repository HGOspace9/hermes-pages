// 年表とまとめを、スクロールで1つずつ現す
(function(){const els=document.querySelectorAll('.rv');
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.1});
els.forEach(e=>io.observe(e));})();
