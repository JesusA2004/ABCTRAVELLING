document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  const fileInput = document.getElementById("logotipo_empresa");
  const uploadLabel = document.getElementById("uploadLabel");
  const filePreview = document.getElementById("filePreview");
  const previewThumb = document.getElementById("previewThumb");
  const previewName = document.getElementById("previewName");
  const previewType = document.getElementById("previewType");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");
  const fileName = document.getElementById("fileName");

  const allowedExtensions = ["png", "jpg", "jpeg", "webp", "svg", "pdf"];
  const maxFileSize = 8 * 1024 * 1024; // 8MB

  function getErrorElement(field) {
    const group = field.closest(".form-group");
    if (!group) return null;
    const errors = group.querySelectorAll(".error-text");
    return errors.length ? errors[errors.length - 1] : null;
  }

  function setError(field, message) {
    const errorEl = getErrorElement(field);

    if (field.type === "file") {
      uploadLabel.classList.add("upload-error");
    } else {
      field.classList.add("input-error");
    }

    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearError(field) {
    const errorEl = getErrorElement(field);

    if (field.type === "file") {
      uploadLabel.classList.remove("upload-error");
    } else {
      field.classList.remove("input-error");
    }

    if (errorEl) {
      errorEl.textContent = "";
    }
  }

  function setGroupErrorByName(name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;

    const group = input.closest(".form-group");
    if (!group) return;

    const errors = group.querySelectorAll(".error-text");
    const errorEl = errors.length ? errors[errors.length - 1] : null;

    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearGroupErrorByName(name) {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;

    const group = input.closest(".form-group");
    if (!group) return;

    const errors = group.querySelectorAll(".error-text");
    const errorEl = errors.length ? errors[errors.length - 1] : null;

    if (errorEl) {
      errorEl.textContent = "";
    }
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
  const regex = /^[0-9]{10,12}$/;

  if (!value) {
    if (required) {
      setError(field, `${label} es obligatorio.`);
      return false;
    }
    clearError(field);
    return true;
  }

  if (!regex.test(value)) {
    setError(field, `${label} debe tener entre 10 y 12 números.`);
    return false;
  }

  clearError(field);
  return true;
}

  function showPreview(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext);

  filePreview.hidden = false;
  previewName.textContent = file.name;
  previewType.textContent = isImage ? "Vista previa de imagen" : "Documento PDF";
  fileName.textContent = file.name;

  if (isImage) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewThumb.className = "preview-thumb";
      previewThumb.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
    };
    reader.readAsDataURL(file);
  } else {
    previewThumb.className = "preview-thumb pdf-thumb";
    previewThumb.innerHTML = `<span>PDF</span>`;
  }
}

  function clearPreview() {
    fileInput.value = "";
    filePreview.hidden = true;
    previewThumb.className = "preview-thumb";
    previewThumb.innerHTML = "";
    previewName.textContent = "";
    previewType.textContent = "";
    fileName.textContent = "Ningún archivo seleccionado";
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

    const checked = [...radios].some((radio) => radio.checked);

    if (!checked) {
      setGroupErrorByName(name, message);
      return false;
    }

    clearGroupErrorByName(name);
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

  function allowOnlyNumbers(field) {
    if (!field) return;

    field.setAttribute("maxlength", "12");
    field.setAttribute("inputmode", "numeric");
    field.setAttribute("pattern", "[0-9]*");

    field.addEventListener("input", () => {
      field.value = field.value.replace(/\D/g, "").slice(0, 12);
    });

    field.addEventListener("paste", (e) => {
      e.preventDefault();

      const pasted = (e.clipboardData || window.clipboardData)
        .getData("text")
        .replace(/\D/g, "");

      const current = field.value.replace(/\D/g, "");
      const spaceLeft = 12 - current.length;

      field.value = (current + pasted.slice(0, spaceLeft)).slice(0, 12);

      field.dispatchEvent(new Event("input", { bubbles: true }));
    });

    field.addEventListener("keypress", (e) => {
      const char = String.fromCharCode(e.which || e.keyCode);

      if (!/[0-9]/.test(char)) {
        e.preventDefault();
        return;
      }

      if (field.value.length >= 12) {
        e.preventDefault();
      }
    });
  }

allowOnlyNumbers(telefono);

  correoPrincipal?.addEventListener("blur", () => {
    validateEmail(correoPrincipal, "Correo", true);
  });

  nombreComercial?.addEventListener("blur", () => {
    validateRequiredText(nombreComercial, "Nombre Comercial / Business name");
  });

  telefono?.addEventListener("blur", () => {
    validatePhone(telefono, "Teléfono/Phone", true);
  });

  correoEmpresa?.addEventListener("blur", () => {
    validateEmail(correoEmpresa, "Correo / Email", false);
  });

  usuarioPrincipalCorreo?.addEventListener("blur", () => {
    validateEmail(usuarioPrincipalCorreo, "Correo - Usuario Principal", false);
  });

  usuarioPrincipalTelefono?.addEventListener("blur", () => {
    validatePhone(usuarioPrincipalTelefono, "Teléfono - Usuario Principal", false);
  });

  const radiosPromociones = form.querySelectorAll('input[name="promociones"]');
  radiosPromociones.forEach((radio) => {
    radio.addEventListener("change", () => {
      validateRadioGroup("promociones", "Selecciona una opción.");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    formStatus.textContent = "";
    formStatus.className = "form-status";

    let valid = true;

    if (!validateEmail(correoPrincipal, "Correo", true)) valid = false;
    if (!validateRequiredText(nombreComercial, "Nombre Comercial / Business name")) valid = false;
    if (!validatePhone(telefono, "Teléfono/Phone", true)) valid = false;
    if (!validateEmail(correoEmpresa, "Correo / Email", false)) valid = false;
    if (!validateEmail(usuarioPrincipalCorreo, "Correo - Usuario Principal", false)) valid = false;
    if (!validatePhone(usuarioPrincipalTelefono, "Teléfono - Usuario Principal", false)) valid = false;
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
      clearGroupErrorByName("promociones");
    } catch (error) {
      formStatus.textContent = error.message || "Ocurrió un error al enviar.";
      formStatus.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
    }
  });
});