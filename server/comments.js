const { rewardAmount, botName, lang } = require('./constants')

const comments = {
  en: {
    noAddressComment: fullRepoName =>
      `Greetings, my name is ${botName} 🤖.
    
We are offering rewards of ${rewardAmount} ${l18nComment('currency')} for contributions to ${fullRepoName}.

If you add a ${l18nComment('currency')} address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} ${l18nComment('currency')} when this PR is accepted!

${l18nComment('commandsAndOptionsText')}`,
    thankyou: (owner, address) =>
      `Thanks for adding your Ethereum address ${
        owner
      }! When this PR is approved and merged we will be sending ${rewardAmount} ${l18nComment('currency')} to ${address}.`,
    commandsAndOptionsText: () => `---

<details>
<summary>${botName} commands and options</summary>
<br />

You can trigger ${botName} actions by commenting on this PR:
- \`@${botName} pay <address>\` set the address to receive a bounty for this PR
- \`@${botName} lang <language>\` set the preferred language for ${botName} (en, sa, pirate)

Finally, you can contact us by mentioning @${botName}.

</details>`,
    currency: () => `LINK`,
    unrecognized: command => `The command ${command} is not recognized.`,
    missingPayAddress: () => `\`@${botName} pay\` requires a valid EIP155 address argument`
  },
  sp: {
    noAddressComment: fullRepoName => `Aloha! Yo soy ${botName} 🤖.
    
Estamos ofreciendo ${rewardAmount} para contribuciones a ${fullRepoName}.

Si agrega una dirección de ${l18nComment('currency')} a su descripción de Github Bio o PR, así: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. ¡Te enviaremos ${rewardAmount} ${l18nComment('currency')} cuando se acepte este PR

${l18nComment('commandsAndOptionsText')}`
  },
  pirate: {
    noAddressComment: () => `Yaaaargh! I'm ${botName} ⛵️
    
We are offering booty to the value of ${rewardAmount} ${l18nComment('currency')} for contributions to this scurvy repository.

If you add a ${l18nComment('currency')} address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} ${l18nComment('currency')} when this PR is accepted!

${l18nComment('commandsAndOptionsText')}`,
    currency: () => 'dubloons'
  }
}

const l18nComment = (key, ...args) => {
  let comment = comments[lang][key]
  if (comment == null) {
    console.debug(`No comment for language '${lang}' falling back to en for '${key}'`)
    comment = comments.en[key]
  }
  return comment(...args)
}

module.exports = {l18nComment}
