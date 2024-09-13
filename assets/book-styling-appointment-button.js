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

const isCloseBtn = (button) => {
  if (
    button ==
      document.querySelector(
        ".book-appointment-button .modal-wrapper .close-btn svg path"
      ) ||
    button ==
      document.querySelector(
        ".book-appointment-button .modal-wrapper .close-btn svg"
      ) ||
    button ==
      document.querySelector(
        ".book-appointment-button .modal-wrapper .close-btn "
      )
  ) {
    return true;
  }
  return false;
};
waitForElem(".book-appointment-button .button-wrapper button", ([button]) => {
  button.addEventListener("click", () => {
    button.closest(".book-appointment-button").classList.add("active");
    document.body.classList.add("scroll-off");
  });
  button.closest(".book-appointment-button").addEventListener("click", (e) => {
    if (
      e.target ==
        document.querySelector(".book-appointment-button .modal-wrapper") ||
      isCloseBtn(e.target)
    ) {
      button.closest(".book-appointment-button").classList.remove("active");
      document.body.classList.remove("scroll-off");
    }
  });
});
