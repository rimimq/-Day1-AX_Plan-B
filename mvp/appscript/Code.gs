function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
  };
}

// ══════════════════════════════════════
// 웹앱 진입점
// ══════════════════════════════════════
function doGet(e) {
  // action 파라미터가 있으면 기존처럼 API 요청으로 처리 (하위호환)
  if (e.parameter && e.parameter.action) {
    return handleGetApi(e);
  }

  // action 파라미터가 없으면 프론트엔드(로그인 화면 포함 HTML)를 서빙
  // TODO: update needed - frontend moved to Vercel (plan-b-site-henna.vercel.app), so the login screen served below is commented out.
  // return HtmlService
    // .createHtmlOutputFromFile('planb')
    // .setTitle('Plan-B')
    // .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function handleGetApi(e) {
  try {
    const action    = e.parameter.action;
    const sheetsUrl = e.parameter.sheetsUrl;
    const feedback  = e.parameter.feedback  || '';
    const prevDraft = e.parameter.prevDraft ? JSON.parse(e.parameter.prevDraft) : null;
    let result;
    if (action === 'generate') {
      const crData = readCRFromSheets(sheetsUrl);
      result = callClaude(crData, null);
    } else if (action === 'refine') {
      result = callClaude(prevDraft, feedback);
    } else {
      throw new Error('알 수 없는 action: ' + action);
    }
    return buildResponse({ success: true, data: result });
  } catch (err) {
    return buildResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    let result;
    if (params.action === 'generate') {
      const crData = readCRFromSheets(params.sheetsUrl);
      result = callClaude(crData, null);
    } else if (params.action === 'refine') {
      result = callClaude(params.previousDraft, params.feedback);
    } else {
      throw new Error('알 수 없는 action: ' + params.action);
    }
    const courseName = result.course_overview && result.course_overview.name ? result.course_overview.name : '알 수 없는 과정';
    if (params.action === 'generate') {
      sendSlack('✅ *운영계획서 초안 생성 완료*\n과정명: ' + courseName + '\n상태: AI 초안이 생성되었습니다. 검토를 시작해주세요.');
    } else if (params.action === 'refine') {
      sendSlack('🔄 *운영계획서 재생성 완료*\n과정명: ' + courseName + '\n상태: 피드백이 반영되었습니다. 재검토 해주세요.');
    }
    return buildResponse({ success: true, data: result });
  } catch (err) {
    return buildResponse({ success: false, error: err.message });
  }
}

function sendSlack(message) {
  const config = getConfig();
  if (!config.SLACK_WEBHOOK_URL) return;
  try {
    UrlFetchApp.fetch(config.SLACK_WEBHOOK_URL, {
      method:             'post',
      contentType:        'application/json',
      payload:            JSON.stringify({ text: message }),
      muteHttpExceptions: true
    });
  } catch (err) {}
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function readCRFromSheets(url) {
  const sheetId = extractSheetId(url);
  const ss      = SpreadsheetApp.openById(sheetId);
  const result  = {};
  ss.getSheets().forEach(function(sheet) {
    const name   = sheet.getName();
    const values = sheet.getDataRange().getValues();
    result[name] = values.filter(function(row) {
      return row.some(function(cell) { return cell !== ''; });
    });
  });
  return JSON.stringify(result, null, 2);
}

function extractSheetId(url) {
  const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error('올바른 Google Sheets URL이 아닙니다.');
  return match[1];
}

function callClaude(crDataOrPrevDraft, feedback) {
  const config = getConfig();
  if (!config.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY가 스크립트 속성에 설정되어 있지 않습니다.');
  }

  const isRefine   = feedback !== null;
  const userPrompt = isRefine
    ? buildRefinePrompt(crDataOrPrevDraft, feedback)
    : buildGeneratePrompt(crDataOrPrevDraft);

  const payload = {
    model:      config.CLAUDE_MODEL,
    max_tokens: 8192,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: userPrompt }]
  };

  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method:             'post',
    headers: {
      'x-api-key':         config.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json'
    },
    payload:            JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const data = JSON.parse(response.getContentText());
  if (data.error) throw new Error('Claude API 오류: ' + data.error.message);

  const text      = data.content[0].text;
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 파싱할 수 없습니다.');

  try {
    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (parseErr) {
    Logger.log('Claude 원문 응답: ' + text);
    throw new Error('JSON 파싱 실패. 빈 CR 시트이거나 AI 응답 형식이 올바르지 않습니다.');
  }
}

const SYSTEM_PROMPT = `당신은 KDC(K-디지털기초역량훈련) 운영계획서 작성 전문가입니다.
BO(백오피스 담당자)가 제공하는 CR(Course Report) 데이터를 기반으로 운영계획서 초안을 작성합니다.

작성 규칙:
1. CR에 있는 내용만 사용하고, 없는 내용은 절대 임의로 추가하지 않습니다
2. 불확실하거나 판단이 필요한 내용은 "[검토 필요]"로 표시합니다
3. 공적 문체를 사용하고 과장된 마케팅 표현을 배제합니다
4. 차시·파트·챕터·클립의 계층 구조를 보존합니다
5. 실습, 프로젝트, 제작, 구현, API, Firebase 등 키워드가 있으면 projects 배열에 분리합니다
6. 반드시 아래 JSON 형식으로만 응답하며, 코드블록(json)으로 감싸주세요

출력 JSON 형식:
\`\`\`json
{
  "course_overview": {
    "name": "과정명",
    "period": "교육기간",
    "total_hours": "교육시수(총 훈련시간)",
    "student_count": "교육인원",
    "objectives": "과정목표 (2-3문장, 공적 문체)"
  },
  "sessions": [
    {
      "no": "1",
      "title": "차시명",
      "duration": "총 재생시간 (없으면 [검토 필요])",
      "summary": "학습내용 초안 (3-5문장, 공적 문체, '본 차시는...' 으로 시작)",
      "objective": "학습목표 초안 (1-2문장, '~할 수 있다' 형식)",
      "time": "학습소요시간 산정사유 (총 시간, 구성 내역, 근거)",
      "warning": "검토 필요 사항 (없으면 빈 문자열\"\")"
    }
  ],
  "projects": [
    {
      "no": "1",
      "type": "PRACTICE 또는 PROJECT",
      "source": "근거가 되는 클립/챕터명",
      "summary": "프로젝트/실습 설명",
      "output": "예상 산출물"
    }
  ],
  "quality_flags": ["검토 필요 항목 목록 (없으면 빈 배열)"]
}
\`\`\``;

function buildGeneratePrompt(crData) {
  return `다음 CR(Course Report) 데이터를 기반으로 KDC 운영계획서 초안을 작성해주세요.

CR 데이터:
${crData}

위 데이터에서 과정명, 교육기간, 교육시수, 교육인원, 과정목표, 커리큘럼, 강사 정보 등을 추출하여
규칙에 따라 운영계획서 초안을 JSON 형식으로 작성하세요.`;
}

function buildRefinePrompt(prevDraft, feedback) {
  return `다음은 기존 운영계획서 초안과 BO의 피드백입니다.
피드백 내용을 반영하여 초안을 수정해주세요.
피드백에서 언급되지 않은 부분은 그대로 유지하세요.

기존 초안:
${JSON.stringify(prevDraft, null, 2)}

BO 피드백:
${feedback}

수정된 운영계획서 초안을 JSON 형식으로 작성하세요.`;
}
