
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

// Lazy YouTube facade
(function(){
  function play(el){
    var id=el.getAttribute('data-yt'); if(!id)return;
    var f=document.createElement('iframe');
    f.setAttribute('src','https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0');
    f.setAttribute('title','Volleyball rotations explainer video');
    f.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    f.setAttribute('allowfullscreen','');
    el.innerHTML=''; el.appendChild(f);
  }
  document.querySelectorAll('.yt-facade').forEach(function(el){
    el.addEventListener('click',function(){play(el);});
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();play(el);}});
  });
})();
