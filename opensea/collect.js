const collections = require("./collections");
const axios = require("axios");
const fs = require("fs");

const api_url = "https://api.opensea.io/api/v1/assets?order_direction=desc";

const parse_nft = (nft) => {
  let id = nft.id.toString();
  let obj = {};
  obj[id] = {
    image_url: nft.image_url,
    traits: nft.traits.map((trait) => {
      return {
        trait_type: trait.trait_type,
        value: trait.value,
        rarity: trait.trait_count,
      };
    }),
    connections: [],
  };
  return obj;
};

const getData = ({ collection_name, collection_size }) => {
  /*
  To use this function, the json file must be created beforehand
  JSON should look like [] and have name corresponding to collection name
  */

  // Generate urls for requests
  let request_count = Math.ceil(collection_size / 50);
  let urls = [...Array(request_count).keys()].map((value) => {
    return `${api_url}&offset=${
      value * 50
    }&limit=50&collection=${collection_name}`;
  });

  // Make api calls in batches
  for (let i = 0; i <= urls.length; i += 40) {
    current_urls = urls.slice(i, i + 40);
    axios
      .all(current_urls.map((url) => axios.get(url)))
      .then(
        axios.spread((...allData) => {
          let parsedData = [];
          allData.map((response) => {
            let data = response.data;
            let parsed = data["assets"].map((nft) => parse_nft(nft));
            parsedData = parsedData.concat(parsed);
          });
          return parsedData;
        })
      )
      .then((parsedData) => {
        fs.readFile(`raw/${collection_name}.json`, (err, data) => {
          if (err) throw err;
          var objects = JSON.parse(data);
          parsedData.map((datapoint) => {
            let key = Object.keys(datapoint)[0];
            objects[key] = datapoint[key];
          });
          fs.writeFile(
            `raw/${collection_name}.json`,
            JSON.stringify(objects),
            "utf-8",
            (err) => {
              if (err) throw err;
              console.log("Appended Data");
            }
          );
        });
      })
      .catch((err) => console.log(err));
  }
};

// for (let i = 0; i < collections["options"].length; i++) {
//   let current_collection = collections["options"][i];
//   getData(current_collection);
// }
