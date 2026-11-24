"""
Combined API Router Aggregator.
Mounts domain sub-routers (health, player, prediction).
File: app/api/api_router.py
"""

from fastapi import APIRouter

from app.api.routers import health, items, player, prediction

api_router = APIRouter()

# Mount health & assets endpoints: /status, /health, /heroes, /ml/metrics, /ml/visualizations, /ml/hidden-gems
api_router.include_router(health.router)

# Mount player endpoints: /players/search, /players/{account_id}/matches, /players/{account_id}
api_router.include_router(player.router)

# Mount prediction endpoints: /predict/{account_id}, /predict/archetypes
api_router.include_router(prediction.router)

# Mount items endpoints: /items/catalog, /items/stats
api_router.include_router(items.router)
