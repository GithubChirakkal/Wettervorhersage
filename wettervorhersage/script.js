// /app.js
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Open-Meteo API URL
const API_URL = 'https://api.open-meteo.com/v1/forecast';

// Hilfsfunktion, um die geographischen Koordinaten einer Stadt zu erhalten
async function getCoordinates(city) {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: city,
                format: 'json',
                limit: 1
            }
        });
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { lat, lon };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Route zur Verarbeitung der Wetteranfragen
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.json({ error: 'Bitte gib eine Stadt an.' });
    }

    // Hole die Koordinaten der Stadt
    const coordinates = await getCoordinates(city);
    if (!coordinates) {
        return res.json({ error: 'Stadt nicht gefunden.' });
    }

    // Abrufen der Wetterdaten von Open-Meteo
    try {
        const weatherResponse = await axios.get(API_URL, {
            params: {
                latitude: coordinates.lat,
                longitude: coordinates.lon,
                current_weather: true
            }
        });

        const weatherData = weatherResponse.data.current_weather;

        res.json({
            temperature: weatherData.temperature,
            weather: weatherData.weathercode
        });
    } catch (error) {
        res.json({ error: 'Fehler beim Abrufen der Wetterdaten.' });
    }
});

// Statische Dateien für das Frontend bereitstellen
app.use(express.static('public'));

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
