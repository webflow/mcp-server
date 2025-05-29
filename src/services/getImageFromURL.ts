import axios from "axios";

const getImageFromURL = async (
  url: string,
  siteId: string
) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const mimeType = response.headers["content-type"];
  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error(
      `Expected an image but received MIME type: ${
        mimeType || "unknown"
      }`
    );
  }
  const base64Data = Buffer.from(response.data).toString(
    "base64"
  );
  return { data: base64Data, mimeType, siteId };
};

export default getImageFromURL;
