module.exports = function (app) {
    app.use('/', require('./blog.routes')());
}
    