try {
  var jimp = require('jimp');
  var Discord = require('discord.js');
  var fs = require('fs');
  var params = require(`${process.argv[2]}`);
  var message = params.message;
  var robotpieces = params.robotpieces;
  var usr = params.usr;

  var name = new jimp(840, 120);
  var discriminator = new jimp(420, 90);
  var robots = new jimp(200, 200);
  var pieces = new jimp(200, 200);
  var rank = new jimp(500, 500);
  jimp.read(usr.background).then((bg) => {
    jimp.read(`CardColors/${usr.color}.png`).then((bars) => {
      jimp.read("profileCard.png").then((card) => {
        jimp.read(`tmp/${message.author.id}avatar.png`).then((avatar) => {
          jimp.read("mask.png").then((mask) => {
            jimp.read(`TitleColors/${usr.color}.png`).then((title) => {


              jimp.loadFont("Fonts/eras.fnt").then(function(font) {
                name.print(font, 0, 0, message.author.username);
                name.resize(420, 60);
                discriminator.print(font, 0, 0, "#" + message.author.discriminator);
                discriminator.resize(140, 30);
                var xpos;
                if (usr.robots < 10)
                  xpos = 60;
                else if (usr.robots < 100)
                  xpos = 35;
                else
                  xpos = 10;
                robots.print(font, xpos, 0, String(usr.robots));
                robots.resize(500, 500);
                pieces.print(font, 60, 0, String(usr.pieces));
                pieces.resize(500, 500);
                var rankNum = 0;
                var tempArr = [];
                for(var id in robotpieces) {
                  tempArr.push({
                    id: id,
                    total: robotpieces[id].robots * 10 + robotpieces[id].pieces
                  })
                }
                tempArr.sort(function(a, b) {
                  return a.total < b.total;
                });
                tempArr.forEach((collector, i) => {
                  if (collector.id == message.author.id)
                    rankNum = i + 1;
                });
                if (rankNum < 10)
                  xpos = 50;
                else if (rankNum < 100)
                  xpos = 25;
                else
                  xpos = 0;

                rank.print(font, xpos, 0, String(rankNum));
                var rankX = 815;
                var rankY = 75;
                if (rankNum >= 1000 && rankNum < 10000) {
                  rank.resize(350, 350);
                  rankY = 90;
                } else if (rankNum >= 10000) {
                  rank.resize(275, 275);
                  rankY = 95;
                  rankX = 820;
                }

                mask.resize(160, 160);
                avatar.resize(160, 160)
                  .mask(mask, 0, 0);
                bg.cover(1011, 694)
                  .quality(100)
                  .composite(bars, 0, 0)
                  .composite(avatar, 26, 38)
                  .composite(card, 0, 0)
                  .composite(name, 200, 55)
                  .composite(discriminator, 200, 133)
                  .composite(title, 0, 0)
                  .composite(robots, 35, 375)
                  .composite(pieces, 540, 375)
                  .composite(rank, rankX, rankY)
                  .write(`tmp/${message.author.id}.jpg`);

                jimp.read(`tmp/${message.author.id}.jpg`).then((final) => {
                  let file = new Discord.Attachment(`tmp/${message.author.id}.jpg`);
                  if (file)
                    process.send(file);
                  else
                    return process.send(`An error occured and I was unable to send you the file...`, () => process.exit(4));
                }).catch((err) => {
                  wait(function() {
                    jimp.read(`tmp/${message.author.id}.jpg`).then((final) => {
                      let file = new Discord.Attachment(`tmp/${message.author.id}.jpg`);
                      if (file)
                        process.send(file);
                      else
                        return process.send(`An error occured and I was unable to send you the file...`, () => {
                          process.exit(4);
                        });
                    }).catch((err) => {
                      return process.send(`Sorry, there was an error delivering the image on time, this is most likely just because it took too long to build the image. Launching the command again is most likely to work!`, () => process.exit(1));
                    });

                  });
                });

              }).catch((err) => {
                return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
              });


            }).catch((err) => {
              return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
            });
          }).catch((err) => {
            return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
          });
        }).catch((err) => {
          return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
        });
      }).catch((err) => {
        return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
      });
    }).catch((err) => {
      return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
    });
  }).catch((err) => {
    return process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
  });
} catch (err) {
  process.send(`There was an unknown error making your RPCard...`, () => process.exit(1));
}
