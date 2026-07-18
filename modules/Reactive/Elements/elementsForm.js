/**
 * elementsForm - Dynamic Form Generator for Element Data
 * Generate forms based on Element Data Array using NexaUI styles
 */

class elementsForm {
  constructor() {
    // Constructor untuk elementsForm
    this.formData = {};
  }

  /**
   * Generate dynamic form based on Element Data Array
   * @param {Array} elementDataArray - Array dari analisis DOM element
   * @returns {String} - HTML string untuk form
   */
  generateForm(elementDataArray) {
    console.log(
      "🔧 Generating fresh form with data array length:",
      elementDataArray?.length
    );

    if (!elementDataArray || !Array.isArray(elementDataArray)) {
      console.log("⚠️ No element data array provided");
      return '<p class="text-center">No element data available</p>';
    }

    console.log("📋 Processing element data types:", [
      ...new Set(elementDataArray.map((item) => item.type)),
    ]);

    let formHTML = "<div>";

    // Group data by type for better organization
    const groupedData = this.groupDataByType(elementDataArray);

    // Generate form sections
    formHTML += this.generateBasicInfoSection(groupedData);
    formHTML += this.generateAttributesSection(groupedData);
    formHTML += this.generateStyleSection(groupedData);
    formHTML += this.generateContentSection(groupedData);

    formHTML += "</div>";

    return formHTML;
  }

  /**
   * Group element data by type
   * @param {Array} elementDataArray - Array data elements
   * @returns {Object} - Grouped data object
   */
  groupDataByType(elementDataArray) {
    console.log(
      "📊 Grouping fresh data by type, processing",
      elementDataArray.length,
      "items"
    );

    const grouped = {
      basic: [],
      attributes: [],
      styles: [],
      classes: [],
      content: [],
      textNodes: [],
    };

    elementDataArray.forEach((item) => {
      switch (item.type) {
        case "tag":
        case "id":
          grouped.basic.push(item);
          break;
        case "attribute":
          grouped.attributes.push(item);
          break;
        case "style":
          grouped.styles.push(item);
          break;
        case "class":
          grouped.classes.push(item);
          break;
        // outerHTML tidak perlu ditampilkan di form
        case "outerHTML":
          // Skip - tidak perlu field untuk outerHTML
          break;
        case "textNode":
          grouped.textNodes.push(item);
          break;
      }
    });

    console.log("✅ Data grouped:", {
      basic: grouped.basic.length,
      attributes: grouped.attributes.length,
      styles: grouped.styles.length,
      classes: grouped.classes.length,
      content: grouped.content.length,
      textNodes: grouped.textNodes.length,
    });

    return grouped;
  }

  /**
   * Generate basic info section (tag, id)
   */
  generateBasicInfoSection(groupedData) {
    let html = '<h6 class="text-primary mb-2">🏷️ Basic Element Info</h6>';

    groupedData.basic.forEach((item) => {
      if (item.type === "tag") {
        // Common HTML tags for selection
        const commonHtmlTags = [
          { value: "div", label: "div - Container umum" },
          { value: "span", label: "span - Inline container" },
          { value: "p", label: "p - Paragraph" },
          { value: "h1", label: "h1 - Heading 1" },
          { value: "h2", label: "h2 - Heading 2" },
          { value: "h3", label: "h3 - Heading 3" },
          { value: "h4", label: "h4 - Heading 4" },
          { value: "h5", label: "h5 - Heading 5" },
          { value: "h6", label: "h6 - Heading 6" },
          { value: "section", label: "section - Section area" },
          { value: "article", label: "article - Article content" },
          { value: "header", label: "header - Header section" },
          { value: "footer", label: "footer - Footer section" },
          { value: "main", label: "main - Main content" },
          { value: "aside", label: "aside - Sidebar content" },
          { value: "nav", label: "nav - Navigation" },
          { value: "ul", label: "ul - Unordered list" },
          { value: "ol", label: "ol - Ordered list" },
          { value: "li", label: "li - List item" },
          { value: "a", label: "a - Link/anchor" },
          { value: "button", label: "button - Button element" },
          { value: "form", label: "form - Form container" },
          { value: "input", label: "input - Input field" },
          { value: "textarea", label: "textarea - Text area" },
          { value: "select", label: "select - Select dropdown" },
          { value: "label", label: "label - Form label" },
          { value: "img", label: "img - Image" },
          { value: "video", label: "video - Video player" },
          { value: "audio", label: "audio - Audio player" },
          { value: "canvas", label: "canvas - Canvas element" },
          { value: "table", label: "table - Table container" },
          { value: "thead", label: "thead - Table head" },
          { value: "tbody", label: "tbody - Table body" },
          { value: "tfoot", label: "tfoot - Table foot" },
          { value: "tr", label: "tr - Table row" },
          { value: "th", label: "th - Table header cell" },
          { value: "td", label: "td - Table data cell" },
        ];

        html += `
          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="element_tag_display">Current Tag</label></dt>
                  <dd class="form-group-body">
                    <input type="text" class="form-control" id="element_tag_display" value="${item.value.toUpperCase()}" readonly>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="element_tag">Change To Tag</label></dt>
                  <dd class="form-group-body">
                    <select class="form-select" id="element_tag" data-original-tag="${
                      item.value
                    }">
                      <option value="">-- Pilih untuk mengganti tag --</option>
                      ${commonHtmlTags
                        .map(
                          (tag) =>
                            `<option value="${tag.value}" ${
                              tag.value.toLowerCase() === item.value.toLowerCase()
                                ? "selected"
                                : ""
                            }>${tag.label}</option>`
                        )
                        .join("")}
                    </select>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        `;
      } else if (item.type === "id") {
        html += `
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="element_id">Element ID</label></dt>
              <dd class="form-group-body">
                <input type="text" class="form-control" id="element_id" value="${item.value}">
              </dd>
            </dl>
          </div>
        `;
      }
    });

    return html;
  }

  /**
   * Generate attributes section
   */
  generateAttributesSection(groupedData) {
    if (groupedData.attributes.length === 0) return "";

    // Filter out standard attributes and meaningless values
    const meaningfulAttributes = groupedData.attributes.filter((item) => {
      // Skip standard attributes that are handled elsewhere
      if (["id", "class", "style"].includes(item.name.toLowerCase()))
        return false;

      // Skip attributes with empty or "initial" values
      if (
        !item.value ||
        item.value.trim() === "" ||
        item.value.trim().toLowerCase() === "initial"
      )
        return false;

      return true;
    });

    if (meaningfulAttributes.length === 0) {
      console.log(
        `⚠️ No meaningful attributes to display (${groupedData.attributes.length} total attributes filtered out)`
      );
      return "";
    }

    console.log(
      `🔧 Displaying ${
        meaningfulAttributes.length
      } meaningful attributes (filtered out ${
        groupedData.attributes.length - meaningfulAttributes.length
      } standard/empty attributes)`
    );

    let html = '<h6 class="text-primary mb-2">🔧 Attributes</h6>';
    html += '<div class="nx-row">';

    meaningfulAttributes.forEach((item, index) => {
      html += `
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="attr_${item.name}_${index}">${item.name}</label></dt>
              <dd class="form-group-body">
                <input type="text" class="form-control" id="attr_${item.name}_${index}" value="${item.value}">
              </dd>
            </dl>
          </div>
        </div>
      `;
    });

    html += "</div>";
    return html;
  }

  /**
   * Generate styles section
   */
  generateStyleSection(groupedData) {
    let html = "";

    // Classes section
    if (groupedData.classes.length > 0) {
      html += '<h6 class="text-primary mb-2">🎨 Classes</h6>';

      // Separate nx-col classes from regular classes
      const nxColClasses = groupedData.classes.filter((item) =>
        item.value.startsWith("nx-col-")
      );
      const regularClasses = groupedData.classes.filter(
        (item) => !item.value.startsWith("nx-col-")
      );

      console.log("📐 Processing classes:");
      console.log(
        "  - nx-col classes found:",
        nxColClasses.length,
        nxColClasses.map((c) => c.value)
      );
      console.log(
        "  - regular classes found:",
        regularClasses.length,
        regularClasses.map((c) => c.value)
      );

      // Handle nx-col classes as select dropdown
      if (nxColClasses.length > 0) {
        const currentColValue = nxColClasses[0].value; // Get current nx-col value
        console.log(
          "🔽 Creating nx-col select dropdown, current value:",
          currentColValue
        );

        html += '<div class="form-group">';
        html += '<dl><dt class="form-group-header"><label for="nx_col_select">Column Size</label></dt>';
        html += '<dd class="form-group-body">';
        html += `<select class="form-select" id="nx_col_select">`;

        for (let i = 2; i <= 12; i++) {
          const optionValue = `nx-col-${i}`;
          const selected = currentColValue === optionValue ? "selected" : "";
          html += `<option value="${optionValue}" ${selected}>nx-col-${i}</option>`;
        }

        html += `</select>`;
        html += "</dd></dl></div>";
      }

      // Handle regular classes as checkboxes
      if (regularClasses.length > 0) {
        regularClasses.forEach((item, index) => {
          html += `
            <div class="form-checkbox">
              <label><input type="checkbox" id="class_${index}" name="classes[]" value="${item.value}" checked> ${item.value}</label>
            </div>
          `;
        });
      }
    }

    // Styles section - filter and group meaningful values
    const meaningfulStyles = groupedData.styles.filter((item) => {
      if (!item.value || item.value.trim() === "") return false;

      const value = item.value.trim().toLowerCase();

      // Filter out common meaningless/default values
      const meaninglessValues = [
        "initial",
        "inherit",
        "unset",
        "auto",
        "none",
        "normal",
        "0px",
        "transparent",
        "static",
      ];

      // Check if value is meaningless
      if (meaninglessValues.includes(value)) return false;

      // Filter out rgba/rgb with 0 alpha or all zeros
      if (
        value.startsWith("rgba(") &&
        (value.includes(", 0)") || value === "rgba(0, 0, 0, 0)")
      )
        return false;
      if (value === "rgb(0, 0, 0)") return false;

      return true;
    });

    // Group styles by category for better organization
    const styleGroups = this.groupStylesByCategory(meaningfulStyles);

    if (meaningfulStyles.length > 0) {
      const filteredCount = groupedData.styles.length - meaningfulStyles.length;
      console.log(
        `🎨 Displaying ${meaningfulStyles.length} meaningful styles (filtered out ${filteredCount} default/meaningless values)`
      );

      // Generate organized style sections
      html += this.generateCategorizedStyles(styleGroups);
    } else if (groupedData.styles.length > 0) {
      console.log(
        `⚠️ All ${groupedData.styles.length} style properties have default/meaningless values - not displaying any style fields`
      );
      console.log(
        `  - Filtered values:`,
        groupedData.styles.map((s) => `${s.property}: ${s.value}`)
      );
    }

    return html;
  }

  /**
   * Generate content section
   */
  generateContentSection(groupedData) {
    // Only show content section if there are text nodes
    if (groupedData.textNodes.length === 0) return "";

    let html = '<h6 class="text-secondary mb-2">📄 Direct Text Content</h6>';

    groupedData.textNodes.forEach((item, index) => {
      html += `
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="textnode_${index}">Text Content ${index + 1}</label></dt>
            <dd class="form-group-body">
              <input type="text" class="form-control input-block" id="textnode_${index}" value="${
        item.value
      }">
            </dd>
          </dl>
        </div>
      `;
    });

    return html;
  }

  /**
   * Group styles by category for better organization
   * @param {Array} styles - Array of style objects
   * @returns {Object} - Grouped styles by category
   */
  groupStylesByCategory(styles) {
    const categories = {
      colors: {
        title: "🎨 Colors",
        properties: [
          "color",
          "background-color",
          // Border colors moved to borders section for unified handling
        ],
        items: [],
      },
      borders: {
        title: "🔲 Borders",
        properties: [
          "border",
          "border-width",
          "border-style",
          "border-color",
          "border-radius",
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width",
          "border-top-style",
          "border-right-style",
          "border-bottom-style",
          "border-left-style",
          "border-top-color",
          "border-right-color",
          "border-bottom-color",
          "border-left-color",
        ],
        items: [],
      },
      spacing: {
        title: "📐 Spacing",
        properties: [
          "margin",
          "margin-top",
          "margin-right",
          "margin-bottom",
          "margin-left",
          "padding",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
        ],
        items: [],
      },
      typography: {
        title: "✏️ Typography",
        properties: [
          "font-family",
          "font-size",
          "font-weight",
          "font-style",
          "line-height",
          "text-align",
          "text-decoration",
          "letter-spacing",
        ],
        items: [],
      },
      layout: {
        title: "📏 Layout & Size",
        properties: [
          "display",
          "position",
          "top",
          "right",
          "bottom",
          "left",
          "width",
          "height",
          "min-width",
          "min-height",
          "max-width",
          "max-height",
        ],
        items: [],
      },
      background: {
        title: "🖼️ Background",
        properties: [
          "background",
          "background-image",
          "background-position",
          "background-size",
          "background-repeat",
        ],
        items: [],
      },
      other: {
        title: "⚙️ Other",
        properties: [],
        items: [],
      },
    };

    // Categorize each style property
    styles.forEach((style) => {
      let categorized = false;

      for (const [categoryKey, category] of Object.entries(categories)) {
        if (categoryKey === "other") continue; // Skip 'other' for now

        if (category.properties.includes(style.property)) {
          category.items.push(style);
          categorized = true;
          break;
        }
      }

      // If not categorized, put in 'other'
      if (!categorized) {
        categories.other.items.push(style);
      }
    });

    // Filter out empty categories
    const filteredCategories = {};
    Object.entries(categories).forEach(([key, category]) => {
      if (category.items.length > 0) {
        filteredCategories[key] = category;
      }
    });

    console.log(
      "📊 Style categories:",
      Object.entries(filteredCategories).map(
        ([key, cat]) => `${key}: ${cat.items.length}`
      )
    );

    return filteredCategories;
  }

  /**
   * Generate categorized styles HTML
   * @param {Object} styleGroups - Grouped styles by category
   * @returns {String} - HTML string for categorized styles
   */
  generateCategorizedStyles(styleGroups) {
    let html = "";
    let styleIndex = 0; // Global index for unique IDs

    Object.entries(styleGroups).forEach(([categoryKey, category]) => {
      // Category header
      html += `<h6 class="text-primary mb-2">${category.title}</h6>`;

      // Special handling for specific categories
      if (categoryKey === "colors") {
        html += this.generateColorInputs(category.items, styleIndex);
        styleIndex += category.items.length;
      } else if (categoryKey === "borders") {
        html += this.generateBorderInputs(category.items, styleIndex);
        styleIndex += category.items.length;
      } else if (categoryKey === "spacing") {
        html += this.generateSpacingInputs(category.items, styleIndex);
        styleIndex += category.items.length;
      } else {
        // Regular style inputs for other categories
        html += '<div class="nx-row">';
        category.items.forEach((item) => {
          html += `
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="style_${
                    item.property
                  }_${styleIndex}">${this.formatPropertyLabel(
            item.property
          )}</label></dt>
                  <dd class="form-group-body">
                    <input type="text" class="form-control" id="style_${
                      item.property
                    }_${styleIndex}" value="${item.value}">
                  </dd>
                </dl>
              </div>
            </div>
          `;
          styleIndex++;
        });
        html += "</div>";
      }
    });

    return html;
  }

  /**
   * Generate border inputs with grouped organization
   * @param {Array} borderItems - Array of border style items
   * @param {Number} startIndex - Starting index for unique IDs
   * @returns {String} - HTML string for border inputs
   */
  generateBorderInputs(borderItems, startIndex) {
    let html = "";
    let currentIndex = startIndex;

    // Group border properties
    const borderGroups = {
      width: borderItems.filter((item) => item.property.includes("width")),
      style: borderItems.filter(
        (item) =>
          item.property.includes("style") && !item.property.includes("width")
      ),
      color: borderItems.filter((item) => item.property.includes("color")),
      radius: borderItems.filter((item) => item.property.includes("radius")),
      general: borderItems.filter((item) => item.property === "border"),
    };

    // Check if we have both style and color items for combined section
    const hasStyleItems = borderGroups.style.length > 0;
    const hasColorItems = borderGroups.color.length > 0;
    let styleColorProcessed = false;

    // Generate border sections
    Object.entries(borderGroups).forEach(([groupName, items]) => {
      if (items.length === 0) return;

      if (groupName === "general") {
        // General border property (shorthand)
        items.forEach((item) => {
          html += `
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="style_${item.property}_${currentIndex}">Border (shorthand)</label></dt>
                <dd class="form-group-body">
                  <input type="text" class="form-control input-block" id="style_${item.property}_${currentIndex}" value="${item.value}">
                </dd>
              </dl>
            </div>
          `;
          currentIndex++;
        });
      } else if (groupName === "style" && !styleColorProcessed) {
        // Combined Style & Color section (side by side)
        if (hasStyleItems || hasColorItems) {
          html += `<label class="text-secondary mb-1" style="display:block;">Border Style & Color</label>`;

          // Start row for side-by-side layout
          let rowHtml = '<div class="nx-row">';

          // Border Style (left side)
          if (hasStyleItems) {
            const styleItem = borderGroups.style[0];
            const borderStyleOptions = [
              { value: "none", label: "None → tanpa border" },
              {
                value: "hidden",
                label: "Hidden → sama dengan none, khusus tabel",
              },
              { value: "solid", label: "Solid → garis lurus penuh" },
              { value: "dashed", label: "Dashed → garis putus-putus" },
              { value: "dotted", label: "Dotted → titik-titik" },
              { value: "double", label: "Double → garis ganda" },
              { value: "groove", label: "Groove → efek 3D cekung" },
              { value: "ridge", label: "Ridge → efek 3D timbul" },
              { value: "inset", label: "Inset → elemen masuk ke dalam" },
              { value: "outset", label: "Outset → elemen timbul ke luar" },
            ];

            rowHtml += `
              <div class="nx-col-6">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="unified_border_style_${currentIndex}">Border Style</label></dt>
                    <dd class="form-group-body">
                      <select class="form-select" id="unified_border_style_${currentIndex}" data-unified-border-style="true">
                        ${borderStyleOptions
                          .map(
                            (option) =>
                              `<option value="${option.value}" ${
                                option.value === styleItem.value ? "selected" : ""
                              }>${option.label}</option>`
                          )
                          .join("")}
                      </select>
                    </dd>
                  </dl>
                </div>
              </div>
            `;
            currentIndex++;
          }

          // Border Color (right side)
          if (hasColorItems) {
            const colorItem = borderGroups.color[0];
            const isColorValue = this.isColorValue(colorItem.value);

            if (isColorValue) {
              rowHtml += `
                <div class="nx-col-6">
                  <div class="form-group">
                    <dl>
                      <dt class="form-group-header"><label for="unified_border_color_${currentIndex}">Border Color</label></dt>
                      <dd class="form-group-body">
                        <div class="input-group">
                          <input type="text" class="form-control" id="unified_border_color_${currentIndex}" value="${
                colorItem.value
              }" placeholder="Border color" data-unified-border-color="true">
                          <input type="color" class="form-control" data-target="unified_border_color_${currentIndex}" value="${this.convertToHexColor(
                colorItem.value
              )}" style="width: 56px; padding: 4px; flex: 0 0 auto;">
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              `;
            } else {
              rowHtml += `
                <div class="nx-col-6">
                  <div class="form-group">
                    <dl>
                      <dt class="form-group-header"><label for="unified_border_color_${currentIndex}">Border Color</label></dt>
                      <dd class="form-group-body">
                        <input type="text" class="form-control" id="unified_border_color_${currentIndex}" value="${colorItem.value}" data-unified-border-color="true">
                      </dd>
                    </dl>
                  </div>
                </div>
              `;
            }
            currentIndex++;
          }

          rowHtml += "</div>";
          html += rowHtml;
          styleColorProcessed = true;
        }
      } else if (groupName === "color" && styleColorProcessed) {
        // Skip color section since it was processed with style
        return;
      } else if (groupName === "color" && !hasStyleItems) {
        // Only color section (no style available)
        if (items.length > 0) {
          // Use the first color item as representative
          const colorItem = items[0];
          const isColorValue = this.isColorValue(colorItem.value);

          if (isColorValue) {
            html += `
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="unified_border_color_${currentIndex}">All Borders</label></dt>
                  <dd class="form-group-body">
                    <div class="input-group">
                      <input type="text" class="form-control" id="unified_border_color_${currentIndex}" value="${
              colorItem.value
            }" placeholder="Border color" data-unified-border-color="true">
                      <input type="color" class="form-control" data-target="unified_border_color_${currentIndex}" value="${this.convertToHexColor(
              colorItem.value
            )}" style="width: 56px; padding: 4px; flex: 0 0 auto;">
                    </div>
                  </dd>
                </dl>
              </div>
            `;
          } else {
            html += `
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="unified_border_color_${currentIndex}">All Borders</label></dt>
                  <dd class="form-group-body">
                    <input type="text" class="form-control" id="unified_border_color_${currentIndex}" value="${colorItem.value}" data-unified-border-color="true">
                  </dd>
                </dl>
              </div>
            `;
          }
          currentIndex++;
        }
      } else {
        // Other border properties (width, radius, etc.)
        html += `<label class="text-secondary mb-1" style="display:block;">${this.formatPropertyLabel(
          groupName
        )}</label>`;
        html += '<div class="nx-row">';

        items.forEach((item) => {
          html += `
            <div class="nx-col-3">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="style_${
                    item.property
                  }_${currentIndex}">${this.formatBorderLabel(
            item.property
          )}</label></dt>
                  <dd class="form-group-body">
                    <input type="text" class="form-control" id="style_${
                      item.property
                    }_${currentIndex}" value="${item.value}">
                  </dd>
                </dl>
              </div>
            </div>
          `;
          currentIndex++;
        });

        html += "</div>";
      }
    });

    return html;
  }

  /**
   * Generate spacing inputs with grouped organization
   * @param {Array} spacingItems - Array of spacing style items
   * @param {Number} startIndex - Starting index for unique IDs
   * @returns {String} - HTML string for spacing inputs
   */
  generateSpacingInputs(spacingItems, startIndex) {
    let html = "";
    let currentIndex = startIndex;

    // Group spacing properties
    const spacingGroups = {
      margin: spacingItems.filter((item) => item.property.startsWith("margin")),
      padding: spacingItems.filter((item) =>
        item.property.startsWith("padding")
      ),
    };

    Object.entries(spacingGroups).forEach(([groupName, items]) => {
      if (items.length === 0) return;

      html += `<label class="text-secondary mb-1" style="display:block;">${this.formatPropertyLabel(
        groupName
      )}</label>`;
      html += '<div class="nx-row">';

      items.forEach((item) => {
        html += `
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="style_${
                  item.property
                }_${currentIndex}">${this.formatSpacingLabel(
          item.property
        )}</label></dt>
                <dd class="form-group-body">
                  <input type="text" class="form-control" id="style_${
                    item.property
                  }_${currentIndex}" value="${item.value}">
                </dd>
              </dl>
            </div>
          </div>
        `;
        currentIndex++;
      });

      html += "</div>";
    });

    return html;
  }

  /**
   * Generate color inputs using proper form.css input-group structure
   * @param {Array} colorItems - Array of color style items
   * @param {Number} startIndex - Starting index for unique IDs
   * @returns {String} - HTML string for color inputs
   */
  generateColorInputs(colorItems, startIndex) {
    let html = '<div class="nx-row">';

    colorItems.forEach((item, index) => {
      const uniqueIndex = startIndex + index;
      const isColorValue = this.isColorValue(item.value);

      if (isColorValue) {
        html += `
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="style_${
                  item.property
                }_${uniqueIndex}">${this.formatPropertyLabel(
          item.property
        )}</label></dt>
                <dd class="form-group-body">
                  <div class="input-group">
                    <input type="text" class="form-control" id="style_${
                      item.property
                    }_${uniqueIndex}" value="${
          item.value
        }" placeholder="Enter color value">
                    <input type="color" class="form-control" data-target="style_${
                      item.property
                    }_${uniqueIndex}" value="${this.convertToHexColor(
          item.value
        )}" style="width: 56px; padding: 4px; flex: 0 0 auto;">
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        `;
      } else {
        // Regular text input for non-color values
        html += `
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="style_${
                  item.property
                }_${uniqueIndex}">${this.formatPropertyLabel(
          item.property
        )}</label></dt>
                <dd class="form-group-body">
                  <input type="text" class="form-control" id="style_${
                    item.property
                  }_${uniqueIndex}" value="${item.value}">
                </dd>
              </dl>
            </div>
          </div>
        `;
      }
    });

    html += "</div>";
    return html;
  }

  /**
   * Check if a value is a color value
   * @param {String} value - CSS value to check
   * @returns {Boolean} - True if it's a color value
   */
  isColorValue(value) {
    if (!value) return false;
    const colorValue = value.trim().toLowerCase();

    // Check for hex colors
    if (colorValue.match(/^#[0-9a-f]{3,6}$/i)) return true;

    // Check for rgb/rgba
    if (colorValue.match(/^rgba?\(/)) return true;

    // Check for hsl/hsla
    if (colorValue.match(/^hsla?\(/)) return true;

    // Check for named colors (basic ones)
    const namedColors = [
      "red",
      "green",
      "blue",
      "white",
      "black",
      "yellow",
      "purple",
      "orange",
      "pink",
      "brown",
      "gray",
      "grey",
    ];
    if (namedColors.includes(colorValue)) return true;

    return false;
  }

  /**
   * Convert RGB/HSL colors to hex for color picker
   * @param {String} colorValue - CSS color value
   * @returns {String} - Hex color value
   */
  convertToHexColor(colorValue) {
    // Simple conversion for common formats
    if (colorValue.startsWith("#")) return colorValue;

    // For RGB values, try to convert (basic implementation)
    const rgbMatch = colorValue.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${parseInt(r).toString(16).padStart(2, "0")}${parseInt(g)
        .toString(16)
        .padStart(2, "0")}${parseInt(b).toString(16).padStart(2, "0")}`;
    }

    // Fallback to black for unrecognized formats
    return "#000000";
  }

  /**
   * Format property label for better readability
   * @param {String} property - CSS property name
   * @returns {String} - Formatted label
   */
  formatPropertyLabel(property) {
    return property
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Format border-specific labels for better readability
   * @param {String} property - CSS border property name
   * @returns {String} - Formatted label
   */
  formatBorderLabel(property) {
    const parts = property.split("-");
    if (parts.length >= 3) {
      // e.g., border-top-width -> Top
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return this.formatPropertyLabel(property);
  }

  /**
   * Format spacing-specific labels for better readability
   * @param {String} property - CSS spacing property name
   * @returns {String} - Formatted label
   */
  formatSpacingLabel(property) {
    const parts = property.split("-");
    if (parts.length >= 2) {
      // e.g., margin-top -> Top, padding-left -> Left
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return this.formatPropertyLabel(property);
  }

  /**
   * Generate modal content with form
   * @param {Array} elementDataArray - Array data elements
   * @param {String} targetId - ID element yang di-edit
   * @returns {Object} - Modal configuration object
   */
  generateModalForm(elementDataArray, targetId = "unknown") {
    const formHTML = this.generateForm(elementDataArray);

    // Create unique modal ID to ensure fresh data every time
    const uniqueModalId = `elementsEditFormModal_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      elementById: uniqueModalId,
      styleClass: "w-600px",
      label: `Edit Element: ${targetId}`,
      onclick: {
        title: "Save Changes",
        cancel: "Cancel",
        send: "processElementsFormSave",
      },
      content: formHTML,
    };
  }

  /**
   * Extract form data for saving
   * @param {String} modalId - ID modal
   * @returns {Object} - Form data object
   */
  extractFormData(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return {};

    const formData = {
      basic: {},
      attributes: {},
      styles: {},
      classes: [],
      content: {},
    };

    // Extract basic info
    console.log("🏷️ Extracting basic element info");
    const tagInput = modal.querySelector("#element_tag");
    const idInput = modal.querySelector("#element_id");
    if (tagInput) {
      formData.basic.tag = tagInput.value;
      console.log(`  - Tag: ${tagInput.value}`);
    }
    if (idInput) {
      formData.basic.id = idInput.value;
      console.log(`  - ID: ${idInput.value || "(empty)"}`);
    }

    // Extract attributes (only meaningful attributes that are displayed)
    const attrInputs = modal.querySelectorAll('[id^="attr_"]');
    console.log(
      `🔧 Extracting ${attrInputs.length} custom attributes from form`
    );

    attrInputs.forEach((input) => {
      const attrName = input.id.replace(/^attr_/, "").replace(/_\d+$/, "");
      const attrValue = input.value.trim();

      if (attrValue) {
        console.log(`  - ${attrName}: ${attrValue}`);
        formData.attributes[attrName] = attrValue;
      } else {
        console.log(`  - ${attrName}: (empty - will be removed)`);
        // Empty value means remove the attribute
        formData.attributes[attrName] = "";
      }
    });

    // Extract classes
    console.log("🎨 Extracting element classes");
    const classCheckboxes = modal.querySelectorAll(
      '[name="classes[]"]:checked'
    );

    console.log(`  - Regular classes: ${classCheckboxes.length} checked`);
    classCheckboxes.forEach((checkbox) => {
      console.log(`    • ${checkbox.value}`);
      formData.classes.push(checkbox.value);
    });

    // Extract nx-col selection
    const nxColSelect = modal.querySelector("#nx_col_select");
    if (nxColSelect) {
      console.log(`  - Column class: ${nxColSelect.value}`);
      formData.classes.push(nxColSelect.value);
    } else {
      console.log("  - No column class selector found");
    }

    // Extract styles (only meaningful styles that are displayed)
    const styleInputs = modal.querySelectorAll('[id^="style_"]');
    console.log(
      `📤 Extracting ${styleInputs.length} style properties from form`
    );

    styleInputs.forEach((input) => {
      const styleProp = input.id.replace(/^style_/, "").replace(/_\d+$/, "");
      const styleValue = input.value.trim();

      if (styleValue) {
        console.log(`  - ${styleProp}: ${styleValue}`);
        formData.styles[styleProp] = styleValue;
      } else {
        console.log(`  - ${styleProp}: (empty - will be removed)`);
        // Empty value means remove the property
        formData.styles[styleProp] = "";
      }
    });

    // Handle unified border color
    const unifiedBorderColorInputs = modal.querySelectorAll(
      '[data-unified-border-color="true"]'
    );
    if (unifiedBorderColorInputs.length > 0) {
      const unifiedBorderColor = unifiedBorderColorInputs[0].value.trim();
      if (unifiedBorderColor) {
        console.log(
          `🎨 Applying unified border color: ${unifiedBorderColor} to all border sides`
        );

        // Apply to all border color properties
        const borderColorProperties = [
          "border-color",
          "border-top-color",
          "border-right-color",
          "border-bottom-color",
          "border-left-color",
        ];

        borderColorProperties.forEach((property) => {
          formData.styles[property] = unifiedBorderColor;
          console.log(`  - ${property}: ${unifiedBorderColor} (unified)`);
        });
      }
    }

    // Handle unified border style
    const unifiedBorderStyleInputs = modal.querySelectorAll(
      '[data-unified-border-style="true"]'
    );
    if (unifiedBorderStyleInputs.length > 0) {
      const unifiedBorderStyle = unifiedBorderStyleInputs[0].value.trim();
      if (unifiedBorderStyle) {
        console.log(
          `🎯 Applying unified border style: ${unifiedBorderStyle} to all border sides`
        );

        // Apply to all border style properties
        const borderStyleProperties = [
          "border-style",
          "border-top-style",
          "border-right-style",
          "border-bottom-style",
          "border-left-style",
        ];

        borderStyleProperties.forEach((property) => {
          formData.styles[property] = unifiedBorderStyle;
          console.log(`  - ${property}: ${unifiedBorderStyle} (unified)`);
        });
      }
    }

    // Extract content (no innerHTML or textContent needed)

    // Extract text nodes
    console.log("📄 Extracting text content");
    const textNodeInputs = modal.querySelectorAll('[id^="textnode_"]');
    formData.content.textNodes = [];

    if (textNodeInputs.length > 0) {
      console.log(`  - Found ${textNodeInputs.length} text node inputs`);
      textNodeInputs.forEach((input, index) => {
        const textValue = input.value.trim();
        console.log(`    • Text node ${index + 1}: "${textValue}"`);
        formData.content.textNodes.push(input.value);
      });
    } else {
      console.log("  - No text content inputs found");
    }

    // Summary of extracted data
    console.log("✅ Form data extraction completed:");
    console.log(
      `  - Basic info: tag="${formData.basic.tag}", id="${
        formData.basic.id || "(empty)"
      }"`
    );
    console.log(
      `  - Classes: ${formData.classes.length} (${
        formData.classes.join(", ") || "none"
      })`
    );
    console.log(
      `  - Styles: ${Object.keys(formData.styles).length} properties`
    );
    console.log(
      `  - Attributes: ${
        Object.keys(formData.attributes).length
      } custom attributes`
    );
    console.log(`  - Text nodes: ${formData.content.textNodes?.length || 0}`);

    return formData;
  }

  /**
   * Initialize floating labels and form interactions after modal opens
   * @param {String} modalId - ID of the modal
   */
  initializeFormInteractions(modalId, targetElement = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Store target element and original state for real-time preview
    if (targetElement) {
      this.currentTargetElement = targetElement;
      this.storeOriginalElementState(targetElement);
      console.log("💾 Stored original element state for real-time preview");

      // Add visual feedback for preview mode
      this.addPreviewModeIndicator(targetElement);
    }

    // Initialize checkbox states
    const checkboxes = modal.querySelectorAll(
      '.form-checkbox input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      // Add change event listeners if needed
      checkbox.addEventListener("change", function () {
        console.log(
          `Checkbox ${this.value} is now ${
            this.checked ? "checked" : "unchecked"
          }`
        );
      });
    });

    // Initialize nx-col select
    const nxColSelect = modal.querySelector("#nx_col_select");
    if (nxColSelect) {
      // Add change event listener with real-time preview
      nxColSelect.addEventListener("change", (event) => {
        console.log(`🔄 Column size changed to: ${event.target.value}`);
        if (targetElement) {
          this.previewClassChange(targetElement, "nx-col", event.target.value);
        }
      });
    }

    // Initialize color pickers
    this.initializeColorPickers(modal);

    // Initialize real-time preview for all form inputs
    if (targetElement) {
      this.initializeRealTimePreview(modal, targetElement);
    }

    console.log("✅ Form interactions initialized successfully");
  }

  /**
   * Initialize color-picker <-> text-input sync (elements marked with data-target)
   * @param {Element} modal - Modal DOM element
   */
  initializeColorPickers(modal) {
    const colorPickers = modal.querySelectorAll('input[type="color"][data-target]');

    colorPickers.forEach((picker) => {
      const targetInputId = picker.getAttribute("data-target");
      const targetInput = modal.querySelector(`#${targetInputId}`);

      if (!targetInput) return;

      // Update text input when color picker changes
      picker.addEventListener("input", (event) => {
        const hexValue = event.target.value;
        targetInput.value = hexValue;
        console.log(
          `🎨 Form-nexa color picker changed: ${targetInputId} = ${hexValue}`
        );

        // No floating label handling needed for simple structure
        console.log(`🎨 Color updated successfully for ${targetInputId}`);

        // Trigger visual feedback
        targetInput.style.borderColor = "#007bff";
        setTimeout(() => {
          targetInput.style.borderColor = "";
        }, 300);

        // Trigger real-time preview if available
        if (this.currentTargetElement) {
          // Check if this is a unified border color
          if (targetInput.hasAttribute("data-unified-border-color")) {
            // Apply to all border color properties
            const borderColorProperties = [
              "border-color",
              "border-top-color",
              "border-right-color",
              "border-bottom-color",
              "border-left-color",
            ];

            borderColorProperties.forEach((property) => {
              this.previewStyleChange(
                this.currentTargetElement,
                property,
                hexValue
              );
            });

            console.log(
              `🎨 Unified border color picker applied: ${hexValue} to all border sides`
            );
          } else {
            // Regular style property
            const property = targetInputId
              .replace(/^style_/, "")
              .replace(/_\d+$/, "");
            this.previewStyleChange(
              this.currentTargetElement,
              property,
              hexValue
            );
          }
        }
      });

      // Update color picker when text input changes (if valid color)
      targetInput.addEventListener("input", (event) => {
        const textValue = event.target.value.trim();

        // Convert to hex if it's a valid color
        const hexColor = this.convertToHexColor(textValue);
        if (hexColor !== "#000000" && this.isColorValue(textValue)) {
          picker.value = hexColor;
          console.log(
            `📝 Text input changed color picker: ${targetInputId} = ${textValue} (${hexColor})`
          );
        }
      });
    });
  }

  /**
   * Clean up any pending operations
   */
  cleanup() {
    // Clear any pending tag change timeout
    if (this.tagChangeTimeout) {
      clearTimeout(this.tagChangeTimeout);
      this.tagChangeTimeout = null;
    }

    console.log("🧹 Form generator cleanup completed");
  }

  /**
   * Store original element state for rollback functionality
   * @param {Element} element - Target DOM element
   */
  storeOriginalElementState(element) {
    this.originalElementState = {
      tagName: element.tagName.toLowerCase(), // Store original tag
      id: element.id,
      className: element.className,
      style: element.style.cssText,
      innerHTML: element.innerHTML,
      textContent: element.textContent,
      attributes: {},
    };

    // Store all attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      this.originalElementState.attributes[attr.name] = attr.value;
    }

    console.log("💾 Original element state stored:", this.originalElementState);
  }

  /**
   * Restore element to its original state
   * @param {Element} element - Target DOM element
   */
  restoreOriginalElementState(element) {
    if (!this.originalElementState) {
      console.warn("⚠️ No original state to restore");
      return element; // Return the element as is
    }

    console.log("🔄 Restoring element to original state...");

    // Check if tag has changed and needs to be restored
    const currentTag = element.tagName.toLowerCase();
    const originalTag = this.originalElementState.tagName;

    let targetElement = element;

    if (currentTag !== originalTag) {
      console.log(
        `🏷️ Restoring tag: "${currentTag.toUpperCase()}" → "${originalTag.toUpperCase()}"`
      );

      try {
        // Create element with original tag
        const restoredElement = document.createElement(originalTag);

        // Restore content
        restoredElement.innerHTML = this.originalElementState.innerHTML;

        // Replace current element with restored element
        if (element.parentNode) {
          element.parentNode.replaceChild(restoredElement, element);
          targetElement = restoredElement;

          // Update current target element reference
          this.currentTargetElement = restoredElement;
        } else {
          console.error("❌ Cannot restore tag - element has no parent");
          return element;
        }
      } catch (error) {
        console.error("❌ Failed to restore original tag:", error.message);
        return element;
      }
    }

    // Restore basic properties
    targetElement.id = this.originalElementState.id;
    targetElement.className = this.originalElementState.className;
    targetElement.style.cssText = this.originalElementState.style;

    // Restore attributes
    Object.entries(this.originalElementState.attributes).forEach(
      ([name, value]) => {
        if (!["id", "class", "style"].includes(name.toLowerCase())) {
          try {
            targetElement.setAttribute(name, value);
          } catch (error) {
            console.warn(
              `⚠️ Could not restore attribute ${name}: ${error.message}`
            );
          }
        }
      }
    );

    // Update tag display field to show original tag
    this.updateTagDisplayField(originalTag);

    console.log("✅ Element restored to original state");

    // Remove preview mode indicator
    this.removePreviewModeIndicator(targetElement);

    return targetElement;
  }

  /**
   * Initialize real-time preview for all form inputs
   * @param {Element} modal - Modal DOM element
   * @param {Element} targetElement - Target DOM element to preview changes
   */
  initializeRealTimePreview(modal, targetElement) {
    console.log("🎭 Initializing real-time preview...");

    // Basic Info inputs (ID and Tag)
    const idInput = modal.querySelector('[id^="basic_id"]');
    if (idInput) {
      idInput.addEventListener("input", (event) => {
        this.previewIdChange(targetElement, event.target.value);
      });
    }

    // Element tag change handling with debouncing
    const tagSelect = modal.querySelector("#element_tag");
    if (tagSelect) {
      // Clear any existing timeout
      if (this.tagChangeTimeout) {
        clearTimeout(this.tagChangeTimeout);
      }

      tagSelect.addEventListener("change", (event) => {
        if (event.target.value) {
          // Clear previous timeout
          if (this.tagChangeTimeout) {
            clearTimeout(this.tagChangeTimeout);
          }

          // Debounce tag changes to prevent rapid-fire issues
          this.tagChangeTimeout = setTimeout(() => {
            const currentTarget = this.currentTargetElement || targetElement;
            if (currentTarget && currentTarget.parentNode) {
              this.previewTagChange(currentTarget, event.target.value);
            } else {
              console.warn("⚠️ No valid target element for tag change");
            }
            this.tagChangeTimeout = null;
          }, 100); // 100ms debounce
        }
      });
    }

    // Style inputs
    const styleInputs = modal.querySelectorAll('[id^="style_"]');
    styleInputs.forEach((input) => {
      const property = input.id.replace(/^style_/, "").replace(/_\d+$/, "");
      input.addEventListener("input", (event) => {
        this.previewStyleChange(targetElement, property, event.target.value);
      });
    });

    // Special handling for unified border color
    const unifiedBorderColorInputs = modal.querySelectorAll(
      '[data-unified-border-color="true"]'
    );
    unifiedBorderColorInputs.forEach((input) => {
      input.addEventListener("input", (event) => {
        // Apply to all border color properties
        const borderColorProperties = [
          "border-color",
          "border-top-color",
          "border-right-color",
          "border-bottom-color",
          "border-left-color",
        ];

        borderColorProperties.forEach((property) => {
          this.previewStyleChange(targetElement, property, event.target.value);
        });

        console.log(
          `🔄 Unified border color applied: ${event.target.value} to all border sides`
        );
      });
    });

    // Special handling for unified border style
    const unifiedBorderStyleInputs = modal.querySelectorAll(
      '[data-unified-border-style="true"]'
    );
    unifiedBorderStyleInputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        // Apply to all border style properties
        const borderStyleProperties = [
          "border-style",
          "border-top-style",
          "border-right-style",
          "border-bottom-style",
          "border-left-style",
        ];

        borderStyleProperties.forEach((property) => {
          this.previewStyleChange(targetElement, property, event.target.value);
        });

        console.log(
          `🎯 Unified border style applied: ${event.target.value} to all border sides`
        );
      });
    });

    // Class checkboxes
    const classCheckboxes = modal.querySelectorAll('input[name="classes[]"]');
    classCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        this.previewClassToggle(
          targetElement,
          event.target.value,
          event.target.checked
        );
      });
    });

    // Attribute inputs
    const attributeInputs = modal.querySelectorAll('[id^="attr_"]');
    attributeInputs.forEach((input) => {
      const attrName = input.id.replace(/^attr_/, "").replace(/_\d+$/, "");
      input.addEventListener("input", (event) => {
        this.previewAttributeChange(
          targetElement,
          attrName,
          event.target.value
        );
      });
    });

    // Text content inputs
    const textInputs = modal.querySelectorAll('[id^="text_"]');
    textInputs.forEach((input) => {
      input.addEventListener("input", (event) => {
        this.previewTextChange(targetElement, event.target.value);
      });
    });

    console.log("✅ Real-time preview initialized for all form inputs");
  }

  /**
   * Preview ID change
   * @param {Element} element - Target element
   * @param {string} newId - New ID value
   */
  previewIdChange(element, newId) {
    console.log(`🆔 Preview ID change: "${element.id}" → "${newId}"`);
    element.id = newId.trim();
  }

  /**
   * Preview tag change by replacing the element
   * @param {Element} element - Target element to replace
   * @param {string} newTag - New HTML tag name
   */
  previewTagChange(element, newTag) {
    // Always use the current target element to avoid stale references
    const currentElement = this.currentTargetElement || element;

    console.log(
      `🏷️ Preview tag change: "${
        currentElement.tagName
      }" → "${newTag.toUpperCase()}"`
    );

    if (currentElement.tagName.toLowerCase() === newTag.toLowerCase()) {
      console.log(`🏷️ Tag unchanged, skipping replacement`);
      return;
    }

    try {
      // Validate element has a parent
      if (!currentElement.parentNode) {
        console.error(`❌ Element has no parent node, cannot replace`);
        return;
      }

      // Create new element with new tag
      const newElement = document.createElement(newTag);

      // Copy all attributes from old element
      Array.from(currentElement.attributes).forEach((attr) => {
        try {
          newElement.setAttribute(attr.name, attr.value);
        } catch (attrError) {
          console.warn(
            `⚠️ Could not copy attribute ${attr.name}: ${attrError.message}`
          );
        }
      });

      // Copy innerHTML (content)
      newElement.innerHTML = currentElement.innerHTML;

      // Remove preview indicator from old element before replacement
      this.removePreviewModeIndicator(currentElement);

      // Replace the element in DOM
      const parentNode = currentElement.parentNode;
      parentNode.replaceChild(newElement, currentElement);

      // Update current target element reference
      this.currentTargetElement = newElement;

      // Add visual feedback to new element
      this.addPreviewModeIndicator(newElement);

      console.log(
        `✅ Tag changed successfully from "${
          currentElement.tagName
        }" to "${newTag.toUpperCase()}"`
      );

      // Update the tag display field if it exists
      this.updateTagDisplayField(newTag);
    } catch (error) {
      console.error(`❌ Failed to change tag: ${error.message}`);
      console.error("Element details:", {
        tagName: currentElement.tagName,
        hasParent: !!currentElement.parentNode,
        parentTagName: currentElement.parentNode
          ? currentElement.parentNode.tagName
          : "none",
        newTag: newTag,
      });
    }
  }

  /**
   * Update the tag display field after a successful tag change
   * @param {string} newTag - New tag name
   */
  updateTagDisplayField(newTag) {
    try {
      const tagDisplayInput = document.querySelector("#element_tag_display");
      if (tagDisplayInput) {
        tagDisplayInput.value = newTag.toUpperCase();
        console.log(`📝 Updated tag display field to: ${newTag.toUpperCase()}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not update tag display field: ${error.message}`);
    }
  }

  /**
   * Preview style change
   * @param {Element} element - Target element
   * @param {string} property - CSS property
   * @param {string} value - CSS value
   */
  previewStyleChange(element, property, value) {
    console.log(`🎨 Preview style change: ${property} = "${value}"`);
    if (value.trim()) {
      element.style.setProperty(property, value.trim());
    } else {
      element.style.removeProperty(property);
    }
  }

  /**
   * Preview class toggle
   * @param {Element} element - Target element
   * @param {string} className - Class name
   * @param {boolean} isChecked - Whether checkbox is checked
   */
  previewClassToggle(element, className, isChecked) {
    console.log(`📝 Preview class toggle: ${className} = ${isChecked}`);
    if (isChecked) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  /**
   * Preview nx-col class change
   * @param {Element} element - Target element
   * @param {string} prefix - Class prefix (e.g., 'nx-col')
   * @param {string} newValue - New class value (e.g., 'nx-col-8')
   */
  previewClassChange(element, prefix, newValue) {
    console.log(`📐 Preview ${prefix} change: → ${newValue}`);

    // Remove existing nx-col classes
    const classesToRemove = [];
    element.classList.forEach((cls) => {
      if (cls.startsWith(prefix + "-")) {
        classesToRemove.push(cls);
      }
    });
    classesToRemove.forEach((cls) => element.classList.remove(cls));

    // Add new class
    element.classList.add(newValue);
  }

  /**
   * Preview attribute change
   * @param {Element} element - Target element
   * @param {string} attrName - Attribute name
   * @param {string} attrValue - Attribute value
   */
  previewAttributeChange(element, attrName, attrValue) {
    console.log(`🔧 Preview attribute change: ${attrName} = "${attrValue}"`);
    if (attrValue.trim()) {
      element.setAttribute(attrName, attrValue.trim());
    } else {
      element.removeAttribute(attrName);
    }
  }

  /**
   * Preview text content change
   * @param {Element} element - Target element
   * @param {string} newText - New text content
   */
  previewTextChange(element, newText) {
    console.log(`📄 Preview text change: → "${newText}"`);

    // Find direct text nodes and update the first one
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = newText;
        return;
      }
    }

    // If no text node exists, create one
    if (newText.trim()) {
      const textNode = document.createTextNode(newText);
      element.appendChild(textNode);
    }
  }

  /**
   * Add visual feedback to show element is in preview mode
   * @param {Element} element - Target element
   */
  addPreviewModeIndicator(element) {
    // Add data attribute to identify this element for DOM recovery
    element.setAttribute("data-nexa-preview", "true");

    // Add CSS class for visual highlight
    element.classList.add("nexa-element-editing");

    // Add preview mode styles if not already added
    this.addPreviewModeStyles();

    console.log("✨ Preview mode indicator added to element");
  }

  /**
   * Remove visual feedback from element
   * @param {Element} element - Target element
   */
  removePreviewModeIndicator(element) {
    if (element) {
      // Remove data attribute
      element.removeAttribute("data-nexa-preview");

      // Remove CSS class
      element.classList.remove("nexa-element-editing");
      console.log("🔄 Preview mode indicator removed from element");
    }
  }

  /**
   * Add CSS styles for preview mode indicator
   */
  addPreviewModeStyles() {
    const styleId = "preview-mode-styles";

    // Check if styles are already added
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .nexa-element-editing {
        outline: 3px dashed #007bff !important;
        outline-offset: 2px !important;
        background-color: rgba(0, 123, 255, 0.05) !important;
        position: relative !important;
        transition: all 0.3s ease !important;
      }
      
      .nexa-element-editing::before {
        content: "🎭 PREVIEW MODE - Changes are live!";
        position: absolute;
        top: -30px;
        left: 0;
        background: #007bff;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 100;
        white-space: nowrap;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      
      .nexa-element-editing:hover {
        background-color: rgba(0, 123, 255, 0.1) !important;
      }
    `;

    document.head.appendChild(style);
  }

}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = elementsForm;
} else if (typeof window !== "undefined") {
  window.elementsForm = elementsForm;
}
export { elementsForm };
