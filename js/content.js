/* =============================================================
   content.js —— 网站所有文字/作品数据都在这里，改这一个文件就行
   规则：
   1) 想加作品：在对应分类的 items 数组里加一项
   2) img 填图片路径（比如 "img/a/my-work.jpg"）；留空 "" 就显示为待放入的空槽位
   3) 顺序就是页面上的显示顺序
   ============================================================= */

const CONTENT = {
  /* ---------- 名片 ---------- */
  me: {
    handle: 'WeirDo',
    name: '吴舒逊',
    nameEn: 'WU SHUXUN',
    role: '好奇心/intj',
    hero: 'img/a/avatar.png',
    avatar: 'img/a/hero.jpg',
    email: '3414138038@qq.com',
    phone: '13787153509',
    // 自白对白：点「继续」一句一句往下走，想改就改这几句
    dialogue: [
      '你好，我是吴舒逊。',
      '你现在看到的，是一个搭载了‘INTJ 理性逻辑核’的设计大脑。',
      '不过别紧张，我已经安装了‘热情友善’和‘绝不拖延’的性格补丁。',
      '屏幕上这些是我的程序系统。',
      '至于我的能力……滑到下一页，你就知道了。',
    ],
    // 基本信息：两个一行，顺序就是显示顺序
    infos: [
      ['年龄', '21 岁'],
      ['学校', '湖南师范大学（211）'],
      ['电话', '13787153509'],
      ['专业', '艺术设计学'],
      ['邮箱', '3414138038@qq.com'],
      ['状态', '本科在读（2027 届毕业生）'],
    ],
    // 实习经历：这一章的重点
    intern: [
      {
        co: '百度在线网络技术有限公司（百度 PSIG）',
        role: '运营设计',
        date: '2026.05 – 2026.09',
        points: [
          '负责百度网盘和百度文库的活动页面、物料等运营视觉设计。',
          '负责网盘 IP「云一朵」的优化与延展设计。',
          '独立完成从 0 到 1 的 S 级 AI Coding 网页制作。',
        ],
      },
      {
        co: '湖南快乐阳光互动娱乐有限公司（芒果 TV）',
        role: '视觉创意设计',
        date: '2025.12 – 2026.02',
        points: [
          '负责 OTT / IPTV 大屏通栏、活动页等运营视觉设计。',
          '参与沉淀大屏视觉规范，协同跨端团队保障活动按时上线。',
        ],
      },
      {
        co: '北京喜得网络科技有限公司（Cider）',
        role: '平面设计',
        date: '2025.06 – 2025.08',
        points: [
          '负责品牌大型活动全端 hero / banner、营销页面主视觉设计。',
          '完成品牌内部庆典视觉体系搭建、线下活动全场景物料与周边设计。',
        ],
      },
    ],
  },

  /* ---------- 作品库 ----------
     六个分类。每个分类里的 items 就是格子，格子数量决定排版：
     3 个及以内排一行，偶数个排两行。想加就往 items 里加一项。 */
  gallery: [
    {
      key: 'keyvisual',
      no: 'A',
      name: '主视觉设计',
      nameEn: 'KEY VISUAL',
      intro: '整个项目的第一眼。定调子、定气氛，后面所有物料都从这一张里长出来。',
      items: [
        {
          title: '玩赚冬奥季 · 主视觉',
          meta: '主视觉 / 活动',
          img: 'img/b/kv-winter-cover.jpg',
          // imgs：多张图上下接成一张长图，点开作品就能滑着看
          imgs: [
            'img/b/kv-winter-0.jpg',
            'img/b/kv-winter-1.jpg',
            'img/b/kv-winter-2.jpg',
            'img/b/kv-winter-3.jpg',
          ],
          desc: '冬奥季活动主视觉，以及从 KV 延展出去的活动界面。',
        },

        { 
          title: 'cider五周年 · 主视觉',
          meta: '主视觉 / 品牌', 
          img: 'img/c/kv-cider-0.jpg',
           // imgs：多张图上下接成一张长图，点开作品就能滑着看
          imgs: [
            'img/c/kv-cider-0.jpg',
            'img/c/kv-cider-1.jpg',
            'img/c/kv-cider-2.jpg',
            'img/c/kv-cider-3.jpg',
            'img/c/kv-cider-4.jpg',
          ],
          desc: '' 
        },

        {
          title: '待放入 · 主视觉 03', 
          meta: 'KV', 
          img: '', 
          desc: '' },
      ],
    },
    {
      key: 'campaign',
      no: 'B',
      name: '活动运营设计',
      nameEn: 'CAMPAIGN',
      intro: '实习里做得最多的一块：活动页、大屏通栏、各种尺寸的物料，要好看，也要能按时上线。',
      items: [
        { title: '待放入 · 活动页 01', meta: '运营设计', img: '', desc: '' },
      ],
    },
    {
      key: 'aicoding',
      no: 'C',
      name: 'AI Coding 设计',
      nameEn: 'AI CODING',
      intro: '用 AI 把设计稿直接写成能跑的网页。从 0 到 1，设计和实现都是自己一个人。',
      items: [
        { title: '待放入 · 网页 01', meta: 'AI Coding / 网页', img: '', desc: '' },
      ],
    },
    {
      key: 'brand',
      no: 'D',
      name: '品牌设计',
      nameEn: 'BRANDING',
      intro: 'IP、标志、视觉体系、周边。做的是一整套能长期用下去的规则，不是一张图。',
      items: [
               {
          title: '待放入 · 主视觉 03', 
          meta: 'KV', 
          img: 'img/d/band-0.jpg', 

          imgs: [
            'img/d/band-0.jpg', 
            'img/d/band-1.jpg', 
            'img/d/band-2.jpg', 
            'img/d/band-3.jpg', 
          ],
          desc: '' 
        },
      ],
    },
    {
      key: 'illust',
      no: 'E',
      name: '插画设计',
      nameEn: 'ILLUSTRATION',
      intro: '画画是我坚持最久的一件事。水彩、板绘都试过，最喜欢水彩——多一点少一点水都不一样。',
      items: [
        { title: '待放入 · 插画 01', meta: '插画', img: '', desc: '' },
      ],
    },
    {
      key: 'other',
      no: 'F',
      name: '其他',
      nameEn: 'OTHERS',
      intro: '不好归类但我很喜欢的东西：手工、手账拼贴、掐丝珐琅、还有一些没做完的念头。',
      items: [
        { title: '待放入 · 手工', meta: '手作', img: '', desc: '' },
        { title: '待放入 · 手账拼贴', meta: '拼贴', img: '', desc: '' },
        { title: '待放入 · 掐丝珐琅', meta: '非遗尝试', img: '', desc: '' },
      ],
    },
  ],
};
