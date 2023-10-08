import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxCuration = 300; // 5min
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function get() {
    try {
        connectToDB();


        const products = await Product.find({});
        if(!products) throw new Error("No products found!");

        // 1. Scrape latest product details and Update db
        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                // SCRAPE THE CURRENT PRODUCT AGAIN
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
                if(!scrapedProduct) throw new Error("No product found.");

                // CREATE UPDATEDPRICEHISTORY from OLD PRICEHISTORY and NEW CURRENTPRICE
                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    {price: scrapedProduct.currentPrice}
                ]

                // UPDDATE PRODUCT with PRICEHISTORY and low/high/avg
                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
    
                }
    
                // CREATE NEW PRODUCT object and UPDATE it
                const updatedProduct = await Product.findOneAndUpdate({ url: product.url},
                    product,
                );

             // 2. CHECK CURRENT PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
                const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);
                
                if(emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    }
                    const emailContent = await generateEmailBody(productInfo, emailNotifType);

                    const userEmails = updatedProduct.users.map((user: any) => user.email);

                    await sendEmail(emailContent, userEmails);
                }

                return updatedProduct;

            }) // end map
        ); // end Promise

        // 3. return Promise
        return NextResponse.json({
            message: 'Ok', data: updatedProducts
        });
    } catch (error) {
        throw new Error(`Error in GET: ${error}`)
    }
}