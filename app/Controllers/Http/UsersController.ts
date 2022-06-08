import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'

import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async create({ request, auth, response }: HttpContextContract) {
    const data = request.only(['name', 'email', 'password'])

    await request.validate(CreateUserValidator)

    const emailExists = await User.findBy('email', data.email)

    if (emailExists) {
      return response.status(409).json({ error: { message: 'Email is already registered' } })
    }

    const user = await User.create(data)
    const token = await auth
      .use('api')
      .attempt(data.email, data.password, { expiresIn: '30mins', name: user?.serialize().email })

    return response.created({ user, token })
  }

  public async index({ response, auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    const user = await User.findByOrFail('id', id)

    return response.ok(user)
  }

  public async update({ request, auth, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    const user = await User.findByOrFail('id', id)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    await request.validate(UpdateUserValidator)

    const data = request.only(['name', 'email', 'password'])

    await user.merge(data)

    await user.save()

    return response.ok(user)
  }

  public async delete({ response, auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    const user = await User.findByOrFail('id', id)

    await user.delete()

    return response.noContent()
  }
}
