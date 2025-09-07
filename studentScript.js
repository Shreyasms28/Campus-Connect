document.addEventListener('DOMContentLoaded', () => {
    // Note: The college theme and other simulated data are now handled on the server side
    // or by the a more robust system. This file focuses on the core student functionalities.

    const studentUserId = localStorage.getItem('userId');
    if (!studentUserId) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
    }

    const eventsList = document.getElementById('events-list');
    const searchInput = document.getElementById('search-input');
    const eventFilter = document.getElementById('event-filter');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');

    // Function to display a custom message box
    window.showMessage = (message) => {
        messageText.textContent = message;
        messageBox.classList.remove('hidden', 'opacity-0', 'scale-95');
        messageBox.classList.add('flex', 'opacity-100', 'scale-100');
    };

    // Function to hide the custom message box
    window.hideMessage = () => {
        messageBox.classList.remove('opacity-100', 'scale-100');
        messageBox.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 300);
    };

    // Function to render events
    const renderEvents = (eventsToRender) => {
        eventsList.innerHTML = '';
        if (eventsToRender.length === 0) {
            eventsList.innerHTML = '<p class="col-span-full text-center text-gray-500 text-lg">No events found.</p>';
            return;
        }

        eventsToRender.forEach(event => {
            const isRegistered = event.registered;
            const hasAttended = event.attended;
            const hasFeedback = event.hasFeedback;

            const registerBtnClass = isRegistered ? 'bg-gray-400 cursor-not-allowed' : `bg-indigo-500 hover:bg-indigo-600 register-btn`;
            const registerBtnText = isRegistered ? 'Registered' : 'Register';
            const attendBtnClass = hasAttended ? 'bg-gray-400 cursor-not-allowed' : `bg-green-500 hover:bg-green-600 attend-btn`;
            const attendBtnText = hasAttended ? 'Attended' : 'Mark Attendance';
            const feedbackBtnClass = hasFeedback ? 'bg-gray-400 cursor-not-allowed' : `bg-yellow-500 hover:bg-yellow-600 feedback-btn`;
            const feedbackBtnText = hasFeedback ? 'Feedback Given' : 'Give Feedback';

            const eventCard = `
                <div class="event-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${event.title}</h3>
                        <p class="text-sm text-gray-500 mb-2"><strong>Date:</strong> ${event.date}</p>
                        <p class="text-sm text-gray-500 mb-4"><strong>Location:</strong> ${event.location}</p>
                        <p class="text-gray-600 text-sm mb-4">${event.description}</p>
                        <div class="space-y-2">
                            <button data-id="${event.event_id}" class="w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${registerBtnClass}" ${isRegistered ? 'disabled' : ''}>${registerBtnText}</button>
                            <button data-id="${event.event_id}" class="w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${attendBtnClass}" ${!isRegistered || hasAttended ? 'disabled' : ''}>${attendBtnText}</button>
                            <button data-id="${event.event_id}" class="w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${feedbackBtnClass}" ${!hasAttended || hasFeedback ? 'disabled' : ''}>${feedbackBtnText}</button>
                        </div>
                    </div>
                </div>
            `;
            eventsList.innerHTML += eventCard;
        });

        attachEventHandlers();
    };

    const attachEventHandlers = () => {
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                registerStudent(eventId);
            });
        });

        document.querySelectorAll('.attend-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                markAttendance(eventId);
            });
        });

        document.querySelectorAll('.feedback-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                showFeedbackForm(eventId);
            });
        });
    };

    const fetchEvents = async () => {
        try {
            // First, fetch the user's event status to determine which buttons to show
            const userEventsRes = await fetch(`/api/student/status?userId=${studentUserId}`);
            const userEventStatus = await userEventsRes.json();
            
            // Now, fetch all events
            const allEventsRes = await fetch('/api/student/events');
            const allEvents = await allEventsRes.json();
            
            // Merge the data
            const updatedEvents = allEvents.map(event => ({
                ...event,
                registered: userEventStatus.registrations.some(r => r.event_id === event.event_id),
                attended: userEventStatus.attendance.some(a => a.event_id === event.event_id),
                hasFeedback: userEventStatus.feedback.some(f => f.event_id === event.event_id)
            }));
            
            renderEvents(updatedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            showMessage('Failed to load events.');
        }
    };
    
    // API Calls
    const registerStudent = async (eventId) => {
        try {
            const response = await fetch('/api/student/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: eventId, user_id: studentUserId }),
            });
            const data = await response.json();
            showMessage(data.message);
            fetchEvents();
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Network error during registration.');
        }
    };

    const markAttendance = async (eventId) => {
        try {
            const response = await fetch('/api/student/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: eventId, user_id: studentUserId }),
            });
            const data = await response.json();
            showMessage(data.message);
            fetchEvents();
        } catch (error) {
            console.error('Attendance error:', error);
            showMessage('Network error during attendance marking.');
        }
    };

    const showFeedbackForm = (eventId) => {
        const rating = prompt('Please rate this event from 1 to 5:');
        if (rating && !isNaN(rating) && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
            const comment = prompt('Optional: Leave a comment about the event:');
            submitFeedback(eventId, parseInt(rating), comment);
        } else {
            showMessage('Invalid rating. Please enter a number between 1 and 5.');
        }
    };

    const submitFeedback = async (eventId, rating, comment) => {
        try {
            const response = await fetch('/api/student/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: eventId, user_id: studentUserId, rating, comment }),
            });
            const data = await response.json();
            showMessage(data.message);
            fetchEvents();
        } catch (error) {
            console.error('Feedback error:', error);
            showMessage('Network error during feedback submission.');
        }
    };
    
    // Event listeners for search and filter
    searchInput.addEventListener('input', () => {
        // Implement filtering logic on the client side based on fetched events
    });
    eventFilter.addEventListener('change', () => {
        // Implement filtering logic on the client side based on fetched events
    });

    // Initial render on page load
    fetchEvents();
});
