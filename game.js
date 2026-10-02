/* ¡Clica! — motor del juego. Los niveles están en levels.js */
const $=s=>document.querySelector(s);
const DEBUG=/debug/.test(location.search);
const IMG=(k,c='')=>`<img class="${c}" src="assets/sprites/${k}.png" alt="${k}" draggable="false">`;
let av=1,idx=0,stars=0,err=0,done=false;

function show(id){
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active');
  document.body.classList.toggle('bgmenu',['menu','avs','lv','tut','faq'].includes(id)); /* fondo solo en las pantallas de inicio */
  scrollTo(0,0);
}

/* ---- Avatares ---- */
(function(){
  const g=$('#avgrid');
  for(let i=1;i<=AV_N;i++){
    const b=document.createElement('button');b.className='avb';
    b.innerHTML=`<img src="assets/avatars/avatar${i}.png" alt="Avatar ${i}" draggable="false">`;
    b.onclick=()=>{av=i;g.querySelectorAll('.avb').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');$('#avgo').classList.add('show')};
    g.append(b);
  }
})();

/* ---- Flujo ---- */
function start(){idx=0;stars=0;load()}
function load(){
  const L=LEVELS[idx],st=$('#stage'),h=$('#hud');
  err=0;done=false;
  $('#pb').style.width=(idx/LEVELS.length*100)+'%';
  $('#mc').textContent=(idx+1)+'/'+LEVELS.length;$('#st').textContent='★ '+stars;
  $('#tag').textContent=`NIVEL ${idx+1} · ${L.cat}`;$('#mt').textContent=L.title;$('#ms').textContent=L.sub;
  st.innerHTML=`<img class="bg" src="assets/scenes/${L.scene}" alt="" draggable="false">`;
  h.innerHTML='';$('#fb').className='fb';$('#nx').classList.remove('show');$('#dbg').textContent='';
  const bg=st.querySelector('.bg'),ar=()=>st.style.setProperty('--ar',bg.naturalWidth/bg.naturalHeight);bg.complete?ar():bg.onload=ar; /* la escena se ajusta a la altura de la pantalla */
  const a=L.av?figure(st,L.av,L.type==='avdrag'):null;
  (L.fixed||[]).forEach(o=>{const e=document.createElement('img');e.src=`assets/sprites/${o.icon}.png`;e.className='fig';e.draggable=false;place(e,o);st.append(e)}); /* objetos que se quedan en la escena */
  T[L.type](L,st,h,a);
  if(DEBUG)st.addEventListener('click',e=>{const s=geo(st);
    $('#dbg').textContent=`clic en x=${((e.clientX-s.l)/s.w*100).toFixed(1)}%  y=${((e.clientY-s.t)/s.h*100).toFixed(1)}%`});
  show('game');
}
function next(){idx++;idx<LEVELS.length?load():finish()}
function finish(){
  $('#endav').src=`assets/avatars/avatar${av}.png`;
  $('#fstars').textContent='★'.repeat(stars)+'☆'.repeat(LEVELS.length-stars);
  $('#fmsg').textContent=stars===LEVELS.length?'¡Perfecto! ¡Eres un crack!':stars>=6?'¡Muy bien! Puedes mejorar.':'Sigue practicando. ¡Tú puedes!';
  show('end');
}
function fb(ok,t,n){const f=$('#fb');f.className='fb show '+(ok?'ok':'fail');$('#ft').textContent=t;$('#fn').textContent=n}
function win(L){
  if(done)return;done=true;const s=err===0;if(s)stars++;
  $('#st').textContent='★ '+stars;fb(1,'¡Correcto!',L.ok+(s?'  ★ +1':''));
  $('#nx').textContent=idx===LEVELS.length-1?'FINALIZAR':'CONTINUAR';$('#nx').classList.add('show');
}
function lose(L,hint){err++;fb(0,'Mmm, no...',hint||L.hint)}

/* ---- Utilidades ---- */
const box=r=>`left:${r[0]}%;top:${r[1]}%;width:${r[2]-r[0]}%;height:${r[3]-r[1]}%`;
function place(el,o){el.style.left=o.x+'%';el.style.top=o.y+'%';el.style.width=o.w+'%'}
function figure(st,o,playable){
  const e=document.createElement('img');e.src=`assets/avatars/avatar${av}.png`;e.className=playable?'drag':'fig';e.draggable=false;
  place(e,o);st.append(e);return e;
}
function spot(st,s,fn){
  const d=document.createElement('div');d.className='hs'+(DEBUG?' dbg':'');d.style.cssText=box(s.r);
  d.onclick=()=>{if(!done)fn(d)};st.append(d);return d;
}
function flash(d,c){d.classList.add(c);setTimeout(()=>d.classList.remove(c),450)}
function slot(s){$('#slot').innerHTML=(s.icon?IMG(s.icon):'')+`<span>${s.l}</span>`}
function showZones(st,zs){if(DEBUG)zs.forEach(z=>{const d=document.createElement('div');d.className='zn dbg';d.style.cssText=box(z.r);st.append(d)})}

/* Arrastre por puntero (ratón y táctil). cb(zona|undefined) devuelve true si se queda en su sitio */
/* Medidas del interior de la escena (sin el marco) */
function geo(st){const r=st.getBoundingClientRect();return{l:r.left+st.clientLeft,t:r.top+st.clientTop,w:st.clientWidth,h:st.clientHeight}}
function dragger(el,st,zones,cb){
  const L0=el.style.left,T0=el.style.top;let on=0,ox=0,oy=0;
  el.onpointerdown=e=>{if(done)return;on=1;el.setPointerCapture(e.pointerId);const r=el.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;el.classList.add('dragging')};
  el.onpointermove=e=>{if(!on)return;const s=geo(st);
    el.style.left=(e.clientX-s.l-ox)/s.w*100+'%';el.style.top=(e.clientY-s.t-oy)/s.h*100+'%'};
  el.onpointerup=e=>{
    if(!on)return;on=0;el.classList.remove('dragging');
    const s=geo(st),px=(e.clientX-s.l)/s.w*100,py=(e.clientY-s.t)/s.h*100;
    const z=zones.find(z=>px>=z.r[0]&&px<=z.r[2]&&py>=z.r[1]&&py<=z.r[3]);
    if(z&&cb(z)){
      const w=el.offsetWidth/s.w*100,h=el.offsetHeight/s.h*100;
      el.style.left=(z.r[0]+z.r[2])/2-w/2+'%';el.style.top=(z.b?z.r[3]-h:(z.r[1]+z.r[3])/2-h/2)+'%';
    }else{el.style.left=L0;el.style.top=T0;if(z)cb(z,1)}
  };
}

/* Escribe la palabra en la lista de compras y tacha el producto */
function cross(st,s){
  const w=document.createElement('div');w.className='write';w.style.cssText=box(s.t);w.textContent=s.w;st.append(w);
  const t=document.createElement('div');t.className='tach';t.style.cssText=`left:${s.r[0]}%;width:${s.r[2]-s.r[0]}%;top:${(s.r[1]+s.r[3])/2}%`;st.append(t);
}
function goMenu(){if(confirm('¿Volver al menú? Perderás el progreso de esta partida.'))show('menu')}

/* ---- Tipos de misión ---- */
const T={
  /* Clicar un objeto de la imagen; su sprite aparece en la casilla de selección */
  pick(L,st,h){
    h.innerHTML='<div class="hudrow">'+(L.cart?'<img class="ico" src="assets/ui/icon_carrito.png" alt="">':'<div class="mtag">TU SELECCIÓN</div>')+'<div class="slot" id="slot"></div></div>';
    L.spots.forEach(s=>spot(st,s,d=>{slot(s);if(s.ok){flash(d,'good');win(L)}else{flash(d,'bad');lose(L,s.hint)}}));
  },
  /* Encontrar todos los objetos correctos (p. ej. los dos autos azules) */
  findall(L,st,h){
    const need=L.spots.filter(s=>s.ok).length;let got=0;
    h.innerHTML='<div class="hudrow"><div class="mtag">TU SELECCIÓN</div><div class="pile" id="cart"></div></div>';
    L.spots.forEach(s=>spot(st,s,d=>{
      if(s.ok){
        if(d.classList.contains('sel'))return;
        d.classList.add('sel');$('#cart').innerHTML+=IMG(s.icon);
        if(++got===need)win(L);else fb(1,'¡Bien!','Sigue buscando.');
      }else{flash(d,'bad');lose(L,s.hint)}
    }));
  },
  /* Receta: elegir varios ingredientes (p. ej. cuatro patatas, una cebolla, el aceite y la sal) */
  recipe(L,st,h){
    const got={};L.recipe.forEach(r=>got[r.g]=0);
    h.innerHTML='<div class="mtag">INGREDIENTES</div><ol class="list" id="rl"></ol>';
    const draw=()=>$('#rl').innerHTML=L.recipe.map((r,i)=>`<li class="${got[r.g]>=r.n?'done':''}">${i+1}. ${r.l}${r.n>1?` (${got[r.g]}/${r.n})`:''}</li>`).join('');draw();
    L.spots.forEach(s=>spot(st,s,d=>{
      const r=L.recipe.find(x=>x.g===s.g);
      if(!r){flash(d,'bad');lose(L,s.hint);return}
      if(d.classList.contains('sel'))return;
      if(got[s.g]>=r.n){flash(d,'bad');lose(L,'Solo necesitas '+r.l+'.');return}
      d.classList.add('sel');got[s.g]++;draw();
      if(L.recipe.every(x=>got[x.g]>=x.n))win(L);else fb(1,'¡Bien!','Sigue con la lista.');
    }));
  },
  /* Teclado del banco: escribir una contraseña con los números del teclado */
  keypad(L,st,h){
    let typed='';
    h.innerHTML='<div class="mtag">TU CONTRASEÑA</div><div class="pw" id="pw"></div><ol class="list">'+L.words.map((w,i)=>`<li>${i+1}. ${w}</li>`).join('')+'</ol>';
    const draw=()=>$('#pw').innerHTML=[...L.code].map((_,i)=>`<span class="pwd">${typed[i]||''}</span>`).join('');draw();
    L.spots.forEach(s=>spot(st,s,d=>{
      if(/^\d$/.test(s.k)){
        if(typed.length>=L.code.length)return;
        if(s.k===L.code[typed.length]){flash(d,'good');typed+=s.k;draw();if(typed.length===L.code.length)win(L)}
        else{flash(d,'bad');lose(L)}
      }else if(s.k==='borrar'){typed=typed.slice(0,-1);draw()}
      else if(s.k==='cancelar'){typed='';draw()}
      else fb(0,'Todavía no...','Escribe primero los seis dígitos.');
    }));
  },
  /* Contar con clics */
  count(L,st,h){
    const n=L.spots.map(()=>0);
    h.innerHTML='<div class="hudrow"><img class="ico" src="assets/ui/icon_carrito.png" alt=""><div class="mtag">TU CARRITO</div><div class="pile" id="cart"></div></div><button class="btn-next show" id="go">COMPRAR</button>';
    const draw=()=>$('#cart').innerHTML=L.spots.map((s,i)=>IMG(s.icon).repeat(n[i])).join('')||'<span class="msub">(vacío)</span>';
    draw();
    L.spots.forEach((s,i)=>spot(st,s,()=>{n[i]=(n[i]+1)%7;draw()}));
    $('#go').onclick=()=>{if(!done)L.spots.every((s,i)=>n[i]===(s.n||0))?win(L):lose(L)};
  },
  /* Clicar en el orden de la lista */
  order(L,st,h){
    let p=0;
    h.innerHTML='<div class="hudrow">'+(L.cart?'<img class="ico" src="assets/ui/icon_carrito.png" alt="">':'<div class="mtag">TU LISTA</div>')+'<ol class="list">'+L.order.map((k,i)=>`<li id="li${i}">${i+1}. ${L.spots[k].l}</li>`).join('')+'</ol></div>';
    L.spots.forEach((s,i)=>spot(st,s,d=>{
      if(i===L.order[p]){flash(d,'good');$('#li'+p).classList.add('done');if(s.icon)$('#li'+p).innerHTML+=IMG(s.icon);if(s.t)cross(st,s);if(++p===L.order.length)win(L)}
      else{flash(d,'bad');lose(L)}
    }));
  },
  /* Arrastrar el objeto elegido (tarjeta o efectivo) hasta la caja */
  pay(L,st,h){
    showZones(st,L.zones);
    L.items.forEach(it=>{
      const e=document.createElement('img');e.src=`assets/sprites/${it.icon}.png`;e.className='drag';e.draggable=false;place(e,it);st.append(e);
      dragger(e,st,L.zones,(z,bad)=>{
        if(!bad&&it.ok&&z.ok){win(L);return true}
        if(bad)lose(L,it.hint);return false;
      });
    });
  },
  /* Arrastrar al avatar hasta el lugar correcto */
  avdrag(L,st,h,a){
    showZones(st,L.zones);
    dragger(a,st,L.zones,(z,bad)=>{if(!bad&&z.ok){win(L);return true}if(bad)lose(L);return false});
  },
  /* Arrastrar un objeto de la escena (el avatar solo se ve) */
  move(L,st,h){
    showZones(st,L.zones);
    const e=document.createElement('img');e.src=`assets/sprites/${L.item.icon}.png`;e.className='drag';e.draggable=false;place(e,L.item);st.append(e);
    dragger(e,st,L.zones,(z,bad)=>{if(!bad&&z.ok){win(L);return true}if(bad)lose(L);return false});
  }
};

/* ---- Tutorial: clic -> seleccionar -> arrastrar ---- */
const MOUSE='<button class="mouse" aria-label="clic"><svg viewBox="0 0 64 64" width="110" height="110"><rect x="18" y="8" width="28" height="48" rx="12" fill="#eef0f6" stroke="#14141c" stroke-width="3"/><path d="M19.5 30V22C19.5 14 25 9.5 32 9.5V30Z" fill="#e8834a"/><path d="M18 30h28M32 8v22" stroke="#14141c" stroke-width="3" fill="none"/><circle class="rip" cx="26" cy="20" r="6" fill="none" stroke="#e8834a" stroke-width="3"/></svg></button>';
const ZL={r:[3,10,36,90],ok:1},ZR={r:[64,10,97,90]};
function tutStart(){show('tut');tut(0)}
function tut(n){
  const t=$('#tt'),b=$('#tbody');done=false;
  if(n===0){
    t.textContent='¡Bienvenidos a ¡Clica! Para jugar a este juego, haz clic.';
    b.innerHTML=MOUSE;b.firstChild.onclick=()=>tut(1);
  }else if(n===1){
    t.textContent='¡Muy bien! En este juego hay opciones. Por ejemplo, seleccionar objetos...';
    b.innerHTML='<div class="tp" id="tp">Selecciona la silla</div><div class="opts"><button class="o hl" id="o1">'+IMG('silla')+'</button><button class="o" id="o2">'+IMG('mesa')+'</button></div>';
    $('#o1').onclick=()=>tut(2);
    $('#o2').onclick=()=>{$('#tp').textContent='Esa es la mesa. Selecciona la silla.'};
  }else if(n===2){
    t.textContent='¡Perfecto! También tienes la opción de arrastrar...';
    b.innerHTML='<div class="tp" id="tp">Arrastra la silla hacia la izquierda</div><div class="tstage" id="ts"><div class="tz hl" style="'+box(ZL.r)+'">&lt;--</div><div class="tz" style="'+box(ZR.r)+'">--&gt;</div></div>';
    const ts=$('#ts'),e=document.createElement('img');
    e.src='assets/sprites/silla.png';e.className='drag';e.draggable=false;place(e,{x:44,y:22,w:12});ts.append(e);
    dragger(e,ts,[ZL,ZR],(z,bad)=>{
      if(!bad&&z.ok){setTimeout(()=>tut(3),350);return true}
      if(bad)$('#tp').textContent='Esa es la derecha. Arrastra la silla hacia la izquierda.';
      return false;
    });
  }else{
    t.textContent='¡Enhorabuena! Ahora puedes comenzar a jugar.';
    b.innerHTML='<button class="pbtn b-green wide" onclick="show(\'avs\')">JUGAR</button>';
  }
}

/* ---- Ayuda & FAQ (español / inglés) ---- */
const FAQ={
  es:{h:'Ayuda & FAQ',p:['Bienvenidos a "¡Clica!", el juego de cliquear y apuntar para aprender español.','Este juego ha sido creado con propósitos educativos.','Se recomienda anotar el vocabulario novedoso que aparece en cada nivel.','Si Ud. tiene preguntas sobre su funcionamiento, o problemas en el juego (bugs, virus, etc.), contáctese: "Ludmila-129" (desarrollador del juego).']},
  en:{h:'Help & FAQ',p:['Welcome to "¡Clica!", the point-and-click game for learning Spanish.','This game was created for educational purposes.','We recommend writing down the new vocabulary that appears in each level.','If you have questions about how the game works, or problems with it (bugs, viruses, etc.), please contact: "Ludmila-129" (game developer).']}
};
function faq(l){const f=FAQ[l];$('#fh').textContent=f.h;$('#fp').innerHTML=f.p.map(x=>`<p>${x}</p>`).join('')}

/* Precarga de imágenes: evita que aparezcan "vacías" la primera vez que se usan */
(function(){
  const P=['f_navy','f_dark','f_hover','f_sel','f_ok','f_fail','btn_blue','btn_green','btn_orange','panel','icon_carrito'].map(n=>`assets/ui/${n}.png`);
  LEVELS.forEach(L=>{P.push('assets/scenes/'+L.scene);[...(L.spots||[]),...(L.items||[]),L.item,...(L.fixed||[])].forEach(o=>o&&o.icon&&P.push(`assets/sprites/${o.icon}.png`))});
  ['silla','mesa'].forEach(n=>P.push(`assets/sprites/${n}.png`));
  for(let i=1;i<=AV_N;i++)P.push(`assets/avatars/avatar${i}.png`);
  P.forEach(s=>{new Image().src=s});
})();
