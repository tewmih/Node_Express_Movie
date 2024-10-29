const express=require('express')
// const MoviesRouter=require('../Routs/Router')  //version one
const MoviesRouter=require('../Routs/RouterV2')


const app=express()
app.use(express.json())

app.use('/api/v1/movies',MoviesRouter)

app.listen(6003,'localhost',()=>{
    console.log('server is running...')
})

// for memorial purpose only

// functions

// ApI-ies

    // app.get('/api/v1/movies',getAllMovies)
    // app.get('/api/v1/movies/:id',get_a_Movie)
    // app.patch('/api/v1/movies/:id',update_a_Movie)
    // app.post('/api/v1/movies',postMovie)
    // app.delete('/api/v1/movies/:id',deleteMovie)

// shorthand form of the above API-ies

// app.route('/api/v1/movies')
//          .get(getAllMovies)
//          .post(postMovie)
// app.route('/api/v1/movies/:id')
//          .get(get_a_Movie)
//          .patch(update_a_Movie)
//          .delete(deleteMovie)




//  using a middleware