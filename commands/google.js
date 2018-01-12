exports.run = (client, message, args, serverConf) => {
  message.reply(`Searching...`).then((m) => {

    var query = args.join(" ");
    var searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    return client.snekfetch.get(searchUrl)
      .query({
        q: encodeURIComponent(query),
        safe: message.channel.nsfw ? 'off' : 'on',
        lr: 'lang_en',
        hl: 'en'
      })
      .set({
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) Gecko/20100101 Firefox/53.0' // This should trick Google into thinking we're human
      })
      .then((r) => {

        if(r.status != 200)
          return message.channel.send(`A server side error occured (not my fault!). Google could have detected I'm a bot...`);

        let $ = client.cheerio.load(r.text);
        let res = $('.r');
        var nsfw = [
          "porn",
          "pornographic",
          "sex",
          "nude",
          "naked"
        ]
        if (res.length == 0)
          return m.edit(`No results found!`);

        var embed = new client.Discord.RichEmbed().setColor('GOLD').setTitle(`Google Search`).setDescription(query).setURL(searchUrl);

        for (var i = 0; i < res.length && i < 5; ++i) {
          let data = res.eq(i).find('a').first().attr('href');
          data = client.querystring.parse(data.replace('/url?', ''));
          let title = res.eq(i).find('a').first().text();
          let desc = $('.st').eq(i).text();
          if (!message.channel.nsfw)
            if (nsfw.some(n => desc.split(" ").includes(n) || title.split(" ").includes(n)))
              return m.edit("I've detected that your search results has some innapropriate content for this channel, so I will abort the search. If you wish to do the search, please do it in a NSFW channel.");

          embed.addField(`\u200C`, `**[${title}](${data.q})**\n${desc}`);
        }

        m.edit({
          embed
        });
        serverConf.googleCount++;
        client.settings.set(message.guild.id, serverConf);
      }).catch((err) => {
        console.log(err);
        m.edit(`No results found!`);
      })
  }).catch((err) => {
    client.logger.error(err.stack == undefined ? err : err.stack);
    return message.channel.send(`Something went wrong while searching...`);
  });
}
