
export async function bundle(cmd) {
  try {
  cmd.success('mode (no arguments)');
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return null;
  }
}


