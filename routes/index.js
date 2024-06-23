const userRouter = require('./user');
const tourRouter = require('./tour');
const {notFound, errHandler} = require('../middlewares/errHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/tour', tourRouter);


    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;
