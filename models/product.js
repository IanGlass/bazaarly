const fs = require('fs');
const path = require('path');

const getProductsFromFile = cb => {
    fs.readFile(p, (error, fileContent) => {
        // If there is an error, prevent server from breaking
        if (error) {
            return cb([]);
        }
        cb(JSON.parse(fileContent));
    })
};

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data', 
    'products.json'
);

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.id = Math.random().toString();
    }

    save () {
        getProductsFromFile(products => {
            products.push({
                title: this.title, 
                imageUrl: this.imageUrl,
                price: this.price,
                description: this.description,
                id: this.id,
            });
            fs.writeFile(p, JSON.stringify(products), (error) => {
                if (error) {
                    console.log(error);
                }
            });
        })
    }

    static fetchAll (cb) {
        getProductsFromFile(cb);
    }

    static getById (id, cb) {
        getProductsFromFile (products => {
            const product = products.find(product => product.id === id);
            cb(product);
        })
    }
}