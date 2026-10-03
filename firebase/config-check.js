/* 외부 SDK를 불러오기 전 설정 여부 확인 */
export function isConfigured(cfg) {
  return !!(cfg && ['apiKey','authDomain','databaseURL','projectId','appId'].every(key =>
    typeof cfg[key] === 'string' && cfg[key].trim() && !/[\[\]<>]/.test(cfg[key])) &&
    /^https:\/\//.test(cfg.databaseURL));
}

