import { MessageEmbed } from 'discord.js'
import Const from '../const'
import DatabaseManager from '../core/database-manager'
import { Goal } from '../types'
import { generateProgressBar } from './emoji-progessbar'


export default async function generateEmbedFromGoal(goal: Goal): Promise<Partial<MessageEmbed>> {
  const project = await DatabaseManager.getProjectById(goal.projectid)
  const reached = goal.current >= goal.cost

  const reachedText = reached
    ? `\n${Const.EMOJIS.WHITESPACE}${Const.EMOJIS.WHITESPACE}${Const.EMOJIS.WHITESPACE}**Reached!**`
    : ''

  let recentsText = ''
  if (Object.keys(goal.recents).length) {
    const keys = Object
      .keys(goal.recents)
      .slice(0, 10)
      .sort((a, b) => (goal.recents[a] === 0 ? -1 : goal.recents[b] === 0 ? 1 : 0))

    const recents = keys.map((uid) => {
      let out = `<@${uid}>`
      if (goal.recents[uid] !== 0)
        out += ` contributed ${Math.abs(goal.recents[uid])} ${([ project.display.token_name_zero, project.display.token_name_one ])[Math.abs(goal.recents[uid])] || project.display.token_name_multiple}.`
      if (goal.recents[uid] <= 0)
        out += ` You don't have any ${project.display.token_name_multiple} left to spend!`
      return out
    })

    recentsText = `\n${recents.join('\n')}\n`
    if (Object.keys(goal.recents).length > 10)
      recentsText += `*+${Object.keys(goal.recents).length - recents.length} more...*\n`
  }

  const description = [
    goal.description.split('\\n').join('\n'),
    reachedText || '',
    Const.EMOJIS.WHITESPACE + ' ' + generateProgressBar(goal.current / goal.cost, 7) + Const.EMOJIS.WHITESPACE + ` ** ${goal.current}/${goal.cost}**`,
    recentsText || '',
    `*${project.display.token_icon_one} contribute 1 ${project.display.token_name_one} ${Const.EMOJIS.WHITESPACE} ${project.display.token_icon_multiple} contribute 5 ${project.display.token_name_multiple}*`
  ].join('\n')

  return {
    title: goal.title,
    description,
    color: reached ? 0x45B583 : 0x1F2324
  }
}