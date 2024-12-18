'use server'

import axios from "axios";
import fs from "fs";
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const file = formData.get('file') as File
  const azureApiKey = "GET KEYS";
  const endpointUrl = "https://summa-openai.openai.azure.com/";

  if (!file) {
    throw new Error('No file provided')
  }

  // Here you would typically upload the file to your storage service
  // For this example, we'll just simulate a delay and log the file details
  const headers = {
    Authorization: `Bearer ${azureApiKey}`,
    "Content-Type": "application/json",
  }
  
  console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: headers,
      body: file
    });
    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }
    const result = await response.json()
    console.log(result.data)
  } catch (error) {
    console.log(`Error! message: ${error}`);
    throw new Error(`Error! message: ${error}`);
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // In a real application, you might want to return some data about the uploaded file
  // For now, we'll just return a success message
  revalidatePath('/')
  return { success: true, message: 'File uploaded successfully' }
}