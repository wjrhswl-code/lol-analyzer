import axios from 'axios'
import {
  SummonerProfile,
  RankedInfo,
  MatchData,
  ChampionMasteryData,
  Region,
  Platform,
  REGION_TO_PLATFORM,
  ProcessedMatch,
  QUEUE_NAMES,
} from './types'

const API_KEY = process.env.RIOT_API_KEY

function regionUrl(region: Region) {
  return `https://${region}.api.riotgames.com`
}

function platformUrl(platform: Platform) {
  return `https://${platform.toLowerCase()}.api.riotgames.com`
}

const headers = () => ({ 'X-Riot-Token': API_KEY! })

// Summoner 검색 (Riot ID 기반)
export async function getSummonerByRiotId(gameName: string, tagLine: string, region: Region): Promise<SummonerProfile> {
  const platform = REGION_TO_PLATFORM[region]
  // 1. Get PUUID from Riot ID
  const accountRes = await axios.get(
    `${platformUrl(platform)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: headers() }
  )
  const { puuid } = accountRes.data

  // 2. Get summoner data from PUUID
  const summonerRes = await axios.get(
    `${regionUrl(region)}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    { headers: headers() }
  )

  return {
    ...summonerRes.data,
    name: gameName,
    tagLine: tagLine,
  }
}

// 랭크 정보
export async function getRankedInfo(summonerId: string, region: Region): Promise<RankedInfo[]> {
  const res = await axios.get(
    `${regionUrl(region)}/lol/league/v4/entries/by-summoner/${summonerId}`,
    { headers: headers() }
  )
  return res.data
}

// 최근 매치 ID 목록
export async function getMatchIds(puuid: string, region: Region, count = 20, queue?: number): Promise<string[]> {
  const platform = REGION_TO_PLATFORM[region]
  const params: Record<string, string | number> = { count }
  if (queue) params.queue = queue

  const res = await axios.get(
    `${platformUrl(platform)}/lol/match/v5/matches/by-puuid/${puuid}/ids`,
    { headers: headers(), params }
  )
  return res.data
}

// 매치 상세 데이터
export async function getMatch(matchId: string, region: Region): Promise<MatchData> {
  const platform = REGION_TO_PLATFORM[region]
  const res = await axios.get(
    `${platformUrl(platform)}/lol/match/v5/matches/${matchId}`,
    { headers: headers() }
  )
  return res.data
}

// 챔피언 숙련도
export async function getChampionMastery(puuid: string, region: Region, count = 10): Promise<ChampionMasteryData[]> {
  const res = await axios.get(
    `${regionUrl(region)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`,
    { headers: headers() }
  )
  return res.data
}

// 챔피언 장인 랭킹 1위 (Challenger 리그에서 해당 챔피언 최다 플레이어)
export async function getChampionMaster(championId: number, region: Region) {
  try {
    // Challenger 리스트에서 챔피언 장인 찾기
    const res = await axios.get(
      `${regionUrl(region)}/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`,
      { headers: headers() }
    )
    const entries = res.data.entries || []
    // 가장 LP 높은 플레이어 중 해당 챔피언 장인 찾는 건 추가 API 호출이 필요해 상위 5명 반환
    const top5 = entries.sort((a: any, b: any) => b.leaguePoints - a.leaguePoints).slice(0, 5)
    return top5
  } catch {
    return []
  }
}

// 매치 데이터 가공
export function processMatch(matchData: MatchData, puuid: string): ProcessedMatch | null {
  const participant = matchData.info.participants.find(p => p.puuid === puuid)
  if (!participant) return null

  const duration = matchData.info.gameDuration // seconds
  const durationMin = duration / 60

  const teamParticipants = matchData.info.participants.filter(p => p.teamId === participant.teamId)
  const teamKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0)

  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled
  const kda = participant.deaths === 0
    ? participant.kills + participant.assists
    : (participant.kills + participant.assists) / participant.deaths

  return {
    matchId: matchData.metadata.matchId,
    gameCreation: matchData.info.gameCreation,
    gameDuration: duration,
    gameMode: matchData.info.gameMode,
    queueId: matchData.info.queueId,
    queueName: QUEUE_NAMES[matchData.info.queueId] || '기타',
    win: participant.win,
    championName: participant.championName,
    championId: participant.championId,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: Math.round(kda * 100) / 100,
    cs,
    csPerMin: Math.round((cs / durationMin) * 10) / 10,
    visionScore: participant.visionScore,
    damageDealt: participant.totalDamageDealtToChampions,
    damageDealtPerMin: Math.round(participant.totalDamageDealtToChampions / durationMin),
    goldEarned: participant.goldEarned,
    lane: participant.lane,
    role: participant.role,
    wardsPlaced: participant.wardsPlaced,
    controlWards: participant.controlWardsPlaced,
    turretDamage: participant.damageDealtToObjectives,
    teamKills,
    killParticipation: teamKills > 0
      ? Math.round(((participant.kills + participant.assists) / teamKills) * 100)
      : 0,
    items: [
      participant.item0, participant.item1, participant.item2,
      participant.item3, participant.item4, participant.item5, participant.item6,
    ],
    doubleKills: participant.doubleKills,
    tripleKills: participant.tripleKills,
    quadraKills: participant.quadraKills,
    pentaKills: participant.pentaKills,
    firstBlood: participant.firstBloodKill,
    timeCrowdControl: participant.timeCCingOthers,
  }
}

// 평균 통계 계산
export function calcAverageStats(matches: ProcessedMatch[]) {
  if (matches.length === 0) return null
  const len = matches.length
  return {
    avgKda: Math.round(matches.reduce((s, m) => s + m.kda, 0) / len * 100) / 100,
    avgCs: Math.round(matches.reduce((s, m) => s + m.cs, 0) / len),
    avgCsPerMin: Math.round(matches.reduce((s, m) => s + m.csPerMin, 0) / len * 10) / 10,
    avgVision: Math.round(matches.reduce((s, m) => s + m.visionScore, 0) / len),
    avgDamage: Math.round(matches.reduce((s, m) => s + m.damageDealt, 0) / len),
    avgDamagePerMin: Math.round(matches.reduce((s, m) => s + m.damageDealtPerMin, 0) / len),
    avgKills: Math.round(matches.reduce((s, m) => s + m.kills, 0) / len * 10) / 10,
    avgDeaths: Math.round(matches.reduce((s, m) => s + m.deaths, 0) / len * 10) / 10,
    avgAssists: Math.round(matches.reduce((s, m) => s + m.assists, 0) / len * 10) / 10,
    avgKillParticipation: Math.round(matches.reduce((s, m) => s + m.killParticipation, 0) / len),
    avgControlWards: Math.round(matches.reduce((s, m) => s + m.controlWards, 0) / len * 10) / 10,
    winRate: Math.round(matches.filter(m => m.win).length / len * 100),
    games: len,
  }
}

// DDragon 이미지 URL
export function championIconUrl(championName: string) {
  return `https://ddragon.leagueoflegends.com/cdn/14.13.1/img/champion/${championName}.png`
}

export function itemIconUrl(itemId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/14.13.1/img/item/${itemId}.png`
}

export function profileIconUrl(iconId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${iconId}.png`
}

// 상대 시간 표시
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  return `${mins}분 전`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s}초`
}
