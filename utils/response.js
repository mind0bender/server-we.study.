const response = ({ res = true, data = {}, msg = "", errs = [], ...obj }) => {
  if (typeof res !== "boolean") {
    throw new Error(`Invalid res\n${res}`);
  }
  if (typeof errs !== "object") {
    throw new Error(`Invalid err\n${errs}`);
  }
  if (typeof data !== "object") {
    throw new Error(`Invalid data\n${data}`);
  }
  if (typeof msg !== "string") {
    throw new Error(`Invalid data\n${msg}`);
  }

  return {
    res,
    msg,
    data,
    errs,
    ...obj,
  };
};

module.exports = response;
