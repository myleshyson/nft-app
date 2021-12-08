import nextConnect from "next-connect";
import middleware from "../../../../../middleware/database";
import { MinPriorityQueue } from "@datastructures-js/priority-queue";
const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
  let client = req.db;
  const { collectionName, srcNftId, destNftId } = req.query;

  // query items in collection so we can initilaze d[v] and p[v]
  let items = await client
    .collection(collectionName)
    .find({}, { projection: { id: 1, 'data.image_url': 1} })
    .toArray()
   

  let result = await dijkstra(client.collection(collectionName), items, srcNftId, destNftId); 
  let nodes = await client.collection(collectionName).find({id: {$in: result.shortestPath}}).toArray()

  nodes.forEach(node => {
    result.image_urls.push(node.data.image_url)
  })
  
  res.status(200).json(result);
});

const dijkstra = async (client, items, srcNftId, destNftId) => {
  // Initialize variables
  let pq = new MinPriorityQueue({ priority: (node) => node.weight });
  // let pq = new PriorityQueue();
  let distance = {};
  let previous = {};

  items.forEach(item => {
    previous[item.id] = -1;
    distance[item.id] = Number.MAX_SAFE_INTEGER;
  })

  pq.enqueue({ vertex: srcNftId, weight: 0 });
  distance[srcNftId] = 0;
  // Dijkstra's Algorithm
  while (!pq.isEmpty()) {
    let u = pq.dequeue().element.vertex;
    
    // we reached the node, no need to continue with the algorithm
    if (u == destNftId) {
      break;
    }

    let node = await client.findOne(
      {id: u},
      {projection: { 'data.connections': 1} }
    )
    
    node.data.connections.forEach(item => {
      let v = item.id;
      let w = item.weight;
      if (distance[u] + w < distance[v]) {
        distance[v] = distance[u] + w;
        previous[v] = u;
        pq.enqueue({ vertex: v, weight: distance[v] });
      }
    })
  }

  // Return shortest path
  let current = destNftId;
  let path = [destNftId];

  while (previous[current] != srcNftId) {
    path.push(previous[current]);
    current = previous[current];
  }
  path.push(srcNftId);
  return { shortestPath: path, distance: distance[destNftId], image_urls: [] };
};

class PriorityQueue {
  // Custom Implementation of Priority Queue
  // Underlying implementation uses a min heap
  constructor(comp = (w1, w2) => w1 < w2) {
    this.data = [];
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
