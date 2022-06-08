import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/create', 'UsersController.create')
  Route.group(() => {
    Route.get('/account', 'UsersController.index')
    Route.put('/update', 'UsersController.update')
    Route.delete('/delete', 'UsersController.delete')
  }).middleware('auth')
}).prefix('/user')
