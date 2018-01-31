// Dependancies
let express = require(`express`);
let app = express();
let fs = require('fs');
let multer = require(`multer`);
let upload = multer({ dest: `uploads/` });
let PNF = require(`google-libphonenumber`).PhoneNumberFormat; // Require `PhoneNumberFormat`. 
let phoneUtil = require(`google-libphonenumber`).PhoneNumberUtil.getInstance();// Get an instance of `PhoneNumberUtil`.

let server = app.listen(3000);

// Initialize default route
app.get(`/`, (req, res) => {
    res.status(200).send(`I'm alive and well! Head to '/api/phonenumbers/parse/text/' to get started!`);
});

// Find phone numbers from given array
let findPhoneNumbers = async arrayOfNumbers => {
    let numbersArray = {
        validNumbers: [],
        invalidNumbers: []
    };
    let numberFound;


    // Filter through the array looking for numbers
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        let numWasFound = true;
        try {
            numberFound = phoneUtil.parse(arrayOfNumbers[i], 'CA');
        }
        catch (error) {
            numWasFound = false;

        }
        if (numWasFound) {
            let tempNumb = phoneUtil.format(numberFound, PNF.NATIONAL);
            if (tempNumb.includes('(')) {
                numbersArray.validNumbers.push(tempNumb);
            }
            else {
                numbersArray.invalidNumbers.push(tempNumb);
            }
        }
    }

    return numbersArray;
}

app.get(`/api/phonenumbers/parse/text/:givenText?`, async (request, response) => {
    if (request.params.givenText) {
        let userData = request.params.givenText.replace(/[^0-9,]/gi, '').split(',');
        let numbersFound = await findPhoneNumbers(userData);

        response.setHeader('Content-Type', 'text/plain');
        response.json(numbersFound ? numbersFound : []);
    }

    else {
        response.status(400).json([]);
    }

});

app.get(`/api/phonenumbers/parse/file/`, async (request, response) => {
    response.sendFile(`${__dirname}/post.html`);
})

app.post(`/api/phonenumbers/parse/file/`, upload.single('myFile'), async (request, response) => {
    if (request.file) {

        // Read the contents of the uploaded file
        let fileContents = fs.readFileSync(request.file.path);
        // Convert it to base64 ascii characters
        let asciiContent = Buffer.from(fileContents, 'base64').toString('ascii');

        // Replace anything that isn't a number or a comma with nothing
        // split into array by splitting on commans
        let fileArray = asciiContent.replace(/[^0-9,]/gi, '').split(',');
        let numbersFound = await findPhoneNumbers(fileArray);

        response.setHeader('Content-Type', 'text/plain');
        response.json(numbersFound ? numbersFound : []);
    }
    else {
        response.status(400).json("No file recieved");
    }
});



module.exports = app;