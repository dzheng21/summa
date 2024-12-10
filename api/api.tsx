import axios from "axios";
import multiparty from "multiparty";
import fs from "fs";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Error parsing form data" });
    }

    const image = files.image ? files.image[0] : undefined;
    if (!image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const azureApiKey = process.env.AZURE_API_KEY;
    const endpointUrl = "https://summa-openai.openai.azure.com/";

    try {
      const imageData = fs.readFileSync(image.path, { encoding: "base64" });
      const response = await axios.post(
        endpointUrl,
        {
          image: imageData,
        },
        {
          headers: {
            Authorization: `Bearer ${azureApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });
};
