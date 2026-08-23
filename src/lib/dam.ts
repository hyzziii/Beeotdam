import { DamLevels } from '@/data';

/**
 * 홍수 경보 단계.
 *
 * 가뭄 쪽과 달리 이건 계산할 수 있다. 댐마다 정해진 수위 기준이 제원 API에 있고,
 * 현재 수위는 운영 API가 준다. 전국 공통 기준을 임의로 정할 필요가 없다.
 *
 * 평상시에는 null이라 화면에 아무것도 붙지 않는다. 근거 없는 '양호' 배지를 만드는 대신
 * 실제로 기준을 넘었을 때만 알린다.
 */
export type FloodAlert = 'designFlood' | 'floodLimit'

/**
 * 현재 수위가 어느 기준을 넘었는지.
 *
 * 홍수기 제한수위와 상시만수위가 같은 댐이 많아(대청·주암·운문 등) 둘을 나누지 않고,
 * 실제로 다른 뜻을 갖는 두 단계만 본다.
 *   designFlood — 계획홍수위 초과. 댐 설계 한계에 닿은 상태
 *   floodLimit  — 홍수기 제한수위 초과. 홍수기라면 낮춰야 하는 수위
 */
export function floodAlert(waterLevel: number, levels: DamLevels): FloodAlert | null {
    if (waterLevel >= levels.designFlood) return 'designFlood'
    if (waterLevel >= levels.floodLimit) return 'floodLimit'
    return null
}
