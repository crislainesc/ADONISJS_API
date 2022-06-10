import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Bet from 'App/Models/Bet'
import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

import CreateBetValidator from 'App/Validators/CreateBetValidator'
import UpdateBetValidator from 'App/Validators/UpdateBetValidator'

interface IBet {
  numbers: string
  user_id: number
  game_id: number
  price: number
}

export default class BetsController {
  public async create({ auth, request, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    await request.validate(CreateBetValidator)

    try {
      const user = await User.findBy('id', id)

      if (!user) {
        return response.notFound('User not found')
      }

      const { bets } = request.only(['bets'])

      const betsToSave: IBet[] = []

      const totalBets = bets.map(async (bet) => {
        const game = await Game.findByOrFail('id', bet.game_id)
        const gameNumbers = bet.numbers

        if (gameNumbers.length > game.maxNumber || gameNumbers.length < game.maxNumber) {
          throw new Error(
            `The game does not have the required number of ${game.maxNumber} of numbers of ${game.type}`
          )
        }

        gameNumbers.forEach((number) => {
          if (number > game.range) {
            throw new Error(
              `The number ${number} is greater than the allowed range of ${game.range} for the game ${game.type}`
            )
          }
        })

        betsToSave.push({
          numbers: gameNumbers.join(','),
          user_id: user.id,
          game_id: game.id,
          price: game.price,
        })

        return game.price
      })

      const totalPrices = await Promise.all(totalBets)

      const total = totalPrices.reduce(
        (previousPrice, currentPrice) => previousPrice + currentPrice,
        0
      )

      const cart = await Cart.query().select('min_cart_value').first()

      if (cart && total < cart?.minCartValue) {
        throw new Error(`Minimum bet amount of ${cart?.minCartValue} has not been reached`)
      }

      const bet = await Bet.createMany(betsToSave)

      return response.created({ bet: bet })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  public async index({ auth, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    const bets = await await Bet.query().select('*').where('user_id', id)

    if (!bets) {
      return response.notFound('Bets not found')
    }

    return response.ok(bets)
  }

  public async update({ auth, request, response }) {
    const { id } = await auth.use('api').authenticate()

    await request.validate(UpdateBetValidator)

    try {
      const betId = await request.params('id').id

      const user = await User.findBy('id', id)

      const { numbers } = request.only(['numbers'])

      if (!user) {
        return response.notFound('User not found')
      }

      const bet = await Bet.findByOrFail('id', betId)

      const game = await Game.findByOrFail('id', bet.game_id)

      if (numbers.length > game.maxNumber || numbers.length < game.maxNumber) {
        throw new Error(
          `The game does not have the required number of ${game.maxNumber} of numbers of ${game.type}`
        )
      }

      numbers.forEach((number) => {
        if (number > game.range) {
          throw new Error(
            `The number ${number} is greater than the allowed range of ${game.range} for the game ${game.type}`
          )
        }
      })

      const updatedBet = {
        numbers: numbers.join(','),
        user_id: user.id,
        game_id: game.id,
        price: game.price,
      }

      await bet.merge(updatedBet)

      await bet.save()

      return response.ok({ bet: bet })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const bet = await Bet.findBy('id', id)

    if (!bet) {
      return response.notFound('Bet not found')
    }

    await bet.delete()

    return response.noContent()
  }
}
