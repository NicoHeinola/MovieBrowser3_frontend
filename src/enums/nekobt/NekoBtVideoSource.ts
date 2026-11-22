/** Where a torrent's video comes from and how it was processed. */
export enum NekoBtVideoSource {
  Hybrid = 'hybrid',
  BdRemux = 'bd_remux',
  BdEncode = 'bd_encode',
  BdMini = 'bd_mini',
  BdDisc = 'bd_disc',
  WebDl = 'web_dl',
  WebEncode = 'web_encode',
  WebMini = 'web_mini',
  DvdEncode = 'dvd_encode',
  DvdRemux = 'dvd_remux',
  DvdDisc = 'dvd_disc',
  TvRaw = 'tv_raw',
  TvEncode = 'tv_encode',
  LaserDisc = 'laser_disc',
  Vhs = 'vhs',
  Other = 'other',
}
