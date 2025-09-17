import PDFDocument from '../components/PDFDocuments';
import { pdf } from '@react-pdf/renderer';

// API endpoints
const presignedUrlAPI = 'https://jg941rctc3.execute-api.us-east-1.amazonaws.com/dev/generate-url';
const telegramAPI = 'https://b5vgd5rzt7.execute-api.us-east-1.amazonaws.com/stage_whatsappmessagesend/Whatsapp_message_send';

export const generateAndSendPDF = async (data, fromDate, toDate) => {
  try {
    // Step 1: Generate PDF as a Blob
    const pdfBlob = await pdf(
      <PDFDocument data={data} fromDate={fromDate} toDate={toDate} />
    ).toBlob();
    console.log('PDF generated successfully. Proceeding to get presigned URL...');

    // Step 2: Call presigned URL API using GET
    const presignedResponse = await fetch(presignedUrlAPI, {
      method: 'GET',
    });

    if (!presignedResponse.ok) {
      throw new Error(`Presigned URL API failed with status ${presignedResponse.status}`);
    }

    const { upload_url, file_url } = await presignedResponse.json();

    if (!upload_url || !file_url) {
      throw new Error('Missing upload_url or file_url in API response');
    }

    console.log('Upload URL obtained successfully:', upload_url);

    // Step 3: Upload the PDF to the presigned S3 URL using PUT
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: pdfBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload PDF to S3: ${uploadResponse.statusText}`);
    }

    console.log('PDF uploaded to S3 successfully.');

    // Step 4: Send Telegram message with the PDF's public URL
    const chatIds = '7525648200,7305741705';
    const messageText = 'Find the PDF Report';

    const telegramRequestUrl = `${telegramAPI}?chat_ids=${chatIds}&send_sms=true&send_pdf=true&message_text=${encodeURIComponent(
      messageText
    )}&pdf_url=${encodeURIComponent(file_url)}`;

    console.log('Sending Telegram message with PDF URL...');

    const telegramResponse = await fetch(telegramRequestUrl);

    if (!telegramResponse.ok) {
      throw new Error(`Telegram API failed: ${telegramResponse.statusText}`);
    }

    console.log('Telegram message sent successfully.');
    return true;

  } catch (error) {
    console.error('Error in generateAndSendPDF:', error.message);
    throw error;
  }
};
