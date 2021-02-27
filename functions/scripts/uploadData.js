const admin = require("firebase-admin");
const serviceAccount = require("../permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://techie-jargon-default-rtdb.europe-west1.firebasedatabase.app",
});

const firestore = admin.firestore();
const path = require("path");
const fs = require("fs");
const {v4: uuidv4} = require("uuid");
const directoryPath = path.join(__dirname, "./files/");

fs.readdir(directoryPath, function(err, files) {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  files.forEach(function(file) {
    const lastDotIndex = file.lastIndexOf(".");

    const menu = require("./files/" + file);

    menu.forEach(function(obj) {
      const uniqueId = uuidv4();
      firestore
          .collection(file.substring(0, lastDotIndex))
          .doc(uniqueId)
          .set({...obj, id: uniqueId})
          .then(function(docRef) {
            console.log("Document written");
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
    });
  });
});
