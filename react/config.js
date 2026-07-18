const FirebaseConfig = false;

const hosts = "http://192.168.1.10";
const Server = {
  // Core endpoints (React Native + web compatibility)
  url: hosts,
  urlApi: hosts + "/api",
  API_URL: hosts + "/api",
  FILE_URL: hosts,

  // Optional endpoint variables - accessible as NEXA.<name>
  drive: hosts + "/assets/drive",
  // NXAPI (ex-rebit): urlApi + /nxapi — CLI Mobile Install/Config mengisi otomatis
  NXAPI: hosts + "/api/nxapi",
  typicode: "https://jsonplaceholder.typicode.com/photos",
  firebaseConfig: FirebaseConfig,
};

// Export both configurations
export default Server;
export { FirebaseConfig };
