exports.run = (client, message, args, serverConf) => {
  function pickCategory(nofilter) {
    var result;
    var count = 0;

    do {
      for (var prop in client.Other.jokes)
        if (Math.random() < 1 / ++count)
          result = prop;
    } while (["dirty", "dark", "pickuplines"].includes(result) && !nofilter);

    return result;
  }

  function sendJoke(category) {
    var name = category.name;
    var index = Math.floor(Math.random() * category.jokes.length)
    var joke = category.jokes[index];
    var embed = new client.Discord.RichEmbed().setColor(category.color).setTitle(`${name} (#${index + 1})`).setDescription(joke);
    message.channel.send({
      embed
    });
  }

  switch (args.length) {
    case 0:
      var obj = pickCategory(false);
      var category = client.Other.jokes[obj];
      sendJoke(category);
      break;

    case 1:
      if (args[0] == "categories") {
        var embed = new client.Discord.RichEmbed().setColor([255, 255, 255]).setTitle(`Joke Categories`);
        var desc = "";
        for (var prop in client.Other.jokes)
          desc += `${prop} - ${client.Other.jokes[prop].jokes.length} ${client.Other.jokes[prop].jokes.length == 1 ? "joke" : "jokes"}\n`;
        embed.setDescription(desc);
        message.channel.send({
          embed
        });
      } else if (args[0] == "nofilter") {
        var obj = pickCategory(true);
        var category = client.Other.jokes[obj];
        sendJoke(category);
      } else if (args[0] in client.Other.jokes) {
        var category = client.Other.jokes[args[0]];
        sendJoke(category);
      } else {
        return message.channel.send(`${args[0]} is not one of my jokes category`);
      }
      break;
  }
}
