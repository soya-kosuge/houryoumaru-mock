(() => {
  'use strict';
  const trips = [
  {
    "id": "2026-08-01-1",
    "date": "2026-08-01",
    "course": "半夜便",
    "time": "18:00",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-01-2",
    "date": "2026-08-01",
    "course": "深夜便（中型船）",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "第二豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 9,
    "remaining": 3,
    "status": "few",
    "price": 13000
  },
  {
    "id": "2026-08-02-1",
    "date": "2026-08-02",
    "course": "半夜便",
    "time": "18:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 9,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-02-2",
    "date": "2026-08-02",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-03-1",
    "date": "2026-08-03",
    "course": "半夜便",
    "time": "18:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 12,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-03-2",
    "date": "2026-08-03",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-04-1",
    "date": "2026-08-04",
    "course": "半夜便",
    "time": "18:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 5,
    "remaining": 11,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-04-2",
    "date": "2026-08-04",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-05-1",
    "date": "2026-08-05",
    "course": "半夜便",
    "time": "18:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 8,
    "remaining": 8,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-05-2",
    "date": "2026-08-05",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-06-1",
    "date": "2026-08-06",
    "course": "半夜便",
    "time": "18:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 11,
    "remaining": 5,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-06-2",
    "date": "2026-08-06",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-07-1",
    "date": "2026-08-07",
    "course": "半夜便",
    "time": "18:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 14,
    "remaining": 2,
    "status": "few",
    "price": 13000
  },
  {
    "id": "2026-08-07-2",
    "date": "2026-08-07",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 9,
    "remaining": 3,
    "status": "few",
    "price": 13000
  },
  {
    "id": "2026-08-08-1",
    "date": "2026-08-08",
    "course": "半夜便",
    "time": "18:00",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-09-1",
    "date": "2026-08-09",
    "course": "半夜便",
    "time": "18:00",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-09-2",
    "date": "2026-08-09",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 12,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-10-1",
    "date": "2026-08-10",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-10-2",
    "date": "2026-08-10",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 12,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-11-1",
    "date": "2026-08-11",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-12-1",
    "date": "2026-08-12",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-13-1",
    "date": "2026-08-13",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-14-1",
    "date": "2026-08-14",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-15-1",
    "date": "2026-08-15",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 16,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-16-1",
    "date": "2026-08-16",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 11,
    "remaining": 5,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-16-2",
    "date": "2026-08-16",
    "course": "特別便",
    "time": "18:30",
    "target": "船から花火大会",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 10,
    "reserved": 10,
    "remaining": 0,
    "status": "full",
    "price": 13000
  },
  {
    "id": "2026-08-17-1",
    "date": "2026-08-17",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 4,
    "remaining": 12,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-17-2",
    "date": "2026-08-17",
    "course": "深夜便",
    "time": "－",
    "target": "－",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 0,
    "remaining": 0,
    "status": "unknown",
    "price": 13000
  },
  {
    "id": "2026-08-18-1",
    "date": "2026-08-18",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 7,
    "remaining": 9,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-18-2",
    "date": "2026-08-18",
    "course": "深夜便",
    "time": "－",
    "target": "－",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 0,
    "remaining": 0,
    "status": "unknown",
    "price": 13000
  },
  {
    "id": "2026-08-19-1",
    "date": "2026-08-19",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 10,
    "remaining": 6,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-19-2",
    "date": "2026-08-19",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-20-1",
    "date": "2026-08-20",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 3,
    "remaining": 13,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-20-2",
    "date": "2026-08-20",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-21-1",
    "date": "2026-08-21",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 6,
    "remaining": 10,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-21-2",
    "date": "2026-08-21",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-22-1",
    "date": "2026-08-22",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 14,
    "remaining": 2,
    "status": "few",
    "price": 13000
  },
  {
    "id": "2026-08-23-1",
    "date": "2026-08-23",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 12,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-23-2",
    "date": "2026-08-23",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-24-1",
    "date": "2026-08-24",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 5,
    "remaining": 11,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-24-2",
    "date": "2026-08-24",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-25-1",
    "date": "2026-08-25",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 8,
    "remaining": 8,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-25-2",
    "date": "2026-08-25",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-26-1",
    "date": "2026-08-26",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 11,
    "remaining": 5,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-26-2",
    "date": "2026-08-26",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-27-1",
    "date": "2026-08-27",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 4,
    "remaining": 12,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-27-2",
    "date": "2026-08-27",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-28-1",
    "date": "2026-08-28",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 7,
    "remaining": 9,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-28-2",
    "date": "2026-08-28",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-29-1",
    "date": "2026-08-29",
    "course": "半夜便",
    "time": "17:30",
    "target": "スーパーロング便",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 13,
    "remaining": 3,
    "status": "few",
    "price": 13000
  },
  {
    "id": "2026-08-30-1",
    "date": "2026-08-30",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 3,
    "remaining": 13,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-30-2",
    "date": "2026-08-30",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-31-1",
    "date": "2026-08-31",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 6,
    "remaining": 10,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-08-31-2",
    "date": "2026-08-31",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-01-1",
    "date": "2026-09-01",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 6,
    "remaining": 10,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-01-2",
    "date": "2026-09-01",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-02-1",
    "date": "2026-09-02",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 9,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-02-2",
    "date": "2026-09-02",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-03-1",
    "date": "2026-09-03",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 12,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-04-1",
    "date": "2026-09-04",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 5,
    "remaining": 11,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-04-2",
    "date": "2026-09-04",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-05-1",
    "date": "2026-09-05",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 16,
    "reserved": 8,
    "remaining": 8,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-05-2",
    "date": "2026-09-05",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 12,
    "reserved": 5,
    "remaining": 7,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-06-1",
    "date": "2026-09-06",
    "course": "半夜便",
    "time": "17:30",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "佐藤船長",
    "capacity": 16,
    "reserved": 11,
    "remaining": 5,
    "status": "ok",
    "price": 13000
  },
  {
    "id": "2026-09-06-2",
    "date": "2026-09-06",
    "course": "深夜便",
    "time": "22:00",
    "target": "マイカ＆ムギイカ",
    "ship": "豊漁丸",
    "captain": "山田船長",
    "capacity": 12,
    "reserved": 8,
    "remaining": 4,
    "status": "ok",
    "price": 13000
  }
];

  // 実際の船名・通常定員・常連向け電話受付専用枠に統一する。
  const shipSettings = {
    'カムトゥドリーム': { capacity: 12, specialCapacity: 0 },
    'ドリーム': { capacity: 30, specialCapacity: 3 },
    'スーパードリーム': { capacity: 32, specialCapacity: 6 }
  };

  // ユーザー画面の出船予定を共通データ化し、管理3画面も同じ一覧を参照する。
  const existingSeptemberTrips = new Map(
    trips.filter((trip) => trip.date.startsWith('2026-09'))
      .map((trip) => [`${trip.date}|${trip.course}`, trip])
  );
  const septemberSpecialTrips = [
    ['2026-09-05', 'アオリ便', '15:30', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-06', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-12', '半夜便', '16:00', 'アオリ +マイカ', 'ok'],
    ['2026-09-12', '深夜便', '23:30', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-13', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-13', 'アオリ便', '05:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-18', '深夜便', '23:50', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ...[19, 20, 21, 22, 23].flatMap((day) => {
      const date = `2026-09-${String(day).padStart(2, '0')}`;
      const rows = [
        [date, '早朝便', '05:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
        [date, '半夜便', '16:00', 'アオリ +マイカ', 'ok']
      ];
      if (day !== 23) rows.push([date, '深夜便', '23:30', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok']);
      return rows;
    }),
    ['2026-09-26', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-27', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok']
  ];
  const septemberSchedule = [];
  for (let day = 1; day <= 30; day += 1) {
    const date = `2026-09-${String(day).padStart(2, '0')}`;
    septemberSchedule.push([date, '半夜便', '17:00', day === 5 ? 'スーパーロング便' : 'マイカ', day === 5 ? 'few' : 'ok']);
    if (day !== 3) {
      septemberSchedule.push([date, '深夜便', '22:00', day >= 8 && day <= 12 ? 'マイカ＆ムギイカ' : 'マイカ', 'ok']);
    }
  }
  septemberSchedule.push(...septemberSpecialTrips);
  const septemberTrips = septemberSchedule
    .sort((a, b) => `${a[0]} ${a[2]}`.localeCompare(`${b[0]} ${b[2]}`))
    .map(([date, course, time, target, sourceStatus], index) => {
      const isSmallBoat = course === 'アオリ便' || course === '早朝便' || time === '16:00' || time > '23:00';
      const ship = isSmallBoat ? 'カムトゥドリーム' : (course === '半夜便' ? 'スーパードリーム' : 'ドリーム');
      const setting = shipSettings[ship];
      const existing = existingSeptemberTrips.get(`${date}|${course}`);
      // デモ上の全便が閑散表示にならないよう、通常枠は定員の約8割で統一する。
      // 特別枠は通常枠の人数・ユーザー向け状態判定には含めない。
      const occupancyRatio = [0.78, 0.80, 0.82][index % 3];
      const reserved = Math.max(1, Math.min(setting.capacity - 1, Math.round(setting.capacity * occupancyRatio)));
      return {
        id: `user-schedule-${date}-${index + 1}`,
        date, course, time, target, ship,
        captain: index % 2 === 0 ? '佐藤船長' : '山田船長',
        capacity: setting.capacity,
        specialCapacity: setting.specialCapacity,
        specialReserved: 0,
        reserved,
        remaining: setting.capacity - reserved,
        status: sourceStatus,
        price: Number(existing?.price || 13000)
      };
    });
  trips.splice(0, trips.length, ...trips.filter((trip) => !trip.date.startsWith('2026-09')), ...septemberTrips);

  trips.forEach((trip) => {
    const ship = shipSettings[trip.ship] ? trip.ship : (trip.course.includes('中型船')
      ? 'カムトゥドリーム'
      : (trip.course === '半夜便' ? 'スーパードリーム' : 'ドリーム'));
    const setting = shipSettings[ship];
    trip.ship = ship;
    trip.capacity = setting.capacity;
    trip.specialCapacity = setting.specialCapacity;
    trip.specialReserved = 0;
    trip.remaining = Math.max(0, trip.capacity - Number(trip.reserved || 0));
  });

  const OVERRIDE_KEY = 'horyomaruTripReservationDelta';
  const readOverrides = () => {
    try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}') || {}; } catch { return {}; }
  };
  const TRIP_EDIT_KEY = 'horyomaruAdminTripEdits';
  const readTripEdits = () => {
    try { return JSON.parse(localStorage.getItem(TRIP_EDIT_KEY) || '{}') || {}; } catch { return {}; }
  };
  const statusFromSeats = (trip) => {
    const contentReady = !['', '－', '-', '未定', '内容未定'].includes(String(trip.time || '').trim())
      && !['', '－', '-', '未定', '内容未定'].includes(String(trip.target || '').trim());
    if (!contentReady) return 'unknown';
    const remaining = Math.max(0, Number(trip.capacity || 0) - Number(trip.reserved || 0));
    if (remaining === 0) return 'full';
    if (remaining <= 3) return 'few';
    return 'ok';
  };

  const enrich = (trip) => {
    const copy = { ...trip };
    const saved = readTripEdits()[copy.id];
    if (saved && typeof saved === 'object') {
      copy.reserved = Math.max(0, Number(saved.reserved ?? copy.reserved) || 0);
      copy.capacity = Math.max(1, Number(saved.capacity ?? copy.capacity) || 1);
      copy.specialReserved = Math.max(0, Number(saved.specialReserved ?? copy.specialReserved) || 0);
      copy.specialCapacity = Math.max(0, Number(saved.specialCapacity ?? copy.specialCapacity) || 0);
      copy.operationStatus = ['中止', '運航中止'].includes(String(saved.status || '').trim()) ? '運航中止' : '運航可能';
    } else {
      copy.operationStatus = ['中止', '運航中止'].includes(String(copy.status || '').trim()) ? '運航中止' : '運航可能';
    }
    const overrides = readOverrides();
    copy.reserved = Math.min(Number(copy.capacity || 0), Number(copy.reserved || 0) + Number(overrides[copy.id] || 0));
    copy.remaining = Math.max(0, Number(copy.capacity || 0) - Number(copy.reserved || 0));
    copy.status = copy.operationStatus === '運航中止' ? 'stop' : statusFromSeats(copy);
    return copy;
  };

  const getTrips = () => trips.map(enrich);
  const getTrip = (date, course, time = '') => getTrips().find((trip) =>
    trip.date === date && trip.course === course && (!time || trip.time === time)
  ) || null;

  // 管理画面用の予約明細を、各便の予約人数と合計が一致するように生成する。
  const customerNames = [
    ['田中 太郎','たなか たろう'],['佐藤 花子','さとう はなこ'],['鈴木 一郎','すずき いちろう'],
    ['高橋 美咲','たかはし みさき'],['伊藤 健','いとう けん'],['山本 彩','やまもと あや'],
    ['中村 翔','なかむら しょう'],['小林 葵','こばやし あおい'],['加藤 蓮','かとう れん'],
    ['吉田 凛','よしだ りん'],['山田 大輔','やまだ だいすけ'],['佐々木 結衣','ささき ゆい'],
    ['山口 拓海','やまぐち たくみ'],['松本 奈々','まつもと なな'],['井上 直樹','いのうえ なおき'],
    ['木村 さくら','きむら さくら'],['林 悠斗','はやし ゆうと'],['清水 真由','しみず まゆ'],
    ['斎藤 陽介','さいとう ようすけ'],['森 愛','もり あい'],['池田 和也','いけだ かずや'],
    ['橋本 美穂','はしもと みほ'],['阿部 遼','あべ りょう'],['石川 千尋','いしかわ ちひろ'],
    ['前田 翼','まえだ つばさ'],['藤田 七海','ふじた ななみ'],['岡田 浩二','おかだ こうじ'],
    ['後藤 麻衣','ごとう まい'],['長谷川 亮','はせがわ りょう'],['村上 由佳','むらかみ ゆか']
  ];
  const customerProfiles = customerNames.map(([name, nameKana], index) => ({
    id: String(2001 + index),
    name,
    nameKana,
    phone: `090-${String(3100 + index).padStart(4, '0')}-${String(5200 + (index * 37)).padStart(4, '0')}`,
    email: `customer${String(index + 1).padStart(2, '0')}@example.com`
  }));
  const reservations = [];
  const mockTodayKey = new Date(Date.now() + (9 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  trips.forEach((trip, tripIndex) => {
    let rest = Number(trip.reserved || 0);
    let bookingIndex = 0;
    while (rest > 0) {
      const participants = Math.min(rest, 1 + ((tripIndex + bookingIndex) % 4));
      const customer = customerProfiles[(tripIndex * 3 + bookingIndex) % customerProfiles.length];
      const serial = String(1000 + tripIndex * 10 + bookingIndex);
      const departureAt = new Date(`${trip.date}T${trip.time || '00:00'}:00+09:00`).getTime();
      const reservedAt = new Date(departureAt - ((3 + ((tripIndex + bookingIndex) % 8)) * 24 * 60 * 60 * 1000)).toISOString();
      reservations.push({
        id: `R-${serial}`, tripId: trip.id, date: trip.date.replaceAll('-', '/'), dateKey: trip.date,
        reservedAt,
        course: trip.course, customerId: customer.id, name: customer.name, nameKana: customer.nameKana, participants,
        rentalRod: (tripIndex + bookingIndex) % 3 === 0 ? 1 : 0,
        phone: customer.phone,
        email: customer.email,
        status: trip.date < mockTodayKey ? '乗船済み' : '予約中'
      });
      rest -= participants;
      bookingIndex += 1;
    }
  });

  const addReservationDelta = (tripId, participants) => {
    const overrides = readOverrides();
    overrides[tripId] = Number(overrides[tripId] || 0) + Number(participants || 0);
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
  };
  const addAdminNotification = (message, detail = '', type = 'reservation') => {
    const key = 'horyomaruAdminNotifications';
    let notifications = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(parsed)) notifications = parsed;
    } catch { notifications = []; }
    notifications.unshift({
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      message: String(message || 'お知らせがあります。'),
      detail: String(detail || ''),
      type,
      read: false
    });
    localStorage.setItem(key, JSON.stringify(notifications));
  };
  window.HoryomaruAppData = {
    getTrips,
    getTrip,
    addReservationDelta,
    addAdminNotification,
    customerProfiles: customerProfiles.map((item) => ({ ...item })),
    reservations: reservations.map((item) => ({ ...item }))
  };
})();
