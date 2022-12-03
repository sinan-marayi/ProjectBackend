const joi= require('joi')

let userSchema = joi.object({
    name:joi.string().required(),
    email:joi.string().email().required(),
    phone:joi.string().required(),
    password:joi.string().min(8).required()
})

module.exports = (payload)=>{
    const {error,value}=userSchema.validate(payload)
    if (error) {
        return {success:false,msg:error.message}
    } else {
        return {success:true}
    }
}