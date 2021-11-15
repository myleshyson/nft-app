// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import nextConnect from "next-connect"
import middleware from "../../middleware/database"

const handler = nextConnect()

handler.use(middleware)

handler.get(async (req, res) => {
  let client = req.db
  let doc = await client.collection('nfts').findOne()
  res.status(200).json(doc)
})

export default handler
