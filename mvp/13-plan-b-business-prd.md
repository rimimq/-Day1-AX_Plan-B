# Plan-B One-Page PRD

## KDC 운영계획서 자동화 Hi-Fi Prototype

**Prototype**  
https://plan-b-site-henna.vercel.app

---

## 1. Executive Summary

**Plan-B = CR 기반 운영계획서 초안 생성 및 BO 검토 자동화 콘솔**

CR 파일 업로드 후 AI가 운영계획서의 과정별 입력 필요 항목을 초안으로 작성하고, BO가 웹 콘솔에서 피드백, 확인, Docs/PDF 내보내기까지 진행하는 업무 자동화 프로토타입

**핵심 목적**

- BO의 반복 작성 시간 단축
- AI 초안, BO 피드백, 승인 상태의 단일 화면 관리
- 승인된 항목만 최종 운영계획서 산출물에 반영

---

## 2. Business Problem

KDC 온라인 과정 운영계획서는 매 과정마다 작성 필요. 다만 과정명, 차시 구성, 커리큘럼 흐름, 실습/프로젝트 편성, 과정 차별성 등 상당수 정보는 CR과 훈련시간계획서에 이미 존재

**현재 Pain Point**

- CR 정보를 운영계획서 문체로 재작성하는 반복 업무
- AI 초안, BO 피드백, 최종 반영본의 상태 추적 어려움
- Sheets, Docs, PDF 등 여러 도구를 오가는 작업 흐름 단절

**개선 방향**

BO 직접 작성 중심에서, AI 초안 기반 검토·수정·승인 구조로 전환

---

## 3. Target Workflow

1. **Projects**  
   기존 CR 작업 확인 또는 신규 작업 시작

2. **Review**  
   CR 업로드 → AI 분석 → 항목별 초안 생성 → 챗봇 피드백

3. **Plan Items**  
   전체 입력값 검토 → 항목별 수정 → 항목별 확인 또는 전체 확인

4. **Export**  
   승인된 항목만 Docs/PDF 형태로 최종 산출

---

## 4. Screen Role

### Projects

기존 CR 작업 목록, 진행 상태, 승인 현황 확인. 여러 과정의 작업 이력을 관리하는 시작 화면

### Review

CR 업로드와 AI 피드백을 진행하는 메인 작업 화면  
챗봇 피드백은 항상 **현재 선택된 운영계획서 항목**에만 반영

### Plan Items

AI 초안과 BO 피드백 반영본을 전체 항목 기준으로 검토하는 화면  
BO가 모든 입력값을 한 번에 비교, 수정, 확인 가능

### Export

확인 완료된 Plan Items만 최종 운영계획서 본문에 반영  
Docs/PDF 내보내기는 초안 생성이 아닌 최종 산출 단계

---

## 5. Prototype Review Point

OP/BO 검토 시 아래 항목 중심 확인 필요

- `Projects → Review → Plan Items → Export` 흐름의 업무 적합성
- CR 업로드 후 AI 분석 대기 및 결과 표시 방식의 자연스러움
- 챗봇 피드백의 반영 대상 명확성
- Plan Items에서 전체 항목을 한 번에 확인하는 방식의 편의성
- `전체 확인 → Export → Docs/PDF` 흐름의 업무 적합성

---

## 6. Product Direction

**권장 방향: Web Console 중심 작업 환경**

BO가 Sheets를 직접 편집하는 방식보다, 웹 콘솔에서 업로드·피드백·확인·내보내기를 진행하는 방식 권장

**Sheets 역할**

- CR 파일 메타데이터 저장
- AI 초안 저장
- BO 피드백 저장
- 항목별 승인 상태 저장
- 최종 내보내기 로그 저장

Sheets는 작업 화면이 아닌, 자동화 연동을 위한 백엔드 저장소로 활용

---

## 7. MVP Scope

**1차 MVP 목표**  
완전 자동 작성이 아닌, BO 검토가 가능한 초안 생성 및 승인 흐름 구현

**포함 범위**

- CR 파일 업로드
- AI 초안 생성
- 항목별 피드백 반영
- Plan Items 전체 검토
- 항목별/전체 확인
- 승인 항목 기반 Docs/PDF 내보내기
- 기존 작업 이력 목록

**후속 범위**

- 실제 Google Sheets 저장 연동
- 실제 CR 문서 파싱
- n8n 자동화 워크플로우
- Slack/Email 알림
- Google Docs 템플릿 자동 삽입
- 교강사 DB 또는 기관 실적 DB 연동

---

## 8. Success Criteria

- 운영계획서 초안 작성 시간 단축
- BO 피드백 반영 대상의 명확성 확보
- 승인된 항목만 최종 문서에 반영
- 기존 CR 작업 재진입 가능
- Sheets, AI, Docs/PDF 연동을 위한 데이터 구조 명확화

---

## 9. 공유 문구

KDC 운영계획서 자동화 Plan-B Hi-Fi Prototype 공유드립니다.

**Prototype**  
https://plan-b-site-henna.vercel.app

이번 버전은 CR 업로드 후 AI가 운영계획서 입력 필요 항목별 초안을 생성하고, BO가 Review에서 피드백을 남긴 뒤 Plan Items에서 항목별/전체 확인 후 Export로 Docs/PDF 산출하는 흐름 검토 목적의 프로토타입입니다.

검토 시 화면 디자인보다 실제 업무 흐름의 자연스러움, 피드백 반영 대상의 명확성, Plan Items 전체 검토 방식의 편의성을 중심으로 봐주시면 좋겠습니다.
