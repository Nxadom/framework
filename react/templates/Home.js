import {
  View,
  StyleSheet,
  useNavigation,
  assetsImage,
  Image,
  fs,
  Text,
  TouchableOpacity,
} from "Nxdom";

function HomeScreen() {
  const navigation = useNavigation();
  const assetColor = {
    backgroundColor: "#211E1F",
    buttonColor: "#211E1F",
    buttonTextColor: "#FFFFFF"
  };
  return (
    <View style={styles.container}>
      <View style={styles.centerBlock}>
        <View style={styles.logoWrap}>
          <Image source={assetsImage.get("nexajs")} style={styles.logo} />
        </View>
        <View style={styles.titleSection}>
          <Text style={[fs["4xl"], styles.customAvatar, fs.semibold]}>
            Nxdom  <Text style={[fs["xs"]]}>v.1.0.0</Text>
          </Text>
          <Text style={[fs.semibold, styles.subtitle]}>
            Nusantara eXtreme Development Object Model
          </Text>
        </View>
        <View style={styles.buttonWrap}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: assetColor.buttonColor },
            ]}
            onPress={() =>
              navigation.navigate("halaman", {
                type: "halaman",
                count: 5,
                messages: ["Pesan 1", "Pesan 2", "Pesan 3"],
              })
            }
          >
            <Text style={[fs.semibold, { color: assetColor.buttonTextColor }]}>
              Screen Halaman
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  centerBlock: {
    width: "100%",
    maxWidth: 360,
    gap: 16,
    alignItems: "center",
  },
  titleSection: {
    alignItems: "center",
  },
  customAvatar: {
    paddingTop: 0,
    textAlign: "center",
    width: "100%",
  },
  subtitle: {
    textAlign: "center",
    width: "100%",
  },
  logoWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignSelf: "center",
  },
  buttonWrap: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 180,
    alignItems: "center",
  },
});

export default HomeScreen;
