const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://user:user@cluster0.0vye1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function getEverything() {
  await client.connect();
  const cursor = client.db("Stock_Market").collection("stock_info").find();
  const results = await cursor.toArray();

  return results;
}

async function getByFirstName(input) {
  await client.connect();
  const cursor = client
    .db("Stock_Market")
    .collection("stock_info")
    .find({ stock_name: input });
  const results = await cursor.toArray();

  return results;
}

// stock_market
// stock_name
// stock_symbol
async function getByStockMarket(input) {
  await client.connect();
  const cursor = client
    .db("Stock_Market")
    .collection("stock_info")
    .find({ stock_market: input });
  const results = await cursor.toArray();

  return results;
}

async function getByStockSymbol(input) {
  await client.connect();
  const cursor = client
    .db("Stock_Market")
    .collection("stock_info")
    .find({ stock_symbol: input });
  const results = await cursor.toArray();

  return results;
}

module.exports = {
  getEverything,
  getByFirstName,
  getByStockMarket,
  getByStockSymbol,
};
