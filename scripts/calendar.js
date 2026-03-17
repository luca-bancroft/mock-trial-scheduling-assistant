let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('events')) || [];

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year header
    const monthYear = document.getElementById('monthYear');
    monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, true);
        calendar.appendChild(dayEl);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createDayElement(day, false, year, month);
        calendar.appendChild(dayEl);
    }
    
    // Next month days
    const totalCells = calendar.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true);
        calendar.appendChild(dayEl);
    }
}

function createDayElement(day, isOtherMonth, year, month) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    } else {
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        // Check if day has events
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (events.some(e => e.date === dateStr)) {
            dayEl.classList.add('has-event');
        }
    }
    
    return dayEl;
}

function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach((event, index) => {
        const eventEl = document.createElement('div');
        eventEl.className = 'event-item';
        
        const dateObj = new Date(event.date + 'T00:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        eventEl.innerHTML = `
            <span><strong>${event.name}</strong> - ${dateStr}</span>
            <button onclick="removeEvent(${index})">Remove</button>
        `;
        
        eventsList.appendChild(eventEl);
    });
}

function addEvent() {
    const eventInput = document.getElementById('eventInput');
    const eventDate = document.getElementById('eventDate');
    
    if (eventInput.value.trim() && eventDate.value) {
        events.push({
            name: eventInput.value,
            date: eventDate.value
        });
        
        localStorage.setItem('events', JSON.stringify(events));
        eventInput.value = '';
        eventDate.value = '';
        
        renderCalendar();
        renderEvents();
    } else {
        alert('Please fill in both event name and date');
    }
}

function removeEvent(index) {
    events.splice(index, 1);
    localStorage.setItem('events', JSON.stringify(events));
    renderCalendar();
    renderEvents();
}

// Event listeners
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('addEventBtn').addEventListener('click', addEvent);

document.getElementById('eventInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEvent();
});

// Initial render
renderCalendar();
renderEvents();
