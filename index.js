const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.
app.get('/', async (req,res)=>{
    const endpoint = 'https://api.hubspot.com/crm/v3/objects/songs';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }

    try{
        const resp = await axios.get(endpoint, { headers });
        const data = resp.data.results;
        var result = [];

        const promises = data.map(async song =>{
            const songData = getSongProps(song.properties.hs_object_id);
            return songData;
        });
        const resolvedData = await Promise.all(promises);
        resolvedData.forEach(song=> result.push(song));

        /* it looks like promises were not finnished yet
        data.forEach(song => {
            getSongProps(song.properties.hs_object_id);
            result.push(song);
        });
        */
        result.forEach(item=>{
            console.log(item.properties.name);
        });
        //console.log(result);
        res.render('homepage', { result });
    } catch (e) {
        e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
});

async function getSongProps(songID){
    const propertyList = "name,artist,album"
    const endpoint = `https://api.hubspot.com/crm/v3/objects/songs/${songID}?properties=${propertyList}`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }

    try {
        const resp = await axios.get(endpoint, { headers });
        const data = resp.data;
        return data;
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
    //console.log("--> " + req.body);
    const body = {
        properties: {
            "name": req.body.songName,
            "artist": req.body.artistName,
            "album": req.body.albumName
        }
    };
    //console.log(body);

    const endpoint = 'https://api.hubspot.com/crm/v3/objects/songs';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try{
        //missing code
        console.log('Should POST now');
    }
    catch (e) {
        e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }

});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));