import Loading from "./Loading"
import NotFound from './NotFound'
import { useState } from "react"

const NFTForm = ({ label, onSubmit, afterSubmit, className }) => {
  const [loading, setLoading] = useState(false)
  const [notfound, setNotFound] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotFound(false)
    setLoading(true)
    await onSubmit(e).then(
      (result) => {
        afterSubmit(e)
      },
      function (error) {
        setNotFound(true)
      }
    )
    setLoading(false)
  }
  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="nft-id" className="m">
        {label}
      </label>
      <div className="flex">
        <input
          type="text"
          name="nft-id"
          placeholder="NFT ID"
          className="block border-2 border-black p-3 mr-2"
        />
        <button className="border-2 p-2 border-black">Search</button>
      </div>
      {loading && <Loading />}
      {notfound && <NotFound />}
    </form>
  )
}

export default NFTForm