const joi = require("joi");

const carouselSchema = joi.object({
  heading: joi.string().required(),
  offer: joi.string().required(),
  category: joi.string().required(),
  image: joi.string().required(),
});

module.exports = (payload)=>{
    let {error,value} = carouselSchema.validate(payload)
    if (error) {
        return {success:false,msg:error.message}
    } else {
        return {success:true}
    }
}
