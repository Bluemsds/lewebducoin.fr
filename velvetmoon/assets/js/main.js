/* Velvet Moon — interactions */
(function(){
  var d=document,root=d.documentElement;

  // En-tête qui se compacte
  var header=d.querySelector('.header');
  function onScroll(){header.classList.toggle('small',scrollY>60)}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Menu mobile
  var toggle=d.querySelector('.nav-toggle'),nav=d.getElementById('menu');
  function closeMenu(){nav.classList.remove('open');root.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');d.body.style.overflow=''}
  toggle.addEventListener('click',function(){
    var open=!nav.classList.contains('open');
    nav.classList.toggle('open',open);root.classList.toggle('menu-open',open);
    toggle.setAttribute('aria-expanded',open);d.body.style.overflow=open?'hidden':''
  });
  nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu)});

  // Titres découpés en lignes
  d.querySelectorAll('.split').forEach(function(el){
    var parts=el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML=parts.map(function(p,i){return '<span class="ln"><span style="--i:'+i+'">'+p+'</span></span>'}).join('');
  });

  // Apparitions au défilement
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
    d.querySelectorAll('[data-r],.split').forEach(function(el){io.observe(el)});
  }else root.classList.add('js-off');

  // Parallaxe légère
  var px=[].slice.call(d.querySelectorAll('[data-p]')),heroBg=d.querySelector('.hero-bg');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(innerWidth<900)px=[];
  if(!reduce){
    var tick=false;
    addEventListener('scroll',function(){if(!tick){requestAnimationFrame(function(){
      var vh=innerHeight;
      px.forEach(function(el){var r=el.getBoundingClientRect();var c=(r.top+r.height/2-vh/2);el.style.transform='translateY('+(c*parseFloat(el.dataset.p))+'px)'});
      if(heroBg&&scrollY<vh)heroBg.style.translate='0 '+(scrollY*.3)+'px';
      tick=false});tick=true}},{passive:true});
  }

  // Filtres du portfolio
  var items=[].slice.call(d.querySelectorAll('.masonry a'));
  d.querySelectorAll('.filters button').forEach(function(b,_,all){
    b.addEventListener('click',function(){
      all.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      var f=b.dataset.f;
      items.forEach(function(a){a.classList.toggle('hide',f!=='tout'&&a.dataset.cat!==f)});
    });
  });

  // Visionneuse
  var lb=d.querySelector('.lb');
  if(lb){
  var lbImg=lb.querySelector('img'),lbCap=lb.querySelector('p'),cur=0,last;
  function visible(){return items.filter(function(a){return !a.classList.contains('hide')})}
  function show(i){var v=visible();cur=(i+v.length)%v.length;var a=v[cur];lbImg.src=a.href;lbImg.alt=a.querySelector('img').alt;lbCap.textContent=a.dataset.label+' · '+(cur+1)+' / '+v.length}
  items.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();last=a;show(visible().indexOf(a));lb.classList.add('on');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';lb.querySelector('.lb-x').focus()})});
  function closeLb(){lb.classList.remove('on');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';if(last)last.focus()}
  lb.querySelector('.lb-x').addEventListener('click',closeLb);
  lb.querySelector('.lb-p').addEventListener('click',function(){show(cur-1)});
  lb.querySelector('.lb-n').addEventListener('click',function(){show(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
  addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
  }

  // Formulaire : prépare un e-mail (site statique, pas de serveur)
  var form=d.getElementById('devis');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!form.reportValidity())return;
    var g=function(n){return (form.elements[n].value||'').trim()};
    var body='Nom : '+g('nom')+'\nE-mail : '+g('email')+'\nTéléphone : '+g('tel')+'\nType d\'événement : '+g('type')+'\nDate : '+g('date')+'\nLieu : '+g('lieu')+'\n\n'+g('message');
    location.href='mailto:'+form.dataset.to+'?subject='+encodeURIComponent('Demande de devis — '+g('type'))+'&body='+encodeURIComponent(body);
    form.querySelector('.form-msg').textContent='Votre messagerie va s\'ouvrir avec la demande pré-remplie. Merci !';
  });

  var y=d.getElementById('y');if(y)y.textContent=new Date().getFullYear();
})();
