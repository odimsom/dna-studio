interface LinkedInPostOptions {
  accessToken: string;
  personUrn: string;
  text: string;
  imageUrl?: string;
}

export async function publishToLinkedIn(options: LinkedInPostOptions) {
  const { accessToken, personUrn, text, imageUrl } = options;

  const shareContent: Record<string, unknown> = {
    author: personUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
        ...(imageUrl && {
          media: [
            {
              status: "READY",
              originalUrl: imageUrl,
            },
          ],
        }),
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(shareContent),
  });

  return response.json();
}
