import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Games crud', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should be possible create a new game', async ({ client, assert }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const login = await client.post('/login').form({
      email: 'teste@email.com',
      password: 'teste',
    })

    const { token } = JSON.parse(login.response.text).token

    await client.put('/user/update').bearerToken(token).form({
      access_profile: 'admin',
    })

    const game = await client.post('/games/create').bearerToken(token).form({
      type: 'Mega-Sena',
      description:
        'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
      range: 60,
      price: 4.5,
      max_number: 6,
      color: '#01AC66',
    })

    assert.equal(game.response.statusCode, 201)
  })

  test('it should be possible to view all games', async ({ client, assert }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const login = await client.post('/login').form({
      email: 'teste@email.com',
      password: 'teste',
    })

    const { token } = JSON.parse(login.response.text).token

    await client.put('/user/update').bearerToken(token).form({
      access_profile: 'admin',
    })

    const game = await client.get('/games/list').bearerToken(token)

    assert.equal(game.response.statusCode, 200)
  })

  test('it should be possible update a game', async ({ client, assert }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const login = await client.post('/login').form({
      email: 'teste@email.com',
      password: 'teste',
    })

    const { token } = JSON.parse(login.response.text).token

    await client.put('/user/update').bearerToken(token).form({
      access_profile: 'admin',
    })

    const game = await client.post('/games/create').bearerToken(token).form({
      type: 'Mega-Sena',
      description:
        'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
      range: 60,
      price: 4.5,
      max_number: 6,
      color: '#01AC66',
    })

    const { id } = JSON.parse(game.response.text)

    const updateGame = await client.put(`/games/update/${id}`).bearerToken(token).form({
      max_number: 5,
      color: '#77ccee',
    })

    assert.equal(updateGame.response.statusCode, 200)
  })

  test('it should be possible delete a game', async ({ client, assert }) => {
    await client.post('/user/create').form({
      name: 'Teste',
      email: 'teste@email.com',
      password: 'teste',
    })

    const login = await client.post('/login').form({
      email: 'teste@email.com',
      password: 'teste',
    })

    const { token } = JSON.parse(login.response.text).token

    await client.put('/user/update').bearerToken(token).form({
      access_profile: 'admin',
    })

    const game = await client.post('/games/create').bearerToken(token).form({
      type: 'Mega-Sena',
      description:
        'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
      range: 60,
      price: 4.5,
      max_number: 6,
      color: '#01AC66',
    })

    const { id } = JSON.parse(game.response.text)

    const deleteGame = await client.delete(`/games/delete/${id}`).bearerToken(token)

    assert.equal(deleteGame.response.statusCode, 204)
  })

  test('it should be possible create a new game if user not have admin access profile', async ({
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
      password: 'teste',
    })

    const { token } = JSON.parse(login.response.text).token

    await client
      .post('/games/create')
      .bearerToken(token)
      .form({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '#01AC66',
      })
      .catch((error) =>
        assert.include(error, 'This functionality requires an administrative access profile')
      )
  })
})
