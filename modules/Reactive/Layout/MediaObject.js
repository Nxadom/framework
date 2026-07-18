/**
 * MediaObject.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class MediaObject {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;
  }
  /**
   * Get lightweight Unsplash images for grid (curated selection)
   */
  getGridUnsplashImages() {
    // FIXED: Set image resolution to 512x512 for consistent sizing in Add Images feature
    return [
      {
        thumb:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop&crop=center",
        photographer: "Sergey Pesterev",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=512&h=512&fit=crop&crop=center",
        photographer: "Ales Krivec",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=512&h=512&fit=crop&crop=center",
        photographer: "Jakub Kapusnak",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop&crop=center",
        photographer: "Beautiful Nature",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=512&h=512&fit=crop&crop=center",
        photographer: "Luke Chesser",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=512&h=512&fit=crop&crop=center",
        photographer: "Benjamin Combs",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=512&h=512&fit=crop&crop=center",
        photographer: "Ales Krivec",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=512&h=512&fit=crop&crop=center",
        photographer: "Oliver Hale",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=512&h=512&fit=crop&crop=center",
        photographer: "John Towner",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=512&h=512&fit=crop&crop=center",
        photographer: "Thomas Kelley",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1484600899469-230e8d1d59c0?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1484600899469-230e8d1d59c0?w=512&h=512&fit=crop&crop=center",
        photographer: "Casey Horner",
      },
      {
        thumb:
          "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&h=200&fit=crop",
        url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=512&h=512&fit=crop&crop=center",
        photographer: "Simon Berger",
      },
    ];
  }

  /**
   * Context menu: Insert media object
   */
  contextInsertMediaObject(mediaType) {
    try {
      const mediaElement = this.createMediaObject(mediaType);
      this.insertElementAtTarget(mediaElement);

      return {
        success: true,
        message: `${mediaType} media object created successfully`,
      };
    } catch (error) {
      console.error("Failed to insert media object:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert element at target position (similar to Elements class pattern)
   */
  insertElementAtTarget(element) {
    // Get target element from interactions
    const targetElement = this.interactions.targetElement;

    console.log("🎯 Inserting media object at target:", {
      targetElement: targetElement,
      element: element,
      targetHasParent: !!targetElement?.parentNode,
    });

    try {
      if (targetElement && targetElement.parentNode) {
        // Insert after the target element
        targetElement.parentNode.insertBefore(
          element,
          targetElement.nextSibling
        );
        console.log("✅ Media object inserted after target element");
      } else if (targetElement) {
        // If target has no parent, try to append to target itself
        targetElement.appendChild(element);
        console.log("✅ Media object appended to target element");
      } else {
        // Fallback: append to body
        document.body.appendChild(element);
        console.log("✅ Media object appended to body (fallback)");
      }
    } catch (insertError) {
      console.warn(
        "⚠️ Failed to insert at target, trying fallback:",
        insertError
      );
      // Final fallback: append to body
      try {
        document.body.appendChild(element);
        console.log("✅ Media object appended to body (error recovery)");
      } catch (fallbackError) {
        console.error(
          "❌ Failed to insert media object anywhere:",
          fallbackError
        );
        throw new Error(
          "Could not insert media object: " + fallbackError.message
        );
      }
    }
  }

  /**
   * Create Media Object based on type
   */
  createMediaObject(mediaType) {
    const mediaContainer = document.createElement("div");

    // Base classes for all media objects
    let classes = ["nx-media"];

    // Add type-specific classes
    switch (mediaType) {
      case "basic":
        // Just basic nx-media class
        break;
      case "centered":
        classes.push("nx-media-center");
        break;
      case "bottom":
        classes.push("nx-media-bottom");
        break;
      case "reverse":
        classes.push("nx-media-reverse");
        break;
      case "small":
        classes.push("nx-media-sm");
        break;
      case "large":
        classes.push("nx-media-lg");
        break;
      case "bordered":
        classes.push("nx-media-bordered");
        break;
      case "hover":
        classes.push("nx-media-hover");
        break;
      case "round":
        // Will use nx-media-img-round on the image instead
        break;
      case "grayscale":
        // Grayscale photo effect using Picsum
        break;
      case "blurred":
        // Blurred photo effect using Picsum
        break;
      case "specific":
        // Specific photo ID using Picsum
        break;
      default:
        // Default to basic
        break;
    }

    mediaContainer.className = classes.join(" ");

    // Create media content based on type
    const imageClass =
      mediaType === "round" ? "nx-media-img-round" : "nx-media-img";

    // Use curated Unsplash photos for lightweight loading
    const unsplashImages = this.getGridUnsplashImages();
    const imageIndex =
      Math.abs(mediaType.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      unsplashImages.length;
    const selectedImage = unsplashImages[imageIndex];
    const imageUrl = selectedImage.thumb; // Use thumbnail for faster loading

    // Fallback SVG for offline or error cases
    const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#4f46e5"/>
        <text x="32" y="38" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">User</text>
      </svg>
    `)}`;

    mediaContainer.innerHTML = `
      <img src="${imageUrl}" 
           alt="Photo by ${selectedImage.photographer}" 
           class="${imageClass}"
           loading="lazy"
           onerror="this.src='${fallbackSvg}';">
      <div class="nx-media-body">
        <h5>Media Object ${
          mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
        }</h5>
        <p>This is a ${mediaType} media object example. You can replace this text with your own content and update the image source.</p>
      </div>
    `;

    return mediaContainer;
  }

  struktur() {
    return [
      {
        id: "media-object",
        icon: "user",
        text: "Media Object",
        action: "mediaObject",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "media-basic-types",
            icon: "grid",
            text: "Basic Types",
            action: "mediaBasicTypes",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "media-basic",
                icon: "user",
                text: "Basic Media",
                action: "insertMediaBasic",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-centered",
                icon: "align-center",
                text: "Centered Media",
                action: "insertMediaCentered",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-bottom",
                icon: "align-justify",
                text: "Bottom Aligned",
                action: "insertMediaBottom",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-reverse",
                icon: "rotate-ccw",
                text: "Reverse Media",
                action: "insertMediaReverse",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "media-sizes",
            icon: "move",
            text: "Size Variants",
            action: "mediaSizes",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "media-small",
                icon: "minimize-2",
                text: "Small Media",
                action: "insertMediaSmall",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-large",
                icon: "maximize-2",
                text: "Large Media",
                action: "insertMediaLarge",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "media-styles",
            icon: "star",
            text: "Style Effects",
            action: "mediaStyles",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "media-bordered",
                icon: "square",
                text: "Bordered Media",
                action: "insertMediaBordered",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-hover",
                icon: "mouse-pointer",
                text: "Hover Effect",
                action: "insertMediaHover",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-round",
                icon: "circle",
                text: "Round Image",
                action: "insertMediaRound",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "media-picsum-effects",
            icon: "camera",
            text: "Photo Effects",
            action: "mediaPicsumEffects",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "media-grayscale",
                icon: "filter",
                text: "Grayscale Photo",
                action: "insertMediaGrayscale",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-blurred",
                icon: "droplet",
                text: "Blurred Photo",
                action: "insertMediaBlurred",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "media-specific",
                icon: "image",
                text: "Specific Photo ID",
                action: "insertMediaSpecific",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
        ],
      },
    ];
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = MediaObject;
} else if (typeof window !== "undefined") {
  window.MediaObject = MediaObject;
}

export { MediaObject };
