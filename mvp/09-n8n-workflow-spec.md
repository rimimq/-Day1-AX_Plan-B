# n8n 1차 MVP 워크플로우 명세

## 목표

Google Sheets의 CR 입력 데이터를 교육 상품/과정 단위로 읽어 LLM에 전달하고, 생성된 운영계획서 초안을 다시 Sheets에 저장한다. BO는 Sheets에서 초안을 검토하고 상태값을 변경한다.

## 워크플로우 A. 초안 생성

### A1. Trigger

권장 방식:

- 수동 실행 버튼
- 또는 `CR_INPUT.status = PENDING`인 행 감지

초기 MVP에서는 수동 실행을 권장한다. 자동 트리거는 BO가 입력 중인 데이터를 잘못 처리할 수 있다.

### A2. Read CR_INPUT

처리 조건:

- `status = PENDING`
- 동일한 `product_id + course_id` 기준으로 행 그룹화

필수 확인:

- `product_id`
- `course_id`
- `course_name`
- `session_no`
- `clip_name`
- `clip_duration`

### A3. Validate Input

검증 실패 시:

- `RUN_LOG.status = FAILED`
- `CR_INPUT.status = ERROR`
- 오류 메시지 기록

검증 통과 시:

- 대상 행 `status = GENERATING`

### A4. Build LLM Payload

`CR_INPUT` 행을 아래 구조로 변환한다.

```json
{
  "product_id": "",
  "product_name": "",
  "course_id": "",
  "course_name": "",
  "target_learning_minutes": 60,
  "bo_memo": "",
  "cr_rows": []
}
```

### A5. Call LLM

입력:

- 시스템 프롬프트: `03-ai-prompt-draft.md`
- 사용자 데이터: A4에서 만든 JSON

요구사항:

- JSON 응답 강제
- 실패 시 1회 재시도
- 재시도 후 실패하면 `ERROR`

### A6. Parse Response

파싱 대상:

- `course_overview`
- `sessions`
- `quality_checks`

검증:

- `sessions`가 배열인지 확인
- 각 세션에 `session_no`가 있는지 확인
- `time_reason_draft`가 있는지 확인

### A7. Write AOP_DRAFT

세션별로 1행씩 저장한다.

저장 필드:

- `course_id`
- `product_id`
- `course_name`
- `session_no`
- `session_title_draft`
- `learning_summary_draft`
- `learning_objective_draft`
- `course_overview_draft`
- `source_rows`
- `ai_confidence`
- `status = REVIEW_PENDING`
- `updated_at`

### A8. Write TIME_REASON_DRAFT

세션별로 1행씩 저장한다.

저장 필드:

- `course_id`
- `product_id`
- `session_no`
- `total_clip_duration`
- `target_learning_minutes`
- `training_hours`
- `time_reason_draft`
- `reason_basis`
- `needs_review`
- `status = REVIEW_PENDING`

### A9. Write PRACTICE_PROJECT_REVIEW

실습/프로젝트 후보별로 1행씩 저장한다.

저장 필드:

- `course_id`
- `product_id`
- `session_no`
- `detected_type`
- `detected_keyword`
- `source_clip_names`
- `practice_project_summary_draft`
- `expected_output_draft`
- `status = REVIEW_PENDING`

### A10. Update CR_INPUT

처리 완료된 원본 행:

- `status = REVIEW_PENDING`

### A11. Write RUN_LOG

성공 시:

- `status = SUCCESS`
- 입력 행 수
- 출력 행 수
- 시작/종료 시각

실패 시:

- `status = FAILED`
- 오류 메시지

### A12. Notify BO

알림 채널:

- Slack 또는 이메일

알림 내용:

- 과정명
- 처리 상태
- 검토할 Sheets 링크
- 오류 발생 시 오류 메시지

## 워크플로우 B. 재생성

### B1. Trigger

조건:

- `AOP_DRAFT.status = REGENERATE_REQUESTED`
- 또는 `TIME_REASON_DRAFT.status = REGENERATE_REQUESTED`

### B2. Read Existing Draft

읽을 데이터:

- 기존 AI 초안
- BO `review_comment`
- 원본 CR 행

### B3. Call LLM With Feedback

재생성 프롬프트:

- `03-ai-prompt-draft.md`의 재생성 프롬프트 템플릿 사용

규칙:

- BO 피드백 우선 반영
- 원본 CR과 충돌하는 내용 금지
- 수정된 항목만 변경

### B4. Save New Draft

권장 방식:

- 기존 행을 덮어쓰기 전에 이전 값을 백업 컬럼 또는 별도 로그에 저장
- 재생성 결과 `status = REVIEW_PENDING`

주의:

- `APPROVED` 행은 재생성 대상에서 제외

## 워크플로우 C. 승인 상태 관리

### C1. BO 승인

BO가 상태값을 직접 변경한다.

- `REVIEW_PENDING` → `APPROVED`

### C2. 승인 행 보호

n8n은 `APPROVED` 행을 덮어쓰지 않는다.

### C3. 후속 자동화 후보

2차 MVP에서 `APPROVED` 행만 Google Docs 템플릿 생성 대상으로 사용한다.

## 노드 구성 예시

| 순서 | n8n 노드 | 역할 |
| --- | --- | --- |
| 1 | Manual Trigger 또는 Google Sheets Trigger | 실행 시작 |
| 2 | Google Sheets Read | `CR_INPUT` 읽기 |
| 3 | Code | `product_id + course_id` 기준 그룹화 |
| 4 | IF | 필수 필드 검증 |
| 5 | Google Sheets Update | 상태 `GENERATING` 변경 |
| 6 | Code | LLM payload 생성 |
| 7 | HTTP Request | LLM API 호출 |
| 8 | Code | JSON 파싱 및 검증 |
| 9 | Google Sheets Append | `AOP_DRAFT` 저장 |
| 10 | Google Sheets Append | `TIME_REASON_DRAFT` 저장 |
| 11 | Google Sheets Append | `PRACTICE_PROJECT_REVIEW` 저장 |
| 12 | Google Sheets Append | `RUN_LOG` 저장 |
| 13 | Slack 또는 Gmail | BO 알림 |

## MVP 구현 원칙

- 처음부터 완전 자동화하지 않는다.
- BO가 수동 실행하고 결과를 확인할 수 있게 한다.
- 입력/출력/로그가 모두 Sheets에 남아야 한다.
- 실패를 조용히 넘기지 않는다.
- 승인된 데이터는 자동으로 덮어쓰지 않는다.
