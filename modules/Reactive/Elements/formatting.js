class Formatting {
  constructor(data = null) {
    this.data = data;
    this.nexaUI = NexaUI();
    this.domAnalyzer = new elementsNode(); // Initialize elementsNode instance
    this.formGenerator = new elementsForm(); // Initialize elementsForm instance
    this.currentTargetElement = null; // Store reference to current target element being edited

    // Setup global functions for modal integration
    this.setupGlobalFunctions();
  }
  struktur() {
    return [
      {
        id: "formatting-elements",
        icon: "layout",
        text: "Formatting Elements",
        action: "formattingElements",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "heading-elements",
            icon: "type",
            text: "Heading Elements",
            action: "headingElements",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "insert-h1",
                icon: "type",
                text: "H1 - Main Title",
                action: "insertH1",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "insert-h2",
                icon: "type",
                text: "H2 - Section Title",
                action: "insertH2",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "insert-h3",
                icon: "type",
                text: "H3 - Subsection",
                action: "insertH3",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "insert-h4",
                icon: "type",
                text: "H4 - Sub-subsection",
                action: "insertH4",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "insert-h5",
                icon: "type",
                text: "H5 - Minor heading",
                action: "insertH5",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "insert-h6",
                icon: "type",
                text: "H6 - Smallest",
                action: "insertH6",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "grid-element",
            icon: "grid",
            text: "Grid Element",
            action: "gridElement",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "grid-col-1",
                icon: "square",
                text: "1 Column",
                action: "addGridColumn1",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-2",
                icon: "square",
                text: "2 Columns",
                action: "addGridColumn2",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-3",
                icon: "square",
                text: "3 Columns",
                action: "addGridColumn3",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-4",
                icon: "square",
                text: "4 Columns",
                action: "addGridColumn4",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-5",
                icon: "square",
                text: "5 Columns",
                action: "addGridColumn5",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-6",
                icon: "square",
                text: "6 Columns",
                action: "addGridColumn6",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-7",
                icon: "square",
                text: "7 Columns",
                action: "addGridColumn7",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-8",
                icon: "square",
                text: "8 Columns",
                action: "addGridColumn8",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-9",
                icon: "square",
                text: "9 Columns",
                action: "addGridColumn9",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-10",
                icon: "square",
                text: "10 Columns",
                action: "addGridColumn10",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-11",
                icon: "square",
                text: "11 Columns",
                action: "addGridColumn11",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "grid-col-12",
                icon: "square",
                text: "12 Columns",
                action: "addGridColumn12",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "separator-headings",
            type: "separator",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-paragraph",
            icon: "align-left",
            text: "Paragraph (p)",
            action: "insertParagraph",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-span",
            icon: "type",
            text: "Span (inline text)",
            action: "insertSpan",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-strong",
            icon: "bold",
            text: "Strong (bold emphasis)",
            action: "insertStrong",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-em",
            icon: "italic",
            text: "Em (italic emphasis)",
            action: "insertEm",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-mark",
            icon: "edit-2",
            text: "Mark (highlighted text)",
            action: "insertMark",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-small",
            icon: "minus",
            text: "Small (fine print)",
            action: "insertSmall",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "insert-div",
            icon: "square",
            text: "Div (division)",
            action: "insertDiv",
            showCondition: "hasNoSelectedText",
          },
        ],
      }
    ];
  }
}
// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Formatting;
} else if (typeof window !== "undefined") {
  window.Formatting = Formatting;
}
export { Formatting };
