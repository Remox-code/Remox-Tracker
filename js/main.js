document.addEventListener("DOMContentLoaded", () => {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const updateCount = () => {
            const target = +stat.getAttribute('data-target');
            const count = +stat.innerText.replace(/[$,%]/g, '');
            const speed = 200; // هرچه بیشتر باشد، انیمیشن آرام‌تر است
            
            const inc = target / speed;

            if (count < target) {
                const newValue = Math.ceil(count + inc);
                const prefix = stat.getAttribute('data-prefix') || '';
                const suffix = stat.getAttribute('data-suffix') || '';
                stat.innerText = prefix + newValue.toLocaleString() + suffix;
                setTimeout(updateCount, 1);
            } else {
                const prefix = stat.getAttribute('data-prefix') || '';
                const suffix = stat.getAttribute('data-suffix') || '';
                stat.innerText = prefix + target.toLocaleString() + suffix;
            }
        };
        updateCount();
    });
});



const ctx = document.getElementById('monthlyChart');

new Chart(ctx, {
type: 'line',
data: {
labels: [
'Week 1',
'Week 2',
'Week 3',
'Week 4'
],
datasets: [{
label: 'Habit Completion',
data: [65, 78, 82, 95],
borderColor: '#6C5CE7',
backgroundColor: 'rgba(108,92,231,0.15)',
tension: 0.4,
fill: true,
pointRadius: 5,
pointBackgroundColor: '#6C5CE7'
}]
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
display: false
}
},
scales: {
y: {
beginAtZero: true,
ticks: {
color: '#aaa'
},
grid: {
color: 'rgba(255,255,255,0.05)'
}
},
x: {
ticks: {
color: '#aaa'
},
grid: {
display:false
}
}
}
}
});
