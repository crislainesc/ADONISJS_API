import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'

import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserPasswordValidator from 'App/Validators/UpdateUserPasswordValidator'
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

    await Mail.sendLater((message) => {
      message
        .from('labylub@labluby.com.br')
        .to(user.email)
        .subject('Welcome Onboard!')
        .htmlView('emails/welcome', {
          user: { fullName: user.name },
        })
    })

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

  public async reset({ request, response }: HttpContextContract) {
    await request.validate(UpdateUserPasswordValidator)

    const data = request.only(['email', 'old_password', 'new_password'])

    const user = await User.findByOrFail('email', data.email)

    const passwordsMatch = await Hash.verify(user.password, data['old_password'])

    if (!passwordsMatch) {
      return response.badRequest({ message: 'Old password does not match' })
    }

    await user.merge({ password: data['new_password'] })

    await user.save()

    await Mail.sendLater((message) => {
      message
        .from('labylub@labluby.com.br')
        .to(user.email)
        .subject('Password Reseted!')
        .htmlView('emails/reset_password')
    })

    return response.ok({ message: 'Password reset with successfuly.' })
  }
}
