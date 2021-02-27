const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const {v4: uuidv4} = require("uuid");
const app = express();
const algoliasearch = require("algoliasearch");

const ALGOLIA_APP_ID = functions.config().algolia.app;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.key;


const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-api-9a206..firebaseio.com",
});

const db = admin.firestore();

app.use(cors({origin: true}));

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex("techterms");

exports.addToIndex = functions.firestore.document("techterms/{techtermId}")
    .onCreate((snapshot) => {
      const data = snapshot.data();
      const objectID = snapshot.id;

      return index.saveObject({...data, objectID});
    });

exports.updateIndex = functions.firestore.document("techterms/{techtermId}")
    .onUpdate((change) => {
      const newData = change.after.data();
      const objectID = change.after.id;
      return index.saveObject({...newData, objectID});
    });

exports.deleteFromIndex = functions.firestore.document("techterms/{techtermId}")
    .onDelete((snapshot) =>
      index.deleteObject(snapshot.id),
    );

app.post("/api", (req, res) => {
  const id = uuidv4();
  (async () => {
    try {
      await db.collection("submitted").doc("/" + id + "/")
          .create({...req.body, id: id});
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
