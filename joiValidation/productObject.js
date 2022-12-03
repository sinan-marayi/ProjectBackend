const joi = require("joi");

const productSchema = joi.object({
  name: joi.string().required(),
  category: joi.string().lowercase().required(),
  actualPrice: joi.number().required(),
  offerPrice: joi.number().required(),
  description: joi.string().required(),
  thumbnail: joi.string().required(),
});

module.exports = (payload)=>{
    let {error,value}= productSchema.validate(payload)
    if (error) {
        return {success:false,msg:error.message}
    } else {
        return {success:true}
    }
}
