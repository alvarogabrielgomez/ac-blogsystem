const Article = require('../entities/articles/models/article.model');
const BlogSystem = require('../entities/blogSystem/core');
const blogSystem = new BlogSystem();

module.exports = function () {
    var developmentMode = process.env.NODE_ENV == 'production' ? false : true;
    class BlogController {
        index(req, res) {
            return res.render('index');
        }

        async article(req, res) {
            try {
                const articleTitle = req.params.articleTitle;
                const article = await blogSystem.readPage(articleTitle);
                return res.render('articles', article);
            } catch(e){
                return res.status(e.statusCode).send(e.message);
            }
        }
    
    }

    return new BlogController();
}