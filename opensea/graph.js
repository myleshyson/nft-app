const collections = require("./collections")
const fs = require("fs")
const { MongoClient } = require("mongodb")
const { resolve } = require("path")

const createGraph = async ({ collection_name, collection_size }) => {
  let data = fs.readFileSync(`raw/${collection_name}.json`, 'utf-8')
  data = await JSON.parse(data)

  for (const key of Object.keys(data)) {
    // Current nft under consideration
    let current_id = key
    let current_traits = data[key].traits

    // Find all nft's with a single identical trait to current nft
    let filtered = Object.keys(data).filter(
      (element) =>
        element !== current_id &&
        data[element].traits.filter((trait) =>
          current_traits.some(
            (current_trait) =>
              current_trait.trait_type === trait.trait_type &&
              current_trait.value === trait.value
          )
        ).length !== 0
    )

    // Construct graph edges for current nft
    filtered.map((element) => {
      let edge = { id: 0, trait_type: "", weight: 0 }
      let traits = data[element].traits
      traits.map((trait) => {
        let matches = current_traits.filter(
          (current_trait) => current_trait.trait_type == trait.trait_type
        )

        if (matches.length !== 0) {
          let current_trait = matches[0]
          let weight = trait.rarity - current_trait.rarity

          if (weight > 0 && weight > edge.weight) {
            edge.id = element
            edge.trait_type = trait.trait_type
            edge.weight = weight
          }
        }
      })
      if (edge.weight !== 0) {
        data[current_id].connections.push(edge)
      }
    })
  }
  return uploadToMongo(collection_name, data).catch(console.error)
}

async function uploadToMongo(collection_name, data) {
  const uri = "mongodb://root:secret@localhost:27017"
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  try {
    console.log("trying to open...")
    await client.connect()
    console.log("opened! now adding" + " " + collection_name)
    await addData(client, collection_name, data)
    console.log("added!")
  } catch (e) {
    console.log(e)
  } finally {
    console.log("closed")
    await client.close()
  }
}

async function addData(client, collection_name, data) {
  let formatted_data = Object.keys(data).map((key) => {
    let obj = { id: key }
    obj["data"] = data[key]
    return obj
  })
  const result = await client
    .db("nft")
    .collection(collection_name)
    .insertMany(formatted_data)
}

async function run() {
  for (const collection of collections.options) {   
    console.log("ehy")
    await createGraph(collection)
  }
}

run()
