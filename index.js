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

const fetchArticles = async (newspaper) => {
    try {
        const response = await axios.get(newspaper.address);
        const html = response.data;
        const $ = cheerio.load(html);

        const articles = [];
        $('a:contains("climate")', html).each(function () {
            const title = $(this).text().replace(/[\t\n]/g, '');
            const url = $(this).attr('href');
            articles.push({
                source: newspaper.name,
                title,
                url: newspaper.base + url
            });
        });

        return articles;
    } catch (err) {
        console.error(err);
        return [];
    }
};

app.get('/', (req, res) => {
    res.json('Welcome to Climate Change News API');
});

app.get('/news', async (req, res) => {
    let articles = [];
    for (const newspaper of newspapers) {
        const newspaperArticles = await fetchArticles(newspaper);
        articles = articles.concat(newspaperArticles);
    }
    res.json(articles);
});

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId);
    if (!newspaper) {
        return res.status(404).json({ error: 'Newspaper not found' });
    }

    const specificArticles = await fetchArticles(newspaper);
    res.json(specificArticles);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
