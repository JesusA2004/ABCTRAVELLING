document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  const fileInput = document.getElementById("logotipo_empresa");
  const uploadLabel = document.getElementById("uploadLabel");
  const filePreview = document.getElementById("filePreview");
  const filePreviewThumb = document.getElementById("filePreviewThumb");
  const filePreviewName = document.getElementById("filePreviewName");
  const filePreviewType = document.getElementById("filePreviewType");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  const allowedExtensions = ["png", "jpg", "jpeg", "webp", "svg", "pdf"];
  const maxFileSize = 8 * 1024 * 1024;

  function getErrorElement(field) {
    return field.closest(".field")?.querySelector(".error-text");
  }

  function setError(field, message) {
    const errorEl = getErrorElement(field);
    if (field.type === "file") {
      uploadLabel.classList.add("upload-error");
    } else {
      field.classList.add("input-error");
    }
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(field) {
    const errorEl = getErrorElement(field);
    if (field.type === "file") {
      uploadLabel.classList.remove("upload-error");
    } else {
      field.classList.remove("input-error");
    }
    if (errorEl) errorEl.textContent = "";
  }

  function validateRequiredText(field, label) {
    const value = field.value.trim();
    if (!value) {
      setError(field, `${label} es obligatorio.`);
      return false;
    }
    clearError(field);
    return true;
  }

  function validateEmail(field, label, required = false) {
    const value = field.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      if (required) {
        setError(field, `${label} es obligatorio.`);
        return false;
      }
      clearError(field);
      return true;
    }

    if (!regex.test(value)) {
      setError(field, `${label} no tiene un formato válido.`);
      return false;
    }

    clearError(field);
    return true;
  }

  function validatePhone(field, label, required = false) {
    const value = field.value.trim();
    const regex = /^[0-9+\-\s()]{7,20}$/;

    if (!value) {
      if (required) {
        setError(field, `${label} es obligatorio.`);
        return false;
      }
      clearError(field);
      return true;
    }

    if (!regex.test(value)) {
      setError(field, `${label} no tiene un formato válido.`);
      return false;
    }

    clearError(field);
    return true;
  }

  function showPreview(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext);

    filePreview.hidden = false;
    filePreviewName.textContent = file.name;
    filePreviewType.textContent = isImage ? "Vista previa de imagen" : "Documento PDF";

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreviewThumb.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      filePreviewThumb.innerHTML = `<span>PDF</span>`;
    }
  }

  function clearPreview() {
    fileInput.value = "";
    filePreview.hidden = true;
    filePreviewThumb.innerHTML = "";
    filePreviewName.textContent = "";
    filePreviewType.textContent = "";
    clearError(fileInput);
  }

  function validateFile(field) {
    clearError(field);

    if (!field.files || !field.files.length) {
      clearPreview();
      return true;
    }

    const file = field.files[0];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError(field, "Solo se permiten PNG, JPG, JPEG, WEBP, SVG o PDF.");
      clearPreview();
      return false;
    }

    if (file.size > maxFileSize) {
      setError(field, "El archivo supera el máximo permitido de 8MB.");
      clearPreview();
      return false;
    }

    showPreview(file);
    clearError(field);
    return true;
  }

  function validateRadioGroup(name, message) {
    const radios = form.querySelectorAll(`input[name="${name}"]`);
    if (!radios.length) return true;

    const checked = [...radios].some(r => r.checked);
    const field = radios[0].closest(".field");
    const errorEl = field?.querySelector(".error-text");

    if (!checked) {
      if (errorEl) errorEl.textContent = message;
      return false;
    }

    if (errorEl) errorEl.textContent = "";
    return true;
  }

  if (fileInput) {
    fileInput.addEventListener("change", () => validateFile(fileInput));
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener("click", clearPreview);
  }

  const correoPrincipal = document.getElementById("correo_principal");
  const nombreComercial = document.getElementById("nombre_comercial");
  const telefono = document.getElementById("telefono");
  const correoEmpresa = document.getElementById("correo_empresa");
  const usuarioPrincipalCorreo = document.getElementById("usuario_principal_correo");
  const usuarioPrincipalTelefono = document.getElementById("usuario_principal_telefono");

  correoPrincipal?.addEventListener("blur", () => validateEmail(correoPrincipal, "Correo principal", true));
  nombreComercial?.addEventListener("blur", () => validateRequiredText(nombreComercial, "Nombre comercial / Business name"));
  telefono?.addEventListener("blur", () => validatePhone(telefono, "Teléfono / Phone", true));
  correoEmpresa?.addEventListener("blur", () => validateEmail(correoEmpresa, "Correo empresarial"));
  usuarioPrincipalCorreo?.addEventListener("blur", () => validateEmail(usuarioPrincipalCorreo, "Correo del usuario principal"));
  usuarioPrincipalTelefono?.addEventListener("blur", () => validatePhone(usuarioPrincipalTelefono, "Teléfono del usuario principal"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formStatus.textContent = "";
    formStatus.className = "form-status";

    let valid = true;

    if (!validateEmail(correoPrincipal, "Correo principal", true)) valid = false;
    if (!validateRequiredText(nombreComercial, "Nombre comercial / Business name")) valid = false;
    if (!validatePhone(telefono, "Teléfono / Phone", true)) valid = false;
    if (!validateEmail(correoEmpresa, "Correo empresarial", false)) valid = false;
    if (!validateEmail(usuarioPrincipalCorreo, "Correo del usuario principal", false)) valid = false;
    if (!validatePhone(usuarioPrincipalTelefono, "Teléfono del usuario principal", false)) valid = false;
    if (!validateFile(fileInput)) valid = false;
    if (!validateRadioGroup("promociones", "Selecciona una opción.")) valid = false;

    if (!valid) {
      formStatus.textContent = "Corrige los campos marcados antes de enviar.";
      formStatus.classList.add("error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      formStatus.textContent = "Enviando registro y correo...";
      formStatus.classList.add("success");

      const formData = new FormData(form);

      const response = await fetch("enviar-registro.php", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "No fue posible enviar el formulario.");
      }

      formStatus.textContent = "Registro enviado correctamente. El correo fue procesado.";
      formStatus.className = "form-status success";
      form.reset();
      clearPreview();
    } catch (error) {
      formStatus.textContent = error.message || "Ocurrió un error al enviar.";
      formStatus.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
    }
  });
});