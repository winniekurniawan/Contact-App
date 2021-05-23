const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContacts,
  findContact,
  addContact,
  cekDuplikat,
  hapusContact
} = require("./utils/contacts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// app.get("/", (req, res) => {
//   res.render("index", {
//     title: "Contact App",
//     layout: "layouts/main-layout",
//   });
// });

// app.get("/about", (req, res) => {
//   res.render("about", {
//     title: "About",
//     layout: "layouts/main-layout",
//   });
// });

// menampilkan semua contact
app.get("/contact", (req, res) => {
  const contacts = loadContacts();
  res.render("contact", {
    title: "Contact",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});

// halaman form tambah contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Contact",
    layout: "layouts/main-layout",
  });
});

// hapus contact
app.get("/contact/hapus/:nama", (req, res) => {
  hapusContact(req.params.nama);
  // kirimkan flash message
  req.flash("msg", `Contact ${req.params.nama} berhasil dihapus`);
  res.redirect("/contact");
});

// tambah contact ke file contacts.json
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("noHP", "no HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layout/main-layout",
        error: errors.array(),
      });
    } else {
      addContact(req.body);
      // kirimkan flash message
      req.flash("msg", "Data Contact berhasil ditambahkan");
      res.redirect("/contact");
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("detail", {
    title: "Detail Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("Test");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}/contact`);
});
