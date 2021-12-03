import nextConnect from "next-connect";
import middleware from "../../../../middleware/database";

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
  let client = req.db;
  const { collectionName, nftId } = req.query;

  let graph = await client
    .collection(collectionName)
    .find({}, { projection: { _id: 0, id: 1, "data.connections": 1 } })
    .toArray();

  if (bfs(graph, nftId)) {
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

const bfs = (graph, searchId) => {
  // Construct Adjacency List from Graph
  let adjList = {};
  graph.map((node) => {
    adjList[node.id] = node.data.connections;
  });
  // Initialize variables
  let seen = new Set();
  let next = [];
  // Perform BFS
  for (let i = 0; i < graph.length; i++) {
    if (!seen.has(graph[i].id)) {
      seen.add(graph[i].id);
      next.push(graph[i].id);
    } else {
      continue;
    }
    while (next.length != 0) {
      let nodeId = next.shift();
      if (nodeId == searchId) {
        return true;
      }
      if (adjList[nodeId]) {
        adjList[nodeId].forEach((connection) => {
          if (!seen.has(connection.id)) {
            seen.add(connection.id);
            next.push(connection.id);
          }
        });
      }
    }
  }
  return false;
};

export default handler;
