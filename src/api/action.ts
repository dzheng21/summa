'use server'

import axios from "axios";
import multiparty from "multiparty";
import fs from "fs";

import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const azureApiKey = process.env.AZURE_API_KEY;
  const endpointUrl = "https://summa-openai.openai.azure.com/";

  const file = formData.get('file') as File
  const form = new multiparty.Form();
  
  if (!file) {
    throw new Error('No file provided')
  }

  // Here you would typically upload the file to your storage service
  // For this example, we'll just simulate a delay and log the file details
  module.exports = async (req, res) => {
    form.parse(req, async (err, fields, files) => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      if (err) {
        return res.status(400).json({ error: "Error parsing form data" });
      }
    
      try {
        const response = await axios.post(
          endpointUrl,
          {
            image: file,
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

  console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // In a real application, you might want to return some data about the uploaded file
  // For now, we'll just return a success message
  revalidatePath('/')
  return { success: true, message: 'File uploaded successfully' }
}