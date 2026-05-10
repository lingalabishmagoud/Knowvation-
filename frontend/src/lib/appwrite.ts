import { Client, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('69fde9920010a87547f3'); // Your Project ID

export const account = new Account(client);
export default client;
