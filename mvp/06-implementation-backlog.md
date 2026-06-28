# 1차 MVP 구현 백로그

## 목표

CR 데이터를 입력하면 LLM이 운영계획서용 초안을 생성하고, BO가 Google Sheets에서 검토/수정/승인할 수 있는 최소 자동화 흐름을 만든다.

## Milestone 1. 데이터 구조 확정

### M1-1. CR 입력 컬럼 확정

- `CR_INPUT` 시트 필수 컬럼 확정
- 기존 CR 파일에서 필수 컬럼 매핑 가능 여부 확인
- 누락/공백 데이터 처리 규칙 정의

완료 기준:

- 샘플 CR 1개를 `CR_INPUT` 구조로 변환할 수 있다.

### M1-2. 출력 시트 컬럼 확정

- `AOP_DRAFT`
- `TIME_REASON_DRAFT`
- `PRACTICE_PROJECT_REVIEW`
- `RUN_LOG`

완료 기준:

- AI 출력 JSON을 각 시트 행으로 매핑할 수 있다.

## Milestone 2. 프롬프트 수동 검증

### M2-1. 샘플 입력으로 후보 LLM 테스트

- 동일한 `sample-cr-input.json`을 후보 LLM에 입력
- JSON 형식 유지 여부 확인
- 샘플 기대 출력과 비교

완료 기준:

- 최소 1개 모델에서 파싱 가능한 JSON 출력이 나온다.

### M2-2. BO 샘플 검토

- BO에게 샘플 출력 일부를 보여주고 피드백 수집
- 필드별 유용성 평가
- 문체 수정 포인트 정리

완료 기준:

- BO가 유지/수정/제외할 필드를 구분한다.

## Milestone 3. n8n 1차 플로우

### M3-1. Trigger 구성

- Google Sheets 변경 또는 수동 실행으로 시작
- `PENDING` 행만 처리
- 처리 중 `GENERATING`으로 상태 변경

완료 기준:

- 특정 course_id 단위로 입력 데이터를 가져올 수 있다.

### M3-2. LLM 호출

- CR 데이터를 JSON으로 묶어 LLM API 호출
- 시스템 프롬프트와 사용자 프롬프트 적용
- JSON 응답 파싱

완료 기준:

- LLM 응답을 파싱하고 오류 시 `ERROR` 상태를 남긴다.

### M3-3. Sheets 출력

- 과정 개요/차시별 초안을 `AOP_DRAFT`에 저장
- 산정사유를 `TIME_REASON_DRAFT`에 저장
- 실습/프로젝트 후보를 `PRACTICE_PROJECT_REVIEW`에 저장

완료 기준:

- 샘플 CR 기준 3개 출력 시트에 데이터가 생성된다.

## Milestone 4. BO 검토 흐름

### M4-1. 상태값 운영

- `REVIEW_PENDING`
- `APPROVED`
- `REGENERATE_REQUESTED`
- `ERROR`

완료 기준:

- `APPROVED` 행은 자동 덮어쓰지 않는다.

### M4-2. 재생성 요청

- BO가 `REGENERATE_REQUESTED`로 변경하고 코멘트를 입력
- n8n이 기존 초안과 BO 코멘트를 포함해 재생성

완료 기준:

- BO 코멘트가 반영된 새 초안이 생성된다.

## Milestone 5. 알림

### M5-1. 생성 완료 알림

- 초안 생성 완료 시 Slack 또는 이메일 알림
- course_id, 과정명, 검토 링크 포함

완료 기준:

- BO가 초안 생성 완료를 알림으로 확인할 수 있다.

### M5-2. 오류 알림

- API 실패, JSON 파싱 실패, 필수 필드 누락 시 알림

완료 기준:

- 실패 원인이 `RUN_LOG`와 알림에 남는다.

## 1차 MVP 완료 기준

- 샘플 CR 1개 이상 처리 가능
- AI 초안이 Sheets에 자동 저장됨
- BO가 검토/수정/승인 가능
- 승인 데이터가 자동으로 덮어쓰기되지 않음
- 실행 로그와 오류 로그가 남음

## 후속 백로그

- Google Docs 템플릿 자동 삽입
- PDF 변환
- 제출 전 체크리스트 검토
- 전체 CR 자동 정제
- 교강사 DB 후보 추천
- BO 피드백 기반 프롬프트 버전 관리
