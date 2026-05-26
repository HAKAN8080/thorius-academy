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
});
