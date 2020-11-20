const ValidationContract = require("../validators/fluent-validator");
const repository = require("../repositories/productRepository");
const azure = require("azure-storage");
const guid = require("guid");
var config = require("../config");

exports.post = async (req, res, next) => {
  let contract = new ValidationContract();
  //contratos servem para evitar infinidade de ifs para validações
  contract.isRequired(req.body.title, "Título é obrigatório");

  //se os dados forem inválidos
  if (!contract.isValid()) {
    res.status(400).send(contract.errors()).end();
    return;
  }

  try {
    //cria o blob service
    const blobSvc = azure.createBlobService(config.containerConnectionString);
    let fileName = guid.raw().toString() + ".jpg";
    let rawData = req.body.image;
    let matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let type = matches[1];
    let buffer = new Buffer(matches[2], "base64");
    //salvando imagem
    await blobSvc.createBlockBlobFromText(
      "product-images",
      fileName,
      buffer,
      {
        contentType: type,
      },
      function (error, result, response) {
        if (error) fileName = "default-product.png";
      }
    );

    await repository.create({
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      price: req.body.price,
      active: true,
      tags: req.body.tags,
      image: `https://devmarconnodestore.blob.core.windows.net/product-images/${fileName}`,
    });
    res.status(201).send({ message: "Produto cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.put = async (req, res, next) => {
  try {
    await repository.update(req.params.id, req.body);
    res.status(200).send({ message: "Produto atualizado com sucesso." });
  } catch (error) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.delete = async (req, res, next) => {
  try {
    await repository.delete(req.body.id);
    res.status(200).send({ message: "Produto removido com sucesso." });
  } catch (e) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.get = async (req, res, next) => {
  try {
    var data = await repository.get();
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    var data = await repository.getBySlug(req.params.slug);
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.getById = async (req, res, next) => {
  try {
    var data = await repository.getById(req.params.id);
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.getByTag = async (req, res, next) => {
  try {
    var data = await repository.getByTag(req.params.tag);
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};
