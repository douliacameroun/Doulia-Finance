// Updated to include Content-Type header

export const apiSimulations = () => {
    fetch('/api/simulations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log(data));
};