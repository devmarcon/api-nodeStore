const ValidationContract = require("../validators/fluent-validator");
const repository = require("../repositories/customerRepository");
const md5 = require("md5");
const emailService = require("../services/emailService");
const authService = require("../services/authService");

exports.post = async (req, res, next) => {
  let contract = new ValidationContract();
  //contratos servem para evitar infinidade de ifs para validações
  contract.isRequired(req.body.name, "Nome é obrigatório");

  //se os dados forem inválidos
  if (!contract.isValid()) {
    res.status(400).send(contract.errors()).end();
    return;
  }

  try {
    await repository.create({
      name: req.body.name,
      email: req.body.email,
      password: md5(req.body.password + global.SALT_KEY),
      roles: ["user"],
    });

    emailService.send(
      req.body.email,
      "Bem vindo a nodeStore",
      global.EMAIL_TMPL.replace("{0}", req.body.name)
    );

    res.status(201).send({ message: "Cliente cadastrado com sucesso!" });
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
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.authenticate = async (req, res, next) => {
  try {
    const costumer = await repository.authenticate({
      email: req.body.email,
      password: md5(req.body.password + global.SALT_KEY),
    });

    if (!costumer) {
      res.status(404).send({
        message: "Usuário ou senha inválidos",
      });
      return;
    }

    const token = await authService.generateToken({
      id: costumer._id,
      email: costumer.email,
      name: costumer.name,
      roles: costumer.roles,
    });

    res.status(201).send({
      token: token,
      data: {
        email: costumer.email,
        name: costumer.name,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    //recupera token
    let token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    //decodifica token
    const data = await authService.decodeToken(token);

    const costumer = await repository.getById(data.id);

    if (!costumer) {
      res.status(404).send({
        message: "Cliente não encontrado.",
      });
      return;
    }

    const tokenData = await authService.generateToken({
      id: costumer._id,
      email: costumer.email,
      name: costumer.name,
      roles: costumer.roles,
    });

    res.status(201).send({
      token: token,
      data: {
        email: costumer.email,
        name: costumer.name,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Falha ao processar sua requisição.",
    });
  }
};
