import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Users create', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should be possible create a new user when send all parameters', async ({
    client,
    assert,
  }) => {
    const user = await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    assert.equal(user.response.statusCode, 201)
  })

  test('it should not be possible to create a new user when parameters are missing', async ({
    client,
    assert,
  }) => {
    const user = await client.post('/user/create').form({
      name: 'Teste',
    })

    assert.equal(user.response.statusCode, 422)
  })

  test('it should not be possible to create user with invalid email', async ({
    client,
    assert,
  }) => {
    const user = await client.post('/user/create').form({
      name: 'Teste',
      email: 'invalid email',
      password: 'teste',
    })

    assert.equal(user.response.statusCode, 422)
  })

  test('it should not be possible to register two users with the same email', async ({
    client,
    assert,
  }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const user = await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    assert.equal(user.response.statusCode, 409)
  })
})
