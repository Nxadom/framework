// Mengimpor semua komponen jadi dari VS Code Toolkit
import { 
    allComponents, 
    provideVSCodeDesignSystem 
} from "@vscode/webview-ui-toolkit";

// Meregistrasikan komponen agar bisa dibaca sebagai tag HTML biasa
provideVSCodeDesignSystem().register(allComponents);
