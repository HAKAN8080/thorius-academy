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
      form.insertBefore(notices, form.firstElementChild);
    }
  });

  // Kupon alanını varsayılan açık tut + placeholder
  var couponToggle = document.querySelector(
    ".woocommerce-form-coupon-toggle"
  );
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
      couponInput.setAttribute(
        "placeholder",
        "Kupon kodu (örn. UYE20)"
      );
      couponInput.removeAttribute("hidden");
    }
  }
});
