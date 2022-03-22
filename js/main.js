let productList = [];
let currentProducts = [];
function loadData() {
  //hiện loading
  document.querySelector(".shop-item").innerHTML =
    '<img src="../img/loading.gif" alt="loading">';
  //lấy dữ liệu API
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      productList = data;
      currentProducts = productList;
      render(productList);
      renderCategory(category(productList));
      console.log(productList);
    })
    .catch((error) => {
      document.querySelector(".shop-item").innerHTML = "Unable to load data";
    });
}

const showToast = (mess, type = "success") => {
  const color = {
    warning: "#ffc107",
    info: "#007bff",
    success: "#28a745",
    error: "#dc3545",
  };
  Toastify({
    text: mess,
    duration: 2000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: color[type],
    },
    onClick: function () {}, // Callback after click
  }).showToast();
};

//Hàm render
let render = (products) => {
  let output = "";
  products.forEach((product) => {
    output += `<article id="${product.id}" class="product">
        <a onclick="callDetail(${product.id})" href="detail.html">
          <div style="display:flex; align-items: center;">
            <img style="max-width: 100%; max-height: 100%" src="${
              product.image
            }" alt="${product.title}" />
          </div>
          <p style="width: 220px">
            <b>${product.title}</b> <br />
            ${product.price.toLocaleString()}$
          </p>
        </a>
        <button type="button" onclick="addToCart(${product.id},1)">
          Add to Cart <img src="img/login-arrow.svg" alt="next" />
        </button>
      </article>`;
  });
  document.querySelector(".shop-item").innerHTML = output;
};

//Hàm sắp xếp
function sortProduct(products, sortBy) {
  products.sort((a, b) => {
    if (sortBy == 1) return b.price - a.price;
    if (sortBy == 2) return a.price - b.price;
    if (sortBy == 3)
      return a.title
        .toLocaleLowerCase()
        .localeCompare(b.title.toLocaleLowerCase());
    if (sortBy == 4)
      return b.title
        .toLocaleLowerCase()
        .localeCompare(a.title.toLocaleLowerCase());
  });
  return products;
}

//Xử lý sắp xếp
const sortElm = document.querySelector(".sort");
sortElm &&
  sortElm.addEventListener("change", function (e) {
    //Filter lại sản phẩm
    let result = filterPrice();
    //Sắp xếp
    result = sortProduct(result, e.target.value);
    //Xuất kết quả
    render(result);
  });

//Lấy mảng category
let category = (products) => {
  categoryList = [];
  products.forEach((e) => {
    categoryList.push(e.category);
  });
  let category = categoryList.filter((item, index) => {
    return categoryList.indexOf(item) === index;
  });
  category.sort((a, b) => {
    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
  });
  return category;
};

//Render category
let renderCategory = (products) => {
  products.forEach((e, index) => {
    document.querySelector(
      "#filterCategoty"
    ).innerHTML += `<p><a onclick="filterCategory(${index})" href="#">${
      e.charAt(0).toUpperCase() + e.slice(1)
    }</a></p>`;
  });
  //Fillter - All items
  document.querySelector("#all").addEventListener("click", () => {
    document.querySelector("#priceFrom").value = "";
    document.querySelector("#priceTo").value = "";
    render(productList);
    currentProducts = productList;
  });
};

//Filter theo category
let filterCategory = (id) => {
  //reset filter giá
  document.querySelector("#priceFrom").value = "";
  document.querySelector("#priceTo").value = "";
  //reset sắp xếp
  document.querySelector(".sort").value = 0;
  //Lọc theo category
  let productCategory = [];
  productList.forEach((e) => {
    if (category(productList)[id] == e.category) {
      productCategory.push(e);
    }
  });
  currentProducts = productCategory;
  render(currentProducts);
};

//Hàm filter theo giá
let filterPrice = () => {
  if (document.querySelector("#priceTo").value == "") return currentProducts;
  let result = currentProducts.filter((e) => {
    return (
      e.price >= document.querySelector("#priceFrom").value &&
      e.price <= document.querySelector("#priceTo").value
    );
  });
  //console.log(result);
  return result;
};

//Gắn sự kiện lọc theo giá
const filterPriceElm = document.querySelector("#filter1");
filterPriceElm &&
  filterPriceElm.addEventListener("click", () => {
    //check lại sắp xếp
    let sortValue = document.querySelector(".sort").value;
    let result = sortProduct(filterPrice(), sortValue);
    render(result);
  });

//Xử lý giỏ hàng
//hàm lấy giỏ hàng
let getCart = () => {
  let cart = JSON.parse(localStorage.getItem("cart"));
  if (cart == null) cart = [];
  return cart;
};

//Hàm thêm sản phẩm vào giỏ hàng
function addToCart(id, qtyAdd) {
  let cart = getCart();
  //Kiểm tra xem sản phẩm muốn thêm đã có trong giỏ hàng hay chưa
  let index = cart.findIndex(function (e) {
    return e.id == id;
  });
  //Chưa có trong giỏ hàng -> thêm mới
  if (index == -1) {
    let product = productList.find(function (e) {
      return e.id == id;
    });
    //console.log(product);
    let item = {
      id: id,
      title: product.title,
      image: product.image,
      qty: qtyAdd,
      price: product.price,
    };
    cart.push(item);
  } //Đã có -> cập nhật số lượng (qty)
  else {
    cart[index].qty += qtyAdd;
  }
  //Cất giỏ hàng vào localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  //Show lại tổng số lượng sp
  showCartQty();

  // toast
  showToast("Product added to cart successfully");
}
const formatPrice = (p) => {
  if (!p) {
    return p;
  }
  return p.toFixed(2).toLocaleString().replace(".", ",");
};

//hàm show cart
let showCart = () => {
  let stt = 1;
  let output = "";
  getCart().forEach((item) => {
    output += `<tr>
                <td width="35%">${item.title}</td>
                <td><img src="${item.image}" height="80" alt=""></td>
                <td><input onchange="updateQty(${item.id})" id="qty${
      item.id
    }" type="number" pattern="^[0-9]"  min="1" step="1" oninput="validity.valid||(value='1');" value="${
      item.qty
    }"></td>
                <td>${formatPrice(item.price)}</td>
                <td id="amount${item.id}">${formatPrice(
      item.qty * item.price
    )}</td>
                <td><button onclick="deleteItem(${
                  item.id
                })"><i class="fa fa-trash"></i></button></td>
            </tr>`;
  });
  document.querySelector("#cart tbody").innerHTML = output;
  //showCartTotal();
};

//hàm show số lượng sản phẩm
let showCartQty = () => {
  let totalQty = 0;
  getCart().forEach((e) => {
    totalQty += e.qty;
  });
  // let totalQty = cart.reduce(function (s, item) {
  //   return s + item.qty;
  // }, 0);
  document.querySelector("#cart-qty").innerHTML = `${totalQty} item(s)`;
};

//hàm show tổng tiền
let showCartTotal = () => {
  let total = 0;
  getCart().forEach((e) => {
    total += e.qty * e.price;
  });
  // let total = cart.reduce(function (s, item) {
  //   return s + item.qty * item.price;
  // }, 0);
  document.querySelector("#total").innerHTML =
    "Total: " + formatPrice(total) + " $";
};

//hàm thay đổi số lượng sản phẩm trang cart
function updateQty(id) {
  //Lấy input có thay đổi số lượng
  let inputQty = document.querySelector("#qty" + id);
  let cart = getCart();
  //Lấy index item trong cart có id tương ứng
  let index = cart.findIndex(function (e) {
    return e.id == id;
  });
  // // Cập nhật số lượng, kiểm tra số 0
  // if (inputQty.value == null) {
  //   inputQty.value = 1;
  // }
  cart[index].qty = parseInt(inputQty.value);
  //Cất giỏ hàng vào localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  //Cập nhật hiển thị, thành tiền
  showCartQty();
  showCartTotal();
  document.querySelector(`#amount${id}`).innerHTML = formatPrice(
    cart[index].price * cart[index].qty
  );
}

//hàm xóa sản phẩm
let deleteItem = (id) => {
  let answer = confirm("Item(s) will be removed from order?");
  if (answer == true) {
    let cart = getCart();
    //Tìm index dựa vào id
    let index = cart.findIndex(function (item) {
      return item.id == id;
    });
    //Xóa sản phẩm khỏi cart
    cart.splice(index, 1);
    //Cất giỏ hàng vào localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    showCartTotal();
    showCart();
    showCartQty();
    showToast("The product has been removed", "error");
  }
};
window.addEventListener("load", function () {
  showCartQty();
});

//Xử lý xem chi tiết tại trang detail

//Hàm lấy productList
let getProductList = () => {
  let result = JSON.parse(localStorage.getItem("productList"));
  return result;
};
//Hàm cất thông tin sản phẩm được click xem chi tiết
let callDetail = (id) => {
  //Lấy index item trong productList có id tương ứng
  let product = productList.find(function (e) {
    return e.id == id;
  });
  localStorage.setItem("selectItem", JSON.stringify(product));
  //Cất productList
  localStorage.setItem("productList", JSON.stringify(productList));
};

//Hàm render sản phẩm được click
let renderDetail = () => {
  let product = JSON.parse(localStorage.getItem("selectItem"));
  // console.log(product);
  //render infor
  document.querySelector(
    "#itemInfo"
  ).innerHTML = `<div class="flex-container align-item-center">
    <img src="${product.image}" alt="${product.title}" />
   </div>
   <div class="flex-container flex-wrap align-content-between">
    <div class="w-100">
     <nav class="path">
      <a href="index.html">Home</a>
      <a href="#">${
        product.category.charAt(0).toUpperCase() + product.category.slice(1)
      }</a>
      <a href="#">${product.title}</a>
     </nav>
     <h2>${product.title}</h2>
     <p>$${product.price}</p>
     <div class="flex-container">
      <p class="grey">Color</p>
      <button class="color bg-black" type="button"></button>
      <button class="color bg-grey" type="button"></button>
      <button class="color bg-red color-active" type="button"></button>
     </div>
     <div class="flex-container">
      <p class="grey">Size</p>
      <button class="size" type="button">XS</button>
      <button class="size-active" type="button">S</button>
      <button class="size" type="button">M</button>
      <button class="size" type="button">L</button>
     </div>
     <div>
      <input id="addCartValue" value="1" type="number" pattern="^[0-9]"  min="1" step="1" oninput="validity.valid||(value='1');" />
      <button onclick="addCartQty(${
        product.id
      })" id="addCartQty" class="middle button-cart" type="button">
        Add to Cart <img src="img/shopnow.svg" alt="Shop" />
      </button>
     </div>
     <p class="grey">
      Category: <span style="color: #eb5757"> ${product.category}</span>
     </p>
    </div>
    <div class="w-100 flex-container">
     <p class="grey">Share</p>
     <a href="#"><img src="img/fb.svg" alt="share" /></a>
     <a href="#"><img src="img/share2.svg" alt="share" /></a>
     <a href="#"><img src="img/share3.svg" alt="share" /></a>
     <a href="#"><img src="img/share4.svg" alt="share" /></a>
    </div>
   </div>`;
  //render description
  renderDes();

  //render related products
  let relatedProducts = [];
  productList.forEach((e) => {
    if (product.category == e.category && product.id != e.id)
      relatedProducts.push(e);
  });
  for (let i = 0; i < Math.min(relatedProducts.length, 4); i++) {
    document.querySelector("#related").innerHTML += `<article class="product">
    <a onclick="callDetail(${relatedProducts[i].id})" href="detail.html">
      <div style="width: 220px; height:280px; display:flex; align-items:center;"><img style="max-width: 100%; max-height: 100%" src="${
        relatedProducts[i].image
      }" alt="${relatedProducts[i].title}" /></div>
      <p>
        <b>${relatedProducts[i].title}</b> <br />${relatedProducts[
      i
    ].price.toLocaleString()}$
      </p>
    </a>
  </article>`;
  }
};

//hàm thêm sản phẩm theo số lượng (trang detail)
let addCartQty = (id) => {
  let qtyAdd = document.querySelector("#addCartValue").value;
  if (qtyAdd != "") addToCart(id, parseInt(qtyAdd));
};

//hàm render description
let renderDes = () => {
  let product = JSON.parse(localStorage.getItem("selectItem"));
  document.querySelector("#description").innerHTML = product.description;
  document.querySelector("#ratingClick").classList.add("grey");
  document.querySelector("#desClick").classList.remove("grey");
};
//hàm render rating
let renderRating = () => {
  let product = JSON.parse(localStorage.getItem("selectItem"));
  document.querySelector(
    "#description"
  ).innerHTML = `<p>Rating: ${product.rating.rate}</p>
  <p>Count: ${product.rating.count}</p>`;
  document.querySelector("#desClick").classList.add("grey");
  document.querySelector("#ratingClick").classList.remove("grey");
};
