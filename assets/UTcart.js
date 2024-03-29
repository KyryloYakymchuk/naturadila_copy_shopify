let drawer_cart = document.getElementsByClassName("cart_wrapper")[0];
let cart_overflow = document.getElementById("cart_items");
let body = document.getElementsByTagName("body")[0];
let container = document.getElementsByClassName("cart_container_drower")[0];
let out_in_stock = document.getElementsByClassName("out_in_stock")[0];
let string = document.querySelector("#all_variant_track").innerHTML;
let cart_upsell = document.getElementsByClassName("upsell")[0];

const handleAddToCart = (el, flag) => {
  let varId = flag
    ? document.getElementById(`varId-${el.dataset.inputid}`).value
    : window.location.search.substr(1).split("variant=")[1];
  let quantity =
    document.getElementById(
      `product_quantity-${window.location.search.substr(1).split("=")[1]}`
    )?.value || 1;
  let productParams = JSON.parse(string)
    .split(varId)[1]
    .split(",")[0]
    .split(":")[1]
    ?.split("}")[0];
  let selling_state = productParams.split("-")[1].split('"')[0];
  let availableQuantity = productParams.split("-")[0].split('"')[1];
  let formData = {
    items: [
      {
        id: +varId,
        quantity: +quantity,
      },
    ],
  };

  fetch(window.Shopify.routes.root + "cart.js", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((el) => {
      if (selling_state === "deny") {
        if (+quantity > +availableQuantity) {
          out_in_stock.style.display = "unset";
          out_in_stock.innerHTML = `Available quantity on stock - ${availableQuantity}`;
        } else {
          if (el.items.length == 0) {
            if (+quantity > +availableQuantity) {
              out_in_stock.style.display = "unset";
              out_in_stock.innerHTML = `Available quantity on stock - ${availableQuantity}`;
            } else {
              addToCartRequest(formData);
            }
          } else {
            let product = el.items.find(
              ({ variant_id }) => variant_id === +varId
            );
            if (
              product?.quantity == +availableQuantity ||
              product?.quantity + formData.items[0].quantity >
                +availableQuantity
            ) {
              out_in_stock.innerHTML = `Available quantity on stock - ${availableQuantity}`;
              out_in_stock.style.display = "unset";
            } else {
              addToCartRequest(formData);
            }
          }
        }
      } else {
        addToCartRequest(formData);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
const addToCartRequest = (formData) => {
  out_in_stock.style.display = "none";

  fetch(window.Shopify.routes.root + "cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      openCart();
      return response.json();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const getCartItems = () => {
  let upsellArr = [];
  let productsTag = [];

  fetch(window.Shopify.routes.root + "cart.js", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((el) => {
      findProductByHandle(el, upsellArr, productsTag);
      drawItems(el);
      drawUpsell(el);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
const updateItem = (id, qty) => {
  let upsellArr = [];

  let productsTag = [];
  document
    ?.getElementById(`quantity_minus-${id}`)
    .classList.add("disabled_button");
  document
    ?.getElementById(`quantity_plus-${id}`)
    .classList.add("disabled_button");
  document.getElementById(`loaderId-${id}`).style.display = "unset";

  let formData = {
    updates: {
      [`${id}`]: qty,
    },
  };
  fetch(window.Shopify.routes.root + "cart/update.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      return response.json();
    })
    .then((el) => {
      findProductByHandle(el, upsellArr, productsTag);
      drawItems(el);
      drawUpsell(el);
      if (qty !== 0) {
        document.getElementById(`loaderId-${id}`).style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const drawItems = (el) => {
  cart_overflow.innerHTML = "<div></div>";
  document.getElementById("cart_count").innerHTML = el?.item_count;
  let product_item;
  if (el.item_count > 0) {
    let currencySymbol = document.querySelector("body").dataset.currencysymbol;
    let shipping_bar_id = document.getElementById("shipping_bar_id");
    let shipping_bar_container = document.getElementById(
      "shipping_bar_container"
    );
    let need_to_pay = document.getElementById("need_to_pay");
    let shipping_title = document.getElementById("shipping_title");

    document.getElementById("cart_footer").style.display = "unset";
    document.getElementById("total_checkout_price").innerHTML =
      (el?.total_price / 100).toFixed(2) + " " + currencySymbol;
    +" " + el?.currency;
    cart_upsell.style.display = "unset";
    shipping_bar_id.style.display = "flex";
    shipping_bar_container.style.display = "block";
    return el?.items.map((data) => {
      let productParams = JSON.parse(string)
        .split(data.variant_id)[1]
        .split(",")[0]
        .split(":")[1]
        .split("}")[0];

      let productCap = productParams.split("cap=")[1].split("=")[0];
      let availableQuantity = productParams.split("-")[0].split('"')[1];
      let selling_state = productParams.split("-")[1].split('"')[0];
      product_item = document.createElement("div").innerHTML = `
      <div class="cart_item" data-carttitle=${data.product_title}>
        <div class="item--loadbar" id="loaderId-${data.variant_id}">
          <div class="loaderCart">&nbsp;</div>
        </div>
<div class="item_wrapper">
      <div class="info_box">  
        <div class="image"> 
          <img 
            src=${data.featured_image.url}
            alt=${data.featured_image.alt}
            loading="lazy"
          >
        </div>
        <div class="info_item_title"> 
          <a href=${data.url}>${data.product_title}</a>
        </div>     

      </div>


<div class="item_actions_wrapper">


<div class="upsell_price_wrapper_UT"> 
<div class="upsell_cap_price_UT" id=cap_price-${data.variant_id}> 
 ${
   !isNaN(productCap) && +productCap
     ? ((+productCap / 100) * data.quantity).toFixed(2).replace(".", ",") +
       currencySymbol
     : ""
 }
</div>

 <div class="upsell_price_UT">   
 <strong class='final_price'>${
   (data.final_line_price / 100).toFixed(2).replace(".", ",") + currencySymbol
 }</strong>     
  </div>
</div>

      <div class="info_drawer cart_info_drawer">
  
              <div class="actions">
              <div class="remoove">
              <cart-remove-button>
                <button class="remoove_button" onclick="updateItem(${
                  data.variant_id
                },0)">
                <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.3265 3.42857H11.3878V2.81633V2.32653C11.3878 0 10.2857 0 9.18367 0C8.08163 0 7.95918 0 5.7551 0C3.55102 0 3.42857 1.10204 3.42857 2.32653C3.42857 2.81633 3.42857 2.81633 3.42857 2.81633V3.42857H0.612245C0.244898 3.42857 0 3.67347 0 4.04082V5.14286C0 5.5102 0.244898 5.7551 0.612245 5.7551C0.979592 5.7551 1.22449 6 1.22449 6.36735V17.3878C1.22449 17.7551 1.46939 18 1.83673 18H13.3469C13.7143 18 13.9592 17.7551 13.9592 17.3878V6.36735C13.9592 6 14.2041 5.7551 14.5714 5.7551C14.9388 5.7551 15.1837 5.5102 15.1837 5.14286V4.04082C14.9388 3.67347 14.6939 3.42857 14.3265 3.42857ZM4.77551 1.46939H9.91837V3.55102H4.77551V1.46939ZM12.2449 15.4286C12.2449 15.9184 11.8776 16.2857 11.3878 16.2857H3.55102C3.06122 16.2857 2.69388 15.9184 2.69388 15.4286V6.61225C2.69388 6.12245 3.06122 5.7551 3.55102 5.7551H11.5102C12 5.7551 12.3673 6.12245 12.3673 6.61225V15.4286H12.2449Z" fill="#444444"/>
                </svg>
                </button>
              </cart-remove-button>
           </div>
                <quantity-input class="quantity_selector qty_sel">
                  <button onclick="updateItem(${data.variant_id},${
        data.quantity - 1
      })" id='quantity_minus-${
        data.variant_id
      }' class="no-js-hidden" name="minus" type="button">
                    <span></span>
                    - 
                    </button>
                    <input
                    class='quantity_input_drawer'
                    type="text"
                    name="updates[]"
                    readonly='false'
                    value=${data.quantity}
                    min="0"
                    id=${data.variant_id}
                  />
                  <button onclick="updateItem(${data.variant_id},${
        data.quantity + 1
      })" id='quantity_plus-${
        data.variant_id
      }' class="no-js-hidden" name="plus" type="button">
                    <span class="visually-hidden"></span>
                      +
                    </button>
                </quantity-input>
           
        </div>
      </div>  
      </div>
      </div>
    </div>`;

      cart_overflow.innerHTML += product_item;
      if (selling_state === "deny") {
        if (+data.quantity == +availableQuantity) {
          document
            ?.getElementById(`quantity_plus-${data.variant_id}`)
            ?.classList.add("disabled_button");
        }
      }
      if (el.total_price.toFixed(2) / 100 < shipping_bar_id.max) {
        shipping_bar_id.value = el.total_price.toFixed(2) / 100;

        need_to_pay.innerHTML =
          "Añade " +
          (shipping_bar_id.max - el.total_price.toFixed(2) / 100).toFixed(2) +
          currencySymbol;

        shipping_title.innerHTML = "para tener Envío Gratis";
      } else {
        shipping_bar_id.value = el.total_price.toFixed(2) / 100;
        shipping_title.innerHTML =
          "¡Enhorabuena! Ya tienes el <strong>Envío Gratis</strong> ";
        need_to_pay.innerHTML = "";
      }
    });
  } else {
    cart_upsell.style.display = "none";
    shipping_bar_id.style.display = "none";
    shipping_bar_container.style.display = "none";
    product_item = document.createElement("div").innerHTML = `
      <div class='empty_cart_box checkout_button'>
        <h2 class='empty_title'>Tu carrito está vacío</h2>
      </div>`;
    document.getElementById("cart_footer").style.display = "none";
    cart_overflow.innerHTML += product_item;
  }
};
const openCart = () => {
  getCartItems();
  // handleChangeDiscoutnPosition();
  drawer_cart.classList.add("active_drawer");
  body.classList.add("overflow-hidden");
  drawer_cart.style.display = "flex";

  if (document.querySelector("#code").value) {
    document.querySelector("#submit").click();
  }

  setTimeout(() => {
    container.style.transform = "translate(0%)";
  }, 200);
  setTimeout(() => {
    cart_upsell.style.transform = "translate(0%)";
  }, 350);
};
const outsideClick = () => {
  const specifiedElement = document.getElementById("outside_overlay");
  document.addEventListener("click", (event) => {
    if (event.target.id === specifiedElement.id) {
      closeCart();
    }
  });
};
const closeCart = () => {
  setTimeout(() => {
    cart_upsell.style.transform = "translate(100%)";
  }, 200);
  setTimeout(() => {
    container.style.transform = "translate(100%)";
  }, 400);
  setTimeout(() => {
    drawer_cart.style.display = "none";
    drawer_cart.classList.remove("active_drawer");
    body.classList.remove("overflow-hidden");
  }, 550);
};
const changeUpsellVariant = (el) => {
  let currencySymbol = document.querySelector("body").dataset.currencysymbol;

  let itemWrapper = el.closest(".product_item");
  let productObjWrapper = el
    .closest(".product_item")
    .querySelector(".product_object").innerHTML;
  let productObj = JSON.parse(productObjWrapper).product.variants;
  let variantTitle = "";
  itemWrapper.querySelectorAll("form select").forEach((select) => {
    variantTitle += variantTitle == "" ? select.value : " / " + select.value;
  });
  for (let i = 0; i < productObj.length; i++) {
    if (variantTitle == productObj[i].title) {
      document.getElementById(`varId-${el.id}`).value = productObj[i].id;
      if (productObj[i].featured_image) {
        el.closest(".product_item").querySelector(".upsell_img").src =
          productObj[i].featured_image.src;
      }

      el.closest(".product_item").querySelector(".upsell_price_UT").innerHTML =
        (productObj[i].price / 100).toFixed(2) + currencySymbol;

      el
        .closest(".product_item")
        .querySelector(".upsell_cap_price_UT").innerHTML =
        +productObj[i].compare_at_price > 0
          ? (productObj[i].compare_at_price / 100).toFixed(2) + currencySymbol
          : "";
    }
  }
};

const drawUpsell = (el) => {
  let upsell_wrapper = document.getElementById("upsell_wrapper");
  let upsellId = [];
  let upsellUniqId = [];
  let upsellTitle = [];
  let cartItems = [];
  let htmlEl = [];
  let upsellUniqItems = [];
  cart_upsell.style.display = "none";
  function handleResponse() {
    let divEl = document.createElement("div");
    divEl.innerHTML = this.responseText;
    let upsell_box = divEl.querySelectorAll(".product_item");
    //  "Product data from upesll, uniq id and html elements with id"
    upsell_box.forEach((element) => {
      upsellId.push(+element.dataset.metafield_id);
      htmlEl.push({ id: element.dataset.metafield_id, element: element });
    });
    // "get ids items from cart and set in array";
    el.items.forEach((element) => {
      upsellTitle.push(element.title.split(" -")[0]);
      cartItems.push(element.id);
    });

    // "filter upsellIDs and get only uniq values";
    upsellUniqId = upsellId.filter((value, index, self) => {
      return !cartItems.includes(self.indexOf(value) === index);
    });

    //  "filter HTMLs elements and get only uniq"
    for (let i = 0; i < upsellUniqId.length; i++) {
      const item = htmlEl[i];
      for (let j = 0; j < upsellUniqId.length; j++) {
        const element = upsellUniqId[j];

        if (+item.id === element) {
          upsellUniqItems.push(item);
          break;
        }
      }
    }
    upsellUniqItems = htmlEl.filter((data, index) => {
      return upsellUniqId.indexOf(+data.id) === index;
    });
    // filter upsell by same title
    upsellUniqItems = upsellUniqItems.filter((data) => {
      return !upsellTitle.includes(data.element.dataset.producttitle);
    });

    // "filter cart and upsell items and remoove frome upsell if find same with cart"
    if (upsell_wrapper.dataset.upsellvariants === "false") {
      upsellUniqItems = upsellUniqItems.filter((data) => {
        return !cartItems.includes(+data.id);
      });
    }

    upsell_wrapper.innerHTML = "";
    upsellUniqItems.map(({ element }) => {
      upsell_wrapper.appendChild(element);
    });
    if (!upsellUniqItems.length) {
      cart_upsell.style.display = "none";
    } else {
      cart_upsell.style.display = "unset";
    }

    cart_upsell.style.display = "unset";
  }
  // get upsell products and call draw function
  const request = new XMLHttpRequest();
  request.addEventListener("load", handleResponse);
  request.open("GET", "/?snippets=UTcart", true);
  request.send();
};

const findProductByHandle = (el, upsellArr, productsTag) => {
  let productsWithTags = [];
  el.items.map(({ handle }) => {
    fetch(window.Shopify.routes.root + `products/${handle}.js`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((product) => {
        productsWithTags.push(product);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
  setTimeout(() => {
    findUpsellProductByHandle(productsWithTags, upsellArr, productsTag);
  }, 400);
};

const findUpsellProductByHandle = (product, upsellArr, productsTag) => {
  product.map(({ tags }) => {
    tags.map((tag) => {
      if (tag.includes("upsell")) {
        upsellArr.push(tag);
      }
    });
  });
  product.map(({ tags }) => {
    tags.map((tag) => {
      productsTag.push(tag);
    });
  });
  upsellArr.map((data) => {
    if (productsTag.indexOf(`${data.replace("-upsell", "")}-main`) === -1) {
      removeUnusedUpsellProduct(data);
    }
  });
};

const removeUnusedUpsellProduct = (handle) => {
  if (handle?.includes("upsell"))
    fetch(window.Shopify.routes.root + `products/${handle}.js`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((product) => {
        product.variants.map((data) => {
          document.querySelectorAll(".item--loadbar").forEach((el) => {
            if (data.id === +el.id.split("-")[1]) {
              updateItem(data.id, 0);
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
};

// let isDropdownActive = document.querySelector(
//   ".icart-coupon-code-svg.icart-add-coupon-code.isActive"
// );

// let discountInfo = document.querySelector(".sc_simple-info__row.sc_code-info");
// const handleChangeDiscoutnPosition = () => {
//   let infoInterval = setInterval(() => {
//     if (discountInfo) {
//       console.log("find info");

//       clearInterval(infoInterval);
//       document.querySelector(".discount_price_UT").appendChild(discountInfo);

//       document
//         .querySelector(".sc_code-btn")
//         .addEventListener("click", function () {
//           handleChangeDiscoutnPosition;
//         });
//     } else {
//       discountInfo = document.querySelector(
//         ".sc_simple-info__row.sc_code-info"
//       );
//     }
//   }, 500);
// };
