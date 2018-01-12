exports.run = (client, message, args, serverConf) => {
  function pickCategory() {
    var category;
    var count = 0;

    for (var prop in client.Other.questions)
      if (Math.random() < 1 / ++count)
        category = prop;

    return category;
  }

  if (!client.robotpieces.has(message.author.id))
    return message.channel.send(`You do not own any robotpieces! See ${serverConf.prefix}help robotpiece to see how to get started!`);
  var category;
  var modifier = 0;

  if (args.length == 0) {
    category = pickCategory();
    modifier = 2;
  } else if (args.length == 1) {
    if (args[0] == "categories") {
      var embed = new client.Discord.RichEmbed().setColor([255, 255, 255]).setTitle(`Question Categories`);
      var desc = "";
      for (var prop in client.Other.questions)
        desc += `${prop} - ${client.Other.questions[prop].questions.length} ${client.Other.questions[prop].questions.length == 1 ? "question" : "questions"}\n`;
      embed.setDescription(desc);
      return message.channel.send({
        embed
      });
    } else if (args[0] == "spoilerfree") {
      do {
        category = pickCategory();
      } while (category == "tv" || category == "tvquotes");
    } else if (args[0] in client.Other.questions) {
      category = args[0];
    } else {
      return message.channel.send(`${args[0]} is not a question category`);
    }
  } else {
    return message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help question for info on the command.`);
  }

  var questionObj = client.Other.questions[category].questions[Math.floor(Math.random() * client.Other.questions[category].questions.length)];

  if (!questionObj.Reference)
    questionObj.Reference = "No Reference";
  if (!questionObj.question || !questionObj.answer || !questionObj.pieces)
    return message.channel.send(`Well that's odd... I couldn't fetch either the question, answer or robotpieces reward... Try relaunching the command. This error should not persist. It has happened for unknown reasons at random times during development, but couldn't be replicated enough times to debug it.`);

  var Valid = false;
  var Restart = false;

  var embed = new client.Discord.RichEmbed({
    "author": {
      "name": `- ${message.author.username} -`
    },
    "fields": [{
        "name": client.Other.questions[category].name, // Category
        "value": questionObj.Reference // Reference
      },
      {
        "name": "Question",
        "value": questionObj.question.replace('_', '\_')
      },
      {
        "name": "Robotpiece Reward",
        "value": questionObj.pieces
      }
    ]
  }).setColor(client.Other.questions[category].color);

  message.channel.send({
    embed
  }).then((m) => {
    var command = `${serverConf.prefix}question`;
    const collector = new client.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
      time: 15000
    });

    collector.on("collect", message => {
      if (message.content == command) {
        Restart = true;
      } else {
        Valid = true;
      }
      message.delete();
      collector.stop();
    });

    collector.on("end", collected => {
      if (Restart)
        return m.delete();

      if (!Valid)
        return m.edit(`${message.author}`, {embed:
          new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:alarm_clock: Time expired!`)
        });

      var answers = questionObj.answer;
      var response = collected.first().content.toLowerCase();
      var rp = client.robotpieces.get(message.author.id);
      if (answers.includes(response)) {
        for (var i = 0; i < questionObj.pieces + modifier; ++i) {
          if (rp.pieces == 9) { // make a robot
            rp.pieces = 0;
            rp.robots += 1;
          } else {
            rp.pieces += 1;
          }
        }
        serverConf.rpGenerated += questionObj.pieces + modifier;
        client.settings.set(message.guild.id, serverConf);
        client.robotpieces.set(message.author.id, rp);

        return m.edit(`${message.author}`, {embed:
          new client.Discord.RichEmbed()
          .setColor([0, 255, 0])
          .setDescription(`:white_check_mark: Correct!`)
          .addField('Robotpiece reward', `${questionObj.pieces} robotpieces${modifier == 0 ? "" : " (Random category bonus: +2 robotpieces)"}`)
        });
      } else {
        return m.edit(`${message.author}`, {embed:
          new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:x: Wrong answer!`)
        });
      }
    });
  });
}
