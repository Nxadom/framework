/**
 * elementsNode - DOM Nodes/Elements Analysis
 * Handle semua analisis dan pengolahan DOM Elements
 */

class elementsNode {
  constructor() {
    // Constructor untuk elementsNode
  }

  /**
   * Analyze ONLY TARGET element (no children) - sesuai permintaan user
   * @param {HTMLElement} targetElement - Element yang akan dianalisis
   * @returns {Object} - Object berisi data HANYA dari target element
   */
  analyzeDOMElement(targetElement) {
    console.log("🎯 Analyzing ONLY target element:", targetElement?.tagName);

    if (!targetElement) {
      console.log("❌ No target element provided");
      return null;
    }

    // Basic element content (untuk reference)
    const elementInfo = {
      innerHTML: targetElement.innerHTML,
      textContent: targetElement.textContent,
      outerHTML: targetElement.outerHTML,
    };

    // Array untuk menyimpan HANYA data target element
    const elementDataArray = [];

    // Analyze HANYA target element (tidak recursive)
    this.analyzeTargetElementOnly(targetElement, elementDataArray);

    console.log("✅ Target-only analysis completed:");
    console.log("  - Total items:", elementDataArray.length);
    console.log("  - All items are from TARGET element only");

    return {
      elementInfo: elementInfo,
      elementDataArray: elementDataArray,
    };
  }

  /**
   * Analyze HANYA target element (tidak menganalisis child elements)
   * @param {HTMLElement} element - Element yang akan dianalisis
   * @param {Array} dataArray - Array untuk menyimpan hasil analisis
   */
  analyzeTargetElementOnly(element, dataArray) {
    console.log("🔍 Processing target element only:", element.tagName);

    // Tag
    dataArray.push({
      type: "tag",
      elementType: "target",
      depth: 0,
      value: element.tagName,
      prefix: "",
    });

    // ID - jika ada
    if (element.id) {
      console.log("🆔 Found element ID:", element.id);
      dataArray.push({
        type: "id",
        elementType: "target",
        depth: 0,
        value: element.id,
        prefix: "",
      });
    }

    // Classes - jika ada
    console.log("📝 Processing classes, count:", element.classList.length);
    for (let i = 0; i < element.classList.length; i++) {
      console.log(`  - Class: ${element.classList[i]}`);
      dataArray.push({
        type: "class",
        elementType: "target",
        depth: 0,
        value: element.classList[i],
        prefix: "",
      });
    }

    // Inline Styles - jika ada
    console.log("🎨 Processing inline styles, count:", element.style.length);
    for (let i = 0; i < element.style.length; i++) {
      const property = element.style[i];
      const value = element.style.getPropertyValue(property);
      console.log(`  - Style: ${property} = ${value}`);
      dataArray.push({
        type: "style",
        elementType: "target",
        depth: 0,
        property: property,
        value: value,
        prefix: "",
      });
    }

    // Attributes - semua attributes
    console.log("🔧 Processing attributes, count:", element.attributes.length);
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      console.log(`  - Attribute: ${attr.name} = ${attr.value}`);
      dataArray.push({
        type: "attribute",
        elementType: "target",
        depth: 0,
        name: attr.name,
        value: attr.value,
        prefix: "",
      });
    }

    // Direct text content HANYA dari target element (bukan dari child)
    console.log("📄 Processing direct text nodes from target");
    if (element.childNodes) {
      for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          console.log(`  - Text node: "${node.textContent.trim()}"`);
          dataArray.push({
            type: "textNode",
            elementType: "target",
            depth: 0,
            value: node.textContent.trim(),
            prefix: "",
          });
        }
      }
    }

    console.log(
      "✅ Target element analysis completed, items added:",
      dataArray.length
    );
  }

  /**
   * OLD Recursive function - TIDAK DIGUNAKAN LAGI
   * @param {HTMLElement} element - Element yang akan dianalisis
   * @param {Array} dataArray - Array untuk menyimpan hasil analisis
   * @param {Number} depth - Kedalaman element (0 = root)
   * @deprecated Use analyzeTargetElementOnly instead
   */
  analyzeElementRecursive(element, dataArray, depth = 0) {
    const elementPrefix = depth === 0 ? "target" : "child";
    const depthPrefix = depth > 0 ? `[depth-${depth}]` : "";

    // Tag
    dataArray.push({
      type: "tag",
      elementType: elementPrefix,
      depth: depth,
      value: element.tagName,
      prefix: depthPrefix,
    });

    // innerHTML (hanya untuk target element)
    if (depth === 0) {
      dataArray.push({
        type: "innerHTML",
        elementType: elementPrefix,
        depth: depth,
        value: element.innerHTML,
        prefix: depthPrefix,
      });

      // textContent (hanya untuk target element)
      dataArray.push({
        type: "textContent",
        elementType: elementPrefix,
        depth: depth,
        value: element.textContent,
        prefix: depthPrefix,
      });

      // outerHTML (hanya untuk target element)
      dataArray.push({
        type: "outerHTML",
        elementType: elementPrefix,
        depth: depth,
        value: element.outerHTML,
        prefix: depthPrefix,
      });
    }

    // Style - jika ada
    for (let i = 0; i < element.style.length; i++) {
      const property = element.style[i];
      const value = element.style.getPropertyValue(property);
      dataArray.push({
        type: "style",
        elementType: elementPrefix,
        depth: depth,
        property: property,
        value: value,
        prefix: depthPrefix,
      });
    }

    // Class - jika ada
    for (let i = 0; i < element.classList.length; i++) {
      dataArray.push({
        type: "class",
        elementType: elementPrefix,
        depth: depth,
        value: element.classList[i],
        prefix: depthPrefix,
      });
    }

    // ID - jika ada
    if (element.id) {
      dataArray.push({
        type: "id",
        elementType: elementPrefix,
        depth: depth,
        value: element.id,
        prefix: depthPrefix,
      });
    }

    // Attribute - semua attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      dataArray.push({
        type: "attribute",
        elementType: elementPrefix,
        depth: depth,
        name: attr.name,
        value: attr.value,
        prefix: depthPrefix,
      });
    }

    // Text content untuk semua elements (target dan child)
    if (element.childNodes) {
      for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          dataArray.push({
            type: "textNode",
            elementType: depth === 0 ? "target" : "child",
            depth: depth,
            value: node.textContent.trim(),
            prefix: depthPrefix,
          });
        }
      }
    }

    // NOTE: Recursive analysis DIHAPUS - hanya analyze target element saja
    // Tidak menganalisis child elements lagi sesuai permintaan user
  }

  /**
   * Log DOM Element analysis ke console - HANYA target element
   * @param {HTMLElement} targetElement - Element yang akan dianalisis
   */
  logDOMAnalysis(targetElement) {
    const analysis = this.analyzeDOMElement(targetElement);

    if (!analysis) {
      console.log("❌ No target element to analyze");
      return;
    }

    console.log("📋 TARGET ELEMENT Data Array (no children):");
    console.log("  - Total items:", analysis.elementDataArray.length);
    console.log(
      "  - Element tag:",
      analysis.elementDataArray.find((item) => item.type === "tag")?.value
    );
    console.log(
      "  - Styles count:",
      analysis.elementDataArray.filter((item) => item.type === "style").length
    );
    console.log(
      "  - Classes count:",
      analysis.elementDataArray.filter((item) => item.type === "class").length
    );
    console.log(
      "  - Attributes count:",
      analysis.elementDataArray.filter((item) => item.type === "attribute")
        .length
    );
    console.log(
      "  - Text nodes count:",
      analysis.elementDataArray.filter((item) => item.type === "textNode")
        .length
    );
    console.log("📋 Full Element Data Array:", analysis.elementDataArray);
  }

  /**
   * Get specific data type from element
   * @param {HTMLElement} targetElement - Element yang akan dianalisis
   * @param {String} dataType - Type data yang diinginkan (tag, style, class, id, attribute)
   * @returns {Array} - Array data sesuai type yang diminta
   */
  getElementDataByType(targetElement, dataType) {
    const analysis = this.analyzeDOMElement(targetElement);

    if (!analysis) {
      return [];
    }

    return analysis.elementDataArray.filter((item) => item.type === dataType);
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = elementsNode;
} else if (typeof window !== "undefined") {
  window.elementsNode = elementsNode;
}
export { elementsNode };
