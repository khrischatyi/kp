# Kitchen Portfolio — Backend

FastAPI service that exposes gallery metadata and a contact endpoint.

## Local development

```bash
uv pip install -e .[dev]
uvicorn app.main:app --reload
```

Endpoints live at `/api/v1/*`. See OpenAPI at `/api/docs`.
