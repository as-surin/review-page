function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Public');
  const data = sheet.getDataRange().getValues();
  
  // 헤더와 데이터 분리
  const headers = data[0];
  const rows = data.slice(1);
  
  // 헤더 인덱스 매핑 (열 위치가 바뀌어도 작동하도록)
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  // 데이터 객체로 변환
  let objects = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  // 1. 데이터 정제 및 중복 제거 로직
  const processedMap = new Map();

  objects.forEach(item => {
    // 필수 데이터가 없으면 건너뜀
    if (!item.GameId || !item.Number || !item.GameTitle) return;

    // 1-1. 게임 제목 정제 (뒤에 붙은 숫자 4자리 제거)
    // 예: "백설공주의 독사과 1234" -> "백설공주의 독사과"
    let originalTitle = String(item.GameTitle).trim();
    // 정규식: 끝에 있는 공백과 숫자들을 찾아서 제거
    let cleanTitle = originalTitle.replace(/\s+\d+$/, '').trim(); 
    
    item.CleanGameTitle = cleanTitle; // 정제된 제목 저장
    item.OriginalGameTitle = originalTitle; // 원본 제목 저장 (필요시 사용)

    // 1-2. 중복 제거 (uuid 기준 - 각 플레이어의 응답을 모두 보존)
    // 같은 플레이어가 같은 게임에서 여러 단계(엔딩 페이즈 -> review)로 데이터를 입력하는 경우,
    // 가장 최신 데이터만 유지하되, 다른 플레이어의 데이터는 모두 보존
    const uniqueKey = item.uuid || `${item.GameId}_${item.Number}_${item.Role || ''}_${item.sentTime}`;
    
    const existingItem = processedMap.get(uniqueKey);
    const currentItemDate = new Date(item.sentTime);

    // 이미 저장된 데이터가 없거나, 현재 데이터가 더 최신인 경우 업데이트
    if (!existingItem) {
      processedMap.set(uniqueKey, item);
    } else {
      const existingItemDate = new Date(existingItem.sentTime);
      if (currentItemDate > existingItemDate) {
        processedMap.set(uniqueKey, item);
      }
    }
  });

  // 맵의 값들만 추출하여 배열로 변환
  const finalData = Array.from(processedMap.values());

  // 최신순 정렬 (선택 사항)
  finalData.sort((a, b) => new Date(b.sentTime) - new Date(a.sentTime));

  // JSON 반환
  return ContentService.createTextOutput(JSON.stringify(finalData))
    .setMimeType(ContentService.MimeType.JSON);
}