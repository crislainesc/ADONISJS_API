/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import 'App/Modules/Users/routes'
import 'App/Modules/Games/routes'
import 'App/Modules/Bets/routes'

Route.post('/login', 'AuthController.login')

Route.get('/list', 'CartsController.index').prefix('cart').middleware('auth')
Route.post('/create', 'CartsController.create')
  .prefix('cart')
  .middleware('auth')
  .middleware('accessProfileVerify')
