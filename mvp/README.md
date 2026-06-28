# Plan-B MVP

이 폴더는 Plan-B 1차 MVP 기획 및 제작 산출물을 모아둔다.

## 문서

| 파일 | 용도 |
| --- | --- |
| `01-mvp-prd.md` | 1차 MVP PRD |
| `02-sheets-schema.md` | Google Sheets 구조 설계 |
| `03-ai-prompt-draft.md` | LLM 프롬프트 초안 |
| `04-manual-test-plan.md` | 수동 테스트 계획 |
| `05-bo-review-pack.md` | BO 검토 패키지 |
| `06-implementation-backlog.md` | 구현 백로그 |
| `07-bo-one-page-summary.md` | BO 공유용 1페이지 요약 |
| `08-llm-io-contract.md` | LLM 입출력 계약서 |
| `09-n8n-workflow-spec.md` | n8n 워크플로우 명세 |
| `10-planner-review.md` | 요청사항 반영 및 기획 보완 점검 |
| `11-week1-flow-report.md` | 1주차 담당자 공유용 전체 플로우 정리 |

## 샘플

| 파일 | 용도 |
| --- | --- |
| `samples/sample-cr-input.json` | CR 입력 샘플 |
| `samples/sample-ai-output.json` | 기대 AI 출력 샘플 |

## 시트 템플릿

`sheets-template/` 안의 CSV 파일은 Google Sheets에 업로드해 1차 MVP 작업대를 구성할 때 사용한다.

| 파일 | 대응 시트 |
| --- | --- |
| `COURSE_INDEX.csv` | 교육 상품/과정 단위 관리 |
| `CR_INPUT.csv` | 원본 CR 입력 |
| `AOP_DRAFT.csv` | 과정 개요/차시별 초안 |
| `TIME_REASON_DRAFT.csv` | 학습소요시간 산정사유 |
| `PRACTICE_PROJECT_REVIEW.csv` | 실습/프로젝트 후보 |
| `RUN_LOG.csv` | 자동화 실행 로그 |

## 생성 파일

`generated/` 폴더는 샘플 JSON을 CSV로 변환한 결과를 담는다. 실제 Google Sheets에 붙여넣어 화면 검토용으로 사용할 수 있다.

생성 명령:

```bash
python3 mvp/scripts/export_sample_to_sheets.py
```
