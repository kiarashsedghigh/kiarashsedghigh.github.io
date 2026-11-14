const dialog = document.querySelector('#answer-dialog');
const content = document.querySelector('#answer-content');

const topics = {
  education: {file:'background', intro:'Here’s the path that brought me to cryptography.'},
  publications: {file:'publications', intro:'I explore how to keep trust secure — even in a post-quantum world. Here’s my research.'},
  projects: {file:'projects', intro:'From ideas to implementations. Here’s what I’m building.'},
  news: {file:'news', intro:'A few recent milestones from my research journey.'},
  service: {file:'service', intro:'Research is a community effort. Here’s how I contribute.'}
};
let requestId = 0;
let voiceEnabled = false;
function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.95;
  speechSynthesis.speak(speech);
}
function paragraph(text, className='answer-intro') {
  const p = document.createElement('p'); p.className=className; p.textContent=text; content.append(p);
}
async function respond(topic, question) {
  const current = ++requestId;
  content.replaceChildren();
  if (!dialog.open) dialog.showModal();
  if (question) paragraph('You asked: '+question, 'asked-question');
  if (topic === 'about') {
    const text = 'Hi, I’m Kiarash Sedghi. I’m a Ph.D. researcher at the University of South Florida, working on threshold cryptography, post-quantum signatures, and secure multi-party computation.';
    paragraph(text); paragraph('I’m interested in making cryptographic systems practical, distributed, and ready for the future. Want to explore my education, publications, or projects?', 'answer-error'); speak(text); return;
  }
  if (topic === 'contact') {
    paragraph('Let’s start a conversation.');
    const a=document.createElement('a');a.href='mailto:kiarashs@usf.edu';a.textContent='kiarashs@usf.edu ↗';content.append(a);return;
  }
  const selected=topics[topic];
  if (!selected) {paragraph('Let’s find a good place to start.');paragraph('I can guide you through my education, publications, research projects, news, service, or contact information. Try “What do you research?” or choose a topic below.', 'answer-error');return;}
  paragraph(selected.intro); speak(selected.intro);
  const loading=document.createElement('p');loading.textContent='Opening my portfolio…';content.append(loading);
  try {
    const response=await fetch('data/'+selected.file+'.html');
    if(!response.ok) throw Error('HTTP '+response.status);
    const html=await response.text();
    if(current!==requestId)return;
    loading.remove();
    const template=document.createElement('template');template.innerHTML=html;
    content.append(template.content);
    content.querySelectorAll('button.disabled').forEach(b=>b.disabled=true);
    content.querySelectorAll('a[target="_blank"]').forEach(a=>a.rel='noopener noreferrer');
    // Keep the conversation independent of optional third-party icon services.
    content.querySelectorAll('.proj_lang').forEach(el=>el.remove());
    if(topic==='education')content.querySelector('h2').textContent='Education';
  } catch(error) {
    if(current!==requestId)return;
    loading.textContent='I couldn’t load this part of my portfolio. Please try again.';
    const retry=document.createElement('button');retry.textContent='Try again';retry.addEventListener('click',()=>respond(topic,question));content.append(retry);
  }
}
document.addEventListener('click',event=>{
  const topic=event.target.closest('[data-topic]');if(topic)respond(topic.dataset.topic);
  const tab=event.target.closest('.pub_tab');if(tab){content.querySelectorAll('.pub_tab').forEach(t=>t.classList.toggle('active',t===tab));content.querySelectorAll('.pub_list').forEach(l=>l.classList.toggle('active',l.dataset.pubList===tab.dataset.pub));}
});
window.toggleAbstract=button=>{const abstract=button.closest('.pub_item').querySelector('.pub_abstract');if(!abstract)return;const open=abstract.style.display==='block';abstract.style.display=open?'none':'block';button.textContent=open?'Abstract':'Hide Abstract';button.setAttribute('aria-expanded',String(!open));};
function closeAnswer(){++requestId;dialog.close();if('speechSynthesis' in window)speechSynthesis.cancel();}
document.querySelector('#close-answer').addEventListener('click',closeAnswer);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeAnswer();}});
dialog.addEventListener('cancel',()=>{++requestId;if('speechSynthesis' in window)speechSynthesis.cancel();});

const stage=document.querySelector('.stage');
const head=document.querySelector('#avatar-head');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let greetingTimer, readyTimer;
function startIntroduction(){
  clearTimeout(greetingTimer);clearTimeout(readyTimer);
  stage.classList.remove('scene-ready','scene-greeting');
  const approach=document.querySelector('.character-approach');
  approach.style.animation='none';void approach.offsetWidth;approach.style.animation='';
  if(motion.matches){stage.classList.add('scene-ready');return;}
  greetingTimer=setTimeout(()=>{stage.classList.add('scene-greeting');speak('Hi, I am Kiarash Sedghi.');},4600);
  readyTimer=setTimeout(()=>{stage.classList.add('scene-ready');},7300);
}
document.querySelector('#replay').addEventListener('click',startIntroduction);
const voice=document.querySelector('#voice');
if(!('speechSynthesis' in window)){voice.hidden=true;}else voice.addEventListener('click',()=>{voiceEnabled=true;speak('Hi, I am Kiarash Sedghi.');});
let frame=0;
window.addEventListener('pointermove',event=>{
  if(motion.matches||event.pointerType==='touch')return;
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
    const bounds=head.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(event.clientX-(bounds.left+bounds.width/2))/(innerWidth*.45)));
    const y=Math.max(-1,Math.min(1,(event.clientY-(bounds.top+bounds.height/2))/(innerHeight*.45)));
    head.style.setProperty('--head-y',x*19+'deg');head.style.setProperty('--head-x',-y*10+'deg');head.style.setProperty('--head-z',x*4+'deg');
  });
},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);head.style.setProperty('--head-y','0deg');head.style.setProperty('--head-x','0deg');head.style.setProperty('--head-z','0deg');});
motion.addEventListener('change',()=>{head.removeAttribute('style');startIntroduction();});
startIntroduction();
