/**
 * carouselElements.js - Carousel Functionality for Elements
 * Provides carousel creation, management, and interaction functionality
 */

class carouselElements {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.carouselElements = new Set();
    this.nexaUI = interactions.nexaUI;
    this.targetElement = interactions.targetElement;
    this.mousePosition = interactions.mousePosition;
    this.savedCursorPosition = null;
    this.rightClickPosition = null;
    this.doubleClickPosition = null;
  }

  struktur() {
    return [
      {
        id: "carousel-element",
        icon: "image",
        text: "Carousel Element",
        action: "carouselElement",
        showCondition: "hasNoSelectedText",
      },
    ];
  }

  /**
   * Context menu: Show carousel elements modal
   */
  contextCarouselElement() {
    try {
      if (!this.interactions.targetElement) {
        return { success: false, error: "No target element" };
      }

      const cursorSaved = this.interactions.saveCursorPosition();
      this.createCarouselElementModal();
      return { success: true, message: "Carousel elements modal opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load carousel CSS if not already loaded
   */
  loadCarouselCSS() {
    const existingLink = document.querySelector('link[href*="carousel.css"]');
    if (existingLink) return;

    const possiblePaths = [
      "./assets/NexaUi/css/carousel.css",
      "../css/carousel.css",
      "./css/carousel.css",
      "/assets/NexaUi/css/carousel.css",
    ];

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = possiblePaths[0];
    link.onerror = () => {};
    document.head.appendChild(link);
  }

  /**
   * Load Material Symbols font if not already loaded
   */
  loadMaterialSymbolsFont() {
    const existingLink = document.querySelector(
      'link[href*="material-symbols-outlined"]'
    );
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
    document.head.appendChild(link);
  }

  /**
   * Create carousel elements modal
   */
  createCarouselElementModal() {
    // Remove existing modal
    const existingModal = document.getElementById("nexa-carousel-modal");
    if (existingModal) {
      existingModal.remove();
    }

    this.loadCarouselCSS();

    const overlay = document.createElement("div");
    overlay.id = "nexa-carousel-modal";
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6); z-index: 10000; display: flex;
      align-items: center; justify-content: center; animation: fadeIn 0.3s ease;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: white; border-radius: 12px; padding: 0; max-width: 900px;
      width: 95%; max-height: 90vh; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); display: flex;
      flex-direction: column; animation: slideIn 0.3s ease;
    `;

    // Modal Header
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex;
      justify-content: space-between; align-items: center; background: #f8fafc;
    `;

    const title = document.createElement("h3");
    title.textContent = "🎠 Create Carousel Element";
    title.style.cssText = `margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;`;

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "×";
    closeBtn.style.cssText = `
      background: none; border: none; font-size: 24px; color: #6b7280;
      cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.2s ease;
    `;

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Modal Content with Tabs
    const content = document.createElement("div");
    content.style.cssText = `flex: 1; display: flex; flex-direction: column; overflow: hidden;`;

    // Tab Navigation
    const tabNav = document.createElement("div");
    tabNav.style.cssText = `display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb;`;

    const tabs = [
      { id: "basic", label: "Basic Settings", icon: "⚙️" },
      { id: "preview", label: "Preview", icon: "👁️" },
    ];

    tabs.forEach((tab, index) => {
      const tabBtn = document.createElement("button");
      tabBtn.className = `btn carousel-tab${index === 0 ? " selected" : ""}`;
      tabBtn.dataset.tab = tab.id;
      tabBtn.innerHTML = `${tab.icon} ${tab.label}`;
      tabBtn.style.flex = "1";
      tabNav.appendChild(tabBtn);
    });

    // Tab Content
    const tabContent = document.createElement("div");
    tabContent.style.cssText = `flex: 1; overflow-y: auto; padding: 24px;`;

    // Default carousel settings
    let carouselConfig = {
      numImages: 3,
      autoplay: true,
      interval: 5000,
      showCaptions: true,
      showNavigation: true,
      showIndicators: true,
      showProgressBar: false,
      images: [
        {
          url: "https://picsum.photos/800/400?random=1",
          title: "Slide 1",
          description: "Description for slide 1",
        },
        {
          url: "https://picsum.photos/800/400?random=2",
          title: "Slide 2",
          description: "Description for slide 2",
        },
        {
          url: "https://picsum.photos/800/400?random=3",
          title: "Slide 3",
          description: "Description for slide 3",
        },
      ],
    };

    const updateImagesArray = () => {
      const currentLength = carouselConfig.images.length;
      const targetLength = carouselConfig.numImages;
      if (targetLength > currentLength) {
        for (let i = currentLength; i < targetLength; i++) {
          carouselConfig.images.push({
            url: `https://picsum.photos/800/400?random=${i + 1}`,
            title: `Slide ${i + 1}`,
            description: `Description for slide ${i + 1}`,
          });
        }
      } else if (targetLength < currentLength) {
        carouselConfig.images = carouselConfig.images.slice(0, targetLength);
      }
    };

    const renderBasicTab = () => {
      tabContent.innerHTML = `
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="num-images">Number of Images <span id="num-images-value">${
              carouselConfig.numImages
            } images</span></label></dt>
            <dd class="form-group-body">
              <input type="range" id="num-images" class="form-control" min="2" max="10" value="${
                carouselConfig.numImages
              }">
            </dd>
          </dl>
        </div>
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label>Autoplay Settings</label></dt>
            <dd class="form-group-body">
              <div class="form-checkbox">
                <label><input type="checkbox" id="autoplay" ${
                  carouselConfig.autoplay ? "checked" : ""
                }> Enable Autoplay</label>
              </div>
              <div id="autoplay-settings" style="display: ${
                carouselConfig.autoplay ? "block" : "none"
              };">
                <label for="interval">Interval (milliseconds)</label>
                <div class="input-group">
                  <input type="number" id="interval" class="form-control" value="${
                    carouselConfig.interval
                  }" min="1000" max="10000" step="500">
                  <div class="input-group-button"><span class="btn" style="pointer-events:none;">ms</span></div>
                </div>
              </div>
            </dd>
          </dl>
        </div>
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label>Visual Features</label></dt>
            <dd class="form-group-body">
              <div class="form-checkbox">
                <label><input type="checkbox" id="show-captions" ${
                  carouselConfig.showCaptions ? "checked" : ""
                }> Show Captions</label>
              </div>
              <div class="form-checkbox">
                <label><input type="checkbox" id="show-navigation" ${
                  carouselConfig.showNavigation ? "checked" : ""
                }> Navigation Arrows</label>
              </div>
              <div class="form-checkbox">
                <label><input type="checkbox" id="show-indicators" ${
                  carouselConfig.showIndicators ? "checked" : ""
                }> Indicators</label>
              </div>
              <div class="form-checkbox">
                <label><input type="checkbox" id="show-progress" ${
                  carouselConfig.showProgressBar ? "checked" : ""
                }> Progress Bar</label>
              </div>
            </dd>
          </dl>
        </div>
      `;

      // Add event listeners for basic settings
      document.getElementById("num-images")?.addEventListener("input", (e) => {
        carouselConfig.numImages = parseInt(e.target.value);
        document.getElementById(
          "num-images-value"
        ).textContent = `${carouselConfig.numImages} images`;
        updateImagesArray();
      });

      document.getElementById("autoplay")?.addEventListener("change", (e) => {
        carouselConfig.autoplay = e.target.checked;
        document.getElementById("autoplay-settings").style.display =
          carouselConfig.autoplay ? "block" : "none";
      });

      document.getElementById("interval")?.addEventListener("input", (e) => {
        carouselConfig.interval = parseInt(e.target.value);
      });

      document
        .getElementById("show-captions")
        ?.addEventListener("change", (e) => {
          carouselConfig.showCaptions = e.target.checked;
        });

      document
        .getElementById("show-navigation")
        ?.addEventListener("change", (e) => {
          carouselConfig.showNavigation = e.target.checked;
        });

      document
        .getElementById("show-indicators")
        ?.addEventListener("change", (e) => {
          carouselConfig.showIndicators = e.target.checked;
        });

      document
        .getElementById("show-progress")
        ?.addEventListener("change", (e) => {
          carouselConfig.showProgressBar = e.target.checked;
        });
    };

    const renderPreviewTab = () => {
      const carouselHtml = this.generateCarouselHTML(carouselConfig);
      tabContent.innerHTML = `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #f9fafb;">
          <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; background: white;">
            <h4 style="margin: 0; color: #374151;">Preview</h4>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">This is how your carousel will look</p>
          </div>
          <div style="padding: 20px; background: white;">
            ${carouselHtml}
          </div>
        </div>
      `;
      setTimeout(() => this.initializeCarouselPreview(), 100);
    };

    const switchTab = (tabId) => {
      document.querySelectorAll(".carousel-tab").forEach((btn) => {
        btn.classList.toggle("selected", btn.dataset.tab === tabId);
      });
      switch (tabId) {
        case "basic":
          renderBasicTab();
          break;
        case "preview":
          renderPreviewTab();
          break;
      }
    };

    tabNav.addEventListener("click", (e) => {
      if (e.target.classList.contains("carousel-tab")) {
        switchTab(e.target.dataset.tab);
      }
    });

    // Modal Footer
    const footer = document.createElement("div");
    footer.style.cssText = `
      padding: 20px 24px; border-top: 1px solid #e5e7eb; display: flex;
      justify-content: space-between; align-items: center; background: #f8fafc;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      padding: 10px 20px; border: 1px solid #d1d5db; background: white;
      color: #374151; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s;
    `;

    const insertBtn = document.createElement("button");
    insertBtn.textContent = "Insert Carousel";
    insertBtn.style.cssText = `
      padding: 10px 20px; border: none; background: #4f46e5; color: white;
      border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s;
    `;

    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);

    // Assemble modal
    content.appendChild(tabNav);
    content.appendChild(tabContent);
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();

    // Event listeners
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    insertBtn.addEventListener("click", () => {
      const result = this.insertCarouselAtPosition(carouselConfig);
      if (result.success) closeModal();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    switchTab("basic");

    // Add CSS animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { transform: scale(0.9) translateY(-20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
  }

  /**
   * Generate carousel HTML structure
   */
  generateCarouselHTML(config) {
    this.loadMaterialSymbolsFont();

    const {
      images,
      showCaptions,
      showNavigation,
      showIndicators,
      showProgressBar,
      autoplay,
      interval,
    } = config;

    const itemsHtml = images
      .map(
        (img, index) => `
      <div class="nx-carousel-item ${
        index === 0 ? "active" : ""
      }" data-slide="${index}">
        <img src="${img.url}" alt="${
          img.title || `Slide ${index + 1}`
        }" loading="lazy">
        ${
          showCaptions
            ? `
          <div class="nx-carousel-caption">
            <h5>${img.title || `Slide ${index + 1}`}</h5>
            <p>${img.description || ""}</p>
          </div>
        `
            : ""
        }
      </div>
    `
      )
      .join("");

    const indicatorsHtml = showIndicators
      ? `
      <div class="nx-carousel-indicators">
        ${images
          .map(
            (_, index) => `
          <button type="button" data-slide-to="${index}" ${
              index === 0 ? 'class="active"' : ""
            }></button>
        `
          )
          .join("")}
      </div>
    `
      : "";

    const navigationHtml = showNavigation
      ? `
       <button class="nx-carousel-prev" type="button" data-slide="prev">
         <span class="material-symbols-outlined">chevron_left</span>
       </button>
       <button class="nx-carousel-next" type="button" data-slide="next">
         <span class="material-symbols-outlined">chevron_right</span>
       </button>
     `
      : "";

    const progressBarHtml = showProgressBar
      ? `
      <div class="nx-carousel-progress"><div class="progress-bar"></div></div>
    `
      : "";

    const autoplayToggleHtml = autoplay
      ? `
       <button class="nx-carousel-play-toggle" type="button" title="Pause/Play">
         <span class="material-symbols-outlined">pause</span>
       </button>
     `
      : "";

    return `
      <div class="nx-carousel ${autoplay ? "nx-carousel-pause-hover" : ""}" 
           data-autoplay="${autoplay}" 
           data-interval="${interval}"
           data-show-captions="${showCaptions}"
           data-show-navigation="${showNavigation}"
           data-show-indicators="${showIndicators}"
           data-show-progress="${showProgressBar}">
        <div class="nx-carousel-inner">${itemsHtml}</div>
        ${navigationHtml}${indicatorsHtml}${progressBarHtml}${autoplayToggleHtml}
      </div>
    `;
  }

  /**
   * Insert carousel at cursor position
   */
  insertCarouselAtPosition(config) {
    try {
      if (!config || !config.images || config.images.length < 2) {
        return {
          success: false,
          error: "Carousel must have at least 2 images",
        };
      }

      this.loadCarouselCSS();
      const carouselHtml = this.generateCarouselHTML(config);
      const carouselContainer = document.createElement("div");
      carouselContainer.className = "carousel-container nexa-inserted-carousel";
      carouselContainer.innerHTML = carouselHtml;

      const carouselId = `nexa-carousel-${Date.now()}`;
      const carousel = carouselContainer.querySelector(".nx-carousel");
      carousel.id = carouselId;

      let insertMethod = "target-element";
      const targetElement = this.interactions.targetElement;

      if (targetElement) {
        if (targetElement.nodeType === Node.TEXT_NODE) {
          targetElement.parentNode.insertBefore(
            carouselContainer,
            targetElement.nextSibling
          );
        } else {
          targetElement.appendChild(carouselContainer);
        }
      } else {
        document.body.appendChild(carouselContainer);
        insertMethod = "body-fallback";
      }

      setTimeout(
        () => this.initializeCarouselFunctionality(carouselId, config),
        100
      );

      return {
        success: true,
        message: `Carousel inserted - ${config.numImages} images carousel ready`,
        carouselId: carouselId,
        insertMethod: insertMethod,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize carousel functionality for preview
   */
  initializeCarouselPreview() {
    const carousel = document.querySelector(
      "#nexa-carousel-modal .nx-carousel"
    );
    if (!carousel) return;

    const config = {
      autoplay: carousel.dataset.autoplay === "true",
      interval: parseInt(carousel.dataset.interval) || 5000,
      showNavigation: carousel.dataset.showNavigation === "true",
      showIndicators: carousel.dataset.showIndicators === "true",
      showProgress: carousel.dataset.showProgress === "true",
    };

    this.initializeCarouselFunctionality("preview-carousel", config, carousel);
  }

  /**
   * Initialize carousel functionality
   */
  initializeCarouselFunctionality(carouselId, config, carouselElement = null) {
    const carousel = carouselElement || document.getElementById(carouselId);
    if (!carousel) return;

    const items = carousel.querySelectorAll(".nx-carousel-item");
    const indicators = carousel.querySelectorAll(
      ".nx-carousel-indicators button"
    );
    const prevBtn = carousel.querySelector(".nx-carousel-prev");
    const nextBtn = carousel.querySelector(".nx-carousel-next");
    const progressBar = carousel.querySelector(
      ".nx-carousel-progress .progress-bar"
    );

    let currentSlide = 0;
    let isPlaying = config.autoplay;
    let autoplayTimer = null;

    const showSlide = (index) => {
      items.forEach((item) => item.classList.remove("active"));
      indicators.forEach((indicator) => indicator.classList.remove("active"));

      if (index >= items.length) index = 0;
      if (index < 0) index = items.length - 1;
      currentSlide = index;

      items[currentSlide].classList.add("active");
      if (indicators[currentSlide])
        indicators[currentSlide].classList.add("active");

      if (progressBar && isPlaying) {
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        setTimeout(() => {
          progressBar.style.transition = `width ${config.interval}ms linear`;
          progressBar.style.width = "100%";
        }, 50);
      }
    };

    const startAutoplay = () => {
      if (!isPlaying) return;
      autoplayTimer = setTimeout(() => {
        showSlide(currentSlide + 1);
        startAutoplay();
      }, config.interval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        autoplayTimer = null;
      }
      if (progressBar) {
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
      }
    };

    // Event listeners
    if (prevBtn && config.showNavigation) {
      prevBtn.addEventListener("click", () => {
        stopAutoplay();
        showSlide(currentSlide - 1);
        if (isPlaying) setTimeout(startAutoplay, 100);
      });
    }

    if (nextBtn && config.showNavigation) {
      nextBtn.addEventListener("click", () => {
        stopAutoplay();
        showSlide(currentSlide + 1);
        if (isPlaying) setTimeout(startAutoplay, 100);
      });
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        stopAutoplay();
        showSlide(index);
        if (isPlaying) setTimeout(startAutoplay, 100);
      });
    });

    // Touch/swipe support
    let startX = 0;
    carousel.addEventListener(
      "touchstart",
      (e) => (startX = e.touches[0].clientX)
    );
    carousel.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      if (Math.abs(diffX) > 50) {
        stopAutoplay();
        diffX > 0 ? showSlide(currentSlide + 1) : showSlide(currentSlide - 1);
        if (isPlaying) setTimeout(startAutoplay, 100);
      }
    });

    // Keyboard navigation
    carousel.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          stopAutoplay();
          showSlide(currentSlide - 1);
          if (isPlaying) setTimeout(startAutoplay, 100);
          break;
        case "ArrowRight":
          e.preventDefault();
          stopAutoplay();
          showSlide(currentSlide + 1);
          if (isPlaying) setTimeout(startAutoplay, 100);
          break;
        case " ":
          e.preventDefault();
          isPlaying = !isPlaying;
          isPlaying ? startAutoplay() : stopAutoplay();
          break;
      }
    });

    carousel.setAttribute("tabindex", "0");
    showSlide(0);
    if (config.autoplay) startAutoplay();
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = carouselElements;
} else if (typeof window !== "undefined") {
  window.carouselElements = carouselElements;
}

export { carouselElements };
