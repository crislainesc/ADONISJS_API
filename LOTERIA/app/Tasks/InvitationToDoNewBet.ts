import { BaseTask } from 'adonis5-scheduler/build'
import { DateTime } from 'luxon'

import Bet from '../Models/Bet'
import User from '../Models/User'

import { Kafka, Partitioners } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'ms_emails',
  brokers: ['localhost:9092'],
})

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
      const message = {
        user: { email: user.email, username: user.name },
      }

      const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
      await producer.connect()
      await producer.send({
        topic: 'sendEmailToUserForInviteToNewBet',
        messages: [{ value: JSON.stringify(message) }],
      })
    })
  }
}
