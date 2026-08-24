/**
 * 공공데이터포털 API 호출을 감싼다.
 *
 * 이 포털은 실패를 여러 방식으로 알려서 그냥 fetch만 쓰면 놓친다.
 *
 *   1. 실패해도 HTTP 200을 준다. 본문의 resultCode를 봐야 실패인 걸 안다.
 *   2. dataType=JSON을 요청했는데도 인증키 오류는 XML로 돌아온다.
 *   3. 응답이 아예 안 오는 경우가 있어 직접 끊어줘야 한다.
 *
 * 화면이 오류 종류에 따라 다른 안내를 보여주므로(서버 오류 / 응답 시간 초과),
 * 실패를 하나의 Error로 뭉개지 않고 kind로 구분해 던진다.
 */

/** .env의 EXPO_PUBLIC_DATA_GO_KR_KEY. 빌드 시점에 이 자리에 값이 박힌다. */
const SERVICE_KEY = process.env.EXPO_PUBLIC_DATA_GO_KR_KEY;

/** 이 시간을 넘기면 끊고 '응답 시간 초과'로 처리한다. */
const TIMEOUT_MS = 10_000;

export type ApiFailureKind =
  /** 시간 안에 응답이 안 왔다. 네트워크가 느리거나 서버가 혼잡. */
  | 'timeout'
  /** 네트워크 자체가 안 됨. 비행기 모드 등. */
  | 'offline'
  /** 서버가 오류를 돌려줬다. */
  | 'server'
  /** 인증키가 등록 안 됨 / 잘못됨. .env를 확인해야 한다. */
  | 'unauthorized'
  /** 일일 호출 한도 초과. */
  | 'quotaExceeded'
  /** 요청은 성공했지만 해당 조건의 자료가 없다. */
  | 'noData'
  /** 키가 아예 설정되지 않았다. */
  | 'notConfigured';

export class ApiError extends Error {
  readonly kind: ApiFailureKind;

  constructor(kind: ApiFailureKind, message: string) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
  }
}

/**
 * 포털이 돌려주는 resultCode를 실패 종류로 옮긴다.
 * 목록에 없는 코드는 서버 오류로 묶는다 — 화면에서 할 안내가 같다.
 */
function toFailureKind(resultCode: string): ApiFailureKind | null {
  switch (resultCode) {
    case '00':
      return null; // 정상
    case '03':
      return 'noData';
    case '22':
      return 'quotaExceeded';
    case '30': // 등록되지 않은 서비스키
    case '31': // 기한만료된 서비스키
    case '32': // 등록되지 않은 도메인
      return 'unauthorized';
    default:
      return 'server';
  }
}

/**
 * 응답 봉투.
 *
 * 자료는 보통 body.items.item 배열에 들어 있지만, 기관에 따라 body.items가 곧 배열인
 * 경우도 있다. 자료가 아예 없을 때는 items가 빈 문자열로 오기도 한다.
 */
interface Envelope<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body?: {
      items?: { item?: T[] } | T[] | '';
      totalCount?: number;
    };
  };
}

/**
 * 응답 형식을 JSON으로 지정하는 방법이 기관마다 다르다.
 *
 *   기상청     dataType=JSON
 *   K-water    _type=json
 *   에어코리아  returnType=json
 *
 * 같은 포털인데 통일돼 있지 않아, 호출하는 쪽이 어느 쪽인지 알려줘야 한다.
 * 틀리면 오류가 아니라 XML이 조용히 돌아와 파싱에서 터진다.
 */
export type JsonParamStyle = 'dataType' | '_type' | 'returnType';

/**
 * 포털 API를 호출하고 자료 배열을 돌려준다.
 *
 * serviceKey는 여기서 붙이므로 호출하는 쪽은 넘기지 않는다.
 */
export async function fetchPublicData<T>(
  url: string,
  params: Record<string, string | number>,
  jsonParam: JsonParamStyle = 'dataType',
): Promise<T[]> {
  if (!SERVICE_KEY) {
    throw new ApiError(
      'notConfigured',
      'EXPO_PUBLIC_DATA_GO_KR_KEY가 없습니다. .env.example을 복사해 .env를 만들고 인증키를 넣어주세요.',
    );
  }

  const query = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    // 기상청만 대문자 JSON을 받는다
    [jsonParam]: jsonParam === 'dataType' ? 'JSON' : 'json',
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  });

  // fetch에는 타임아웃 옵션이 없어 AbortController로 직접 끊는다
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${url}?${query}`, { signal: controller.signal });
  } catch {
    // abort로 끊긴 것과 네트워크가 없는 것을 구분한다
    if (controller.signal.aborted) {
      throw new ApiError('timeout', '응답이 너무 오래 걸립니다.');
    }
    throw new ApiError('offline', '네트워크에 연결할 수 없습니다.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ApiError('server', `서버가 ${response.status}를 돌려줬습니다.`);
  }

  const text = await response.text();

  let envelope: Envelope<T>;
  try {
    envelope = JSON.parse(text);
  } catch {
    // JSON을 요청했는데 파싱이 안 되면 XML 오류 응답이다. 인증키 문제가 대부분이다.
    const isKeyProblem = text.includes('SERVICE_KEY') || text.includes('SERVICE KEY');
    throw new ApiError(
      isKeyProblem ? 'unauthorized' : 'server',
      isKeyProblem
        ? '인증키가 등록되지 않았습니다. 발급 직후라면 1시간 정도 기다려야 합니다.'
        : '서버 응답을 이해할 수 없습니다.',
    );
  }

  const header = envelope.response?.header;
  if (!header) {
    throw new ApiError('server', '서버 응답에 헤더가 없습니다.');
  }

  const failure = toFailureKind(header.resultCode);
  if (failure) {
    throw new ApiError(failure, header.resultMsg || `오류 코드 ${header.resultCode}`);
  }

  const items = envelope.response.body?.items;
  let list: T[] | undefined;
  if (Array.isArray(items)) {
    list = items;
  } else if (items && typeof items === 'object') {
    list = items.item;
  }

  if (!Array.isArray(list) || list.length === 0) {
    throw new ApiError('noData', '해당 조건의 자료가 없습니다.');
  }

  return list;
}
