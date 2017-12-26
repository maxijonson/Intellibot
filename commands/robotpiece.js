/* NOTE: This is a remake of the original robotpiece command.
A copy of this original command is in the BACKUP folder.
The reason for a remake is because the first one used the old memory structure, back when I didn't know about the fact that objects could be accessed with keys. So the first one was an array of objects and everytime I wanted to access a collector, I had to itterate through all of them EVERYTIME. This provides a direct access and simple data strucutre.
In this, the whole notion of an array of robotpieces has been abolished. So no more of keeping the index of a collector or using a bunch of .some methods and more of .hasOwnProperty method!
*/
exports.run = (client, message, args, serverConf) => {
  switch (args.length) {
    case 0:
      var tempArr = [];
      var author;
      var leaderboard = ``;
      var embed = new client.Discord.RichEmbed()
        .setTitle(`Robotpiece Leaderboard`)
        .setDescription(`The robotpiece leaderboard is relative to all users that have a robotpiece profile!\nCurrent season: **${client.conf.season}**`)
        .setColor([255, 255, 255]);
      for (var [id, collector] of client.robotpieces) {
        tempArr.push({
          id: id,
          total: collector.robots * 10 + collector.pieces
        })
      }
      tempArr.sort(function(a, b) {
        return a.total < b.total;
      });
      for (var i = 0; i < tempArr.length; ++i) {
        if (i + 1 <= 10)
          leaderboard += `#${i + 1} ${client.users.get(tempArr[i].id) ? client.users.get(tempArr[i].id).username : tempArr[i].id} ${client.users.get(tempArr[i].id) ? "(" : ""}${client.users.get(tempArr[i].id) ? (client.users.get(tempArr[i].id).discriminator) : ""}${client.users.get(tempArr[i].id) ? ")" : ""} - R: ${client.robotpieces.get(tempArr[i].id).robots} P: ${client.robotpieces.get(tempArr[i].id).pieces}\n`;
        if (tempArr[i].id == message.author.id)
          author = i;
      }
      embed.addField(`Robotpiece Top 10 Collectors (${client.robotpieces.size})`, leaderboard);
      if (client.robotpieces.has(message.author.id))
        embed.addField('Your Rank', `#${author + 1} ${client.users.get(tempArr[author].id).username} (${client.users.get(tempArr[author].id).discriminator}) - R: ${client.robotpieces.get(tempArr[author].id).robots} P: ${client.robotpieces.get(tempArr[author].id).pieces}`);
      message.channel.send(embed);
      break;
    case 1:
      if (args[0] == "delete") {
        if (client.robotpieces.has(message.author.id)) {
          client.robotpieces.delete(message.author.id);
          if (client.fs.existsSync(`RPCards/${message.author.id}.jpg`)) {
            client.fs.unlink(`RPCards/${message.author.id}.jpg`, (error) => {
              if (error) throw error;
            });
          }
          return message.channel.send(`Your robotpiece profile was deleted!`);
        } else {
          return message.channel.send(`You don't even have a robotpiece profile!`);
        }
      }

      // Check if the user exists in the channel first
      var UserID = args[0]; // In case an actual ID is used
      var CurrentDate = new Date();

      function isLaterThan(user, current) { // This should be used on the user's date (user.next.isLaterThan(Time);)
        var later = true;
        switch (false) {
          case (user.year == current.year):
            later = user.year <= current.year;
            break;

          case (user.month == current.month):
            later = user.month <= current.month;
            break;

          case (user.day == current.day):
            later = user.day <= current.day;
            break;

          case (user.hour == current.hour):
            later = user.hour <= current.hour;
            break;

          case (user.minute == current.minute):
            later = user.minute <= current.minute;
            break;

          case (user.second == current.second):
            later = user.second <= current.second;
            break;

          case (!(user == null)):
            later = false;
            break;

          default:
            later = true;
        }
        return later;
      }

      function setLimit(next) { // Adding 5 mins
        var c = new Date();
        var inFive = new Date(c.getTime() + (5 * 60 * 1000));

        next.day = inFive.getDate();
        next.month = inFive.getMonth();
        next.year = inFive.getFullYear();
        next.hour = inFive.getHours();
        next.minute = inFive.getMinutes();
        next.second = inFive.getSeconds();

        return next;
      }

      function TimeDistance(user, current) { // Only for minutes and seconds
        var Distance = {};
        var UserSecs = 3600 * user.hour + 60 * user.minute + user.second;
        var CurrentSecs = 3600 * current.hour + 60 * current.minute + current.second;
        var DisctanceSecs = UserSecs - CurrentSecs;
        Distance.minute = Math.floor(DisctanceSecs / 60);
        Distance.second = DisctanceSecs % 60;

        return Distance;
      }

      var Time = {
        day: CurrentDate.getDate(),
        month: CurrentDate.getMonth(),
        year: CurrentDate.getFullYear(),
        hour: CurrentDate.getHours(),
        minute: CurrentDate.getMinutes(),
        second: CurrentDate.getSeconds()
      };
      // Big if statement to basically check if the user exists
      if (
        client.users.some(function(user, i) {
          if (message.isMentioned(user.id)) {
            UserID = user.id;
          }
          if (UserID == user.id) {

            return true;
          }
        })
      ) {

        // Check that the collector is not already there
        var AlreadyCollector = false;
        if (client.robotpieces.has(UserID))
          AlreadyCollector = true;

        if (UserID != client.user.id) {
          if (UserID != message.author.id) { // User can't give himself a robot piece!
            if (message.author.id != client.user.id) { // Bot ignore this part (note the use of the actual client and not the bool .bot.. This asian mind thought of vicious people who would want to use another bot to give pieces!)
              if (!client.robotpieces.has(message.author.id)) {
                message.channel.send(`${message.author}, I see you gave a robot piece without having a single one yourself! This action really touches me.. Gives me faith in humanity you know? Anyways, to reward this act of kindness.. Here, take my arm... :)`);
                return message.channel.send(`${serverConf.prefix}robotpiece ${client.users.get(message.author.id)}`);
              }
            } else {
              var NewCollector = {
                "pieces": 1,
                "robots": 0,
                "background": "defaultBG.jpg",
                "color": "blue",
                "next": Time
              }
              client.robotpieces.set(UserID, NewCollector);
              return message.channel.send(`Woohoo! ${client.users.get(UserID)} got his first Robot Piece! Get 10 pieces to make a robot!`);
            }
            if (isLaterThan(client.robotpieces.get(message.author.id).next, Time)) {
              if (!AlreadyCollector) { // We create the collector (target)
                var NewCollector = {
                  "pieces": 1,
                  "robots": 0,
                  "background": "defaultBG.jpg",
                  "color": "blue",
                  "next": Time
                }
                client.robotpieces.set(UserID, NewCollector);
                message.channel.send(`Woohoo! ${client.users.get(UserID)} got his first Robot Piece! Get 10 pieces to make a robot!`);
              } else {
                var userRp = client.robotpieces.get(UserID);
                if (userRp.pieces == 9) { // make a robot
                  userRp.pieces = 0;
                  userRp.robots += 1;
                  client.robotpieces.set(message.author.id, userRp);
                  message.channel.send(`${client.users.get(UserID)} got his final piece to make a robot! He now has ${userRp.robots} robots! Niceee!`);
                } else {
                  userRp.pieces += 1;
                  client.robotpieces.set(message.author.id, userRp);
                  message.channel.send(`${client.users.get(UserID)} got a robot piece from ${message.author}! He now has ${userRp.robots} robots and ${userRp.pieces} pieces!`);
                }
                serverConf.rpGenerated++;
                client.settings.set(message.guild.id, serverConf);
              }
              if (message.author.id != client.user.id && client.robotpieces.has(UserID)) {
                var c = new Date();
                var inFive = new Date(c.getTime() + (5 * 60 * 1000));
                var authorRp = client.robotpieces.get(message.author.id);

                authorRp.next.day = inFive.getDate();
                authorRp.next.month = inFive.getMonth();
                authorRp.next.year = inFive.getFullYear();
                authorRp.next.hour = inFive.getHours();
                authorRp.next.minute = inFive.getMinutes();
                authorRp.next.second = inFive.getSeconds();
                client.robotpieces.set(message.author.id, authorRp);
              }
            } else {
              var Distance = TimeDistance(client.robotpieces.get(message.author.id).next, Time);
              message.channel.send(`Sorry you can't send robot pieces for another \`${Distance.minute}m${Distance.second}s\``);
            }
          } else { // The other mentionned himself
            if (!client.robotpieces.has(UserID)) { // means he doesn't own any robot pieces... poor him, let's help with that!
              message.channel.send(`Awww.. Looks like you don't have any robot pieces! Let me help with that! *spits out a big screw*`);
              message.channel.send(`${serverConf.prefix}robotpiece ${client.users.get(UserID)}`);
            } else {
              message.channel.send(`You have ${client.robotpieces.get(UserID).robots} robots and ${client.robotpieces.get(UserID).pieces} pieces!`);
            }
          }
        } else {
          message.channel.send(`Ewww! What do you think you're doing?! Giving me a robotpiece is like offering a human arm to someone else! Are you out of your mind! I'm not taking that...`);
        }
      } else {
        message.channel.send(`The user ${args[0]} is not one of my users! Make sure the user is in a server I'm also in.`);
      }
      break;
    default:
      Info();
  }

  function Info() {
    message.channel.send(`Wrong syntax. Use ${serverConf.prefix}help robotpiece for info on the command`);
  }
}
