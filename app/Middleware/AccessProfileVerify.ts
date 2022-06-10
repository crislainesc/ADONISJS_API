import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AccessProfileVerify {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    const { access_profile } = await auth.use('api').authenticate()

    if (access_profile !== 'admin') {
      return response.notImplemented({
        message: 'This functionality requires an administrative access profile',
      })
    }

    await next()
  }
}
