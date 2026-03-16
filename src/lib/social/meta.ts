interface MetaPostOptions {
  accessToken: string;
  pageId: string;
  message: string;
  imageUrl?: string;
  platform: "facebook" | "instagram";
}

export async function publishToFacebook(options: MetaPostOptions) {
  const { accessToken, pageId, message, imageUrl } = options;

  if (imageUrl) {
    // Post photo with caption
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          message,
          access_token: accessToken,
        }),
      }
    );
    return response.json();
  }

  // Text-only post
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: accessToken,
      }),
    }
  );
  return response.json();
}

export async function publishToInstagram(options: MetaPostOptions) {
  const { accessToken, pageId, message, imageUrl } = options;

  if (!imageUrl) {
    throw new Error("Instagram requires an image");
  }

  // Step 1: Create media container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: message,
        access_token: accessToken,
      }),
    }
  );
  const container = await containerResponse.json();

  // Step 2: Publish the container
  const publishResponse = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    }
  );
  return publishResponse.json();
}
