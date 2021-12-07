const NFTWinner = ({winner, setProgress, nfts}) => {
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
          <button className="block mx-auto my-2 border-2 p-2 border-black" onClick={() => {
            setProgress({
              level1: true,
              level2: false,
              level3: false,
              level4: false,
              level5: false
            })
          }}>Go Again?</button>
        </div>
      )
    }
  }

  export default NFTWinner