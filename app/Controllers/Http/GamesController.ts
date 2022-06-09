import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Game from 'App/Models/Game'

import CreateGameValidator from 'App/Validators/CreateGameValidator'
import UpdateGameValidator from 'App/Validators/UpdateGameValidator'

export default class GamesController {
  public async create({ request, response }: HttpContextContract) {
    const data = request.only(['type', 'description', 'range', 'price', 'max_number', 'color'])

    await request.validate(CreateGameValidator)

    const game = await Game.create(data)

    return response.created(game)
  }

  public async index({ response }: HttpContextContract) {
    const games = await Game.query().select('*')

    if (!games) {
      return response.notFound('Games not found')
    }

    return response.ok(games)
  }

  public async update({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const data = request.only(['type', 'description', 'range', 'price', 'max_number', 'color'])

    await request.validate(UpdateGameValidator)

    const game = await Game.findBy('id', id)

    if (!game) {
      return response.notFound({ message: 'Game not found' })
    }

    await game.merge(data)

    await game.save()

    return response.ok(game)
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params()

    const game = await Game.findBy('id', id)

    if (!game) {
      return response.notFound({ message: 'Game not found' })
    }

    await game.delete()

    return response.noContent()
  }
}
