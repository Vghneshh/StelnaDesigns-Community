const axios = require('axios')
const { detectFileTypes } = require('./scraper')

const THINGIVERSE_TOKEN = process.env.THINGIVERSE_TOKEN

async function searchThingiverse(query) {
  try {
    const response = await axios.get(
      `https://api.thingiverse.com/search/${encodeURIComponent(query)}`,
      {
        params: {
          type: 'things',
          per_page: 6,
          sort: 'relevant',
        },
        headers: {
          Authorization: `Bearer ${THINGIVERSE_TOKEN}`
        },
        timeout: 8000,
      }
    )

    const hits = response.data.hits || []

    const results = hits.map(thing => {
      const title = thing.name || ''
      const description = thing.description
        ? thing.description.replace(/<[^>]*>/g, '').trim().slice(0, 300)
        : `Tagged: ${thing.tags?.map(t => t.name).join(', ') || ''}`
      return {
        title,
        description,
        imageUrl: thing.preview_image || thing.thumbnail || null,
        url: thing.public_url || `https://www.thingiverse.com/thing:${thing.id}`,
        source: 'thingiverse.com',
        author: thing.creator?.name || null,
        fileTypes: detectFileTypes({ title, description }),
        downloads: thing.download_count || 0,
      }
    })

    console.log(`[Thingiverse API] ${results.length} results for "${query}"`)
    return results

  } catch (err) {
    console.log(`[Thingiverse API error] ${err.message}`)
    return []
  }
}

module.exports = { searchThingiverse }