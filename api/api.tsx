import axios from "axios";

module.exports = async (req, res) => {
  const azureApiKey = process.env.AZURE_API_KEY;
  const endpointUrl = "https://summa-openai.openai.azure.com/";

  try {
    const response = await axios.get(endpointUrl, {
      headers: {
        Authorization: `Bearer ${azureApiKey}`,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.message });
  }
};
