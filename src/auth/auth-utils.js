const JWT = require("jsonwebtoken");
const { asyncHandler } = require("./checkAuth");
const {
  AuthFailureError,
} = require("../common/response/error.response");
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * get access Token
   * verify token
   * ok all => return next()
   */

  const accessToken = req.headers.authorization;
  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeToken = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeToken.userId)
      throw new AuthFailureError("Invalid userId");
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication,
};
