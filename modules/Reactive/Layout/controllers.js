
export async function controllers() {
  try {
    const appData = await NXUI.ref.getAll("programFiles");
    return appData.data;
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return error;
  }
}
