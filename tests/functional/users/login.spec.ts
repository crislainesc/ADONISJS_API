import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Users login', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should be possible to authenticate user', async ({ client, assert }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const login = await client.post('/login').form({
      email: 'teste@email.com',
      password: 'teste',
    })

    assert.equal(login.response.statusCode, 200)
  })

  test('it should not be possible to authenticate user with invalid credentials', async ({
    client,
    assert,
  }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const login = await client.post('/login').form({
      email: 'teste@email.com',
      password: 'invalidpassword',
    })

    assert.equal(login.response.statusCode, 400)
    assert.equal(login.response.text, 'Invalid credentials')
  })
})
