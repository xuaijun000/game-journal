/* ===== 宝可梦背景 ===== */
(function(){
  const canvas=document.getElementById('pkm-canvas');const ctx=canvas.getContext('2d');let W,H;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  window.addEventListener('resize',resize);resize();
  const ID_POOL=[1,4,7,25,39,52,54,94,131,133,143,147,150,151,152,155,158,175,179,196,197,202,212,245,249,250,251,255,258,261,280,300,333,349,350,351,371,380,381,384,385,386,387,390,393,403,417,427,443,448,459,468,470,471,479,480,481,482,483,484,487,491,493,494,495,498,501,509,519,527,543,551,570,572,574,577,585,592,599,605,610,613,622,627,635,643,644,646,647,648,649,650,653,656,661,664,669,672,674,677,679,682,684,686,688,690,692,694,696,698,700,701,702,706,708,710,712,714,722,725,728,731,734,736,739,741,744,746,749,751,753,755,757,759,761,764,766,769,771,774,777,779,782,785,788,789,791,792,800,810,813,816,819,821,824,827,829,831,833,837,840,843,845,848,850,852,854,856,859,862,863,864,865,866,868,870,875,877,882,888,889,890,906,909,912,914,917,919,921,924,927,929,931,933,935,937,939,941,943,945,947,949,951,953,955,957,959,963,965,967,969,971,975,977,979];
  const COUNT=16;const sprites=[];const imgCache={};
  async function loadImg(id){if(imgCache[id])return imgCache[id];return new Promise(resolve=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{imgCache[id]=img;resolve(img);};img.onerror=()=>resolve(null);img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;});}
  function randId(){return ID_POOL[Math.floor(Math.random()*ID_POOL.length)];}
  async function initSprites(){const ids=Array.from({length:COUNT},()=>randId());await Promise.all(ids.map(async(id,i)=>{const img=await loadImg(id);sprites.push({id,img,x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,scale:1.5+Math.random()*2,phase:Math.random()*Math.PI*2,bobAmp:8+Math.random()*12,bobSpeed:.003+Math.random()*.005,alpha:.55+Math.random()*.35,swapTimer:300+Math.floor(Math.random()*400),swapCount:0});}));loop();}
  function loop(){ctx.clearRect(0,0,W,H);for(const sp of sprites){sp.phase+=sp.bobSpeed;const bobY=Math.sin(sp.phase)*sp.bobAmp;sp.x+=sp.vx;sp.y+=sp.vy;const sz=96*sp.scale/3;if(sp.x>W+sz)sp.x=-sz;if(sp.x<-sz)sp.x=W+sz;if(sp.y>H+sz)sp.y=-sz;if(sp.y<-sz)sp.y=H+sz;sp.swapCount++;if(sp.swapCount>=sp.swapTimer){sp.swapCount=0;sp.swapTimer=300+Math.floor(Math.random()*400);const newId=randId();loadImg(newId).then(img=>{sp.id=newId;sp.img=img;});}if(sp.img){const drawW=sp.img.width*sp.scale;const drawH=sp.img.height*sp.scale;ctx.save();ctx.globalAlpha=sp.alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(sp.img,Math.round(sp.x),Math.round(sp.y+bobY),drawW,drawH);ctx.restore();}}requestAnimationFrame(loop);}
  initSprites();
})();

/* ===== 宝可梦专栏 ===== */
const POKEAPI='https://pokeapi.co/api/v2';
const TYPE_COLOR={normal:'#A8A878',fire:'#F08030',water:'#6890F0',electric:'#F8D030',grass:'#78C850',ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',ground:'#E0C068',flying:'#A890F0',psychic:'#F85888',bug:'#A8B820',rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',dark:'#705848',steel:'#B8B8D0',fairy:'#EE99AC'};
const TYPE_ZH={normal:'一般',fire:'火',water:'水',electric:'电',grass:'草',ice:'冰',fighting:'格斗',poison:'毒',ground:'地面',flying:'飞行',psychic:'超能力',bug:'虫',rock:'岩石',ghost:'幽灵',dragon:'龙',dark:'恶',steel:'钢',fairy:'妖精'};
const STAT_ZH={hp:'HP',attack:'攻击',defense:'防御','special-attack':'特攻','special-defense':'特防',speed:'速度'};
const GEN_RANGE={1:[1,151],2:[152,251],3:[252,386],4:[387,493],5:[494,649],6:[650,721],7:[722,809],8:[810,905],9:[906,1010]};
const PKM_SERIES=[{id:'red-blue',name:'红/蓝',year:1996},{id:'yellow',name:'黄',year:1998},{id:'gold-silver',name:'金/银',year:1999},{id:'crystal',name:'水晶',year:2000},{id:'ruby-sapphire',name:'红宝石/蓝宝石',year:2002},{id:'firered-leafgreen',name:'火红/叶绿',year:2004},{id:'emerald',name:'绿宝石',year:2004},{id:'diamond-pearl',name:'钻石/珍珠',year:2006},{id:'platinum',name:'白金',year:2008},{id:'heartgold-soulsilver',name:'心金/魂银',year:2009},{id:'black-white',name:'黑/白',year:2010},{id:'black2-white2',name:'黑2/白2',year:2012},{id:'x-y',name:'X/Y',year:2013},{id:'oras',name:'始源红/蓝',year:2014},{id:'sun-moon',name:'太阳/月亮',year:2016},{id:'usum',name:'究极日月',year:2017},{id:'sword-shield',name:'剑/盾',year:2019},{id:'bdsp',name:'晶灿钻石/明亮珍珠',year:2021},{id:'legends-arceus',name:'传说:阿尔宙斯',year:2022},{id:'scarlet-violet',name:'朱/紫',year:2022},{id:'legends-za',name:'传说:Z-A',year:2025}];

let pkmCollection={},todayPkm=null,pkmChatHistory=[],currentChatPkm=null,pkmChatFromModal=false;
let pkmSearchT=null,genCache={};
const pkmCNCache={};
const pkmDescTransCache={}; // 图鉴翻译缓存 {pkmId: '已翻译文字'}

function typeTag(t){const c=TYPE_COLOR[t]||'#888';return`<span class="pkm-type" style="background:${c}22;color:${c};border:1px solid ${c}44">${TYPE_ZH[t]||t}</span>`;}
function statBar(name,val){const pct=Math.min(100,Math.round(val/255*100));const c=val>=100?'var(--acc2)':val>=60?'var(--acc)':'var(--warn)';return`<div class="pkm-stat-row"><span class="pkm-stat-lbl">${STAT_ZH[name]||name}</span><div class="pkm-stat-bar"><div class="pkm-stat-fill" style="width:${pct}%;background:${c}"></div></div><span class="pkm-stat-val">${val}</span></div>`;}
async function fetchPkm(idOrName){const r=await fetch(`${POKEAPI}/pokemon/${idOrName}`);if(!r.ok)throw new Error('未找到');return r.json();}
async function fetchPkmSpecies(idOrName){const r=await fetch(`${POKEAPI}/pokemon-species/${idOrName}`);if(!r.ok)return null;return r.json();}

// ===== 宝可梦官方简体中文名对照表（全1003只）=====
const PKM_CN_TABLE={1:'妙蛙种子',2:'妙蛙草',3:'妙蛙花',4:'小火龙',5:'火恐龙',6:'喷火龙',7:'杰尼龟',8:'卡咪龟',9:'水箭龟',10:'绿毛虫',11:'铁甲蛹',12:'巴大蝶',13:'独角虫',14:'铁壳蛹',15:'大针蜂',16:'波波',17:'比比鸟',18:'大比鸟',19:'小拉达',20:'拉达',
21:'烈雀',22:'大嘴雀',23:'阿柏蛇',24:'阿柏怪',25:'皮卡丘',26:'雷丘',27:'穿山鼠',28:'穿山王',29:'尼多兰',30:'尼多娜',31:'尼多后',32:'尼多朗',33:'尼多力诺',34:'尼多王',35:'皮皮',36:'皮可西',37:'六尾',38:'九尾',39:'胖丁',40:'胖可丁',
41:'超音蝠',42:'大嘴蝠',43:'走路草',44:'臭臭花',45:'霸王花',46:'派拉斯',47:'派拉斯特',48:'毛球',49:'安穆泥',50:'地鼠',51:'三地鼠',52:'喵喵',53:'猫老大',54:'可达鸭',55:'哥达鸭',56:'猴怪',57:'火暴猴',58:'卡蒂狗',59:'风速狗',60:'蚊香蝌蚪',
61:'蚊香君',62:'蚊香泳士',63:'凯西',64:'勇基拉',65:'胡地',66:'腕力',67:'豪力',68:'怪力',69:'喇叭芽',70:'口呆花',71:'大食花',72:'玛瑙水母',73:'毒刺水母',74:'小拳石',75:'隆隆石',76:'隆隆岩',77:'小火马',78:'烈焰马',79:'呆呆兽',80:'呆壳兽',
81:'小磁怪',82:'三磁怪',83:'大葱鸭',84:'嘟嘟',85:'嘟嘟利',86:'小海狮',87:'白海狮',88:'臭泥',89:'臭臭泥',90:'大舌贝',91:'刺甲贝',92:'鬼斯',93:'鬼斯通',94:'耿鬼',95:'大岩蛇',96:'食梦梦',97:'梦妖',98:'大钳蟹',99:'巨钳蟹',100:'霹雳球',
101:'顽皮雷弹',102:'蛋蛋',103:'椰蛋树',104:'卡拉卡拉',105:'嘎啦嘎啦',106:'飞腿郎',107:'快拳郎',108:'舔舔',109:'毒瓦斯',110:'双弹瓦斯',111:'独角犀牛',112:'钻角犀兽',113:'吉利蛋',114:'蔓藤怪',115:'袋兽',116:'海马仔',117:'刺龙王',118:'角金鱼',119:'金鱼王',120:'海星星',
121:'宝石海星',122:'魔墙人偶',123:'飞天螳螂',124:'迷唇姐',125:'电击兽',126:'鸭嘴火兽',127:'凯罗斯',128:'肯泰罗',129:'鲤鱼王',130:'暴鲤龙',131:'乘龙',132:'百变怪',133:'伊布',134:'水伊布',135:'雷伊布',136:'火伊布',137:'多边兽',138:'菊石兽',139:'多刺菊石兽',140:'化石盔',
141:'镰刀盔',142:'化石翼龙',143:'卡比兽',144:'急冻鸟',145:'闪电鸟',146:'火焰鸟',147:'迷你龙',148:'哈克龙',149:'快龙',150:'超梦',151:'梦幻',152:'菊草叶',153:'月桂叶',154:'大竺葵',155:'火球鼠',156:'火岩鼠',157:'火暴兽',158:'波克达',159:'鳄鱼弟',160:'大力鳄',
161:'尾立',162:'大尾立',163:'咕咕',164:'猫头夜鹰',165:'芭瓢虫',166:'电爆虫',167:'圆丝蛛',168:'阿利多斯',169:'叉字蝠',170:'亮亮鱼',171:'灯笼鱼',172:'皮丘',173:'宝宝丁',174:'布比小丑',175:'波克比',176:'波克基古',177:'天然雀',178:'占卜鸟',179:'咩利羊',180:'茸茸羊',
181:'电龙',182:'美丽花',183:'玛力露',184:'玛力露丽',185:'树才怪',186:'隐水青蛙',187:'跳跳猪',188:'长耳兔',189:'长耳飞兔',190:'傻傻猫',191:'向日种子',192:'向日花怪',193:'乌波',194:'沼跃鱼',195:'蚌壳兽',196:'太阳伊布',197:'月亮伊布',198:'黑暗鸦',199:'呆河马',200:'梦妖幻',
201:'未知图腾',202:'果然翁',203:'麒麟奇',204:'壶壶',205:'盾甲茧',206:'土龙弟弟',207:'天蝎',208:'大钢蛇',209:'布鲁',210:'布鲁皇',211:'刺刺鱼',212:'剑郎',213:'壶缘缘',214:'赫拉克罗斯',215:'迪路兽',216:'熊宝宝',217:'熊霸',218:'岩浆蜗牛',219:'溶岩蜗牛',220:'小山猪',
221:'猪猪兽',222:'珊瑚龙',223:'铁炮鱼',224:'章鱼桶',225:'德利鸟',226:'魔翼飞鱼',227:'钢翼鸟',228:'炎狐兽',229:'黑炎狐',230:'金色海马',231:'小小象',232:'大象巨猿',233:'多边兽Ⅱ',234:'惊角鹿',235:'大画师',236:'飞拳蛙',237:'怪力蛙',238:'迷唇娃',239:'小小雷',240:'小小焰',
241:'大奶罐',242:'幸福蛋',243:'雷公',244:'炎帝',245:'水君',246:'幼基拉斯',247:'沙基拉斯',248:'班基拉斯',249:'路基欧',250:'凤王',251:'时拉比',252:'木守宫',253:'森林蜥蜴',254:'蜥蜴王',255:'火稚鸡',256:'火焰鸡',257:'炽焰鸡',258:'水跃兽',259:'沼跃兽',260:'沼王',
261:'土狼犬',262:'大狼犬',263:'之字郎',264:'之字猫',265:'刺尾虫',266:'盔茧',267:'彩粉蝶',268:'沙茧',269:'毒粉蝶',270:'莲帽小童',271:'莲帽幼童',272:'乐天河童',273:'撒种小僧',274:'长鼻叶',275:'果树怪',276:'赤红雀',277:'天然鸟',278:'长翅鸥',279:'长翅鸥Ⅱ',280:'拉鲁拉丝',
281:'奇鲁莉安',282:'沙奈朵',283:'溅水宝宝',284:'涉水鱼郎',285:'蘑蘑菇',286:'肌肉草',287:'懒懒兽',288:'隐形兽',289:'超级懒兽',290:'土居忍士',291:'铁面忍者',292:'铁面影人',293:'振声虫',294:'超声虫',295:'爆音波',296:'投技少爷',297:'爆打拳师',298:'鼻可丽',299:'竖耳蝙蝠',300:'貌美猫',
301:'猫小姐',302:'闇黑独眼',303:'钢下颚',304:'可可多拉',305:'多拉克',306:'多边兽Ⅲ',307:'忍拳卡',308:'不知翁',309:'雷丘仔',310:'电气兽',311:'正电拍拍',312:'负电拍拍',313:'雄萤虫',314:'雌萤虫',315:'毒蔷薇',316:'毒圆宝',317:'垃圾袋',318:'颚锯鱼',319:'巨牙鲨',320:'吞食兽',
321:'吞食海牛',322:'溶溶熔岩',323:'魔熔兽',324:'煤炭龟',325:'心跳球',326:'迷惑之球',327:'吃吃斯',328:'飞沙蛭',329:'沙漠蜻蜓',330:'螳螂虾',331:'龙舌拉',332:'大灯笼',333:'羽毛球',334:'七夕青鸟',335:'乌拉拉',336:'缠绕蟒',337:'月石宝',338:'太阳宝',339:'泥泥鱼',340:'泥泥鱼王',
341:'龙虾小兵',342:'龙虾将军',343:'黏美人',344:'黏美人偶',345:'海百合',346:'铁羽百合',347:'古空棘鱼',348:'重甲潮流鱼',349:'丑丑鱼',350:'美纳斯',351:'天气娃娃',352:'变色龙',353:'毛球鬼',354:'魔镜台',355:'骷髅公仔',356:'骷髅妈妈',357:'热带龙',358:'铃铛响',359:'阿勃梭鲁',360:'还未孵化',
361:'雪人宝',362:'冰鬼护',363:'海豹球',364:'海豹',365:'帝牙海狮',366:'璀璨贝',367:'勾魂眼',368:'玫瑰海星',369:'巨古拉',370:'心心鱼',371:'幼基古拉',372:'沙壳龙',373:'飞龙',374:'铁哑铃',375:'铁哑铃Ⅱ',376:'巨金怪',377:'雷吉洛克',378:'雷吉艾斯',379:'雷吉斯奇鲁',380:'拉帝亚斯',
381:'拉帝欧斯',382:'盖欧卡',383:'固拉多',384:'烈空坐',385:'基拉祈',386:'代欧奇希斯',387:'草苗龟',388:'浮草龟',389:'树林龟',390:'小猴子',391:'猛火猴',392:'烈焰猴',393:'波加曼',394:'波皇子',395:'帝王拿',396:'姆克儿',397:'姆克鸟',398:'姆克霸',399:'比克斯',400:'大比克斯',
401:'鸣鸣虫',402:'乐乐蟬',403:'小皮皮',404:'莱可儿',405:'路卡利欧',406:'花蓓蓓',407:'玫瑰马',408:'头盔化石',409:'镰刀铁盔',410:'盾甲化石',411:'盾甲化石Ⅱ',412:'结草儿',413:'蓑衣虫',414:'蛾儿',415:'蜂女王',416:'蜂女王Ⅱ',417:'帕其利斯',418:'泳圈鼬',419:'浮潜鼬',420:'樱花儿',
421:'樱花恋',422:'海星海星',423:'单颌怪',424:'双尾怪',425:'飘飘球',426:'逃个球',427:'胖可比',428:'帅胖可',429:'幻影进化',430:'黑翅膀鸦',431:'毛球',432:'喵可丽',433:'叮当钟',434:'臭鼬婴',435:'臭鼬',436:'青铜小钟',437:'青铜钟',438:'土偶娃',439:'魔术师',440:'幸福蛋Ⅱ',
441:'聒噪鸟',442:'幽灵',443:'迷你龙Ⅱ',444:'哈克龙Ⅱ',445:'烈咬陆鲨',446:'卡比兽宝宝',447:'波利',448:'路卡利欧Ⅱ',449:'河马婴',450:'大河马',451:'蝎子',452:'蝎子王',453:'毒蛙',454:'毒镖蛙',455:'捕虫植物',456:'发光鱼',457:'发光鱼Ⅱ',458:'空中曼波',459:'雪球',460:'长毛雪人',
461:'暗伊布',462:'多边兽Ζ',463:'呆呆王',464:'钻角犀兽Ⅱ',465:'蔓藤怪Ⅱ',466:'电击兽Ⅱ',467:'鸭嘴火兽Ⅱ',468:'波克基古Ⅱ',469:'绑架甲虫',470:'草叶伊布',471:'冰伊布',472:'天蝎Ⅱ',473:'象牙猪',474:'多边兽Ζ Ⅱ',475:'艾路雷朵',476:'大鼻球',477:'骷髅盔甲',478:'雪妖女',479:'幽灵洗衣机',480:'知识神',
481:'意志神',482:'情感神',483:'帝牙卢卡',484:'帕路奇亚',485:'骑拉帝纳',486:'雷吉奇卡斯',487:'克雷色利亚',488:'曼妙鱼',489:'妈妈皮',490:'曼纳菲',491:'达克莱伊',492:'谢米',493:'阿尔宙斯',494:'胜利神兽',495:'藤藤蛇',496:'蔓蔓蛇',497:'超级蔓蛇',498:'暖暖猪',499:'顿顿猪',500:'爆香猪',
501:'水水獭',502:'双刃丸',503:'大剑鬼',504:'探探鼠',505:'步哨鼠',506:'小约克',507:'哈约克',508:'长毛狗',509:'扒手猫',510:'酷豹',511:'花椰猴',512:'花椰猿',513:'爆香猴',514:'爆香猿',515:'冷水猴',516:'冷水猿',517:'食梦梦',518:'梦梦蚀',519:'豆豆鸽',520:'咕咕鸽',
521:'高傲雉鸡',522:'斑斑马',523:'雷电斑马',524:'石丸子',525:'地幔岩',526:'庞岩怪',527:'滚滚蝙蝠',528:'心蝙蝠',529:'螺钉地鼠',530:'龙头地鼠',531:'差不多娃娃',532:'搬运小匠',533:'铁骨土人',534:'修建老匠',535:'圆蝌蚪',536:'蓝蟾蜍',537:'蟾蜍王',538:'投摔鬼',539:'打击鬼',540:'虫宝包',
541:'宝包茧',542:'保姆虫',543:'百足蜈蚣',544:'车轮球',545:'蜈蚣王',546:'木棉球',547:'风妖精',548:'百合根娃娃',549:'裙儿小姐',550:'野蛮鲈鱼',551:'黑眼鳄',552:'混混鳄',553:'流氓鳄',554:'火红不倒翁',555:'达摩狒狒',556:'沙铃仙人掌',557:'石居蟹',558:'岩殿居蟹',559:'滑滑小子',560:'头巾混混',
561:'象征鸟',562:'哭哭面具',563:'迭失棺',564:'原盖海龟',565:'肋骨海龟',566:'始祖小鸟',567:'始祖大鸟',568:'破破袋',569:'灰尘山',570:'索罗亚',571:'索罗亚克',572:'泡沫栗鼠',573:'奇诺栗鼠',574:'哥德宝宝',575:'哥德小童',576:'哥德小姐',577:'单卵细胞球',578:'双卵细胞球',579:'人造细胞卵',580:'鸭宝宝',
581:'舞天鹅',582:'迷你冰',583:'多多冰',584:'双倍多多冰',585:'四季鹿',586:'萌芽鹿',587:'电飞鼠',588:'盖盖虫',589:'骑士蜗牛',590:'哎呀球菇',591:'败露球菇',592:'轻飘飘',593:'胖嘟嘟',594:'保姆曼波',595:'电电虫',596:'电蜘蛛',597:'种子铁球',598:'坚果哑铃',599:'齿轮儿',600:'齿轮组',
601:'齿轮怪',602:'麻麻小鱼',603:'麻麻鳗',604:'麻麻鳗鱼王',605:'小灰怪',606:'大宇怪',607:'烛光灵',608:'灯火幽灵',609:'水晶灯火灵',610:'牙牙',611:'斧牙龙',612:'双斧战龙',613:'喷嚏熊',614:'冻原熊',615:'几何雪花',616:'小嘴蜗',617:'敏捷虫',618:'泥巴鱼',619:'功夫鼬',620:'师父鼬',
621:'赤面龙',622:'泥偶小人',623:'泥偶巨人',624:'驹刀小兵',625:'劈斩司令',626:'爆炸头水牛',627:'毛头小鹰',628:'勇士雄鹰',629:'秃鹰丫头',630:'秃鹰娜',631:'熔蚁兽',632:'铁蚁',633:'单首龙',634:'双首暴龙',635:'三首恶龙',636:'燃烧虫',637:'火神蛾',638:'勾帕路翁',639:'代拉基翁',640:'毕力吉翁',
641:'龙卷云',642:'雷电云',643:'莱希拉姆',644:'捷克罗姆',645:'土地云',646:'酋雷姆',647:'凯路迪欧',648:'美洛耶塔',649:'盖诺赛克特',650:'哈力栗',651:'胖胖哈力',652:'布里卡隆',653:'火狐狸',654:'长尾火狐',655:'妖火红狐',656:'呱呱泡蛙',657:'呱头蛙',658:'甲贺忍蛙',659:'掘掘兔',660:'掘地兔',
661:'小箭雀',662:'火箭雀',663:'烈箭鹰',664:'粉蝶虫',665:'粉蝶蛹',666:'彩粉蝶',667:'小狮狮',668:'火炎狮',669:'花蓓蓓',670:'花叶蒂',671:'花洁夫人',672:'坐骑小羊',673:'坐骑山羊',674:'顽皮熊猫',675:'霸道熊猫',676:'多丽米亚',677:'妙喵',678:'超能妙喵',679:'独剑鞘',680:'双剑鞘',
681:'坚盾剑怪',682:'粉香香',683:'芳香精',684:'绵绵泡芙',685:'胖甜妮',686:'好啦鱿',687:'乌贼王',688:'龟脚脚',689:'龟足巨铠',690:'垃垃藻',691:'毒藻龙',692:'铁臂枪虾',693:'钢炮臂虾',694:'伞电蜥',695:'光电伞蜥',696:'宝宝暴龙',697:'怪颚龙',698:'冰雪龙',699:'冰雪巨龙',700:'仙子伊布',
701:'摔角鹰人',702:'咚咚鼠',703:'小碎钻',704:'黏黏宝',705:'黏美儿',706:'黏美龙',707:'钥圈儿',708:'小木灵',709:'朽木妖',710:'南瓜精',711:'南瓜怪人',712:'冰宝',713:'冰岩怪',714:'嗡蝠',715:'音波龙',716:'哲尔尼亚斯',717:'伊裴尔塔尔',718:'基格尔德',719:'蒂安希',720:'胡帕',
721:'波尔凯尼恩',722:'木木枭',723:'投羽枭',724:'狙射树枭',725:'火斑喵',726:'炎热喵',727:'炽焰咆哮虎',728:'球球海狮',729:'花漾海狮',730:'西狮海壬',731:'小笃儿',732:'喇叭啄鸟',733:'铳嘴大鸟',734:'猫鼬少',735:'猫鼬探长',736:'强颚鸡母虫',737:'虫电宝',738:'锹农炮虫',739:'好胜蟹',740:'好胜毛蟹',
741:'花舞鸟',742:'萌虻',743:'蝶结萌虻',744:'岩狗狗',745:'鬃岩狼人',746:'弱丁鱼',747:'好坏星',748:'超坏星',749:'泥驴仔',750:'重泥挽马',751:'滴蛛',752:'滴蛛霸',753:'伪螳草',754:'兰螳花',755:'睡睡菇',756:'灯罩夜菇',757:'夜盗火蜥',758:'焰后蜥',759:'童偶熊',760:'穿着熊',
761:'甜竹竹',762:'甜舞妮',763:'甜冷美后',764:'花疗环环',765:'智挥猩',766:'投掷猴',767:'胆小虫',768:'具甲武者',769:'沙丘娃',770:'噬沙堡爷',771:'拳海参',772:'属性：空',773:'银伴战兽',774:'小陨星',775:'树枕尾熊',776:'爆焰龟兽',777:'托戈德玛尔',778:'谜拟丘',779:'磨牙彩皮鱼',780:'老翁龙',
781:'破破舵轮',782:'心鳞宝',783:'鳞甲龙',784:'杖尾鳞甲龙',785:'卡璞・鸣鸣',786:'卡璞・蝶蝶',787:'卡璞・哞哞',788:'卡璞・鳍鳍',789:'科斯莫古',790:'科斯莫姆',791:'索尔迦雷欧',792:'露奈雅拉',793:'虚吾伊德',794:'爆肌蚊',795:'费洛美螂',796:'电束木',797:'铁火辉夜',798:'纸御剑',799:'恶食大王',800:'奈克洛兹玛',
801:'玛机雅娜',802:'玛夏多',803:'毒贝比',804:'四颚针龙',805:'垒磊石',806:'砰头小丑',807:'捷拉奥拉',808:'美录坦',809:'美录梅塔',810:'敲音猴',811:'啪咚猴',812:'轰擂金刚猩',813:'炎兔儿',814:'腾蹴小将',815:'闪焰王牌',816:'泪眼蜥',817:'变涩蜥',818:'千面避役',819:'贪心栗鼠',820:'藏饱栗鼠',
821:'稚山雀',822:'蓝鸦',823:'钢铠鸦',824:'索侦虫',825:'天罩虫',826:'以欧路普',827:'狡小狐',828:'猾大狐',829:'幼棉棉',830:'白蓬蓬',831:'毛辫羊',832:'毛毛角羊',833:'咬咬龟',834:'暴噬龟',835:'来电汪',836:'逐电犬',837:'小炭仔',838:'大炭车',839:'巨炭山',840:'啃果虫',
841:'苹裹龙',842:'丰蜜龙',843:'沙包蛇',844:'沙螺蟒',845:'古月鸟',846:'刺梭鱼',847:'戽斗尖梭',848:'电音婴',849:'颤弦蝾螈',850:'烧火蚣',851:'焚焰蚣',852:'拳拳蛸',853:'八爪武师',854:'来悲茶',855:'怖思壶',856:'迷布莉姆',857:'提布莉姆',858:'布莉姆温',859:'捣蛋小妖',860:'诈唬魔',
861:'长毛巨魔',862:'堵拦熊',863:'喵头目',864:'魔灵珊瑚',865:'葱游兵',866:'踏冰人偶',867:'迭失板',868:'小仙奶',869:'霜奶仙',870:'列阵兵',871:'啪嚓海胆',872:'雪吞虫',873:'雪绒蛾',874:'巨石丁',875:'冰砌鹅',876:'爱管侍',877:'莫鲁贝可',878:'铜象',879:'大王铜象',880:'雷鸟龙',
881:'雷鸟海兽',882:'鳃鱼龙',883:'鳃鱼海兽',884:'铝钢龙',885:'多龙梅西亚',886:'多龙奇',887:'多龙巴鲁托',888:'苍响',889:'藏玛然特',890:'无极汰那',891:'熊徒弟',892:'武道熊师',893:'萨戮德',894:'雷吉艾勒奇',895:'雷吉铎拉戈',896:'雪暴马',897:'灵幽马',898:'蕾冠王',899:'诡角鹿',900:'劈斧螳螂',
901:'月月熊',902:'幽尾玄鱼',903:'大狃拉',904:'万针鱼',905:'眷恋云',906:'新叶喵',907:'蒂蕾喵',908:'魔幻假面喵',909:'呆火鳄',910:'炙烫鳄',911:'骨纹巨声鳄',912:'润水鸭',913:'涌跃鸭',914:'狂欢浪舞鸭',915:'爱吃豚',916:'飘香豚',917:'团珠蛛',918:'操陷蛛',919:'豆蟋蟀',920:'烈腿蝗',
921:'布拨',922:'布土拨',923:'巴布土拨',924:'一对鼠',925:'一家鼠',926:'狗仔包',927:'麻花犬',928:'迷你芙',929:'奥利纽',930:'奥利瓦',931:'怒鹦哥',932:'盐石宝',933:'盐石垒',934:'盐石巨灵',935:'炭小侍',936:'红莲铠骑',937:'苍炎刃鬼',938:'光蚪仔',939:'电肚蛙',940:'电海燕',
941:'大电海燕',942:'偶叫獒',943:'獒教父',944:'滋汁鼹',945:'涂标客',946:'纳噬草',947:'怖纳噬草',948:'原野水母',949:'陆地水母',950:'毛崖蟹',951:'热辣娃',952:'狠辣椒',953:'虫滚泥',954:'虫甲圣',955:'飘飘雏',956:'超能艳鸵',957:'小锻匠',958:'巧锻匠',959:'巨锻匠',960:'海地鼠',
961:'三海地鼠',962:'下石鸟',963:'波普海豚',964:'海豚侠',965:'噗隆隆',966:'普隆隆姆',967:'摩托蜥',968:'拖拖蚓',969:'晶光芽',970:'晶光花',971:'墓仔狗',972:'墓扬犬',973:'纠红鹤',974:'走鲸',975:'浩大鲸',976:'轻身鳕',977:'吃吼霸',978:'米立龙',979:'弃世猴',980:'土王',
981:'奇麒麟',982:'土龙节节',983:'仆刀将军',984:'雄伟牙',985:'吼叫尾',986:'猛恶菇',987:'振翼发',988:'爬地翅',989:'沙铁皮',990:'铁辙迹',991:'铁包袱',992:'铁臂膀',993:'铁脖颈',994:'铁毒蛾',995:'铁荆棘',996:'凉脊龙',997:'冻脊龙',998:'戟脊龙',999:'索财灵',1000:'赛富豪',
1001:'古简蜗',1002:'古剑豹',1003:'古鼎鹿',1004:'古玉鱼',1005:'轰鸣月',1006:'铁武者',1007:'故勒顿',1008:'密勒顿',1009:'波荡水',1010:'铁斑叶',1011:'裹蜜虫',1012:'斯魔茶',1013:'来悲粗茶',1014:'够赞狗',1015:'愿增猿',1016:'吉雉鸡',1017:'厄诡椪',1018:'铝钢桥龙',1019:'蜜集大蛇',1020:'破空焰',
1021:'猛雷鼓',1022:'铁磐岩',1023:'铁头壳',1024:'太乐巴戈斯',1025:'桃歹郎'};


// 图鉴文字 AI 翻译（带缓存）
async function translatePkmDesc(pkmId,engText,btnEl,targetEl){
  if(pkmDescTransCache[pkmId]){targetEl.innerHTML=pkmDescTransCache[pkmId];btnEl.style.display='none';return;}
  btnEl.classList.add('loading');btnEl.textContent='翻译中…';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:'请将以下宝可梦图鉴文字翻译成简体中文，只输出翻译结果，不要加任何解释或符号：\n'+engText}]}],generationConfig:{maxOutputTokens:200,temperature:0.3}})
    });
    const d=await res.json();
    const translated=(d.candidates?.[0]?.content?.parts?.[0]?.text||'').trim();
    if(translated){
      const html='<span class="pkm-translated-text">'+translated+'</span>';
      pkmDescTransCache[pkmId]=html;
      targetEl.innerHTML=html;
      btnEl.style.display='none';
    }else{throw new Error('空响应');}
  }catch(e){
    btnEl.classList.remove('loading');
    btnEl.textContent='🌐 AI翻译';
    btnEl.title='翻译失败，点击重试';
  }
}
async function getPkmCNName(id,engName){
  // 优先查运行时缓存
  if(pkmCNCache[id])return pkmCNCache[id];
  // 请求 PokéAPI 获取官方中文名（zh-Hans 简体 > zh-Hant 繁体）
  try{
    const r=await fetch(`${POKEAPI}/pokemon-species/${id}`);
    if(!r.ok)return pkmCNCache[id]=PKM_CN_TABLE[id]||engName||'';
    const d=await r.json();
    const zhHans=d.names?.find(x=>x.language.name==='zh-Hans');
    const zhHant=d.names?.find(x=>x.language.name==='zh-Hant');
    // API 官方中文名优先，找不到才降级用内置对照表，最后用英文名兜底
    const cn=zhHans?.name||zhHant?.name||PKM_CN_TABLE[id]||engName||'';
    return pkmCNCache[id]=cn;
  }catch{return pkmCNCache[id]=PKM_CN_TABLE[id]||engName||'';}
}
function getCNName(species,engName){if(species){const n=species.names?.find(x=>x.language.name==='zh-Hans'||x.language.name==='zh-Hant');if(n?.name){if(species.id)pkmCNCache[species.id]=n.name;return n.name;}}return null;}
function getCNFlavorText(species){
  if(!species)return null;
  const entries=species.flavor_text_entries||[];
  // 优先简体中文，其次繁体中文，最后英文兜底（部分新世代只有英文图鉴）
  const zh=entries.find(x=>x.language.name==='zh-Hans')
          ||entries.find(x=>x.language.name==='zh-Hant');
  if(zh)return zh.flavor_text.replace(/\f|\n/g,' ').trim();
  const en=entries.find(x=>x.language.name==='en');
  return en?en.flavor_text.replace(/\f|\n/g,' ').trim():null;
}

async function loadTodayPkm(random=false){
  let seed=Math.floor(Math.random()*1010)+1;
  try{
    document.getElementById('pkm-today-name').textContent='加载中…';
    document.getElementById('pkm-today-desc').textContent='';
    document.getElementById('pkm-today-locations').innerHTML='';
    const p=await fetchPkm(seed);
    const speciesName=p.species?.name||p.name.replace(/-(standard|galar|alola|hisui|paldea|incarnate|aria|baile|midday|solo|red-striped|blue-striped|natural|male|female|plant|sandy|trash|heat|wash|frost|fan|mow|normal|attack|defense|speed|ordinary|overcast|sunshine|land|sky|zen|original|therian|black|white|resolute|ordinary|pirouette|active|shield|blade|confined|unbound|50|complete|10|dusk|dawn|ultra|original|crowned|ice|shadow|hangry|full-belly|gorging|family-of-four|four|nasal|droopy|stretchy|curly|small|large|super|eternal|average|small|large|super|red|orange|yellow|green|blue|indigo|violet|heart|star|diamond|deprived|well-fed|belly-full|hangry|phony|antique|disguised|busted|meteor|core|school|disguised|midday|midnight|dusk|dawn|ultra)$/,'').replace(/-[a-z]+$/,'');
    const sp=await fetchPkmSpecies(speciesName).catch(()=>null)||await fetchPkmSpecies(p.id).catch(()=>null);
    todayPkm={...p,species:sp};
    // 先拿中文名再渲染，保证不显示英文
    let cnName=getCNName(sp,speciesName);
    if(!cnName)cnName=await getPkmCNName(p.id,speciesName);
    renderTodayPkm(p,sp,cnName);
    await loadPkmCollection();
    updateTodayBtns();
    loadPkmEncounters(p.id,p.name);
  }catch(e){console.error('宝可梦加载失败',e);}
}

// 各世代游戏名称映射（英文->中文）
const GAME_NAME_ZH={
  'red':'红','blue':'蓝','yellow':'黄','gold':'金','silver':'银','crystal':'水晶',
  'ruby':'红宝石','sapphire':'蓝宝石','emerald':'绿宝石','firered':'火红','leafgreen':'叶绿',
  'diamond':'钻石','pearl':'珍珠','platinum':'白金','heartgold':'心金','soulsilver':'魂银',
  'black':'黑','white':'白','black-2':'黑2','white-2':'白2',
  'x':'X','y':'Y','omega-ruby':'始源红宝石','alpha-sapphire':'始源蓝宝石',
  'sun':'太阳','moon':'月亮','ultra-sun':'究极之日','ultra-moon':'究极之月',
  'sword':'剑','shield':'盾','brilliant-diamond':'晶灿钻石','shining-pearl':'明亮珍珠',
  'legends-arceus':'传说:阿尔宙斯','scarlet':'朱','violet':'紫'
};

// 常见地名翻译（英文路由名 -> 中文）
const LOC_ZH={
  'route':'道路','road':'小路','cave':'山洞','forest':'森林','tower':'塔',
  'island':'岛','lake':'湖','mountain':'山','city':'市','town':'镇',
  'village':'村','ruins':'遗迹','path':'小道','sea':'海','river':'河',
  'area':'地区','safari':'狩猎区','ranch':'牧场','desert':'沙漠',
  'valley':'山谷','volcano':'火山','shrine':'神殿','temple':'圣所',
  'mansion':'大厦','gym':'道馆','gate':'门','bridge':'桥','meadow':'草地',
  'garden':'庭园','power':'发电站','plant':'发电站','museum':'博物馆',
  'airport':'机场','port':'港口','harbor':'港口','cliff':'悬崖',
  'beach':'海滩','coast':'海岸','woods':'树林','park':'公园','hill':'丘陵',
  'plateau':'高原','tower':'塔楼','lab':'研究所','outpost':'前哨',
  'wilds':'荒野','fields':'田野','heights':'高地','badlands':'荒地',
  'mirage':'幻影','pal':'宝可梦牧场','safari':'狩猎区',
  // 具体地名
  'pallet':'真新镇','viridian':'常磐市','pewter':'グレー市','cerulean':'ハナダ市',
  'vermilion':'クチバ市','lavender':'シオン','celadon':'タマムシ','fuchsia':'セキチク',
  'saffron':'ヤマブキ','cinnabar':'グレン','victory':'勝利','indigo':'インディゴ',
  'littleroot':'コトキ','oldale':'カイナ','petalburg':'トウカ','rustboro':'カナズミ',
  'dewford':'ムロ','slateport':'カイナ','mauville':'キンセツ','verdanturf':'シダケ',
  'fallarbor':'ハジツゲ','lavaridge':'フエンタウン','fortree':'ヒワマキ',
  'lilycove':'ミナモ','mossdeep':'トクサネ','sootopolis':'ルネ','ever':'エバーグランデ',
  'twinleaf':'フタバ','sandgem':'マサゴ','jubilife':'コトブキ','oreburgh':'クロガネ',
  'floaroma':'ソノオ','eterna':'ハクタイ','hearthome':'ヨスガ','solaceon':'ズイ',
  'veilstone':'トバリ','pastoria':'ノモセ','celestic':'ミオ','canalave':'ミオ',
  'snowpoint':'キッサキ','sunyshore':'ナギサ','lake-verity':'真実の湖','lake-valor':'知識の湖',
  'spear-pillar':'やりのはしら','mt-coronet':'テンガン山',
  // 神奥地名
  'nuvema':'カノコ','accumula':'カラクサ','striaton':'サンヨウ','nacrene':'シッポウ',
  'castelia':'ヒウン','nimbasa':'ライモン','driftveil':'ホドモエ','mistralton':'フキヨセ',
  'lentimas':'リュウラセン','undella':'サザナミ','lacunosa':'ラクツ','opelucid':'ソウリュウ',
  'pokemon-league':'ポケモンリーグ','victory-road':'チャンピオンロード',
};

function translateLocation(engName){
  if(!engName)return engName;
  // 先整体匹配
  const lower=engName.toLowerCase().replace(/-/g,' ');
  // 尝试分词翻译
  let result=lower;
  // 处理 route N 格式
  const routeMatch=lower.match(/route\s*(\d+)/);
  if(routeMatch)return`${routeMatch[1]}号道路`;
  // 处理 mt. / mount 格式
  if(lower.includes('mt') || lower.includes('mount'))result=result.replace(/mt\.?|mount/,'').trim()+'山';
  // 逐词替换
  Object.entries(LOC_ZH).forEach(([en,zh])=>{result=result.replace(new RegExp(`\\b${en}\\b`,'gi'),zh);});
  // 去掉多余空格，首字母大写
  return result.replace(/\s+/g,' ').trim()||engName;
}

async function loadPkmEncounters(pkmId,engName){
  const locEl=document.getElementById('pkm-today-locations');
  if(!locEl)return;
  locEl.innerHTML=`<div style="font-size:.7rem;color:var(--t3);margin-bottom:4px;font-family:'DM Mono',monospace">🗺 各世代获取方式</div><div style="font-size:.72rem;color:var(--t3)">查询中…</div>`;
  try{
    const r=await fetch(`${POKEAPI}/pokemon/${pkmId}/encounters`);
    if(!r.ok){locEl.innerHTML='';return;}
    const data=await r.json();
    if(!data||!data.length){
      locEl.innerHTML=`<div style="font-size:.7rem;color:var(--t3);margin-bottom:4px;font-family:'DM Mono',monospace">🗺 获取方式</div><div style="font-size:.75rem;color:var(--t3)">通过进化、交换或特殊事件获得</div>`;
      return;
    }
    // 按游戏分组，合并地点
    const byGame={};
    data.forEach(loc=>{
      const rawLoc=loc.location_area.name.replace(/-area$/,'').replace(/-/g,' ');
      loc.version_details.forEach(vd=>{
        const g=vd.version.name;
        if(!byGame[g])byGame[g]=new Set();
        byGame[g].add(rawLoc);
      });
    });
    // 按游戏版本排序（优先显示新世代）
    const gameOrder=['scarlet','violet','legends-arceus','brilliant-diamond','shining-pearl','sword','shield','ultra-sun','ultra-moon','sun','moon','omega-ruby','alpha-sapphire','x','y','black-2','white-2','black','white','heartgold','soulsilver','platinum','diamond','pearl','firered','leafgreen','emerald','ruby','sapphire','crystal','gold','silver','yellow','red','blue'];
    const sortedGames=Object.keys(byGame).sort((a,b)=>{const ia=gameOrder.indexOf(a);const ib=gameOrder.indexOf(b);return(ia<0?99:ia)-(ib<0?99:ib);});
    const html=sortedGames.map(g=>{
      const zhName=GAME_NAME_ZH[g]||g;
      const locs=[...byGame[g]].slice(0,3).map(l=>translateLocation(l)).join('、');
      return`<div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:4px">
        <span style="font-size:.62rem;padding:1px 6px;border-radius:3px;background:rgba(96,165,250,.15);color:var(--acc);white-space:nowrap;flex-shrink:0;font-family:'DM Mono',monospace">${zhName}</span>
        <span style="font-size:.7rem;color:var(--t2);line-height:1.45">${locs}</span>
      </div>`;
    }).join('');
    locEl.innerHTML=`<div style="font-size:.7rem;color:var(--t3);margin-bottom:6px;font-family:'DM Mono',monospace;letter-spacing:.04em">🗺 各世代获取地点（${sortedGames.length}个版本）</div>${html}`;  }catch(e){if(locEl)locEl.innerHTML='';}
}

function renderTodayPkm(p,sp,cnName){
  const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
  const img2=p.sprites?.front_default||img;
  document.getElementById('pkm-today-img').src=img2;
  document.getElementById('pkm-today-bg').style.backgroundImage=img?`url(${img})`:'none';
  const name=PKM_CN_TABLE[Number(p.id)]||cnName||getCNName(sp,sp?.name||p.name)||(sp?.name||p.name);
  document.getElementById('pkm-today-num').textContent=`#${String(p.id).padStart(3,'0')}`;
  document.getElementById('pkm-today-name').textContent=name;
  document.getElementById('pkm-today-types').innerHTML=p.types.map(t=>typeTag(t.type.name)).join('');
  document.getElementById('pkm-today-stats').innerHTML=p.stats.map(s=>statBar(s.stat.name,s.base_stat)).join('');
  // 图鉴描述（中文优先，无中文则显示英文并标注）
  const descEl=document.getElementById('pkm-today-desc');
  if(descEl){
    const zhDesc=getCNFlavorText(sp);
    if(zhDesc){
      descEl.innerHTML=`<span>${zhDesc}</span>`;
      descEl.style.display='block';
    }else if(sp){
      // 无中文图鉴：尝试取英文描述并标注
      const enEntry=(sp.flavor_text_entries||[]).find(x=>x.language.name==='en');
      const enDesc=enEntry?enEntry.flavor_text.replace(/\f|\n/g,' ').trim():null;
      if(enDesc){
        const todayPkmId=p?.id||0;
        const todayEngText=enDesc;
        descEl.innerHTML=`<span style="color:var(--t3);font-size:.7rem;font-style:normal;margin-bottom:3px;display:block">📖 暂无中文图鉴</span><span id="pkm-today-en-text">${todayEngText}</span><div><button class="pkm-translate-btn" id="pkm-today-translate-btn" onclick="translatePkmDesc(${todayPkmId},document.getElementById('pkm-today-en-text').textContent,this,document.getElementById('pkm-today-en-text'))">🌐 AI翻译</button></div>`;
        if(pkmDescTransCache[todayPkmId]){document.getElementById('pkm-today-en-text').innerHTML=pkmDescTransCache[todayPkmId];const b=document.getElementById('pkm-today-translate-btn');if(b)b.style.display='none';}
        descEl.style.display='block';
      }else{descEl.textContent='';descEl.style.display='none';}
    }else{descEl.textContent='';descEl.style.display='none';}
  }
  loadEvoChain(sp,'pkm-today-evo');
}
async function loadEvoChain(sp,containerId){
  if(!sp?.evolution_chain?.url)return;
  try{
    const r=await fetch(sp.evolution_chain.url);const ec=await r.json();
    const chain=[];let cur=ec.chain;while(cur){chain.push(cur.species.name);cur=cur.evolves_to?.[0];}
    if(chain.length<=1){document.getElementById(containerId).innerHTML='';return;}
    const items=await Promise.all(chain.map(async n=>{const p=await fetchPkm(n);const s=await fetchPkmSpecies(n);const img=p.sprites?.front_default||'';const cn=getCNName(s,n)||(await getPkmCNName(p.id,n));return{name:n,cn,img,id:p.id};}));
    document.getElementById(containerId).innerHTML=`<div style="font-size:.68rem;color:var(--t3);margin-bottom:4px;font-family:'DM Mono',monospace">进化链</div><div class="pkm-evo-chain">${items.map((it,i)=>`${i>0?'<span class="pkm-evo-arrow">→</span>':''}<div class="pkm-evo-item" onclick="openPkmDetail(${it.id})"><img src="${it.img}" alt=""><div class="pkm-evo-name">${it.cn}</div></div>`).join('')}</div>`;
  }catch(e){}
}
async function loadPkmCollection(){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  const{data}=await db.from('pkm_collection').select('*').eq('user_id',session.user.id);
  pkmCollection={};(data||[]).forEach(r=>{if(!pkmCollection[r.pkm_id])pkmCollection[r.pkm_id]={};pkmCollection[r.pkm_id][r.status]=r.id;});
}
function updateTodayBtns(){
  if(!todayPkm)return;const col=pkmCollection[todayPkm.id]||{};
  ['caught','liked','wanted'].forEach(s=>{const btn=document.getElementById(`pkm-btn-${s}`);if(btn){btn.className='pkm-btn'+(col[s]?` ${s}`:'');}});
}
async function togglePkmStatus(status){
  const{data:{session}}=await db.auth.getSession();if(!session?.user){alert('请先登录');return;}
  if(!todayPkm)return;await togglePkmStatusFor(todayPkm.id,todayPkm.name,status);updateTodayBtns();
  if(document.getElementById('ov-pkm').classList.contains('on'))updateDetailBtns(todayPkm.id);
}
async function togglePkmStatusModal(status){
  const{data:{session}}=await db.auth.getSession();if(!session?.user){alert('请先登录');return;}
  const id=parseInt(document.getElementById('pkm-detail-num').textContent.replace('#',''));
  const name=document.getElementById('pkm-detail-name').textContent;
  await togglePkmStatusFor(id,name,status);updateDetailBtns(id);
  if(todayPkm&&todayPkm.id===id)updateTodayBtns();
}
async function togglePkmStatusFor(pkmId,pkmName,status){
  const{data:{session}}=await db.auth.getSession();const user=session?.user;if(!user)return;
  const col=pkmCollection[pkmId]||{};
  if(col[status]){await db.from('pkm_collection').delete().eq('id',col[status]);delete col[status];}
  else{const{data}=await db.from('pkm_collection').insert({user_id:user.id,pkm_id:pkmId,pkm_name:pkmName,status}).select().single();if(data){if(!pkmCollection[pkmId])pkmCollection[pkmId]={};pkmCollection[pkmId][status]=data.id;}}
}
function updateDetailBtns(pkmId){
  const col=pkmCollection[pkmId]||{};
  ['caught','liked','wanted'].forEach(s=>{const btn=document.getElementById(`pkm-detail-${s}`);if(btn){btn.className='pkm-btn'+(col[s]?` ${s}`:'');}});
}
async function openPkmDetail(idOrName){
  document.getElementById('ov-pkm').classList.add('on');
  document.getElementById('pkm-detail-name').textContent='加载中…';
  try{
    const p=await fetchPkm(idOrName);const sp=await fetchPkmSpecies(p.species.url.split('/').slice(-2)[0]);
    // 名字：优先 PKM_CN_TABLE（覆盖所有世代），再查 API，最后英文兜底
    const cnName=PKM_CN_TABLE[Number(p.id)]||getCNName(sp,p.name)||(await getPkmCNName(p.id,p.name))||p.name;
    // 图鉴文字：中文优先，无中文显示英文并标注
    const entries=sp?.flavor_text_entries||[];
    const zhEntry=entries.find(x=>x.language.name==='zh-Hans')||entries.find(x=>x.language.name==='zh-Hant');
    const enEntry=entries.find(x=>x.language.name==='en');
    const descEl=document.getElementById('pkm-detail-desc');
    if(zhEntry){
      descEl.innerHTML=`<span>${zhEntry.flavor_text.replace(/\f|\n/g,' ').trim()}</span>`;
    }else if(enEntry){
      const engText=enEntry.flavor_text.replace(/\f|\n/g,' ').trim();
      const pkmId=p.id;
      descEl.innerHTML=`<span style="color:var(--t3);font-size:.72rem;display:block;margin-bottom:3px">📖 暂无中文图鉴</span><span id="pkm-en-desc-text">${engText}</span><div><button class="pkm-translate-btn" id="pkm-translate-btn" onclick="translatePkmDesc(${pkmId},document.getElementById('pkm-en-desc-text').textContent,this,document.getElementById('pkm-en-desc-text'))">🌐 AI翻译</button></div>`;
      // 如果已有缓存，直接显示
      if(pkmDescTransCache[pkmId]){document.getElementById('pkm-en-desc-text').innerHTML=pkmDescTransCache[pkmId];document.getElementById('pkm-translate-btn').style.display='none';}
    }else{
      descEl.innerHTML=`<span style="color:var(--t3)">暂无图鉴信息</span>`;
    }
    const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
    const img2=p.sprites?.front_default||img;
    document.getElementById('pkm-detail-img').src=img2;document.getElementById('pkm-detail-bg').style.backgroundImage=img?`url(${img})`:'none';
    document.getElementById('pkm-detail-num').textContent=`#${String(p.id).padStart(3,'0')}`;document.getElementById('pkm-detail-name').textContent=cnName;
    document.getElementById('pkm-detail-types').innerHTML=p.types.map(t=>typeTag(t.type.name)).join('');
    document.getElementById('pkm-detail-meta').textContent=`身高 ${p.height/10}m · 体重 ${p.weight/10}kg`;
    document.getElementById('pkm-detail-stats').innerHTML=p.stats.map(s=>statBar(s.stat.name,s.base_stat)).join('');
    await loadEvoChain(sp,'pkm-detail-evo');await loadPkmCollection();updateDetailBtns(p.id);
    currentChatPkm={id:p.id,name:cnName,types:p.types.map(t=>t.type.name),species:sp};
    // 重置AI氛围图按钮和背景

  }catch(e){document.getElementById('pkm-detail-name').textContent='加载失败';}
}
function onPkmSearch(v){
  clearTimeout(pkmSearchT);const res=document.getElementById('pkm-search-results');
  if(!v.trim()){res.innerHTML='';return;}
  pkmSearchT=setTimeout(async()=>{
    res.innerHTML='<div style="color:var(--t3);font-size:.8rem;padding:8px">搜索中…</div>';
    try{
      const q=v.trim().toLowerCase();const r=await fetch(`${POKEAPI}/pokemon?limit=2000`);const d=await r.json();
      const matches=d.results.filter(x=>x.name.includes(q)||x.url.split('/').slice(-2)[0]===q).slice(0,16);
      if(!matches.length){res.innerHTML='<div style="color:var(--t3);font-size:.8rem;padding:8px">未找到</div>';return;}
      const items=await Promise.all(matches.map(async m=>{
        const p=await fetchPkm(m.name);
        let cn=pkmCNCache[p.id];
        if(!cn){
          const sp=await fetchPkmSpecies(p.id).catch(()=>null);
          cn=PKM_CN_TABLE[p.id]||getCNName(sp,p.name)||(await getPkmCNName(p.id,p.name))||p.name;
          if(cn)pkmCNCache[p.id]=cn;
        }
        const img=p.sprites?.front_default||'';
        return`<div class="pkm-mini" onclick="openPkmDetail(${p.id})"><img src="${img}" alt=""><div class="pkm-mini-name">${cn}</div></div>`;
      }));
      res.innerHTML=items.join('');
    }catch(e){res.innerHTML='<div style="color:var(--danger);font-size:.8rem;padding:8px">搜索失败</div>';}
  },500);
}
async function loadGen(gen,el){
  document.querySelectorAll('.pkm-gen-tab').forEach(t=>t.classList.remove('on'));el.classList.add('on');
  const grid=document.getElementById('pkm-gen-grid');grid.innerHTML='<div class="pkm-empty">加载中…</div>';
  if(genCache[gen]){grid.innerHTML=genCache[gen];return;}
  const[start,end]=GEN_RANGE[gen];const ids=Array.from({length:end-start+1},(_,i)=>start+i);
  grid.innerHTML='';const BATCH=10;let allHtml=''; // 减小批次，让中文名能及时拿到
  for(let b=0;b<ids.length;b+=BATCH){
    const batch=ids.slice(b,b+BATCH);
    const items=await Promise.all(batch.map(async id=>{
      try{
        const p=await fetchPkm(id);
        const speciesName=p.species?.name||p.name;
        // getPkmCNName 内部会查 species，直接用它
        const cn=await getPkmCNName(p.id,speciesName);
        const img=p.sprites?.front_default||'';
        const col=pkmCollection[p.id]||{};
        const mark=col.caught?'✓':col.liked?'♥':col.wanted?'★':'';
        return'<div class="pkm-mini" onclick="openPkmDetail('+p.id+')" style="position:relative">'
          +(mark?'<div style="position:absolute;top:3px;right:3px;font-size:.6rem;color:var(--acc2)">'+mark+'</div>':'')
          +'<img src="'+img+'" alt="" loading="lazy">'
          +'<div class="pkm-mini-name">'+cn+'</div></div>';
      }catch{return'';}
    }));
    allHtml+=items.join('');grid.innerHTML=allHtml;
  }
  genCache[gen]=allHtml;
}

let pkmSeriesLogs={};
async function loadSeriesData(){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  const{data}=await db.from('pkm_series_log').select('*').eq('user_id',session.user.id);
  pkmSeriesLogs={};(data||[]).forEach(r=>pkmSeriesLogs[r.series_id]=r);renderSeries();
}
function renderSeries(){
  const grid=document.getElementById('pkm-series-grid');
  grid.innerHTML=PKM_SERIES.map(s=>{const log=pkmSeriesLogs[s.id];const st=log?.status||'none';const cls=st==='cleared'?' cleared':st==='played'?' played':'';const stTxt=st==='cleared'?'✓ 已通关':st==='played'?'▶ 游玩中':'— 未游玩';const stColor=st==='cleared'?'var(--acc)':st==='played'?'var(--acc2)':'var(--t3)';const ace=log?.ace_pokemon?'🏆 '+log.ace_pokemon:'';return'<div class="pkm-series-card'+cls+'" onclick="openSeriesDetail(this)" data-sid="'+s.id+'"><div class="pkm-series-name">'+s.name+'</div><div class="pkm-series-year">'+s.year+'</div><div class="pkm-series-status" style="color:'+stColor+'">'+stTxt+'</div>'+(log?.play_hours?'<div style="font-size:.63rem;color:var(--t3);margin-top:2px">'+log.play_hours+'h</div>':'')+(ace?'<div style="font-size:.63rem;color:var(--warn);margin-top:2px">'+ace+'</div>':'')+'</div>';}).join('');
}
function openSeriesDetail(el){
  const seriesId=el.dataset.sid;const s=PKM_SERIES.find(x=>x.id===seriesId);if(!s)return;
  _curSid=seriesId;
  // 重置 Tab 到概览
  document.querySelectorAll('.stab').forEach((b,i)=>b.classList.toggle('on',i===0));
  document.querySelectorAll('.stab-panel').forEach((p,i)=>p.classList.toggle('on',i===0));
  const log=pkmSeriesLogs[seriesId]||{};
  document.getElementById('series-modal-title').textContent=s.name;document.getElementById('series-modal-year').textContent=s.year+' 年发行';
  document.getElementById('series-start-inp').value=log.start_date||'';document.getElementById('series-end-inp').value=log.end_date||'';
  document.getElementById('series-hours-inp').value=log.play_hours||'';document.getElementById('series-ace-inp').value=log.ace_pokemon||'';
  document.getElementById('series-save-btn').dataset.sid=seriesId;
  seriesChatHistory=[];seriesChatOpen=false;
  const sw=document.getElementById('series-chat-wrap');if(sw)sw.style.display='none';
  const sab=document.getElementById('series-ai-btn');if(sab)sab.textContent='⬡ 和 AI 聊聊这部作品';
  const scm=document.getElementById('series-chat-msgs');if(scm)scm.innerHTML='';
  const qinp=document.getElementById('quicknote-inp');if(qinp)qinp.value='';
  setSeriesStatusUI(log.status||'none');
  const colors={none:'linear-gradient(135deg,#1b1d21,#141518)',played:'linear-gradient(135deg,rgba(56,189,248,.15),rgba(13,14,16,1))',cleared:'linear-gradient(135deg,rgba(96,165,250,.15),rgba(13,14,16,1))'};
  document.getElementById('series-hero').style.background=colors[log.status||'none'];
  document.getElementById('ov-series').classList.add('on');
  renderQuickNotes(seriesId);
}
function setSeriesStatus(st){setSeriesStatusUI(st);const colors={none:'linear-gradient(135deg,#1b1d21,#141518)',played:'linear-gradient(135deg,rgba(56,189,248,.15),rgba(13,14,16,1))',cleared:'linear-gradient(135deg,rgba(96,165,250,.15),rgba(13,14,16,1))'};document.getElementById('series-hero').style.background=colors[st];document.getElementById('series-save-btn').dataset.status=st;}
function setSeriesStatusUI(st){['none','played','cleared'].forEach(s=>{const el=document.getElementById('spill-'+s);if(!el)return;el.className='series-pill'+(s===st?' active-'+s:'');});document.getElementById('series-save-btn').dataset.status=st;}
async function saveSeriesDetail(){
  const btn=document.getElementById('series-save-btn');const sid=btn.dataset.sid;
  const{data:{session}}=await db.auth.getSession();if(!session?.user){alert('请先登录');return;}
  btn.textContent='保存中…';btn.disabled=true;
  const payload={user_id:session.user.id,series_id:sid,status:btn.dataset.status||'none',start_date:document.getElementById('series-start-inp').value||null,end_date:document.getElementById('series-end-inp').value||null,play_hours:parseInt(document.getElementById('series-hours-inp').value)||0,ace_pokemon:document.getElementById('series-ace-inp').value.trim()||null,updated_at:new Date().toISOString()};
  const{error}=await db.from('pkm_series_log').upsert(payload,{onConflict:'user_id,series_id'});
  if(error){alert('保存失败：'+error.message);btn.textContent='保存';btn.disabled=false;return;}
  pkmSeriesLogs[sid]={...payload};renderSeries();btn.textContent='✓ 已保存';
  setTimeout(()=>{btn.textContent='保存记录';btn.disabled=false;closeOv('ov-series');},800);
}

function openPkmChat(){if(!todayPkm)return;const sp=todayPkm.species;currentChatPkm={id:todayPkm.id,name:getCNName(todayPkm.species,todayPkm.name)||todayPkm.name,types:todayPkm.types.map(t=>t.type.name),species:sp};pkmChatFromModal=false;openPkmChatModal();}
function openPkmChatFromModal(){pkmChatFromModal=true;openPkmChatModal();}
function openPkmChatModal(){
  const g=currentChatPkm;if(!g)return;
  pkmChatHistory=[];document.getElementById('pkm-chat-title').textContent='和 AI 聊聊 '+g.name;
  document.getElementById('pkm-ai-msgs').innerHTML='';document.getElementById('pkm-ai-quick').innerHTML='';
  document.getElementById('pkm-series-inp').value='';document.getElementById('pkm-sum-btn').textContent='📋 生成游戏日志';document.getElementById('pkm-sum-btn').disabled=false;
  document.getElementById('ov-pkm-chat').classList.add('on');
  const qs=['这只宝可梦的对战技能推荐？','它的进化条件是什么？','在哪部作品里登场印象最深？','有什么有趣的冷知识？','怎么培育出高个体值？'];
  document.getElementById('pkm-ai-quick').innerHTML=qs.map(q=>`<button class="qq" onclick="sendPkmQuick('${q.replace(/'/g,"&#39;")}')">${q}</button>`).join('');
  const types=g.types.map(t=>TYPE_ZH[t]||t).join('/');
  const greet='《'+g.name+'》的档案已加载。\n\n属性：'+types+'，编号 #'+String(g.id).padStart(3,'0')+'。\n\n关于对战配置、进化条件、游戏出场、冷知识……随便问，我在。';
  addPkmBubble(greet,'ai',false);
}
function sendPkmQuick(q){document.getElementById('pkm-ai-inp').value=q;sendPkmAIMsg();}
function addPkmBubble(text,role,animate){
  const msgs=document.getElementById('pkm-ai-msgs');const div=document.createElement('div');div.className='cmsg '+(role==='ai'?'ai-msg':'user-msg');
  div.innerHTML='<div class="cmsg-av '+(role==='ai'?'ai-av':'usr-av')+'">'+(role==='ai'?'AI':'我')+'</div><div class="cmsg-bbl"></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;const bbl=div.querySelector('.cmsg-bbl');
  if(animate&&role==='ai'){let i=0;const spd=text.length>400?15:25;const t=()=>{if(i<text.length){bbl.textContent+=text[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,1000/spd);}};t();}
  else{bbl.textContent=text;msgs.scrollTop=msgs.scrollHeight;}
}
async function sendPkmAIMsg(){
  const inp=document.getElementById('pkm-ai-inp');const v=inp.value.trim();if(!v)return;
  inp.value='';addPkmBubble(v,'user',false);pkmChatHistory.push({role:'user',parts:[{text:v}]});
  const snd=document.getElementById('pkm-ai-snd');snd.disabled=true;
  const td=document.createElement('div');td.className='cmsg ai-msg';td.id='pkm-typing';
  td.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  const msgs=document.getElementById('pkm-ai-msgs');msgs.appendChild(td);msgs.scrollTop=msgs.scrollHeight;
  const g=currentChatPkm;const series=document.getElementById('pkm-series-inp').value.trim();
  const sys=`你是一位精通宝可梦世界的博士级情报员，专精于${g.name}（#${String(g.id).padStart(3,'0')}，${g.types.map(t=>TYPE_ZH[t]||t).join('/')}属性）。你对这只宝可梦了如指掌：进化方式、对战技能、个性搭配、各作品出场方式、相关剧情和冷知识。${series?`玩家当前游玩的系列：${series}，请优先结合该作品中的相关内容来回答。`:''}\n回答要求：中文，400字左右，详细丰富，纯文字不用Markdown符号。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:pkmChatHistory,generationConfig:{maxOutputTokens:1000,temperature:1.0}})});
    if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err?.error?.message||'HTTP '+res.status);}
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    const t=document.getElementById('pkm-typing');if(t)t.remove();
    addPkmBubble(reply,'ai',true);pkmChatHistory.push({role:'model',parts:[{text:reply}]});if(pkmChatHistory.length>30)pkmChatHistory=pkmChatHistory.slice(-30);
  }catch(e){const t=document.getElementById('pkm-typing');if(t)t.remove();addPkmBubble('连接失败：'+e.message,'ai',false);}
  snd.disabled=false;inp.focus();
}
async function generatePkmLog(){
  if(pkmChatHistory.length<2){alert('至少聊几句再生成日志吧～');return;}
  const btn=document.getElementById('pkm-sum-btn');btn.disabled=true;btn.textContent='生成中…';
  const g=currentChatPkm;const series=document.getElementById('pkm-series-inp').value.trim();
  const histText=pkmChatHistory.map(m=>(m.role==='user'?'训练师':'博士')+':'+m.parts[0].text).join('\n');
  const prompt='以下是关于宝可梦'+g.name+'的对话记录：\n\n'+histText+'\n\n请将这段对话中有价值的内容写成一则100-150字的训练师日志。用第一人称，像宝可梦训练师在记录探索日记一样，融入宝可梦世界的氛围。提炼关键信息，纯文字不用Markdown。';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:300,temperature:0.8}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const summary=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if(!summary)throw new Error('AI 返回为空');
    const{data:{session}}=await db.auth.getSession();const user=session?.user;
    if(!user){alert('请先登录才能保存日志');btn.disabled=false;btn.textContent='📋 生成游戏日志';return;}
    const{error}=await db.from('pkm_logs').insert({user_id:user.id,pkm_id:g.id,pkm_name:g.name,summary,game_series:series||null});
    if(error)throw new Error(error.message);
    btn.textContent='✓ 日志已保存';setTimeout(()=>{btn.disabled=false;btn.textContent='📋 生成游戏日志';},2000);loadPkmLogs();
  }catch(e){alert('生成失败：'+e.message);btn.disabled=false;btn.textContent='📋 生成游戏日志';}
}
async function loadPkmLogs(){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  const{data}=await db.from('pkm_logs').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(30);
  const list=document.getElementById('pkm-log-list');
  if(!data||!data.length){list.innerHTML='<div class="pkm-empty">还没有日志，和 AI 聊完后可以生成</div>';document.getElementById('pkm-log-count').textContent='';return;}
  document.getElementById('pkm-log-count').textContent=data.length+' 条';
  list.innerHTML=data.map(r=>'<div class="pkm-log-item"><div class="pkm-log-item-hdr"><span class="pkm-log-name">📖 '+r.pkm_name+'</span><div style="display:flex;align-items:center;gap:6px"><span class="pkm-log-date">'+new Date(r.created_at).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</span><button onclick="delPkmLog(this)" data-id="'+r.id+'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:.72rem;padding:0" title="删除">🗑</button></div></div><div class="pkm-log-text">'+esc(r.summary)+'</div>'+(r.game_series?'<div class="pkm-log-series">'+esc(r.game_series)+'</div>':'')+'</div>').join('');
}
function delPkmLog(el){deletePkmLog(el.dataset.id);}
async function deletePkmLog(id){if(!confirm('删除这条游戏日志？'))return;const{data:{session}}=await db.auth.getSession();if(!session?.user)return;await db.from('pkm_logs').delete().eq('id',id).eq('user_id',session.user.id);loadPkmLogs();}

/* 系列AI对话 */
let seriesChatHistory=[],seriesChatOpen=false;
function toggleSeriesChat(){
  seriesChatOpen=!seriesChatOpen;const wrap=document.getElementById('series-chat-wrap');if(wrap)wrap.style.display=seriesChatOpen?'block':'none';
  const btn=document.getElementById('series-ai-btn');if(btn)btn.textContent=seriesChatOpen?'收起 AI 对话':'⬡ 和 AI 聊聊这部作品';
  if(seriesChatOpen){const msgs=document.getElementById('series-chat-msgs');if(msgs&&msgs.children.length===0)initSeriesChat();}
}
function initSeriesChat(){
  const sid=document.getElementById('series-save-btn')?.dataset?.sid;if(!sid)return;
  const s=PKM_SERIES.find(x=>x.id===sid);if(!s)return;
  seriesChatHistory=[];const nameEl=document.getElementById('series-chat-game-name');if(nameEl)nameEl.textContent=s.name;
  const status=document.getElementById('series-save-btn')?.dataset?.status||'none';
  const hours=document.getElementById('series-hours-inp')?.value||'';const ace=document.getElementById('series-ace-inp')?.value||'';
  const qs=['这部作品的剧情有什么亮点？','入坑建议是什么？','隐藏要素有哪些值得探索？','推荐怎么组队？'];
  const qq=document.getElementById('series-quick-qs');if(qq)qq.innerHTML=qs.map(q=>'<button class="qq" onclick="sendSeriesQuick(\''+q.replace(/'/g,"\\'")+'\')" style="font-size:.68rem">'+q+'</button>').join('');
  const stTxt={none:'还没玩过',played:'正在游玩中',cleared:'已通关'}[status]||'';
  addSeriesBubble('《'+s.name+'》（'+s.year+'年）档案已加载。'+(stTxt?'你'+stTxt+'，':'')+(hours?'投入了约'+hours+'小时，':'')+(ace?'王牌是'+ace+'。':'')+' 关于剧情、攻略、隐藏要素，随便问。','ai',false);
}
function sendSeriesQuick(q){const inp=document.getElementById('series-chat-inp');if(inp){inp.value=q;sendSeriesAIMsg();}}
function addSeriesBubble(text,role,animate){
  const msgs=document.getElementById('series-chat-msgs');if(!msgs)return;
  const div=document.createElement('div');div.className='cmsg '+(role==='ai'?'ai-msg':'user-msg');
  div.innerHTML='<div class="cmsg-av '+(role==='ai'?'ai-av':'usr-av')+'">'+(role==='ai'?'AI':'我')+'</div><div class="cmsg-bbl"></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;const bbl=div.querySelector('.cmsg-bbl');
  if(animate&&role==='ai'){let i=0;const t=()=>{if(i<text.length){bbl.textContent+=text[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,20);}};t();}
  else{bbl.textContent=text;msgs.scrollTop=msgs.scrollHeight;}
}
async function sendSeriesAIMsg(){
  const inp=document.getElementById('series-chat-inp');const v=inp?.value?.trim();if(!v)return;
  inp.value='';addSeriesBubble(v,'user',false);seriesChatHistory.push({role:'user',parts:[{text:v}]});
  const snd=document.getElementById('series-ai-snd');if(snd)snd.disabled=true;
  const msgs=document.getElementById('series-chat-msgs');
  const td=document.createElement('div');td.className='cmsg ai-msg';td.id='series-typing';
  td.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  if(msgs){msgs.appendChild(td);msgs.scrollTop=msgs.scrollHeight;}
  const sid=document.getElementById('series-save-btn')?.dataset?.sid;const s=PKM_SERIES.find(x=>x.id===sid)||{name:'未知',year:''};
  const status=document.getElementById('series-save-btn')?.dataset?.status||'none';const hours=document.getElementById('series-hours-inp')?.value||'';const ace=document.getElementById('series-ace-inp')?.value||'';
  const sys='你是宝可梦系列「'+s.name+'」（'+s.year+'年）的专属攻略顾问。玩家状态：'+(status==='cleared'?'已通关':status==='played'?'游玩中':'未游玩')+(hours?'，约'+hours+'小时':'')+(ace?'，王牌：'+ace:'')+'。用中文详细回答（400字左右），纯文字不用Markdown。';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:seriesChatHistory,generationConfig:{maxOutputTokens:1000,temperature:1.0}})});
    if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    const t=document.getElementById('series-typing');if(t)t.remove();addSeriesBubble(reply,'ai',true);
    seriesChatHistory.push({role:'model',parts:[{text:reply}]});if(seriesChatHistory.length>20)seriesChatHistory=seriesChatHistory.slice(-20);
  }catch(e){const t=document.getElementById('series-typing');if(t)t.remove();addSeriesBubble('连接失败：'+e.message,'ai',false);}
  if(snd)snd.disabled=false;if(inp)inp.focus();
}
async function genSeriesLogFromChat(){
  if(seriesChatHistory.length<2){alert('至少聊几句再生成日志吧');return;}
  const btn=document.getElementById('series-log-btn');if(btn){btn.disabled=true;btn.textContent='生成中…';}
  const sid=document.getElementById('series-save-btn')?.dataset?.sid;const s=PKM_SERIES.find(x=>x.id===sid)||{name:'未知'};
  const histText=seriesChatHistory.map(m=>(m.role==='user'?'训练师':'顾问')+':'+m.parts[0].text).join('\n');
  const prompt='以下是关于宝可梦「'+s.name+'」的对话：\n\n'+histText+'\n\n请用第一人称训练师日记口吻，写一段100-130字的游玩日志，提炼有价值的内容，融入游戏氛围，纯文字不用Markdown。';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:300,temperature:0.9}})});
    if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const text=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();if(!text)throw new Error('返回为空');
    const ta=document.getElementById('series-notes-inp');if(ta){const prev=ta.value.trim();ta.value=(prev?prev+'\n\n':'')+'[AI 日志]\n'+text;}
    const{data:{session}}=await db.auth.getSession();if(session?.user){await db.from('pkm_logs').insert({user_id:session.user.id,pkm_id:0,pkm_name:'📝 '+s.name,summary:text,game_series:s.name});loadPkmLogs();}
    if(btn){btn.textContent='✓ 已保存到日志';setTimeout(()=>{btn.disabled=false;btn.textContent='📋 生成游玩日志';},2000);}
  }catch(e){alert('生成失败：'+e.message);if(btn){btn.disabled=false;btn.textContent='📋 生成游玩日志';}}
}
async function initPkm(){Object.keys(genCache).forEach(k=>delete genCache[k]);await loadSeriesData();await loadTodayPkm();await loadPkmCollection();updateTodayBtns();loadGen(1,document.querySelector('.pkm-gen-tab'));await loadPkmLogs();}


/* ================================================================
   新功能：系列弹窗 Tabs / 快记 / 队伍 / 进度 / 探索 / 狩猎 / 图鉴录入
   ================================================================ */

/* ── 常量：性格表 ── */
const NATURES=[
  {id:'hardy',zh:'坚毅',up:null,down:null},
  {id:'lonely',zh:'孤僻',up:'attack',down:'defense'},
  {id:'brave',zh:'勇敢',up:'attack',down:'speed'},
  {id:'adamant',zh:'固执',up:'attack',down:'special-attack'},
  {id:'naughty',zh:'淘气',up:'attack',down:'special-defense'},
  {id:'bold',zh:'温顺',up:'defense',down:'attack'},
  {id:'docile',zh:'悠闲',up:null,down:null},
  {id:'relaxed',zh:'乐天',up:'defense',down:'speed'},
  {id:'impish',zh:'皮皮',up:'defense',down:'special-attack'},
  {id:'lax',zh:'大大咧咧',up:'defense',down:'special-defense'},
  {id:'timid',zh:'胆小',up:'speed',down:'attack'},
  {id:'hasty',zh:'急躁',up:'speed',down:'defense'},
  {id:'serious',zh:'认真',up:null,down:null},
  {id:'jolly',zh:'爽朗',up:'speed',down:'special-attack'},
  {id:'naive',zh:'天真',up:'speed',down:'special-defense'},
  {id:'modest',zh:'内敛',up:'special-attack',down:'attack'},
  {id:'mild',zh:'温和',up:'special-attack',down:'defense'},
  {id:'quiet',zh:'冷静',up:'special-attack',down:'speed'},
  {id:'rash',zh:'马虎',up:'special-attack',down:'special-defense'},
  {id:'calm',zh:'沉稳',up:'special-defense',down:'attack'},
  {id:'gentle',zh:'温柔',up:'special-defense',down:'defense'},
  {id:'sassy',zh:'自大',up:'special-defense',down:'speed'},
  {id:'careful',zh:'慎重',up:'special-defense',down:'special-attack'},
  {id:'quirky',zh:'浮躁',up:null,down:null},
  {id:'bashful',zh:'害羞',up:null,down:null},
];
function getNatureZh(id){return NATURES.find(n=>n.id===id)?.zh||id;}

/* ── 常量：各作品进度节点 ── */
const SERIES_CHECKPOINTS={
  'red-blue':['🏅 小刚道馆','🏅 小霞道馆','🏅 苏珊娜道馆','🏅 阿洛道馆','🏅 娜汪道馆','🏅 陈伟道馆','🏅 卡丽娜道馆','🏅 松原道馆','🔴 击败火箭队','⚔️ 四天王','🏆 冠军小茂'],
  'yellow':['🏅 小刚道馆','🏅 小霞道馆','🏅 苏珊娜道馆','🏅 阿洛道馆','🏅 娜汪道馆','🏅 陈伟道馆','🏅 卡丽娜道馆','🏅 松原道馆','🔴 击败火箭队','⚔️ 四天王','🏆 冠军小茂'],
  'gold-silver':['🏅 芙蓉道馆','🏅 藤树道馆','🏅 月桂道馆','🏅 毛利道馆','🏅 麻子道馆','🏅 雷光道馆','🏅 雪诺道馆','🏅 白金道馆','⚔️ 四天王','🏆 冠军','🗺 关都道馆×8','🏆 再战小茂'],
  'crystal':['🏅 芙蓉道馆','🏅 藤树道馆','🏅 月桂道馆','🏅 毛利道馆','🏅 麻子道馆','🏅 雷光道馆','🏅 雪诺道馆','🏅 白金道馆','⚔️ 四天王','🏆 冠军','🗺 关都道馆×8','🏆 再战小茂'],
  'ruby-sapphire':['🏅 楼舟道馆','🏅 月见道馆','🏅 常磐道馆','🏅 水镜道馆','🏅 仙台道馆','🏅 金木道馆','🏅 绿岭道馆','🏅 雄山道馆','🔴 击败水队/炎队','⚔️ 四天王','🏆 冠军'],
  'firered-leafgreen':['🏅 小刚道馆','🏅 小霞道馆','🏅 苏珊娜道馆','🏅 阿洛道馆','🏅 娜汪道馆','🏅 陈伟道馆','🏅 卡丽娜道馆','🏅 松原道馆','🔴 击败火箭队','⚔️ 四天王','🏆 冠军小茂'],
  'emerald':['🏅 楼舟道馆','🏅 月见道馆','🏅 常磐道馆','🏅 水镜道馆','🏅 仙台道馆','🏅 金木道馆','🏅 绿岭道馆','🏅 雄山道馆','🔴 击败水队&炎队','⚔️ 四天王','🏆 冠军'],
  'diamond-pearl':['🏅 随意城道馆','🏅 勾玉道馆','🏅 镜水道馆','🏅 芙蓉道馆','🏅 幸福道馆','🏅 白金道馆','🏅 冰雪道馆','🏅 电光道馆','🔴 击败银河队','⚔️ 四天王','🏆 冠军赤'],
  'platinum':['🏅 随意城道馆','🏅 勾玉道馆','🏅 镜水道馆','🏅 芙蓉道馆','🏅 幸福道馆','🏅 白金道馆','🏅 冰雪道馆','🏅 电光道馆','🔴 击败银河队','⚔️ 四天王','🏆 冠军赤'],
  'heartgold-soulsilver':['🏅 芙蓉道馆','🏅 藤树道馆','🏅 月桂道馆','🏅 毛利道馆','🏅 麻子道馆','🏅 雷光道馆','🏅 雪诺道馆','🏅 白金道馆','⚔️ 四天王','🏆 冠军','🗺 关都道馆×8','🏆 再战小茂'],
  'black-white':['🏅 杖城道馆','🏅 瓶城道馆','🏅 格城道馆','🏅 粗城道馆','🏅 白城道馆','🏅 黑城道馆','🏅 冰城道馆','🏅 辉城道馆','🔴 击败等离子队','⚔️ 四天王','🔮 决战N','🏆 冠军阿戟'],
  'black2-white2':['🏅 杖城道馆','🏅 瓶城道馆','🏅 格城道馆','🏅 黑市道馆','🏅 白城道馆','🏅 黑城道馆','🏅 冰城道馆','🏅 辉城道馆','⚔️ 四天王','🏆 冠军','🌀 黑白塔'],
  'x-y':['🏅 紫堇市道馆','🏅 月桂市道馆','🏅 霓虹市道馆','🏅 石英道馆','🏅 卡洛斯道馆','🏅 花村道馆','🏅 岩城道馆','🏅 冻原道馆','🔴 击败闪焰队','⚔️ 四天王','🏆 冠军'],
  'oras':['🏅 楼舟道馆','🏅 月见道馆','🏅 常磐道馆','🏅 水镜道馆','🏅 仙台道馆','🏅 金木道馆','🏅 绿岭道馆','🏅 雄山道馆','🔴 击败水队/炎队','⚔️ 四天王','🏆 冠军','🌌 传说之戒'],
  'sun-moon':['🌺 伊利马大试练','🔥 卡赫利大试练','🔮 鲁扎米尼大试练','🌊 苏菲大试练','👊 马罗大试练','💎 奥利维亚岛王','👻 纳纳米大试练','🌿 阿卡拉岛王','⚡ 麦勒史蒂芬大试练','🏝 帕尼帕尼岛王','🔴 击败亚力山大','🏆 成为冠军'],
  'usum':['🌺 伊利马大试练','🔥 卡赫利大试练','🔮 鲁扎米尼大试练','🌊 苏菲大试练','👊 马罗大试练','💎 奥利维亚岛王','👻 纳纳米大试练','🌿 阿卡拉岛王','⚡ 帕尼帕尼大试练','🔴 击败亚力山大','🏆 成为冠军','🚀 彩虹火箭队'],
  'sword-shield':['🏅 图特菲尔德道馆','🏅 霍尔斯比道馆','🏅 图尔菲尔德道馆','🏅 斯托海德道馆','🏅 塞奇尔道馆','🏅 西彩德道馆','🏅 斯帕罗特道馆','🏅 黑斯尔道馆','⚔️ 半决赛','🏆 冠军战','🔴 击败罗斯'],
  'bdsp':['🏅 随意城道馆','🏅 勾玉道馆','🏅 镜水道馆','🏅 芙蓉道馆','🏅 幸福道馆','🏅 白金道馆','🏅 冰雪道馆','🏅 电光道馆','🔴 击败银河队','⚔️ 四天王','🏆 冠军赤'],
  'legends-arceus':['🌿 翠玉部落','❄️ 月桂部落','🌾 黄金部落','🪨 水岸部落','🌋 钻石部落','🔴 vs 氏族决战','🌀 捕获超古代','✨ 捕获阿尔宙斯'],
  'scarlet-violet':['🗺 南路线探索','🗺 西路线探索','🗺 东路线探索','🗺 北路线探索','🏅 道馆全通','⭐ 传说强者之路','🔴 星队扫荡','🏆 终章通关','💜 零之秘宝'],
  'legends-za':['📖 序章','🏙 卢米奥斯改造','⚔️ 首次大型战斗','🌀 中盘转折','🏆 终章通关'],
};

const _lsMem={};
function lsGet(k){try{const v=localStorage.getItem(k);return v!=null?JSON.parse(v):(_lsMem[k]??null);}catch{return _lsMem[k]??null;}}
function lsSet(k,v){_lsMem[k]=v;try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

/* ── 当前系列 ID ── */
let _curSid='';

/* ── Tab 切换 ── */
function switchSeriesTab(el,tab){
  document.querySelectorAll('.stab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.stab-panel').forEach(p=>p.classList.remove('on'));
  el.classList.add('on');
  const panel=document.getElementById('stab-'+tab);if(panel)panel.classList.add('on');
  if(tab==='party')renderPartySlots(_curSid);
  if(tab==='progress')renderProgress(_curSid);
  if(tab==='hunting'){initNatureSelect('hunt-nature');renderHuntList(_curSid);}
  if(tab==='catches'){initNatureSelect('catch-nature');renderCatchList(_curSid);}
  if(tab==='explore'){document.getElementById('explore-result').style.display='none';}
}


/* ============================
   ⚡ 快记
   ============================ */
function addQuickNote(){
  const inp=document.getElementById('quicknote-inp');
  const text=inp?.value?.trim();if(!text)return;
  const notes=lsGet('pkm_notes_'+_curSid)||[];
  notes.unshift({text,ts:Date.now()});
  lsSet('pkm_notes_'+_curSid,notes);
  inp.value='';
  renderQuickNotes(_curSid);
}
function renderQuickNotes(sid){
  const list=document.getElementById('quicknote-list');if(!list)return;
  const notes=lsGet('pkm_notes_'+sid)||[];
  if(!notes.length){list.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:4px 0">还没有快记，边玩边记吧～</div>';return;}
  list.innerHTML=notes.map((n,i)=>{
    const d=new Date(n.ts);
    const ts=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return`<div class="quicknote-item"><span class="quicknote-ts">${ts}</span><span class="quicknote-text">${esc(n.text)}</span><button class="quicknote-del" onclick="delQuickNote('${sid}',${i})">✕</button></div>`;
  }).join('');
}
function delQuickNote(sid,idx){
  const notes=lsGet('pkm_notes_'+sid)||[];notes.splice(idx,1);lsSet('pkm_notes_'+sid,notes);renderQuickNotes(sid);
}

/* ============================
   👥 队伍追踪
   ============================ */
function renderPartySlots(sid){
  const wrap=document.getElementById('party-slots');if(!wrap)return;
  const party=lsGet('pkm_party_'+sid)||Array(6).fill(null);
  wrap.innerHTML=party.map((p,i)=>{
    if(p){
      return`<div class="party-slot filled">
        <button class="party-slot-del" onclick="removeFromParty('${sid}',${i});event.stopPropagation()">✕</button>
        <img src="${p.img||''}" alt="" onerror="this.style.display='none'">
        <div class="party-slot-name">${esc(p.name)}</div>
        ${p.nick?`<div class="party-slot-nick">${esc(p.nick)}</div>`:''}
        <div class="party-slot-lv">${p.lv?'Lv.'+p.lv:''}</div>
      </div>`;
    }
    return`<div class="party-slot" onclick="focusPartySearch()">
      <div class="party-slot-empty-icon">+</div>
      <div class="party-slot-empty-lbl">空位</div>
    </div>`;
  }).join('');
}
function focusPartySearch(){document.getElementById('party-search-inp')?.focus();}
function removeFromParty(sid,idx){
  const party=lsGet('pkm_party_'+sid)||Array(6).fill(null);
  party[idx]=null;lsSet('pkm_party_'+sid,party);renderPartySlots(sid);
}
let _partySearchT=null;
function searchPartyPkm(v){
  clearTimeout(_partySearchT);
  const res=document.getElementById('party-search-results');
  if(!v.trim()){res.classList.remove('open');return;}
  _partySearchT=setTimeout(()=>doInlineSearch(v,res,'party'),400);
}
function addToParty(sid,pkm){
  const party=lsGet('pkm_party_'+sid)||Array(6).fill(null);
  const emptyIdx=party.findIndex(p=>p===null);
  if(emptyIdx<0){showToast('队伍已满（最多6只）');return;}
  const nick=prompt(`给 ${pkm.name} 起个昵称？（回车跳过）`,'')||'';
  const lv=prompt('当前等级？（回车跳过）','')||'';
  party[emptyIdx]={pkmId:pkm.id,name:pkm.name,img:pkm.img,nick,lv};
  lsSet('pkm_party_'+sid,party);
  document.getElementById('party-search-inp').value='';
  document.getElementById('party-search-results').classList.remove('open');
  renderPartySlots(sid);
}

/* ============================
   🏁 进度打卡
   ============================ */
function renderProgress(sid){
  const list=document.getElementById('progress-list');if(!list)return;
  const checkpoints=SERIES_CHECKPOINTS[sid];
  if(!checkpoints){list.innerHTML='<div style="color:var(--t3);font-size:.82rem;padding:8px 0">该作品暂无预设进度节点</div>';return;}
  const done=lsGet('pkm_progress_'+sid)||{};
  const total=checkpoints.length;const doneCount=Object.keys(done).length;
  const pct=Math.round(doneCount/total*100);
  list.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <span style="font-size:.72rem;color:var(--t3);font-family:'DM Mono',monospace">${doneCount}/${total} 节点完成</span>
    <span style="font-size:.72rem;color:var(--acc);font-family:'DM Mono',monospace">${pct}%</span>
  </div>
  <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`
  +checkpoints.map((cp,i)=>{
    const isDone=!!done[i];const ts=done[i]?.ts;
    const tsStr=ts?new Date(ts).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'}):'';
    return`<div class="progress-item${isDone?' done':''}" onclick="toggleCheckpoint('${sid}',${i})">
      <div class="progress-check">${isDone?'✓':''}</div>
      <span class="progress-label">${cp}</span>
      ${tsStr?`<span class="progress-ts">${tsStr}</span>`:''}
    </div>`;
  }).join('');
}
function toggleCheckpoint(sid,idx){
  const done=lsGet('pkm_progress_'+sid)||{};
  if(done[idx])delete done[idx];else done[idx]={ts:Date.now()};
  lsSet('pkm_progress_'+sid,done);renderProgress(sid);
}

/* ============================
   🗺 探索：位置 + AI精灵分布
   ============================ */
async function exploreLocation(){
  const loc=document.getElementById('explore-loc-inp').value.trim();if(!loc)return;
  const sid=_curSid;const s=PKM_SERIES.find(x=>x.id===sid);
  const box=document.getElementById('explore-result');
  box.style.display='block';
  box.innerHTML=`<div class="explore-result-header"><span class="explore-loc-name">🗺 ${esc(loc)}</span><span style="font-size:.72rem;color:var(--t3);margin-left:8px">AI查询中…</span></div>`;
  const prompt=`你是宝可梦世界的全知导游。
玩家正在游玩「${s?.name||sid}」（${s?.year||''}年），当前位置：「${loc}」。
请按以下格式回复（纯文字，不用Markdown符号）：

【风景描述】50字以内，描绘该地点在游戏中的氛围和画面感。

【可遇精灵】列出在该作品「${loc}」中可以遇到的宝可梦，格式：精灵名 (遭遇率：高/中/低，出现条件如时间/天气)，每行一只，最多10只。

【探索提示】30字以内，该地点的特殊隐藏要素或注意事项。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:600,temperature:0.85}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI暂时无法响应）';
    box.innerHTML=`<div class="explore-result-header">
      <span style="font-size:1.1rem">🗺</span>
      <span class="explore-loc-name">${esc(loc)}</span>
      <span style="font-size:.68rem;color:var(--t3);font-family:'DM Mono',monospace;margin-left:auto">${s?.name||''}</span>
    </div>
    <div class="explore-body">${esc(reply)}</div>`;
  }catch(e){box.innerHTML=`<div class="explore-body" style="color:var(--danger)">查询失败：${e.message}</div>`;}
}

/* ============================
   🎯 狩猎：目标精灵 + 遭遇计数
   ============================ */
let _huntSelectedPkm=null,_huntSearchT=null;
function searchHuntPkm(v){
  clearTimeout(_huntSearchT);
  const res=document.getElementById('hunt-search-results');
  if(!v.trim()){res.classList.remove('open');return;}
  _huntSearchT=setTimeout(()=>doInlineSearch(v,res,'hunt'),400);
}
function selectHuntPkm(pkm){
  _huntSelectedPkm=pkm;
  document.getElementById('hunt-search-inp').value=pkm.name;
  document.getElementById('hunt-search-results').classList.remove('open');
  const prev=document.getElementById('hunt-pkm-preview');
  prev.style.display='flex';
  prev.innerHTML=`<img src="${pkm.img}" alt="" onerror="this.style.display='none'"><div><div class="hunt-pkm-preview-name">${esc(pkm.name)}</div><div style="font-size:.68rem;color:var(--t3);font-family:'DM Mono',monospace">#${String(pkm.id).padStart(3,'0')}</div></div>`;
}
function addHuntTarget(){
  if(!_huntSelectedPkm){showToast('请先搜索并选择目标精灵');return;}
  const nature=document.getElementById('hunt-nature').value;
  const iv=document.getElementById('hunt-iv').value.trim()||'—';
  const sid=_curSid;
  const list=lsGet('pkm_hunt_'+sid)||[];
  list.push({pkmId:_huntSelectedPkm.id,name:_huntSelectedPkm.name,img:_huntSelectedPkm.img,nature,iv,count:0,done:false,ts:Date.now()});
  lsSet('pkm_hunt_'+sid,list);
  _huntSelectedPkm=null;
  document.getElementById('hunt-search-inp').value='';
  document.getElementById('hunt-iv').value='';
  document.getElementById('hunt-pkm-preview').style.display='none';
  renderHuntList(sid);
  showToast('已添加狩猎目标');
}
function renderHuntList(sid){
  const el=document.getElementById('hunt-list');if(!el)return;
  const list=lsGet('pkm_hunt_'+sid)||[];
  if(!list.length){el.innerHTML='<div style="font-size:.8rem;color:var(--t3);text-align:center;padding:16px 0">还没有目标精灵，开始狩猎吧！</div>';return;}
  el.innerHTML=list.map((t,i)=>{
    const natZh=getNatureZh(t.nature);
    return`<div class="hunt-card${t.done?' done-card':' active'}">
      <div class="hunt-card-header">
        <img class="hunt-card-img" src="${t.img}" alt="" onerror="this.style.display='none'">
        <div class="hunt-card-info">
          <div class="hunt-card-name">${esc(t.name)}${t.done?' ✓':''}</div>
          <div class="hunt-card-target">目标：${natZh}性格 · ${esc(t.iv)}</div>
          ${t.done?`<div style="font-size:.68rem;color:var(--t3);font-family:'DM Mono',monospace;margin-top:2px">共遭遇 ${t.count} 次后捕获</div>`:''}
        </div>
        <div class="hunt-card-actions">
          ${!t.done?`<button class="hunt-enter-btn" onclick="openImmHunt('${sid}',${i})">进入狩猎</button>`:'<span style="font-size:.72rem;color:var(--acc2);font-family:\'DM Mono\',monospace">已捕获</span>'}
          <button class="hunt-del-btn" onclick="huntDel('${sid}',${i})">删除</button>
        </div>
      </div>
      ${!t.done?`<div style="display:flex;align-items:center;gap:8px;margin-top:4px">
        <span style="font-size:.72rem;color:var(--t3)">遭遇次数</span>
        <span style="font-family:'DM Mono',monospace;font-size:1rem;font-weight:600;color:var(--t)">${t.count}</span>
        <button class="hunt-inc-btn" onclick="huntInc('${sid}',${i})" title="快速+1">+</button>
      </div>`:''}
    </div>`;
  }).join('');
}
function huntInc(sid,idx){
  const list=lsGet('pkm_hunt_'+sid)||[];
  list[idx].count=(list[idx].count||0)+1;
  lsSet('pkm_hunt_'+sid,list);
  renderHuntList(sid);
}
function huntCaught(sid,idx){
  const list=lsGet('pkm_hunt_'+sid)||[];
  list[idx].done=true;
  lsSet('pkm_hunt_'+sid,list);
  renderHuntList(sid);
  showToast(`恭喜捕获 ${list[idx].name}！共遭遇 ${list[idx].count} 次`);
}
function huntDel(sid,idx){
  if(!confirm('删除这个狩猎目标？'))return;
  const list=lsGet('pkm_hunt_'+sid)||[];list.splice(idx,1);lsSet('pkm_hunt_'+sid,list);renderHuntList(sid);
}

/* ============================
   📖 图鉴录入：种族值 + 性格 + 努力值AI推荐
   ============================ */
let _catchSelectedPkm=null,_catchSearchT=null,_catchBaseStats=null,_catchEvYields=null;

function initNatureSelect(id){
  const sel=document.getElementById(id);if(!sel||sel.options.length>1)return;
  sel.innerHTML=NATURES.map(n=>{
    const hint=n.up?`+${STAT_ZH[n.up]||n.up}/-${STAT_ZH[n.down]||n.down}`:'中性';
    return`<option value="${n.id}">${n.zh}（${hint}）</option>`;
  }).join('');
  sel.value='timid';
}

function searchCatchPkm(v){
  clearTimeout(_catchSearchT);
  const res=document.getElementById('catch-search-results');
  if(!v.trim()){res.classList.remove('open');return;}
  _catchSearchT=setTimeout(()=>doInlineSearch(v,res,'catch'),400);
}

async function selectCatchPkm(pkm){
  _catchSelectedPkm=pkm;
  document.getElementById('catch-search-inp').value=pkm.name;
  document.getElementById('catch-search-results').classList.remove('open');
  document.getElementById('catch-form-body').style.display='block';
  document.getElementById('catch-ai-result').style.display='none';
  document.getElementById('catch-pkm-preview').innerHTML=
    `<img src="${pkm.img}" alt="" onerror="this.style.display='none'">
     <div><div class="catch-pkm-header-name">${esc(pkm.name)}</div>
     <div class="catch-pkm-header-num">#${String(pkm.id).padStart(3,'0')}</div></div>`;
  document.getElementById('catch-basestats').innerHTML='<div style="font-size:.75rem;color:var(--t3)">加载种族值中…</div>';
  document.getElementById('catch-ev-yields').innerHTML='';
  try{
    const p=await fetchPkm(pkm.id);
    _catchBaseStats=p.stats;
    _catchEvYields=p.stats.filter(s=>s.effort>0);
    renderCatchBaseStats(p.stats,document.getElementById('catch-nature')?.value||null);
    const evText=_catchEvYields.length
      ?'击败该精灵可获得：'+_catchEvYields.map(s=>`${STAT_ZH[s.stat.name]||s.stat.name} +${s.effort}`).join('、')
      :'（该精灵无努力值产出）';
    document.getElementById('catch-ev-yields').textContent='EV产出 · '+evText;
  }catch(e){document.getElementById('catch-basestats').innerHTML='<div style="color:var(--danger);font-size:.8rem">种族值加载失败</div>';}
  updateCatchNatureHint();
}

function renderCatchBaseStats(stats,nature){
  const n=NATURES.find(x=>x.id===nature);
  document.getElementById('catch-basestats').innerHTML=
    `<div class="catch-stats-title">种族值（含性格修正）</div>`+
    stats.map(s=>{
      const val=s.base_stat;
      const isUp=n&&n.up===s.stat.name;const isDown=n&&n.down===s.stat.name;
      const eff=isUp?Math.floor(val*1.1):isDown?Math.floor(val*0.9):val;
      return statBar(s.stat.name,val)+(isUp||isDown?`<div style="font-size:.62rem;color:${isUp?'var(--acc2)':'var(--danger)'};font-family:'DM Mono',monospace;margin:-3px 0 3px 40px">${isUp?'▲':'▼'} 实际约${eff}</div>`:'');
    }).join('');
}

function updateCatchNatureHint(){
  if(!_catchBaseStats)return;
  const nature=document.getElementById('catch-nature')?.value;
  const n=NATURES.find(x=>x.id===nature);
  const hint=document.getElementById('catch-nature-hint');
  if(!hint)return;
  if(n&&n.up){
    hint.innerHTML=`<span style="color:var(--acc2)">▲ ${STAT_ZH[n.up]||n.up} +10%</span>&emsp;<span style="color:var(--danger)">▼ ${STAT_ZH[n.down]||n.down} -10%</span>`;
  }else{
    hint.innerHTML='<span style="color:var(--t3)">无增减（中性性格）</span>';
  }
  renderCatchBaseStats(_catchBaseStats,nature);
}

async function getCatchAIRec(){
  if(!_catchSelectedPkm||!_catchBaseStats){showToast('请先选择宝可梦');return;}
  const btn=document.getElementById('catch-ai-btn');btn.disabled=true;btn.textContent='AI分析中…';
  const sid=_curSid;const s=PKM_SERIES.find(x=>x.id===sid);
  const nature=document.getElementById('catch-nature').value;
  const natZh=getNatureZh(nature);
  const statsText=_catchBaseStats.map(st=>`${STAT_ZH[st.stat.name]||st.stat.name}:${st.base_stat}`).join(' / ');
  const evText=_catchEvYields?.length?_catchEvYields.map(x=>`${STAT_ZH[x.stat.name]||x.stat.name}+${x.effort}`).join('、'):'无产出';
  const prompt=`你是宝可梦培育专家。
精灵：${_catchSelectedPkm.name}（当前选择性格：${natZh}）
种族值：${statsText}
自身EV产出：${evText}
游戏版本：${s?.name||sid}（${s?.year||''}年）

请给出以下内容（纯文字，每段标题加【】）：

【PvE推荐性格】最适合通关的性格名 + 简要理由（30字内）
【PvE努力值方案】具体分配如HP252 速度252 特防6，说明思路（40字内）
【PvE刷值指南】在「${s?.name||'该版本'}」中，推荐去哪里刷哪些精灵来快速获得上述努力值（精灵名+产出能力+数量，列出2-4个）

【PvP推荐性格】主流对战性格 + 简要理由（30字内）
【PvP努力值方案】具体分配 + 思路（40字内）
【PvP刷值指南】在「${s?.name||'该版本'}」中的推荐刷值地点和精灵`;
  const box=document.getElementById('catch-ai-result');
  box.style.display='block';box.textContent='AI 分析中，请稍候…';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:900,temperature:0.7}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI暂时无法响应）';
    box.textContent=reply;
  }catch(e){box.textContent='获取失败：'+e.message;}
  btn.disabled=false;btn.textContent='✦ AI推荐性格 + 努力值';
}

function saveCatch(){
  if(!_catchSelectedPkm){showToast('请先选择宝可梦');return;}
  const sid=_curSid;
  const nature=document.getElementById('catch-nature')?.value||'serious';
  const nick=document.getElementById('catch-nickname')?.value?.trim()||'';
  const aiBox=document.getElementById('catch-ai-result');
  const aiRec=(aiBox&&aiBox.style.display!=='none')?aiBox.textContent:'';
  const list=lsGet('pkm_catches_'+sid)||[];
  list.unshift({pkmId:_catchSelectedPkm.id,name:_catchSelectedPkm.name,img:_catchSelectedPkm.img,nick,nature,baseStats:_catchBaseStats,evYields:_catchEvYields,aiRec,ts:Date.now()});
  lsSet('pkm_catches_'+sid,list);
  _catchSelectedPkm=null;_catchBaseStats=null;_catchEvYields=null;
  document.getElementById('catch-search-inp').value='';
  document.getElementById('catch-form-body').style.display='none';
  if(aiBox)aiBox.style.display='none';
  renderCatchList(sid);
  showToast('已保存到图鉴录入');
}

function renderCatchList(sid){
  const el=document.getElementById('catch-list');if(!el)return;
  const list=lsGet('pkm_catches_'+sid)||[];
  if(!list.length){el.innerHTML='<div style="font-size:.8rem;color:var(--t3);text-align:center;padding:16px 0">还没有录入记录，抓到好精灵快来记录吧</div>';return;}
  el.innerHTML=list.map((c,i)=>{
    const natZh=getNatureZh(c.nature);
    const d=new Date(c.ts);const ts=`${d.getMonth()+1}/${d.getDate()}`;
    const evStr=c.evYields?.length?c.evYields.map(x=>`${STAT_ZH[x.stat.name]||x.stat.name}+${x.effort}`).join(' '):'—';
    return`<div class="catch-card">
      <img src="${c.img}" alt="" onerror="this.style.display='none'">
      <div class="catch-card-body">
        <div class="catch-card-name">${esc(c.name)}${c.nick?` <span style="color:var(--acc);font-size:.78rem">「${esc(c.nick)}」</span>`:''}</div>
        <div class="catch-card-nature">${natZh}性格</div>
        <div class="catch-card-meta">EV产出 ${evStr} · ${ts}</div>
        ${c.aiRec?`<details style="margin-top:4px"><summary style="font-size:.7rem;color:var(--t3);cursor:pointer;font-family:'DM Mono',monospace">查看AI推荐方案</summary><div style="font-size:.75rem;color:var(--t2);white-space:pre-wrap;margin-top:4px;padding:6px;background:var(--bg);border-radius:3px;line-height:1.7">${esc(c.aiRec)}</div></details>`:''}
      </div>
      <button class="catch-card-del" onclick="delCatch('${sid}',${i})">✕</button>
    </div>`;
  }).join('');
}
function delCatch(sid,idx){
  if(!confirm('删除这条录入？'))return;
  const list=lsGet('pkm_catches_'+sid)||[];list.splice(idx,1);lsSet('pkm_catches_'+sid,list);renderCatchList(sid);
}

/* ============================
   🔍 通用内联宝可梦搜索
   ============================ */
async function doInlineSearch(v,resEl,mode){
  resEl.classList.add('open');
  resEl.innerHTML='<div class="pkm-inline-item" style="color:var(--t3);font-size:.78rem">搜索中…</div>';
  try{
    const q=v.trim().toLowerCase();
    let ids=[];
    // 中文名匹配
    const cnMatches=Object.entries(PKM_CN_TABLE).filter(([,name])=>name.includes(q)).slice(0,8);
    ids=cnMatches.map(([id])=>parseInt(id));
    // 英文名兜底
    if(!ids.length){
      const r=await fetch(`${POKEAPI}/pokemon?limit=2000`);const d=await r.json();
      ids=d.results.filter(x=>x.name.includes(q)).slice(0,8).map(x=>parseInt(x.url.split('/').slice(-2)[0]));
    }
    if(!ids.length){resEl.innerHTML='<div class="pkm-inline-item" style="color:var(--t3)">未找到匹配精灵</div>';return;}
    const items=await Promise.all(ids.map(async id=>{
      const p=await fetchPkm(id);
      const cn=PKM_CN_TABLE[id]||(await getPkmCNName(id,p.name))||p.name;
      const img=p.sprites?.front_default||'';
      return{id,name:cn,img};
    }));
    // 存入全局数组，onclick 只传 index，避免 JSON 中的引号破坏 HTML 属性
    _inlineSearchResults=items;
    resEl.innerHTML=items.map((it,i)=>`<div class="pkm-inline-item" onclick="selectInlinePkm(${i},'${mode}')">
      <img src="${it.img}" alt="" onerror="this.style.display='none'">
      <div><div class="pkm-inline-item-name">${esc(it.name)}</div><div class="pkm-inline-item-num">#${String(it.id).padStart(3,'0')}</div></div>
    </div>`).join('');
  }catch(e){resEl.innerHTML=`<div class="pkm-inline-item" style="color:var(--danger)">搜索失败</div>`;}
}
let _inlineSearchResults=[];
function selectInlinePkm(idx,mode){
  const pkm=_inlineSearchResults[idx];if(!pkm)return;
  if(mode==='party')addToParty(_curSid,pkm);
  else if(mode==='hunt')selectHuntPkm(pkm);
  else if(mode==='catch')selectCatchPkm(pkm);
}

/* ============================
   🎯 沉浸式狩猎界面
   ============================ */
let _immSid='',_immIdx=-1;

async function openImmHunt(sid,idx){
  const list=lsGet('pkm_hunt_'+sid)||[];
  const t=list[idx];if(!t||t.done)return;
  _immSid=sid;_immIdx=idx;

  // 填入基本信息（先用已有 sprite 快速显示）
  const natZh=getNatureZh(t.nature);
  document.getElementById('hunt-imm-name').textContent=t.name;
  document.getElementById('hunt-imm-target').textContent=natZh+'性格 · '+t.iv;
  document.getElementById('hunt-imm-num').textContent=t.count;
  document.getElementById('hunt-imm-sprite').src=t.img;
  document.getElementById('hunt-imm-bg').style.backgroundImage=`url(${t.img})`;
  document.getElementById('hunt-imm-success').style.display='none';

  // 打开overlay
  const ov=document.getElementById('ov-hunt-imm');
  ov.classList.add('on');
  document.body.style.overflow='hidden';

  // 后台拉取高清官方图
  try{
    const p=await fetchPkm(t.pkmId);
    const art=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||t.img;
    document.getElementById('hunt-imm-sprite').src=art;
    document.getElementById('hunt-imm-bg').style.backgroundImage=`url(${art})`;
    document.getElementById('hunt-success-sprite').src=art;
  }catch(e){}
}

function closeImmHunt(){
  const ov=document.getElementById('ov-hunt-imm');
  ov.classList.remove('on');
  document.body.style.overflow='';
}

function huntImmTap(e){
  // 不响应按钮点击冒泡
  if(e.target.closest('button'))return;
  const success=document.getElementById('hunt-imm-success');
  if(success&&success.style.display!=='none')return;

  // Pokeball 动效
  spawnBall(e.clientX,e.clientY);
  spawnFlash();

  // 更新计数
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  if(!list[_immIdx]||list[_immIdx].done)return;
  list[_immIdx].count++;
  lsSet('pkm_hunt_'+_immSid,list);

  // 数字跳动
  const numEl=document.getElementById('hunt-imm-num');
  numEl.textContent=list[_immIdx].count;
  numEl.classList.remove('pop');
  void numEl.offsetWidth;
  numEl.classList.add('pop');
}

function spawnBall(x,y){
  const el=document.createElement('div');
  el.className='hunt-ball';
  el.style.left=x+'px';
  el.style.top=y+'px';
  el.textContent='⚫';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),600);
}

function spawnFlash(){
  const el=document.createElement('div');
  el.className='hunt-flash';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),200);
}

function confirmImmCatch(){
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  const t=list[_immIdx];if(!t)return;
  t.done=true;
  lsSet('pkm_hunt_'+_immSid,list);

  // 显示成功动画层
  const suc=document.getElementById('hunt-imm-success');
  document.getElementById('hunt-success-name').textContent=t.name;
  document.getElementById('hunt-success-count').textContent='共遭遇 '+t.count+' 次';
  spawnSparks();
  suc.style.display='flex';

  // 2.5秒后关闭
  setTimeout(()=>{
    closeImmHunt();
    renderHuntList(_immSid);
    showToast('恭喜捕获 '+t.name+'！共遭遇 '+t.count+' 次');
  },2500);
}

function spawnSparks(){
  const container=document.getElementById('hunt-success-sparks');
  container.innerHTML='';
  const colors=['#f0c040','#5ab89a','#a0c8f0','#ff80ab','#c890ff','#ffffff'];
  const cx=window.innerWidth/2,cy=window.innerHeight/2;
  for(let i=0;i<40;i++){
    const el=document.createElement('div');
    el.className='spark';
    const angle=Math.random()*Math.PI*2;
    const dist=80+Math.random()*200;
    el.style.cssText=`
      left:${cx}px;top:${cy}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --dx:${Math.cos(angle)*dist}px;
      --dy:${Math.sin(angle)*dist}px;
      animation-delay:${Math.random()*0.3}s;
      animation-duration:${0.6+Math.random()*0.6}s;
      width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;
    `;
    container.appendChild(el);
  }
}
