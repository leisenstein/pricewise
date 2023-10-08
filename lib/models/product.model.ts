import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
    url: {type: String, required: true, unique: true},
    currency: { type: String, requred: true},
    image: {type: String, requred: true},
    title:{type: String, requred: true},
    currentPrice:{type: Number, requred: true},
    originalPrice:{type: Number, requred: true},
    priceHistory: [
        {
            price: {type: Number, required: true},
            date: {type:Date, default: Date.now}
        },
    ],
    lowestPrice: {type: Number},
    highestPrice: {type: Number},
    averagePrice: {type: Number},
    discountRate: {type: Number},
    description: {type: String},
    category: {type: String},
    reviewsCount: {type: Number},
    isOutOfStock: {type: Boolean, default: false },
    users:[
        { email: {type: String, required: true }}
    ], default: [],
}, {timestamps: true});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;