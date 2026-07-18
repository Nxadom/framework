# Evaluasi Fitur Context Menu — Office (Docxsheet, Presentation, Spreadsheet)

> Sumber definisi menu:
> - `electron/OfficeDocxsheet.js` — Docxsheet (NexaReactive)
> - `electron/OfficePresentationsheet.js` — Presentation (NexaReactive)
> - `electron/OfficeSpreadsheet.js` — Spreadsheet (NexaXlsx, bukan Reactive)
>
> **Legenda Presisi:**
> - ✅ **Presisi** — aksi masuk ke elemen/area yang dituju (sudah diperbaiki di kode)
> - ⚠️ **Sebagian** — terfungsikan tapi presisi target belum diverifikasi penuh
> - ❌ **Belum presisi** — diketahui ada masalah
> - 🔵 **Native Electron role** — ditangani langsung Electron
>
> **Legenda Uji Coba:**
> - ✅ **Berhasil** — sudah diuji, berjalan normal
> - ❌ **Gagal** — sudah diuji, ada masalah
> - ⬜ **Belum diuji** — belum pernah dicoba secara langsung

---

## A. Docxsheet & Presentation — Fitur Reaktif (NexaReactive)

Menu Docxsheet dan Presentation **identik**, sama-sama lewat NexaReactive `executeAction`.

### 1. Clipboard

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Cut | `role: cut` | 🔵 Native | ⬜ Belum diuji | Electron handle langsung |
| Copy | `role: copy` | 🔵 Native | ⬜ Belum diuji | |
| Paste | `role: paste` | 🔵 Native | ⬜ Belum diuji | |
| Undo | `role: undo` | 🔵 Native | ⬜ Belum diuji | |
| Redo | `role: redo` | 🔵 Native | ⬜ Belum diuji | |
| Select All | `role: selectAll` | 🔵 Native | ⬜ Belum diuji | |

### 2. Text Formatting

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Bold | `textBold` | ✅ Presisi | ✅ Berhasil | `execCommand('bold')` via selection yang di-restore |
| Italic | `textItalic` | ✅ Presisi | ✅ Berhasil | |
| Underline | `textUnderline` | ✅ Presisi | ✅ Berhasil | |
| Font Size | `changeTextSize` | ✅ Presisi | ✅ Berhasil | Modal — `currentEditableElement` via `_syncInsertTarget` |
| Text Color | `changeTextColor` | ✅ Presisi | ✅ Berhasil | |
| Font Family | `changeTextFont` | ✅ Presisi | ✅ Berhasil | |
| Remove Formatting | `removeFormatting` | ✅ Presisi | ✅ Berhasil | `execCommand('removeFormat')` |

### 3. Alignment

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Align Left | `textAlignLeft` | ✅ Presisi | ✅ Berhasil | `execCommand('justifyLeft')` langsung di IPC handler |
| Align Center | `textAlignCenter` | ✅ Presisi | ✅ Berhasil | `execCommand('justifyCenter')` langsung |
| Align Right | `textAlignRight` | ✅ Presisi | ✅ Berhasil | `execCommand('justifyRight')` langsung |
| Justify | `textAlignJustify` | ✅ Presisi | ✅ Berhasil | `execCommand('justifyFull')` langsung |

### 4. Insert

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Table | `createTable` | ✅ Presisi | ✅ Berhasil | Insert ke child editableEl via `_syncInsertTarget` |
| Form Builder | `createFormBuilderModal` | ✅ Presisi | ✅ Berhasil | Modal — target di-sync sebelum dibuka |
| Bullet List | `bullist` | ✅ Presisi | ✅ Berhasil | `execCommand('insertUnorderedList')` langsung |
| Numbered List | `numlist` | ✅ Presisi | ✅ Berhasil | `execCommand('insertOrderedList')` langsung |
| Link | `insertLink` | ✅ Presisi | ✅ Berhasil | Modal NexaUI + `execCommand('createLink')` langsung di IPC handler |
| Image | `insertImage` | ✅ Presisi | ✅ Berhasil | Modal NexaUI + `execCommand('insertImage')` langsung di IPC handler |

### 5. Format Elements

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Edit Element | `elementsEdit` | ✅ Presisi | ✅ Berhasil | Panel edit untuk `targetElement` |
| Code Mirror | `elementsCode` | ✅ Presisi | ✅ Berhasil | Code editor untuk elemen diklik |
| Copy Element | `elementsCopy` | ✅ Presisi | ✅ Berhasil | Salin elemen ke clipboard internal |
| Paste Element | `elementsPaste` | ✅ Presisi | ✅ Berhasil | Tempel elemen setelah `insertTarget` |
| Add Section | `elementsSection` | ✅ Presisi | ✅ Berhasil | Insert `<section>` via `_resolveInsertTarget` |
| Border Radius | `elementsBorderRadius` | ✅ Presisi | ✅ Berhasil | Modal — terapkan ke `targetElement` |
| Shadow Box | `elementsShadowBox` | ✅ Presisi | ✅ Berhasil | Modal |
| Icon Elements | `elementsIcon` | ✅ Presisi | ✅ Berhasil | Insert icon via `insertTarget` |
| Delete Element | `elementsDelete` | ✅ Presisi | ✅ Berhasil | Hapus elemen diklik |

#### Grid Element (submenu 1–12 column)

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| 1 Column | `addGridColumn1` | ✅ Presisi | ✅ Berhasil | `insertTarget` = child editableEl |
| 2 Columns | `addGridColumn2` | ✅ Presisi | ✅ Berhasil | |
| 3 Columns | `addGridColumn3` | ✅ Presisi | ✅ Berhasil | |
| 4 Columns | `addGridColumn4` | ✅ Presisi | ✅ Berhasil | |
| 5 Columns | `addGridColumn5` | ✅ Presisi | ✅ Berhasil | |
| 6 Columns | `addGridColumn6` | ✅ Presisi | ✅ Berhasil | |
| 7 Columns | `addGridColumn7` | ✅ Presisi | ✅ Berhasil | |
| 8 Columns | `addGridColumn8` | ✅ Presisi | ✅ Berhasil | |
| 9 Columns | `addGridColumn9` | ✅ Presisi | ✅ Berhasil | |
| 10 Columns | `addGridColumn10` | ✅ Presisi | ✅ Berhasil | |
| 11 Columns | `addGridColumn11` | ✅ Presisi | ✅ Berhasil | |
| 12 Columns | `addGridColumn12` | ✅ Presisi | ✅ Berhasil | |

### 6. Background

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Solid Colors | `backgroundSolidColors` | ✅ Presisi | ✅ Berhasil | Terapkan ke elemen diklik |
| Gradient Backgrounds | `backgroundGradients` | ✅ Presisi | ✅ Berhasil | |
| Pattern Backgrounds | `backgroundPatterns` | ✅ Presisi | ✅ Berhasil | |
| Image Backgrounds | `backgroundImages` | ✅ Presisi | ✅ Berhasil | |
| Texture Backgrounds | `backgroundTextures` | ✅ Presisi | ✅ Berhasil | |
| Background Effects | `backgroundEffects` | ✅ Presisi | ✅ Berhasil | |
| Advanced Options | `backgroundAdvanced` | ✅ Presisi | ✅ Berhasil | |
| Reset Background | `backgroundReset` | ✅ Presisi | ✅ Berhasil | |

### 7. Image Tools

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Change Image Source | `changeImageSource` | ✅ Presisi | ✅ Berhasil | `rawClickTarget` → `<img>` yang diklik |
| ~~Open Image Editor~~ | ~~`openImageEditor`~~ | — | — | Dihapus dari context menu |
| Upload Image | `uploadImage` | ✅ Presisi | ✅ Berhasil | |
| Insert Placeholder | `insertPlaceholder` | ✅ Presisi | ✅ Berhasil | |
| Replace from Unsplash | `replaceFromUnsplash` | ✅ Presisi | ✅ Berhasil | |
| Insert from Unsplash | `insertFromUnsplash` | ✅ Presisi | ✅ Berhasil | |
| Add Image - Nature | `addImageNature` | ✅ Presisi | ✅ Berhasil | |
| Add Image - Business | `addImageBusiness` | ✅ Presisi | ✅ Berhasil | |
| Add Image - People | `addImagePeople` | ✅ Presisi | ✅ Berhasil | |
| Add Image - Technology | `addImageTechnology` | ✅ Presisi | ✅ Berhasil | |
| Add Image - Food | `addImageFood` | ✅ Presisi | ✅ Berhasil | |
| Add Image - Travel | `addImageTravel` | ✅ Presisi | ✅ Berhasil | |
| Add Image - Random | `addImageRandom` | ✅ Presisi | ✅ Berhasil | |

### 8. Chart Elements

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Bar Chart | `insertBarChart` | ✅ Presisi | ✅ Berhasil | |
| Line Chart | `insertLineChart` | ✅ Presisi | ✅ Berhasil | |
| Pie Chart | `insertPieChart` | ✅ Presisi | ✅ Berhasil | |
| Doughnut Chart | `insertDoughnutChart` | ✅ Presisi | ✅ Berhasil | |
| Radar Chart | `insertRadarChart` | ✅ Presisi | ✅ Berhasil | |

### 9. Leaflet Maps

#### Basic Maps

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Simple Map | `insertSimpleMap` | ✅ Presisi | ✅ Berhasil | |
| Street Map | `insertStreetMap` | ✅ Presisi | ✅ Berhasil | |
| Satellite View | `insertSatelliteMap` | ✅ Presisi | ✅ Berhasil | |
| Terrain Map | `insertTerrainMap` | ✅ Presisi | ✅ Berhasil | |
| Dark Mode Map | `insertDarkMap` | ✅ Presisi | ✅ Berhasil | |

#### Interactive Features

| Label | Action | Presisi | Uji Coba |
|---|---|---|---|
| Single Marker | `insertSingleMarker` | ✅ Presisi | ✅ Berhasil |
| Multiple Markers | `insertMultipleMarkers` | ✅ Presisi | ✅ Berhasil |
| Custom Icons | `insertCustomMarkers` | ✅ Presisi | ✅ Berhasil |
| Animated Markers | `insertAnimatedMarkers` | ✅ Presisi | ✅ Berhasil |
| Simple Popup | `insertSimplePopup` | ✅ Presisi | ✅ Berhasil |
| Rich Content Popup | `insertRichPopup` | ✅ Presisi | ✅ Berhasil |
| Tooltips | `insertTooltip` | ✅ Presisi | ✅ Berhasil |
| Zoom Controls | `insertZoomControls` | ✅ Presisi | ✅ Berhasil |
| Layer Control | `insertLayerControl` | ✅ Presisi | ✅ Berhasil |
| Scale Control | `insertScaleControl` | ✅ Presisi | ✅ Berhasil |
| Click Events | `insertClickEvents` | ✅ Presisi | ✅ Berhasil |
| Drag Events | `insertDragEvents` | ✅ Presisi | ✅ Berhasil |
| Zoom Events | `insertZoomEvents` | ✅ Presisi | ✅ Berhasil |

#### Data Visualization

| Label | Action | Presisi | Uji Coba |
|---|---|---|---|
| Heatmaps | `insertHeatmap` | ✅ Presisi | ✅ Berhasil |
| Choropleth Maps | `insertChoroplethMap` | ✅ Presisi | ✅ Berhasil |
| GeoJSON Layers | `insertGeoJSONLayer` | ✅ Presisi | ✅ Berhasil |
| Data Clustering | `insertClusterMarkers` | ✅ Presisi | ✅ Berhasil |
| Route Planning | `insertRoutePlanning` | ✅ Presisi | ✅ Berhasil |
| Measurement Tools | `insertMeasurementTools` | ✅ Presisi | ✅ Berhasil |

#### Map Styling

| Label | Action | Presisi | Uji Coba |
|---|---|---|---|
| Light Theme | `applyLightTheme` | ✅ Presisi | ✅ Berhasil |
| Dark Theme | `applyDarkTheme` | ✅ Presisi | ✅ Berhasil |
| Retro Style | `applyRetroTheme` | ✅ Presisi | ✅ Berhasil |
| Custom Theme | `applyCustomTheme` | ✅ Presisi | ✅ Berhasil |
| Custom Tile Layers | `insertCustomTiles` | ✅ Presisi | ✅ Berhasil |
| Visual Filters | `insertMapFilters` | ✅ Presisi | ✅ Berhasil |

#### Location Services

| Label | Action | Presisi | Uji Coba |
|---|---|---|---|
| User Geolocation | `enableGeolocation` | ✅ Presisi | ✅ Berhasil |
| Address Search | `insertAddressSearch` | ✅ Presisi | ✅ Berhasil |
| Geocoding | `insertGeocoding` | ✅ Presisi | ✅ Berhasil |
| Real-time Tracking | `insertRealTimeTracking` | ✅ Presisi | ✅ Berhasil |

### 10. Iframe

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| PDF Embed | `insertIframePdf` | ✅ Presisi | ✅ Berhasil | |
| YouTube Embed | `insertIframeYoutube` | ✅ Presisi | ✅ Berhasil | Proxy via `/nx-embed/youtube` |
| Custom URL | `insertIframeCustom` | ✅ Presisi | ✅ Berhasil | |

### 11. Layout Elements (MediaObject)

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Basic Media | `insertMediaBasic` | ✅ Presisi | ✅ Berhasil | |
| Centered Media | `insertMediaCentered` | ✅ Presisi | ✅ Berhasil | |
| Bottom Aligned | `insertMediaBottom` | ✅ Presisi | ✅ Berhasil | |
| Reverse Media | `insertMediaReverse` | ✅ Presisi | ✅ Berhasil | |
| Small Media | `insertMediaSmall` | ✅ Presisi | ✅ Berhasil | |
| Large Media | `insertMediaLarge` | ✅ Presisi | ✅ Berhasil | |
| Bordered Media | `insertMediaBordered` | ✅ Presisi | ✅ Berhasil | |
| Hover Effect | `insertMediaHover` | ✅ Presisi | ✅ Berhasil | |
| Round Image | `insertMediaRound` | ✅ Presisi | ✅ Berhasil | |
| Grayscale | `insertMediaGrayscale` | ✅ Presisi | ✅ Berhasil | |
| Blurred | `insertMediaBlurred` | ✅ Presisi | ✅ Berhasil | |
| Specific | `insertMediaSpecific` | ✅ Presisi | ✅ Berhasil | |

### 12. Element Controls

#### Dasar

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Enable Sortable | `toggleSortable` | ✅ Presisi | ✅ Berhasil | HTML5 native drag API, vanilla JS |
| Enable Draggable | `toggleDraggable` | ✅ Presisi | ✅ Berhasil | mousedown/mousemove/mouseup, position:absolute |
| Enable Resizable | `toggleResizable` | ✅ Presisi | ✅ Berhasil | Handle SE/N/E vanilla JS |
| Disable All | `disableAllInteractions` | ✅ Presisi | ✅ Berhasil | Disable Sortable+Draggable+Resizable+Boundaries |
| To Front | `toFront` | ✅ Presisi | ✅ Berhasil | Naikkan z-index, fallback ke parentElement |
| To Back | `toBack` | ✅ Presisi | ✅ Berhasil | Turunkan z-index, fallback ke parentElement |

#### Boundaries

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Hover Highlighting | `toggleHoverBoundaries` | ✅ Presisi | ✅ Berhasil | mouseover/mouseout listener |
| Show All Boundaries | `toggleAllBoundaries` | ✅ Presisi | ✅ Berhasil | Terapkan ke semua elemen di editor |
| Subtle Style | `setBoundaryStyleSubtle` | ✅ Presisi | ✅ Berhasil | border rgba biru tipis |
| Visible Style | `setBoundaryStyleVisible` | ✅ Presisi | ✅ Berhasil | border dashed biru |
| Highlight Style | `setBoundaryStyleHighlight` | ✅ Presisi | ✅ Berhasil | border + boxShadow biru |

#### Zoom Element

| Label | Action | Presisi | Uji Coba |
|---|---|---|---|
| Zoom In (125%) | `zoomInElement` | ✅ Presisi | ⬜ Belum diuji |
| Zoom Out (75%) | `zoomOutElement` | ✅ Presisi | ⬜ Belum diuji |
| 50% | `zoomElementTo50` | ✅ Presisi | ⬜ Belum diuji |
| 75% | `zoomElementTo75` | ✅ Presisi | ⬜ Belum diuji |
| 100% (Reset) | `zoomElementTo100` | ✅ Presisi | ⬜ Belum diuji |
| 125% | `zoomElementTo125` | ✅ Presisi | ⬜ Belum diuji |
| 150% | `zoomElementTo150` | ✅ Presisi | ⬜ Belum diuji |
| Fit to Container | `zoomFitToContainer` | ✅ Presisi | ⬜ Belum diuji |
| Toggle Wheel Zoom | `toggleWheelZoom` | ✅ Presisi | ⬜ Belum diuji |

#### Fullscreen Mode

> Semua mode resize window Electron langsung via `win.setBounds()` — tidak lewat IPC renderer.

| Label | Action | Presisi | Uji Coba |
|---|---|---|---|
| 50% | `win.setBounds` 50% workArea | ✅ Presisi | ⬜ Belum diuji |
| 75% | `win.setBounds` 75% workArea | ✅ Presisi | ⬜ Belum diuji |
| 90% | `win.setBounds` 90% workArea | ✅ Presisi | ⬜ Belum diuji |
| 100% | `win.setBounds` 100% workArea | ✅ Presisi | ⬜ Belum diuji |
| HD (1366x768) | `win.setBounds` 1366×768 | ✅ Presisi | ⬜ Belum diuji |
| Full HD (1920x1080) | `win.setBounds` 1920×1080 | ✅ Presisi | ⬜ Belum diuji |
| 2K (2560x1440) | `win.setBounds` 2560×1440 | ✅ Presisi | ⬜ Belum diuji |
| 4K (3840x2160) | `win.setBounds` 3840×2160 | ✅ Presisi | ⬜ Belum diuji |
| iPad (768x1024) | `win.setBounds` 768×1024 | ✅ Presisi | ⬜ Belum diuji |
| iPad Pro (1024x1366) | `win.setBounds` 1024×1366 | ✅ Presisi | ⬜ Belum diuji |
| Android Tablet (800x1280) | `win.setBounds` 800×1280 | ✅ Presisi | ⬜ Belum diuji |
| iPhone SE (375x667) | `win.setBounds` 375×667 | ✅ Presisi | ⬜ Belum diuji |
| iPhone 12 (390x844) | `win.setBounds` 390×844 | ✅ Presisi | ⬜ Belum diuji |
| iPhone Pro Max (430x932) | `win.setBounds` 430×932 | ✅ Presisi | ⬜ Belum diuji |
| Android (360x800) | `win.setBounds` 360×800 | ✅ Presisi | ⬜ Belum diuji |
| Exit Fullscreen | `win.maximize()` | ✅ Presisi | ⬜ Belum diuji |

### 13. Tools

| Label | Action | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Find & Replace | `findReplace` | ✅ Presisi | ⬜ Belum diuji | Dialog di dalam editor aktif |
| Print | `print` | ✅ Presisi | ⬜ Belum diuji | Print dokumen aktif |
| Refresh | `role: reload` | 🔵 Native | ⬜ Belum diuji | |
| Console Log | `role: toggleDevTools` | 🔵 Native | ⬜ Belum diuji | |
| Inspect Element | click langsung | 🔵 Native | ⬜ Belum diuji | `inspectElement(x, y)` ke koordinat klik |

---

## B. Spreadsheet — Fitur NexaXlsx (bukan Reactive)

Spreadsheet menggunakan NexaXlsx (bukan NexaReactive). Fiturnya berbeda dan tidak lewat `executeAction`.

### Cell Context Menu

| Label | Action (`xlsx-ctx`) | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Copy | `copy` | ✅ Presisi | ⬜ Belum diuji | Salin sel aktif |
| Cut | `cut` | ✅ Presisi | ⬜ Belum diuji | |
| Paste | `paste` | ✅ Presisi | ⬜ Belum diuji | |
| Delete | `delete` | ✅ Presisi | ⬜ Belum diuji | Hapus konten sel |
| Bar Chart | `chart-bar` | ✅ Presisi | ⬜ Belum diuji | Generate chart dari data terpilih |
| Line Chart | `chart-line` | ✅ Presisi | ⬜ Belum diuji | |
| Pie Chart | `chart-pie` | ✅ Presisi | ⬜ Belum diuji | |
| Doughnut Chart | `chart-doughnut` | ✅ Presisi | ⬜ Belum diuji | |
| Quick Print | `print-quick` | ✅ Presisi | ⬜ Belum diuji | Print langsung tanpa dialog |
| Print Settings | `print-settings` | ✅ Presisi | ⬜ Belum diuji | Buka dialog print |
| Print All | `print-all` | ✅ Presisi | ⬜ Belum diuji | |
| Print Selection | `print-selection` | ✅ Presisi | ⬜ Belum diuji | |
| Print Current Sheet | `print-current-sheet` | ✅ Presisi | ⬜ Belum diuji | |
| Auto-resize Column | `auto-resize-col` | ✅ Presisi | ⬜ Belum diuji | Resize kolom sesuai konten |
| Format as Currency (Rp.) | `format-currency` | ✅ Presisi | ⬜ Belum diuji | Format sel jadi Rupiah |
| Remove Currency Format | `remove-currency` | ✅ Presisi | ⬜ Belum diuji | |
| Merge Cells | `merge` | ✅ Presisi | ⬜ Belum diuji | Gabung sel terpilih |
| Unmerge Cells | `unmerge` | ✅ Presisi | ⬜ Belum diuji | |
| All Borders | `border-all` | ✅ Presisi | ⬜ Belum diuji | |
| Outline | `border-outline` | ✅ Presisi | ⬜ Belum diuji | |
| Top Border | `border-top` | ✅ Presisi | ⬜ Belum diuji | |
| Bottom Border | `border-bottom` | ✅ Presisi | ⬜ Belum diuji | |
| Left Border | `border-left` | ✅ Presisi | ⬜ Belum diuji | |
| Right Border | `border-right` | ✅ Presisi | ⬜ Belum diuji | |
| Remove Borders | `border-none` | ✅ Presisi | ⬜ Belum diuji | |
| Full Screen | `fullscreen` | ✅ Presisi | ⬜ Belum diuji | Expand spreadsheet ke fullscreen |
| Refresh | `role: reload` | 🔵 Native | ⬜ Belum diuji | |
| Console Log | `role: toggleDevTools` | 🔵 Native | ⬜ Belum diuji | |
| Inspect Element | click langsung | 🔵 Native | ⬜ Belum diuji | |

### Row Context Menu

| Label | Action (`xlsx-row-ctx`) | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Delete row N | `delete` + rowIndex | ✅ Presisi | ⬜ Belum diuji | Hapus baris yang diklik kanan |
| Insert row above | `insert-above` + rowIndex | ✅ Presisi | ⬜ Belum diuji | |
| Insert row below | `insert-below` + rowIndex | ✅ Presisi | ⬜ Belum diuji | |

### Column Context Menu

| Label | Action (`xlsx-col-ctx`) | Presisi | Uji Coba | Catatan |
|---|---|---|---|---|
| Sort A → Z | `sort-asc` + colIndex | ✅ Presisi | ⬜ Belum diuji | |
| Sort Z → A | `sort-desc` + colIndex | ✅ Presisi | ⬜ Belum diuji | |
| Auto-resize column | `auto-resize` + colIndex | ✅ Presisi | ⬜ Belum diuji | |
| Delete column X | `delete` + colIndex | ✅ Presisi | ⬜ Belum diuji | |
| Insert column left | `insert-left` + colIndex | ✅ Presisi | ⬜ Belum diuji | |
| Insert column right | `insert-right` + colIndex | ✅ Presisi | ⬜ Belum diuji | |

---

## Ringkasan Status (Update 2026-06-30)

### Docxsheet & Presentation (NexaReactive)

| Status Presisi | Uji Coba | Keterangan |
|---|---|---|
| ✅ 100+ fitur Presisi | ⬜ Semua belum diuji | `_syncInsertTarget()` dipanggil di IPC handler sebelum `executeAction` |
| 🔵 8 Native Electron | ⬜ | Cut/Copy/Paste/Undo/Redo/SelectAll/Reload/DevTools |

### Spreadsheet (NexaXlsx)

| Status Presisi | Uji Coba |
|---|---|
| ✅ Semua fitur cell/row/column | ⬜ Semua belum diuji |
| 🔵 3 Native Electron | ⬜ |

---

## Catatan Teknis — Fix Final 2026-06-29

### Root Cause

`Elements/index.js:1555` melakukan:
```js
targetElement.parentNode.insertBefore(element, targetElement.nextSibling);
```
Jika `targetElement` adalah container `editableEl` itu sendiri, insert terjadi **di luar** editor.

### Fix Layer 1 — IPC Handler (Docxsheet & Presentation)

```js
const insertTarget = (rawTarget !== editableEl && editableEl.contains(rawTarget))
  ? rawTarget                                   // child yang diklik → insert setelah elemen itu ✓
  : (editableEl.lastElementChild || editableEl); // fallback: child terakhir editor ✓

nr._syncInsertTarget?.(insertTarget);  // sync ke SEMUA sub-module sekaligus
nr.executeAction?.(action);
```

### Fix Layer 2 — NexaReactive `_syncInsertTarget`

Set `insertTarget` ke semua sub-module sebelum action:
- `elements.targetElement` + `elements.currentTargetElement`
- `Interactions.targetElement`
- `chartElements.interactions.targetElement`
- `LeafletMaps.targetElement` + `LeafletMaps.interactions.targetElement`
- `Iframe.targetElement` + **`Iframe.currentTargetElement`** (untuk modal async)
- `Layout.interactions.targetElement` + `Layout.targetElement`
- `imageTools.targetElement = editableEl` (container, bukan child)

### Fix Layer 3 — Per-module Handler

Setiap `handle*Action` di NexaReactive memanggil `_resolveInsertTarget()` + `_syncInsertTarget()` sebelum mendelegasikan ke sub-module.
