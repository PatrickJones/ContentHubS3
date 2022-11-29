import { get } from 'https'; // or 'https' for https:// URLs
import { createWriteStream } from 'fs';
import http from 'http';
import { PassThrough, Stream } from 'stream';
import { S3Client} from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from 'axios';

const REGION = "us-west-2";
const BUCKET = "testassests";
const TOKEN = "chaws8983454undfns823e4er5";

const S3C = new S3Client({
    region: REGION,
  accessKeyId: "AKIAZRXSUXAAQ7C5BZB7",
  secretAccessKey: "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"
});

let response;

async function upload(S3, key) {
    let pass = new PassThrough();
   
    let params = {
        Bucket: BUCKET,
        Key: data.Filename,
        Body: 'some data'
    };

    var sendData = await S3C.send(new PutObjectCommand(params));
   
    return pass;
  }

  async function downloadFile (url, bucketKey) {
    return axios.get(url)
    .then(async res => {
        try {
            let params = {
                Bucket: BUCKET,
                Key: bucketKey,
                Body: res.data
            };

            console.info("Executing PUT object command");

            var sendData = await S3C.send(new PutObjectCommand(params));

        } catch (sendError) {
            console.error("Error: ", sendError);
        }
    })
    .catch(error => {
        console.log(error)
    })

    // return await new Promise((resolve, reject) => {
    //     get(url, function(res) {
    //         let rawData = '';
         
    //         // after download completed close filestream
    //         res.on('data', chunk => {
    //             rawData += chunk
    //             console.info(rawData);
    //         })
            
    //         res.on('end', async () => {
    //             try {
    //                 let params = {
    //                     Bucket: BUCKET,
    //                     Key: bucketKey,
    //                     Body: rawData
    //                 };

    //                 console.info("Executing PUT object command");
    
    //                 var sendData = await S3C.send(new PutObjectCommand(params));
    
    //             } catch (sendError) {
    //                 console.error("Error: ", sendError);
    //             }
    //         })
    //      });
    // })
  }




/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

export async function lambdaHandler(event, context) {
    try {
        if (event.headers !== null && event.headers !== undefined) {
            let headers = event.headers;

            if (typeof headers['X-ch-token'] === 'undefined' || headers['X-ch-token'] !== TOKEN) {
                console.warn("x-ch-token is required.");
                return response = {
                    'statusCode': 401,
                    'body': JSON.stringify({
                        message: 'Invalid or missing token.',
                    })
                };
            }
        }

        if (event.body !== null && event.body !== undefined) {
            console.log(event.body);
            let data = JSON.parse(event.body);
            
            console.log(data);
            if (typeof data.DownloadUrl === 'undefined') {
                console.warn("Download Url is required.");
                return response = {
                    'statusCode': 404,
                    'body': JSON.stringify({
                        message: 'Download Url is required.',
                    })
                };
            }
            
            if (typeof data.Filename === 'undefined') {
                console.warn("Filename is required.");
                return response = {
                    'statusCode': 404,
                    'body': JSON.stringify({
                        message: 'Filename is required.',
                    })
                };
            }
            
            if (typeof data.FileType === 'undefined') {
                console.warn("File mime type is required.");
                return response = {
                    'statusCode': 404,
                    'body': JSON.stringify({
                        message: 'File mime type is required.',
                    })
                };
            }
            
            console.info("Creating file stream for download into bucket")
            //let file = createWriteStream(data.Filename);
            //let strm = new Stream();
            //strm.writeable = true;
            //let request = get(data.DownloadUrl, function(response) {
            //   //console.info(response);
            //   //response.pipe(upload(S3C, data.Filename));
            //   response.pipe(strm);
            //
            //   // after download completed close filestream
            //   strm.on("finish", () => {
            //        strm.pipe(upload(S3C, data.Filename))
            //        strm.close();
            //       console.info("Download Completed");
            //   });
            //  strm.on("error", () => {
            //    strm.close();
            //    console.error("Error Download file");
            //   });
            //});



            await downloadFile(data.DownloadUrl, data.Filename);

            
            console.log(`Pushing asset ${data.DownloadUrl} to bucket.`);
            return response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: `Asset to push into bucket: ${data.DownloadUrl}`,
                })
            };
        }    
        
        console.warn("Asset not migrated to bucket.");
        response = {
            'statusCode': 404,
            'body': JSON.stringify({
                message: 'Asset not migrated to bucket.',
            })
        };
    } catch (err) {
        console.log(err);
        response = {
            'statusCode': 503,
            'body': JSON.stringify({
                message: err,
            })
        };
    }

    return response;
}