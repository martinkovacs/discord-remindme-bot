const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

// ----------------------------------------

const Discord = require("discord.js")
const client = new Discord.Client();
const jsonfile = require("jsonfile")
var reminders = require("./reminders.json")


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    setInterval(sendReminder, 1000)
})


client.on("message", message => {
    if (message.mentions.has(client.user)) {
        const msgArray = message.content.split(" ")
        msgArray.shift()

        var time = 0
        var timeMultiplier = {
            "d": 86400,
            "h": 3600,
            "m": 60,
            "s": 1
        }
        var reminderMessage = ""

        for (var msg of msgArray) {
            if (msg.match(/\d+[dhms]/)) {
                time = msg.match(/\d+/)[0] * timeMultiplier[msg.match(/[dhms]/)[0]]
            } else {
                reminderMessage += msg + " "
            }
        }

        const reminderKey = (getUnixTime() + time) + "|" + Math.round(Math.random() * Math.pow(10, 16))

        const reminder = {
            "author": message.author.id,
            "channel": message.channel.id,
            "message": reminderMessage.trim(),
        }

        reminders[reminderKey] = reminder
        writeRemindersFile()

        message.channel.send("Reminder added!")
    }
});


function getUnixTime() {
    return Math.round((Date.now() / 1000))
}


function writeRemindersFile() {
    jsonfile.writeFile("reminders.json", reminders)
    reminders = require("./reminders.json")
}


function sendReminder() {
    for (var reminderKey in reminders) {
        if (getUnixTime() >= reminderKey.split("|")[0]) {
            client.channels.cache.get(reminders[reminderKey].channel).send(`<@!${reminders[reminderKey].author}> ${reminders[reminderKey].message}`)
            delete reminders[reminderKey]
            writeRemindersFile()
        }
    }
}


client.login(process.env.DISCORD_TOKEN)
