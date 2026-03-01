// Thai time period names mapped to Chinese 時辰 (2-hour periods)
// - name: stored in user profile (keep for backward compat)
// - displayName: simple Thai time-of-day label shown in UI
// - timeRange: 24h format for clarity
export const THAI_TIME_PERIODS = [
  { name: 'ตีหนึ่ง', displayName: 'ดึก', label: 'ตี 1-3', timeRange: '01:00-03:00', chineseHour: 1, period: 'zi' },
  { name: 'ตีสอง', displayName: 'เช้ามืด', label: 'ตี 3-5', timeRange: '03:00-05:00', chineseHour: 3, period: 'chou' },
  { name: 'รุ่งเช้า', displayName: 'รุ่งเช้า', label: 'เช้า 5-7', timeRange: '05:00-07:00', chineseHour: 5, period: 'yin' },
  { name: 'เช้าตรู่', displayName: 'เช้า', label: 'เช้า 7-9', timeRange: '07:00-09:00', chineseHour: 7, period: 'mao' },
  { name: 'สายเช้า', displayName: 'สาย', label: 'สาย 9-11', timeRange: '09:00-11:00', chineseHour: 9, period: 'chen' },
  { name: 'เที่ยง', displayName: 'เที่ยง', label: 'เที่ยง 11-13', timeRange: '11:00-13:00', chineseHour: 11, period: 'si' },
  { name: 'บ่ายโมง', displayName: 'บ่าย', label: 'บ่าย 13-15', timeRange: '13:00-15:00', chineseHour: 13, period: 'wu' },
  { name: 'บ่ายสาม', displayName: 'บ่ายแก่', label: 'บ่าย 15-17', timeRange: '15:00-17:00', chineseHour: 15, period: 'wei' },
  { name: 'เย็น', displayName: 'เย็น', label: 'เย็น 17-19', timeRange: '17:00-19:00', chineseHour: 17, period: 'shen' },
  { name: 'ค่ำ', displayName: 'หัวค่ำ', label: 'ค่ำ 19-21', timeRange: '19:00-21:00', chineseHour: 19, period: 'you' },
  { name: 'สองทุ่ม', displayName: 'กลางคืน', label: 'สองทุ่ม 21-23', timeRange: '21:00-23:00', chineseHour: 21, period: 'xu' },
  { name: 'เที่ยงคืน', displayName: 'เที่ยงคืน', label: 'เที่ยงคืน 23-01', timeRange: '23:00-01:00', chineseHour: 23, period: 'hai' },
] as const;

export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
] as const;

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
] as const;

// Buddhist Era offset
export const BE_OFFSET = 543;
