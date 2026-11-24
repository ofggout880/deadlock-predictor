<div align="center">

<img src="frontend/public/favicon.svg" width="88" height="88" alt="Deadlock Churn & Matchmaking Predictor" />

# Deadlock Churn & Tilt Prediction

### Churn-Aware Matchmaking Optimization & Source 2 Telemetry

*Predicting 14-day player abandonment and acute tilt across 8,625 rolling windows (1,094 players) using leak-free Source 2 telemetry, regularized Gradient Boosting, and ethical 50/50 matchmaking policy design.*

<p>
  <a href="https://www.linkedin.com/in/matthieu-gout">
    <img src="https://img.shields.io/badge/LINKEDIN-MATTHIEU%20GOUT-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn - Matthieu Gout" />
  </a>
  <a href="mailto:matthieugout45@gmail.com">
    <img src="https://img.shields.io/badge/EMAIL-MATTHIEUGOUT45%40GMAIL.COM-10B981?style=for-the-badge&logo=gmail&logoColor=white" alt="Email - matthieugout45@gmail.com" />
  </a>
  <a href="https://github.com/ofggout880">
    <img src="https://img.shields.io/badge/GITHUB-OFGGOUT880-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub - ofggout880" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/FRONTEND-REACT%2019%20%2B%20VITE-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="Frontend React 19 + Vite" />
  <img src="https://img.shields.io/badge/BACKEND-FASTAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="Backend FastAPI" />
  <img src="https://img.shields.io/badge/MODEL-GRADIENT%20BOOSTING%20(36%2F106f)-69E799?style=for-the-badge&logo=scikitlearn&logoColor=111827" alt="Gradient Boosting 36/106 features" />
</p>

<p>
  <img src="https://img.shields.io/badge/Language-English%20%2F%20Fran%C3%A7ais%20Toggle-10B981?style=flat-square" alt="Bilingual EN/FR" />
  <img src="https://img.shields.io/badge/Leakage-0%25%20Calendar%20Leakage-10B981?style=flat-square" alt="0% Calendar Leakage" />
  <img src="https://img.shields.io/badge/Fairness-50%2F50%20Anti--EOMM-0284C7?style=flat-square" alt="50/50 Anti-EOMM Fairness" />
</p>

<p>
  <img src="https://img.shields.io/badge/Recall%20on%20Churn-73.2%25%20(%CE%B8*%20%3D%200.225)-E11D48?style=flat-square" alt="Recall on Churn 73.2%" />
  <img src="https://img.shields.io/badge/ROC--AUC-74.7%25-10B981?style=flat-square" alt="ROC-AUC 74.7%" />
  <img src="https://img.shields.io/badge/PR--AUC-50.8%25-D97706?style=flat-square" alt="PR-AUC 50.8%" />
</p>

</div>

---

## Project Highlights

- **Source 2 Cohort (`0% Calendar Leakage`):** `8,625` rolling 20-match windows across `1,094` unique players (`9,811` Source-2-enriched pivot matches), evaluated with player-grouped splits (`StratifiedGroupKFold`, zero shared accounts between Train and Test).
- **Champion Model:** Regularized Gradient Boosting (`74.7%` ROC-AUC, `50.8%` PR-AUC, `36` optimal in-game signals out of `106` candidates).
- **Matchmaking Threshold (`θ* = 0.225`):** Intercepts `73.2%` of 14-day churners in advance with non-punitive queue interventions (unstacking tilted solo players, pairing with calm allies at equal MMR — zero match rigging).
- **Key Source 2 Signals:** Inventory Rage-Sell (`14.1%` importance), Marathon Session Fatigue (`13.6%`), Solo Isolation Streak (`+54.3%` gap), and Stun Headshots Taken (`+19.1%` gap).

---

## Application Structure (3 Focused Tabs)

1. **Main Study (`Matchmaking & Churn`)**: 5-act narrative covering Hero & 5 KPIs, 4 calibrated archetypes + live 4-slider queue simulator, Top 3 in-game signals, 3-tab ML proof, and a collapsible technical pipeline appendix.
2. **Hero Dynamics & Churn**: Complementary deep-dive into hero-specific churn rates (`Yamato 60%`, `Vindicta 45%`, `Seven 42%`, `Lash 36%`), 3D hitbox exposure (`+78.6%` stun headshots), tactical death heatmap, and Parry biomechanics.
3. **Item & Build Telemetry**: Complementary focus on shop mistakes and items driving death spirals and ragequits (`0% Vitality` over 30m, `Spirit Strike`, `Hollow Point` vs retention anchors).

---

## Repository Layout

```text
deadlock-predictor/
├── frontend/          # React 19 + Vite 8 analytical showcase & SVG visualizations
├── backend/           # Deadlock API ingestion, ML training suite & FastAPI microservice
├── docs/              # Design system charter, Deadlock API assessment & project summary
├── frontend/tests/    # Automated DA, responsive overflow (320px–2560px) & CDP interaction tests
└── tests_e2e/         # End-to-end backend/API contract verification
```

---

## Quickstart

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# -> http://localhost:5173
```

### Backend (FastAPI + ML)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# -> http://127.0.0.1:8000/docs
```

---

## Visual Project Summary

![Optimizing Matchmaking via Churn & Tilt Prediction](docs/project_overview_en.png)

---

*Telemetry collected via the public [Deadlock API](https://api.deadlock-api.com). Deadlock and Source 2 are trademarks of Valve Corporation.*
