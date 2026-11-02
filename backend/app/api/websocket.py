import json
import logging
from typing import Any, Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("aurora.websocket")

active_connections: Dict[str, Set[WebSocket]] = {}
message_backlog: Dict[str, List[Any]] = {}


async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    active_connections.setdefault(task_id, set()).add(websocket)

    # Immediately replay buffered updates so frontend never misses early progress
    for msg in message_backlog.get(task_id, []):
        try:
            await websocket.send_text(json.dumps(msg) if not isinstance(msg, str) else msg)
        except Exception:
            pass

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.get(task_id, set()).discard(websocket)
        if task_id in active_connections and not active_connections[task_id]:
            del active_connections[task_id]


async def broadcast_update(task_id: str, data: Any):
    # Buffer into backlog
    message_backlog.setdefault(task_id, []).append(data)

    for ws in list(active_connections.get(task_id, [])):
        try:
            await ws.send_text(json.dumps(data) if not isinstance(data, str) else data)
        except Exception:
            pass


def get_task_broadcaster(task_id: str):
    """Returns an async callback tailored for the LangGraph supervisor."""
    async def _broadcast(msg: Dict[str, Any]):
        await broadcast_update(task_id, msg)
    return _broadcast
