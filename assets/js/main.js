const url = window.location.pathname;
const emailRe =
  /^[a-zA-Z0-9.!#$%&'*+\=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
$(window).on(`load`, function () {
  console.log(`Start`);
  console.log(url);

  allPages();
  function allPages() {
    // Navigation button
    $(`#ham`).click(() => {
      $(`#menu`).toggle();
    });

    // Scroll to top
    scrollToTop();

    // Navigation Menu
    ajaxCall(`navMenu`, createNavigation);

    // Footer email check
    $(`#footerSub`).click(() => {
      let emailFooter = $(`#subsEmail`).val();
      let footerError = 0;
      footerError = FormRegex(emailFooter, `mailFooter`, emailRe, footerError);
      if (!footerError) {
        $(`#emailFooterSuccess`).css(`display`, `block`);
        $(`#subsEmail`).val(``);
        let timer = setTimeout(() => {
          $(`#emailFooterSuccess`).css(`display`, `none`);
        }, 4000);
      }
    });
  }

  if (url == `/sollai/` || url == `/sollai/index.html`) {
    // Index Page products

    ajaxCall(
      `products`,
      otherPagesProductCreation,
      `productsHomePage`,
      `bestSeller`
    );

    // Subjects in the contact form
    ajaxCall(`subject`, createDdl, `subject`, `SUBJECT *`);

    // Slider

    slider();

    // Form check

    let firstAndLastNameRe = /^([A-ZČĆŽŠĐ]{1}([a-zčćžšđ]){1,15})$/;
    let countryRe = /^[a-zA-Z]{2,}$/;
    // email regex is global

    $(`#submitForm`).click((e) => {
      e.preventDefault();
      let firstName = $(`#firstName`).val();
      let lastName = $(`#lastName`).val();
      let country = $(`#country`).val();
      let email = $(`#email`).val();

      // counter
      let errorCounter = 0;

      // Name, Country. Email validation
      errorCounter = FormRegex(
        firstName,
        `firstNameRe`,
        firstAndLastNameRe,
        errorCounter
      );
      errorCounter = FormRegex(
        lastName,
        `lastNameRe`,
        firstAndLastNameRe,
        errorCounter
      );
      errorCounter = FormRegex(country, `countryRe`, countryRe, errorCounter);
      errorCounter = FormRegex(email, `mailRe`, emailRe, errorCounter);

      // radio buttons validation
      let radioNu;
      let radios = $(`input[name="gender"]`);
      for (let i = 0; i < radios.length; i++) {
        if (radios[0].checked == false && radios[1].checked == false) {
          $(`#genderRe`).css(`display`, `block`);
          errorCounter++;
        } else if (radios[i].checked) {
          radioNu = i;
          $(`#genderRe`).css(`display`, `none`);
        }
      }

      // subject validation
      let subject = $(`#subject`).val();
      if (subject == 0) {
        $(`#subjectRe`).css(`display`, `block`);
        errorCounter++;
      } else {
        $(`#subjectRe`).css(`display`, `none`);
      }

      // textarea validation
      let txtArea = $(`#txtArea`).val();
      if (txtArea == ``) {
        $(`#txtAreaRe`).css(`display`, `block`);
        errorCounter++;
      } else {
        $(`#txtAreaRe`).css(`display`, `none`);
      }

      // delete all inserted values and checked box after successfully sending a message
      if (!errorCounter) {
        $(`#messageSent`).css(`display`, `block`);
        $(`#firstName`).val(``);
        $(`#lastName`).val(``);
        $(`#country`).val(``);
        $(`#email`).val(``);
        $(`#subject`).val(0);
        $(`#txtArea`).val(``);
        radios[radioNu].checked = false;
        $(`#textCount`).html(`0`);
        let timer = setTimeout(() => {
          $(`#messageSent`).css(`display`, `none`);
        }, 4000);
      }
    });
    //Textarea - number of characters inserted - validation

    let textCountSpan = $(`#textCount`);
    $(`#txtArea`).keyup(function () {
      let max = 400;
      let length = $(`#txtArea`).val().length;
      if (length > max) {
        $(`#txtArea`).val($(`#txtArea`).val().substring(0, 400));
      } else {
        textCountSpan.html(length);
      }
    });
  }
  if (url == `/sollai/shop.html`) {
    // Products on Shop page
    ajaxCall(`products`, createProducts, `productsShop`);

    // Sort
    ajaxCall(`sort`, createDdl, `sort`, `Sort By`);

    // Checkboxes

    ajaxCall(`brand`, createCheckBox, `brands`, `brand`);
    ajaxCall(`category`, createCheckBox, `cat`, `category`);

    // Filter events
    $(`#priceBtn`).click(filterChange);

    $("#sort").change(filterChange);
    $("#search").keyup(filterChange);
  }
  if (url == `/sollai/winter.html`) {
    // Winter collection page products
    ajaxCall(
      `products`,
      otherPagesProductCreation,
      `productsWinterPage`,
      `collection`
    );
  }
  if (url == `/sollai/cart.html`) {
    let storageArray = JSON.parse(localStorage.getItem(`cart`));
    createCart(storageArray);

    // Plus and minus qnt
    let pluses = $(`.fa-plus`);
    let storageArr = JSON.parse(localStorage.getItem(`cart`));
    pluses.each((x) => {
      $(pluses[x]).click(() => {
        let id = $(pluses[x]).parent().next().next().next().val();
        storageArr.push(storageArr.find((x) => x.id == id));
        addToLocalStorage(storageArr);

        // Changing quantity number
        let qnt = $(pluses[x]).parent().next().text();
        let newQnt = Number(qnt) + 1;
        $(pluses[x]).parent().next().text(newQnt);

        // Total item price change
        let price = $(pluses[x]).parent().parent().prev().children().text();
        let totalPrice = $(pluses[x]).parent().parent().next().children();
        let newP = calculateNewPrice(price, totalPrice, newQnt);

        // Changing all cart items number
        let oldCounter = $(`.cartItems`).html();
        $(`.cartItems`).html(Number(oldCounter) + 1);

        // Total price check out change
        totalPriceCheckOutChange(true, price);
      });
    });

    let minuses = $(`.fa-minus`);
    minuses.each((x) => {
      $(minuses[x]).click(() => {
        let id = $(minuses[x]).parent().next().val();
        let forRemoving = storageArr.find((x) => x.id == id);
        let objToRemove;
        for (let index in storageArr) {
          if (storageArr[index].id == forRemoving.id) {
            objToRemove = index;
          }
        }
        console.log(objToRemove);
        storageArr.splice(objToRemove, 1);
        addToLocalStorage(storageArr);

        // Changing quantity number
        let qnt = $(minuses[x]).parent().prev().text();
        let newQnt = Number(qnt) - 1;
        if (newQnt == 0) {
          $(minuses[x]).parent().parent().parent().css(`display`, `none`);
        }
        $(minuses[x]).parent().prev().text(newQnt);

        // Total item price change
        let price = $(pluses[x]).parent().parent().prev().children().text();
        let totalPrice = $(pluses[x]).parent().parent().next().children();
        calculateNewPrice(price, totalPrice, newQnt);

        // Changing all cart items number
        let oldCounter = $(`.cartItems`).html();
        $(`.cartItems`).html(Number(oldCounter) - 1);

        // Empty cart message and remove array from local storage
        emptyCart(storageArr);

        // Total price check out change
        totalPriceCheckOutChange(false, price);
      });
    });
    // Empty cart message and remove array from local storage
    emptyCart(storageArr);

    // Check out
    $(`#check p`).click(() => {
      localStorage.removeItem(`cart`);
      let array = [];
      createCart(array);
      emptyCart(array);
      $(`#succPurchase`).css(`display`, `block`);
      setTimeout(() => {
        $(`#succPurchase`).css(`display`, `none`);
      }, 3000);
    });
  }
});

// ========== FUNCTIONS =============

// Slider

function slider() {
  const slides = $(`.slides`);
  const sliderBtns = $(`.coverSliderButtons`);

  let currentSlide = 1;

  const slideInterval = 4000;
  let intervalId = null;

  sliderBtns.click(function () {
    stopSlideInterval();
    const nextSlide = $(this).data(`slide`);
    if (nextSlide !== currentSlide) {
      const currentSlideItem = slides.eq(currentSlide - 1);
      const nextSlideItem = slides.eq(nextSlide - 1);
      currentSlideItem.fadeOut(400, function () {
        currentSlideItem.addClass(`hidden`);
        nextSlideItem.removeClass(`hidden`).fadeIn(400);
        currentSlide = nextSlide;
        setActiveButton();
        startSlideInterval();
      });
    }
  });

  // Functions

  function startSlideInterval() {
    if (intervalId === null) {
      intervalId = setInterval(function () {
        const nextSlide = currentSlide === slides.length ? 1 : currentSlide + 1;
        sliderBtns.eq(nextSlide - 1).trigger(`click`);
      }, slideInterval);
    }
  }

  function stopSlideInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function setActiveButton() {
    sliderBtns.removeClass(`active`);
    sliderBtns.eq(currentSlide - 1).addClass(`active`);
  }

  setActiveButton();
  startSlideInterval();
}

// Navigation

function createNavigation(list) {
  content = "";

  for (let obj of list) {
    if (obj == list[0]) {
      content += `<li class="collection">
            <a href="${obj.href}">${obj.text}</a></li>`;
    } else {
      content += `<li>
        <a href="${obj.href}">${obj.text}</a></li>`;
    }
  }

  $(`#menu > nav > ul`).html(content);
}

//Drop down list for contact and sorting

function createDdl(data, block, heading) {
  content = `<option value="0">${heading}</option>`;
  for (let obj of data) {
    content += `<option value="${obj.id}">${obj.name}</option>`;
  }
  $(`#${block}`).html(content);
}

// Scroll to top function

function scrollToTop() {
  $(window).on(`scroll`, function () {
    if (window.scrollY > 500) {
      $(`.back-to-top`).addClass(`show`);
    } else {
      $(`.back-to-top`).removeClass(`show`);
    }
  });
}

// Creation of the products

function createProducts(array, section) {
  if (url == `/shop.html`) {
    array = filterBrands(array);
    array = filterCategories(array);
    array = filterByPrice(array);
    array = sorting(array);
    array = searchFilter(array);
  }
  content = ``;
  if (array.length == 0) {
    content += `<p>There is no product for selected filtering.</p>`;
  } else {
    for (let obj of array) {
      content += `<div class="product">
        <div class="productImg">
        <img src="${obj.image}" alt="${obj.name}"/>`;
      if (obj.collection) {
        content += `<div class="productCollectionTag">WINTER COLLECTION</div>`;
      }
      content += `</div>
      <div class="productContent">
      <div class="txt">
      <h4>${obj.name}</h4>
      <p>${obj.desc}</p>
      </div>
      <div class="prices">
      <p>${obj.price.online} $</p>
      <p class="mpPrice">${obj.price.store} $ <span class="mp">in sotres</span></p>
      </div>
      <div class="buyButton">
      <p>add to cart</p>
      </div>
      <input type="hidden" value="${obj.id}"/></div></div>
      `;
    }
  }
  $(`#${section}`).html(content);

  // Add to cart function
  let buttons = $(`.buyButton`);
  let objArray;
  objArray = JSON.parse(localStorage.getItem(`cart`));
  if (objArray == null) {
    objArray = [];
  }
  buttons.each((x) => {
    $(buttons[x]).click(() => {
      let inputEl = $(buttons[x]).next();
      objArray.push(array.find((x) => x.id == $(inputEl).val()));
      addToLocalStorage(objArray);
      $(`.succBuy`).css(`display`, `block`);
      setTimeout(() => {
        $(`.succBuy`).css(`display`, `none`);
      }, 3000);
    });
  });
}

// Ajax call function
function ajaxCall(file, createFunction, htmlBlock, type) {
  $.ajax({
    url: `files/${file}.json`,
    method: `get`,
    dataType: `json`,
    success: function (data) {
      createFunction(data, htmlBlock, type);
    },
    error: function (xhr) {
      console.log(xhr);
    },
  });
}

function otherPagesProductCreation(data, section, type) {
  content = ``;
  newArray = [];
  if (type == `collection`) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].collection == true) {
        newArray.push(data[i]);
      }
    }
  }
  if (type == `bestSeller`) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].bestSeller == true) {
        newArray.push(data[i]);
      }
    }
  }

  createProducts(newArray, section);
}

// Create check box function

function createCheckBox(data, section, heading) {
  content = `<h3>${heading}:</h3>
  <div class="checkBox">`;
  for (let obj of data) {
    content += `
    <div>
    <label for="${obj.name.toLowerCase()}">${obj.name}</label>
    <input type="checkbox" value="${
      obj.id
    }" name="${obj.name.toLowerCase()}" id="${obj.name.toLowerCase()}" class="${heading}"/>
    </div>`;
  }
  content += `</div>`;

  $(`#${section}`).html(content);
  $(`.${heading}`).change(filterChange);
}

// Filter functions

function filterBrands(data) {
  let brandsChecked = [];
  let checkedBoxes = $(`.brand:checked`);
  checkedBoxes.each((x) => {
    brandsChecked.push(parseInt($(checkedBoxes[x]).val()));
  });
  if (brandsChecked.length != 0) {
    return data.filter((x) => brandsChecked.includes(x.brand));
  }
  return data;
}

function filterCategories(data) {
  let categoriesChecked = [];
  let checkedBoxes = $(`.category:checked`);
  checkedBoxes.each((x) => {
    categoriesChecked.push(parseInt($(checkedBoxes[x]).val()));
  });
  if (categoriesChecked.length != 0) {
    console.log(
      data.filter((x) => x.category.some((y) => categoriesChecked.includes(y)))
    );
    return data.filter((x) =>
      x.category.some((y) => categoriesChecked.includes(y))
    );
  }
  return data;
}

function searchFilter(data) {
  let inputValue = $(`#search`).val().toLowerCase();
  if (inputValue) {
    return data.filter((x) => {
      return x.name.toLowerCase().indexOf(inputValue) !== -1;
    });
  }
  return data;
}

function sorting(data) {
  let sortBy = $(`#sort`).val();
  if (sortBy == 1) {
    return data.sort((a, b) => (a.name > b.name ? 1 : -1));
  } else if (sortBy == 2) {
    return data.sort((a, b) => (a.name < b.name ? 1 : -1));
  } else if (sortBy == 3) {
    return data.sort((a, b) =>
      Number(a.price.online) > Number(b.price.online) ? 1 : -1
    );
  } else if (sortBy == 4) {
    return data.sort((a, b) =>
      Number(a.price.online) < Number(b.price.online) ? 1 : -1
    );
  }
  return data;
}

function filterByPrice(data) {
  let price = Number($(`#rnPrice`).val());
  if (price) {
    return data.filter((x) => {
      return x.price.online <= price;
    });
  }
  return data;
}

function filterChange() {
  ajaxCall(`products`, createProducts, `productsShop`);
}

// Form regex

function FormRegex(data, block, regex, err) {
  if (data.match(regex)) {
    $(`#${block}`).css(`display`, `none`);
  } else {
    $(`#${block}`).css(`display`, `block`);
    err++;
  }
  return err;
}

// Local Storage function

function addToLocalStorage(array) {
  localStorage.setItem(`cart`, JSON.stringify(array));
}

// Cart items from local storage
function createCart(array) {
  content = ``;
  let counter = 0;
  const key = "id";
  let totalCheckOutPrice = 0;
  try {
    const arrayUniqueByKey = [
      ...new Map(array.map((item) => [item[key], item])).values(),
    ];
    // console.log(arrayUniqueByKey);
    for (let obj of arrayUniqueByKey) {
      let qnt = array.filter((x) => x.id == obj.id).length;
      content += `<div class="cartItem">
      <div class="cartImg">
      <img src="${obj.image}" alt="${obj.name}"/>
      </div>
      <div class="cartInfo">
      <h3>${obj.name}</h3>
      <p>${obj.desc}</p>
      </div>
      <div class="cartItemPrice">
      <p>${obj.price.online} $</p>`;
      let price = obj.price.online;
      content += `</div>
      <div class="cartItemQuant">
      <p><i class="fa-solid fa-plus"></i></p>
      <span class="qnt">${qnt}</span>`;
      content += `<p><i class="fa-solid fa-minus"></i></p>
      <input type="hidden" value="${obj.id}"/>
      </div>
      <div class="cartItemTotal">
      <p>${totalItemPrice(price, qnt)} $</p>
      </div></div>`;
      counter += qnt;
      totalCheckOutPrice += totalItemPrice(price, qnt);
    }
    totalCheckOutPrice = Math.round(totalCheckOutPrice * 100) / 100;
    $(`#cartItemWrapper > p`).css(`display`, `none`);
    $(`.cartItems`).html(counter);
    $(`#cartItemWrapperIn`).html(content);
    $(`#totaltotal`).html(totalCheckOutPrice);
    $(`#checkOut`).css(`display`, `block`);
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(
        "Can't work with function map because there is not a single product added to cart."
      );
    }
  }
}

function totalItemPrice(price, qnt) {
  return Math.round(price * qnt * 100) / 100;
}

// Calculate new price with plus or minus
function calculateNewPrice(priceBlock, totalPriceBlock, newQnt) {
  let actPrice = priceBlock.split(" ");
  let newPrice = Math.round(actPrice[0] * newQnt * 100) / 100;
  $(totalPriceBlock).text(`${newPrice} $`);
}

// Empty cart message and remove array from local storage
function emptyCart(array) {
  try {
    if (array.length == 0) {
      $(`#cartItemWrapper > p`).css(`display`, `block`);
      localStorage.removeItem(`cart`);
      setTimeout(() => {
        $(`#checkOut`).css(`display`, `none`);
      }, 3000);
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(
        "Length is null because there are no items in local storage."
      );
    }
  }
}

// Change total check out price
function totalPriceCheckOutChange(state, itemPrice) {
  let actItemPrice = itemPrice.split(" ");
  let totalCo = $(`#totaltotal`).html();
  let newTotal;
  // state == true == Plus function
  if (state) {
    newTotal = Number(totalCo) + Number(actItemPrice[0]);
  } else {
    newTotal = Number(totalCo) - Number(actItemPrice[0]);
  }
  $(`#totaltotal`).html(Math.round(newTotal * 100) / 100);
}
