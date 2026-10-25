(function () {
  'use strict';

  var TYPES = ['loophole', 'milk', 'puppeteer', 'poet', 'overlord'];

  // counts: 每种人格的得票；firstSeen: 该倾向第一次出现的位置（越小越深）。
  function calculate(questions, answers) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('请先抽取梦境题目');
    }
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      throw new Error('请完成全部题目后再查看结果');
    }
    var counts = {};
    var firstSeen = {};
    TYPES.forEach(function (type) { counts[type] = 0; firstSeen[type] = -1; });
    questions.forEach(function (question, order) {
      if (!Object.prototype.hasOwnProperty.call(answers, question.id)) {
        throw new Error('尚未作答：' + question.id);
      }
      var option = question.options.find(function (item) {
        return item.key === answers[question.id];
      });
      if (!option || TYPES.indexOf(option.type) === -1) {
        throw new Error('选项无效：' + question.id);
      }
      counts[option.type] += 1;
      if (firstSeen[option.type] === -1) firstSeen[option.type] = order;
    });
    var total = questions.length;
    var ranking = TYPES.slice().sort(function (a, b) {
      if (counts[b] !== counts[a]) return counts[b] - counts[a];
      var fa = firstSeen[a];
      var fb = firstSeen[b];
      if (fa !== fb) return (fa === -1 ? 99 : fa) - (fb === -1 ? 99 : fb);
      return TYPES.indexOf(a) - TYPES.indexOf(b);
    });
    var percentages = {};
    TYPES.forEach(function (type) {
      percentages[type] = Math.round(counts[type] / total * 100);
    });
    return {
      total: total,
      counts: counts,
      percentages: percentages,
      firstSeen: firstSeen,
      ranking: ranking,
      winner: ranking[0],
      shadow: ranking[1],
      tied: counts[ranking[0]] === counts[ranking[1]]
    };
  }

  window.DreamScore = { TYPES: TYPES, calculate: calculate };
}());
