class Article {
    constructor(title, description, createdAt, author, category, content) {
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.author = author;
        this.category = category;
        this.content = content;
        this.slug;
    }

    /**
    * Returns an instance of Article with the parsed content loaded into it.
    * @param {object} parsedContent        A object with the markdown content parsed with the yaml-front-matter.
    */
    load(parsedContent) {
        this.title = parsedContent.title || '';
        this.description = parsedContent.description || '';
        this.createdAt = parsedContent.createdAt ? parsedContent.createdAt.toLocaleDateString() : '';
        this.author = parsedContent.author || '';
        this.category = parsedContent.category || '';
        this.tags = parsedContent.tags ? (parsedContent.tags.length > 0 ? parsedContent.tags : []) : []
        this.heroimage = parsedContent.heroimage || ''
        this.content = parsedContent.__content || ''; 
        this.slug = parsedContent.slug;
        
        return this;
    }
}

module.exports = Article;