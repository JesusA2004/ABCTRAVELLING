document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("registroForm");
  if (!form) return;

  var fileInput = document.getElementById("logotipo_empresa");
  var uploadLabel = document.getElementById("uploadLabel");
  var filePreview = document.getElementById("filePreview");
  var previewThumb = document.getElementById("previewThumb");
  var previewName = document.getElementById("previewName");
  var previewType = document.getElementById("previewType");
  var removeFileBtn = document.getElementById("removeFileBtn");
  var submitBtn = document.getElementById("submitBtn");
  var submitText = document.getElementById("submitText");
  var btnLoader = submitBtn ? submitBtn.querySelector(".btn-loader") : null;
  var formStatus = document.getElementById("formStatus");
  var fileName = document.getElementById("fileName");

  var langToggle = document.getElementById("langToggle");
  var langThumb = document.getElementById("langThumb");
  var langEsText = document.getElementById("langEsText");
  var langEnText = document.getElementById("langEnText");

  var currentLang = "es";
  var allowedExtensions = ["png", "jpg", "jpeg", "webp", "svg", "pdf"];
  var maxFileSize = 8 * 1024 * 1024;

  var i18n = {
    es: {
      pageTitle: "FORMULARIO<br>DE REGISTRO",
      subtitleText:
        "Debe completar todo el formulario con la información original tal y como se encuentra reflejada en los documentos oficiales.",
      subtitleStrong: "Todos los campos son obligatorios.",

      labels: {
        correo_principal: "Correo*",
        nombre_comercial: "Nombre comercial*",
        logotipo_empresa: "Logotipo de empresa*",
        owner_name: "Nombre del dueño o gerente*",
        correo_contacto: "Correo de contacto*",
        telefono: "Teléfono*",
        mercados: "Mercados operados*",
        modelo_negocio: "Modelo de negocio*",
        usuario_principal_nombre: "Nombre y apellido del usuario principal*",
        usuario_principal_correo: "Correo del usuario principal*",
        usuario_principal_telefono: "Teléfono del usuario principal*",
        promociones: "¿Desea recibir promociones y ofertas vía correo electrónico?*"
      },

      uploadTitle: "Subir archivo",
      uploadSubtitle: "PNG, JPG, WEBP, SVG o PDF",
      uploadButton: "Seleccionar",
      fileNone: "Ningún archivo seleccionado",
      previewImage: "Vista previa de imagen",
      previewPdf: "Documento PDF",

      yes: "Sí",
      no: "No",
      submit: "ENVIAR",

      errors: {
        required: "Este campo es obligatorio.",
        email: "Ingresa un correo válido.",
        phone: "Debe tener entre 10 y 12 números.",
        fileRequired: "Debes subir un archivo.",
        fileType: "Solo se permiten PNG, JPG, JPEG, WEBP, SVG o PDF.",
        fileSize: "El archivo supera el máximo permitido de 8MB.",
        modelRequired: "Selecciona al menos un modelo de negocio.",
        radioRequired: "Selecciona una opción."
      },

      statusFix: "Corrige los campos marcados antes de enviar.",
      statusSending: "Enviando registro...",
      statusSuccess: "Registro enviado correctamente.",
      statusError: "Ocurrió un error al enviar.",

      help: {
        correo_principal: {
          title: "Correo",
          text: "Correo general del negocio o institución que se desea incorporar."
        },
        nombre_comercial: {
          title: "Nombre comercial",
          text: "Es el nombre con el que el negocio, empresa o marca opera públicamente."
        },
        logotipo_empresa: {
          title: "Logotipo de empresa",
          text: "Sube el logo oficial de la empresa o marca en imagen o PDF."
        },
        owner_name: {
          title: "Dueño o gerente",
          text: "Persona responsable principal del negocio o institución."
        },
        correo_contacto: {
          title: "Correo de contacto",
          text: "Correo específico de seguimiento o atención del negocio."
        },
        telefono: {
          title: "Teléfono",
          text: "Número de contacto del negocio o institución. Solo 10 a 12 dígitos."
        },
        mercados: {
          title: "Mercados operados",
          text: "Regiones, ciudades, segmentos o mercados donde opera el negocio."
        },
        modelo_negocio: {
          title: "Modelo de negocio",
          text: "Selecciona uno o más modelos: B2C, B2B o B2C2B."
        },
        usuario_principal_nombre: {
          title: "Usuario principal",
          text: "Datos de la persona principal que administrará o dará seguimiento a la cuenta."
        },
        usuario_principal_correo: {
          title: "Correo del usuario principal",
          text: "Correo directo de la persona principal que gestionará la cuenta."
        },
        usuario_principal_telefono: {
          title: "Teléfono del usuario principal",
          text: "Número directo del usuario principal. Solo 10 a 12 dígitos."
        },
        promociones: {
          title: "Promociones",
          text: "Indica si desea recibir promociones y comunicaciones comerciales por correo."
        }
      }
    },

    en: {
      pageTitle: "REGISTRATION<br>FORM",
      subtitleText:
        "Please complete the form using the original information exactly as it appears in the official documents.",
      subtitleStrong: "All fields are required.",

      labels: {
        correo_principal: "Email*",
        nombre_comercial: "Business name*",
        logotipo_empresa: "Company logo*",
        owner_name: "Owner or manager name*",
        correo_contacto: "Contact email*",
        telefono: "Phone*",
        mercados: "Operated markets*",
        modelo_negocio: "Business model*",
        usuario_principal_nombre: "Main user full name*",
        usuario_principal_correo: "Main user email*",
        usuario_principal_telefono: "Main user phone*",
        promociones: "Would you like to receive promotions and offers by email?*"
      },

      uploadTitle: "Upload file",
      uploadSubtitle: "PNG, JPG, WEBP, SVG or PDF",
      uploadButton: "Select",
      fileNone: "No file selected",
      previewImage: "Image preview",
      previewPdf: "PDF document",

      yes: "Yes",
      no: "No",
      submit: "SUBMIT",

      errors: {
        required: "This field is required.",
        email: "Enter a valid email.",
        phone: "It must contain between 10 and 12 digits.",
        fileRequired: "You must upload a file.",
        fileType: "Only PNG, JPG, JPEG, WEBP, SVG or PDF files are allowed.",
        fileSize: "The file exceeds the maximum size of 8MB.",
        modelRequired: "Select at least one business model.",
        radioRequired: "Select an option."
      },

      statusFix: "Please correct the highlighted fields before submitting.",
      statusSending: "Sending registration...",
      statusSuccess: "Registration sent successfully.",
      statusError: "An error occurred while sending.",

      help: {
        correo_principal: {
          title: "Email",
          text: "General email of the business or institution being incorporated."
        },
        nombre_comercial: {
          title: "Business name",
          text: "This is the public name used by the business, company or brand."
        },
        logotipo_empresa: {
          title: "Company logo",
          text: "Upload the official company or brand logo in image or PDF format."
        },
        owner_name: {
          title: "Owner or manager",
          text: "Main responsible person of the business or institution."
        },
        correo_contacto: {
          title: "Contact email",
          text: "Specific email for follow-up or business support."
        },
        telefono: {
          title: "Phone",
          text: "Business or institution contact number. Only 10 to 12 digits."
        },
        mercados: {
          title: "Operated markets",
          text: "Regions, cities, segments or markets where the business operates."
        },
        modelo_negocio: {
          title: "Business model",
          text: "Select one or more models: B2C, B2B or B2C2B."
        },
        usuario_principal_nombre: {
          title: "Main user",
          text: "Details of the main person who will manage or follow up the account."
        },
        usuario_principal_correo: {
          title: "Main user email",
          text: "Direct email of the main person managing the account."
        },
        usuario_principal_telefono: {
          title: "Main user phone",
          text: "Direct phone number of the main user. Only 10 to 12 digits."
        },
        promociones: {
          title: "Promotions",
          text: "Indicates whether the user wants to receive promotional email communications."
        }
      }
    }
  };

  var labelMap = {
    correo_principal: document.getElementById("label_correo_principal"),
    nombre_comercial: document.getElementById("label_nombre_comercial"),
    logotipo_empresa: document.getElementById("label_logotipo_empresa"),
    owner_name: document.getElementById("label_owner_name"),
    correo_contacto: document.getElementById("label_correo_contacto"),
    telefono: document.getElementById("label_telefono"),
    mercados: document.getElementById("label_mercados"),
    modelo_negocio: document.getElementById("label_modelo_negocio"),
    usuario_principal_nombre: document.getElementById("label_usuario_principal_nombre"),
    usuario_principal_correo: document.getElementById("label_usuario_principal_correo"),
    usuario_principal_telefono: document.getElementById("label_usuario_principal_telefono"),
    promociones: document.getElementById("label_promociones")
  };

  function safeSetText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function safeSetHTML(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function updateLangToggle() {
    if (!langToggle) return;

    langToggle.setAttribute("data-lang", currentLang);

    if (langThumb) {
      if (currentLang === "en") {
        langThumb.classList.add("is-en");
      } else {
        langThumb.classList.remove("is-en");
      }
    }

    if (langEsText && langEnText) {
      if (currentLang === "es") {
        langEsText.className = "lang-text-active";
        langEnText.className = "lang-text-inactive";
      } else {
        langEsText.className = "lang-text-inactive";
        langEnText.className = "lang-text-active";
      }
    }
  }

  function renderHelpPopovers() {
    var popovers = document.querySelectorAll(".help-popover");

    for (var i = 0; i < popovers.length; i++) {
      var popover = popovers[i];
      var key = popover.getAttribute("data-help-box");
      if (!key || !i18n[currentLang].help[key]) continue;

      var item = i18n[currentLang].help[key];
      popover.innerHTML =
        '<span class="help-popover-title">' + item.title + "</span>" +
        '<span class="help-popover-text">' + item.text + "</span>";
    }
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;

    safeSetHTML("pageTitle", i18n[currentLang].pageTitle);
    safeSetText("subtitleText", i18n[currentLang].subtitleText + " ");
    safeSetText("subtitleStrong", i18n[currentLang].subtitleStrong);

    for (var key in labelMap) {
      if (labelMap[key] && i18n[currentLang].labels[key]) {
        labelMap[key].textContent = i18n[currentLang].labels[key];
      }
    }

    safeSetText("uploadTitle", i18n[currentLang].uploadTitle);
    safeSetText("uploadSubtitle", i18n[currentLang].uploadSubtitle);
    safeSetText("uploadButton", i18n[currentLang].uploadButton);
    safeSetText("radio_yes", i18n[currentLang].yes);
    safeSetText("radio_no", i18n[currentLang].no);

    if (submitText) {
      submitText.textContent = i18n[currentLang].submit;
    }

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      validateFile(fileInput);
    } else if (fileName) {
      fileName.textContent = i18n[currentLang].fileNone;
    }

    renderHelpPopovers();
    updateLangToggle();
  }

  function closeAllHelp() {
    var popovers = document.querySelectorAll(".help-popover");
    for (var i = 0; i < popovers.length; i++) {
      popovers[i].hidden = true;
    }
  }

  document.addEventListener("click", function (e) {
    var helpButton = e.target.closest(".help-btn");
    var insideLabelWrap = e.target.closest(".label-wrap");

    if (helpButton) {
      e.preventDefault();
      e.stopPropagation();

      var key = helpButton.getAttribute("data-help");
      if (!key) return;

      var popover = document.querySelector('[data-help-box="' + key + '"]');
      if (!popover) return;

      var shouldOpen = popover.hidden;
      closeAllHelp();
      popover.hidden = !shouldOpen;
      return;
    }

    if (!insideLabelWrap) {
      closeAllHelp();
    }
  });

  if (langToggle) {
    langToggle.addEventListener("click", function (e) {
      e.preventDefault();
      currentLang = currentLang === "es" ? "en" : "es";
      applyTranslations();
    });
  }

  function getErrorElement(field) {
    var wrap = field.closest(".field-wrap");
    if (!wrap) return null;
    return wrap.querySelector(".error-text");
  }

  function setError(field, message) {
    var errorEl = getErrorElement(field);

    if (field.type === "file") {
      if (uploadLabel) uploadLabel.classList.add("upload-error");
    } else {
      field.classList.add("input-error");
    }

    if (errorEl) errorEl.textContent = message;
  }

  function clearError(field) {
    var errorEl = getErrorElement(field);

    if (field.type === "file") {
      if (uploadLabel) uploadLabel.classList.remove("upload-error");
    } else {
      field.classList.remove("input-error");
    }

    if (errorEl) errorEl.textContent = "";
  }

  function setGroupError(name, message) {
    var input =
      form.querySelector('[name="' + name + '"]') ||
      form.querySelector('[name="' + name + '[]"]');

    if (!input) return;

    var wrap = input.closest(".field-wrap");
    if (!wrap) return;

    var errorEl = wrap.querySelector(".error-text");
    if (errorEl) errorEl.textContent = message;
  }

  function clearGroupError(name) {
    var input =
      form.querySelector('[name="' + name + '"]') ||
      form.querySelector('[name="' + name + '[]"]');

    if (!input) return;

    var wrap = input.closest(".field-wrap");
    if (!wrap) return;

    var errorEl = wrap.querySelector(".error-text");
    if (errorEl) errorEl.textContent = "";
  }

  function validateRequiredText(field) {
    if (!field) return true;

    var value = field.value.trim();
    if (!value) {
      setError(field, i18n[currentLang].errors.required);
      return false;
    }

    clearError(field);
    return true;
  }

  function validateEmail(field) {
    if (!field) return true;

    var value = field.value.trim();
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      setError(field, i18n[currentLang].errors.required);
      return false;
    }

    if (!regex.test(value)) {
      setError(field, i18n[currentLang].errors.email);
      return false;
    }

    clearError(field);
    return true;
  }

  function validatePhone(field) {
    if (!field) return true;

    var value = field.value.trim();
    var regex = /^[0-9]{10,12}$/;

    if (!value) {
      setError(field, i18n[currentLang].errors.required);
      return false;
    }

    if (!regex.test(value)) {
      setError(field, i18n[currentLang].errors.phone);
      return false;
    }

    clearError(field);
    return true;
  }

  function showPreview(file) {
    if (!filePreview || !previewName || !previewType || !previewThumb || !fileName) return;

    var ext = file.name.split(".").pop().toLowerCase();
    var isImage = ["png", "jpg", "jpeg", "webp", "svg"].indexOf(ext) !== -1;

    filePreview.classList.remove("hidden");
    previewName.textContent = file.name;
    previewType.textContent = isImage ? i18n[currentLang].previewImage : i18n[currentLang].previewPdf;
    fileName.textContent = file.name;

    if (isImage) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        previewThumb.className = "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-200";
        previewThumb.innerHTML = '<img src="' + ev.target.result + '" alt="Preview" class="h-full w-full object-cover">';
      };
      reader.readAsDataURL(file);
    } else {
      previewThumb.className = "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-navy2 to-navy text-white font-extrabold";
      previewThumb.innerHTML = "<span>PDF</span>";
    }
  }

  function clearPreview() {
    if (fileInput) fileInput.value = "";
    if (filePreview) filePreview.classList.add("hidden");

    if (previewThumb) {
      previewThumb.className = "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-200";
      previewThumb.innerHTML = "";
    }

    if (previewName) previewName.textContent = "";
    if (previewType) previewType.textContent = "";
    if (fileName) fileName.textContent = i18n[currentLang].fileNone;
    if (fileInput) clearError(fileInput);
  }

  function validateFile(field) {
    if (!field) return true;

    clearError(field);

    if (!field.files || !field.files.length) {
      setError(field, i18n[currentLang].errors.fileRequired);
      return false;
    }

    var file = field.files[0];
    var ext = file.name.split(".").pop().toLowerCase();

    if (allowedExtensions.indexOf(ext) === -1) {
      setError(field, i18n[currentLang].errors.fileType);
      return false;
    }

    if (file.size > maxFileSize) {
      setError(field, i18n[currentLang].errors.fileSize);
      return false;
    }

    showPreview(file);
    clearError(field);
    return true;
  }

  function validateRadioGroup(name) {
    var radios = form.querySelectorAll('input[name="' + name + '"]');
    var checked = false;

    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        checked = true;
        break;
      }
    }

    if (!checked) {
      setGroupError(name, i18n[currentLang].errors.radioRequired);
      return false;
    }

    clearGroupError(name);
    return true;
  }

  function validateCheckboxGroup(name) {
    var boxes = form.querySelectorAll('input[name="' + name + '[]"]');
    var checked = false;

    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].checked) {
        checked = true;
        break;
      }
    }

    if (!checked) {
      setGroupError(name, i18n[currentLang].errors.modelRequired);
      return false;
    }

    clearGroupError(name);
    return true;
  }

  function allowOnlyNumbers(field) {
    if (!field) return;

    field.setAttribute("maxlength", "12");
    field.setAttribute("inputmode", "numeric");
    field.setAttribute("pattern", "[0-9]*");

    field.addEventListener("input", function () {
      field.value = field.value.replace(/\D/g, "").slice(0, 12);
    });

    field.addEventListener("paste", function (e) {
      e.preventDefault();

      var pasted = ((e.clipboardData || window.clipboardData).getData("text") || "")
        .replace(/\D/g, "")
        .slice(0, 12);

      field.value = pasted;

      var ev;
      try {
        ev = new Event("input", { bubbles: true });
      } catch (err) {
        ev = document.createEvent("Event");
        ev.initEvent("input", true, true);
      }
      field.dispatchEvent(ev);
    });
  }

  var fields = {
    correo_principal: document.getElementById("correo_principal"),
    nombre_comercial: document.getElementById("nombre_comercial"),
    owner_name: document.getElementById("owner_name"),
    correo_contacto: document.getElementById("correo_contacto"),
    telefono: document.getElementById("telefono"),
    mercados: document.getElementById("mercados"),
    usuario_principal_nombre: document.getElementById("usuario_principal_nombre"),
    usuario_principal_correo: document.getElementById("usuario_principal_correo"),
    usuario_principal_telefono: document.getElementById("usuario_principal_telefono")
  };

  allowOnlyNumbers(fields.telefono);
  allowOnlyNumbers(fields.usuario_principal_telefono);

  if (fields.correo_principal) {
    fields.correo_principal.addEventListener("blur", function () {
      validateEmail(fields.correo_principal);
    });
  }

  if (fields.nombre_comercial) {
    fields.nombre_comercial.addEventListener("blur", function () {
      validateRequiredText(fields.nombre_comercial);
    });
  }

  if (fields.owner_name) {
    fields.owner_name.addEventListener("blur", function () {
      validateRequiredText(fields.owner_name);
    });
  }

  if (fields.correo_contacto) {
    fields.correo_contacto.addEventListener("blur", function () {
      validateEmail(fields.correo_contacto);
    });
  }

  if (fields.telefono) {
    fields.telefono.addEventListener("blur", function () {
      validatePhone(fields.telefono);
    });
  }

  if (fields.mercados) {
    fields.mercados.addEventListener("blur", function () {
      validateRequiredText(fields.mercados);
    });
  }

  if (fields.usuario_principal_nombre) {
    fields.usuario_principal_nombre.addEventListener("blur", function () {
      validateRequiredText(fields.usuario_principal_nombre);
    });
  }

  if (fields.usuario_principal_correo) {
    fields.usuario_principal_correo.addEventListener("blur", function () {
      validateEmail(fields.usuario_principal_correo);
    });
  }

  if (fields.usuario_principal_telefono) {
    fields.usuario_principal_telefono.addEventListener("blur", function () {
      validatePhone(fields.usuario_principal_telefono);
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      validateFile(fileInput);
    });
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener("click", function () {
      clearPreview();
    });
  }

  var promocionesRadios = form.querySelectorAll('input[name="promociones"]');
  for (var i = 0; i < promocionesRadios.length; i++) {
    promocionesRadios[i].addEventListener("change", function () {
      validateRadioGroup("promociones");
    });
  }

  var modeloChecks = form.querySelectorAll('input[name="modelo_negocio[]"]');
  for (var j = 0; j < modeloChecks.length; j++) {
    modeloChecks[j].addEventListener("change", function () {
      validateCheckboxGroup("modelo_negocio");
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "mt-3 min-h-[24px] text-sm font-bold";
    }

    var valid = true;

    if (!validateEmail(fields.correo_principal)) valid = false;
    if (!validateRequiredText(fields.nombre_comercial)) valid = false;
    if (!validateFile(fileInput)) valid = false;
    if (!validateRequiredText(fields.owner_name)) valid = false;
    if (!validateEmail(fields.correo_contacto)) valid = false;
    if (!validatePhone(fields.telefono)) valid = false;
    if (!validateRequiredText(fields.mercados)) valid = false;
    if (!validateCheckboxGroup("modelo_negocio")) valid = false;
    if (!validateRequiredText(fields.usuario_principal_nombre)) valid = false;
    if (!validateEmail(fields.usuario_principal_correo)) valid = false;
    if (!validatePhone(fields.usuario_principal_telefono)) valid = false;
    if (!validateRadioGroup("promociones")) valid = false;

    if (!valid) {
      if (formStatus) {
        formStatus.textContent = i18n[currentLang].statusFix;
        formStatus.classList.add("error");
      }
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (btnLoader) btnLoader.classList.remove("hidden");

      if (formStatus) {
        formStatus.textContent = i18n[currentLang].statusSending;
        formStatus.classList.add("success");
      }

      var formData = new FormData(form);

      var response = await fetch("enviar-registro.php", {
        method: "POST",
        body: formData
      });

      var result = {};
      try {
        result = await response.json();
      } catch (err) {}

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || i18n[currentLang].statusError);
      }

      if (formStatus) {
        formStatus.textContent = i18n[currentLang].statusSuccess;
        formStatus.className = "mt-3 min-h-[24px] text-sm font-bold success";
      }

      form.reset();
      clearPreview();
      clearGroupError("promociones");
      clearGroupError("modelo_negocio[]");
      closeAllHelp();
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = error.message || i18n[currentLang].statusError;
        formStatus.className = "mt-3 min-h-[24px] text-sm font-bold error";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnLoader) btnLoader.classList.add("hidden");
    }
  });

  applyTranslations();
});