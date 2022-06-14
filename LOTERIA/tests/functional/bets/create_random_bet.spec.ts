import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Bets create random bets', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should be possible to create a new bet if the minimum cart value is reached', async ({
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

    await client.put('/user/update').bearerToken(token).form({
      access_profile: 'admin',
    })

    const game = await client.post('/games/create').bearerToken(token).form({
      type: 'Mega-Sena',
      description:
        'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
      range: 60,
      price: 5,
      max_number: 6,
      color: '#01AC66',
    })

    const { id } = JSON.parse(game.response.text)

    await client.post('/cart/create').bearerToken(token).form({
      min_cart_value: 10,
    })

    await client.get('/cart/list').bearerToken(token)

    const random_numbers = Array.from({ length: 6 }).map((_) => Math.floor(Math.random() * 60))

    const bets = await client
      .post('/bets/create')
      .bearerToken(token)
      .form({
        bets: [
          {
            game_id: id,
            numbers: random_numbers,
          },
          {
            game_id: id,
            numbers: random_numbers,
          },
        ],
      })

    assert.equal(bets.response.statusCode, 201)
  })

  test('it should not be possible to create a new bet if the minimum cart value not is reached', async ({
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

    await client.put('/user/update').bearerToken(token).form({
      access_profile: 'admin',
    })

    const game = await client.post('/games/create').bearerToken(token).form({
      type: 'Mega-Sena',
      description:
        'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
      range: 60,
      price: 5,
      max_number: 6,
      color: '#01AC66',
    })

    const { id } = JSON.parse(game.response.text)

    await client.post('/cart/create').bearerToken(token).form({
      min_cart_value: 10,
    })

    await client.get('/cart/list').bearerToken(token)

    const random_numbers = Array.from({ length: 6 }).map((_) => Math.floor(Math.random() * 60))

    const bets = await client
      .post('/bets/create')
      .bearerToken(token)
      .form({
        bets: [
          {
            game_id: id,
            numbers: random_numbers,
          },
        ],
      })

    assert.equal(bets.response.statusCode, 400)
  })
})
