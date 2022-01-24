const Discord = require('discord.js') 
const client = new Discord.Client()
require('dotenv').config() //.env module
var prefix = process.env.prefix // prefix constule
const { Database } = require('drahovdb')
const db = new Database("database")
const { Player } = require('discord-music-player')

const player = new Player(client, {
    leaveOnEnd: true,
    leaveOnStop: false,
    leaveOnEmpty: true,
    deafenOnJoin: true,
    timeout: 2147483647,
    volume: 100,
    quality: 'high',
})

client.player = player;

client.on('ready', () => { // ready process
    console.log(`${client.user.username} is Ready\nPrefix:${prefix}`)
    client.user.setActivity('My dick is big', {type: 'LISTENING'})
})

player.on('songChanged', async (msg,newsong,oldsong) => {
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle(player.nowPlaying(msg).name)
    embed.setImage(player.nowPlaying(msg).thumbnail)
    embed.addField('Sanatçı', player.nowPlaying(msg).author, true)
    embed.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
    embed.addField('Süre', player.nowPlaying(msg).duration, true)
    embed.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
        return songs.name
    }).length-1, true)
    embed.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
    embed.setColor('RED')
    message.edit(embed)
    message.react("⏯️")
    message.react('⏭️')
    message.react('🔉')
    message.react('🔊')
    message.react('🛑')
})

player.on('songAdd', async(msg,queue,song) => {
    msg.guild.members.cache.get(player.queues.get(msg.guild.id).songs[player.queues.get(msg.guild.id).songs.length-1].requestedBy.id).send(`${song.name} sıraya eklendi`)
})

client.on('messageDelete', async msg => {
    if(msg.id === db.get(`messageid.${msg.guild.id}`)){
        if(player.isPlaying(msg)){
            const embed = new Discord.MessageEmbed()
            embed.setTitle(player.nowPlaying(msg).name)
            embed.setImage(player.nowPlaying(msg).thumbnail)
            embed.addField('Sanatçı', player.nowPlaying(msg).author, true)
            embed.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
            embed.addField('Süre', player.nowPlaying(msg).duration, true)
            embed.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                return songs.name
            }).length-1, true)
            embed.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
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
                                const embed1 = new Discord.MessageEmbed()
                                embed1.setTitle(player.nowPlaying(msg).name)
                                embed1.setImage(player.nowPlaying(msg).thumbnail)
                                embed1.addField('Sanatçı', player.nowPlaying(msg).author, true)
                                embed1.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                                embed1.addField('Süre', player.nowPlaying(msg).duration, true)
                                embed1.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed1.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
                                embed1.setColor('RED')
                                message.edit(embed1)    
                                break;
                            case "🔊":
                                reaction.users.remove(user).catch()
                                const member4 = msg.guild.members.cache.get(user.id)
                                if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) > 225) return;
                                await player.setVolume(msg, player.getVolume(msg) + 25)
                                const embed2 = new Discord.MessageEmbed()
                                embed2.setTitle(player.nowPlaying(msg).name)
                                embed2.setImage(player.nowPlaying(msg).thumbnail)
                                embed2.addField('Sanatçı', player.nowPlaying(msg).author, true)
                                embed2.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                                embed2.addField('Süre', player.nowPlaying(msg).duration, true)
                                embed2.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed2.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
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
                                    embed5.setTitle('Bişey Çalınmıyor')
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
            embed.setTitle('Bişey Çalınmıyor')
            embed.setColor('RED')
            msg.channel.send(embed).then(message => {
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
                                const embed1 = new Discord.MessageEmbed()
                                embed1.setTitle(player.nowPlaying(msg).name)
                                embed1.setImage(player.nowPlaying(msg).thumbnail)
                                embed1.addField('Sanatçı', player.nowPlaying(msg).author, true)
                                embed1.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                                embed1.addField('Süre', player.nowPlaying(msg).duration, true)
                                embed1.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed1.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
                                embed1.setColor('RED')
                                message.edit(embed1)
                                break;
                            case "🔊":
                                reaction.users.remove(user).catch()
                                const member4 = msg.guild.members.cache.get(user.id)
                                if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) > 225) return;
                                await player.setVolume(msg, player.getVolume(msg) + 25)
                                const embed2 = new Discord.MessageEmbed()
                                embed2.setTitle(player.nowPlaying(msg).name)
                                embed2.setImage(player.nowPlaying(msg).thumbnail)
                                embed2.addField('Sanatçı', player.nowPlaying(msg).author, true)
                                embed2.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                                embed2.addField('Süre', player.nowPlaying(msg).duration, true)
                                embed2.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed2.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
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
                                    embed5.setTitle('Bişey Çalınmıyor')
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
            msg.author.send('Arattığınız şarkı bulunamadı')
            break;
        case 'InvalidPlaylist':
            msg.author.send('Playlist linki geçersiz')
            break;
        case 'InvalidSpotify':
            msg.author.send('Spotify linki geçersiz')
            break;
        case 'QueueIsNull':
            msg.author.send('Şuan şarkı oynatılmıyor')
            break;
        case 'VoiceChannelTypeInvalid':
            msg.author.send('Şarkı çalmak için sesli kanalda bulunmalısın')
            break;
        case 'LiveUnsupported':
            msg.author.send('YouTube canlı yayınları desteklenmemektedir')
            break;
        case 'VideoUnavailable':
            msg.author.send('Şarkıyı oynatırken bir hata oluştu')
            break;
        case 'NotANumber':
            msg.author.send('Girdiğiniz argüman sayı olmalı')
            break;
        case 'MessageTypeInvalid':
            msg.author.send('Mesaj objesi sağlanmadı')
            break;
        default:
            msg.author.send(`Bilinmeyen bir hata oluştu:\n\`\`\`${error}\`\`\``)
    }
})

player.on('queueEnd', async(msg) => {
    const queue = player.queues.get(msg.guild.id)
    queue.songs = [];
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle('Bişey Çalınmıyor')
    embed.setColor('RED')
    message.edit(embed)
})

player.on('clientDisconnect', async(msg,queue) => {
    const chid = db.get(`musicch.${msg.guild.id}`)
    const ch = msg.guild.channels.cache.get(chid)
    const message = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
    const embed = new Discord.MessageEmbed()
    embed.setTitle('Bişey Çalınmıyor')
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
    embed.addField('Sanatçı', player.nowPlaying(msg).author, true)
    embed.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
    embed.addField('Süre', player.nowPlaying(msg).duration, true)
    embed.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
        return songs.name
    }).length-1, true)
    embed.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
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
            msg.channel.send(`<#${target.id}> ayarlandı`)
        }
        else{
            msg.channel.send('Bunu yapmaya yetkin yok')
        }
    }
    if(db.has(`musicch.${msg.guild.id}`)){
        if(msg.channel.id === db.get(`musicch.${msg.guild.id}`) && !msg.author.bot){
            msg.delete()
            if(!player.isPlaying(msg)){
                await player.play(msg, {
                    search: msg.content,
                    requestedBy: msg.author,
                })
            }
            else if(player.isPlaying(msg)){
                if(!msg.member.voice.channel || msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                await player.addToQueue(msg, {
                    search: msg.content,
                    requestedBy: msg.author,
                })
            }
            const embed = new Discord.MessageEmbed()
            embed.setTitle(player.nowPlaying(msg).name)
            embed.setImage(player.nowPlaying(msg).thumbnail)
            embed.addField('Sanatçı', player.nowPlaying(msg).author, true)
            embed.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
            embed.addField('Süre', player.nowPlaying(msg).duration, true)
            embed.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                return songs.name
            }).length-1, true)
            embed.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
            embed.setColor('RED')
            if(db.has(`messageid.${msg.guild.id}`)){
                const ch = await msg.guild.channels.cache.get(db.get(`musicch.${msg.guild.id}`))
                const message3 = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
                message3.delete()
                const message = await msg.channel.send(embed)
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
                            const embed1 = new Discord.MessageEmbed()
                            embed1.setTitle(player.nowPlaying(msg).name)
                            embed1.setImage(player.nowPlaying(msg).thumbnail)
                            embed1.addField('Sanatçı', player.nowPlaying(msg).author, true)
                            embed1.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                            embed1.addField('Süre', player.nowPlaying(msg).duration, true)
                            embed1.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {                  
                                return songs.name
                            }).length-1, true)
                            embed1.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
                            embed1.setColor('RED')
                            message.edit(embed1)
                            break;
                        case "🔊":
                            reaction.users.remove(user).catch()
                            const member4 = msg.guild.members.cache.get(user.id)
                            if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                            if(player.getVolume(msg) > 225) return;
                            await player.setVolume(msg, player.getVolume(msg) + 25)
                            const embed2 = new Discord.MessageEmbed()
                            embed2.setTitle(player.nowPlaying(msg).name)
                            embed2.setImage(player.nowPlaying(msg).thumbnail)
                            embed2.addField('Sanatçı', player.nowPlaying(msg).author, true)
                            embed2.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                            embed2.addField('Süre', player.nowPlaying(msg).duration, true)
                            embed2.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                return songs.name
                            }).length-1, true)
                            embed2.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
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
                                embed5.setTitle('Bişey Çalınmıyor')
                                embed5.setColor('RED')
                                const ch = await msg.guild.channels.cache.get(db.get(`musicch.${msg.guild.id}`))
                                const message3 = await ch.messages.fetch(db.get(`messageid.${msg.guild.id}`))
                                message3.edit(embed5)
                            }
                            break;
                    }
                })
                message.react("⏯️")
                message.react('⏭️')
                message.react('🔉')
                message.react('🔊')
                message.react('🛑')
                db.add(`messageid.${msg.guild.id}`, message.id)
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
                                const embed1 = new Discord.MessageEmbed()
                                embed1.setTitle(player.nowPlaying(msg).name)
                                embed1.setImage(player.nowPlaying(msg).thumbnail)
                                embed1.addField('Sanatçı', player.nowPlaying(msg).author, true)
                                embed1.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                                embed1.addField('Süre', player.nowPlaying(msg).duration, true)
                                embed1.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed1.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
                                embed1.setColor('RED')
                                message.edit(embed1)
                                break;
                            case "🔊":
                                reaction.users.remove(user).catch()
                                const member4 = msg.guild.members.cache.get(user.id)
                                if(!member4.voice.channel || member4.voice.channel.id !== msg.guild.me.voice.channel.id) return;
                                if(player.getVolume(msg) > 225) return;
                                await player.setVolume(msg, player.getVolume(msg) + 25)
                                const embed2 = new Discord.MessageEmbed()
                                embed2.setTitle(player.nowPlaying(msg).name)
                                embed2.setImage(player.nowPlaying(msg).thumbnail)
                                embed2.addField('Sanatçı', player.nowPlaying(msg).author, true)
                                embed2.addField('Sıraya Ekleyen', player.nowPlaying(msg).requestedBy, true)
                                embed2.addField('Süre', player.nowPlaying(msg).duration, true)
                                embed2.addField('Sıradaki şarkılar', player.getQueue(msg).songs.map((songs, i) => {
                                    return songs.name
                                }).length-1, true)
                                embed2.addField('Ses Seviyesi', `${player.getVolume(msg)}/250`,true)
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
                                    embed5.setTitle('Bişey Çalınmıyor')
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