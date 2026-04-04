// Import necessary modules
import axios from 'axios';

const AIRTABLE_API_URL = 'YOUR_AIRTABLE_API_URL';

// Function to send data to Airtable
const sendDataToAirtable = async (data) => {
    try {
        const response = await axios.post(AIRTABLE_API_URL, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Error sending data to Airtable: ' + error.message);
    }
};

export default sendDataToAirtable;