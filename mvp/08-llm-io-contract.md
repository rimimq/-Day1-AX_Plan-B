# LLM 입출력 계약서

## 목적

1차 MVP에서 n8n과 LLM 사이에 오가는 데이터 형식을 고정한다. 모델은 Claude, OpenAI 등으로 바뀔 수 있지만 입출력 계약은 유지한다.

## 입력 계약

### 최상위 구조

```json
{
  "product_id": "string",
  "product_name": "string",
  "course_id": "string",
  "course_name": "string",
  "target_learning_minutes": 60,
  "bo_memo": "string",
  "cr_rows": []
}
```

### 필수 필드

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `product_id` | string | 교육 상품 식별자 |
| `course_id` | string | 과정 식별자 |
| `course_name` | string | 과정명 |
| `target_learning_minutes` | number | 차시별 목표 학습소요시간 |
| `cr_rows` | array | CR 행 목록 |

### `cr_rows` 필드

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `row_no` | number | Y | 원본 CR 행 번호 |
| `session_no` | number | Y | 차시 번호 |
| `part_id` | string | N | 파트 ID |
| `part_name` | string | Y | 파트명 |
| `chapter_id` | string | N | 챕터 ID |
| `chapter_name` | string | Y | 챕터명 |
| `clip_id` | string | N | 클립 ID |
| `clip_name` | string | Y | 클립명 |
| `clip_duration` | string | Y | `H:MM:SS` 또는 `M:SS` |
| `lecture_type` | string | N | 필수강의/추가강의 |

## 출력 계약

LLM은 반드시 JSON만 반환한다. 마크다운 코드블록, 설명 문장, 주석을 포함하지 않는다.

### 최상위 구조

```json
{
  "course_overview": {},
  "sessions": [],
  "quality_checks": {}
}
```

### `course_overview`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `one_line_summary` | string | 과정 한 줄 요약 |
| `course_purpose` | string | 과정 목적 |
| `learning_flow` | string | 전체 학습 흐름 |
| `expected_outcome` | string | 기대 성과 |
| `review_notes` | array | BO 검토 참고사항 |

### `sessions`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `session_no` | string | 차시 번호 |
| `session_title_draft` | string | 차시명 초안 |
| `source_rows` | array | 근거 CR 행 번호 |
| `total_clip_duration` | string | 해당 차시 총 영상 재생시간 |
| `learning_summary_draft` | string | 학습내용 초안 |
| `learning_objective_draft` | string | 학습목표 초안 |
| `time_reason_draft` | string | 학습소요시간 산정사유 초안 |
| `reason_basis` | string | 산정 근거 |
| `practice_project_candidates` | array | 실습/프로젝트 후보 |
| `needs_review` | boolean | BO 검토 필요 여부 |
| `review_notes` | array | 검토 참고사항 |

### `practice_project_candidates`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `detected_type` | string | `PRACTICE`, `PROJECT`, `UNKNOWN` |
| `detected_keyword` | string | 탐지 키워드 |
| `source_clip_names` | array | 근거 클립명 |
| `summary_draft` | string | 후보 개요 초안 |
| `expected_output_draft` | string | 예상 산출물 초안 |
| `needs_review` | boolean | BO 검토 필요 여부 |

### `quality_checks`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `missing_required_fields` | array | 입력 누락 필드 |
| `possible_over_generation` | array | 과도한 추정 가능성 |
| `time_reason_warnings` | array | 산정사유 검토 필요 항목 |
| `practice_project_warnings` | array | 실습/프로젝트 검토 필요 항목 |

## n8n 파싱 규칙

- JSON 파싱 실패 시 `RUN_LOG.status = FAILED`
- `sessions`가 비어 있으면 `ERROR`
- `session_no`가 없는 세션은 저장하지 않고 오류 로그에 남긴다.
- `source_rows`가 없는 경우 `needs_review = TRUE`로 저장한다.
- `APPROVED` 상태의 기존 행은 덮어쓰지 않는다.

## 검증 규칙

### 입력 검증

- `product_id` 없음: 경고. 단일 과정 테스트에서는 허용 가능하나 운영 환경에서는 필수
- `course_id` 없음: 실패
- `course_name` 없음: 실패
- `cr_rows` 없음 또는 빈 배열: 실패
- `session_no`, `clip_name`, `clip_duration` 중 하나라도 없는 행: 해당 행 검토 필요 표시

### 출력 검증

- JSON 파싱 가능 여부
- `course_overview` 존재 여부
- `sessions` 배열 존재 여부
- 각 세션의 `session_no`, `learning_summary_draft`, `time_reason_draft` 존재 여부
- `quality_checks` 존재 여부

## 실패 처리

| 실패 유형 | 처리 |
| --- | --- |
| 필수 입력 누락 | LLM 호출하지 않고 `ERROR` |
| LLM API 실패 | 재시도 1회 후 `ERROR` |
| JSON 파싱 실패 | 원문 응답 저장 후 `ERROR` |
| 출력 필드 누락 | 저장 가능한 필드만 저장하고 `needs_review = TRUE` |
| 승인 행 충돌 | 기존 `APPROVED` 행 유지 |
