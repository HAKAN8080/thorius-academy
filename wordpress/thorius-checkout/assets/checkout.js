document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector("form.checkout");
  if (!form) {
    return;
  }

  var noticeSelectors = [
    ".woocommerce-NoticeGroup",
    ".woocommerce-NoticeGroup-checkout",
    ".woocommerce-notices-wrapper",
  ];

  noticeSelectors.forEach(function (selector) {
    var notices = form.querySelector(selector);
    if (notices && form.firstElementChild !== notices) {
      form.insertBefore(notices, form.firstChild);
    }
  });

  // Kupon alanını varsayılan açık tut + placeholder
  var couponToggle = document.querySelector(".woocommerce-form-coupon-toggle");
  if (couponToggle) {
    couponToggle.style.display = "none";
  }

  var couponForm = document.querySelector("form.checkout_coupon");
  if (couponForm) {
    couponForm.style.display = "block";
    couponForm.classList.remove("hidden");
    couponForm.style.marginBottom = "20px";

    var couponInput = couponForm.querySelector("#coupon_code");
    if (couponInput) {
      couponInput.setAttribute("placeholder", "Kupon kodu (örn. UYE20)");
      couponInput.removeAttribute("hidden");
    }
  }

  function fieldValue(selector) {
    var el = form.querySelector(selector);
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function termsChecked() {
    var terms = form.querySelector("#terms, input[name='terms']");
    return Boolean(terms && terms.checked);
  }

  function collectMissing() {
    var missing = [];
    if (!fieldValue("#billing_first_name")) {
      missing.push("Ad");
    }
    if (!fieldValue("#billing_last_name")) {
      missing.push("Soyad");
    }
    var email = fieldValue("#billing_email");
    if (!email) {
      missing.push("E-posta");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      missing.push("Geçerli e-posta");
    }
    if (!fieldValue("#billing_phone")) {
      missing.push("Telefon");
    }
    if (!termsChecked()) {
      missing.push("Şartlar ve koşullar onayı");
    }
    return missing;
  }

  function showClientErrors(missing) {
    var existing = form.querySelector(".thorius-client-checkout-errors");
    if (existing) {
      existing.remove();
    }

    var box = document.createElement("div");
    box.className =
      "woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout thorius-client-checkout-errors";
    var items = missing
      .map(function (item) {
        return "<li><strong>" + item + "</strong> eksik veya geçersiz.</li>";
      })
      .join("");
    box.innerHTML =
      '<ul class="woocommerce-error" role="alert">' +
      "<li>Ödemeye geçmeden önce şu alanları tamamlayın:</li>" +
      items +
      "</ul>";
    form.insertBefore(box, form.firstChild);
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearClientErrors() {
    var existing = form.querySelector(".thorius-client-checkout-errors");
    if (existing) {
      existing.remove();
    }
  }

  function syncPlaceOrderButton() {
    var btn = form.querySelector("#place_order");
    if (!btn) return;
    var missing = collectMissing();
    var blocked = missing.length > 0;
    // Buton tıklanabilir kalsın — tıklanınca eksikleri listeleriz.
    btn.disabled = false;
    btn.removeAttribute("aria-disabled");
    btn.classList.toggle("thorius-place-order-blocked", blocked);
    if (!blocked) {
      clearClientErrors();
    }
  }

  ["input", "change", "keyup", "blur"].forEach(function (evt) {
    form.addEventListener(evt, function (event) {
      var t = event.target;
      if (!t) return;
      if (
        t.id === "billing_first_name" ||
        t.id === "billing_last_name" ||
        t.id === "billing_email" ||
        t.id === "billing_phone" ||
        t.id === "terms" ||
        t.name === "terms"
      ) {
        syncPlaceOrderButton();
      }
    });
  });

  // WooCommerce updated_checkout sonrası butonu yeniden bağla
  if (window.jQuery) {
    window.jQuery(document.body).on("updated_checkout", function () {
      syncPlaceOrderButton();
    });

    window.jQuery("form.checkout").on("checkout_place_order", function () {
      var missing = collectMissing();
      if (missing.length === 0) {
        clearClientErrors();
        return true;
      }
      showClientErrors(missing);
      syncPlaceOrderButton();
      return false;
    });
  }

  form.addEventListener(
    "submit",
    function (event) {
      var missing = collectMissing();
      if (missing.length === 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      showClientErrors(missing);
      syncPlaceOrderButton();
    },
    true
  );

  syncPlaceOrderButton();
});
