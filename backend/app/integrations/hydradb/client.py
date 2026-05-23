import inspect
import os
from typing import Any

from app.core.config import settings


class HydraDBConnectionError(RuntimeError):
    """Raised when the HydraDB SDK is unavailable or the remote connection fails."""


class HydraDBClient:
    def __init__(self) -> None:
        self.project_id = settings.hydradb_project_id
        self.api_key = settings.hydradb_api_key or os.getenv("HYDRA_DB_API_KEY")
        self._client: Any | None = None

    @property
    def connected(self) -> bool:
        return self._client is not None

    async def connect(self) -> None:
        if not self.api_key:
            raise HydraDBConnectionError("HYDRADB_API_KEY is not configured")

        try:
            from hydra_db import AsyncHydraDB
        except ImportError as exc:
            raise HydraDBConnectionError("hydradb-sdk is not installed") from exc

        client = AsyncHydraDB(token=self.api_key)
        try:
            await self._call(client.tenant, ("monitor",), tenant_id=self.project_id)
        except Exception as exc:
            raise HydraDBConnectionError(f"HydraDB project unavailable: {exc}") from exc

        self._client = client

    async def close(self) -> None:
        if self._client is None:
            return
        close = getattr(self._client, "close", None) or getattr(self._client, "aclose", None)
        if close is not None:
            result = close()
            if inspect.isawaitable(result):
                await result
        self._client = None

    async def add_memory(
        self,
        *,
        text: str,
        kind: str,
        key: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        if self._client is None:
            raise HydraDBConnectionError("HydraDB client is not connected")

        await self._call(
            self._client.upload,
            ("add_memory", "addMemory"),
            tenant_id=self.project_id,
            memories=[
                {
                    "text": text,
                    "infer": False,
                    "user_name": "cortex",
                    "metadata": {"kind": kind, "key": key},
                    "additional_metadata": metadata or {},
                }
            ],
        )

    async def _call(self, target: Any, names: tuple[str, ...], **kwargs: Any) -> Any:
        method = None
        for name in names:
            method = getattr(target, name, None)
            if method is not None:
                break
        if method is None:
            raise HydraDBConnectionError(f"HydraDB SDK method missing: {'/'.join(names)}")

        try:
            result = method(**kwargs)
        except TypeError:
            result = method(kwargs)
        if inspect.isawaitable(result):
            return await result
        return result
