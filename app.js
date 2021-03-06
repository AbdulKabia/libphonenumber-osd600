// Dependancies
let express = require(`express`);
let app = express();
let fs = require('fs');
let multer = require(`multer`);
let upload = multer({ dest: `uploads/` });
let PNF = require(`google-libphonenumber`).PhoneNumberFormat; // Require `PhoneNumberFormat`. 
let phoneUtil = require(`google-libphonenumber`).PhoneNumberUtil.getInstance();// Get an instance of `PhoneNumberUtil`.
let pdfText = require('pdf-text');
if (!module.parent) {
    app.listen(3000);
    console.log(`App is running and listening on port: 3000`);
}


// Initialize default route
app.get(`/`, (request, response) => {
    response.status(200).send(`I'm alive and well!`);
});

// Find phone numbers from given array
let findPhoneNumbers = arrayOfNumbers => {
    // Object to hold returned phone numbers
    let numbersArray = {
        validNumbers: [],
        invalidNumbers: []
    };

    // Filter through the array looking for numbers
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        let currentNumber;
        let numWasFound = true;
        try {
          // Try to find a number using given element
            currentNumber = phoneUtil.parse(arrayOfNumbers[i], 'CA');
        }
        catch (error) {
            numWasFound = false;
        }

        if (numWasFound) {
            // Format the found phone number into (xxx) xxx-xxxx
            let tempNumb = phoneUtil.format(currentNumber, PNF.NATIONAL);
            // Note: Google's library will only properly format the number if it is a valid one
            // Which is why I do this check and place the number into the correct array
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
    // Check if param was passed
    if (request.params.givenText) {
        // Replace anything that isn't a number or a comma with nothing
        // split into array by splitting on commas
        let userData = request.params.givenText.replace(/[^0-9,]/g, '').split(',');
        let numbersFound = await findPhoneNumbers(userData);

        response.json(numbersFound);
    }

    else {
        response.status(400).json([]);
    }

});

app.get(`/api/phonenumbers/parse/file/`, async (request, response) => {
    // Redirect the user to the html page
    response.sendFile(`${__dirname}/post.html`);
})

app.post(`/api/phonenumbers/parse/file/`, upload.single('myFile'), async (request, response) => {
    if (request.file) {

        if (request.file.originalname.match(/.*.pdf/)) {
            pdfText(request.file.path, (err, contents) => {
                let myResponse = findPhoneNumbers(contents);
                response.status(200).json(myResponse);
            });
        } else {
            // Read the contents of the uploaded file
            let fileContents = fs.readFileSync(request.file.path);
            // Convert it to base64 with ascii characters
            let asciiContent = Buffer.from(fileContents, 'base64').toString('ascii');

            // Replace anything that isn't a number or a comma with nothing
            // split into array by splitting on commas
            let fileArray = asciiContent.replace(/[^0-9,]/g, '').split(',');
            let numbersFound = await findPhoneNumbers(fileArray);

            response.json(numbersFound);
        }
    }
    else {
        response.status(400).json("No file recieved");
    }
});

app.get('*', (req, res) =>{
    res.status(404).send("<h2>The Page you looking for is not found. <br/>Error: 404</h2>");
})

module.exports = app;