const express = require('express');
const axios = require('axios');
const app = express();
//I had to add dotenv so .env values could be read
require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.
app.get('/', async (req,res)=>{
    renderHome(req,res);
});

//Retrieves custom object properties values (not accessible from /crm/v3/objects/songs)
//Required = song.properties.hs_object_id
async function getSongProps(songID){
    //List of every property intended to be read in this call
    const propertyList = "name,artist,album"
    const endpoint = `https://api.hubspot.com/crm/v3/objects/songs/${songID}?properties=${propertyList}`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }

    try {
        const resp = await axios.get(endpoint, { headers });
        const data = resp.data;
        return data; //SONG obj JSON with its custom properties
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
      }
};

//This function was made for calling app.get('/') --> homepage
async function renderHome(req,res){
    const endpoint = 'https://api.hubspot.com/crm/v3/objects/songs';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }

    try{
        const resp = await axios.get(endpoint, { headers });
        const data = resp.data.results; //SONG JSON response but with NO CUSTOM prop value
        var result = []; //empty array for saving each SONG JSON after retrieving SONG CUSTOM prop values

        //Dealing with every promise from every object found in last axios.get call
        const promises = data.map(async song =>{
            const songData = getSongProps(song.properties.hs_object_id); //Must inform object ID
            return songData;
        });
        const resolvedData = await Promise.all(promises); //Await for all promises created earlier
        resolvedData.forEach(song=> result.push(song)); //Updates the empty array

        res.render('homepage', { result });
    } catch (e) {
        e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
};

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.
app.get('/update-cobj', async(req,res)=>{
    try{
        res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
    }
    catch (e) {
        e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.
app.post('/update-cobj', async (req,res)=>{
    //Retrieves forms values
    const body = {
        properties: {
            "name": req.body.songName,
            "artist": req.body.artistName,
            "album": req.body.albumName
        }
    };
    
    const endpoint = 'https://api.hubspot.com/crm/v3/objects/songs';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try{
        await axios.post(endpoint, body, { headers });
        renderHome(req,res);
    }
    catch (e) {
        e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));