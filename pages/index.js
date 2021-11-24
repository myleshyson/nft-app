import Head from "next/head"
import Image from "next/image"
import { motion } from "framer-motion"
import styles from "../styles/Home.module.css"
import { Fragment, useState, useRef, useEffect } from "react"

/**
 * Animation variants for title and start button
 *
 * @link https://www.framer.com/docs/animation/#variants
 */
const variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visibile: {
    opacity: 1,
    scale: 1,
  },
}

/**
 * Animation variants for prompt
 *
 * @link https://www.framer.com/docs/animation/#variants
 */
const promptVariants = {
  hidden: {
    opacity: 0,
  },
  visibile: {
    opacity: 1,
  },
}

/**
 * Animation variants for spotlight
 *
 * @link https://www.framer.com/docs/animation/#variants
 */
const lightVariant = {
  on: {
    height: "700px",
  },
  off: {
    height: 0,
  },
}

/**
 * Options for NFT collection dropdown
 */
const options = [
  {
    value: null,
    label: "Please Select an NFT Collection",
  },
  {
    value: "boredapeyachtclub",
    label: "Bored Ape Yacht Club",
  },
  {
    value: "cosmic-wyverns-official",
    label: "Cosmic Wyverns Official",
  }
]

/**
 * Helper component to always make the parent scrollable container scroll to the bottom
 * on state change.
 */
const AlwaysScrollToBottom = () => {
  const elementRef = useRef()
  useEffect(() => elementRef.current.scrollIntoView())
  return <div ref={elementRef} />
}

const Loading = () => {
  return <div className={styles.loading}>Loading</div>
}

const NotFound = () => {
  return <div>Not Found</div>
}

const NFTForm = ({ label, onSubmit, afterSubmit, className }) => {
  const [loading, setLoading] = useState(false)
  const [notfound, setNotFound] = useState(false)
  const handleSubmit = async e => {
    e.preventDefault()
    setNotFound(false)
    setLoading(true)
    await onSubmit(e).then( result => {
      afterSubmit(e)
    }, function(error) {
      setNotFound(true)
    })
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

export default function Home() {
  /**
   * @link https://reactjs.org/docs/hooks-reference.html#useref
   */
  const promptRef = useRef(null)

  /**
   * @link https://reactjs.org/docs/hooks-reference.html#usestate
   */
  const [isStarted, setIsStarted] = useState(false)
  const [progress, setProgress] = useState({
    level1: false,
    level2: false,
    level3: false,
    level4: false,
  })
  const [collection, setCollection] = useState(null)
  const [nfts, setNfts] = useState([])

  /**
   * On form submit, get the collection name
   */
  const getCollection = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setCollection(formData.get("collection"))
    setProgress({ ...progress, level2: true })
  }

  const findNFT = async e => {
    const formData = new FormData(e.target)
    let searchid  = formData.get('nft-id');
    let response = await fetch(`/api/bfs/${collection}/${searchid}`)
    if (!response.ok) {
      return new Promise((resolve, reject) => {
        //setTimeout(() => {
          reject('Not Found')
       // }, 600)
      })
    }
    response = await response.json()
    console.log(response);   
    return new Promise((resolve, reject) => {
      //setTimeout(() => {
        resolve('resolved')
     // }, 600)
    })
  }

  const afterFindNFT = async (level) => {
    return setProgress({...progress, [`level${level}`]: true})
  }
  const start = () => setIsStarted(true)

  return (
    <Fragment>
      <div className={styles.content}>
        <main className={styles.main}>
          {!progress.level1 && (
            <motion.div
              animate={isStarted ? "hidden" : "visible"}
              variants={variants}
              transition={{ duration: 1 }}
              onAnimationComplete={(e) => {
                if (e == "hidden") {
                  setProgress({ ...progress, level1: true })
                }
              }}
            >
              <h1 className={styles.title}>
                <span>NFT</span>
                <span>City</span>
              </h1>
            </motion.div>
          )}
          {!progress.level1 && (
            <motion.div
              animate={isStarted ? "hidden" : "visible"}
              variants={variants}
              transition={{ duration: 1 }}
            >
              <button className={styles.start} onClick={start}>
                <span ariaHidden="true">START</span>
                START
                <span ariaHidden="true">START</span>
              </button>
            </motion.div>
          )}
          <motion.div
            className={styles.playerBox}
            animate={isStarted == true ? { opacity: 1 } : { opacity: 0 }}
            variants={promptVariants}
            transition={{
              delay: 1.5,
              duration: 2.8,
            }}
          >
            <div
              style={{
                opacity: progress.level2 ? "0.3" : "1",
              }}
            >
              <p>
                Welcome to NFT City! Looks like you came here to compare some
                NFT options. Fill out some information below so we can help you
                pick the best NFT possible.
              </p>
              <label htmlFor="collection">
                NFT Collection
                <select
                  className="block mt-3 border-2 border-black p-3"
                  name="collection"
                  id="collection"
                  value={collection}
                  onChange={(e) => {
                    const { value } = e.target
                    if (value) {
                      setCollection(e.target.value)
                      setProgress({ ...progress, level2: true })
                    }
                  }}
                >
                  {options.map((o) => (
                    <option className="m-0" value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {progress.level2 && (
              <div style={{
                opacity: progress.level3 ? '0.3' : '1'
              }}>
                <p className="my-4">
                  Awesome! You picked{" "}
                  <span className="bg-green-100 p-1">
                    {options.find((o) => o.value == collection).label}
                  </span>
                  . Now pick two NFT's from that collection to compare to each
                  other.
                </p>
                <NFTForm label="NFT One" onSubmit={findNFT} afterSubmit={() => afterFindNFT(3)} />
              </div>
            )}
            {progress.level3 && (
              <div style={{
                opacity: progress.level4 ? '0.3' : '1'
              }}>
                <NFTForm className="mt-4" label="NFT Two" onSubmit={findNFT} afterSubmit={() => afterFindNFT(4)} />
              </div>
            )}
            <AlwaysScrollToBottom />
          </motion.div>
        </main>
      </div>
      <footer className={styles.footer}>
        <div className="scene">
          <div className={styles.light}>
            <motion.svg
              width="300"
              height="600"
              viewBox="0 0 300 798"
              fill="none"
              style={{
                originX: "right",
                originY: "bottom",
                rotate: "43deg",
                scaleY: 0,
              }}
              initial={{ scaleY: 0 }}
              animate={isStarted ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{
                delay: 0.8,
                duration: 0.5,
              }}
            >
              <g filter="url(#filter0_f_54_36800)">
                <ellipse
                  cx="149.904"
                  cy="407.206"
                  rx="79.4693"
                  ry="336.912"
                  transform="rotate(-179.245 149.904 407.206)"
                  fill="url(#paint0_radial_54_36800)"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f_54_36800"
                  x="0.229736"
                  y="-56.8878"
                  width="299.208"
                  height="854.492"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="35"
                    result="effect1_foregroundBlur_54_36800"
                  />
                </filter>
                <radialGradient
                  id="paint0_radial_54_36800"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(150.001 51.282) rotate(90) scale(695.826 154.774)"
                >
                  <stop stopColor="white" />
                </radialGradient>
              </defs>
            </motion.svg>
          </div>
          <img className="david" src="/david.svg" alt="" />
          <img className="sun" src="/Sun.svg" alt="" />
          <div className="city">
            <div className={styles.bigCity}></div>
          </div>
          <div className="glow"></div>
          <img className="car" src="/car.svg" alt="" />
          <img className="grid" src="/Bottom.svg" alt="" />
        </div>
      </footer>
    </Fragment>
  )
}
