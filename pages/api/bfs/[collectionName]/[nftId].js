import nextConnect from "next-connect"
import middleware from "../../../../middleware/database"
import { Queue } from "@datastructures-js/queue"

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  let client = req.db
  const { collectionName, nftId } = req.query

  let exists = await bfs(client.collection(collectionName), nftId)
  
  if (exists) {
    let doc = await client
      .collection(collectionName)
      .findOne(
        { id: nftId },
        { projection: { _id: 0, id: 1, "data.image_url": 1 } }
      ); 
    res.status(200).json(doc);
  } else {
    res.status(400).json({ id: nftId, url: "URL NOT FOUND" });
  }
})

/**
 * Updated to utilize mongo instead of querying all nodes and then building an array.
 * Should initially be a lot faster. 
 */
const bfs = async (client, target) => {
  // Initialize variables
  let q = Queue.fromArray([])
  let seen = new Set()
  let count = await client.count()

  for (let i = 0; i < count; i++) {
    // if we're just starting out, just get the first time in mongo.
    // otherwise, check if there's any more nodes to query that we
    // haven't visited. if so, do bfs again. otherwise we're done.
    if (!seen.size) {
      let first = await client.findOne(
        {},
        {
          projection: { id: 1 },
        }
      )
      q.enqueue(first.id)
      seen.add(first.id)
    } else {
      let another = await client.findOne(
        { id: { $nin: Array.from(seen) } },
        { projection: { id: 1 } }
      )
      if (another) {
        q.enqueue(another.id)
        seen.add(another.id)
      }
    }

    // Perform BFS
    while (q.size() != 0) {
      let nodeId = q.front()
      q.dequeue()

      if (nodeId == target) {
        return true
      }

      // get query the current node with it's connections
      let node = await client.findOne(
        { id: nodeId },
        { projection: { id: 1, "data.connections.id": 1 } }
      )
      
      node.data.connections.forEach((connection) => {
        if (!seen.has(connection.id)) {
          seen.add(connection.id)
          q.enqueue(connection.id)
        }
      })
    }
  }
  return false
}

export default handler
