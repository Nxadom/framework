/**
 * Kontribusi export per folder modul Mobile (barrel assets/modules/index.js).
 * Di-maintain oleh nxdom-register.ps1 + components.ps1.
 */
export const MODULE_BLOCKS = {
  // @nxdom-register:blocks-begin
  Svg: {
    imports: `import Svg, { svgContent } from "./Svg/index.js";`,
    names: ["Svg", "svgContent"],
  },
  Form: {
    imports: `import Input from "./Form/input.js";
import Switch from "./Form/Switch.js";
import RichTextEditor from "./Form/RichTextEditor.js";
import SelectList from "./Form/SelectList.js";
import {
  validateInput,
  useFormValidation,
  pickImage,
  pickCamera,
  pickVideo,
  recordVideo,
  pickMultipleImages,
  pickDocument,
  pickMultipleDocuments,
  validateVideo,
  convertToBase64,
  parseFileSize,
  formatFileSize,
} from "./Form/Validasi.js";`,
    names: [
      "Input",
      "Switch",
      "RichTextEditor",
      "SelectList",
      "validateInput",
      "useFormValidation",
      "pickImage",
      "pickCamera",
      "pickVideo",
      "recordVideo",
      "pickMultipleImages",
      "pickDocument",
      "pickMultipleDocuments",
      "validateVideo",
      "convertToBase64",
      "parseFileSize",
      "formatFileSize",
    ],
  },
  Fonts: {
    imports: `import { FontFamily, useMontserratFonts } from "./Fonts/Montserrat.js";`,
    names: ["FontFamily", "useMontserratFonts"],
  },
  utils: {
    imports: `import Colors from "./utils/Color.js";
import Grid from "./utils/Grid.js";
import { fs } from "./utils/typography.js";
import QRCodeGenerator from "./utils/QRCode.js";
import { JsonView, formatJson } from "./utils/JsonView.js";
import assetsImage from "./utils/localImage.js";
import ExpoSpeech from "./utils/speech.js";
import {
  Div,
  P,
  Span,
  Button as HtmlButton,
  H1,
  H2,
  H3,
  Section,
  Article,
  createHTMLElement,
  getNativeComponent,
} from "./utils/htmlToNative.js";`,
    names: [
      "Colors",
      "Grid",
      "fs",
      "QRCodeGenerator",
      "JsonView",
      "formatJson",
      "assetsImage",
      "ExpoSpeech",
      "Div",
      "P",
      "Span",
      "HtmlButton",
      "H1",
      "H2",
      "H3",
      "Section",
      "Article",
      "createHTMLElement",
      "getNativeComponent",
    ],
  },
  Icon: {
    imports: `import Icon, { SymbolsIcon } from "./Icon/index.js";`,
    names: ["Icon", "SymbolsIcon"],
  },
  Buttons: {
    imports: `import Buttons from "./Buttons/Buttons.js";
import ButtonsAction from "./Buttons/Action.js";
import isBtnGroup from "./Buttons/BtnGroup.js";
import BtnTabs from "./Buttons/BtnTabs.js";
import CustomButton from "./Buttons/CustomButton.js";
import Loader from "./Buttons/Loader.js";`,
    names: [
      "Buttons",
      "ButtonsAction",
      "isBtnGroup",
      "BtnTabs",
      "CustomButton",
      "Loader",
    ],
  },
  Spinner: {
    imports: `import Spinner from "./Spinner/index.js";`,
    names: ["Spinner"],
  },
  Avatar: {
    imports: `import Avatar from "./Avatar/user.js";
import Images from "./Avatar/Images.js";
import ImgPicker from "./Avatar/pickImage.js";`,
    names: ["Avatar", "Images", "ImgPicker"],
  },
  Modal: {
    imports: `import useModal from "./Modal/index.js";`,
    names: ["useModal"],
  },
  Storage: {
    imports: `import { IndexedDBManager } from "./Storage/IndexDB.js";
import { NexaDb } from "./Storage/NexaDb.js";
import { NexaDBLite } from "./Storage/NexaDBLite.js";
import { NexaStores } from "./Storage/NexaStores.js";
import NexaModels from "./Storage/NexaModels.js";`,
    names: [
      "IndexedDBManager",
      "NexaDb",
      "nexaDb",
      "NexaDBLite",
      "NexaStores",
      "NexaModels",
    ],
    init: "storage",
  },
  Firebase: {
    imports: `import {
  NexaFirestore,
  firebaseData,
  nexaFirebase,
  NexaFirebase,
  initNexaFirebase,
  FirebaseConfig,
  clearNexaFirebaseCache,
  getNexaFirebaseCacheInfo,
} from "./Firebase/NexaFirebase.js";`,
    names: [
      "NexaFirestore",
      "firebaseData",
      "nexaFirebase",
      "NexaFirebase",
      "initNexaFirebase",
      "FirebaseConfig",
      "clearNexaFirebaseCache",
      "getNexaFirebaseCacheInfo",
    ],
  },
  header: {
    imports: `import Header from "./header/header.js";`,
    names: ["Header"],
  },
  Salid: {
    imports: `import Carousel from "./Salid/carousel.js";`,
    names: ["Carousel"],
  },
  Scanner: {
    imports: `import NexaScanqr from "./Scanner/NexaScanqr.js";`,
    names: ["NexaScanqr"],
  },
  Toast: {
    imports: `import Toast, { ToastContainer, toastManager } from "./Toast/index.js";`,
    names: ["Toast", "ToastContainer", "toastManager"],
  },
  Properti: {
    imports: `import Properti, { properti } from "./Properti/Properti.js";`,
    names: ["Properti", "properti"],
  },
  // @nxdom-register:blocks-end
};

export default MODULE_BLOCKS;
