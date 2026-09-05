import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
import uuid


class FakeSupabaseQuery:
    def __init__(self, table_data_store: dict, table_name: str, client: "FakeSupabaseClient"):
        self._store = table_data_store
        self._table_name = table_name
        self._client = client
        self._filters = []
        self._delete_mode = False
        self._upsert_payload = None
        self._insert_payload = None
        self._update_payload = None
        self._order_field = None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, field, value):
        self._filters.append(("eq", field, value))
        return self

    def in_(self, field, values):
        self._filters.append(("in", field, values))
        return self

    def order(self, field, **_kwargs):
        self._order_field = field
        return self

    def upsert(self, payload, on_conflict=None):
        self._upsert_payload = payload
        return self

    def insert(self, payload):
        self._insert_payload = payload
        return self

    def update(self, payload):
        self._update_payload = payload
        return self

    def delete(self):
        self._delete_mode = True
        return self

    def _matches(self, row):
        for kind, field, value in self._filters:
            if kind == "eq" and row.get(field) != value:
                return False
            if kind == "in" and row.get(field) not in value:
                return False
        return True

    def execute(self):
        rows = self._store.setdefault(self._table_name, [])

        if self._insert_payload is not None:
            new_row = dict(self._insert_payload)
            new_row.setdefault("id", str(uuid.uuid4()))
            new_row.setdefault("is_edited", False)
            new_row.setdefault("is_deleted", False)
            new_row.setdefault("status", "pending")
            new_row.setdefault("answer", None)
            new_row.setdefault("answered_at", None)
            new_row.setdefault("dismissed_at", None)
            new_row.setdefault("ended_at", None)
            # monotonically increasing timestamp — প্রতিটা insert আগেরটার চেয়ে ১ সেকেন্ড পরে
            ts = self._client._next_timestamp()
            new_row.setdefault("created_at", ts)
            new_row.setdefault("updated_at", ts)
            new_row.setdefault("started_at", ts)
            rows.append(new_row)
            return MagicMock(data=[new_row])

        if self._upsert_payload is not None:
            key = (self._upsert_payload["room_id"], self._upsert_payload["record_id"])
            for i, row in enumerate(rows):
                if (row["room_id"], row["record_id"]) == key:
                    rows[i] = self._upsert_payload
                    break
            else:
                rows.append(self._upsert_payload)
            return MagicMock(data=[self._upsert_payload])

        if self._update_payload is not None:
            updated = []
            for row in rows:
                if self._matches(row):
                    row.update(self._update_payload)
                    updated.append(row)
            return MagicMock(data=updated)

        if self._delete_mode:
            remaining = [r for r in rows if not self._matches(r)]
            removed = [r for r in rows if self._matches(r)]
            rows[:] = remaining
            return MagicMock(data=removed)

        result = [r for r in rows if self._matches(r)]
        if self._order_field:
            result = sorted(result, key=lambda r: r.get(self._order_field, ""))
        return MagicMock(data=result)


class FakeSupabaseClient:
    def __init__(self):
        self._data_store = {}
        self._insert_counter = 0
        self._base_time = datetime(2024, 1, 1, 0, 0, 0)

    def _next_timestamp(self) -> str:
        self._insert_counter += 1
        ts = self._base_time + timedelta(seconds=self._insert_counter)
        return ts.isoformat() + "Z"

    def table(self, name):
        return FakeSupabaseQuery(self._data_store, name, self)

    def rpc(self, function_name, params):
        if function_name == "get_question_queue_position":
            question_id = params["p_question_id"]
            rows = self._data_store.get("anonymous_questions", [])
            target = next((r for r in rows if r["id"] == question_id), None)
            if target is None:
                return MagicMock(data=None)

            count = sum(
                1
                for r in rows
                if r["room_id"] == target["room_id"]
                and r["status"] == "pending"
                and r["created_at"] < target["created_at"]
            )
            return MagicMock(data=count + 1)

        return MagicMock(data=None)


@pytest.fixture
def fake_supabase():
    return FakeSupabaseClient()