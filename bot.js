/*
bot.js
Intellibot created by MaxiJonson
Invite: https://discordapp.com/oauth2/authorize?&client_id=356619840649428993&scope=bot&permissions=0
Discord.io documentation: https://izy521.gitbooks.io/discord-io/content/Client.html
Some Tutorials: https://anidiotsguide.gitbooks.io/discord-js-bot-guide/getting-started/config-json-file.html

NOTE: The less you have here and more in handlers, the less likely you'll have to restart the bot. Everything here cannot be reloaded with the reload command
*/
// Requires
"use strict";
try {
  var Discord = require('discord.js'); // https://discord.js.org/#/docs/main/stable/general/welcome
  var auth = require('./auth.json');
  var fs = require('fs');
  var colors = require('colors'); // https://www.npmjs.com/package/colors
  var noinfo = require('./noinfo.json');



  var winston = require('winston');
  var customLevels = {
    levels: {
      crash: 0,
      error: 1,
      warn: 2,
      evt: 3,
      bot: 4,
      out: 5,
      sys: 6,
      info: 7
    },
    colors: {
      out: 'green',
      evt: 'blue',
      warn: 'yellow',
      error: 'red',
      info: 'white',
      sys: 'cyan',
      bot: 'magenta',
      crash: 'red'
    }
  };
  require('winston-daily-rotate-file');
  winston.addColors(customLevels.colors);
  winston.setLevels(customLevels.levels);

  var logTransport = new winston.transports.DailyRotateFile({
    name: 'all',
    filename: './Logs/log',
    prepend: true,
    createTree: true,
    datePattern: 'yyyy/MM/dd.',
    json: false,
    exitOnError: false,
    localTime: true,
    timestamp: function() {
      var m = new Date();
      var dateString =
        m.getFullYear() + "/" +
        ("0" + (m.getMonth() + 1)).slice(-2) + "/" +
        ("0" + m.getDate()).slice(-2) + " " +
        ("0" + m.getHours()).slice(-2) + ":" +
        ("0" + m.getMinutes()).slice(-2) + ":" +
        ("0" + m.getSeconds()).slice(-2);
      return dateString;
    },
    formatter: function(options) {
      return `${options.timestamp()} - ${options.message}`;
    }
  });

  var errorTransport = new winston.transports.DailyRotateFile({
    name: 'errors',
    filename: './Errors/log',
    prepend: true,
    createTree: true,
    datePattern: 'yyyy/MM/dd/HH.',
    json: false,
    exitOnError: false,
    localTime: true,
    level: 'error',
    timestamp: function() {
      var m = new Date();
      var dateString =
        m.getFullYear() + "/" +
        ("0" + (m.getMonth() + 1)).slice(-2) + "/" +
        ("0" + m.getDate()).slice(-2) + " " +
        ("0" + m.getHours()).slice(-2) + ":" +
        ("0" + m.getMinutes()).slice(-2) + ":" +
        ("0" + m.getSeconds()).slice(-2);
      return dateString;
    },
    formatter: function(options) {
      return `${options.timestamp()} - ${options.message}\n\n\n\n`;
    }
  });

  var logger = new(winston.Logger)({
    levels: customLevels.levels,
    transports: [
      new winston.transports.Console({
        name: 'console',
        json: false,
        colorize: true,
        exitOnError: false,
        formatter: function(options) {
          return winston.config.colorize(options.level, options.message);
        }
      }),
      logTransport,
      errorTransport
    ]
  });
  logger.sys(`LOGGER INITIATED`);


  var conf;
  try {
    conf = require('./conf.json');
  } catch (err) {

    logger.error(`Error at ready. Attempting to remake conf.json, then rebooting... Error: ${err.stack == undefined ? err:err.stack}`);
    var newConf = `
  {
  	"botDebug": false,
  	"botGame": "www.maxijonson.com/intellibot",
  	"botStatus": "online",
  	"botAfk": false,
  	"botAvatar": "./profile.png",
  	"botUsername": "Intellibot",
    "botCrashed": true,
    "memeLimit": 50,
    "messageListener": false,
    "season": 1
  }`
    fs.writeFileSync('conf.json', newConf, (err) => {
      if (err) throw err;
    });

    throw err;
  }
  var Developpers = require('./developpers.json');
  var Other = require('./other.json');
  var compile = require('es6-template-strings/compile')
  var resolveToString = require('es6-template-strings/resolve-to-string');
  var simpleYoutubeApi = require('simple-youtube-api');
  var sya = new simpleYoutubeApi(auth.YoutubeAPI);
  var ytdl = require('ytdl-core');
  var ffmpeg = require('ffmpeg');
  var request = require('request');
  var google = require('googleapis');
  var cmds;
  try {
    cmds = require('./cmds.json');
  } catch (err) {
    logger.error(`Error at ready. Attempting to remake cmds.json, then rebooting... Error: ${err.stack == undefined ? err:err.stack}`);
    var newCmds = `
  {
  }`
    fs.writeFileSync('cmds.json', newCmds, (err) => {
      if (err) throw err;
    });

    throw err;
  }
  var defaultSettings = require('./defaultSettings.json');
  var jimp = require('jimp');
  var Enmap = require('enmap');
  var EnmapLevel = require('enmap-level');
  var bans = require('./bans.json');
  var cron = require('node-cron');
  var cheerio = require('cheerio');
  var snekfetch = require('snekfetch');
  var querystring = require('querystring');
  var childProcess = require('child_process');
  var path = require('path');
  var timediff = require('time-between-dates');
  var constants = require('./constants.json');
  var Requires = {
    Discord,
    auth,
    conf,
    fs,
    colors,
    Developpers,
    Other,
    compile,
    resolveToString,
    sya,
    ytdl,
    ffmpeg,
    request,
    google,
    cmds,
    defaultSettings,
    jimp,
    Enmap,
    EnmapLevel,
    noinfo,
    bans,
    logger,
    cron,
    cheerio,
    snekfetch,
    querystring,
    childProcess,
    path,
    timediff,
    constants
  }
  // Functions
  var isAdmin = require('./Functions/isAdmin.js');
  var InitClient = require('./Functions/InitClient.js');
  var addGuild = require('./Functions/addGuild.js');
  var download = require('./Functions/download.js');
  var isDev = require('./Functions/isDev.js');
  var isBanned = require('./Functions/isBanned.js');
  var Functions = {
    isAdmin,
    InitClient,
    addGuild,
    download,
    isDev,
    isBanned
  }

  ///////////////////////////////////////////////////////// Init Bot /////////////////////////////////////////////////////////
  var client = new Discord.Client();

  // Cooldown
  client.cooldown = new Set();

  // Databases
  client.settings = new Enmap({
    name: "settings",
    persistent: true,
    provider: new EnmapLevel({
      name: "settings"
    })
  });
  client.robotpieces = new Enmap({
    name: "robotpieces",
    persistent: true,
    provider: new EnmapLevel({
      name: "robotpieces"
    })
  });

  // Requires
  for (var req in Requires) {
    if (Requires.hasOwnProperty(req)) {
      client[req] = Requires[req];
    }
  }

  // Functions
  for (var func in Functions) {
    if (Functions.hasOwnProperty(func)) {
      client[func] = Functions[func];
    }
  }



  ////////////////////////////////////////// METHODS //////////////////////////////////////////

  // MakeDate
  // Makes a date that is actually readable instead of some weird characters
  // For string uses only, does not return a Date object
  client.makedate = function(d) {
    var m = d ? d : new Date();
    var dateString =
      m.getFullYear() + "/" +
      ("0" + (m.getMonth() + 1)).slice(-2) + "/" +
      ("0" + m.getDate()).slice(-2) + " " +
      ("0" + m.getHours()).slice(-2) + ":" +
      ("0" + m.getMinutes()).slice(-2) + ":" +
      ("0" + m.getSeconds()).slice(-2);
    return dateString;
  }

  // NoInfo
  // Used when Intellibot can't fetch a guild's settings in the settings database.
  // Also creates the guild in the database
  client.noinfo = function(channel, message) {
    if (!message)
      message = "none provided";
    var dateString = client.makedate();
    var log = {
      message: message,
      channel: channel.id,
      channelName: channel.name,
      guild: channel.guild.id,
      guildName: channel.guild.name,
      owner: channel.guild.ownerID,
      ownerUser: channel.guild.owner.user,
      time: dateString
    }

    noinfo.logs.push(log);
    fs.writeFile('noinfo.json', JSON.stringify(noinfo, null, '\t'), (error) => {
      if (error) throw error;
    });
    client.channels.get(client.constants.noinfo).send(`***Message:*** *${log.message}*\n***Channel:*** *${log.channelName}* (${log.channel})\n***Guild:*** *${log.guildName}* (${log.guild})\n***Owner:*** *${log.ownerUser}* (${log.owner})`);
    client.addGuild(channel.guild);
    return channel.send(`I was unable to get your server information in my database, which is extremely odd. This error has been logged to my creator. He will look into it. I recreated your guild in my database, but it now has the default settings. (prefix: $)`);
  }

  // collectMessages
  // collect messages for a given amount of time
  client.collectMessages = function(message, prompt, amount, time, authorOnly, collected, end) {
    message.channel.send(prompt).then((p) => {

      if (time < 1000)
        return message.channel.send(`Time must be at least 1 second`);

      if (authorOnly)
        message.channel.awaitMessages(r => (r.author.id == message.author.id && r.channel.id == message.channel.id), {
          time: time,
          max: amount,
          errors: ['time']
        }).then((c) => {
          collected(c)
        }).catch((err) => {
          end(err);
        });
      else
        message.channel.awaitMessages(r => (r.channel.id == message.channel.id), {
          time: time,
          max: amount,
          errors: ['time']
        }).then((c) => {
          collected(c)
        }).catch((err) => {
          end(err)
        });
    }).catch((err) => {
      client.logger.error(err);
    })
  }

  // AwaitAnswer
  // Wait for specific messages
  client.awaitAnswer = function(message, prompt, answers, amount, time, authorOnly, collected, end) {

    if (time < 1000)
      return message.channel.send(`Time must be at least 1 second`);

    message.channel.send(prompt).then((p) => {
      if (authorOnly)
        message.channel.awaitMessages(r => (r.author.id == message.author.id && answers.includes(r.content.toLowerCase())), {
          time: time,
          max: amount,
          errors: ['time']
        }).then((c) => {
          collected(c)
        }).catch((err) => {
          end(err);
        });
      else
        message.channel.awaitMessages(r => (answers.includes(r.content.toLowerCase())), {
          time: time,
          max: amount,
          errors: ['time']
        }).then((c) => {
          collected(c)
        }).catch((err) => {
          end(err)
        });

    }).catch((err) => {
      client.logger.error(err);
    });
  }

  // Trigger Robotpiece Season
  client.triggerSeason = function() {
    var tempArr = [];
    var leaderboard = ``;
    for (var [id, collector] of client.robotpieces) {
      tempArr.push({
        id: id,
        total: collector.robots * 10 + collector.pieces
      })
    }
    tempArr.sort(function(a, b) {
      return a.total < b.total;
    });
    for (var i = 0; i < tempArr.length && i < 10; ++i) {
      leaderboard += `${i % 2 == 0 ? "**" : ""}#${i + 1} ${client.users.get(tempArr[i].id) ? client.users.get(tempArr[i].id).username : tempArr[i].id} ${client.users.get(tempArr[i].id) ? "(" : ""}${client.users.get(tempArr[i].id) ? (client.users.get(tempArr[i].id).discriminator) : ""}${client.users.get(tempArr[i].id) ? ")" : ""} - R: ${client.robotpieces.get(tempArr[i].id).robots} P: ${client.robotpieces.get(tempArr[i].id).pieces}${i % 2 == 0 ? "**" : ""}\n`;
    }

    var embed = new client.Discord.RichEmbed()
    .setColor([255, 255, 255])
    .setTitle(`Robotpiece Season Results`)
    .setDescription(`Robotpiece season ${client.conf.season} is now over and all robots and pieces were set back to 0! Congratulations to all of you!`)
    .addField(`Top 10 Robotpiece Collectors (${client.robotpieces.size})`, leaderboard);

    client.robotpieces.forEach((value, key, map) => {
      var rank = 0;
      var keyRp = Object.assign({}, value);
      var copy = Object.assign({}, embed);
      var e = new client.Discord.RichEmbed(copy);
      tempArr.some((collector, i) => {
        if(collector.id == key) {
          rank = i + 1;
          return true;
        }
      });
      var rp = client.robotpieces.get(key);
      rp.robots = 0;
      rp.pieces = 0;
      client.robotpieces.set(key, rp);
      if (client.users.has(key)){
        e.fields = [];
        e.addField(`Top 10 Robotpiece Collectors (${client.robotpieces.size})`, leaderboard)
        .addField(`Your Rank`, `#${rank} ${client.users.get(key).username} (${client.users.get(key).discriminator}) - R: ${keyRp.robots} P: ${keyRp.pieces}`);
        console.log(`${key}\n${JSON.stringify(e, null, '\t')}`);
        client.users.get(key).send({embed: e});
      } else
        client.robotpieces.delete(key);
    });

    client.conf.season++;
    client.logger.evt(`Robotpiece season ${client.conf.season} started!`);
    client.fs.writeFile('conf.json', JSON.stringify(client.conf, null, '\t'), (error) => {
      if (error) throw error;
    })
  }

  ///////////////////////////////////////////////////////// /Init Bot /////////////////////////////////////////////////////////

  // Voiceconnections round
  client.setInterval(function() {
    client.voiceConnections.forEach((vc) => {
      if (vc.channel.members.array().length == 1)
        vc.disconnect();
    });
  }, 300000);

  // Initialize Command Handler
  // Ref: https://anidiotsguide.gitbooks.io/discord-js-bot-guide/coding-guides/a-basic-command-handler.html
  fs.readdir("./events/", (err, files) => {
    if (err) return logger.error(err);

    files.forEach(file => {
      let eventFunction = require(`./events/${file}`);
      let eventName = file.split(".")[0];
      client.on(eventName, (...args) => eventFunction.run(client, Functions, Requires, ...args));
      logger.sys(`Loaded ${file} event`);
    });
  });

  process.on('warning', (warning) => {
    logger.warn(`${warning.name} - ${warning.message}`);
  });

  process.on('uncaughtException', (err) => {
    logger.error(err.stack);
  });

  process.on('unhandledRejection', (reason, p) => {
    if (reason != "handled")
      logger.error(`Unhandled Rejection: ${JSON.stringify(p, null, '\t')}: ${reason}`);
  });

  client.login(auth.token);
} catch (err) {
  const crashLogFile = require('./crashLog.json');
  console.log(`Main file crash! \n${err.stack}`.red);
  var crashLog = {
    "crash": `${err}`,
    "date": new Date()
  };
  crashLogFile.crashLogs.push(crashLog);
  fs.writeFileSync('crashLog.json', JSON.stringify(crashLogFile, null, '\t'), (error) => {
    if (error) throw error;
  });
  process.exit();
}
