import Product from "@/app/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/app/lib/nodemailer";
import { scrapeAmazonProduct } from "@/app/lib/scraper";
import { connectToDB } from "@/app/lib/scraper/mongoose";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/app/lib/utils";
import { NextResponse } from "next/server";

//this is the code for cron job

export async function GET(){
    try{
        connectToDB();
        const products=await Product.find({});
        if(!products){
            throw new Error("No products found");
        }
        //1. scrape the latest product details and update db
        

        const updatedProducts= await Promise.all(
            products.map(async (currrentProduct)=>{
                const scrapedProduct=await scrapeAmazonProduct(currrentProduct);

                if(!scrapedProduct){
                    throw new Error("no product found");
                }

                const updatedPriceHistory=[
                    ...currrentProduct.priceHisotry,
                    {price:scrapedProduct.currentPrice}
                ]

                const product={
                    ...scrapedProduct,
                    priceHisotry:updatedPriceHistory,
                    lowestPrice:getLowestPrice(updatedPriceHistory),
                    highestPrice:getHighestPrice(updatedPriceHistory),
                    averagePrice:getAveragePrice(updatedPriceHistory)
                }


                const updatedProduct=await Product.findOneAndUpdate(
                    {url:scrapedProduct.url},
                    product,
                );



                //2. check each products status and send email accordingly
                const emailNotifType=getEmailNotifType(scrapedProduct,currrentProduct);

                if(emailNotifType && updatedProduct.users.length>0){
                    const productInfo={
                        title:updatedProduct.title,
                        url:updatedProduct.url
                    }

                    const emailContent= await generateEmailBody(productInfo,emailNotifType);
                    const userEmail=updatedProduct.users.map((user:any)=>{user.email});
                    await sendEmail(emailContent,userEmail);
                }
                return updatedProduct;
            })

        )

        return NextResponse.json({
            message:'ok',
            date:updatedProducts
        })

    }
    catch(error){
        throw new Error(`Error in GET: ${error}`);
    }
}