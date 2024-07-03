const userRouter = require('./user');
const tourRouter = require('./tour');
const tourCategoryRouter = require('./tourCategory');
const bookingRouter = require('./booking');
const {notFound, errHandler} = require('../middlewares/errHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/tour', tourRouter);
    app.use('/api/tour-category', tourCategoryRouter);
    app.use('/api/booking', bookingRouter);


    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;
