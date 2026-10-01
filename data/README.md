# Reference data for the live worker

Drop these files here (or point the matching env var at a URL). Both are optional; the worker skips a source whose file is missing.

| File | Env var | Format | Used by |
| --- | --- | --- | --- |
| `ftl-lakes.geojson` | `FTL_GEOJSON_URL` | GeoJSON FeatureCollection of lake FTL boundaries (Polygon or MultiPolygon, `name` property) | HYDRAA / Irrigation buffer check |
| `igr-guideline-rates.csv` | `IGR_RATES_CSV_URL` | `market,rate_per_sqft,source` with market names matching the `micro_markets` table | IGR benchmark rates |

Copy `igr-guideline-rates.example.csv` to `igr-guideline-rates.csv` and fill in the published sub-registrar values. Rows with a rate of 0 are ignored.
