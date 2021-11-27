import nextConnect from "next-connect";
import middleware from "../../../../../middleware/database";

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
  let client = req.db;
  const { collectionName, srcNftId, destNftId } = req.query;

  let graph = await client
    .collection(collectionName)
    .find({}, { projection: { _id: 0, id: 1, "data.connections": 1 } })
    .toArray();
  let result = dijkstra(graph, srcNftId, destNftId);
  res.status(200).json(result);
});

const dijkstra = (graph, srcNftId, destNftId) => {
  // Construct Adjacency List from Graph
  let adjList = {};
  graph.map((node) => {
    adjList[node.id] = node.data.connections;
  });
  // Initialize variables
  let pq = new PriorityQueue();
  let distance = {};
  let previous = {};
  for (const [key, value] of Object.entries(adjList)) {
    previous[key] = -1;
    distance[key] = Number.MAX_SAFE_INTEGER;
    pq.push({ vertex: key, weight: value.weight });
  }
  pq.push({ vertex: srcNftId, weight: 0 });
  distance[srcNftId] = 0;
  // Dijkstra's Algorithm
  while (!pq.empty()) {
    let u = pq.pop().vertex;
    for (let i = 0; i < adjList[u].length; i++) {
      let v = adjList[u][i].id;
      let w = adjList[u][i].weight;
      if (distance[u] + w < distance[v]) {
        distance[v] = distance[u] + w;
        previous[v] = u;
        pq.push({ vertex: v, weight: distance[v] });
      }
    }
  }
  // Return shortest path
  let current = destNftId;
  let path = [destNftId];
  while (previous[current] != srcNftId) {
    path.push(previous[current]);
    current = previous[current];
  }
  path.push(srcNftId);
  return { shortestPath: path, distance: distance[destNftId] };
};

class PriorityQueue {
  // Custom Implementation of Priority Queue
  // Underlying implementation uses a min heap
  constructor(comp = (w1, w2) => w1 < w2) {
    this.data = Array();
    this.comp = comp;
  }

  size() {
    return this.data.length;
  }

  empty() {
    return this.size() === 0;
  }

  push(value) {
    this.data.push(value);
    this.heapifyUp();
  }

  pop() {
    let ret = this.data[0];
    this.data[0] = this.data[this.size() - 1];
    this.data.pop();
    this.heapifyDown();
    return ret;
  }

  heapifyDown() {
    let index = 0;
    let size = this.size();
    while (index < size) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let minIndex = index;
      if (
        leftChild < size &&
        this.comp(this.data[leftChild].weight, this.data[minIndex].weight)
      ) {
        minIndex = leftChild;
      }
      if (
        rightChild < size &&
        this.comp(this.data[rightChild].weight, this.data[minIndex].weight)
      ) {
        minIndex = rightChild;
      }
      if (minIndex == index) {
        break;
      }
      let tmp = this.data[minIndex];
      this.data[minIndex] = this.data[index];
      this.data[index] = tmp;
      index = minIndex;
    }
  }

  heapifyUp() {
    let index = this.size() - 1;
    while (index > 0) {
      let parent = Math.floor((index - 1) / 2);
      if (this.comp(this.data[index].weight, this.data[parent].weight)) {
        let temp = this.data[parent];
        this.data[parent] = this.data[index];
        this.data[index] = temp;
        index = parent;
      } else {
        break;
      }
    }
  }
}

export default handler;
