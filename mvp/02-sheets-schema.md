# 1차 MVP Google Sheets 설계

## 시트 구성

1차 MVP는 하나의 Google Spreadsheet 안에 6개 시트를 둔다.

| 시트명 | 목적 |
| --- | --- |
| `COURSE_INDEX` | 교육 상품/과정 단위 관리 |
| `CR_INPUT` | 원본 CR 데이터 입력 |
| `AOP_DRAFT` | AI가 생성한 과정 개요/차시별 초안 |
| `TIME_REASON_DRAFT` | 학습소요시간 산정사유 초안 |
| `PRACTICE_PROJECT_REVIEW` | 실습/프로젝트 후보 검토 |
| `RUN_LOG` | 자동화 실행 로그 |

## 1. `COURSE_INDEX`

교육 상품과 과정 단위의 처리 상태를 관리하는 시트다. 좌측 대시보드의 상태, 입력 행 수, 차시 수 등은 이 시트의 선택된 `course_id` 기준으로 보여준다.

| 컬럼 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- |
| `product_id` | Y | 교육 상품 식별자 | `PRODUCT-2026-001` |
| `product_name` | Y | 교육 상품명 | `Cursor AI 마스터 패키지` |
| `course_id` | Y | 과정 식별자 | `KDC-2026-001` |
| `course_name` | Y | 과정명 | `Cursor AI 마스터` |
| `business_unit` | N | 요청 부문 | `B2C` |
| `owner` | N | 담당 BO/PM | `BO 이름` |
| `target_learning_minutes` | Y | 차시별 목표 학습소요시간 | `60` |
| `cr_row_count` | N | 입력 CR 행 수 | `21` |
| `session_count` | N | 차시 수 | `3` |
| `draft_status` | Y | 과정 단위 처리 상태 | `REVIEW_PENDING` |
| `last_run_id` | N | 마지막 실행 ID | `RUN-2026-001` |
| `updated_at` | N | 마지막 갱신 시각 | `2026-06-05 14:30` |

## 2. `CR_INPUT`

CR 원본 또는 정제 데이터를 입력하는 시트다.

| 컬럼 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- |
| `product_id` | Y | 교육 상품 식별자 | `PRODUCT-2026-001` |
| `course_id` | Y | 과정 식별자 | `KDC-2026-001` |
| `course_name` | Y | 과정명 | `AI 엔지니어 입문...` |
| `session_no` | Y | 차시 번호 | `1` |
| `part_id` | N | 파트 ID | `873995` |
| `part_name` | Y | 파트명 | `Part 1. 입문` |
| `chapter_id` | N | 챕터 ID | `873996` |
| `chapter_name` | Y | 챕터명 | `Ch 1. Cursor AI를 시작하기 위한 준비` |
| `clip_id` | N | 클립 ID | `6550166` |
| `clip_name` | Y | 클립명 | `오리엔테이션` |
| `clip_duration` | Y | 클립 러닝타임 | `0:02:57` |
| `lecture_type` | Y | 필수/추가 강의 | `필수강의` |
| `bo_memo` | N | BO 메모 | `프로젝트 강조 필요` |
| `status` | Y | 처리 상태 | `PENDING` |

## 3. `AOP_DRAFT`

AI가 생성한 과정 개요와 차시별 학습내용 초안을 저장한다.

| 컬럼 | 설명 |
| --- | --- |
| `product_id` | 교육 상품 식별자 |
| `course_id` | 과정 식별자 |
| `course_name` | 과정명 |
| `session_no` | 차시 번호 |
| `session_title_draft` | 차시명 초안 |
| `learning_summary_draft` | 차시별 학습내용 초안 |
| `learning_objective_draft` | 학습목표 초안 |
| `course_overview_draft` | 과정 개요 초안 |
| `source_rows` | 참조한 CR 행 번호 |
| `ai_confidence` | AI 자체 신뢰도 |
| `review_comment` | BO 검토 의견 |
| `status` | `REVIEW_PENDING`, `APPROVED` 등 |
| `updated_at` | 마지막 수정 시각 |

## 4. `TIME_REASON_DRAFT`

학습소요시간 산정사유를 차시별로 관리한다.

| 컬럼 | 설명 |
| --- | --- |
| `product_id` | 교육 상품 식별자 |
| `course_id` | 과정 식별자 |
| `session_no` | 차시 번호 |
| `total_clip_duration` | 해당 차시 총 영상 재생시간 |
| `target_learning_minutes` | 목표 학습소요시간 |
| `training_hours` | HRD-Net 입력용 훈련시간 |
| `time_reason_draft` | AI 산정사유 초안 |
| `reason_basis` | 산정 근거 요약 |
| `needs_review` | 검토 필요 여부 |
| `review_comment` | BO 검토 의견 |
| `status` | 상태값 |

## 5. `PRACTICE_PROJECT_REVIEW`

실습/프로젝트 후보를 별도로 검토한다.

| 컬럼 | 설명 |
| --- | --- |
| `product_id` | 교육 상품 식별자 |
| `course_id` | 과정 식별자 |
| `session_no` | 차시 번호 |
| `detected_type` | `PRACTICE`, `PROJECT`, `UNKNOWN` |
| `detected_keyword` | 탐지 키워드 |
| `source_clip_names` | 근거 클립명 |
| `practice_project_summary_draft` | 실습/프로젝트 개요 초안 |
| `expected_output_draft` | 예상 산출물 초안 |
| `bo_decision` | `USE`, `EDIT`, `IGNORE` |
| `review_comment` | BO 검토 의견 |
| `status` | 상태값 |

## 6. `RUN_LOG`

n8n 실행 결과와 에러를 기록한다.

| 컬럼 | 설명 |
| --- | --- |
| `run_id` | 실행 ID |
| `trigger_type` | 수동/자동 트리거 |
| `product_id` | 교육 상품 식별자 |
| `course_id` | 과정 식별자 |
| `started_at` | 시작 시각 |
| `ended_at` | 종료 시각 |
| `input_rows` | 처리한 행 수 |
| `output_rows` | 생성한 행 수 |
| `status` | `SUCCESS`, `FAILED` |
| `error_message` | 에러 메시지 |

## 상태값 운영 규칙

- `CR_INPUT.status = PENDING`이면 AI 초안 생성 대상이다.
- 모든 초안/로그는 `product_id + course_id` 조합으로 구분한다.
- AI 생성 중에는 관련 행을 `GENERATING`으로 변경한다.
- 생성 완료 후 초안 시트의 상태값은 `REVIEW_PENDING`으로 둔다.
- BO가 수정 후 승인하면 `APPROVED`로 변경한다.
- 재생성이 필요하면 `REGENERATE_REQUESTED`로 변경한다.
- n8n은 `APPROVED` 행을 덮어쓰지 않는다.

## BO 검토 UX 원칙

- BO가 원본 CR과 AI 초안을 나란히 볼 수 있어야 한다.
- AI가 어떤 CR 행을 근거로 작성했는지 `source_rows`로 남긴다.
- 승인된 행은 자동 덮어쓰기를 방지한다.
- 재생성 요청 시 BO 코멘트를 프롬프트에 포함한다.
