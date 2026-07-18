
export async function controllers(key = false) {
  try {
    // Jika forceRefresh, langsung query dari database dan update cache
    let credential = await window.NXUI.ref.get("bucketsStore", 'oauth');
    // Return in the same format as the original user object (with .data property)
    return credential;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return null;
  }
}


