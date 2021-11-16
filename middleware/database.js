
import { MongoClient } from "mongodb"
import nextConnect from "next-connect"

const client = new MongoClient('mongodb://root:secret@localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

MongoClient.prototype.isConnected = function(options) {
  options = options || {};
  if (!this.topology) return false;
  return this.topology.isConnected(options);
};

async function database(req, res, next) {
  if (!client.isConnected()) await client.connect()
  req.dbClient = client
  req.db = client.db('test')
  return next()
}

const middleware = nextConnect()
middleware.use(database)

export default middleware