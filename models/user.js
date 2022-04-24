
const mongoose = require('mongoose')


const userSchema = new  mongoose.Schema({
    name:{type:String, required:true}, //name of user
    user_name:{type:String, unique:true, required:true}, //username of user
    balance:{type:Number, default:100} //balance of user
})

userSchema.virtual('items',{ //virtual items array to store the items that the user owns
    ref:'Product',
    localField:'_id',
    foreignField:'owner'
})

userSchema.set('toObject',{virtuals:true})
userSchema.set('toJSON',{virtuals:true})

const User = mongoose.model('User',userSchema,'users')
module.exports = User
