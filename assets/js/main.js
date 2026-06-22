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

// Back-to-top button (v1.34, 2026-06-22) — injected on every page; styles inline so no CSS edit needed
(function(){
  if(document.querySelector('.to-top'))return;
  var css='.to-top{position:fixed;right:18px;bottom:18px;z-index:200;width:46px;height:46px;'+
    'border-radius:50%;background:var(--teal,#0E7C86);color:#fff;font-size:22px;line-height:1;'+
    'box-shadow:0 6px 18px rgba(0,0,0,.25);opacity:0;visibility:hidden;transform:translateY(8px);'+
    'transition:opacity .2s ease,transform .2s ease,background .2s ease;}'+
    '.to-top.show{opacity:1;visibility:visible;transform:translateY(0);}'+
    '.to-top:hover{background:var(--teal-dark,#065A62);}'+
    '.to-top:focus-visible{outline:2px solid var(--gold,#E5B800);outline-offset:3px;}'+
    '@media(prefers-reduced-motion:reduce){.to-top{transition:none;}}';
  var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);

  var btn=document.createElement('button');
  btn.type='button';btn.className='to-top';
  btn.setAttribute('aria-label','Back to top');
  btn.innerHTML='\u2191';
  document.body.appendChild(btn);

  var toggle=function(){btn.classList.toggle('show',window.scrollY>600);};
  window.addEventListener('scroll',toggle,{passive:true});
  toggle();
  btn.addEventListener('click',function(){
    var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    window.scrollTo({top:0,behavior:rm?'auto':'smooth'});
  });
})();
