WITH region_stats AS (
    SELECT 
        region,
        ROUND(AVG(temperature)) AS average,
        MAX(temperature) AS highest
    FROM 
        prefecture_temperatures
    GROUP BY 
        region
),
highest_temp_prefectures AS (
    SELECT 
        pt.region,
        pt.prefecture
    FROM 
        prefecture_temperatures pt
    INNER JOIN (
        SELECT 
            region,
            MAX(temperature) AS max_temp
        FROM 
            prefecture_temperatures
        GROUP BY 
            region
    ) max_temps
    ON pt.region = max_temps.region AND pt.temperature = max_temps.max_temp
)
SELECT 
    rs.region,
    rs.average,
    rs.highest,
    htp.prefecture AS highest_prefecture
FROM 
    region_stats rs
INNER JOIN 
    highest_temp_prefectures htp
ON 
    rs.region = htp.region
ORDER BY 
    rs.average DESC;
