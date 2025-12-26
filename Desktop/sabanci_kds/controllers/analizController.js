const supabase = require('../db/supabase');

const getDashboardData = async (req, res) => {
    try {
        const {
            firmaMinCiro,
            minGeriDonusum,
            minKadinOran,
            minEngelli,
            girisimciMinYil
        } = req.query;

        let firmaQuery = supabase.from('firmalar').select('*');

        if (firmaMinCiro) {
            const minCiro = parseFloat(firmaMinCiro);
            if (!isNaN(minCiro)) {
                firmaQuery = firmaQuery.gte('ciro', minCiro);
            }
        }

        if (minGeriDonusum) {
            const minGeri = parseFloat(minGeriDonusum);
            if (!isNaN(minGeri)) {
                firmaQuery = firmaQuery.gte('geri_donusum_orani', minGeri);
            }
        }

        if (minKadinOran) {
            const minKadin = parseFloat(minKadinOran);
            if (!isNaN(minKadin)) {
                firmaQuery = firmaQuery.gte('kadin_calisan_orani', minKadin);
            }
        }

        if (minEngelli) {
            const minEng = parseFloat(minEngelli);
            if (!isNaN(minEng)) {
                firmaQuery = firmaQuery.gte('engelli_calisan_sayisi', minEng);
            }
        }

        const { data: firmalar, error: firmaError } = await firmaQuery;

        if (firmaError) {
            console.error('Firma query error:', firmaError);
            return res.status(500).json({
                error: 'Firma verileri alınırken hata oluştu',
                details: firmaError.message
            });
        }

        let girisimciQuery = supabase.from('girisimciler').select('*');

        if (girisimciMinYil) {
            const minYil = parseInt(girisimciMinYil);
            if (!isNaN(minYil)) {
                girisimciQuery = girisimciQuery.gte('kurulus_yili', minYil);
            }
        }

        const { data: girisimciler, error: girisimciError } = await girisimciQuery;

        if (girisimciError) {
            console.error('Girişimci query error:', girisimciError);
            return res.status(500).json({
                error: 'Girişimci verileri alınırken hata oluştu',
                details: girisimciError.message
            });
        }

        const firmaAnalysis = analyzeFirmalar(firmalar || []);
        const girisimciAnalysis = analyzeGirisimciler(girisimciler || []);

        res.json({
            firmalar: firmaAnalysis,
            girisimciler: girisimciAnalysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            error: 'Beklenmeyen bir hata oluştu',
            details: error.message
        });
    }
};

function analyzeFirmalar(firmalar) {
    if (!firmalar || firmalar.length === 0) {
        return {
            kpis: {
                total: 0,
                avgCiro: 0,
                avgGeriDonusum: 0,
                avgKadinOran: 0,
                avgEngelli: 0
            },
            charts: {
                ciroTopN: [],
                geriDonusumDist: [],
                kadinOranDist: [],
                engelliDist: []
            }
        };
    }

    const total = firmalar.length;
    const avgCiro = firmalar.reduce((sum, f) => sum + (parseFloat(f.ciro) || 0), 0) / total;
    const avgGeriDonusum = firmalar.reduce((sum, f) => sum + (parseFloat(f.geri_donusum_orani) || 0), 0) / total;
    const avgKadinOran = firmalar.reduce((sum, f) => sum + (parseFloat(f.kadin_calisan_orani) || 0), 0) / total;
    const avgEngelli = firmalar.reduce((sum, f) => sum + (parseFloat(f.engelli_calisan_sayisi) || 0), 0) / total;

    const topByCiro = [...firmalar]
        .sort((a, b) => (parseFloat(b.ciro) || 0) - (parseFloat(a.ciro) || 0))
        .slice(0, 5)
        .map(f => ({
            ad: f.ad,
            ciro: parseFloat(f.ciro) || 0
        }));

    const geriDonusumDist = createDistribution(firmalar, 'geri_donusum_orani', 10);
    const kadinOranDist = createDistribution(firmalar, 'kadin_calisan_orani', 10);
    const engelliDist = createCountDistribution(firmalar, 'engelli_calisan_sayisi');

    return {
        kpis: {
            total,
            avgCiro: Math.round(avgCiro),
            avgGeriDonusum: Math.round(avgGeriDonusum * 10) / 10,
            avgKadinOran: Math.round(avgKadinOran * 10) / 10,
            avgEngelli: Math.round(avgEngelli * 10) / 10
        },
        charts: {
            ciroTopN: topByCiro,
            geriDonusumDist,
            kadinOranDist,
            engelliDist
        }
    };
}

function analyzeGirisimciler(girisimciler) {
    if (!girisimciler || girisimciler.length === 0) {
        return {
            kpis: {
                total: 0,
                avgKadinOran: 0,
                avgEngelli: 0
            },
            charts: {
                kurulusYiliDist: [],
                kadinOranDist: [],
                engelliDist: []
            }
        };
    }

    const total = girisimciler.length;
    const avgKadinOran = girisimciler.reduce((sum, g) => sum + (parseFloat(g.kadin_calisan_orani) || 0), 0) / total;
    const avgEngelli = girisimciler.reduce((sum, g) => sum + (parseFloat(g.engelli_calisan_sayisi) || 0), 0) / total;

    const kurulusYiliDist = createYearDistribution(girisimciler, 'kurulus_yili');
    const kadinOranDist = createDistribution(girisimciler, 'kadin_calisan_orani', 10);
    const engelliDist = createCountDistribution(girisimciler, 'engelli_calisan_sayisi');

    return {
        kpis: {
            total,
            avgKadinOran: Math.round(avgKadinOran * 10) / 10,
            avgEngelli: Math.round(avgEngelli * 10) / 10
        },
        charts: {
            kurulusYiliDist,
            kadinOranDist,
            engelliDist
        }
    };
}

function createDistribution(data, field, buckets) {
    const values = data.map(d => parseFloat(d[field]) || 0).filter(v => v > 0);
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / buckets;

    const dist = [];
    for (let i = 0; i < buckets; i++) {
        const rangeStart = min + (step * i);
        const rangeEnd = min + (step * (i + 1));
        const count = values.filter(v => v >= rangeStart && (i === buckets - 1 ? v <= rangeEnd : v < rangeEnd)).length;

        dist.push({
            range: `${Math.round(rangeStart)}-${Math.round(rangeEnd)}`,
            count
        });
    }

    return dist;
}

function createCountDistribution(data, field) {
    const counts = {};
    data.forEach(d => {
        const val = parseFloat(d[field]) || 0;
        counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
        .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
        .map(([value, count]) => ({ value: parseFloat(value), count }));
}

function createYearDistribution(data, field) {
    const years = {};
    data.forEach(d => {
        const year = parseInt(d[field]);
        if (!isNaN(year)) {
            years[year] = (years[year] || 0) + 1;
        }
    });

    return Object.entries(years)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([year, count]) => ({ year: parseInt(year), count }));
}

module.exports = {
    getDashboardData
};
