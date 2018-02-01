# Google's libphonenumber library implemented in JavaScript

## Setup:

1. Step 1:
```
git clone https://github.com/AbdulKabia/libphonenumber-osd600.git
```

2. Step 2: Ensure that Node.js is install on your machine
```
npm install
```

3. Step 3:
```
npm test
```


## To use it yourself
This API is capable of handling two differet requests, a post and a get.

### POST
In order to use the POST method, upload a file to the URL `localhost:3000/api/phonenumbers/parse/file`. Make sure that the `Content-Type` of the header is `text/plain` with a base64 encoded text file


### GET
The GET method is very simple and only requires that you send the text you'd like to be parsed to the url `localhost:3000/api/phonenumbers/parse/text/`. So for example: 

```
localhost:3000/api/phonenumbers/parse/text/Seneca%20Phone%20Number%3A%20416-154-9036
```

