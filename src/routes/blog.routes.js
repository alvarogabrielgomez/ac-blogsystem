module.exports = function () {
    const express = require('express');
    const BlogController = require('../controllers/blog.controller')();
    const router = express.Router();

    router
        .get('/', BlogController.index)
        .get('/:articleTitle', BlogController.article)
        // .post('/', BlogController.create)
        // .get('/', BlogController.getAll)
        // .get('/:item_id', BlogController.getItem)
        // .delete('/:item_id', BlogController.delete)
        // .put('/:item_id', BlogController.update)

    return router;
}