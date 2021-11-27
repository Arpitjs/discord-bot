const Discord = require('discord.js')
const axios = require('axios')
const client = new Discord.Client(
  { intents: ["GUILDS", "GUILD_MESSAGES"] }
)
require('dotenv').config({path: './config.env'})
const Database = require("@replit/database")
const db = new Database()
const keepAlive = require('./server.js')

const sadWords = ['sad', 'depressed', 'lonely', 'angry']
const starterEncouragements = ['Cheer Up!', 'Hang in there...', 'You are strong person tbh.']

let getQuote = () => {
  return axios('https://zenquotes.io/api/random')
    .then(({ data }) => `${data[0].q} by: ${data[0].a}`)
}

db.get('responding').then(res => {
  if(!res) {
    db.set('responding', true)
  }
})

db.get('encouragements').then(enc => {
  if (!enc || enc.length < 1) {
    db.set('encouragements', starterEncouragements)
  }
})

function updateEnc(encMsg) {
  db.get('encouragements').then(encouragements => {
    encouragements.push(encMsg)
    db.set('encouragements', encouragements)
  })
}

function deleteEnc(index) {
  db.get('encouragements').then(encouragements => {
    if (encouragements.length > index) {
      encouragements.splice(parseInt(index), 1)
      db.set('encouragements', encouragements)
    }
  })
}

client.on('ready', () => {
  console.log(`logged in as...${client.user.tag}.`)
})
client.on('message', msg => {
  if (msg.author.bot) return
  // sadWords.forEach(word => {
  //   if (msg.content.includes(word)) {
  //     let enc = starterEncouragements[Math.floor(Math.random() * encouragements.length)]
  //     msg.reply(enc)
  //   }
  // })
  db.get('responding').then(responding => {
      db.get('encouragements').then(encouragements => {
    sadWords.forEach(word => {
      if (responding && msg.content.includes(word)) {
        let enc = encouragements[Math.floor(Math.random() * encouragements.length)]
        msg.reply(enc)
      }
    })
  })
  })

  if (msg.content === '$inspire') {
    getQuote().then(quote => msg.channel.send(quote))
  }
  if (msg.content.startsWith('$new')) {
    let encMsg = msg.content.split('$new ')[1]
    updateEnc(encMsg)
    msg.channel.send('encouragement added.')
  }
  if (msg.content.startsWith('$del')) {
    let toDelIndex = msg.content.split('$del ')[1]
    deleteEnc(toDelIndex)
    msg.channel.send('encouragement deleted.')
  }
  if (msg.content == '$list') {
    db.get('encouragements').then(encs => encs.forEach(e => msg.channel.send(e)))
  }
  if (msg.content.startsWith('$responding')) {
    let action = msg.content.split(' ')[1]
    if(action === 'true') {
      db.set('responding', true)
       msg.channel.send('responding is true.')
    } else {
      db.set('responding', false)
       msg.channel.send('responding is false.')
    }
  }
})

keepAlive()
client.login(process.env.API_KEY)