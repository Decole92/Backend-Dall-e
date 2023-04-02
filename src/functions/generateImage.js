const { app } = require("@azure/functions");
const Openai = require("./utils/openai");
const axios = require("axios");
const generateSasToken = require("./utils/generateSasToken");
const { BlobServiceClient } = require("@azure/storage-blob");
const accountName = process.env.accountName;
const containerName = "images";

app.http("generateImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const { prompt } = await request.json();

    console.log(`Prompt is ${prompt}`);
    const response = await Openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    image_url = response.data.data[0].url;

    //Download the image and return it as a arraybuffer
    const res = await axios.get(image_url, { responseType: "arraybuffer" });
    const arrayBuffer = res.data;

    sasToken = await generateSasToken();
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sasToken}`
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);

    // generate current timestamp
    const timestamp = new Date().getTime();
    const file_name = `${prompt}_${timestamp}.png`;

    const blockBlobClient = containerClient.getBlockBlobClient(file_name);

    try {
      await blockBlobClient.uploadData(arrayBuffer);
      console.log("Prompt uploaded");
    } catch (err) {
      console.err("Error uploading file:", err.message);
    }

    return { body: "successfully uploaded image" };
  },
});
