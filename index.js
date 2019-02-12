const discord = require("discord.js");
const botConfig = require("./botconfig.json");

const fs = require("fs");

const active = new Map();

const bot = new discord.Client();
bot.commands = new discord.Collection();

fs.readdir("./Commands/" , (err, files) => {

    if(err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");

    if(jsFiles.length <=0) {
        console.log("Er zijn geen Files gevonden!");
        return;
    }

    jsFiles.forEach((f,i) => {

        var fileGet = require(`./commands/${f}`);
        console.log(`${f} is nu geladen`);

        bot.commands.set(fileGet.help.name, fileGet);

    })

});


bot.commands = new discord.Collection();

bot.on("ready", async () => {

    console.log(`${bot.user.username} is nu online!`)

    bot.user.setActivity("!help", {type: "PLAYING"})

});

bot.on("guildMemberAdd", member => {

    var role = member.guild.roles.find("name", "Speler");

    if(!role) return;

    member.addRole(role);

    const channel = member.guild.channels.find("name", "》algemeen");

    if(!channel) return;

    channel.send(`Welkom bij de server ${member}! Wil je de commands van onze bot weten doe dan !help`)

});

bot.on("message", async message => {

    // als bot bericht stuurt dan return
    if(message.author.bot) return;

    if(message.channel.type === "dm") return;

    var prefixes = JSON.parse(fs.readFileSync("./prefixes.json/"));

    if(!prefixes[message.guild.id]){
        prefixes[message.guild.id] = {
            prefixes: botConfig.prefix
        };
    }

    var prefix = prefixes[message.guild.id].prefixes;

    // var prefix = botConfig.prefix;

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    var arguments = messageArray.slice(1);

    var commands = bot.commands.get(command.slice(prefix.length));


    var options = {

        active: active

    }

    if(commands) commands.run(bot, message, arguments, options);

    if(command === `${prefix}kick`){

        // !kick @casper_schaepherders#3804 redenen hier.
        
        var kickUser = message.guild.member(message.mentions.users.first() || message.guild.members(arguments[0]));

        if(!kickUser) return message.channel.send("opgegeven gebruiker is niet gevonden...");

        var reason = arguments.join(" ").slice(22);

        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("je hebt geen toegang tot dit commando!");

        if(kickUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Je kan deze persoon niet kicken!");

        var kick = new discord.RichEmbed()
            .setDescription("kick")
            .setColor("#ff1900")
            .addField("Gekickt persoon:", kickUser)
            .addField("Gekickt door:", message.author)
            .addField("Reden:", reason);

        var kickChannel = message.guild.channels.find(`name`, "》straffen");
        if(!kickChannel) return message.guild.send("Dit kanaal wordt niet gevonden...")

        message.guild.member(kickUser).kick(reason);

        kickChannel.send(kick);

        return;

    }

    if(command === `${prefix}ban`){

    // !ban @casper_schaepherders#3804 redenen hier.
        
    var banUser = message.guild.member(message.mentions.users.first() || message.guild.members(arguments[0]));

    if(!banUser) return message.channel.send("opgegeven gebruiker is niet gevonden...");

    var reason = arguments.join(" ").slice(22);

    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("je hebt geen toegang tot dit commando!");

    if(banUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Je kan deze persoon niet bannnen!");

    var ban = new discord.RichEmbed()
        .setDescription("kick")
        .setColor("#ff1900")
        .addField("Gebant persoon:", banUser)
        .addField("Gebant door:", message.author)
        .addField("Reden:", reason);

    var banChannel = message.guild.channels.find(`name`, "》straffen");
    if(!banChannel) return message.guild.send("Dit kanaal wordt niet gevonden...")

    message.guild.member(banUser).ban(reason);

    banChannel.send(ban);

    return;

    }


});

bot.login(botConfig.token); 