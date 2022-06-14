import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/create', 'BetsController.create')
  Route.get('/list', 'BetsController.index')
  Route.group(() => {
    Route.put('/update/:id', 'BetsController.update')
    Route.delete('/delete/:id', 'BetsController.delete')
  }).middleware('accessProfileVerify')
})
  .prefix('/bets')
  .middleware('auth')
