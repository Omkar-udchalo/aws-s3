const fs = require("fs");
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const AWS = require("aws-sdk");
const { json } = require("body-parser");
const ID = "AKIAS4J3CSKBEV5KY7FK";
const SECRET = "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";
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
});
app.get("/", (req, res) => {
    res.json({ message: "Home Page" });
});

app.get("/bucket-list", (req, res) => {
    var getBucketList = s3.listBuckets().promise();
    getBucketList
        .then((data) => {
            console.log(data);
            return res.json(data.Buckets);
        })
        .catch((err) => {
            console.log(err);
            return res.json({ message: "Error" });
        });
});
app.get("/bucket-policy", (req, res) => {
    var bucketName;
    var getBucketList = s3.listBuckets().promise();
    getBucketList
        .then((data) => {
            bucketName = data.Buckets.bucketName;
        })
        .catch((err) => {
            console.log(err);
        });
    var bucketParams = { Bucket: bucketName };
    // console.log(bucketParams);
    var getBucketPolicy = s3.getBucketPolicy(bucketParams).promise();
    getBucketPolicy
        .then((data) => {
            console.log(data);
            return res.json(data);
        })
        .catch((err) => {
            console.log(err);
            return res.json({ message: "No Policy found" });
        });
    // res.send(bucketPolicy);
});
app.get("/bucket-objects", (req, res) => {
    var getBucketList = s3.listBuckets().promise();
    getBucketList
        .then((data) => {
            for (let item of data.Buckets) {
                var bucketParams = { Bucket: item.Name };
                var getBucketObj = s3.listObjects(bucketParams).promise();
                getBucketObj
                    .then((data) => {
                        console.log("Success");
                        console.log(data);

                        return res.json(data.Contents);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/upload", (req, res) => {
    const fileContent = fs.readFileSync("test.jpg");
    const params = {
        Bucket: "omkar-demo-bucket",
        Key: "test.jpg",
        Body: fileContent,
    };
    console.log(params);
    // // Uploading files to the bucket
    s3.upload(params, (err) => {
        if (err) {
            console.log("Error", err);
            return res.json({ message: "Error in uploading file" });
        } else {
            console.log("Done");
            return res.json({ message: "Uploaded file" });
        }
    });
});

app.listen(3000);

function getBucketObjects(bucketName) {
    var bucketParams = { Bucket: bucketName };
    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success");

            for (let item of data.Contents) {
                var docuName = "";
                docuName = item.Key;
                var docuData = docuName.split(".")[1];
                console.log("Document Type " + docuData);
                console.log(item);
            }

            return data.Contents;
        }
    });
}

const uploadFile = (file) => {
    const fileContent = fs.readFileSync(file);
    // console.log(fileContent);
    const params = { Bucket: "omkar-demo-bucket", Key: file, Body: fileContent };
    console.log(params);
    // // Uploading files to the bucket
    s3.upload(params, (err) => {
        if (err) {
            console.log("Error", err);
        }
        console.log("Done");
    });
};

// uploadFile("CANDLESTICK BIBLE.pdf");