const search=document.querySelector('#search'),order=document.querySelector('#order');
const tabs=[...document.querySelectorAll('[role=tab]')];
let active='mio',mioKind='danmaku',shown=12;
const items={danmaku:[...document.querySelectorAll('#danmaku .barrage')],comments:[...document.querySelectorAll('#comments .thread')],mioDanmaku:[...document.querySelectorAll('#mio-danmaku .barrage')],mioComments:[...document.querySelectorAll('#mio-comments .thread')]};
function current(){return active==='mio'?items[mioKind==='danmaku'?'mioDanmaku':'mioComments']:items[active];}
function isComments(){return active==='comments'||active==='mio'&&mioKind==='comments';}
const more=document.querySelector('#load-more'),empty=document.querySelector('.empty');
function refresh(){
 const q=search.value.trim().toLocaleLowerCase();
 const found=current().filter(x=>x.textContent.toLocaleLowerCase().includes(q));
 current().forEach(x=>x.hidden=true);
 found.slice(0,shown).forEach(x=>x.hidden=false);
 empty.hidden=found.length>0;
 more.hidden=found.length<=shown;
 const count=!isComments()?found.length:found.reduce((n,x)=>n+x.querySelectorAll(active==='mio'?'.comment:not(.context-comment)':'.comment').length,0);
 document.querySelector('#match-count').textContent=q?`${count}件のメッセージが見つかりました`:'';
 document.querySelector('#page-count').textContent=found.length?`${Math.min(shown,found.length)} / ${found.length}${!isComments()?' 件':' スレッド'}`:'';
 document.querySelector('.more-wrap').hidden=!found.length;
}
function switchTab(id){
 active=id;shown=12;
 tabs.forEach(t=>{const selected=t.getAttribute('aria-controls')===id;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;});
 document.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p.id!==id);
 document.querySelector('.sort-wrap').hidden=id!=='comments';
 document.querySelector('#reading-hint').textContent=id==='mio'?'名前だけでなく、会話の流れからも。':id==='danmaku'?'動画の時間順に。時刻を押すと、その場面へ。':'コメントとお返事を、スレッドごとに。';
 refresh();
}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>switchTab(t.getAttribute('aria-controls')));t.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length];next.focus();switchTab(next.getAttribute('aria-controls'));}});});
search.addEventListener('input',()=>{shown=12;refresh();});
document.querySelector('#reset-search').addEventListener('click',()=>{search.value='';refresh();search.focus();});
more.addEventListener('click',()=>{const before=shown;shown+=12;refresh();const next=current().filter(x=>!x.hidden)[before];if(next){const focus=next.querySelector('summary,a');focus?.focus({preventScroll:true});}});
order.addEventListener('change',()=>{const key=order.value==='likes'?'likes':'date';items.comments.sort((a,b)=>Number(b.dataset[key])-Number(a.dataset[key])||Number(b.dataset.date)-Number(a.dataset.date));items.comments.forEach(x=>document.querySelector('#threads').append(x));refresh();});
document.querySelector('#originals').addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-pressed')!=='true';document.querySelectorAll('details.original').forEach(d=>d.open=open);e.currentTarget.setAttribute('aria-pressed',open);e.currentTarget.textContent=open?'原文を閉じる':'原文も表示';});
document.querySelectorAll('[data-kind]').forEach(button=>button.addEventListener('click',()=>{
 mioKind=button.dataset.kind;shown=12;
 document.querySelector('#mio-danmaku').hidden=mioKind!=='danmaku';
 document.querySelector('#mio-comments').hidden=mioKind!=='comments';
 document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',b===button));
 refresh();
}));
document.querySelectorAll('.thread-jump').forEach(button=>button.addEventListener('click',()=>{
 search.value='';switchTab('comments');
 const article=document.getElementById('c'+button.dataset.root);
 const thread=article.closest('.thread');shown=Math.max(12,items.comments.indexOf(thread)+1);refresh();
 article.tabIndex=-1;article.focus({preventScroll:true});article.scrollIntoView({block:'start',behavior:'instant'});
}));
switchTab('mio');
