const Discord = require('discord.js') 
const client = new Discord.Client()
require('dotenv').config() //.env module
var prefix = process.env.prefix // prefix constulose
const { Database } = require('drahovdb')
const db = new Database("database")
const { Player } = require('discord-music-player')
const { inspect } = require('util')
const { MessageEmbed } = require('discord.js')

const player = new Player(client, {
    leaveOnEnd: true,
    leaveOnStop: false,
    leaveOnEmpty: true,
    deafenOnJoin: true,
    timeout: 1200000,
    volume: 100,
    quality: 'high',
})

client.player = player;

client.on('ready', async () => { // ready process
    console.log(`${client.user.username} is Ready\nPrefix:${prefix}`)
    client.user.setActivity('My dick is big', {type: 'LISTENING'})
    const data = await db.getAll()
    for(let i = 0; i < Object.keys(data).length; i++){
        if(Object.keys(data)[i].includes('messageid')){
            const guildid = Object.keys(data)[i].split('.')[1]
            const guild = await client.guilds.fetch(guildid)
            const ch = guild.channels.cache.get(db.get(`musicch.${guildid}`))
            const message = await ch.messages.fetch(db.get(`messageid.${guildid}`))
            let filter = (reaction, user) => user.id !== message.client.user.id;
            let collector = message.createReactionCollector(filter)
            collector.on('collect', async(reaction, user) => {
                switch(reaction.emoji.name){
                    case "⏯️":
                        reaction.users.remove(user).catch()
                        const member1 = message.guild.members.cache.get(user.id)
                        if(!member1.voice.channel || member1.voice.channel.id !== message.guild.me.voice.channel.id) return;
                        if(player.queues.get(message.guild.id).playing){
                            await player.pause(message)
                        }
                        else if(!player.queues.get(message.guild.id).playing){
                            await player.resume(message)
                        }
                        else{
                            return;
                        }
                        break;
                    case "⏭️":
                        reaction.users.remove(user).catch()
                        const member2 = message.guild.members.cache.get(user.id)
                        if(!member2.voice.channel || member2.voice.channel.id !== message.guild.me.voice.channel.id) return;
                        if(player.queues.get(message.guild.id).songs.length < 2) return;
                        await player.skip(message)
                        break;
                    case "🔉":
                        reaction.users.remove(user).catch()
                        const member3 = message.guild.members.cache.get(user.id)
                        if(!member3.voice.channel || member3.voice.channel.id !== message.guild.me.voice.channel.id) return;
                        if(player.getVolume(message) < 26) return;
                        await player.setVolume(message, player.getVolume(message) - 25)
                        db.add(`volume.${guildid}`, player.getVolume(message))
                        const embed1 = new Discord.MessageEmbed()
                        embed1.setTitle(player.nowPlaying(message).name)
                        embed1.setImage(player.nowPlaying(message).thumbnail)
                        embed1.addField('Artist', player.nowPlaying(message).author, true)
                        embed1.addField('RequestedBy', player.nowPlaying(message).requestedBy, true)
                        embed1.addField('Duration', player.nowPlaying(message).duration, true)
                        embed1.addField('In Queue Songs', player.getQueue(message).songs.map((songs, i) => {
                            return songs.name
                        }).length-1, true)
                        embed1.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                        embed1.setColor('RED')
                        message.edit(embed1)    
                        break;
                    case "🔊":
                        reaction.users.remove(user).catch()
                        const member4 = message.guild.members.cache.get(user.id)
                        if(!member4.voice.channel || member4.voice.channel.id !== message.guild.me.voice.channel.id) return;
                        if(player.getVolume(message) > 225) return;
                        await player.setVolume(message, player.getVolume(message) + 25)
                        db.add(`volume.${guildid}`, player.getVolume(message))
                        const embed2 = new Discord.MessageEmbed()
                        embed2.setTitle(player.nowPlaying(message).name)
                        embed2.setImage(player.nowPlaying(message).thumbnail)
                        embed2.addField('Artist', player.nowPlaying(message).author, true)
                        embed2.addField('RequestedBy', player.nowPlaying(message).requestedBy, true)
                        embed2.addField('Duration', player.nowPlaying(message).duration, true)
                        embed2.addField('In Queue Songs', player.getQueue(message).songs.map((songs, i) => {
                            return songs.name
                        }).length-1, true)
                        embed2.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                        embed2.setColor('RED')
                        message.edit(embed2)
                        break;
                    case "🛑":
                        reaction.users.remove(user).catch()
                        const member5 = message.guild.members.cache.get(user.id)
                        if(!member5.voice.channel || member5.voice.channel.id !== message.guild.me.voice.channel.id) return;
                        const stopping = await player.stop(message)
                        if(stopping){
                            const embed5 = new Discord.MessageEmbed()
                            embed5.setTitle('Any song is not playing')
                            embed5.setColor('RED')
                            const ch = await message.guild.channels.cache.get(db.get(`musicch.${message.guild.id}`))
                            const message3 = await ch.messages.fetch(db.get(`messageid.${message.guild.id}`))
                            message3.edit(embed5)
                        }
                        break;
                }
            })
    }   }
})

player.on('songChanged', async (msg,newsong,oldsong) => {
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle(player.nowPlaying(msg).name)
    embed.setImage(player.nowPlaying(msg).thumbnail)
    embed.addField('Artist', player.nowPlaying(msg).author, true)
    embed.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
    embed.addField('Duration', player.nowPlaying(msg).duration, true)
    embed.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
        return songs.name
    }).length-1, true)
    embed.addField('Volume', `${String(db.get(`volume.${msg.guild.id}`))}/250`,true)
    embed.setColor('RED')
    message.edit(embed)
    message.react("⏯️")
    message.react('⏭️')
    message.react('🔉')
    message.react('🔊')
    message.react('🛑')
})

client.on('messageDelete', async msg => {
    if(msg.id === db.get(`messageid.${msg.guild.id}`)){
        if(player.isPlaying(msg)){
            const embed = new Discord.MessageEmbed()
            embed.setTitle(player.nowPlaying(msg).name)
            embed.setImage(player.nowPlaying(msg).thumbnail)
            embed.addField('Artist', player.nowPlaying(msg).author, true)
            embed.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
            embed.addField('Duration', player.nowPlaying(msg).duration, true)
            embed.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                return songs.name
            }).length-1, true)
            embed.addField('Volume', `${player.getVolume(msg)}/250`,true)
            embed.setColor('RED')
            msg.channel.send(embed).then(async message => {
                db.add(`messageid.${msg.guild.id}`, message.id)
                message.react("⏯️")
                message.react('⏭️')
                message.react('🔉')
                message.react('🔊')
                message.react('🛑')
                let filter = (reaction, user) => user.id !== message.client.user.id;
                    let collector = message.createReactionCollector(filter)
                    collector.on('collect', async(reaction, user) => {
                        switch(reaction.emoji.name){
                            case "⏯️":
                                reaction.users.remove(user).catch()
                                const member1 = msg.guild.members.cache.get(user.id)
                                if(!member1.voice.channel || member1.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.queues.get(msg.guild.id).playing){
                                    await player.pause(msg)
                                }
                                else if(!player.queues.get(msg.guild.id).playing){
                                    await player.resume(msg)
                                }
                                else{
                                    return;
                                }
                                break;
                            case "⏭️":
                                reaction.users.remove(user).catch()
                                const member2 = msg.guild.members.cache.get(user.id)
                                if(!member2.voice.channel || member2.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.queues.get(msg.guild.id).songs.length < 2) return;
                                await player.skip(msg)
                                break;
                            case "🔉":
                                reaction.users.remove(user).catch()
                                const member3 = msg.guild.members.cache.get(user.id)
                                if(!member3.voice.channel || member3.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) < 26) return;
                                await player.setVolume(msg, player.getVolume(msg) - 25)
                                db.add(`volume.${guildid}`, player.getVolume(msg))
                                const embed1 = new Discord.MessageEmbed()
                                embed1.setTitle(player.nowPlaying(msg).name)
                                embed1.setImage(player.nowPlaying(msg).thumbnail)
                                embed1.addField('Artist', player.nowPlaying(msg).author, true)
                                embed1.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                                embed1.addField('Duration', player.nowPlaying(msg).duration, true)
                                embed1.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed1.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                                embed1.setColor('RED')
                                message.edit(embed1)    
                                break;
                            case "🔊":
                                reaction.users.remove(user).catch()
                                const member4 = msg.guild.members.cache.get(user.id)
                                if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) > 225) return;
                                await player.setVolume(msg, player.getVolume(msg) + 25)
                                db.add(`volume.${guildid}`, player.getVolume(msg))
                                const embed2 = new Discord.MessageEmbed()
                                embed2.setTitle(player.nowPlaying(msg).name)
                                embed2.setImage(player.nowPlaying(msg).thumbnail)
                                embed2.addField('Artist', player.nowPlaying(msg).author, true)
                                embed2.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                                embed2.addField('Duration', player.nowPlaying(msg).duration, true)
                                embed2.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed2.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                                embed2.setColor('RED')
                                message.edit(embed2)
                                break;
                            case "🛑":
                                reaction.users.remove(user).catch()
                                const member5 = msg.guild.members.cache.get(user.id)
                                if(!member5.voice.channel || member5.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                const stopping = await player.stop(msg)
                                if(stopping){
                                    const embed5 = new Discord.MessageEmbed()
                                    embed5.setTitle('Any song is not playing')
                                    embed5.setColor('RED')
                                    const ch = await msg.guild.channels.cache.get(db.get(`musicch.${msg.guild.id}`))
                                    const message3 = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
                                    message3.edit(embed5)
                                }
                                break;
                        }
                    })
            })
        }
        else{
            const embed = new Discord.MessageEmbed()
            embed.setTitle('Any song is not playing')
            embed.setColor('RED')
            msg.channel.send(embed).then(message => {
                message.react("⏯️")
                message.react('⏭️')
                message.react('🔉')
                message.react('🔊')
                message.react('🛑')
                db.add(`messageid.${msg.guild.id}`, message.id)
                let filter = (reaction, user) => user.id !== message.client.user.id;
                    let collector = message.createReactionCollector(filter)
                    collector.on('collect', async(reaction, user) => {
                        switch(reaction.emoji.name){
                            case "⏯️":
                                reaction.users.remove(user).catch()
                                const member1 = msg.guild.members.cache.get(user.id)
                                if(!member1.voice.channel || member1.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.queues.get(msg.guild.id).playing){
                                    await player.pause(msg)
                                }
                                else if(!player.queues.get(msg.guild.id).playing){
                                    await player.resume(msg)
                                }
                                else{
                                    return;
                                }
                                break;
                            case "⏭️":
                                reaction.users.remove(user).catch()
                                const member2 = msg.guild.members.cache.get(user.id)
                                if(!member2.voice.channel || member2.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.queues.get(msg.guild.id).songs.length < 2) return;
                                await player.skip(msg)
                                break;
                            case "🔉":
                                reaction.users.remove(user).catch()
                                const member3 = msg.guild.members.cache.get(user.id)
                                if(!member3.voice.channel || member3.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) < 26) return;
                                await player.setVolume(msg, player.getVolume(msg) - 25)
                                db.add(`volume.${guildid}`, player.getVolume(msg))
                                const embed1 = new Discord.MessageEmbed()
                                embed1.setTitle(player.nowPlaying(msg).name)
                                embed1.setImage(player.nowPlaying(msg).thumbnail)
                                embed1.addField('Artist', player.nowPlaying(msg).author, true)
                                embed1.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                                embed1.addField('Duration', player.nowPlaying(msg).duration, true)
                                embed1.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed1.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                                embed1.setColor('RED')
                                message.edit(embed1)
                                break;
                            case "🔊":
                                reaction.users.remove(user).catch()
                                const member4 = msg.guild.members.cache.get(user.id)
                                if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) > 225) return;
                                await player.setVolume(msg, player.getVolume(msg) + 25)
                                db.add(`volume.${guildid}`, player.getVolume(msg))
                                const embed2 = new Discord.MessageEmbed()
                                embed2.setTitle(player.nowPlaying(msg).name)
                                embed2.setImage(player.nowPlaying(msg).thumbnail)
                                embed2.addField('Artist', player.nowPlaying(msg).author, true)
                                embed2.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                                embed2.addField('Duration', player.nowPlaying(msg).duration, true)
                                embed2.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed2.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                                embed2.setColor('RED')
                                message.edit(embed2)
                                break;
                            case "🛑":
                                reaction.users.remove(user).catch()
                                const member5 = msg.guild.members.cache.get(user.id)
                                if(!member5.voice.channel || member5.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                const stopping = await player.stop(msg)
                                if(stopping){
                                    const embed5 = new Discord.MessageEmbed()
                                    embed5.setTitle('Any song is not playing')
                                    embed5.setColor('RED')
                                    const ch = await msg.guild.channels.cache.get(db.get(`musicch.${msg.guild.id}`))
                                    const message3 = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
                                    message3.edit(embed5)
                                }
                                break;
                        }
                    })
            })
        }
    }
})

player.on('error', async(error,msg) => {
    switch(error) {
        case 'SearchIsNull':
            msg.author.send('Can not find the song as you searched')
            break;
        case 'InvalidPlaylist':
            break;
        case 'InvalidSpotify':
            msg.author.send('The spotify link is not valid')
            break;
        case 'VoiceChannelTypeInvalid':
            msg.author.send('You must be in the voice channel to play any song')
            break;
        case 'LiveUnsupported':
            msg.author.send('YouTube lives are unsupported')
            break;
        case 'VideoUnavailable':
            msg.author.send('An error has occurred while trying to play')
            break;
        case 'NotANumber':
            msg.author.send('The argumen of you gave is not a number')
            break;
        case 'MessageTypeInvalid':
            msg.author.send('The message object is not provided')
            break;
        case 'Status code: 403':
            msg.author.send('403 error: Youtube declined the access')
            break;
        case 'QueueIsNull':
            break;
        default:
            msg.author.send(`Unknown error has occurred:\n\`\`\`${error}\`\`\``)
    }
})

player.on('queueEnd', async(msg) => {
    player.queues.get(msg.guild.id).dispatcher = null;
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle('Any song is not playing')
    embed.setColor('RED')
    message.edit(embed)
})

player.on('clientDisconnect', async(msg,queue) => {
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle('Any song is not playing')
    embed.setColor('RED')
    message.edit(embed)
})

player.on('songAdd', async(msg,queue,song) => {
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle(player.nowPlaying(msg).name)
    embed.setImage(player.nowPlaying(msg).thumbnail)
    embed.addField('Artist', player.nowPlaying(msg).author, true)
    embed.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
    embed.addField('Duration', player.nowPlaying(msg).duration, true)
    embed.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
        return songs.name
    }).length-1, true)
    embed.addField('Volume', `${String(db.get(`volume.${msg.guild.id}`))}/250`,true)
    embed.setColor('RED')
    message.edit(embed)
})

player.on('playlistAdd', async(msg,queue,song) => {
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle(player.nowPlaying(msg).name)
    embed.setImage(player.nowPlaying(msg).thumbnail)
    embed.addField('Artist', player.nowPlaying(msg).author, true)
    embed.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
    embed.addField('Duration', player.nowPlaying(msg).duration, true)
    embed.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
        return songs.name
    }).length-1, true)
    embed.addField('Volume', `${String(db.get(`volume.${msg.guild.id}`))}/250`,true)
    embed.setColor('RED')
    message.edit(embed)
})

client.on('messageReactionRemoveAll', async msg => {
    if(msg.id === db.get(`messageid.${msg.guild.id}`)){
        msg.react("⏯️")
        msg.react('⏭️')
        msg.react('🔉')
        msg.react('🔊')
        msg.react('🛑')
    }
})

client.on('message', async msg => {
    const args = msg.content.split(' ')
    if(msg.content.toLowerCase().startsWith(prefix + 'set') && !msg.author.bot){
        if(msg.member.hasPermission('ADMINISTRATOR')){
            const target = msg.mentions.channels.first()
            db.add(`musicch.${msg.guild.id}`, target.id)
            msg.channel.send(`<#${target.id}> is set`)
        }
        else{
            msg.channel.send('You dont have permission to do this')
        }
    }
    if(db.has(`musicch.${msg.guild.id}`)){
        if(msg.channel.id === db.get(`musicch.${msg.guild.id}`) && !msg.author.bot){
            msg.delete()
            if(msg.content.includes('https://open.spotify.com/playlist') || msg.content.includes('https://www.youtube.com/playlist') || msg.content.includes('https://open.spotify.com/album')){
                await player.playlist(msg, {
                    search: msg.content,
                    requestedBy: msg.author,
                })
            }
            else{
                await player.play(msg, {
                    search: msg.content,
                    requestedBy: msg.author,
                })
            }
                await player.setVolume(msg, db.get(`volume.${msg.guild.id}`))
                const embed = new Discord.MessageEmbed()
                embed.setTitle(player.nowPlaying(msg).name)
                embed.setImage(player.nowPlaying(msg).thumbnail)
                embed.addField('Artist', player.nowPlaying(msg).author, true)
                embed.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                embed.addField('Duration', player.nowPlaying(msg).duration, true)
                embed.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                    return songs.name
                }).length-1, true)
                embed.addField('Volume', `${db.get(`volume.${msg.guild.id}`)}/250`,true)
                embed.setColor('RED')
                if(db.has(`messageid.${msg.guild.id}`)){
                    const ch = await msg.guild.channels.cache.get(db.get(`musicch.${msg.guild.id}`))
                    const message3 = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
                    const message = await message3.edit(embed)
                }
                else{
                    const message = await msg.channel.send(embed)
                    let filter = (reaction, user) => user.id !== message.client.user.id;
                        let collector = message.createReactionCollector(filter)
                        collector.on('collect', async(reaction, user) => {
                            switch(reaction.emoji.name){
                                case "⏯️":
                                    reaction.users.remove(user).catch()
                                    const member1 = msg.guild.members.cache.get(user.id)
                                    if(!member1.voice.channel || member1.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                    if(player.queues.get(msg.guild.id).playing){
                                        await player.pause(msg)
                                    }
                                    else if(!player.queues.get(msg.guild.id).playing){
                                        await player.resume(msg)
                                    }
                                    else{
                                        return;
                                    }
                                    break;
                                case "⏭️":
                                    reaction.users.remove(user).catch()
                                    const member2 = msg.guild.members.cache.get(user.id)
                                    if(!member2.voice.channel || member2.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                    if(player.queues.get(msg.guild.id).songs.length < 2) return;
                                    await player.skip(msg)
                                    break;
                                case "🔉":
                                    reaction.users.remove(user).catch()
                                    const member3 = msg.guild.members.cache.get(user.id)
                                    if(!member3.voice.channel || member3.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                    if(player.getVolume(msg) < 26) return;
                                    await player.setVolume(msg, player.getVolume(msg) - 25)
                                    db.add(`volume.${guildid}`, player.getVolume(msg))
                                    const embed1 = new Discord.MessageEmbed()
                                    embed1.setTitle(player.nowPlaying(msg).name)
                                    embed1.setImage(player.nowPlaying(msg).thumbnail)
                                    embed1.addField('Artist', player.nowPlaying(msg).author, true)
                                    embed1.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                                    embed1.addField('Duration', player.nowPlaying(msg).duration, true)
                                    embed1.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                                        return songs.name
                                    }).length-1, true)
                                    embed1.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                                    embed1.setColor('RED')
                                    message.edit(embed1)
                                    break;
                                case "🔊":
                                    reaction.users.remove(user).catch()
                                    const member4 = msg.guild.members.cache.get(user.id)
                                    if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                    if(player.getVolume(msg) > 225) return;
                                    await player.setVolume(msg, player.getVolume(msg) + 25)
                                    db.add(`volume.${guildid}`, player.getVolume(msg))
                                    const embed2 = new Discord.MessageEmbed()
                                    embed2.setTitle(player.nowPlaying(msg).name)
                                    embed2.setImage(player.nowPlaying(msg).thumbnail)
                                    embed2.addField('Artist', player.nowPlaying(msg).author, true)
                                    embed2.addField('RequestedBy', player.nowPlaying(msg).requestedBy, true)
                                    embed2.addField('Duration', player.nowPlaying(msg).duration, true)
                                    embed2.addField('In Queue Songs', player.getQueue(msg).songs.map((songs, i) => {
                                        return songs.name
                                    }).length-1, true)
                                    embed2.addField('Volume', `${String(db.get(`volume.${message.guild.id}`))}/250`,true)
                                    embed2.setColor('RED')
                                    message.edit(embed2)
                                    break;
                                case "🛑":
                                    reaction.users.remove(user).catch()
                                    const member5 = msg.guild.members.cache.get(user.id)
                                    if(!member5.voice.channel || member5.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                    const stopping = await player.stop(msg)
                                    if(stopping){
                                        const embed5 = new Discord.MessageEmbed()
                                        embed5.setTitle('Any song is not playing')
                                        embed5.setColor('RED')
                                        const ch = await msg.guild.channels.cache.get(db.get(`musicch.${msg.guild.id}`))
                                        const message3 = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
                                        message3.edit(embed5)
                                    }
                            }
                        })
                        message.react("⏯️")
                        message.react('⏭️')
                        message.react('🔉')
                        message.react('🔊')
                        message.react('🛑')
                    db.add(`messageid.${msg.guild.id}`, message.id)
                }
        }
    }
})

client.login(process.env.token)
