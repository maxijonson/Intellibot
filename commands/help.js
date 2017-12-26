exports.run = (client, message, args, serverConf) => {
  function getHelp(file) {
    var compiled = client.compile(file);
    var content = client.resolveToString(compiled, {
      prefix: serverConf.prefix,
      author: message.author.username,
      memeLimit: client.conf.memeLimit
    }); // NOTE: this is where all the template literals (${var}) variables are stored. So here, everything in the txt that is ${prefix} will be replaced to serverConf.prefix
    var splits = content.match(/.{1,102}/g);
    var embed = new client.Discord.RichEmbed().setColor([255, 255, 255]);
    var arr = content.split('\n*');
    var length = 0;
    arr.forEach((section) => {
      length += section.length;
      if (length >= 1000) {
        length = 0;
        message.channel.send({
          embed,
          split: true
        });
        embed = new client.Discord.RichEmbed().setColor([255, 255, 255]);
      }

      if (section.length < 1000) {
        var name = section.trim().split('\n')[0].replace(/\*/g, '');
        var value = section.trim().substring(name.length + 6).trim();
        embed.addField(name, value, true);
      } else { // We know for sure from here it can't all fit in one embed
        var lines = section.trim().split('\n');
        var name = lines.shift().replace(/\*/g, '');
        var len = name.length;
        var s = "";
        var first = true;

        lines.forEach((line) => {
          len += line.length;
          if (len >= 1000) {
            len = 0;
            if (first)
              embed.addField(name, s);
            else
              embed.setDescription(s);
            message.channel.send({
              embed,
              split: true
            })
            embed = new client.Discord.RichEmbed().setColor([255, 255, 255]);
            s = "";
          }

          s += line + '\n';
        });
        embed.setDescription(s);
      }
    });
    message.channel.send({
      embed,
      split: true
    });
  }
  switch (args.length) {
    case 0:
      var HelpFile = ``;

      HelpFile = client.fs.readFileSync(`./Help/help.txt`, "utf-8");
      getHelp(HelpFile);
      break;

    case 1:
      var HelpFile = ``;
      try {
        HelpFile = client.fs.readFileSync(`./Help/${args[0]}.txt`, "utf-8");
        getHelp(HelpFile);
      } catch (err) {
        console.log(err);
        message.channel.send(`${args[0]} is not one of my commands...`);
      }


      break;
  }
}
