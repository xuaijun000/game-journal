// ===== 游戏时刻记录 =====
let momentType = 'highlight';
let momentImgFile = null;

function toggleMomentPanel(){
  const panel = document.getElementById('moment-panel');
  const isOpen = panel.classList.contains('open');
  if(!isOpen){
    // 填充游戏列表
    const sel = document.getElementById('moment-game-select');
    const current = sel.value;
    sel.innerHTML = '<option value="">选择游戏…</option>';
    const names = [...new Set(games.map(g=>g.name))].sort();
    names.forEach(n=>{
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      if(n===current) opt.selected = true;
      sel.appendChild(opt);
    });
  }
  panel.classList.toggle('open');
}

function setMomentType(btn){
  document.querySelectorAll('.moment-type-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  momentType = btn.dataset.type;
}

function onMomentImgSelect(input){
  const file = input.files[0];
  if(!file) return;
  momentImgFile = file;
  const preview = document.getElementById('moment-img-preview');
  const name = document.getElementById('moment-img-name');
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';
  name.textContent = file.name;
}

async function submitMoment(){
  const gameName = document.getElementById('moment-game-select').value;
  const text = document.getElementById('moment-text').value.trim();
  if(!gameName){alert('请选择游戏');return;}
  if(!text && !momentImgFile){alert('请写点内容或上传截图');return;}

  const btn = document.getElementById('moment-submit');
  btn.disabled = true; btn.textContent = '发布中…';

  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){alert('请先登录');return;}

    let imageUrl = null;
    if(momentImgFile){
      const ext = momentImgFile.name.split('.').pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      const {error:upErr} = await db.storage.from('game-screenshots').upload(path, momentImgFile);
      if(upErr) throw upErr;
      const {data:urlData} = db.storage.from('game-screenshots').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const {error} = await db.from('game_moments').insert({
      user_id: session.user.id,
      game_name: gameName,
      content: text,
      type: momentType,
      image_url: imageUrl
    });
    if(error) throw error;

    // 重置面板
    document.getElementById('moment-text').value = '';
    document.getElementById('moment-img-preview').style.display = 'none';
    document.getElementById('moment-img-name').textContent = '';
    document.getElementById('moment-img-input').value = '';
    momentImgFile = null;
    document.getElementById('moment-panel').classList.remove('open');

    // 如果详情弹窗正好打开着同一款游戏，刷新时刻列表
    const detailName = document.getElementById('d-name')?.textContent;
    if(detailName === gameName) loadGameMoments(gameName);

    showToast('时刻已记录 ✓');
  }catch(e){
    alert('发布失败：'+e.message);
  }finally{
    btn.disabled = false; btn.textContent = '发布时刻';
  }
}

// 加载某游戏的时刻列表
async function loadGameMoments(gameName){
  const slot = document.getElementById('game-moments-slot');
  if(!slot) return;
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){slot.innerHTML='';return;}
    const {data,error} = await db.from('game_moments')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('game_name', gameName)
      .order('created_at', {ascending:false});
    if(error||!data?.length){slot.innerHTML='';return;}

    const typeLabel = {highlight:'🌟 高光',rant:'💢 吐槽',idea:'💡 想法',stuck:'🧱 卡关'};
    const typeClass = {highlight:'highlight',rant:'rant',idea:'idea',stuck:'stuck'};

    slot.innerHTML = `<div style="font-size:.8rem;font-weight:600;color:var(--t2);margin:12px 0 6px">📸 游戏时刻 <span style="color:var(--t3);font-weight:400">(${data.length})</span></div>
    <div class="moments-list">${data.map(m=>`
      <div class="moment-item" id="moment-item-${m.id}">
        <div class="moment-item-hdr">
          <span class="moment-item-type ${typeClass[m.type]||'idea'}">${typeLabel[m.type]||'💡 想法'}</span>
          <div style="display:flex;align-items:center;gap:4px">
            <span class="moment-item-date">${new Date(m.created_at).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
            <button class="moment-item-del" onclick="deleteMoment('${m.id}','${gameName}')" title="删除">✕</button>
          </div>
        </div>
        ${m.content?`<div class="moment-item-text">${m.content}</div>`:''}
        ${m.image_url?`<img class="moment-item-img" src="${m.image_url}" alt="" onclick="viewMomentImg('${m.image_url}')">`:''}
      </div>`).join('')}
    </div>`;
  }catch(e){slot.innerHTML='';}
}

async function deleteMoment(id, gameName){
  if(!confirm('删除这条时刻？'))return;
  try{
    // 先查图片URL
    const {data} = await db.from('game_moments').select('image_url').eq('id',id).single();
    await db.from('game_moments').delete().eq('id',id);
    // 删Storage里的图片
    if(data?.image_url){
      const path = data.image_url.split('/moments/')[1];
      if(path) await db.storage.from('game-screenshots').remove([path]);
    }
    loadGameMoments(gameName);
  }catch(e){alert('删除失败');}
}

function viewMomentImg(url){
  const el = document.createElement('div');
  el.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  el.innerHTML=`<img src="${url}" style="max-width:92vw;max-height:90vh;border-radius:8px;object-fit:contain">`;
  el.onclick=()=>document.body.removeChild(el);
  document.body.appendChild(el);
}

