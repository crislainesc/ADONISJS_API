import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/create', 'GamesController.create')
  Route.get('/list', 'GamesController.index')
  Route.put('/update/:id', 'GamesController.update')
  Route.delete('/delete/:id', 'GamesController.delete')
})
  .prefix('/games')
  .middleware('auth')
