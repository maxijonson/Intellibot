try {
  if (process.argv.length < 4)
    process.exit(3);

  var params = require(`${process.argv[2]}`);
  var message = params.message;
  var serverConf = params.serverConf;
  var argsStr = process.argv[3];

  var jimp = require('jimp');
  var Discord = require('discord.js');
  var fs = require('fs');

  var meme = argsStr.indexOf(';') != -1 ? argsStr.substring(0, argsStr.indexOf(';')).trim() : argsStr;
  argsStr = argsStr.slice(meme.length).trim().slice(1).trim();
  var top = argsStr.substring(0, argsStr.indexOf(';'));
  argsStr = argsStr.slice(top.length).trim().slice(1).trim();
  var bottom = argsStr;
  if (meme == "")
    return process.send(`Y U NO PROVIDE MEME NAME!`, () => {
      process.exit(2)
    });
  if (!(meme in serverConf.memes))
    return process.send(`Y U NO PROVIDE EXISTING MEME NAME!`, () => {
      process.exit(2)
    });
  if (top.length >= 100 || bottom.length >= 100)
    return process.send(`Wow there, are you writing your SATs or a meme?! Keep it short!`, () => {
      process.exit(2)
    });

  var path = `memes/${message.guild.id}/${serverConf.memes[meme]}`;

  function measureText(font, text) {
    var x = 0;
    for (var i = 0; i < text.length; i++) {
      if (font.chars[text[i]]) {
        x += font.chars[text[i]].xoffset +
          (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0) +
          (font.chars[text[i]].xadvance || 0);
      }
    }
    return x;
  };

  process.send(`Generating your dank meme...`, function() {
    jimp.read(path).then((bg) => {
      jimp.loadFont("Fonts/impact.fnt").then((font) => {
        const w = bg.bitmap.width;
        const h = bg.bitmap.height;

        var topStrs = top.split('\n');
        var botStrs = bottom.split('\n');
        if (topStrs.length > 3 || botStrs.length > 3)
          return process.send(`Sorry, but there's a maximum of 3 line feeds per region. You have ${topStrs.length} for top text and ${botStrs.length} for bottom text.`);

        var t = new jimp(Math.max(0, ...topStrs.map(s => measureText(font, s))) + 15, Math.ceil(h / 2));
        var b = new jimp(Math.max(0, ...botStrs.map(s => measureText(font, s))) + 15, h + 10);

        for (var i = 0; i < topStrs.length; ++i)
          t.print(font, (t.bitmap.width / 2 - measureText(font, topStrs[i]) / 2), i * 35, topStrs[i]);
        for (var i = 0; i < botStrs.length; ++i)
          b.print(font, (b.bitmap.width / 2 - measureText(font, botStrs[i]) / 2), h - botStrs.length * 40 + i * 38 - 5, botStrs[i]);
        if (t.bitmap.width > 0)
          t.contain(90 / 100 * w, h, jimp.HORIZONTAL_ALIGN_CENTER);
        if (b.bitmap.width > 0)
          b.contain(90 / 100 * w, h * 2, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_BOTTOM);
        bg.composite(t, 5 / 100 * w, 0);
        bg.composite(b, 5 / 100 * w, -h);
        bg.write(`tmp/${message.author.id}.png`, function() {
          let file = new Discord.Attachment(`tmp/${message.author.id}.png`);
          if (file)
            process.send(file);
          else
            return process.send(`An error occured and I was unable to send you the file...`, () => {
              process.exit(4)
            });
        });

      }).catch((err) => {
        process.exit(1);
      });
    }).catch((err) => {
      process.exit(1);
    });
  });
} catch (err) {
  process.exit(1);
}
