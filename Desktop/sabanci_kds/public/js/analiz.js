let firmaCharts = {};
let girisimciCharts = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

async function fetchDashboardData(filters = {}) {
    showLoading(true);
    hideError();

    try {
        const queryParams = new URLSearchParams();

        if (filters.firmaMinCiro) queryParams.append('firmaMinCiro', filters.firmaMinCiro);
        if (filters.minGeriDonusum) queryParams.append('minGeriDonusum', filters.minGeriDonusum);
        if (filters.minKadinOran) queryParams.append('minKadinOran', filters.minKadinOran);
        if (filters.minEngelli) queryParams.append('minEngelli', filters.minEngelli);
        if (filters.girisimciMinYil) queryParams.append('girisimciMinYil', filters.girisimciMinYil);

        const url = `/api/analiz${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Sunucu hatası: ${response.status}`);
        }

        const data = await response.json();

        renderKPIs(data);
        renderCharts(data);

        showLoading(false);
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        showError(error.message || 'Veriler yüklenirken bir hata oluştu');
        showLoading(false);
    }
}

function renderKPIs(data) {
    document.getElementById('firma-total').textContent = data.firmalar.kpis.total.toLocaleString('tr-TR');
    document.getElementById('firma-avg-ciro').textContent = data.firmalar.kpis.avgCiro.toLocaleString('tr-TR');
    document.getElementById('firma-avg-geri').textContent = data.firmalar.kpis.avgGeriDonusum.toFixed(1);
    document.getElementById('firma-avg-kadin').textContent = data.firmalar.kpis.avgKadinOran.toFixed(1);

    document.getElementById('girisimci-total').textContent = data.girisimciler.kpis.total.toLocaleString('tr-TR');
    document.getElementById('girisimci-avg-kadin').textContent = data.girisimciler.kpis.avgKadinOran.toFixed(1);
    document.getElementById('girisimci-avg-engelli').textContent = data.girisimciler.kpis.avgEngelli.toFixed(1);
}

function renderCharts(data) {
    renderFirmaCiroChart(data.firmalar.charts.ciroTopN);
    renderFirmaGeriChart(data.firmalar.charts.geriDonusumDist);
    renderFirmaKadinChart(data.firmalar.charts.kadinOranDist);

    renderGirisimciYilChart(data.girisimciler.charts.kurulusYiliDist);
    renderGirisimciKadinChart(data.girisimciler.charts.kadinOranDist);
}

function renderFirmaCiroChart(data) {
    const ctx = document.getElementById('firma-ciro-chart');

    if (firmaCharts.ciro) {
        firmaCharts.ciro.destroy();
    }

    if (!data || data.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    firmaCharts.ciro = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.ad),
            datasets: [{
                label: 'Ciro (TL)',
                data: data.map(d => d.ciro),
                backgroundColor: 'rgba(79, 172, 254, 0.8)',
                borderColor: 'rgba(79, 172, 254, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return context.parsed.x.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1',
                        callback: (value) => {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                    },
                    grid: {
                        color: '#475569'
                    }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderFirmaGeriChart(data) {
    const ctx = document.getElementById('firma-geri-chart');

    if (firmaCharts.geri) {
        firmaCharts.geri.destroy();
    }

    if (!data || data.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    firmaCharts.geri = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.range),
            datasets: [{
                label: 'Firma Sayısı',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(124, 58, 237, 0.8)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        stepSize: 1
                    },
                    grid: {
                        color: '#475569'
                    }
                }
            }
        }
    });
}

function renderFirmaKadinChart(data) {
    const ctx = document.getElementById('firma-kadin-chart');

    if (firmaCharts.kadin) {
        firmaCharts.kadin.destroy();
    }

    if (!data || data.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    firmaCharts.kadin = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.range),
            datasets: [{
                label: 'Firma Sayısı',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: '#475569'
                    }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        stepSize: 1
                    },
                    grid: {
                        color: '#475569'
                    }
                }
            }
        }
    });
}

function renderGirisimciYilChart(data) {
    const ctx = document.getElementById('girisimci-yil-chart');

    if (girisimciCharts.yil) {
        girisimciCharts.yil.destroy();
    }

    if (!data || data.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    girisimciCharts.yil = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.year),
            datasets: [{
                label: 'Girişimci Sayısı',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        stepSize: 1
                    },
                    grid: {
                        color: '#475569'
                    }
                }
            }
        }
    });
}

function renderGirisimciKadinChart(data) {
    const ctx = document.getElementById('girisimci-kadin-chart');

    if (girisimciCharts.kadin) {
        girisimciCharts.kadin.destroy();
    }

    if (!data || data.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    girisimciCharts.kadin = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.range),
            datasets: [{
                label: 'Girişimci Sayısı',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        stepSize: 1
                    },
                    grid: {
                        color: '#475569'
                    }
                }
            }
        }
    });
}

function handleApplyFilters() {
    const filters = {
        firmaMinCiro: document.getElementById('firmaMinCiro').value,
        minGeriDonusum: document.getElementById('minGeriDonusum').value,
        minKadinOran: document.getElementById('minKadinOran').value,
        minEngelli: document.getElementById('minEngelli').value,
        girisimciMinYil: document.getElementById('girisimciMinYil').value
    };

    const cleanFilters = {};
    for (const [key, value] of Object.entries(filters)) {
        if (value && value.trim() !== '') {
            cleanFilters[key] = value.trim();
        }
    }

    fetchDashboardData(cleanFilters);
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const panel = document.getElementById('error-panel');
    const messageEl = document.getElementById('error-message');

    messageEl.textContent = message;
    panel.style.display = 'block';
}

function hideError() {
    const panel = document.getElementById('error-panel');
    panel.style.display = 'none';
}

function retryLoad() {
    hideError();
    fetchDashboardData();
}
