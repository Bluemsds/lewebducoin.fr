// Menu mobile
const b = document.querySelector('.nav-toggle'), m = document.getElementById('menu');
if (b && m) b.addEventListener('click', () => { const o = m.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
