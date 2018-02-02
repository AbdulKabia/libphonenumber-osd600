let expect = require('chai').expect;
let chai = require('chai');
let app = require('../app');
let chaiSubset = require('chai-subset');
let fs = require('fs');

chai.use(require('chai-http'));
chai.use(chaiSubset);


describe('API endpoint /', () => {
    // GET - Root
    it('Should return status 200', () => {
        return chai.request(app)
            .get('/')
            .then((response) => {
                expect(response).to.have.status(200);
                expect(response.body).to.be.a('object');
            });
    });
});

describe('API GET request /api/phonenumbers/parse/text/nothing', () => {
    // GET - No numbers
    it(`Should return {"validNumbers":[],"invalidNumbers":[]}`, () => {
        return chai.request(app)
            .get('/api/phonenumbers/parse/text/nothing')
            .then((response) => {
                expect(response).to.have.status(200);
                expect(response.body).to.containSubset({ 
                    "validNumbers": [], 
                    "invalidNumbers": [] 
                });
            });
    });
});

describe('API GET request /api/phonenumbers/parse/text/Seneca%20Phone%20Number%3A%20416-154-9036', () => {
    // GET - Multiple Numbers
    it(`Should return status 200. With {
        "validNumbers":[
            "(416) 154-9036",
            "(905) 365-1864"
        ],
        "invalidNumbers":[]
        }`, () => {
        return chai.request(app)
            .get('/api/phonenumbers/parse/text/Seneca%20Phone%20Number%3A%20416-154-9036,9053651864')
            .then((response) => {
                expect(response).to.have.status(200);
                expect(response.body).to.be.a('object');
                expect(response.body).to.containSubset({ 
                    "validNumbers": [
                        "(416) 154-9036",
                        "(905) 365-1864"
                    ], 
                    "invalidNumbers": [] 
                });
            });
    });
});

describe('API POST request /api/phonenumbers/parse/file', () => {
    // POST - Multiple Numbers
    it(`It should resturn status 200. With {
        "validNumbers":[
            "(416) 987-3546",
            "(647) 315-9753",
            "(905) 354-1587",
            "(416) 987-3546"
        ],
        "invalidNumbers":[]
        }`, () => {
        return chai.request(app)
            .post('/api/phonenumbers/parse/file')
            .set('Content-Type', 'text/plain;charset=base64')
            .attach('myFile', fs.readFileSync('./phoneNums.txt'), ' ')
            .then(function (response) {
                expect(response).to.have.status(200);
                expect(response.body).to.containSubset({ 
                    "validNumbers": [
                        "(416) 987-3546", 
                        "(647) 315-9753", 
                        "(905) 354-1587", 
                        "(416) 987-3546"], 
                    "invalidNumbers": [] 
                });
            });
    });
});