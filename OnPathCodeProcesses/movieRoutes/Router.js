const express=require('express')

const MoviesRouter=express.Router()
MoviesRouter.route('/')
            .get(getAllMovies)
            .post(postMovie)
MoviesRouter.route('/:id')
            .get(get_a_Movie)
            .patch(update_a_Movie)
            .delete(deleteMovie)

module.exports=MoviesRouter