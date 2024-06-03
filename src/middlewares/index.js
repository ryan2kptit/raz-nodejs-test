import Joi from 'joi';

export const validateField = async (req, res, next) => {
    const bodyChecked = Joi.validate(req.body, schema);
    const paramChecked = Joi.validate(req.params, schema);
    const queryChecked = Joi.validate(req.query, schema);
    if (bodyChecked.error) {
      console.log(bodyChecked);
      res.json({
        code: CODE.INVALID_PARAMS,
        message: 'Lỗi định dạng dữ liệu',
        error: bodyChecked.error.details
      });
    } else if (queryChecked.error) {
      res.json({
        code: CODE.INVALID_QUERY,
        message: 'Lỗi định dạng dữ liệu',
        error: queryChecked.error.details
      });
    } else if (paramChecked.error) {
      res.json({
        code: CODE.MISSING_BODY,
        message: 'Lỗi định dạng dữ liệu',
        error: paramChecked.error.details
      });
    } else {
      next();
    }
  };