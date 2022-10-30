let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Vous avez déjà créé un ticket !',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket créé! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/1036327371130802216/1036330662103363584/IMG_0381.gif')
                .setDescription('```Contrôle des tickets```')
                .setFooter('Z\'Tickets', 'https://cdn.discordapp.com/attachments/1036327371130802216/1036330662103363584/IMG_0381.gif')
                .setTimestamp();


        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Séléctionnez la catégorie du ticket')
            .addOptions([{
                label: 'Recrutement',
                value: 'Recrutement',
                emoji: '<:8263blurplemembers:1036332358422511627>',
              },
              {
                label: 'Partenariat',
                value: 'Partenariat',
                emoji: '<:amarteau:1036331505473040384>',
              },
              {
                label: 'Support',
                value: 'Support',
                emoji: '<:BadgeDiscordPartnerCopie:1036332404324974652>',
              },
              {
                label: 'Autre',
                value: 'Autre',
                emoji: '<:bballoons:1036332456430813335>',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket', '')
                  .setDescription(`<@!${interaction.user.id}> A créé un ticket ${i.values[0]}`)
                  .setFooter('', '')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Fermer le ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'Recrutement') {
              c.edit({
                parent: client.config.parent
              });
            };
            if (i.values[0] == 'Partenariat') {
              c.edit({
                parent: client.config.parent2
              });
            };
            if (i.values[0] == 'Support') {
              c.edit({
                parent: client.config.parent3
              });
            };
            if (i.values[0] == 'Autre') {
              c.edit({
                parent: client.config.parent4
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Aucune catégorie séléctionnée. Fermeture du ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Fermer le ticket')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Annuler la fermeture')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Êtes vous sûr de vouloir fermer le ticket ?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket fermé par <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/1036327371130802216/1036330662103363584/IMG_0381.gif')
                .setDescription('```Contrôle des tickets```')
                .setFooter('C\'Tickets', 'https://cdn.discordapp.com/attachments/1036327371130802216/1036330662103363584/IMG_0381.gif')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Supprimer le ticket')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Fermeture du ticket annulé !',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Fermeture du ticket annulé !',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Sauvegarde des messages...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('fr-FR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/1036327371130802216/1036330662103363584/IMG_0381.gif')
              .setDescription(`📰 Logs du ticket \`${chan.id}\` créé par <@!${chan.topic}> et supprimé par <@!${interaction.user.id}>\n\nLogs: [**Cliquez ici pour voir les logs**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/1036327371130802216/1036330662103363584/IMG_0381.gif')
              .setDescription(`📰 Logs de votre ticket \`${chan.id}\`: [**Cliquez ici pour voir les logs**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('I can\'t dm him :(')});
            chan.send('Suppression du channel...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};
