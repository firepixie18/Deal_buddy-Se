import axios from "axios";
import * as cheerio from "cheerio"
import {extractPrice,extractCurrency, extractDescription} from "../utils";

export async function  scrapeAmazonProduct(url:string){
    if(!url){
        return;
    }

    //curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_ffb51203-zone-pricetracker:8q1879nvyr3i -k "http://geo.brdtest.com/mygeo.json"
    //BrightData proxy configuration
    const username=String(process.env.BRIGHT_DATA_USERNAME);
    const password=String(process.env.BRIGHT_DATA_PASSWORD);
    const port=22225;
    const session_id=(1000000*Math.random())|0;

    const options={
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host:'brd.superproxy.io',
        port,
        rejectUnauthorized: false
    }

    try{

        const response=await axios.get(url,options);
        const $=cheerio.load(response.data);

        const title=$("#productTitle").text().trim();
        //no such class id for product therefore extracting it cleverly using a function


        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            
          );

          const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
          );

          const image= $('imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image')|| '{}';

          const imageUrls=Object.keys(JSON.parse(image));
          const currency=extractCurrency($('.a-price-symbol'));
          const discountRate=$('.savingsPercentage').text().replace(/[-%]/g,'').slice(0,1);

          const starsText = $('#acrPopover > span.a-declarative > a > span').text().trim();
          const starsMatch = starsText.match(/\d+(\.\d+)?/); 
          const stars = starsMatch ? starsMatch[0] : ''; 

          const reviewsCountText = $('#acrCustomerReviewText').text().trim();
          const reviewsCountMatch = reviewsCountText.match(/\d+/); 
          const reviewsCount = reviewsCountMatch ? parseInt(reviewsCountMatch[0]) : 0; 

          let description = extractDescription($).replace(/\s+/g, ' ').replace(/\n/g, '\n');
          
          


          //construct data object with scraped data

          const data={
            url,
            currency: currency || '$',
            image:imageUrls[0],
            title,
            currentPrice:Number(currentPrice) || Number(originalPrice),
            originalPrice:Number(originalPrice) || Number(currentPrice),
            priceHisotry: [],
            discountRate:Number(discountRate),
            category:"category",
            reviewsCount:Number(reviewsCount),
            stars:Number(stars),
            isOutOfStock:outOfStock,
            description,
            lowestPrice:Number(currentPrice) ||Number(originalPrice),
            highestPrice:Number(originalPrice) || Number(currentPrice),
            averagePrice:Number(currentPrice) ||Number(originalPrice)
          }

        return data;
        

    }catch(error:any){
        throw new Error(`Failed to scrape product: ${error.message}`);

    }

    // #acrPopover > span.a-declarative > a > span




}