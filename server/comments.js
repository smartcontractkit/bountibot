const { rewardAmount, botName, defaultLang } = require('./constants')

const comments = {
  en: {
    noAddressComment: (lang, fullRepoName) =>
      `Greetings, my name is ${botName} 🤖.
    
We are offering rewards of ${rewardAmount} ${l18nComment(lang, 'currency')} for contributions to ${fullRepoName}.

If you add a ${l18nComment(lang, 'currency')} address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} ${l18nComment(lang, 'currency')} when this PR is accepted!

${l18nComment(lang, 'commandsAndOptionsText')}`,
    thankyou: (lang, sender, address) =>
      `Thanks for adding your Ethereum address ${
        sender
      }! When this PR is approved and merged we will be sending ${rewardAmount} ${l18nComment(lang, 'currency')} to ${address}.`,
    commandsAndOptionsText: () => `---

<details>
<summary>${botName} commands and options</summary>
<br />

You can trigger ${botName} actions by commenting on this PR:
- \`@${botName} pay <address>\` set the address to receive a bounty for this PR
- \`@${botName} lang <language>\` set the preferred language for ${botName} (en, sa)

Finally, you can contact us by mentioning @${botName}.

</details>`,
    currency: () => `LINK`,
    unrecognized: command => `The command ${command} is not recognized.`,
    missingPayAddress: () => `\`@${botName} pay\` requires a valid EIP155 address argument`,
    paid: (lang, sender) => `Check your account @${sender} you should have received ${rewardAmount} ${l18nComment(lang, 'currency')}! 💰💰💰`,
    claimed: () => `🔺 The reward for this pull request has already been claimed. 🔺`
  },
  sp: {
    noAddressComment: (lang, fullRepoName) => `Aloha! Yo soy ${botName} 🤖.
    
Estamos ofreciendo ${rewardAmount} para contribuciones a ${fullRepoName}.

Si agrega una dirección de ${l18nComment(lang, 'currency')} a su descripción de Github Bio o PR, así: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. ¡Te enviaremos ${rewardAmount} ${l18nComment(lang, 'currency')} cuando se acepte este PR

${l18nComment(lang, 'commandsAndOptionsText')}`
  },
  '🏴‍☠️': {
    noAddressComment: (lang) => `Yaaaargh! I'm ${botName} ⛵️
    
We are offering booty to the value of ${rewardAmount} ${l18nComment(lang, 'currency')} for contributions to this scurvy repository.

If you add a ${l18nComment(lang, 'currency')} address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} ${l18nComment(lang, 'currency')} when this PR is accepted!

${l18nComment(lang, 'commandsAndOptionsText')}`,
    currency: () => 'dubloons',
    thankyou: () => `Aye, I recognize that address sailor. There be treasure awaitin'.`,
    unrecognized: () => `Ach, dat be no cant I'd recognize.`,
    paid: (lang, sender) => `Ahoy, @${sender}, there be treasure in your future! 💰💰💰`,
    claimed: () => `Yarrr, there be no treasure 'ere ☠️`
  }
}

const l18nComment = (lang, key, ...args) => {
  let useLang = lang || defaultLang
  let comment = comments[useLang][key]
  if (comment == null) {
    console.debug(`No comment for language '${useLang}' falling back to en for '${key}'`)
    comment = comments.en[key]
  }
  return comment(useLang, ...args)
}

module.exports = {l18nComment}
