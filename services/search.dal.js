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
async function getByFirstName(name) {
  await client.connect();
  const cursor = client
    .db("Stock_Market")
    .collection("stock_info")
    .find({ stock_name: name });
  const results = await cursor.toArray();

  return results;
}

module.exports = {
  getEverything,
  getByFirstName,
};
