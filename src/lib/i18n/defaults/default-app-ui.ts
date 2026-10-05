/** What the installed app says about itself — notifications, the tester call,
 *  install and share, and the two states a reader only meets offline. Split out
 *  of DEFAULT_UI because that file is meant to be readable in one screen, and
 *  these keys belong to one another. */
export const DEFAULT_APP_UI = {
  notify: { title: '', lead: '', on: '', off: '', at: '', where: '', asked: '', refused: '', done: '' },
  testers: { title: '', lead: '', join: '', install: '' },
  progress: { roadmap: '', roadmapLead: '', releases: '', releasesLead: '', now: '', next: '', later: '', done: '', example: '', here: '' },
  eventPage: { starts: "", dates: "", duration: "", price: "", website: "", call: "", directions: "", programme: "", where: "", actions: "", report: "", claim: "", managed: "", allInCity: "", venuePage: "" },
  picks: { title: "", day: "", week: "", month: "", thisWeek: "" },
  subscribe: { note: '', calendar: '', rss: '', telegram: '' },
  share: { label: '', copied: '' },
  install: { label: '', hint: '' },
  offline: { notice: '', saved: '', updated: '', reload: '', retry: '', listAway: '' },
  outbox: { queued: '', waiting: '', conflict: '', sent: '' },
} as const;
