# 星言塔罗 — 小阿尔卡纳牌图风格规范

## 设计目标
56张小阿尔卡纳牌图必须与现有22张大阿尔卡纳保持统一视觉语言，确保用户在浏览牌库和占卜过程中获得一致的沉浸式体验。

## 核心风格定位

**「神秘新艺术风 × 深夜星空」**

- 画风：细腻的数字插画，融合新艺术运动（Art Nouveau）的流动线条与神秘学符号
- 色调：以深夜蓝（#0A0A1A）为底色，金色（#C9A84C）为主光，辅以各花色的元素色
- 质感：牌面带有微妙的星尘颗粒感和复古纸张纹理
- 构图：中央主体 + 环绕的神秘符号边框，顶部罗马数字/数字，底部牌名

## 花色配色规范

| 花色 | 元素 | 主色 | 辅助色 | 光效 |
|------|------|------|--------|------|
| 权杖 Wands | 火 | #D44040 深红 | #8B2A2A 暗红 | 火焰光晕 |
| 圣杯 Cups | 水 | #3A6B8B 深蓝 | #1E3A4D 深海蓝 | 水波折射 |
| 宝剑 Swords | 风/空气 | #6B8B6B 灰绿 | #4A6B4A 暗绿 | 金属冷光 |
| 星币 Pentacles | 土 | #8B7A3A 暗金 | #5C4A1F 深褐 | 大地暖光 |

## 牌面结构规范

每张牌统一尺寸：**600 × 1050 px**（2:3.5 塔罗标准比例）

### 图层结构（从上到下）

1. **牌名区域**（底部 80px）
   - 中文牌名：Noto Serif SC，24px，金色 #C9A84C
   - 英文牌名：Cinzel，14px，月银色 #B8B8D8
   - 背景：半透明深色遮罩

2. **主视觉区域**（中央 750px）
   - 中央主体：与牌义相关的象征性人物/场景/物品
   - 环境：对应元素的氛围（火焰/水流/云雾/大地）
   - 光效：从主体向外扩散的柔和光晕

3. **数字/符号区域**（顶部 100px）
   - 数字牌（1-10）：大号阿拉伯数字 + 花色符号
   - 宫廷牌（侍从/骑士/王后/国王）：人物头衔 + 花色符号
   - 字体：Cinzel，数字 48px，符号 36px

4. **边框装饰**（四周 20px）
   - 细线边框：金色 1px
   - 四角：小型神秘符号（对应元素）
   - 背景纹理：微妙的星图/暗纹

5. **底色层**
   - 主色：#12122B（深空蓝）
   - 渐变：从中心向边缘的径向渐变，中心略亮

## 各花色视觉指引

### 权杖（Wands）— 火元素
- 主体：燃烧的权杖、火焰中的身影、火山、烈日
- 氛围：温暖、激情、动态、上升感
- 特效：火星粒子、热浪扭曲

### 圣杯（Cups）— 水元素
- 主体：盛水的圣杯、水中倒影、海洋、月亮
- 氛围：流动、情感、反射、深邃
- 特效：水滴、涟漪、月光折射

### 宝剑（Swords）— 风元素
- 主体：悬浮的宝剑、云层、飞鸟、风暴
- 氛围：锐利、清晰、穿透、 intellect
- 特效：风痕、闪电微光、金属反光

### 星币（Pentacles）— 土元素
- 主体：五角星币、丰饶之角、森林、花园
- 氛围：稳固、丰饶、自然、物质
- 特效：金色尘埃、植物生长光晕

## 宫廷牌统一人设

| 角色 | 年龄感 | 气质 | 姿态 |
|------|--------|------|------|
| 侍从 Page | 少年/少女 | 好奇、学习、初出茅庐 | 站立，手持花色象征物 |
| 骑士 Knight | 青年 | 行动、追求、热情 | 骑乘或行进中，动态感 |
| 王后 Queen | 成熟女性 | 滋养、直觉、内在力量 | 端坐，王座或自然环境中 |
| 国王 King | 成熟男性 | 权威、掌控、智慧 | 端坐王座，沉稳威严 |

## 生成方案

### 方案 A：AI 批量生成（推荐，成本可控）
使用统一的 Midjourney / Stable Diffusion 提示词模板，批量生成后统一后期处理。

**基础提示词模板：**
```
A mystical tarot card in Art Nouveau style, [主体描述], 
deep midnight blue background (#0A0A1A), golden accents (#C9A84C), 
stardust particles, vintage paper texture, 
intricate mystical border with elemental symbols, 
soft ethereal glow emanating from central figure, 
no text, no letters, no numbers, 
highly detailed digital illustration, 2:3.5 aspect ratio
```

### 方案 B：购买商用授权牌图
推荐平台：
- Creative Market / Etsy（搜索 "tarot deck commercial license"）
- 预算约 $50-200 可获得完整 78 张商用授权

### 方案 C：程序化生成（保底方案）
使用 Python + Pillow 生成风格化牌图，统一几何图形 + 渐变 + 纹理叠加。质量较低但完全可控。

## 文件命名规范

```
public/cards/
  major-00.jpg ~ major-21.jpg    (已有)
  wands-1.jpg ~ wands-10.jpg     (待生成)
  wands-page.jpg
  wands-knight.jpg
  wands-queen.jpg
  wands-king.jpg
  cups-1.jpg ~ cups-10.jpg       (待生成)
  cups-page.jpg
  cups-knight.jpg
  cups-queen.jpg
  cups-king.jpg
  swords-1.jpg ~ swords-10.jpg   (待生成)
  swords-page.jpg
  swords-knight.jpg
  swords-queen.jpg
  swords-king.jpg
  pentacles-1.jpg ~ pentacles-10.jpg (待生成)
  pentacles-page.jpg
  pentacles-knight.jpg
  pentacles-queen.jpg
  pentacles-king.jpg
```

## 数据文件同步修改

生成牌图后，需同步修改 `src/data/tarotCards.ts` 中小阿尔卡纳的 `image` 路径：

```typescript
// 当前路径（需修改）
image: '/assets/tarot/wands-1.jpg',

// 修改后
image: '/cards/wands-1.jpg',
```

确保所有 56 张小阿尔卡纳统一指向 `/cards/` 目录。

## 质量检查清单

- [ ] 56张牌全部生成完毕
- [ ] 统一尺寸 600×1050px
- [ ] 统一底色 #12122B
- [ ] 统一金色点缀 #C9A84C
- [ ] 无文字/数字/字母（由前端叠加）
- [ ] 文件大小 < 200KB/张（WebP 优先）
- [ ] 在暗色背景下测试视觉效果
- [ ] 与大阿尔卡纳并排对比，风格一致
