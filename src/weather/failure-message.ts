import { ApiFailureKind } from '@/api/http';

/**
 * 실패 종류를 사람이 읽는 짧은 문구로 옮긴다.
 *
 * '불러오지 못했어요'만 보여주면 왜 안 되는지 알 수 없다. 키를 안 넣은 것과 네트워크가
 * 끊긴 것과 한도를 넘긴 것은 사용자가 할 일이 완전히 다르므로 구분해서 알린다.
 */
export function failureMessage(kind: ApiFailureKind): string {
  switch (kind) {
    case 'notConfigured':
      return 'API 키가 설정되지 않았어요';
    case 'unauthorized':
      return '인증키가 올바르지 않아요';
    case 'quotaExceeded':
      return '오늘 조회 한도를 다 썼어요';
    case 'offline':
      return '네트워크에 연결되지 않았어요';
    case 'timeout':
      return '응답이 너무 오래 걸려요';
    case 'noData':
      return '이 지역 자료가 없어요';
    case 'server':
      return '기상청 서버에 문제가 있어요';
  }
}
