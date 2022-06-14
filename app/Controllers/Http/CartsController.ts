import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'

export default class CartsController {
  public async create({ request, response }) {
    const minCartValue = request.only('min_cart_value')

    const cart = await Cart.create(minCartValue)

    return response.created(cart)
  }

  public async index({ response }: HttpContextContract) {
    const data = await Cart.query().select('min_cart_value').first()

    const cart = data?.serialize()

    const games = await Game.query().select(
      'id',
      'type',
      'description',
      'range',
      'price',
      'max_number',
      'color'
    )

    const responseData = { types: games, cart }

    return response.ok(responseData)
  }
}
