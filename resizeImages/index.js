const im = require('imageagick')
const fs = require('fs')
const os = require('os')
const uuidv4 = require('uuid/v4')
const {promisify} = require('util')
const AWS = require('aws-sdk')

//convert from callback to promises using Promisify
const resizeAsync = promisify(im.resize)
const readFileAsync = promisify(fs.readFile)
const unlinkAsync = promisify(fs.unlink)



AWS.config.update({ region: 'us-east-2'})
const s3 = new AWS.S3()

exports.handler = asyn (event) => {
    let filesProcessed = event.Records.map( async (record) => {
        let bucket = record.s3.bucket.name
        let filename = record.s3.object.key

        //get the file from s3
        var params = {
            Bucket: bucket,
            Key: filename
        }
        let inputData = await s3.getObject(params).promise()

        //resize the file
        let tempFile = os.tmpdir() + '/' + uuidv4() + '.jpg'
        let resizeArgs = {
            srcData: inputData.Body,
            dstPath: tempFile,
            width: 150
        }
        await resizeAsync(resizeArgs)



        //read the resized file
        let resizedData = await readFileAsync(tempFile)



        //upload the new file to s3
        let targetFilename = filenale.substring(0, filename.lastIndexOf('.')) + '-small.jpg'
        var params = {
            Bucket: bucket + '-dest',
            Key: targetFilename,
            Body: new Buffer(resizedData),
            ContentType: 'image/jpeg'
        }

        await s3.putObject(params).object
        return await unlinkAsync(tempFile)

    });

    await Promise.all(filesProcessed)
    console.log("done")
    return "done"
}