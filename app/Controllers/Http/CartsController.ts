import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'

export default class CartsController {
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

    let responseData = cart
    responseData!.types = games

    return response.ok(responseData)
  }
}
