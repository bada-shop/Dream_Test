(function () {
  'use strict';

  var TYPES = window.DreamScore.TYPES;

  var ARCHETYPES = {
    loophole: {
      id: 'loophole',
      name: '合法缺德师',
      short: '缺德',
      en: 'THE LOOPHOLE ARTIST',
      tagline: '规则没写的地方，就是我的地盘',
      description: '在梦里，你从不掀桌子——你只是把桌腿偷偷锯短一截。你熟悉每一条规则的边界，专门做"挑不出毛病"的坏事，嚣张得理直气壮，气死人不负法律责任。你的座右铭是：道德约束别人，条款成全我。',
      scene: '名场面：指着条款微笑说"你可以生气，但不能告我"。"',
      tags: ['钻空子十级学者', '嚣张但合法', '气死人不负责任', '条款在手天下我有'],
      tip: '现实里的你也许是最守规矩的人——毕竟真正会钻空子的人，从不屑于破坏规则。',
      bands: ['本次梦境里，这条人格线几乎没被踩醒，你睡得意外端正。', '你在个别梦里嗅到了规则缝隙的味道，缺德欲尚处试用期。', '多个梦境都留下了钻空子的脚印，嚣张值稳步上升。', '每一个梦都被你钻出了风，你是梦境条款界的头号讼棍。']
    },
    milk: {
      id: 'milk',
      name: '呆萌毒奶',
      short: '毒奶',
      en: 'THE BLESSING CURSE',
      tagline: '我是真心关心你，虽然你听完想报警',
      description: '梦里的你永远真诚、永远温柔，也永远在别人心口精准补刀。你以为自己在安慰，对方已经当场石化；你从不觉得自己说话难听——这才是最可怕的地方。你的杀伤力百分之百纯天然，无添加，且完全不自知。',
      scene: '名场面：拍着你的手背轻声说"别难过，他从头到尾都没喜欢过你"。',
      tags: ['嘴甜心直刀更快', '安慰式暴击', '钝感力满级', '朋友不敢让你开口'],
      tip: '重要场合先在心里数三个数——数完再决定说不说（虽然你多半还是会说）。',
      bands: ['本次梦境你嘴下留情，朋友们虚惊一场。', '你偶尔在梦里开刃，语气温暖内容致命，杀伤有限但记忆犹新。', '安慰式暴击多次出现，被你关心过的人都需要缓一缓。', '十道梦境道道见血，你是朋友圈公认的温柔杀手。']
    },
    puppeteer: {
      id: 'puppeteer',
      name: '笑面操盘手',
      short: '操盘手',
      en: 'THE GRINNING PUPPETEER',
      tagline: '一切尽在掌握，包括你以为的自由',
      description: '梦里的你笑眯眯看所有人跑来跑去，其实每一步都踩在你铺好的点上。你很少动怒——发火是低等生物的事。你的自负从来不靠嘴，靠的是事后大家后知后觉的那句"原来全是你安排的"。',
      scene: '名场面：事成之后才轻描淡写地说"三天前就算到了"，顺便谢绝感谢。',
      tags: ['智商压制型选手', '笑面布局', '自负有实力背书', '全知视角玩家'],
      tip: '给别人留一点"赢你一次"的机会——棋逢对手才好玩，一直赢其实很无聊。',
      bands: ['本次梦境你懒得布局，操盘手休市一天。', '几个梦里你悄悄落子，胜负欲藏在微笑后面。', '多数梦境都在你的棋谱之内，别人还在跑，你已在收网。', '十个梦十盘棋，你就是这场睡眠的庄家。']
    },
    poet: {
      id: 'poet',
      name: '疯批诗人',
      short: '疯批',
      en: 'THE DERANGED POET',
      tagline: '我毁掉的每一件东西，都成了作品',
      description: '梦里的你把心碎当素材，把废墟当舞台。你不在乎结局，只在乎这一段够不够美。你坚信自己是故事里最迷人的反派——平心而论，你可能是对的。爱过你的人需要很久才肯承认：他们最忘不掉的，也是你。',
      scene: '名场面：把最后一条消息读成诗，然后删掉整个对话框。',
      tags: ['美强惨代言人', '废墟美学大师', '坏得很迷人', '情绪浓度超标'],
      tip: '感动自己之前先确认一下：这次的风暴中心，是不是又只有你一个人。',
      bands: ['本次梦境意外平静，你的诗性睡了个好觉。', '有些梦的收尾带着你的美学私心，情绪浓度偏高。', '你反复把梦的废墟摆成舞台，观众席只坐得下你自己。', '十道梦境全程带诗，你把潜意识过成了个人作品展。']
    },
    overlord: {
      id: 'overlord',
      name: '愣头青大魔王',
      short: '愣头青',
      en: 'THE OVERKILL OVERLORD',
      tagline: '这次我一定要让世界颤抖！——哐当。',
      description: '梦里的你立志成为让人闻风丧胆的终极反派，奈何每次出手都用力过猛：想毁灭世界，先炸了自己家堡垒。你的邪恶真诚十足，效果全是喜剧。好消息是全城的人都记住了你，坏消息是以笑话的方式。',
      scene: '名场面：站在城堡顶端狂笑，脚下的城堡是自己上周炸的。',
      tags: ['志向远大手法拉胯', '自爆型反派', '气势九十分执行十分', '翻车现场常驻嘉宾'],
      tip: '把"毁灭世界"先拆成"今天早睡"——魔王大业，也是要从每日打卡做起的。',
      bands: ['本次梦境你意外沉稳，魔王之力封印良好。', '几个梦里你在憋大招，翻车率五五开。', '出手次次用力过猛，梦的特效组加班到天亮。', '十道梦境十次翻车，你是梦境年度喜剧之王。']
    }
  };

  function levelOf(score) {
    if (score <= 0) return '未检出';
    if (score < 30) return '若隐若现';
    if (score < 50) return '时常浮现';
    return '完全显形';
  }

  function bandIndexOf(score) {
    if (score <= 0) return 0;
    if (score < 30) return 1;
    if (score < 50) return 2;
    return 3;
  }

  function validate(questions, answers) {
    if (!Array.isArray(window.DreamQuestions)) throw new Error('题库尚未加载');
    var bank = {};
    window.DreamQuestions.forEach(function (q) { bank[q.id] = q; });
    var seen = new Set();
    var normalized = questions.map(function (q) {
      var original = q && bank[q.id];
      if (!original) throw new Error('题目不在当前题库中：' + (q && q.id));
      if (seen.has(q.id)) throw new Error('题目重复：' + q.id);
      seen.add(q.id);
      if (q.title !== original.title || !Array.isArray(q.options) || q.options.length !== 5) {
        throw new Error('题目内容与当前题库不符：' + q.id);
      }
      for (var i = 0; i < 5; i += 1) {
        if (q.options[i].key !== original.options[i].key || q.options[i].text !== original.options[i].text || q.options[i].type !== original.options[i].type) {
          throw new Error('题目选项与当前题库不符：' + q.id);
        }
      }
      if (!Object.prototype.hasOwnProperty.call(answers, q.id) || !q.options.some(function (o) { return o.key === answers[q.id]; })) {
        throw new Error('答案缺失或无效：' + q.id);
      }
      return original;
    });
    if (questions.length !== 10) throw new Error('梦境抽取数量异常，须为10题');
    return normalized;
  }

  function analyze(questions, answers) {
    var list = validate(questions, answers);
    var score = window.DreamScore.calculate(list, answers);
    var winner = ARCHETYPES[score.winner];
    var shadow = ARCHETYPES[score.shadow];

    var dimensions = TYPES.map(function (type) {
      var config = ARCHETYPES[type];
      var pct = score.percentages[type];
      var evidence = list
        .map(function (q, order) {
          var option = q.options.find(function (o) { return o.key === answers[q.id]; });
          return { order: order, title: q.title, answer: option.text };
        })
        .filter(function (_item, order) {
          var q = list[order];
          var option = q.options.find(function (o) { return o.key === answers[q.id]; });
          return option.type === type;
        })
        .slice(0, 2)
        .map(function (item) { return { title: item.title, answer: item.answer }; });
      return {
        id: type,
        label: config.name,
        short: config.short,
        score: pct,
        count: score.counts[type],
        total: score.total,
        level: levelOf(pct),
        description: config.bands[bandIndexOf(pct)],
        evidence: evidence
      };
    });

    var replay = list.map(function (q, order) {
      var option = q.options.find(function (o) { return o.key === answers[q.id]; });
      return {
        order: order,
        title: q.title,
        answer: option.text,
        typeLabel: ARCHETYPES[option.type].name
      };
    });

    var others = score.ranking.slice(1, 4).map(function (type) {
      return ARCHETYPES[type].name + ' ' + score.counts[type] + '票';
    });
    var firstQ = score.firstSeen[score.winner] + 1;
    var reason = '本轮10道梦境里，你的选择有 ' + score.counts[score.winner] + ' 次走进「' + winner.name + '」的行为路径（其余主要分布在：' + others.join('、') + '）；该倾向最早浮现于第 ' + firstQ + ' 题。' + (score.tied ? '本轮与「' + shadow.name + '」同票，按"更早浮现者优先"的潜意识规则判定。' : '');

    var shadowNote = '「' + shadow.name + '」以 ' + score.counts[score.shadow] + ' 票紧随其后。下次遇到它熟悉的梦境场景时，留意一下你嘴角的走向。';

    return {
      modeLabel: '梦境鉴定',
      total: score.total,
      dimensions: dimensions,
      replay: replay,
      summary: '本轮从100题梦境题库随机抽取10题。你的隐藏人格是「' + winner.name + '」（命中 ' + score.counts[score.winner] + '/10，浓度 ' + score.percentages[score.winner] + '%），镜像人格「' + shadow.name + '」（' + score.counts[score.shadow] + '/10）。浓度按命中数×10%计算。以上为本轮答题的趣味画像，不是固定人格，更不是心理诊断。',
      method: '题库共100题，覆盖飞行坠落、追捕逃亡、校园考场、职场办公室、亲友聚会、诡异交易、超能力、末日灾难、怪物伙伴、深层迷宫十类梦境场景。每次测试随机抽取10题，题目顺序同样随机；每题五个选项分别对应五种隐藏人格的原型化行为——合法缺德师（钻规则的空子）、呆萌毒奶（用关心的语气说致命的话）、笑面操盘手（布局与智商压制）、疯批诗人（把破坏做成美学）、愣头青大魔王（用力过猛的反派梦）。选中即给对应人格计1票，票数×10%为该人格浓度；得票最高者为本轮隐藏人格；同票时按"该倾向更早浮现者优先"的固定规则判定；镜像人格取第二名。全部计算在本地浏览器完成，不上传任何数据。本测试为娱乐向内容，不构成心理诊断。',
      type: {
        id: 'DREAM-' + winner.id.toUpperCase(),
        name: winner.name,
        en: winner.en,
        tagline: winner.tagline,
        description: winner.description,
        scene: winner.scene,
        tags: winner.tags,
        reason: reason,
        tip: winner.tip,
        shadow: shadowNote
      }
    };
  }

  window.DreamProfile = { analyze: analyze, ARCHETYPES: ARCHETYPES };
}());
