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

/** 오류 화면의 색조. 급한 문제는 빨강, 기다리면 풀릴 문제는 파랑. */
export type FailureTone = 'alarm' | 'calm';

export interface FailureCopy {
  tone: FailureTone;
  /** 제목 위 작은 배지. */
  badge: string;
  badgeIcon: string;
  title: string;
  message: string;
  /** 사용자가 해볼 만한 것. */
  hint: string;
}

/**
 * 오류 화면 한 장에 들어갈 문구.
 *
 * 종류마다 사용자가 할 수 있는 일이 다르다. 네트워크는 본인이 고칠 수 있고, 서버 문제는
 * 기다리는 수밖에 없고, 인증키는 개발자가 손봐야 한다. 안내가 같으면 화면이 있으나 마나다.
 */
export function failureCopy(kind: ApiFailureKind): FailureCopy {
  switch (kind) {
    case 'timeout':
      return {
        tone: 'calm',
        badge: '응답 시간 초과',
        badgeIcon: '⏱',
        title: '응답이 너무 오래 걸려요',
        message: '네트워크가 느리거나 서버가 혼잡해요. 잠시 후 다시 시도해 주세요.',
        hint: '이동 중이라면 신호가 강한 곳으로 이동 후 시도해 보세요.',
      };

    case 'offline':
      return {
        tone: 'calm',
        badge: '네트워크 오류',
        badgeIcon: '📡',
        title: '네트워크에 연결되지 않았어요',
        message: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
        hint: '기내 모드가 켜져 있거나 데이터가 꺼져 있지는 않은지 확인해 보세요.',
      };

    case 'quotaExceeded':
      return {
        tone: 'alarm',
        badge: '조회 한도 초과',
        badgeIcon: '🚧',
        title: '오늘 조회 한도를 다 썼어요',
        message: '기상청 API 일일 호출 한도를 넘었어요. 내일 다시 이용할 수 있어요.',
        hint: '자정이 지나면 한도가 초기화됩니다.',
      };

    case 'notConfigured':
      return {
        tone: 'alarm',
        badge: '설정 오류',
        badgeIcon: '🔑',
        title: 'API 키가 설정되지 않았어요',
        message: '공공데이터포털 인증키가 없어 데이터를 불러올 수 없어요.',
        hint: '.env에 EXPO_PUBLIC_DATA_GO_KR_KEY를 넣고 개발 서버를 다시 시작해 주세요.',
      };

    case 'unauthorized':
      return {
        tone: 'alarm',
        badge: '인증 오류',
        badgeIcon: '🔑',
        title: '인증키가 올바르지 않아요',
        message: '공공데이터포털 인증키가 등록되지 않았거나 만료됐어요.',
        hint: '발급 직후라면 반영까지 1시간 정도 걸립니다. Decoding 키인지도 확인해 보세요.',
      };

    case 'noData':
      return {
        tone: 'alarm',
        badge: '자료 없음',
        badgeIcon: '🗒',
        title: '이 지역 자료가 없어요',
        message: '선택한 지역의 예보를 찾지 못했어요. 다른 지역을 골라 보세요.',
        hint: '발표 직후에는 잠시 자료가 비어 있을 수 있습니다.',
      };

    case 'server':
      return {
        tone: 'alarm',
        badge: '서버 오류',
        badgeIcon: '⚡',
        title: '서버에 문제가 생겼어요',
        message: '기상청 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        hint: '문제가 지속되면 앱을 완전히 종료 후 다시 실행해 보세요.',
      };
  }
}
