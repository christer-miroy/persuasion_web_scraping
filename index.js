    const fs = require('fs');
    const puppeteer = require('puppeteer');

    async function main() {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://ecommerce.datablitz.com.ph/collections/pc-mac');
           
            data = await page.evaluate(() => {
                root = Array.from(document.querySelectorAll('.product-item'));
                products = root.map(product => ({
                    name: product.querySelector('.product-item__title').textContent,
                    price: product.querySelector('.money').textContent,
                    imageURL: product.querySelector('img').src
                }));

                return products;
            });

            // data validation
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Data not found');
            }

            console.log(data);

            // Write data to JSON file
            fs.writeFile('products.json', JSON.stringify(data), (err) => {
                if (err) {
                    throw err;
                }
                console.log('JSON data is saved.');
            });

            await browser.close();
        } catch (error) {
            console.log('Error has occurred: ', error.message);
        }
    }

    main();