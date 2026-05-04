document.addEventListener('DOMContentLoaded', () => {
    const purchaseSlider = document.getElementById('purchaseSlider');
    const dateDisplay = document.getElementById('dateDisplay');
    const btn = document.getElementById('setReminderBtn');

    let currentRolls = 12;
    let currentDays = 4;

    purchaseSlider.addEventListener('input', (e) => {
        const daysAgo = parseInt(e.target.value);
        if (daysAgo === 0) dateDisplay.innerText = "TODAY";
        else if (daysAgo === 1) dateDisplay.innerText = "YESTERDAY";
        else dateDisplay.innerText = `${daysAgo} DAYS AGO`;
    });

    function setupDial(elementId, min, max, initial, isRolls) {
        const container = document.getElementById(elementId);
        const rotator = container.querySelector('.dial-rotator');
        const valueText = container.querySelector('.dial-value');
        let isDragging = false;

        let startPercent = (initial - min) / (max - min);
        let startAngle = (startPercent * 280) - 140; 
        rotator.style.transform = `rotate(${startAngle}deg)`;

        function updateRotation(e) {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
            
            angle += 90;
            if (angle < -180) angle += 360;
            if (angle > 180) angle -= 360;

            if (angle > 140) angle = 140;
            if (angle < -140) angle = -140;

            rotator.style.transform = `rotate(${angle}deg)`;

            let percent = (angle + 140) / 280;
            let val = Math.round(min + percent * (max - min));
            
            valueText.innerText = val;
            if (isRolls) currentRolls = val;
            else currentDays = val;
        }

        container.addEventListener('pointerdown', (e) => {
            isDragging = true;
            updateRotation(e);
            container.setPointerCapture(e.pointerId);
        });

        container.addEventListener('pointermove', (e) => {
            if (isDragging) updateRotation(e);
        });

        container.addEventListener('pointerup', (e) => {
            isDragging = false;
            container.releasePointerCapture(e.pointerId);
        });
    }

    setupDial('dial-rolls', 1, 48, 12, true);
    setupDial('dial-days', 1, 14, 4, false);

    function formatICSDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}T090000`; 
    }

    btn.addEventListener('click', () => {
        const daysAgo = parseInt(purchaseSlider.value);
        const purchaseDate = new Date();
        purchaseDate.setDate(purchaseDate.getDate() - daysAgo);

        const totalDays = currentRolls * currentDays;
        const runOutDate = new Date(purchaseDate);
        runOutDate.setDate(runOutDate.getDate() + totalDays);

        const reminderDate = new Date(runOutDate);
        reminderDate.setDate(reminderDate.getDate() - 1);

        const startStr = formatICSDate(reminderDate);
        const endStr = startStr.replace("090000", "100000");

        const eventSummary = "🚨 ALERT: THRONE ACCESS CRITICAL 🚨";
        const eventDescription = "ALERT: Your Tomorrow Won't find a single sheet to wipe your ass with. GO GET THE BAG. Go get the drip! Avoid the unthinkable. 🧻💩";

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

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'throne-room-alert.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
    const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
    if (isIos() && !isInStandaloneMode()) document.getElementById('iosPrompt').style.display = 'block';
});