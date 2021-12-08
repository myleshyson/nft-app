const NFTWinner = ({winner, setProgress, setWinner, setIsStarted, setCollection, setNfts, nfts, onRestart}) => {
    if (winner == -1) {
      return <div className="text-center">There was a tie...</div>
    } else {
      return (
        <div className="versus">
          <figure>
            <img
              className="border-2 border-black mx-auto my-4"
              src={nfts[winner].data.image_url}
            ></img>
            <figcaption>
              Wins!
            </figcaption>
          </figure>
          <button className="block mx-auto my-2 border-2 p-2 border-black" onClick={onRestart}>Go Again?</button>
        </div>
      )
    }
  }

  export default NFTWinner