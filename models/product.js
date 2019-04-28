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
    constructor(id, title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.id = id;
    }

    // Save will either save a new product and generate a unique id or overwrite an existing product from an id
    save () {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(product => this.id === product.id);
                const updatedProducts = [ ...products];
                // Update the found product with all the new product details
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), (error) => {
                    console.log(error);
                });
            }
            else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (error) => {
                    console.log(error);
                });
            }
        })
    }

    static fetchAll (cb) {
        getProductsFromFile(cb);
    }

    static getByID (id, cb) {
        getProductsFromFile(products => {
            const product = products.find(product => product.id === id);
            cb(product);
        });
    }

    static deleteByID (id, cb) {
        getProductsFromFile(products => {
            products = products.filter(product => product.id !== id);
            fs.writeFile(p, JSON.stringify(products), (error) => {
                console.log(error);
                cb();
            });
        });
    }
}