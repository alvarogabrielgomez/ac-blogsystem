const Article = require('../entities/articles/models/article.model');
const BlogSystem = require('../entities/blogSystem/core');
const blogSystem = new BlogSystem();

module.exports = function () {
    var developmentMode = process.env.NODE_ENV == 'production' ? false : true;
    class BlogController {
        index(req, res) {
            return blogSystem.renderTheme(res, 'index');
        }

        async article(req, res) {
            try {
                const slug = req.params.slug;
                const articlePath = await blogSystem.findArticle(slug);
                const article = new Article()
                    .load(await blogSystem.readArticle(articlePath, slug));
            
                const adasd = await blogSystem.getPosts();
                return blogSystem.renderTheme(res, 'articles', article);
            } catch(e){
                return res.status(e.statusCode).send(e.message);
            }
        }
    
    }

    return new BlogController();
}