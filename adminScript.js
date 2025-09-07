document.addEventListener('DOMContentLoaded', () => {
    const createEventForm = document.getElementById('create-event-form');
    const messageBox = document.getElementById('message-box');
    const eventReportsSection = document.getElementById('reports');
    const popularityReport = document.getElementById('popularity-report');
    const participationReport = document.getElementById('participation-report');
    const feedbackReport = document.getElementById('feedback-report');

    // Function to display a custom message box
    window.showMessage = (message) => {
        const messageText = document.getElementById('message-text');
        const box = document.getElementById('message-box');
        messageText.textContent = message;
        box.classList.remove('hidden', 'opacity-0', 'scale-95');
        box.classList.add('flex', 'opacity-100', 'scale-100');
    };

    // Function to hide the custom message box
    window.hideMessage = () => {
        const box = document.getElementById('message-box');
        box.classList.remove('opacity-100', 'scale-100');
        box.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            box.classList.add('hidden');
        }, 300);
    };

    // Form submission for creating an event
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('event-name').value;
        const date = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;
        const description = document.getElementById('event-description').value;
        
        const eventData = {
            title,
            date,
            location,
            description,
        };

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Event created successfully!');
                createEventForm.reset();
                // Optionally refresh reports after creating a new event
                fetchReports();
            } else {
                showMessage(data.error || 'Failed to create event.');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            showMessage('Network error. Please try again.');
        }
    });

    // Helper function to render a bar chart
    const renderBarChart = (data, title, valueKey, labelKey, container) => {
        container.innerHTML = `<h3 class="text-lg font-semibold mb-4">${title}</h3>`;
        if (data.length === 0) {
            container.innerHTML += '<p class="text-gray-500">No data available.</p>';
            return;
        }

        const maxVal = Math.max(...data.map(d => d[valueKey]));
        const chartHtml = data.map(d => `
            <div class="mb-4">
                <p class="text-sm font-medium text-gray-700">${d[labelKey]}</p>
                <div class="w-full bg-gray-200 rounded-full h-4 relative mt-1">
                    <div class="bg-indigo-600 h-4 rounded-full transition-all duration-500" style="width: ${(d[valueKey] / maxVal) * 100}%;"></div>
                    <span class="absolute top-0 right-2 text-sm text-gray-800">${d[valueKey].toFixed(d[valueKey] % 1 !== 0 ? 1 : 0)}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML += chartHtml;
    };

    // Fetch and render reports
    const fetchReports = async () => {
        try {
            // Event Popularity Report
            const popularityRes = await fetch('/api/admin/reports/popularity');
            const popularityData = await popularityRes.json();
            renderBarChart(popularityData, 'Event Popularity Report (Registrations)', 'registration_count', 'title', popularityReport);

            // Student Participation Report
            const participationRes = await fetch('/api/admin/reports/participation');
            const participationData = await participationRes.json();
            renderBarChart(participationData, 'Student Participation Report (Events Attended)', 'attendance_count', 'username', participationReport);

            // Average Feedback Score
            const feedbackRes = await fetch('/api/admin/reports/feedback');
            const feedbackData = await feedbackRes.json();
            renderBarChart(feedbackData, 'Average Feedback Score (Out of 5)', 'average_rating', 'title', feedbackReport);

        } catch (error) {
            console.error('Error fetching reports:', error);
            showMessage('Failed to load reports.');
        }
    };

    // Call fetchReports when the report section is visible or on a user action
    document.querySelector('a[href="#reports"]').addEventListener('click', (e) => {
        e.preventDefault();
        fetchReports();
        window.location.hash = 'reports'; // Update URL to allow back button
    });

    // Initial load of reports if the page is loaded with #reports hash
    if (window.location.hash === '#reports') {
        fetchReports();
    }
});
