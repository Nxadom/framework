
export async function debug(cmd) {
  const dbg = NX.Debug.route();
  await dbg.start(String(cmd.workingDirectory || '').trim());
  console.log(dbg.summary());
  console.log(dbg.detailErrors());
}
