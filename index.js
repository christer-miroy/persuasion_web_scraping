const fs = require('fs');
const puppeteer = require('puppeteer');

async function scrapeDataFromPage(page) {
    const data = await page.evaluate(() => {
        const root = Array.from(document.querySelectorAll('.product-item'));
        let id = 0;
        const products = root.map(product => ({
            id: ++id,
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

    return data;
}

async function scrollInfinitely(page) {
    let data = [];
    let scrolling = true;
    while (scrolling) {
        const newData = await scrapeDataFromPage(page);
        data = data.concat(newData);
        scrolling = await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight;
            window.scrollBy(0, scrollHeight);
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(window.innerHeight + window.scrollY >= scrollHeight);
                }, 3000);
            });
        });
    }
    return data;
}

async function main() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://ecommerce.datablitz.com.ph/collections/pc-mac?pf_t_categories=Laptops');

        const data = await scrollInfinitely(page);

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
        process.exit(1);
    }
}

main();