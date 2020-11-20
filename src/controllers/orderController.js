const repository = require("../repositories/orderRepository");
const guid = require("guid");
const authService = require("../services/authService");

exports.post = async (req, res, next) => {
  try {
    //recupera token
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    //decodifica token
    const data = await authService.decodeToken(token);

    await repository.create({
      customer: data.id,
      number: guid.raw().substring(0, 6),
      items: req.body.items,
    });
    res.status(201).send({ message: "Pedido cadastrado com sucesso!" });
  } catch (error) {
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
    console.log(e);
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};
