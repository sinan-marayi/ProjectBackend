const aws = require("aws-sdk");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { promisify } = require("util");
const randomBytes = promisify(crypto.randomBytes);

dotenv.config();

const region = "ap-south-1";
const bucketName = "ict-ecommerce";
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKey,
  secretAccessKey,
  signatureVersion: "v4",
});

module.exports.generateUrl = async function () {
  const rawBytes = await randomBytes(16);
  const imgName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imgName,
    Expires: 120,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  return uploadUrl;
};
