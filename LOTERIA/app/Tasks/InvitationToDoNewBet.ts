import { BaseTask } from 'adonis5-scheduler/build'
import { DateTime } from 'luxon'

import Mail from '@ioc:Adonis/Addons/Mail'

import Bet from '../Models/Bet'
import User from '../Models/User'

export default class InvitationToDoNewBet extends BaseTask {
  public static get schedule() {
    return '0 9 * * *' // runs every day at 9
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    const lastWeek = await DateTime.now().minus({ weeks: 1 }).endOf('day')

    const bets = (await Bet.all()).filter((bet) => bet.createdAt > lastWeek)

    const ids = await bets.map((bet) => bet.user_id)

    const usersIds = ids.filter((id, index) => {
      return ids.indexOf(id) === index
    })

    const users = await User.all()

    const usersForNotification = users.filter((user) => {
      return usersIds.indexOf(user.id) === -1
    })

    usersForNotification.map(async (user) => {
      await Mail.send((message) => {
        message
          .from('labylub@labluby.com.br')
          .to(user.email)
          .subject('We missed you!')
          .htmlView('emails/invitation_to_do_new_bet', { user: { name: user.name } })
      })
    })
  }
}
