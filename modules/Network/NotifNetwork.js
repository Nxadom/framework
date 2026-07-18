export async function NotifNetwork() {
  const connection = new NXUI.Network();
  const Notif = new NXUI.Notifikasi({ autoHideDelay: 5000 });

  let isInitialized = false;

  connection.onStatusChange = (isOnline, info, isRealChange = false) => {
    if (!isInitialized || !isRealChange) return;
    if (isOnline) {
      Notif.show({
        type: 'success',
        title: 'Jaringan Terhubung',
        subtitle: `Koneksi ${info.type} tersedia — ${info.speed}`,
        actions: false,
      });
    } else {
      Notif.show({
        type: 'error',
        title: 'Jaringan Terputus',
        subtitle: 'Tidak ada koneksi internet. Fitur online tidak tersedia.',
        actions: false,
      });
    }
  };

  let lastNotifiedQuality = null;

  connection.onQualityChange = (quality, stability, isRealChange = false) => {
    if (!isInitialized || !isRealChange) return;
    if (lastNotifiedQuality === quality) return;

    if (quality === 'Buruk' || quality === 'Sangat Buruk') {
      Notif.show({
        type: 'warning',
        title: 'Kualitas Jaringan Menurun',
        subtitle: `Stabilitas: ${stability} — Kualitas: ${quality}`,
        actions: false,
      });
      lastNotifiedQuality = quality;
    } else if (quality === 'Baik' && stability === 'Stabil') {
      if (lastNotifiedQuality === 'Buruk' || lastNotifiedQuality === 'Sangat Buruk') {
        Notif.show({
          type: 'info',
          title: 'Jaringan Kembali Stabil',
          subtitle: 'Koneksi sudah membaik.',
          actions: false,
        });
      }
      lastNotifiedQuality = quality;
    }
  };

  setTimeout(() => { isInitialized = true; }, 2000);
}
