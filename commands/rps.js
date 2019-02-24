exports.run = (client, message, args, serverConf) => {
  if (args.length != 0)
    return;
  var Valid = false;
  var Restart = false;
  var command = `${serverConf.prefix}rps`;
  const collector = new client.Discord.MessageCollector(message.channel, m => (m.author.id === message.author.id && ["rock", "paper", "scissors", command].includes(m.content.toLowerCase())), {
    time: 10000
  });
  message.reply({
    embed: new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setDescription(`***Rock***, ***Paper*** or ***Scissors***?`)
      .setTitle('Rock, Paper or Scissors')
  });

  collector.on("collect", message => {
    if (message.content == command) {
      Restart = true;
    } else {
      Valid = true;
    }
    collector.stop();
  });

  collector.on("end", collected => {
    if (Restart)
      return;

    if (!Valid)
      return message.reply(`Time expired. You lose!`);

    var answers = ["rock", "paper", "scissors"];
    var choice = collected.first().content.toLowerCase();
    var bot = answers[Math.floor(Math.random() * answers.length)];

    var Message = `I chose ***${bot}***! `;

    if (choice == bot) {
      Message += `It's a tie!`;
    } else {
      switch (bot) {
        case "rock":
          if (choice == "scissors") {
            Message += "You lose!";
          } else {
            Message += "You win!";
          }
          break;

        case "paper":
          if (choice == "rock") {
            Message += "You lose!";
          } else {
            Message += "You win!";
          }
          break;

        case "scissors":
          if (choice == "paper") {
            Message += "You lose!";
          } else {
            Message += "You win!";
          }
          break;
      }
    }
    message.reply(Message);
  });
}