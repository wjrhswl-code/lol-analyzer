export interface SummonerProfile {
  puuid: string
  id: string
  accountId: string
  name: string
  tagLine: string
  profileIconId: number
  summonerLevel: number
  revisionDate: number
}

export interface RankedInfo {
  leagueId: string
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  hotStreak: boolean
  veteran: boolean
  freshBlood: boolean
  inactive: boolean
}

export interface MatchParticipant {
  puuid: string
  summonerName: string
  championName: string
  championId: number
  teamId: number
  win: boolean
  kills: number
  deaths: number
  assists: number
  totalDamageDealtToChampions: number
  totalDamageTaken: number
  goldEarned: number
  totalMinionsKilled: number
  neutralMinionsKilled: number
  visionScore: number
  wardsPlaced: number
  wardsKilled: number
  controlWardsPlaced: number
  turretKills: number
  turretTakedowns: number
  firstBloodKill: boolean
  firstTowerKill: boolean
  doubleKills: number
  tripleKills: number
  quadraKills: number
  pentaKills: number
  totalHeal: number
  lane: string
  role: string
  individualPosition: string
  timeCCingOthers: number
  totalTimeCrowdControlDealt: number
  damageDealtToObjectives: number
  bountyLevel: number
  consumablesPurchased: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  summoner1Id: number
  summoner2Id: number
  perks: {
    styles: Array<{
      style: number
      selections: Array<{ perk: number; var1: number; var2: number; var3: number }>
    }>
  }
  riotIdGameName?: string
  riotIdTagline?: string
}

export interface MatchInfo {
  gameId: number
  gameCreation: number
  gameDuration: number
  gameMode: string
  gameType: string
  gameVersion: string
  mapId: number
  queueId: number
  participants: MatchParticipant[]
  teams: Array<{
    teamId: number
    win: boolean
    objectives: {
      baron: { first: boolean; kills: number }
      champion: { first: boolean; kills: number }
      dragon: { first: boolean; kills: number }
      tower: { first: boolean; kills: number }
      riftHerald: { first: boolean; kills: number }
    }
  }>
}

export interface MatchData {
  metadata: {
    matchId: string
    participants: string[]
  }
  info: MatchInfo
}

export interface ChampionMasteryData {
  puuid: string
  championId: number
  championLevel: number
  championPoints: number
  lastPlayTime: number
  championPointsSinceLastLevel: number
  championPointsUntilNextLevel: number
}

export interface ProcessedMatch {
  matchId: string
  gameCreation: number
  gameDuration: number
  gameMode: string
  queueId: number
  queueName: string
  win: boolean
  championName: string
  championId: number
  kills: number
  deaths: number
  assists: number
  kda: number
  cs: number
  csPerMin: number
  visionScore: number
  damageDealt: number
  damageDealtPerMin: number
  goldEarned: number
  lane: string
  role: string
  wardsPlaced: number
  controlWards: number
  turretDamage: number
  teamKills: number
  killParticipation: number
  items: number[]
  doubleKills: number
  tripleKills: number
  quadraKills: number
  pentaKills: number
  firstBlood: boolean
  timeCrowdControl: number
}

export interface AnalysisResult {
  summary: string
  goodPoints: string[]
  badPoints: string[]
  tierTips: string[]
  comparisonSummary: string
  score: number
  mvpMoment?: string
}

export interface ChampionStats {
  championName: string
  tier: string
  rank: string
  winRate: number
  avgKda: number
  avgCs: number
  avgCsPerMin: number
  avgVision: number
  avgDamage: number
  avgDamagePerMin: number
}

export type Region = 'kr' | 'na1' | 'euw1' | 'eune1' | 'jp1' | 'br1' | 'la1' | 'la2' | 'oc1' | 'tr1' | 'ru'

export type Platform = 'ASIA' | 'AMERICAS' | 'EUROPE' | 'SEA'

export const REGION_TO_PLATFORM: Record<Region, Platform> = {
  kr: 'ASIA',
  jp1: 'ASIA',
  na1: 'AMERICAS',
  br1: 'AMERICAS',
  la1: 'AMERICAS',
  la2: 'AMERICAS',
  euw1: 'EUROPE',
  eune1: 'EUROPE',
  tr1: 'EUROPE',
  ru: 'EUROPE',
  oc1: 'SEA',
}

export const QUEUE_NAMES: Record<number, string> = {
  420: '솔로 랭크',
  440: '자유 랭크',
  450: '칼바람',
  400: '일반',
  430: '일반',
  0: '커스텀',
}

export const TIER_COLORS: Record<string, string> = {
  IRON: '#8B7355',
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#00FFCC',
  EMERALD: '#50C878',
  DIAMOND: '#B9F2FF',
  MASTER: '#9D4EDD',
  GRANDMASTER: '#FF4500',
  CHALLENGER: '#F4C430',
}
