(function () {
  'use strict';

  var colors = {
    paper: '#f7f5ff',
    ink: '#2c2657',
    green: '#efeaff',
    orange: '#6c5ce7',
    muted: '#6e6a94'
  };
  var sans = '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
  var serif = '"Songti SC", "STSong", "SimSun", serif';

  function roundedRect(ctx, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    ctx.fill();
  }

  async function create(data) {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    var profile = data.profile;
    var type = profile.type;
    var width = 720;
    var scale = 2;
    var margin = 48;
    var innerWidth = width - margin * 2;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('当前浏览器暂不支持生成海报');
    }
    var commands = [];
    var y = 48;

    function rectangle(x, top, w, h, color, radius) {
      var command = { kind: 'rect', x: x, y: top, width: w, height: h, color: color, radius: radius || 0 };
      commands.push(command);
      return command;
    }

    function text(value, x, top, maxWidth, size, lineHeight, color, weight, family) {
      var font = (weight || '400') + ' ' + size + 'px ' + (family || sans);
      ctx.font = font;
      var lines = [];
      String(value == null ? '' : value).replace(/\r\n?/g, '\n').split('\n').forEach(function (paragraph) {
        var line = '';
        Array.from(paragraph).forEach(function (character) {
          if (line && ctx.measureText(line + character).width > maxWidth) {
            lines.push(line);
            line = character;
          } else {
            line += character;
          }
        });
        lines.push(line);
      });
      lines.forEach(function (line, index) {
        commands.push({ kind: 'text', value: line, x: x, y: top + index * lineHeight + (lineHeight - size) / 2, font: font, color: color || colors.ink });
      });
      return lines.length * lineHeight;
    }

    function paragraph(value, size, lineHeight, color, weight, family) {
      y += text(value, margin, y, innerWidth, size, lineHeight, color, weight, family);
    }

    function heading(number, title) {
      y += 16;
      rectangle(margin, y + 9, 5, 25, colors.orange, 2);
      y += text(number + '  /  ' + title, margin + 20, y, innerWidth - 20, 26, 44, colors.ink, '600');
      y += 14;
    }

    heading('01', '隐藏人格图谱');
    paragraph('梦境鉴定 · 五型浓度', 20, 32, colors.orange, '600');
    y += 12;
    var graphTop = y;
    var graphCard = rectangle(margin, graphTop, innerWidth, 0, '#ffffff', 24);
    commands.push({ kind: 'radar', x: width / 2, y: graphTop + 190, radius: 132, dimensions: profile.dimensions });
    var scoreCardWidth = (innerWidth - 56) / 5;
    var scoreCardTop = graphTop + 372;
    var scoreCardHeight = 0;
    var scoreCards = [];
    profile.dimensions.forEach(function (item, index) {
      var cardLeft = margin + 14 + index * (scoreCardWidth + 4);
      var card = rectangle(cardLeft, scoreCardTop, scoreCardWidth, 0, '#f1edff', 14);
      scoreCards.push(card);
      var cardY = scoreCardTop + 13;
      cardY += text(item.short, cardLeft + 8, cardY, scoreCardWidth - 16, 17, 25, colors.ink, '600');
      cardY += 11;
      rectangle(cardLeft + 8, cardY, scoreCardWidth - 16, 7, '#ddd5f8', 3.5);
      if (item.score > 0) {
        rectangle(cardLeft + 8, cardY, (scoreCardWidth - 16) * item.score / 100, 7, colors.orange, 3.5);
      }
      cardY += 16;
      cardY += text(String(item.score) + '%', cardLeft + 8, cardY, scoreCardWidth - 16, 19, 27, colors.orange, '600');
      scoreCardHeight = Math.max(scoreCardHeight, cardY - scoreCardTop + 13);
    });
    scoreCards.forEach(function (card) {
      card.height = scoreCardHeight;
    });
    y = scoreCardTop + scoreCardHeight + 20;
    graphCard.height = y - graphTop;
    y += 16;
    if (profile.dimensions.every(function (item) { return item.score === 0; })) {
      paragraph('本轮五型浓度均为 0 的情况不会出现，若见到请联系客栈掌柜。', 19, 31, colors.muted);
      y += 10;
    }
    paragraph('五轴均为 0—100 的浓度值（命中票数×10%），连线直接使用本轮真实数据。', 19, 31, colors.muted);
    y += 12;
    paragraph(profile.summary, 22, 35, colors.ink);
    y += 12;

    heading('02', '你的隐藏人格');
    paragraph('这是本轮梦境的趣味画像，并非现实人格判定。', 19, 31, colors.muted);
    y += 12;
    paragraph(type.name, 44, 64, colors.ink, '600', serif);
    paragraph(type.en, 18, 30, colors.orange, '600');
    y += 6;
    paragraph(type.tagline, 25, 39, colors.orange, '600');
    y += 12;
    paragraph(type.description, 22, 36, colors.ink);
    y += 12;
    paragraph(type.scene, 20, 33, colors.ink);
    y += 12;
    paragraph('画像依据 · ' + type.reason, 20, 33, colors.ink);
    y += 12;
    paragraph('镜像人格 · ' + type.shadow, 20, 33, colors.ink);
    y += 12;
    paragraph('趣味标签 · ' + type.tags.join(' · '), 20, 33, colors.orange);
    y += 12;
    paragraph('给你的提示 · ' + type.tip, 21, 34, colors.ink);
    y += 16;

    heading('03', '五型浓度解读');
    profile.dimensions.forEach(function (dimension) {
      var top = y;
      var card = rectangle(margin, top, innerWidth, 0, colors.green, 16);
      var left = margin + 20;
      var contentWidth = innerWidth - 40;
      y += 16;
      y += text(dimension.label + ' · ' + dimension.level, left, y, contentWidth, 24, 34, colors.ink, '600');
      y += text('命中 ' + dimension.count + ' / ' + dimension.total + ' 题 · 浓度 ' + dimension.score + '%', left, y, contentWidth, 20, 30, colors.orange, '600');
      y += 12;
      y += text(dimension.description, left, y, contentWidth, 20, 31, colors.ink);
      dimension.evidence.forEach(function (evidence) {
        y += text('回答依据 · ' + evidence.title + '：' + evidence.answer, left, y, contentWidth, 18, 28, colors.muted);
      });
      y += 16;
      card.height = y - top;
      y += 12;
    });

    y += 18;
    rectangle(margin, y, innerWidth, 1, colors.green);
    y += 27;
    paragraph('免责声明', 21, 34, colors.ink, '600');
    y += 8;
    paragraph('本测试为娱乐向内容，隐藏人格为趣味设定，仅反映本轮随机梦境题目的选择，不代表固定人格或心理状态，不构成心理诊断。', 19, 33, colors.muted);
    y += 48;

    var height = Math.ceil(y);
    scale = Math.min(scale, 16000 / Math.max(width, height), Math.sqrt(16000000 / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    ctx.scale(canvas.width / width, canvas.height / height);
    ctx.fillStyle = colors.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = 'top';
    commands.forEach(function (command) {
      ctx.fillStyle = command.color;
      if (command.kind === 'text') {
        ctx.font = command.font;
        ctx.fillText(command.value, command.x, command.y);
      } else if (command.kind === 'radar') {
        ctx.save();
        ctx.translate(command.x, command.y);
        var vertices = command.dimensions.map(function (item, index) {
          var angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
          return { x: Math.cos(angle), y: Math.sin(angle), score: item.score, label: item.short };
        });
        ctx.strokeStyle = '#c9bdf0';
        ctx.lineWidth = 1.25;
        for (var layer = 1; layer <= 5; layer += 1) {
          ctx.beginPath();
          vertices.forEach(function (vertex, index) {
            var x = vertex.x * command.radius * layer / 5;
            var top = vertex.y * command.radius * layer / 5;
            if (index === 0) ctx.moveTo(x, top);
            else ctx.lineTo(x, top);
          });
          ctx.closePath();
          ctx.stroke();
        }
        vertices.forEach(function (vertex) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(vertex.x * command.radius, vertex.y * command.radius);
          ctx.stroke();
        });
        ctx.font = '400 13px ' + sans;
        ctx.fillStyle = colors.muted;
        ctx.textAlign = 'left';
        for (var tick = 0; tick <= 5; tick += 1) {
          ctx.fillText(String(tick * 20), 8, -command.radius * tick / 5 + 2);
        }
        var points = vertices.map(function (vertex) {
          var distance = command.radius * vertex.score / 100;
          return { x: vertex.x * distance, y: vertex.y * distance };
        });
        ctx.beginPath();
        points.forEach(function (point, index) {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(141, 122, 240, 0.24)';
        ctx.fill();
        ctx.strokeStyle = colors.orange;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.stroke();
        points.forEach(function (point) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = colors.orange;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.font = '600 19px ' + sans;
        ctx.fillStyle = colors.ink;
        vertices.forEach(function (vertex, index) {
          var labelX = vertex.x * (command.radius + 24);
          var labelY = vertex.y * (command.radius + 24);
          ctx.textAlign = index === 1 ? 'left' : index === 4 ? 'right' : 'center';
          if (index === 0) labelY -= 24;
          else if (index === 1 || index === 4) labelY -= 10;
          else labelY += 8;
          ctx.fillText(vertex.label, labelX, labelY);
        });
        ctx.restore();
      } else {
        roundedRect(ctx, command.x, command.y, command.width, command.height, command.radius);
      }
    });

    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('海报生成失败，请稍后重试'));
        }
      }, 'image/png');
    });
  }

  window.DreamPoster = { create: create };
}());
