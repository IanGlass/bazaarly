const fs = require('fs');
const path = require('path')

const products2 = []

module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        const p = path.join(
            path.dirname(process.mainModule.filename), 
            'data', 
            'products.json'
        );
        const products = []
        fs.readFile(p, (error, fileContent) => {
            if (!error) {
                console.log(JSON.parse(fileContent))
                products.push(JSON.parse(fileContent));
                products.push({title: this.title});
                console.log(products)
                fs.writeFile(p, JSON.stringify(products), (error) => {
                    if (error) {
                        console.log(error);
                    }
                });
            }
            else {
                console.log(error);
            }
        });
        // products.push(this);

    }

    static fetchAll() {
        return products2;
    }
}