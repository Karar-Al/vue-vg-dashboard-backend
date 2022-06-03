const xml2js = require('xml2js')
const fetch = require('got').default

const SVTRSSURL = "https://www.svt.se/nyheter/rss.xml"

async function getNews(callback) {
  const res = fetch(SVTRSSURL)

  const xml = await res.text()

  xml2js.parseString(xml, (err, res) => {
    if (err) {
      console.error(err)
      return
    }

    callback(res.rss.channel[0].item.map(article => ({
      title: article.title[0],
      link: article.link[0],
      description: article.description[0],
      pubDate: article.pubDate[0],
    })))
  })
}

module.exports = { getNews }
