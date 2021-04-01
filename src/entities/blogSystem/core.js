const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const fsReadFile = util.promisify(fs.readFile);
// const fsReaddir = util.promisify(fs.readdir);
const lineByLine = require('n-readlines');
const yamlFront = require('yaml-front-matter');
const hljs = require('highlight.js');
const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
        if(lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, {
                    language: lang
                }).value;
            } catch(e) {}
        }
        return ''; // use external default escaping
    }
  });
const Article = require('../articles/models/article.model');
const settingsFilePath = path.resolve(__dirname, './system.config.json');
const articlesPath = path.resolve(__dirname, '../../content');
const articleExt = 'md';

/**
* Core of BlogSystem
*
* Has all of BlogSystem Core funcionality
*
* @since      0.1.0
*/
class BlogSystem {
    /**
    * Return true if system setting exists
    * @param key           Setting key to verify if exists.
    */
    isSettingExists(key, settingsJson) {
        if(settingsJson.hasOwnProperty(key)){
            return true;
        }
        return false;
    }

    /**
    * It read a file and return its content, if do not exists return an empty string.
    * @param {string} filePath         The full path with the file name and extension.
    * @param {string} encode           The encode used to read the file, if empty it use utf8.
    */
    readFile(filePath, encode = 'utf8') {
        return new Promise(async (resolve, reject) => {
            let fileData = '';
            const exists = await fs.pathExists(filePath);
            if (exists) {
                fileData = await fsReadFile(filePath, encode);
            }
            resolve(fileData);
        });
    }

    /**
    * Save a file with the content passed, if not exist it will be created.
    * @param {string} filePath         The full path with the file name and extension.
    * @param {string} fileData         The data from the file.
    * @param {boolean} mkDir           If true creates the directory if do not exists. By default is false.
    */
    saveFile(filePath, fileData, mkDir = false) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = false;
                if (mkDir) {
                    await fs.ensureFile(filePath);
                }
                fs.open(filePath, 'w+', (openErr, file) => {
                    if (openErr) { throw new Error(openErr); }
                    let buff = Buffer.from(fileData),
                    pos = 0, offset = 0, len = buff.length;
                    // Llevar a 0 el archivo por si acaso
                    fs.ftruncate(file, 0, (ftErr) => { if (ftErr) { throw new Error(ftErr); } });
                    fs.write(file, buff, offset, len, pos, (writeErr, bytes, buff2) => {
                        if (writeErr) { throw new Error(writeErr)};
                        fs.close(file, () => {
                            result = true;
                        });
                    })
                });
                resolve(result);
            } catch(e) {
                throw e;
            }
        });
    }

    /**
    * Return a promise with a system setting from file
    * @param key           Setting key to return.
    */
    getSettings(key) {
        return new Promise(async (resolve, reject) => {
            const file = await this.readFile(settingsFilePath);
            const settings = file ? JSON.parse(file) : {};
            if (key) {
                if (settings.hasOwnProperty(key)){
                    resolve(settings[key]);
                }
                resolve('');
            }
            resolve(settings);
        });
    }

    mapToJSON(map) {
        let response;
        if (map instanceof Map) {
            const obj = Object.fromEntries(map);
            response = JSON.stringify(obj, null, 2);
        } else {
                throw new Error('Object not expected.');
        }
        return response;
    }

    JSONToMap(json) {
        let response;
        if(json && typeof json === 'string'){
            const jsonObj = JSON.parse(json);
            response = new Map(Object.fromEntries(map));
        } else {
                throw new Error('Object not expected.');
        }
        return response;
    }

        
    /**
    *  Parse a string from the md file to an object with the yaml front and the content
    *  @param {string} articleRaw         String from md file
    */
    parseMd(articleRaw) {
        let articleParsed = yamlFront.safeLoadFront(articleRaw)
        articleParsed.__content = md.render(articleParsed.__content);
        return articleParsed;
    }

    /**
    * Save user settings into a file and load into actual instance.
    * @param {object} settings         A object key => value with the settings.
    */
    saveSettings(settings) {
        return new Promise(async (resolve, reject) => {
            let settingsJSON = await this.getSettingFile();
            const settingsFilePath = this.system.settings.get('settingsFilePath');
            if (typeof settings === 'object') {
                for(const key of Object.keys(settings)) {
                    const value = settings[key];
                    settingsJSON[key] = value;
                }
                await this.saveFile(settingsFilePath, JSON.stringify(settingsJSON, null, 2), true);
                resolve({ message: `Setting saved in:\n ${settingsFilePath}` });
            }
            reject(new Error('Settings is not an object expected.'));
        });
    }

    /**
    *  Returns the dirent of article file if exists
    *  @param {string} slug         Slug of article to find
    */
     findArticle(slug) {
        return new Promise(async (resolve, reject) => {
            const path = `${articlesPath}/${slug}.${articleExt}`;
            await fs.access(path, fs.constants.F_OK, (err) => {
                if (err) {
                    reject({
                        statusCode: 404,
                        message: "Page not found"
                    });
                } 
                resolve(path);
            });
        });
    }

    readFrontArticle(slug) {
        return new Promise(async(resolve, reject) => {
            try {
                const path = await this.findArticle(slug);
                // read line by line until find tags and stop.
                const liner = new lineByLine(path);
                let line;
                let readingYaml = false;
                let readed = '';
                while (line = liner.next()) {
                    var lineString = line.toString('ascii') + '\n';
                    if (lineString.includes('---')) {
                        readed += lineString;
                        if (readingYaml) {
                            liner.close();
                        }
                        readingYaml = readingYaml ? false : true;
                    }
                    if (readingYaml && !lineString.includes('---')) {
                        readed += lineString;
                    }
                }
                const yamlParsed = this.parseMd(readed);
                console.log(yamlParsed);
                resolve(yamlParsed);

            } catch (e) {
                reject(e);
            }
        });
    }

    /**
    *  Read the article file, and return its content parsed
    *  @param {string} path         Path of article to read
    *  @param {string} slug         Slug of page
    *  @returns {object}            Returns an object loaded with the content
    */
    readArticle(path, slug) {
        return new Promise(async (resolve, reject) => {
            try {
                if (path) {
                    const articleRaw = await this.readFile(path);
                    // Parse Markdown and the metadata from yaml front
                    let articleParsed = this.parseMd(articleRaw);
                    // Load into articleParsed object the slug for SEO
                    articleParsed.slug = slug;
                    resolve(articleParsed);
                } else {
                    reject({
                        statusCode: 404,
                        message: 'Page not found.'
                    })
                }
        
            } catch (e){
                throw e;
            }
        })
    }

    /**
    *  Render the html view loaded with a payload using the setted theme from the system.config.json
    *  @param {Request} res         Request object from the Express Router
    *  @param {string}  route       Route to render
    *  @param {object}  payload     Object with the payload to pass it into view to render
    */
    async renderTheme(res, route, payload = null) {
        const themeSelected = await this.getSettings('theme');
        try {
            if (themeSelected) {
                const themePath = `${themeSelected}/views/${route}`;
                if (payload) {
                    return res.render(themePath, payload);
                } else {
                    return res.render(themePath);
                }
            } else {
                return res.status(500).send('Error getting theme settings.');
            }
        } catch(e) {     
            return res.status(500).send('Error rendering theme');
        }
    }

}

module.exports = BlogSystem;