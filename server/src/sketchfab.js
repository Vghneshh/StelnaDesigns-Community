const axios = require('axios')

const SKETCHFAB_API_KEY = process.env.SKETCHFAB_API_KEY
const { detectFileTypes } = require('./utils')

async function searchSketchfab(query) {
  try {
    const response = await axios.get('https://api.sketchfab.com/v3/search', {
      params: {
        type: 'models',
        q: query,
        downloadable: true,
        count: 20,
        sort_by: '-relevance',
      },
      headers: {
        Authorization: `Token ${SKETCHFAB_API_KEY}`
      },
      timeout: 8000,
    })

    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2)
    const results = response.data.results
      .filter(model => {
        if (!model.name) return false
        const title = model.name.toLowerCase()
        const desc = (model.description || '').toLowerCase()
        return queryWords.some(word => title.includes(word) || desc.includes(word))
      })
      .map(model => {
        const title = model.name || ''
        const description = model.description
          ? model.description.replace(/<[^>]*>/g, '').trim().slice(0, 300)
          : null
        return {
          title,
          description,
          imageUrl: model.thumbnails?.images?.[0]?.url || null,
          url: model.viewerUrl || `https://sketchfab.com/models/${model.uid}`,
          source: 'sketchfab.com',
          author: model.user?.displayName || null,
          fileTypes: detectFileTypes({
            title,
            description,
            files: model.files || [],
          }),
          downloads: model.downloadCount || 0,
        }
      })

    console.log(`[Sketchfab API] ${results.length} results for "${query}"`)
    return results

  } catch (err) {
    console.log(`[Sketchfab API error] ${err.message}`)
    return []
  }
}

module.exports = { searchSketchfab }