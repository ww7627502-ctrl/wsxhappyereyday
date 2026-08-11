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
     四个作品方向。每个分类里的 items 就是该入口下的作品卡片。 */
  gallery: [
    {
      key: 'operation',
      no: 'A',
      name: '运营设计',
      nameEn: 'OPERATION',
      intro: '围绕活动和内容运营，把主视觉延展成真正能上线、能传播的一整套物料。',
      items: [
        {
          title: '开业季师生优惠',
          meta: '运营设计 / 活动视觉',
          img: 'img/works/operation/school-1.jpg',
          media: [
            'img/works/operation/school-1.jpg',
            'img/works/operation/school-2.jpg',
            'img/works/operation/school-3.jpg',
          ],
          desc: '开业季师生优惠活动视觉页面。',
        },
        {
          title: '职场休闲娱乐二期',
          meta: '运营设计 / 活动视觉',
          img: 'img/works/operation/workplace-cover.jpg',
          media: [
            'img/works/operation/workplace-1.jpg',
            'img/works/operation/workplace-2.jpg',
            'img/works/operation/workplace-3.gif',
            'img/works/operation/workplace-4.jpg',
          ],
          desc: '职场休闲娱乐活动二期视觉页面。',
        },
        {
          title: '云一朵成长',
          meta: '运营设计 / 等级徽章',
          img: 'img/works/operation/yun-cover.jpg',
          media: [
            'img/works/operation/yun-1.jpg',
          ],
          desc: '云一朵记录等级徽章设计。',
        },
        {
          title: '玩赚冬奥季',
          meta: '运营设计 / 活动视觉',
          img: 'img/works/operation/winter-cover.jpg',
          media: [
            'img/works/operation/winter-1.jpg',
            'img/works/operation/winter-2.jpg',
            'img/works/operation/winter-3.jpg',
            'img/works/operation/winter-4.jpg',
            'img/works/operation/winter-5.gif',
          ],
          desc: '冬奥季活动视觉，以及从主视觉延展出的连续页面。',
        },
        {
          title: '士气闯新春',
          meta: '运营设计 / 活动视觉',
          img: 'img/works/operation/spring-cover.jpg',
          media: [
            'img/works/operation/spring-1.jpg',
            'img/works/operation/spring-2.jpg',
            'img/works/operation/spring-3.jpg',
          ],
          desc: '新春活动视觉与运营页面。',
        },
      ],
    },
    {
      key: 'aicoding',
      no: 'B',
      name: 'AI Coding提效设计',
      nameEn: 'AI CODING/Vibe Coding',
      intro: '用 AI 把设计稿直接写成能跑的网页，让设计、验证和交付更快地连在一起。',
      items: [
        {
          title: 'AI Coding 资源位提效平台',
          meta: 'AI Coding / 提效设计',
          img: 'img/works/aicoding/platform-cover.jpg',
          muteBgmOnPlay: true,
          media: [
            'img/works/aicoding/platform-1.jpg',
            'img/works/aicoding/platform-2.jpg',
            'img/works/aicoding/platform-3.jpg',
            'img/works/aicoding/platform-4.jpg',
            'img/works/aicoding/platform-demo-web.m4v',
          ],
          desc: 'AI Coding 资源位提效平台设计，包含界面与流程展示。',
        },
      ],
    },
    {
      key: 'multi',
      no: 'C',
      name: '多端设计',
      nameEn: 'MULTI-PLATFORM',
      intro: '面向不同屏幕和使用场景的界面设计，让内容在电视、网页和多端设备上都清晰好用。',
      items: [
        {
          title: '芒果TV多端设计',
          meta: '多端设计 / UI',
          img: 'img/works/multi/mgtv-cover.jpg',
          media: [
            'img/works/multi/mgtv-1.jpg',
            'img/works/multi/mgtv-3.jpg',
            'img/works/multi/mgtv-2.jpg',
          ],
          desc: '芒果TV多端视觉与界面设计。',
        },
      ],
    },
    {
      key: 'other',
      no: 'D',
      name: '其他设计',
      nameEn: 'OTHERS',
      intro: '品牌、插画和其他难以归类但值得展示的视觉尝试。',
      items: [
        {
          title: 'Cider五周年',
          meta: '品牌视觉',
          img: 'img/works/other/cider-cover.jpg',
          media: [
            'img/works/other/cider-1.jpg',
            'img/works/other/cider-2.jpg',
          ],
          desc: '',
        },
        {
          title: '轮上山河插画设计',
          meta: '插画设计',
          img: 'img/works/other/river-cover.jpg',
          media: [
            'img/works/other/river-1.jpg',
          ],
          desc: '',
        },
        {
          title: '毛屿品牌设计',
          meta: '品牌设计',
          img: 'img/works/other/maoyu-cover.jpg',
          media: [
            'img/works/other/maoyu-1.jpg',
          ],
          desc: '',
        },
      ],
    },
  ],
};
