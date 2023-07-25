const PORT = process.env.PORT || 8000; 
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const newspapers = [
    {
        name: 'theTimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    }
];

const articles = [];

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text().replace(/[\t\n]/g, ''); // Removing \t and \n characters from title
                const url = $(this).attr('href');
                articles.push({
                    source: newspaper.name,
                    title,
                    url: newspaper.base + url
                });
            });

        })
        .catch(err => console.error(err)); // Handle errors in the Axios request
});

app.get('/', (req, res) => {
    res.json('Welcome to Climate Change News API');
});

app.get('/news', (req, res) => {
    res.json(articles);
});

app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId;

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address;
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base;
    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const specificArticles = [];

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text().replace(/[\t\n]/g, ''); // Removing \t and \n characters from title
                const url = $(this).attr('href');
                specificArticles.push({
                    source: newspaperId,
                    title,
                    url: newspaperBase + url
                });
            });
            res.json(specificArticles);
        })
        .catch(err => console.log(err)); // Handle errors in the Axios request
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
