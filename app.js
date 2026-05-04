document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('purchaseDate');
    const rollsInput = document.getElementById('rollsCount');
    const daysInput = document.getElementById('daysPerRoll');
    const btn = document.getElementById('setReminderBtn');

    // Default to today
    dateInput.valueAsDate = new Date();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }

    // Detect iOS to show install prompt
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };
    
    // Detect if running as standalone PWA
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos() && !isInStandaloneMode()) {
        document.getElementById('iosPrompt').style.display = 'block';
    }

    function formatICSDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}T090000`; // Triggers at 9:00 AM local time
    }

    btn.addEventListener('click', () => {
        const purchaseDate = new Date(dateInput.value);
        const rolls = parseInt(rollsInput.value);
        const days = parseInt(daysInput.value);

        if (!rolls || !days) {
            alert("ALERT! Missing essential intel. Enter the total rolls and the daily endurance rate.");
            return;
        }

        // Calculate the day they run out
        const totalDays = rolls * days;
        const runOutDate = new Date(purchaseDate);
        runOutDate.setDate(runOutDate.getDate() + totalDays);

        // The reminder is exactly 1 day before they run out
        const reminderDate = new Date(runOutDate);
        reminderDate.setDate(reminderDate.getDate() - 1);

        const startStr = formatICSDate(reminderDate);
        
        // Event lasts 1 hour in the calendar
        const endStr = startStr.replace("090000", "100000");

        // --- UPDATED HUMOROUS TEXT FOR NOTIFICATION ---
        const eventSummary = "🚨 ALERT: THRONE ACCESS CRITICAL 🚨";
        const eventDescription = "ALERT: Your Tomowor Won't find a single sheet to wipe your ass with. GO GET THE BAG. Go get the drip! Avoid the unthinkable. 🧻💩💩";
        // ---------------------------------------------

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Stash Throne Room//EN
BEGIN:VEVENT
UID:${new Date().getTime()}@stashapp.com
DTSTAMP:${formatICSDate(new Date())}Z
DTSTART;TZID=Local:${startStr}
DTEND;TZID=Local:${endStr}
SUMMARY:${eventSummary}
DESCRIPTION:${eventDescription}
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

        // Download the file (triggers native calendar app)
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'throne-room-alert.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});