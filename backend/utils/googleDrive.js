const { google } = require("googleapis");
const { Readable } = require("stream");

/**
 * OAuth2 Client
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI, // use env instead of hardcoding
);

/**
 * Create or Get DocuGen Folder
 */

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("REDIRECT URI:", process.env.GOOGLE_REDIRECT_URI);
async function createDocuGenFolder(auth) {
  const drive = google.drive({ version: "v3", auth });

  const existing = await drive.files.list({
    q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: "files(id, name)",
  });

  if (existing.data.files.length > 0) {
    return existing.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: "DocuGen",
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id;
}

/**
 * Upload Invoice PDF
 */
async function uploadInvoice(auth, folderId, pdfBuffer, fileName) {
  const drive = google.drive({ version: "v3", auth });

  const bufferStream = Readable.from(pdfBuffer);  // ✅ cleaner

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "application/pdf",
      body: bufferStream,
    },
    fields: "id, name",
  });

  return response.data;
}

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

/**
 * List Files Inside Folder
 */
async function listFiles(auth, folderId) {
  const drive = google.drive({ version: "v3", auth });

  // const files = await drive.files.list({
  //   q: `'${folderId}' in parents and trashed=false`,
  //   fields: "files(id, name)",
  // });

  const files = await drive.files.list({
  q: `'${folderId}' in parents and trashed=false`,
  fields: "files(id, name, webViewLink, createdTime)",
});

  return files.data.files;
}

// rename file from google drive

async function renameFile(auth, fileId, newName) {
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.update({
    fileId: fileId,
    requestBody: {
      name: newName,
    },
    fields: "id, name",
  });

  return response.data;
}

/**
 * Set user tokens before calling Drive APIs
 */
function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

module.exports = {
  oauth2Client,
  createDocuGenFolder,
  uploadInvoice,
  listFiles,
  renameFile,
  drive,
  setCredentials,
};
