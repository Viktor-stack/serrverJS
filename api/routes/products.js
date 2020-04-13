const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const diskStorage = require("./../../storage/diskStorage");
const config = require("./../../config/default");

const rs = () =>
  Math.random()
    .toString(36)
    .slice(-3);
const storage = diskStorage({
  destination: function(req, file, cb) {
    const dir = "/" + rs() + "/" + rs();
    mkdirp(config.DESTINATION + dir, err => cb(err, config.DESTINATION + dir));
    // cb(null, 'uploads/')
  },
  filename: async (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
    // cb(null, Date.now() + "_" + file.originalname)
    // cb(null,   path.basename(file.originalname));
  }
});

const upload = multer({ storage: storage });

const Product = require("../models/product");

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage destination")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            productImage: doc.productImage,
            destination: doc.destination,
            Image: {
              type: "GET",
              url:
                config.HOSTNAME  + doc.destination + "/" + doc.productImage
            },
            request: {
              type: "GET",
              url: config.HOSTNAME + "products/" + doc._id
            }
          };
        })
      };

      // if (docs.length >= 0) {
      res.status(200).json(response);
      // } else {
      //     res.status(404).json({
      //         message: 'No entries found'
      //     });
      // }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.filename,
    destination: req.file.destination
  });
  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Обработка POST-запросов к / products",
        createdProduct: {
          _id: result._id,
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          destination: result.destination,
          request: {
            type: "GET",
            url: config.HOSTNAME + "products/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage destination")
    .exec()
    .then(doc => {
      console.log("Даные из БАЗЫ", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          Image: {
            type: "GET",
            url:
              config.HOSTNAME + doc.destination + "/" + doc.productImage
          },
          request: {
            type: "GET",
            url: config.HOSTNAME + "products/"
          }
        });
      } else {
        res.status(404).json({
          message:
            "Для указанного идентификатора не найдено действительной записи"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Обновление продукта",
        request: {
          type: "GET",
          url: config.HOSTNAME + "products/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Удалён продукт!!",
        request: {
          type: "POST",
          url: config.HOSTNAME + "products",
          body: {
            name: "String",
            price: "Number"
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
