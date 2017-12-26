exports.run = (client, message, args, serverConf) => {
  const Base = 7;
  const MinRange = 48;
  const MaxRange = 122;
  const SuperRandomNum = 1337;

  function Invert(Word) {
      var Result = "";
      for (i = Word.length - 1; i >= 0; --i) {
          Result += Word.charAt(i);
      }
      return Result;
  }

  function Decrypt(Cipher) {
      var Result = "";
      var ErrorMsg = "";

      if (Cipher.length % 2 == 0) {
          for (var i = 0, Limiter = 15; i < Cipher.length; i += 2, ++Limiter) {
              var Pair = Cipher.substr(i, 2);
              var Mod = Pair.charCodeAt(1) - MinRange - Limiter;
              var CharValue = Pair.charCodeAt(0);
              var Temp = "";
              var DecValue = 0;

              if (Pair.charCodeAt(1) != MaxRange - 1) {
                  if (Mod % 2 == 0) {
                      while (Mod != 0) {
                          CharValue /= 2;
                          CharValue = parseInt(CharValue);
                          Mod -= 2;
                      }
                  }
                  else {
                      while (Mod != 1) {
                          CharValue += 20;
                          Mod -= 2;
                      }
                  }
              }

              Temp = Invert(CharValue.toString());

              for (var j = 0, BaseMultiplier = 1; j < Temp.length; ++j, BaseMultiplier *= Base) {
                  var Num = parseInt(Temp.substr(j, 1));
                  DecValue += BaseMultiplier * Num;
              }

              Result += String.fromCharCode(DecValue);

              if (Limiter == 25) {
                  Limiter = 15;
              }

          }
          return Result ? message.channel.send(Result).then((m) => {
            serverConf.lucipherCount++;
            client.settings.set(message.guild.id, serverConf);
          }) : message.channel.send(`Invalid cipher`);
      }
      else {
          return message.channel.send(`Invalid cipher`);
      }
  }

  var s = args.join(" ");
  Decrypt(s);
}
