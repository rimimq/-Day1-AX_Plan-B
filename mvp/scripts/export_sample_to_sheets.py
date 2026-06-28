#!/usr/bin/env python3
"""Export MVP sample JSON files into CSV files shaped like the Google Sheets MVP."""

from __future__ import annotations

import csv
import json
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SAMPLES = ROOT / "samples"
GENERATED = ROOT / "generated"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in fieldnames})


def join_list(value) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " | ".join(str(item) for item in value)
    return str(value)


def main() -> None:
    cr_input = load_json(SAMPLES / "sample-cr-input.json")
    ai_output = load_json(SAMPLES / "sample-ai-output.json")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    product_id = cr_input.get("product_id", "PRODUCT-SAMPLE")
    product_name = cr_input.get("product_name", "Cursor AI 마스터 패키지")
    course_id = cr_input["course_id"]
    course_name = cr_input["course_name"]
    target_minutes = cr_input["target_learning_minutes"]
    bo_memo = cr_input.get("bo_memo", "")

    cr_rows = []
    for row in cr_input["cr_rows"]:
        cr_rows.append(
            {
                "product_id": product_id,
                "course_id": course_id,
                "course_name": course_name,
                "session_no": row.get("session_no", ""),
                "part_id": row.get("part_id", ""),
                "part_name": row.get("part_name", ""),
                "chapter_id": row.get("chapter_id", ""),
                "chapter_name": row.get("chapter_name", ""),
                "clip_id": row.get("clip_id", ""),
                "clip_name": row.get("clip_name", ""),
                "clip_duration": row.get("clip_duration", ""),
                "lecture_type": row.get("lecture_type", ""),
                "bo_memo": bo_memo if row.get("row_no") == 1 else "",
                "status": "PENDING",
            }
        )

    overview = ai_output["course_overview"]
    overview_text = "\n".join(
        [
            f"한 줄 요약: {overview.get('one_line_summary', '')}",
            f"과정 목적: {overview.get('course_purpose', '')}",
            f"학습 흐름: {overview.get('learning_flow', '')}",
            f"기대 성과: {overview.get('expected_outcome', '')}",
        ]
    )

    aop_rows = []
    time_rows = []
    practice_rows = []
    session_count = len(ai_output["sessions"])

    for session in ai_output["sessions"]:
        aop_rows.append(
            {
                "product_id": product_id,
                "course_id": course_id,
                "course_name": course_name,
                "session_no": session.get("session_no", ""),
                "session_title_draft": session.get("session_title_draft", ""),
                "learning_summary_draft": session.get("learning_summary_draft", ""),
                "learning_objective_draft": session.get("learning_objective_draft", ""),
                "course_overview_draft": overview_text,
                "source_rows": join_list(session.get("source_rows", [])),
                "ai_confidence": "SAMPLE",
                "review_comment": "",
                "status": "REVIEW_PENDING",
                "updated_at": now,
            }
        )

        time_rows.append(
            {
                "product_id": product_id,
                "course_id": course_id,
                "session_no": session.get("session_no", ""),
                "total_clip_duration": session.get("total_clip_duration", ""),
                "target_learning_minutes": target_minutes,
                "training_hours": round(target_minutes / 60, 2),
                "time_reason_draft": session.get("time_reason_draft", ""),
                "reason_basis": session.get("reason_basis", ""),
                "needs_review": str(session.get("needs_review", False)).upper(),
                "review_comment": "",
                "status": "REVIEW_PENDING",
            }
        )

        for candidate in session.get("practice_project_candidates", []):
            practice_rows.append(
                {
                    "product_id": product_id,
                    "course_id": course_id,
                    "session_no": session.get("session_no", ""),
                    "detected_type": candidate.get("detected_type", ""),
                    "detected_keyword": candidate.get("detected_keyword", ""),
                    "source_clip_names": join_list(candidate.get("source_clip_names", [])),
                    "practice_project_summary_draft": candidate.get("summary_draft", ""),
                    "expected_output_draft": candidate.get("expected_output_draft", ""),
                    "bo_decision": "",
                    "review_comment": "",
                    "status": "REVIEW_PENDING",
                }
            )

    run_log_rows = [
        {
            "run_id": "SAMPLE-RUN-001",
            "trigger_type": "SAMPLE_EXPORT",
            "product_id": product_id,
            "course_id": course_id,
            "started_at": now,
            "ended_at": now,
            "input_rows": len(cr_rows),
            "output_rows": len(aop_rows) + len(time_rows) + len(practice_rows),
            "status": "SUCCESS",
            "error_message": "",
        }
    ]

    write_csv(
        GENERATED / "COURSE_INDEX.csv",
        [
            "product_id",
            "product_name",
            "course_id",
            "course_name",
            "business_unit",
            "owner",
            "target_learning_minutes",
            "cr_row_count",
            "session_count",
            "draft_status",
            "last_run_id",
            "updated_at",
        ],
        [
            {
                "product_id": product_id,
                "product_name": product_name,
                "course_id": course_id,
                "course_name": course_name,
                "business_unit": "B2C",
                "owner": "",
                "target_learning_minutes": target_minutes,
                "cr_row_count": len(cr_rows),
                "session_count": session_count,
                "draft_status": "REVIEW_PENDING",
                "last_run_id": "SAMPLE-RUN-001",
                "updated_at": now,
            }
        ],
    )

    write_csv(
        GENERATED / "CR_INPUT.csv",
        [
            "product_id",
            "course_id",
            "course_name",
            "session_no",
            "part_id",
            "part_name",
            "chapter_id",
            "chapter_name",
            "clip_id",
            "clip_name",
            "clip_duration",
            "lecture_type",
            "bo_memo",
            "status",
        ],
        cr_rows,
    )
    write_csv(
        GENERATED / "AOP_DRAFT.csv",
        [
            "product_id",
            "course_id",
            "course_name",
            "session_no",
            "session_title_draft",
            "learning_summary_draft",
            "learning_objective_draft",
            "course_overview_draft",
            "source_rows",
            "ai_confidence",
            "review_comment",
            "status",
            "updated_at",
        ],
        aop_rows,
    )
    write_csv(
        GENERATED / "TIME_REASON_DRAFT.csv",
        [
            "product_id",
            "course_id",
            "session_no",
            "total_clip_duration",
            "target_learning_minutes",
            "training_hours",
            "time_reason_draft",
            "reason_basis",
            "needs_review",
            "review_comment",
            "status",
        ],
        time_rows,
    )
    write_csv(
        GENERATED / "PRACTICE_PROJECT_REVIEW.csv",
        [
            "product_id",
            "course_id",
            "session_no",
            "detected_type",
            "detected_keyword",
            "source_clip_names",
            "practice_project_summary_draft",
            "expected_output_draft",
            "bo_decision",
            "review_comment",
            "status",
        ],
        practice_rows,
    )
    write_csv(
        GENERATED / "RUN_LOG.csv",
        [
            "run_id",
            "trigger_type",
            "product_id",
            "course_id",
            "started_at",
            "ended_at",
            "input_rows",
            "output_rows",
            "status",
            "error_message",
        ],
        run_log_rows,
    )

    print(f"Exported sample sheet CSVs to {GENERATED}")


if __name__ == "__main__":
    main()
