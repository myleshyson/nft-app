import nextConnect from "next-connect";
import middleware from "../../../../middleware/database";
import { Stack } from "@datastructures-js/stack";
const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
  let client = req.db;
  const { collectionName, nftId } = req.query;

  if (dfs(client.collection(collectionName), nftId)) {
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
});

/**
 * Updated to utilize mongo instead of querying all nodes and then building an array.
 * Should initially be a lot faster. 
 */
const dfs = async (client, target) => {
  // Initialize variables
  let s = Stack.fromArray([])
  let seen = new Set()
  let count = await client.count()

  for (let i = 0; i < count; i++) {
    // if we're just starting out, just get the first time in mongo.
    // otherwise, check if there's any more nodes to query that we
    // haven't visited. if so, do dfs again. otherwise we're done.
    if (!seen.size) {
      let first = await client.findOne(
        {},
        {
          projection: { id: 1 },
        }
      )
      s.push(first.id)
      seen.add(first.id)
    } else {
      let another = await client.findOne(
        { id: { $nin: seen.toArray() } },
        { projection: { id: 1 } }
      )
      if (another) {
        s.push(another.id)
        seen.add(another.id)
      }
    }

    // Perform DFS
    while (s.size() != 0) {
      let nodeId = s.peek()
      s.pop()

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
          s.push(connection.id)
        }
      })
    }
  }
  return false
}

export default handler;
