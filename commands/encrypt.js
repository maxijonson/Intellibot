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

  function Encrypt(Word) {
      var Result = "";

      for (var i = 0, Limiter = 15; i < Word.length; ++i, ++Limiter) {
          var Temp = "";
          var Character = Word.charCodeAt(i);
          var Remainder = 0;
          var Decrease = 1;
          var Expand = 0;

          while (Character != 0) {
              Remainder = Character % Base;
              Temp += Remainder.toString();
              Character /= Base;
              Character = parseInt(Character);
          }
          Temp = Invert(Temp);

          while (parseInt(Temp) > MaxRange) {
              var Math = parseInt(Temp) - 20;
              Temp = Math.toString();
              Decrease += 2;
          }
          while (parseInt(Temp) < MinRange) {
              var Math = parseInt(Temp) * 2;
              Temp = Math.toString();
              Expand += 2;
          }
          Result += String.fromCharCode(parseInt(Temp));

          if (Decrease != 1) {
              var Mod = MinRange + Decrease + Limiter;
              Result += String.fromCharCode(Mod);
          }
          else if (Expand != 0) {
              var Mod = MinRange + Expand + Limiter;
              Result += String.fromCharCode(Mod);
          }
          else {
              Result += String.fromCharCode(MaxRange - 1);
          }

          if (Limiter == 25) {
              Limiter = 15;
          }
      }
      return message.channel.send(Result).then((m) => {
        serverConf.lucipherCount++;
        client.settings.set(message.guild.id, serverConf);
      });
  }

  var s = args.join(" ");
  Encrypt(s);
}
