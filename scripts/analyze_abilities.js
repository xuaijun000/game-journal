const fs = require('fs');
const window = {};
eval(fs.readFileSync('js/data/pkm_champions_data.js','utf8'));
const data = window.PKM_CHAMPIONS_DATA;

const abilityMap = {};
data.forEach(p => {
  (p.abilities||[]).forEach(a => {
    if(!abilityMap[a]) abilityMap[a] = [];
    abilityMap[a].push(p.name);
  });
});

const categories = {
  'A_免疫吸收': {
    title: 'A类 [优先级1]：属性免疫/吸收（直接修正相克矩阵）',
    entries: [
      ['levitate','飘浮','免疫地面系'],
      ['flash-fire','闪火','免疫火系，受火攻击后火系威力+50%'],
      ['water-absorb','蓄水','免疫水系，受水攻击回血1/4'],
      ['dry-skin','干燥皮肤','免疫水系（回血），额外承受火系×1.25'],
      ['volt-absorb','蓄电','免疫电系，受电攻击回血1/4'],
      ['motor-drive','电气引擎','免疫电系，速度+1'],
      ['lightning-rod','避雷针','免疫电系，特攻+1'],
      ['sap-sipper','食草','免疫草系，攻击+1'],
      ['earth-eater','吃土','免疫地面系，回血1/4'],
    ]
  },
  'B_伤害减免': {
    title: 'B类 [优先级1]：伤害减免（影响OHKO判断）',
    entries: [
      ['thick-fat','厚脂肪','受火/冰系伤害×0.5'],
      ['heatproof','耐热','受火系伤害×0.5'],
      ['solid-rock','坚硬岩石','受超效伤害×0.75'],
      ['filter','过滤','受超效伤害×0.75'],
      ['multiscale','多重鳞片','满血时受到伤害×0.5'],
      ['fur-coat','毛皮大衣','物理防御实效×2'],
      ['purifying-salt','净化之盐','受幽灵系×0.5'],
      ['friend-guard','战友护卫','盟友受到的伤害×0.75（双打）'],
      ['water-bubble','水泡','受火系×0.5，同时水系攻击×2'],
    ]
  },
  'C_进攻增幅': {
    title: 'C类 [优先级1]：进攻增幅（影响伤害估算）',
    entries: [
      ['adaptability','适应力','STAB倍率从1.5变为2.0'],
      ['sheer-force','强行','无附加效果技能×1.3'],
      ['technician','技术家','威力<=60的技能×1.5'],
      ['iron-fist','铁拳','拳击类技能×1.2'],
      ['reckless','莽撞','有反弹伤害的技能×1.2'],
      ['strong-jaw','强颌','咬击类技能×1.5'],
      ['mega-launcher','超级发射器','波动/波束类技能×1.5'],
      ['tough-claws','硬爪','接触技能×1.3'],
      ['huge-power','大力士','攻击×2'],
      ['pure-power','纯力','攻击×2'],
      ['hustle','活泼','攻击×1.5，命中×0.8'],
      ['pixilate','像素精灵','一般系技能→妖精系×1.2'],
      ['refrigerate','冷冻皮肤','一般系技能→冰系×1.2'],
      ['aerilate','空气锁','一般系技能→飞行系×1.2'],
      ['dragonize','龙化','一般系技能→龙系'],
      ['liquid-voice','液体之声','音波类技能变为水系'],
      ['sharpness','锋锐','斩击类技能×1.5'],
      ['water-bubble','水泡','水系攻击×2'],
      ['fairy-aura','妖精之力','全场妖精系技能×1.33'],
      ['solar-power','太阳之力','晴天特攻×1.5（每回合扣血）'],
      ['parental-bond','亲子爱','技能攻击两次（第二次0.25x）'],
      ['protean','变幻自如','每次攻击与技能属性一致（常STAB）'],
      ['no-guard','无防备','全技能必中'],
      ['skill-link','连续技','连击技必定命中5次'],
      ['gale-wings','疾风之翼','满血时飞行技能先制+1'],
      ['mold-breaker','破格','无视对方特性（如飘浮）'],
      ['merciless','无情','对中毒的对手必定会心'],
      ['corrosion','腐蚀','可使钢/毒属性中毒'],
      ['sniper','狙击手','会心时伤害×2.25'],
      ['analytic','分析家','最后行动时技能×1.3'],
      ['competitive','好胜心','能力值被降低后特攻大幅提升'],
      ['defiant','不屈之心','能力值被降低后攻击大幅提升'],
      ['super-luck','超级幸运','提高会心命中率'],
      ['unseen-fist','无形拳','接触技能无视保护'],
      ['sand-force','沙之力','沙暴中岩/地面/钢系×1.3'],
    ]
  },
  'D_速度修正': {
    title: 'D类 [优先级1]：速度修正（影响速度档位）',
    entries: [
      ['swift-swim','温水','雨天速度×2'],
      ['chlorophyll','叶绿素','晴天速度×2'],
      ['sand-rush','沙疾','沙暴中速度×2'],
      ['slush-rush','急冻','冰雪天气速度×2'],
      ['surge-surfer','电力加速','电力场地速度×2'],
      ['speed-boost','加速','每回合速度+1档'],
      ['unburden','轻巧','消耗道具后速度×2'],
      ['quick-feet','疾走','异常状态时速度×1.5'],
      ['gooey','黏液','接触此宝可梦者速度-1'],
    ]
  },
  'E_天气场地设置': {
    title: 'E类 [优先级2]：天气设置（联动D类速度）',
    entries: [
      ['drought','日照','出场设置晴天'],
      ['drizzle','降雨','出场设置雨天'],
      ['sand-stream','扬沙','出场设置沙暴'],
      ['snow-warning','降雪','出场设置冰雪天气'],
      ['cloud-nine','天高气爽','消除天气效果'],
      ['sand-spit','喷沙','被攻击时扬起沙暴'],
    ]
  },
  'F_出场换场': {
    title: 'F类 [优先级2]：出场/换场效果',
    entries: [
      ['intimidate','恐吓','出场降低场上所有对方宝可梦攻击-1'],
      ['regenerator','再生力','换场回复1/3最大HP'],
      ['natural-cure','自然回复','换场解除异常状态'],
      ['trace','复制','出场复制对方特性'],
      ['imposter','变形者','出场变形为对方宝可梦'],
      ['mummy','木乃伊','接触后对方特性变为木乃伊'],
      ['wandering-spirit','流浪精神','接触后互换特性'],
      ['hospitality','款待','出场回复盟友1/4HP（双打）'],
      ['curious-medicine','奇药','出场清除盟友能力变化（双打）'],
      ['screen-cleaner','清屏','出场清除所有屏障'],
      ['zero-to-hero','零变英雄','换场后形态变化'],
      ['supreme-overlord','最后的大君主','根据己方KO数提升攻击/特攻'],
    ]
  },
  'G_生存增强': {
    title: 'G类 [优先级1]：生存增强（影响能否被OHKO）',
    entries: [
      ['sturdy','坚硬','满血时必定以1HP生还任何一击'],
      ['magic-guard','魔法防守','只受到攻击技能的直接伤害'],
      ['poison-heal','毒愈','中毒状态每回合回血1/8'],
      ['ice-body','冰雪吸收','冰雪天气每回合回血1/16'],
      ['rain-dish','雨露恩泽','雨天每回合回血1/16'],
      ['rock-head','坚石头','不受反弹伤害'],
      ['multiscale','多重鳞片','满血时受到伤害×0.5（同B类）'],
    ]
  },
  'H_状态附着': {
    title: 'H类 [优先级3]：接触伤害/状态附着',
    entries: [
      ['flame-body','火焰之躯','接触30%几率灼伤对方'],
      ['static','静电','接触30%几率麻痹对方'],
      ['poison-point','毒刺','接触30%几率毒化对方'],
      ['rough-skin','粗糙皮肤','接触使对方受1/8最大HP伤害'],
      ['aftermath','余波','被接触KO时对方受1/4最大HP伤害'],
      ['innards-out','五脏六腑','被KO时造成等同剩余HP的伤害'],
      ['stench','恶臭','命中10%几率使对方畏缩'],
      ['poison-touch','毒化触碰','接触技命中20%几率毒化对方'],
      ['spicy-spray','辛辣喷雾','自定义状态效果'],
    ]
  },
  'I_状态免疫': {
    title: 'I类 [优先级2]：状态/效果免疫（防御型）',
    entries: [
      ['inner-focus','精神力','免疫畏缩'],
      ['own-tempo','我行我素','免疫混乱'],
      ['oblivious','迟钝','免疫着迷/挑衅'],
      ['insomnia','不眠','免疫睡眠'],
      ['limber','柔软','免疫麻痹'],
      ['immunity','免疫','免疫中毒'],
      ['magma-armor','岩浆铠甲','免疫冰冻'],
      ['overcoat','防尘','免疫天气伤害和粉末类技能'],
      ['sweet-veil','甘美面纱','自身和盟友免疫睡眠'],
      ['soundproof','隔音','免疫所有音波类技能（如虫鸣）'],
      ['bulletproof','防弹','免疫弹丸/炮弹类技能'],
      ['aroma-veil','芳香面纱','己方队伍免疫精神攻击'],
      ['flower-veil','花之面纱','草系盟友免疫异常状态和能力下降'],
      ['shield-dust','鳞粉','免疫技能附带次要效果'],
      ['clear-body','净体','能力值不被降低'],
      ['white-smoke','白色烟雾','能力值不被降低'],
      ['mirror-armor','镜甲','将降低能力值的效果反弹回去'],
      ['queenly-majesty','女王的威严','对方无法使用先制技'],
      ['armor-tail','铠尾','对方无法使用先制技'],
      ['damp','湿气','阻止自爆类技能'],
      ['hyper-cutter','大钳夹','攻击能力值不被降低'],
      ['big-pecks','宽胸','防御能力值不被降低'],
      ['keen-eye','锐利目光','命中率不被降低'],
      ['shell-armor','贝壳铠甲','不被会心一击'],
      ['stalwart','坚定','技能不受跟踪/引出影响'],
      ['sticky-hold','黏着','道具无法被夺取'],
    ]
  },
  'J_能力变化触发': {
    title: 'J类 [优先级2]：能力值变化触发',
    entries: [
      ['moxie','自尊心','击倒对方后攻击+1'],
      ['anger-point','愤怒穴位','被会心时攻击提升到最大'],
      ['berserk','暴走','HP降至1/2以下后特攻+1'],
      ['stamina','毅力','受到攻击后防御+1'],
      ['weak-armor','弱点铠甲','受物理攻击后速度+2，防御-1'],
      ['guts','毅力（豁出去）','异常状态时攻击×1.5，灼伤不削攻击'],
      ['marvel-scale','神奇鳞片','异常状态时防御×1.5'],
      ['contrary','反转','能力变化效果反转'],
      ['opportunist','投机者','复制对方能力值的提升'],
      ['electromorphosis','电气变形','被攻击后下次电系技能威力翻倍'],
      ['blaze','猛火','HP<=1/3时火系×1.5'],
      ['overgrow','茂盛','HP<=1/3时草系×1.5'],
      ['torrent','激流','HP<=1/3时水系×1.5'],
      ['swarm','虫之预感','HP<=1/3时虫系×1.5'],
      ['solar-power','太阳之力','晴天特攻×1.5（每回合扣血）'],
      ['justified','正义之心','被恶系命中后攻击+1'],
      ['steadfast','坚定（速度）','每次畏缩速度+1'],
    ]
  },
  'K_特殊复杂': {
    title: 'K类 [优先级3]：特殊/复杂（场合特定，暂不实现）',
    entries: [
      ['forecast','天气变身','根据天气改变属性（卡斯通专属）'],
      ['hunger-switch','饥饿切换','每回合交替形态（蚊香蛙专属）'],
      ['stance-change','战姿变化','攻击/防御时改变形态（坚盾剑怪）'],
      ['disguise','易容','抵消一次伤害（坏坏蛋专属）'],
      ['mimicry','拟态','随场地改变属性'],
      ['illusion','幻觉','出场伪装成队伍最后一只'],
      ['pressure','压迫感','对方使用技能消耗额外PP'],
      ['moody','善变','每回合随机大幅升降能力值'],
      ['prankster','恶作剧之心','非攻击技能先制+1'],
      ['magic-bounce','魔法反射','反弹非伤害性技能'],
      ['synchronize','同步','将异常状态传给造成者'],
      ['unaware','迟钝（无视）','攻守时无视对方能力变化'],
      ['sand-veil','沙隐','沙暴中回避+1'],
      ['snow-cloak','雪隐','冰雪天气中回避+1'],
      ['infiltrator','穿透','无视反射/薄雾/替身'],
      ['scrappy','打架精','一般/格斗系技能可命中幽灵系'],
      ['telepathy','心灵感应','无视盟友技能伤害（双打）'],
      ['gluttony','贪吃鬼','HP<=1/2时即刻使用树果'],
      ['ripen','成熟','树果效果翻倍'],
      ['plus','正电','与负电搭档时特攻×1.5（双打）'],
      ['minus','负电','与正电搭档时特攻×1.5（双打）'],
      ['healer','愈合之心','每回合30%几率治愈盟友异常'],
      ['symbiosis','共生','盟友使用道具后传递自己道具'],
      ['pickup','捡拾','战后可能获得道具'],
      ['cheek-pouch','颊袋','使用树果时额外回血1/3'],
      ['shadow-tag','影子捕捉','对方无法逃脱/换场'],
      ['frisk','感知','出场感知对方持有道具'],
      ['anticipation','预感','感知对方有高效/必杀技'],
      ['klutz','笨拙','无法使用持有道具'],
      ['unnerve','神经质','对方无法使用树果'],
      ['receiver','受信者','继承被KO盟友的特性'],
      ['cursed-body','诅咒之躯','被攻击命中30%几率封印该技能'],
      ['illuminate','发光','实际无战斗效果'],
      ['rivalry','斗争心','对同性×1.25，对异性×0.75'],
      ['shed-skin','脱皮','每回合30%几率自动治愈异常'],
      ['hydration','水化','雨天每回合治愈异常'],
      ['leaf-guard','叶子防守','晴天免疫异常状态'],
      ['cute-charm','迷人之躯','接触30%着迷对方'],
      ['early-bird','早起','睡眠回合数减半'],
      ['stall','怠惰','自身永远最后行动'],
      ['light-metal','轻金属','自身重量减半'],
      ['heavy-metal','重金属','自身重量翻倍'],
      ['magic-guard','魔法防守','只受直接伤害（同G类）'],
      ['ingrain','扎根（非特性）','无'],
      ['pixi-plate','（非特性）','无'],
      ['supersweet-syrup','超甜糖浆','自定义特性'],
      ['mega-sol','超级太阳（自定义）','自定义特性'],
      ['spicy-spray','辛辣喷雾','自定义特性'],
    ]
  },
};

const presentAbilities = new Set(Object.keys(abilityMap));
const classified = new Set();

for(const [catKey, cat] of Object.entries(categories)) {
  console.log('');
  console.log(cat.title);
  console.log('─'.repeat(60));
  cat.entries.forEach(([slug, zh, desc]) => {
    classified.add(slug);
    const inGame = presentAbilities.has(slug);
    const count = abilityMap[slug]?.length || 0;
    const tag = inGame ? ('✓ '+count+'只').padEnd(7) : '✗ 无  ';
    console.log(`  [${tag}] ${slug.padEnd(26)} ${zh}（${desc}）`);
  });
}

console.log('');
console.log('══════════════════════════════════════════════════════════════');
console.log('未归类（数据库中存在）：');
const unclassified = [...presentAbilities].filter(a=>!classified.has(a)).sort();
unclassified.forEach(a=>{
  const pkms = abilityMap[a].slice(0,3).join('、');
  console.log(`  ${a.padEnd(28)} (${abilityMap[a].length}只) 例：${pkms}`);
});

console.log('');
console.log('── 统计 ──');
const totalInGame = [...classified].filter(a=>presentAbilities.has(a)).length;
console.log(`已分类特性：${classified.size}，其中数据库中存在：${totalInGame}`);
console.log(`数据库中总特性：${presentAbilities.size}`);
console.log(`未归类：${unclassified.length}`);
