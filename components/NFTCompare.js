import Loading from "./Loading"
import { useState } from "react"

const NFTCompare = ({ onSubmit, afterSubmit, className, nfts }) => {
    const [loading, setLoading] = useState(false)
    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      await onSubmit(e).then((result) => {
        afterSubmit(e)
      })
      setLoading(false)
    }
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="versus flex justify-around items-center mb-4">
          <figure>
            <img
              className="border-2 border-black"
              src={nfts[0].data.image_url}
            ></img>
            <figcaption>{nfts[0].id}</figcaption>
          </figure>
          <img src="/vs.png"></img>
          <figure>
            <img
              className="border-2 border-black"
              src={nfts[1].data.image_url}
            ></img>
            <figcaption>{nfts[1].id}</figcaption>
          </figure>
        </div>
        <div className="text-center">
          <button className="border-2 p-2 border-black">Go</button>
        </div>
        {loading && <Loading />}
      </form>
    )
  }

  export default NFTCompare