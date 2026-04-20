/**
 * 【超级形态图片爬虫】
 * 使用方法：
 * 1. 浏览器打开 https://op.gg/zh-cn/pokemon-champions/pokedex
 * 2. 打开 DevTools → Console（F12）
 * 3. 粘贴以下代码，回车运行
 * 4. 脚本会依次访问各超级形态详情页，提取图片URL
 * 5. 最终自动下载 mega_images.json
 */

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const TARGET_SLUGS = [
    'mega-clefable',
    'mega-starmie',
    'mega-victreebel',
    'mega-feraligatr',
    'mega-skarmory',
    'mega-chimecho',
    'mega-froslass',
    'mega-emboar',
    'mega-excadrill',
    'mega-chandelure',
    'mega-golurk',
    'mega-chesnaught',
    'mega-delphox',
    'mega-greninja',
    'mega-floette',
    'mega-meowstic',
    'mega-hawlucha',
    'mega-crabominable',
    'mega-drampa',
    'mega-scovillain',
    'mega-glimmora',
  ];

  const base = '/zh-cn/pokemon-champions';
  const results = {};

  for (let i = 0; i < TARGET_SLUGS.length; i++) {
    const slug = TARGET_SLUGS[i];
    try {
      const r = await fetch(`${base}/pokedex/${slug}`);
      if (!r.ok) { console.warn(`✗ ${slug}: ${r.status}`); results[slug] = ''; continue; }
      const html = await r.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 策略1：从 __NEXT_DATA__ 找 image 字段
      let imgUrl = '';
      const scriptTag = doc.querySelector('script#__NEXT_DATA__');
      if (scriptTag) {
        try {
          const nd = JSON.parse(scriptTag.textContent);
          const pkm = nd?.props?.pageProps?.pokemon || nd?.props?.pageProps?.data;
          if (pkm) {
            imgUrl = pkm.image_url || pkm.imageUrl || pkm.image || pkm.sprite || pkm.icon || '';
            // 也尝试嵌套字段
            if (!imgUrl && pkm.sprites) {
              imgUrl = pkm.sprites.front_default || pkm.sprites.image || '';
            }
          }
          // 从 JSON 字符串里提取可能的图片URL
          if (!imgUrl) {
            const imgMatch = JSON.stringify(nd).match(/"(https?:\/\/[^"]+(?:\.png|\.jpg|\.webp)[^"]*)"/);
            if (imgMatch) imgUrl = imgMatch[1];
          }
        } catch(e) {}
      }

      // 策略2：从 <img> 标签里找宝可梦图片
      if (!imgUrl) {
        const imgs = [...doc.querySelectorAll('img[src*="pokemon"], img[src*="sprite"], img[src*="pokedex"]')];
        if (imgs.length) imgUrl = imgs[0].getAttribute('src') || '';
      }

      // 策略3：找任何 op.gg CDN 图片
      if (!imgUrl) {
        const imgs = [...doc.querySelectorAll('img[src*="op.gg"], img[src*="opgg"]')];
        if (imgs.length) imgUrl = imgs[0].getAttribute('src') || '';
      }

      results[slug] = imgUrl;
      console.log(`[${i+1}/${TARGET_SLUGS.length}] ${slug}: ${imgUrl || '(未找到)'}`);
    } catch(e) {
      console.warn(`✗ ${slug}: ${e.message}`);
      results[slug] = '';
    }
    await sleep(600);
  }

  console.log('\n✓ 完成！结果:');
  console.log(JSON.stringify(results, null, 2));

  // 下载 JSON
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: 'mega_images.json' }).click();
  URL.revokeObjectURL(url);
  return results;
})();
