const fs = require('fs');
const path = require('path')

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data', 
    'products.json'
);

module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        fs.readFile(p, (error, fileContent) => {
            let products = [];
            if (!error) {
                products = JSON.parse(fileContent);
            }
            products.push({title: this.title});
            fs.writeFile(p, JSON.stringify(products), (error) => {
                if (error) {
                    console.log(error);
                }
            });
        });
    }

    static fetchAll(cb) {
        fs.readFile(p, (error, fileContent) => {
            // If there is an error, prevent server from breaking
            if (error) {
                cb([]);
            }
            cb(JSON.parse(fileContent));
        })
    }
}