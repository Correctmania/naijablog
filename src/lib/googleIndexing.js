import { google } from 'googleapis';
import path from 'path';

export async function requestGoogleIndexing(postUrl) {
  try {
    const keyPath = path.join(process.cwd(), 'gsc-key.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing({ version: 'v3', auth });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: postUrl,
        type: 'URL_UPDATED',
      },
    });

    console.log('Successfully sent instant Google indexing request:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error requesting Google indexing:', error);
  }
}