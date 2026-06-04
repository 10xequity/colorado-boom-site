
    // Mobile nav toggle
    (function(){
      var t=document.querySelector('.nav-toggle'),n=document.getElementById('primary-nav');
      if(!t||!n)return;
      t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',String(o));t.setAttribute('aria-label',o?'Close menu':'Open menu');});
      n.addEventListener('click',function(e){if(e.target.tagName==='A'&&n.classList.contains('open')){n.classList.remove('open');t.setAttribute('aria-expanded','false');}});
    })();
    // Scroll reveal
    (function(){
      var items=document.querySelectorAll('.reveal');
      if(!items.length||!('IntersectionObserver' in window)){items.forEach(function(el){el.classList.add('visible');});return;}
      var io=new IntersectionObserver(function(entries){entries.forEach(function(en,i){if(en.isIntersecting){setTimeout(function(){en.target.classList.add('visible');},Math.min(i*60,240));io.unobserve(en.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
      items.forEach(function(el){io.observe(el);});
    })();
  
// FAQ accordion
(function(){
  document.querySelectorAll('.faq-q').forEach(function(b){
    b.setAttribute('aria-expanded','false');
    b.addEventListener('click',function(){
      var open=b.parentElement.classList.toggle('open');
      b.setAttribute('aria-expanded',String(open));
    });
  });
})();
