function waitForElem(
  waitFor,
  callback,
  minElements = 1,
  isVariable = false,
  timer = 10000,
  frequency = 25
) {
  let elements = isVariable
    ? window[waitFor]
    : document.querySelectorAll(waitFor);
  if (timer <= 0) return;
  (!isVariable && elements.length >= minElements) ||
  (isVariable && typeof window[waitFor] !== "undefined")
    ? callback(elements)
    : setTimeout(
        () =>
          waitForElem(
            waitFor,
            callback,
            minElements,
            isVariable,
            timer - frequency
          ),
        frequency
      );
}

const updateCartData = (messageTo, message, messageFrom) => {
  setTimeout(() => {
    // console.log(messageTo, message, messageFrom);
    fetch("/cart/update.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({
        attributes: {
          gift_note_to: messageTo,
          gift_note: message,
          gift_note_from: messageFrom,
        },
      }),
    });
  }, 600);
};

const valueUpdate = () => {
  const message = document.querySelector("[data-message-textarea]").value;
  const messageTo = document.querySelector("[data-message-to]").value;
  const messageFrom = document.querySelector("[data-message-from]").value;
  if (document.querySelector("[data-message-textarea]").value) {
    updateCartData(messageTo, message, messageFrom);
  } else {
    updateCartData("", "", "");
  }
};

const addEventOnSaveButton = () => {
  document
    .querySelector(".cart-gift-message [data-save]")
    .addEventListener("click", () => {
      valueUpdate();
    });
};

const updateCheckbox = (checkbox) => {
  if (checkbox.checked) {
    valueUpdate();
    addEventOnSaveButton();
  } else {
    updateCartData("", "", "");
    document.querySelector("[data-message-to]").value = "";
    document.querySelector("[data-message-from]").value = "";
  }
};

waitForElem(".cart-gift-message #add-gift-message", ([checkbox]) => {
  updateCheckbox(checkbox);
  checkbox.addEventListener("input", () => {
    updateCheckbox(checkbox);
  });
});

waitForElem(".cart-gift-message .gift-info input", ([checkbox]) => {
  document
    .querySelectorAll(".cart-gift-message .gift-info input")
    .forEach((input) => {
      input.addEventListener("input", () => {
        document.querySelector(".cart-gift-message [data-save]").textContent =
          "save";
      });
    });
});
