/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/ticket');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    document.getElementById('ticket-count').textContent =
      `${data.data}  Tickets Generated`;
  } catch (error) {
    console.error('Error fetching ticket count:', error);
    document.getElementById('ticket-count').textContent = 'Error loading data';
  }
});
