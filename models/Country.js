var mongoose = require('mongoose');
const CountrySchema=new mongoose.Schema({
    CountryName:{
     type: String,
     required:true,
     unique: true,
    
    }
   
    
},{});
const Country=mongoose.model('Country',CountrySchema);

module.exports=Country;