const axiosRetry = require("axios-retry")
const collections = require("./collections")
const axios = require("axios")
const fs = require("fs")
const { off } = require("process")

const api_url = "https://api.opensea.io/api/v1/assets?order_direction=desc"
axiosRetry(axios, { retries: 5, retryDelay: () => 500 })

const parseNft = (nft) => {
  let id = nft.token_id.toString()
  let obj = {
    image_url: nft.image_url,
    traits: nft.traits.map((trait) => {
      return {
        trait_type: trait.trait_type,
        value: trait.value,
        rarity: trait.trait_count,
      }
    }),
    connections: [],
  }
  return obj
}

const getData = async ({ collection_name, collection_size }) => {
  // Generate urls for requests
    let offset = 0
    console.log(`Building ${collection_name}..`)
    let content = {}

    for (let index = 0; index < collection_size / 50; index++) {
      let res = await axios.get(`https://api.opensea.io/api/v1/assets?collection=${collection_name}&limit=50&offset=${offset}`)
      let {assets} = await res.data
      for (const asset of assets) {
        content[asset.token_id] = parseNft(asset)
      }
      offset += 50
    }
    console.log('yoyo')
    fs.writeFileSync(`raw/${collection_name}.json`, JSON.stringify(content, null, 2), {flag: 'w+', encoding: 'utf-8'})
}

/*
  For each defined collection, create a json file if it doesn't exisit, <collection_name>.json,
  and synchrounously add all collection assets to that file.
*/
async function run() {
  await getData(collections.options[6])
}

run()