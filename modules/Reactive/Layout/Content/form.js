/**
 * Form.js - Simple Form Component
 * Basic form component for NexaReactive
 */

import { initData } from "./Percent/index.js";

class Form {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.nexaUI = interactions.nexaUI;
  }

  /**
   * Create a simple form element
   */
  createForm(title = "Form", fields = []) {
    const formId = `form-${Date.now()}`;

    // Default fields if none provided
    if (fields.length === 0) {
      fields = [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: false,
        },
      ];
    }

    // Generate form fields
    const formFields = fields
      .map((field) => {
        if (field.type === "textarea") {
          return `
          <div class="nexa-form-field" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <textarea 
              name="${field.name}" 
              ${field.required ? "required" : ""}
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                resize: vertical;
                min-height: 80px;
              "
              placeholder="Enter ${field.label.toLowerCase()}..."
            ></textarea>
          </div>
        `;
        } else {
          return `
          <div class="nexa-form-field" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <input 
              type="${field.type}" 
              name="${field.name}" 
              ${field.required ? "required" : ""}
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
              "
              placeholder="Enter ${field.label.toLowerCase()}..."
            />
          </div>
        `;
        }
      })
      .join("");

    const formHTML = `
      <div class="nexa-form-container" id="${formId}" style="
        width: 100%;
        margin: 10px 0;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        <div class="nexa-form-header" style="
          margin-bottom: 20px;
          text-align: center;
          border-bottom: 2px solid #f8f9fa;
          padding-bottom: 15px;
        ">
          <h3 style="margin: 0; color: #333; font-size: 18px;">${title}</h3>
        </div>
        
        <form class="nexa-form" style="margin: 0;">
          ${formFields}
          
          <div class="nexa-form-actions" style="
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          ">
            <button type="button" class="nexa-form-btn reset" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Reset</button>
            <button type="submit" class="nexa-form-btn submit" style="
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Submit</button>
          </div>
        </form>
      </div>
    `;

    return formHTML;
  }

  /**
   * Insert form element into target element
   */
  async insertForm(targetElement, options = {}) {
    try {
      if (!targetElement) {
        console.error("No target element provided");
        return { success: false, error: "No target element" };
      }

      // Extract package information
      const packageKey = options.packageKey;
      const packageData = options.packageData;
      const packageType = packageData?.type || "default";
      const dataform = await initData(packageData);
      console.log(dataform);

      console.log(
        `📝 Form component for package: ${packageKey} (${packageType})`,
        {
          packageKey,
          packageData,
          options,
        }
      );

      const title =
        options.title || this.getFormTitleForPackage(packageKey, packageType);
      const fields =
        options.fields || this.getFormFieldsForPackage(packageType);

      const formHTML = this.createForm(title, fields);

      // Insert into target element
      targetElement.insertAdjacentHTML("beforeend", formHTML);

      // Add package-specific styling or attributes
      const formElement = targetElement.querySelector(".nexa-form-container");
      if (formElement) {
        formElement.setAttribute("data-package-key", packageKey || "");
        formElement.setAttribute("data-package-type", packageType);
        formElement.classList.add(`nexa-form-${packageType}`);
      }

      // Add event listeners
      this.addFormEventListeners(formElement);

      console.log("✅ Form element inserted successfully");
      return {
        success: true,
        message: `Form element inserted successfully for ${
          packageKey || "default"
        }`,
        element: formElement,
        packageInfo: { packageKey, packageType, packageData },
      };
    } catch (error) {
      console.error("❌ Error inserting form element:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get form title based on package
   */
  getFormTitleForPackage(packageKey, packageType) {
    const titleMap = {
      petani: `${packageKey} Data Form`,
      transaksi: `${packageKey} Form`,
      project: `${packageKey} Form`,
      default: "Contact Form",
    };
    return titleMap[packageType] || titleMap["default"];
  }

  /**
   * Get form fields based on package type
   */
  getFormFieldsForPackage(packageType) {
    const fieldsMap = {
      petani: [
        {
          name: "nama_petani",
          label: "Nama Petani",
          type: "text",
          required: true,
        },
        {
          name: "luas_lahan",
          label: "Luas Lahan (hektar)",
          type: "number",
          required: true,
        },
        {
          name: "jenis_tanaman",
          label: "Jenis Tanaman",
          type: "text",
          required: true,
        },
        { name: "alamat", label: "Alamat", type: "textarea", required: false },
      ],
      transaksi: [
        {
          name: "nomor_transaksi",
          label: "Nomor Transaksi",
          type: "text",
          required: true,
        },
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        { name: "jumlah", label: "Jumlah", type: "number", required: true },
        {
          name: "keterangan",
          label: "Keterangan",
          type: "textarea",
          required: false,
        },
      ],
      project: [
        {
          name: "nama_project",
          label: "Nama Project",
          type: "text",
          required: true,
        },
        { name: "status", label: "Status", type: "text", required: true },
        { name: "deadline", label: "Deadline", type: "date", required: true },
        {
          name: "deskripsi",
          label: "Deskripsi",
          type: "textarea",
          required: false,
        },
      ],
      default: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: false,
        },
      ],
    };
    return fieldsMap[packageType] || fieldsMap["default"];
  }

  /**
   * Add event listeners to form
   */
  addFormEventListeners(formElement) {
    if (!formElement) return;

    const form = formElement.querySelector(".nexa-form");
    const resetBtn = formElement.querySelector(".nexa-form-btn.reset");
    const submitBtn = formElement.querySelector(".nexa-form-btn.submit");

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetForm(form);
      });
    }

    // Submit button
    if (submitBtn) {
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.submitForm(form);
      });
    }
  }

  /**
   * Reset form
   */
  resetForm(form) {
    if (!form) return;

    form.reset();
    console.log("✅ Form reset");
  }

  /**
   * Submit form
   */
  submitForm(form) {
    if (!form) return;

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    console.log("✅ Form submitted:", data);
    alert("Form submitted! Check console for data.");
  }
}

export { Form };
